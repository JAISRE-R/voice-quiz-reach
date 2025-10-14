import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const quizSubmissionSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID format'),
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID format'),
    selectedAnswer: z.number().int().min(0).max(3, 'Answer must be between 0-3'),
  })).min(1, 'At least one answer required'),
  timeTaken: z.number().int().min(0).optional(),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    let userId = null;
    if (token) {
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    const body = await req.json();
    
    // Validate input using Zod schema
    const validation = quizSubmissionSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: validation.error.errors.map(e => e.message).join(', ')
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { quizId, answers, timeTaken } = validation.data;

    console.log(`Processing quiz submission: quizId=${quizId}, userId=${userId}, answerCount=${answers.length}`);

    // Verify quiz exists and is active
    const { data: quiz, error: quizError } = await supabaseClient
      .from('quizzes')
      .select('id, is_active')
      .eq('id', quizId)
      .eq('is_active', true)
      .single();

    if (quizError || !quiz) {
      console.error('Quiz not found or inactive:', quizError);
      return new Response(JSON.stringify({ error: 'Quiz not found or inactive' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all questions for this quiz with correct answers
    const questionIds = answers.map(a => a.questionId);
    const { data: questions, error: questionsError } = await supabaseClient
      .from('questions')
      .select('id, correct_answer, points, explanation')
      .eq('quiz_id', quizId)
      .in('id', questionIds);

    if (questionsError || !questions || questions.length === 0) {
      console.error('Questions not found:', questionsError);
      return new Response(JSON.stringify({ error: 'Questions not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate all answers and calculate score server-side
    let totalScore = 0;
    const results = answers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      
      if (!question) {
        return {
          questionId: answer.questionId,
          isCorrect: false,
          points: 0,
          explanation: null,
        };
      }

      const isCorrect = question.correct_answer === answer.selectedAnswer;
      const points = isCorrect ? (question.points || 1) : 0;
      totalScore += points;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        points,
        explanation: question.explanation || null,
      };
    });

    console.log(`Score calculated: ${totalScore} points from ${results.length} questions`);

    // Save score to database if user is authenticated
    let scoreId = null;
    if (userId) {
      const { data: scoreData, error: scoreError } = await supabaseClient
        .from('user_scores')
        .insert({
          user_id: userId,
          quiz_id: quizId,
          score: totalScore,
          total_questions: answers.length,
          time_taken: timeTaken || null,
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedAnswer: a.selectedAnswer,
          })),
        })
        .select('id')
        .single();

      if (scoreError) {
        console.error('Failed to save score:', scoreError);
      } else {
        scoreId = scoreData?.id;
        console.log(`Score saved with id: ${scoreId}`);
      }
    }

    // Return validation results
    return new Response(JSON.stringify({
      score: totalScore,
      totalQuestions: answers.length,
      results,
      scoreId,
      saved: !!scoreId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
