import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Trophy, Users } from 'lucide-react';
import { useAccessibility } from './AccessibilityControls';
import { toast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit: number;
  question_count?: number;
}

interface QuizSelectionProps {
  onQuizSelect: (quizId: string, quiz: Quiz) => void;
}

export const QuizSelection: React.FC<QuizSelectionProps> = ({ onQuizSelect }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { speakText } = useAccessibility();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
      // Fetch quizzes with question counts
      const { data: quizzesData, error: quizzesError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          difficulty,
          time_limit,
          questions:questions(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (quizzesError) {
        throw quizzesError;
      }

      // Transform the data to include question counts
      const quizzesWithCounts: Quiz[] = quizzesData?.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        time_limit: quiz.time_limit,
        question_count: quiz.questions?.[0]?.count || 0
      })) || [];

      setQuizzes(quizzesWithCounts);
      speakText(`${quizzesWithCounts.length} quizzes available to take`);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error loading quizzes",
        description: "Failed to load available quizzes. Please try again.",
        variant: "destructive"
      });
      speakText("Error loading quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'hard':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleQuizSelect = (quiz: Quiz) => {
    speakText(`Starting ${quiz.title} quiz. This is a ${quiz.difficulty} difficulty quiz with ${quiz.question_count} questions.`);
    onQuizSelect(quiz.id, quiz);
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Quizzes Available</h2>
        <p className="text-muted-foreground">
          No quizzes are currently available. Please check back later.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose Your Quiz</h1>
        <p className="text-muted-foreground">
          Select from our collection of accessible quizzes designed for all learners
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex-1 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold leading-tight">
                    {quiz.title}
                  </h3>
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {quiz.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(quiz.time_limit)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{quiz.question_count} questions</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>Track your progress</span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => handleQuizSelect(quiz)}
                className="w-full"
                size="lg"
                aria-label={`Start ${quiz.title} quiz - ${quiz.difficulty} difficulty, ${quiz.question_count} questions, ${formatTime(quiz.time_limit)}`}
              >
                Start Quiz
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-muted">
        <div className="text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Accessibility Features</h3>
          <p className="text-sm text-muted-foreground mb-4">
            All quizzes include voice control, screen reader support, keyboard navigation, 
            and customizable display options for the best learning experience.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-card rounded">Voice Commands</div>
            <div className="p-2 bg-card rounded">Screen Reader</div>
            <div className="p-2 bg-card rounded">Keyboard Nav</div>
            <div className="p-2 bg-card rounded">High Contrast</div>
          </div>
        </div>
      </Card>
    </div>
  );
};