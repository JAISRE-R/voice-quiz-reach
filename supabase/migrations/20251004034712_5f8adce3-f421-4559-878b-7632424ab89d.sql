-- Drop the vulnerable policy that exposes answers
DROP POLICY IF EXISTS "Users can view question content for active quizzes" ON questions;

-- Create a security definer function to get questions without answers for regular users
CREATE OR REPLACE FUNCTION public.get_quiz_questions_safe(p_quiz_id uuid)
RETURNS TABLE (
  id uuid,
  quiz_id uuid,
  question_text text,
  options jsonb,
  points integer,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return questions for active quizzes, without correct_answer and explanation
  SELECT 
    q.id,
    q.quiz_id,
    q.question_text,
    q.options,
    q.points,
    q.created_at
  FROM questions q
  INNER JOIN quizzes qz ON qz.id = q.quiz_id
  WHERE q.quiz_id = p_quiz_id 
    AND qz.is_active = true
  ORDER BY q.created_at;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_safe(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions_safe(uuid) TO anon;

-- Add comment explaining the security measure
COMMENT ON FUNCTION public.get_quiz_questions_safe(uuid) IS 
'Securely returns quiz questions without correct_answer and explanation fields to prevent cheating. Quiz creators can still access full data through their existing policies.';