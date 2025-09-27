-- Create profiles table for user information and accessibility preferences
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  accessibility_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  time_limit INTEGER DEFAULT 300, -- in seconds
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of answer options
  correct_answer INTEGER NOT NULL, -- Index of correct answer
  explanation TEXT,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_scores table
CREATE TABLE public.user_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  answers JSONB, -- Store user's answers
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quizzes (public read, admin write)
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Quiz creators can update their quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for questions (public read for active quizzes)
CREATE POLICY "Anyone can view questions from active quizzes" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.is_active = true
    )
  );

CREATE POLICY "Quiz creators can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      WHERE quizzes.id = questions.quiz_id 
      AND quizzes.created_by = auth.uid()
    )
  );

-- RLS Policies for user_scores
CREATE POLICY "Users can view their own scores" ON public.user_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores" ON public.user_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, accessibility_preferences)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    '{}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample quizzes and questions
INSERT INTO public.quizzes (title, description, difficulty, time_limit, is_active) VALUES
('Web Accessibility Basics', 'Test your knowledge of web accessibility fundamentals', 'easy', 600, true),
('Advanced JavaScript Quiz', 'Challenge yourself with advanced JavaScript concepts', 'hard', 900, true),
('General Knowledge Quiz', 'A fun mix of general knowledge questions', 'medium', 450, true);

-- Insert sample questions for Web Accessibility Basics quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points) 
SELECT 
  q.id,
  'What does ARIA stand for in web accessibility?',
  '["Accessible Rich Internet Applications", "Advanced Rich Internet Applications", "Automated Rich Internet Applications", "Accessible Responsive Internet Applications"]'::jsonb,
  0,
  'ARIA stands for Accessible Rich Internet Applications, which provides semantic information for assistive technologies.',
  1
FROM public.quizzes q WHERE q.title = 'Web Accessibility Basics';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'Which HTML element is best for main navigation?',
  '["<div>", "<nav>", "<section>", "<header>"]'::jsonb,
  1,
  'The <nav> element is specifically designed for navigation links and helps screen readers identify navigation areas.',
  1
FROM public.quizzes q WHERE q.title = 'Web Accessibility Basics';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'What is the minimum color contrast ratio for normal text?',
  '["3:1", "4.5:1", "7:1", "2.5:1"]'::jsonb,
  1,
  'WCAG AA guidelines require a minimum contrast ratio of 4.5:1 for normal text to ensure readability.',
  1
FROM public.quizzes q WHERE q.title = 'Web Accessibility Basics';

-- Insert sample questions for JavaScript quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'What is the output of: console.log(typeof null)?',
  '["null", "undefined", "object", "boolean"]'::jsonb,
  2,
  'This is a well-known JavaScript quirk. typeof null returns "object" due to a bug in the original JavaScript implementation.',
  2
FROM public.quizzes q WHERE q.title = 'Advanced JavaScript Quiz';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'Which method creates a new array with all elements that pass a test?',
  '["map()", "filter()", "reduce()", "forEach()"]'::jsonb,
  1,
  'The filter() method creates a new array with all elements that pass the test implemented by the provided function.',
  2
FROM public.quizzes q WHERE q.title = 'Advanced JavaScript Quiz';

-- Insert sample questions for General Knowledge quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'What is the capital of Australia?',
  '["Sydney", "Melbourne", "Canberra", "Perth"]'::jsonb,
  2,
  'Canberra is the capital city of Australia, though Sydney and Melbourne are larger cities.',
  1
FROM public.quizzes q WHERE q.title = 'General Knowledge Quiz';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  q.id,
  'Which planet is known as the Red Planet?',
  '["Venus", "Mars", "Jupiter", "Saturn"]'::jsonb,
  1,
  'Mars is called the Red Planet due to iron oxide (rust) on its surface giving it a reddish appearance.',
  1
FROM public.quizzes q WHERE q.title = 'General Knowledge Quiz';