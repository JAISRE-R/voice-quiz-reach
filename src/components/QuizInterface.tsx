import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mic, MicOff, Volume2 } from 'lucide-react';
import { useAccessibility } from './AccessibilityControls';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital and largest city of France."
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is known as the Red Planet due to its reddish appearance from iron oxide on its surface."
  },
  {
    id: 3,
    question: "What is 15 + 7?",
    options: ["20", "21", "22", "23"],
    correctAnswer: 2,
    explanation: "15 + 7 equals 22."
  }
];

export const QuizInterface: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);

  const { speakText, startListening, stopListening, isListening } = useAccessibility();

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sampleQuestions.length) * 100;

  // Timer logic
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0) return;

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
  }, [quizStarted, timeRemaining]);

  // Voice input handler
  useEffect(() => {
    const handleVoiceInput = (event: CustomEvent) => {
      const transcript = event.detail.toLowerCase();
      
      // Parse voice commands
      if (transcript.includes('option a') || transcript.includes('first option')) {
        handleAnswerSelect(0);
      } else if (transcript.includes('option b') || transcript.includes('second option')) {
        handleAnswerSelect(1);
      } else if (transcript.includes('option c') || transcript.includes('third option')) {
        handleAnswerSelect(2);
      } else if (transcript.includes('option d') || transcript.includes('fourth option')) {
        handleAnswerSelect(3);
      } else if (transcript.includes('next question') || transcript.includes('continue')) {
        handleNextQuestion();
      } else if (transcript.includes('repeat question') || transcript.includes('read again')) {
        speakCurrentQuestion();
      } else {
        // Try to match the transcript with option text
        const matchedOptionIndex = currentQuestion.options.findIndex(option =>
          option.toLowerCase().includes(transcript) || transcript.includes(option.toLowerCase())
        );
        if (matchedOptionIndex !== -1) {
          handleAnswerSelect(matchedOptionIndex);
        } else {
          speakText("I didn't understand. Please say 'option A', 'option B', 'option C', or 'option D', or repeat the answer text.");
        }
      }
    };

    document.addEventListener('voiceInput', handleVoiceInput as EventListener);
    return () => document.removeEventListener('voiceInput', handleVoiceInput as EventListener);
  }, [currentQuestion, selectedAnswer]);

  const speakCurrentQuestion = useCallback(() => {
    if (!currentQuestion) return;
    
    const questionText = `Question ${currentQuestionIndex + 1} of ${sampleQuestions.length}: ${currentQuestion.question}`;
    const optionsText = currentQuestion.options
      .map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${option}`)
      .join('. ');
    
    speakText(`${questionText}. ${optionsText}`);
  }, [currentQuestion, currentQuestionIndex, speakText]);

  const handleQuizStart = () => {
    setQuizStarted(true);
    speakText("Quiz started. You have 5 minutes to complete all questions. Use voice commands or keyboard to navigate.");
    setTimeout(() => speakCurrentQuestion(), 1000);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const optionLetter = String.fromCharCode(65 + answerIndex);
    speakText(`Selected option ${optionLetter}: ${currentQuestion.options[answerIndex]}`);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      speakText("Please select an answer before continuing.");
      toast({
        title: "Answer Required",
        description: "Please select an answer before continuing.",
        variant: "destructive"
      });
      return;
    }

    // Check if answer is correct
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      speakText("Correct! " + (currentQuestion.explanation || ""));
    } else {
      const correctOption = String.fromCharCode(65 + currentQuestion.correctAnswer);
      speakText(`Incorrect. The correct answer is option ${correctOption}: ${currentQuestion.options[currentQuestion.correctAnswer]}. ${currentQuestion.explanation || ""}`);
    }

    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);

    // Move to next question or end quiz
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeout(() => speakCurrentQuestion(), 500);
      }, 3000);
      setShowResult(true);
    } else {
      handleQuizEnd();
    }
  };

  const handleQuizEnd = () => {
    const finalScore = score + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0);
    const percentage = Math.round((finalScore / sampleQuestions.length) * 100);
    
    speakText(`Quiz completed! Your final score is ${finalScore} out of ${sampleQuestions.length}, which is ${percentage} percent.`);
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${finalScore}/${sampleQuestions.length} (${percentage}%)`,
    });
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
          if (selectedAnswer !== null) {
            handleNextQuestion();
          }
          break;
        case 'r':
        case 'R':
          speakCurrentQuestion();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [quizStarted, selectedAnswer, handleNextQuestion, speakCurrentQuestion]);

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Accessible Quiz Platform</h1>
        <p className="text-lg mb-6">
          Welcome to our inclusive quiz experience. This quiz supports voice commands, 
          keyboard navigation, and screen readers.
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-6 text-left">
          <h3 className="font-semibold mb-2">How to navigate:</h3>
          <ul className="space-y-1 text-sm">
            <li>• Use voice: Say "Option A", "Option B", etc.</li>
            <li>• Use keyboard: Press 1, 2, 3, 4 or A, B, C, D</li>
            <li>• Press Enter or Space to continue</li>
            <li>• Press R to repeat the question</li>
            <li>• Use the microphone button for voice input</li>
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
            onClick={() => speakText("Ready to start the quiz? Click the start button or press enter when focused on it.")}
            className="text-lg px-8 py-6"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Read Instructions
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
          <div>
            <h1 className="text-2xl font-bold">Quiz in Progress</h1>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </p>
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
            {currentQuestion.question}
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
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;
            
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
              {currentQuestionIndex < sampleQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => speakText(`You selected option ${String.fromCharCode(65 + selectedAnswer)}: ${currentQuestion.options[selectedAnswer]}`)}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Confirm Selection
            </Button>
          </div>
        )}

        {showResult && currentQuestion.explanation && (
          <Card className="mt-6 p-4 bg-muted">
            <p className="font-medium mb-2">Explanation:</p>
            <p>{currentQuestion.explanation}</p>
          </Card>
        )}
      </Card>
    </div>
  );
};