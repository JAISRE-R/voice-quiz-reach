import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VoiceNavigationHelper } from '@/components/VoiceNavigationHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, PlayCircle, Sparkles } from 'lucide-react';
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
      <VoiceNavigationHelper />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Interactive Learning</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Available Quizzes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {quizzes.map((quiz, index) => (
                <Card 
                  key={quiz.id} 
                  className="group hover:shadow-primary transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-card to-primary/5"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${getDifficultyColor(quiz.difficulty)} px-3 py-1 text-sm font-semibold`}>
                        {quiz.difficulty || 'Medium'}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatTimeLimit(quiz.time_limit)}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold group-hover:bg-gradient-primary group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {quiz.title}
                    </CardTitle>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2 text-base">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
                      <div className="flex items-center text-sm font-medium text-foreground">
                        <div className="bg-primary/10 p-1.5 rounded-lg mr-2">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        {quiz.questions?.[0]?.count || 0} questions
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => startQuiz(quiz.id)}
                      className="w-full bg-gradient-primary shadow-primary hover:shadow-glow transition-all duration-300 group-hover:scale-105 text-base py-6"
                      aria-label={`Start ${quiz.title} quiz`}
                    >
                      <PlayCircle className="h-5 w-5 mr-2" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-16 text-center flex gap-4 justify-center animate-fade-in">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="px-8 py-6 text-base border-2 hover:scale-105 transition-all duration-300"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => navigate('/profile')}
              className="px-8 py-6 text-base bg-gradient-primary shadow-primary hover:shadow-glow hover:scale-105 transition-all duration-300"
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