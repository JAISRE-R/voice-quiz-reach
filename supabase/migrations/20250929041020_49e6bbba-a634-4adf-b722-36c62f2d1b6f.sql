-- Fix critical security issue: Remove access to correct answers and explanations
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Anyone can view questions from active quizzes" ON public.questions;

-- Create secure policies that hide answers during quiz taking
CREATE POLICY "Users can view question content for active quizzes" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND quizzes.is_active = true
  )
);

-- Create a function to check if user has completed a quiz
CREATE OR REPLACE FUNCTION public.user_has_completed_quiz(quiz_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_scores 
    WHERE user_scores.quiz_id = $1 
    AND user_scores.user_id = $2
  );
$$;

-- Policy for quiz creators to see all question data
CREATE POLICY "Quiz creators can view all question data" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM quizzes 
    WHERE quizzes.id = questions.quiz_id 
    AND quizzes.created_by = auth.uid()
  )
);