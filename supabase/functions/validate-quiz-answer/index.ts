import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Input validation schema
const quizAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID format'),
  selectedAnswer: z.number().int().min(0).max(3, 'Answer must be between 0-3'),
  quizId: z.string().uuid('Invalid quiz ID format'),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: Get client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const now = Date.now();
    const rateLimitKey = `validate-${clientIp}`;
    const rateLimitData = rateLimitStore.get(rateLimitKey);

    if (rateLimitData) {
      if (rateLimitData.resetAt > now) {
        // Within window
        if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
          console.warn(`Rate limit exceeded for IP: ${clientIp}`);
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimitData.resetAt - now) / 1000)
          }), {
            status: 429,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((rateLimitData.resetAt - now) / 1000).toString()
            },
          });
        }
        rateLimitData.count++;
      } else {
        // Window expired, reset
        rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      }
    } else {
      // First request from this IP
      rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

    console.log(`Request from ${clientIp}: ${rateLimitStore.get(rateLimitKey)?.count}/${MAX_REQUESTS_PER_WINDOW}`);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    
    // Validate input using Zod schema
    const validation = quizAnswerSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: validation.error.errors.map(e => e.message).join(', ')
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { questionId, selectedAnswer, quizId } = validation.data;

    // Get the correct answer using service role (bypasses RLS)
    const { data: question, error: questionError } = await supabaseClient
      .from('questions')
      .select('correct_answer, explanation, points')
      .eq('id', questionId)
      .eq('quiz_id', quizId)
      .single();

    if (questionError || !question) {
      return new Response(JSON.stringify({ error: 'Question not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isCorrect = question.correct_answer === selectedAnswer;
    const points = isCorrect ? (question.points || 1) : 0;

    // Return validation result
    return new Response(JSON.stringify({
      isCorrect,
      points,
      explanation: question.explanation || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});