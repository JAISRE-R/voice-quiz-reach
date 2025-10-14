import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mic, MicOff, Volume2, ArrowLeft } from 'lucide-react';
import { useAccessibility } from './AccessibilityControls';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  quiz_id?: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit: number;
}

interface DatabaseQuizInterfaceProps {
  quizId: string;
  quiz: Quiz;
  onBack: () => void;
}

export const DatabaseQuizInterface: React.FC<DatabaseQuizInterfaceProps> = ({ 
  quizId, 
  quiz, 
  onBack 
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(quiz.time_limit);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState<{ isCorrect: boolean; explanation: string | null } | null>(null);

  const { speakText, startListening, stopListening, isListening } = useAccessibility();
  const { user } = useAuth();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Fetch questions for the quiz
  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // Use secure RPC function that prevents answer exposure
      const { data, error } = await supabase
        .rpc('get_quiz_questions_safe', { p_quiz_id: quizId });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "No Questions Found",
          description: "This quiz doesn't have any questions yet.",
          variant: "destructive"
        });
        speakText("This quiz doesn't have any questions yet.");
        onBack();
        return;
      }

      // Transform the data to match our Question interface (without answers)
      const transformedQuestions: Question[] = data.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: Array.isArray(q.options) ? q.options as string[] : [],
        correct_answer: -1, // Will be validated server-side
        explanation: undefined, // Will be provided after validation
        points: q.points
      }));

      setQuestions(transformedQuestions);
      setUserAnswers(new Array(data.length).fill(null));
      speakText(`Quiz loaded with ${data.length} questions`);
    } catch (error) {
      toast({
        title: "Error Loading Quiz",
        description: "Failed to load quiz questions. Please try again.",
        variant: "destructive"
      });
      speakText("Error loading quiz questions. Please try again.");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  // Timer logic
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0 || quizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleQuizEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, quizCompleted]);

  // Voice input handler
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const transcript = event.detail.toLowerCase().trim();
      // Voice command processing (removed console logging for security)
      
      if (!quizStarted) {
        if (transcript.includes('start quiz') || transcript.includes('begin quiz')) {
          handleQuizStart();
        }
        return;
      }
      
      // Enhanced voice command parsing
      if (transcript.includes('option a') || transcript.includes('first option') || transcript.includes('choice a')) {
        handleAnswerSelect(0);
      } else if (transcript.includes('option b') || transcript.includes('second option') || transcript.includes('choice b')) {
        handleAnswerSelect(1);
      } else if (transcript.includes('option c') || transcript.includes('third option') || transcript.includes('choice c')) {
        handleAnswerSelect(2);
      } else if (transcript.includes('option d') || transcript.includes('fourth option') || transcript.includes('choice d')) {
        handleAnswerSelect(3);
      } else if (transcript.includes('next') || transcript.includes('continue') || transcript.includes('submit')) {
        handleNextQuestion();
      } else if (transcript.includes('repeat') || transcript.includes('read') || transcript.includes('again')) {
        speakCurrentQuestion();
      } else if (transcript.includes('back') || transcript.includes('return')) {
        onBack();
      } else {
        // Enhanced answer matching
        let matchedOptionIndex = -1;
        
        // Direct text matching
        if (currentQuestion) {
          matchedOptionIndex = currentQuestion.options.findIndex(option =>
            option.toLowerCase().includes(transcript) || transcript.includes(option.toLowerCase())
          );
        }
        
        // Number matching (1, 2, 3, 4)
        if (matchedOptionIndex === -1) {
          const numberMatch = transcript.match(/\b([1-4])\b/);
          if (numberMatch) {
            matchedOptionIndex = parseInt(numberMatch[1]) - 1;
          }
        }
        
        // Letter matching (a, b, c, d)
        if (matchedOptionIndex === -1) {
          const letterMatch = transcript.match(/\b([abcd])\b/);
          if (letterMatch) {
            matchedOptionIndex = letterMatch[1].charCodeAt(0) - 'a'.charCodeAt(0);
          }
        }
        
        if (matchedOptionIndex !== -1 && currentQuestion && matchedOptionIndex < currentQuestion.options.length) {
          handleAnswerSelect(matchedOptionIndex);
        } else {
          speakText("I didn't understand. Please say 'option A', 'option B', 'option C', or 'option D', or say the answer directly. You can also say 'repeat question' to hear it again.");
        }
      }
    };

    document.addEventListener('voiceInput', handleVoiceInput as EventListener);
    return () => document.removeEventListener('voiceInput', handleVoiceInput as EventListener);
  }, [currentQuestion, selectedAnswer, quizStarted]);

  const speakCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    
    const questionText = `Question ${currentQuestionIndex + 1} of ${questions.length}: ${currentQuestion.question_text}`;
    const optionsText = currentQuestion.options
      .map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${option}`)
      .join('. ');
    
    speakText(`${questionText}. ${optionsText}`);
  }, [currentQuestion, currentQuestionIndex, questions.length, speakText]);

  const handleQuizStart = () => {
    setQuizStarted(true);
    const minutes = Math.floor(quiz.time_limit / 60);
    speakText(`Starting ${quiz.title}. You have ${minutes} minutes to complete ${questions.length} questions. Use voice commands or keyboard to navigate.`);
    setTimeout(() => speakCurrentQuestion(), 1000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const optionLetter = String.fromCharCode(65 + answerIndex);
    speakText(`Selected option ${optionLetter}: ${currentQuestion.options[answerIndex]}`);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) {
      speakText("Please select an answer before continuing.");
      toast({
        title: "Answer Required",
        description: "Please select an answer before continuing.",
        variant: "destructive"
      });
      return;
    }

    if (!currentQuestion) return;

    // Update user answers array
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(newUserAnswers);

    try {
      // Validate answer securely via edge function
      const { data: result, error } = await supabase.functions.invoke('validate-quiz-answer', {
        body: {
          questionId: currentQuestion.id,
          selectedAnswer,
          quizId: quizId
        }
      });

      if (error) throw error;

      const { isCorrect, points, explanation } = result;
      
      // Store the result for UI display
      setCurrentAnswerResult({ isCorrect, explanation: explanation || null });
      
      // Update score
      if (isCorrect) {
        setScore(prev => prev + points);
        speakText("Correct! " + (explanation || ""));
      } else {
        speakText(`Incorrect. ${explanation || ""}`);
      }

      setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);

      // Move to next question or end quiz
      if (currentQuestionIndex < questions.length - 1) {
        setShowResult(true);
        setTimeout(() => {
          setCurrentQuestionIndex(prev => {
            const newIndex = prev + 1;
            // Speak the question after state has fully updated
            setTimeout(() => {
              const nextQuestion = questions[newIndex];
              if (nextQuestion) {
                const questionText = `Question ${newIndex + 1} of ${questions.length}: ${nextQuestion.question_text}`;
                const optionsText = nextQuestion.options
                  .map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${option}`)
                  .join('. ');
                speakText(`${questionText}. ${optionsText}`);
              }
            }, 100);
            return newIndex;
          });
          setSelectedAnswer(null);
          setShowResult(false);
          setCurrentAnswerResult(null);
        }, 3000);
      } else {
        setShowResult(true);
        setTimeout(() => handleQuizEnd(), 2000);
      }
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate answer. Please try again.",
        variant: "destructive"
      });
      // Continue to next question even on error
      setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
      
      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowResult(false);
          setTimeout(() => speakCurrentQuestion(), 500);
        }, 1000);
      } else {
        handleQuizEnd();
      }
    }
  };

  const handleQuizEnd = async () => {
    setQuizCompleted(true);
    
    try {
      // Submit all answers to server for validation and score calculation
      const answersPayload = questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: userAnswers[index] ?? 0,
      }));

      const { data, error } = await supabase.functions.invoke('submit-quiz-results', {
        body: {
          quizId,
          answers: answersPayload,
          timeTaken: quiz.time_limit - timeRemaining,
        },
      });

      if (error) throw error;

      // Use server-calculated score
      const finalScore = data.score;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;
      
      speakText(`Quiz completed! Your final score is ${finalScore} out of ${totalPoints} points, which is ${percentage} percent.`);
      
      if (data.saved) {
        speakText("Your score has been saved to your profile.");
      } else if (user) {
        speakText("There was an issue saving your score, but your results are displayed.");
      }
      
      toast({
        title: "Quiz Completed!",
        description: `You scored ${finalScore}/${totalPoints} points (${percentage}%)`,
      });
    } catch (error) {
      // Fallback to client-side calculation if server fails
      const finalScore = score;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;
      
      speakText(`Quiz completed! Your final score is ${finalScore} out of ${totalPoints} points, which is ${percentage} percent.`);
      speakText("There was an issue validating your score on the server.");
      
      toast({
        title: "Quiz Completed!",
        description: `You scored ${finalScore}/${totalPoints} points (${percentage}%)`,
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!quizStarted) return;

      switch (event.key) {
        case '1':
        case 'a':
        case 'A':
          handleAnswerSelect(0);
          break;
        case '2':
        case 'b':
        case 'B':
          handleAnswerSelect(1);
          break;
        case '3':
        case 'c':
        case 'C':
          handleAnswerSelect(2);
          break;
        case '4':
        case 'd':
        case 'D':
          handleAnswerSelect(3);
          break;
        case 'Enter':
        case ' ':
          if (selectedAnswer !== null && !showResult) {
            handleNextQuestion();
          }
          break;
        case 'r':
        case 'R':
          speakCurrentQuestion();
          break;
        case 'Escape':
          onBack();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [quizStarted, selectedAnswer, showResult, handleNextQuestion, speakCurrentQuestion]);

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            aria-label="Go back to quiz selection"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-lg mb-4">{quiz.description}</p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge>{quiz.difficulty}</Badge>
            <Badge variant="outline">{questions.length} questions</Badge>
            <Badge variant="outline">{Math.floor(quiz.time_limit / 60)} minutes</Badge>
          </div>
          
          <div className="bg-muted p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">How to navigate:</h3>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Voice commands:</strong> Say "Option A", "Option B", "Choice C", "Option D"</li>
              <li>• <strong>Direct answers:</strong> Say the answer text or numbers 1-4</li>
              <li>• <strong>Navigation:</strong> Say "next question", "repeat question", "continue"</li>
              <li>• <strong>Keyboard:</strong> Press 1, 2, 3, 4 or A, B, C, D</li>
              <li>• <strong>Continue:</strong> Press Enter or Space</li>
              <li>• <strong>Repeat:</strong> Press R to hear the question again</li>
              <li>• <strong>Exit:</strong> Press Escape or say "back" to return</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleQuizStart}
              className="text-lg px-8 py-6"
            >
              Start Quiz
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => speakText(`Ready to start ${quiz.title}? This is a ${quiz.difficulty} difficulty quiz with ${questions.length} questions. You have ${Math.floor(quiz.time_limit / 60)} minutes to complete it. Click the start button when ready.`)}
              className="text-lg px-8 py-6"
            >
              <Volume2 className="mr-2 h-5 w-5" />
              Read Instructions
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (quizCompleted) {
    const finalScore = score;
    const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((finalScore / totalPossiblePoints) * 100);
    
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-xl mb-4">
            You scored {finalScore} out of {totalPossiblePoints} points
          </p>
          <Badge className="text-lg px-4 py-2">
            {percentage}% Score
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBack} size="lg">
            Back to Quizzes
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            size="lg"
          >
            Retake Quiz
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              aria-label="Go back to quiz selection"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant={timeRemaining > 60 ? "default" : "destructive"} className="px-3 py-1">
              <Clock className="mr-1 h-4 w-4" />
              {formatTime(timeRemaining)}
            </Badge>
            
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
          </div>
        </div>
        
        <Progress value={progress} className="mt-4" aria-label={`Quiz progress: ${Math.round(progress)}% complete`} />
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 leading-relaxed">
            {currentQuestion?.question_text}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={speakCurrentQuestion}
            className="mb-4"
            aria-label="Read question aloud"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Read Question
          </Button>
        </div>

        <div className="grid gap-3">
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isAnswerCorrect = currentAnswerResult?.isCorrect && isSelected;
            const isAnswerIncorrect = currentAnswerResult && !currentAnswerResult.isCorrect && isSelected;
            const showCorrect = showResult && isAnswerCorrect;
            const showIncorrect = showResult && isAnswerIncorrect;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                size="lg"
                onClick={() => handleAnswerSelect(index)}
                className={`justify-start text-left p-4 h-auto min-h-[60px] transition-all ${
                  showCorrect ? "bg-success hover:bg-success" :
                  showIncorrect ? "bg-error hover:bg-error" : ""
                }`}
                disabled={showResult}
                aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle className="h-5 w-5 text-success-foreground" />}
                  {showIncorrect && <XCircle className="h-5 w-5 text-error-foreground" />}
                </span>
              </Button>
            );
          })}
        </div>

        {selectedAnswer !== null && !showResult && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleNextQuestion}
              size="lg"
              className="flex-1"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => speakText(`You selected option ${String.fromCharCode(65 + selectedAnswer)}: ${currentQuestion?.options[selectedAnswer]}`)}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Confirm Selection
            </Button>
          </div>
        )}

        {showResult && currentQuestion?.explanation && (
          <Card className="mt-6 p-4 bg-muted">
            <p className="font-medium mb-2">Explanation:</p>
            <p>{currentQuestion.explanation}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};