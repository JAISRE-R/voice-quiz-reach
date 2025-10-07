-- Add more questions to Web Accessibility Basics quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points) VALUES
(
  '7b143a5b-dbfc-4127-be1f-dfaad0618e9e',
  'Which ARIA attribute should be used to label an interactive element?',
  '["aria-label", "aria-title", "aria-name", "aria-text"]',
  0,
  'aria-label provides an accessible name for elements that don''t have visible text labels.',
  1
),
(
  '7b143a5b-dbfc-4127-be1f-dfaad0618e9e',
  'What is the purpose of skip links in web accessibility?',
  '["Allow users to skip repetitive navigation", "Skip loading images", "Skip JavaScript files", "Skip CSS styling"]',
  0,
  'Skip links help keyboard and screen reader users bypass repetitive content like navigation menus.',
  1
),
(
  '7b143a5b-dbfc-4127-be1f-dfaad0618e9e',
  'Which HTML5 element should be used for a group of related form elements?',
  '["<fieldset>", "<formgroup>", "<section>", "<div>"]',
  0,
  'The <fieldset> element groups related form controls with an optional <legend> for better accessibility.',
  1
);

-- Add more questions to Advanced JavaScript Quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points) VALUES
(
  'e5ed4d8f-f181-4ae3-b9de-0904f0c952bd',
  'What is the output of: console.log(typeof null)?',
  '["object", "null", "undefined", "number"]',
  0,
  'This is a known JavaScript quirk - typeof null returns "object" due to a legacy bug in the language.',
  1
),
(
  'e5ed4d8f-f181-4ae3-b9de-0904f0c952bd',
  'What does the "use strict" directive do in JavaScript?',
  '["Enables strict mode to catch common errors", "Makes code run faster", "Enables ES6 features", "Compresses the code"]',
  0,
  'Strict mode helps catch common coding mistakes and prevents certain actions, making code more secure.',
  1
),
(
  'e5ed4d8f-f181-4ae3-b9de-0904f0c952bd',
  'What is a closure in JavaScript?',
  '["A function with access to its outer scope", "A way to close browser windows", "A type of loop", "A security feature"]',
  0,
  'Closures are functions that have access to variables from their outer (enclosing) scope, even after the outer function has returned.',
  1
);

-- Add more questions to General Knowledge Quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points) VALUES
(
  'c0594b97-8d6d-457c-9893-0d2c1bc8d001',
  'What is the capital of Australia?',
  '["Canberra", "Sydney", "Melbourne", "Brisbane"]',
  0,
  'Canberra is the capital city of Australia, located in the Australian Capital Territory.',
  1
),
(
  'c0594b97-8d6d-457c-9893-0d2c1bc8d001',
  'Who painted the Mona Lisa?',
  '["Leonardo da Vinci", "Michelangelo", "Raphael", "Donatello"]',
  0,
  'Leonardo da Vinci painted the Mona Lisa in the early 16th century. It is now housed in the Louvre Museum in Paris.',
  1
),
(
  'c0594b97-8d6d-457c-9893-0d2c1bc8d001',
  'What is the largest planet in our solar system?',
  '["Jupiter", "Saturn", "Neptune", "Uranus"]',
  0,
  'Jupiter is the largest planet in our solar system, with a mass more than twice that of all other planets combined.',
  1
);

-- Create new quiz categories
INSERT INTO public.quizzes (title, description, difficulty, time_limit, is_active, created_by) VALUES
(
  'React Fundamentals',
  'Test your knowledge of React core concepts and best practices',
  'medium',
  600,
  true,
  NULL
),
(
  'CSS Flexbox & Grid',
  'Master modern CSS layout techniques',
  'easy',
  450,
  true,
  NULL
),
(
  'Database Design',
  'Challenge yourself with database normalization and SQL queries',
  'hard',
  900,
  true,
  NULL
),
(
  'Web Security Basics',
  'Learn about common web vulnerabilities and security practices',
  'medium',
  600,
  true,
  NULL
);

-- Add questions for React Fundamentals quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is the correct way to update state in React?',
  '["Use setState or useState hook", "Directly modify state variable", "Use this.state = newValue", "Use global variables"]',
  0,
  'In React, state should only be updated using setState (class components) or the useState hook setter (functional components).',
  1
FROM public.quizzes WHERE title = 'React Fundamentals';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is the purpose of useEffect hook?',
  '["Handle side effects in functional components", "Create state variables", "Style components", "Import modules"]',
  0,
  'useEffect is used for side effects like data fetching, subscriptions, or manually changing the DOM.',
  1
FROM public.quizzes WHERE title = 'React Fundamentals';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What does JSX stand for?',
  '["JavaScript XML", "JavaScript Extension", "Java Syntax Extension", "JavaScript Execute"]',
  0,
  'JSX stands for JavaScript XML and allows us to write HTML-like code in JavaScript.',
  1
FROM public.quizzes WHERE title = 'React Fundamentals';

-- Add questions for CSS Flexbox & Grid quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'Which property is used to center items in a flex container?',
  '["justify-content: center", "align-center: true", "center-items: flex", "flex-center: true"]',
  0,
  'justify-content: center centers flex items along the main axis of the flex container.',
  1
FROM public.quizzes WHERE title = 'CSS Flexbox & Grid';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is the default value of flex-direction?',
  '["row", "column", "row-reverse", "column-reverse"]',
  0,
  'The default flex-direction is row, which arranges flex items horizontally from left to right.',
  1
FROM public.quizzes WHERE title = 'CSS Flexbox & Grid';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'Which CSS Grid property defines the number of columns?',
  '["grid-template-columns", "grid-columns", "column-count", "grid-col"]',
  0,
  'grid-template-columns defines the column structure of a CSS Grid container.',
  1
FROM public.quizzes WHERE title = 'CSS Flexbox & Grid';

-- Add questions for Database Design quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is the purpose of database normalization?',
  '["Reduce data redundancy and improve integrity", "Make queries faster", "Increase storage space", "Remove all relationships"]',
  0,
  'Normalization organizes data to reduce redundancy and dependency, improving data integrity.',
  1
FROM public.quizzes WHERE title = 'Database Design';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What does ACID stand for in database transactions?',
  '["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integration, Data", "Automatic, Consistent, Independent, Distributed", "All, Create, Insert, Delete"]',
  0,
  'ACID properties ensure reliable database transactions: Atomicity, Consistency, Isolation, and Durability.',
  1
FROM public.quizzes WHERE title = 'Database Design';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is a foreign key used for?',
  '["Linking tables through relationships", "Primary identification", "Indexing data", "Encrypting data"]',
  0,
  'A foreign key creates a link between two tables by referencing the primary key of another table.',
  1
FROM public.quizzes WHERE title = 'Database Design';

-- Add questions for Web Security Basics quiz
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What does XSS stand for in web security?',
  '["Cross-Site Scripting", "External Security System", "Execute Special Scripts", "Extra Security Settings"]',
  0,
  'XSS (Cross-Site Scripting) is a security vulnerability that allows attackers to inject malicious scripts.',
  1
FROM public.quizzes WHERE title = 'Web Security Basics';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is the purpose of HTTPS?',
  '["Encrypt data between browser and server", "Make websites load faster", "Improve SEO only", "Store cookies"]',
  0,
  'HTTPS encrypts communication between the browser and server, protecting data from interception.',
  1
FROM public.quizzes WHERE title = 'Web Security Basics';

INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, explanation, points)
SELECT 
  id,
  'What is SQL injection?',
  '["Inserting malicious SQL queries through user input", "A type of database backup", "A way to optimize queries", "A database migration tool"]',
  0,
  'SQL injection is an attack where malicious SQL code is inserted through user input to manipulate databases.',
  1
FROM public.quizzes WHERE title = 'Web Security Basics';