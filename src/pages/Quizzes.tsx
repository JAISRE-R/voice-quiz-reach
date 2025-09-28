import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  time_limit: number | null;
  created_at: string;
  questions?: { count: number }[];
}

const Quizzes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchQuizzes();
  }, [user, navigate]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          difficulty,
          time_limit,
          created_at,
          questions:questions(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quizzes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimeLimit = (minutes: number | null) => {
    if (!minutes) return 'No time limit';
    return `${minutes} minutes`;
  };

  const startQuiz = (quizId: string) => {
    navigate('/', { state: { selectedQuizId: quizId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background p-4">
        <div className="container mx-auto">
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Available Quizzes
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Challenge yourself with our collection of interactive quizzes. Track your progress and improve your knowledge.
            </p>
          </header>

          {quizzes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
                <p className="text-muted-foreground">
                  There are currently no active quizzes. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty || 'Medium'}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeLimit(quiz.time_limit)}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                      {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {quiz.questions?.[0]?.count || 0} questions
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => startQuiz(quiz.id)}
                      className="w-full group-hover:bg-primary-hover transition-colors"
                      aria-label={`Start ${quiz.title} quiz`}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/profile')}
              variant="secondary"
            >
              View Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quizzes;