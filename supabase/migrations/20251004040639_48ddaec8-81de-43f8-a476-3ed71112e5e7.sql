-- Ensure RLS is enabled on questions table (idempotent)
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users who completed a quiz to view its questions (including solutions)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'questions' AND policyname = 'Users who completed quiz can view solutions'
  ) THEN
    CREATE POLICY "Users who completed quiz can view solutions"
    ON public.questions
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.user_scores us
        WHERE us.quiz_id = questions.quiz_id
          AND us.user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Optional performance index to speed up the policy check
CREATE INDEX IF NOT EXISTS idx_user_scores_quiz_user ON public.user_scores (quiz_id, user_id);
