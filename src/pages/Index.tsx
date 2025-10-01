import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { QuizSelection } from '@/components/QuizSelection';
import { DatabaseQuizInterface } from '@/components/DatabaseQuizInterface';
import { VoiceNavigationHelper } from '@/components/VoiceNavigationHelper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, Mic, LogIn, Sparkles, Volume2, Keyboard } from 'lucide-react';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'quizzes' | 'quiz'>('home');
  const [selectedQuiz, setSelectedQuiz] = useState<{id: string, quiz: any} | null>(null);
  const { user, loading } = useAuth();

  const handleQuizSelect = (quizId: string, quiz: any) => {
    setSelectedQuiz({ id: quizId, quiz });
    setCurrentView('quiz');
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setCurrentView('quizzes');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedQuiz(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-32 bg-muted rounded mx-auto mb-4"></div>
          <div className="h-4 w-24 bg-muted rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />
      <VoiceNavigationHelper />
      
      <main id="main-content" className="container mx-auto px-4 py-8">
        {currentView === 'quiz' && selectedQuiz ? (
          <DatabaseQuizInterface
            quizId={selectedQuiz.id}
            quiz={selectedQuiz.quiz}
            onBack={handleBackToQuizzes}
          />
        ) : currentView === 'quizzes' ? (
          <QuizSelection onQuizSelect={handleQuizSelect} />
        ) : (
          <>
            {/* Hero Section */}
            <section className="text-center py-16 mb-16 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Voice-Powered Learning Platform</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight bg-gradient-hero bg-clip-text text-transparent animate-fade-in-up">
                Accessible Learning
                <span className="block mt-2">For Everyone</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
                Experience our inclusive quiz platform designed for differently-abled users. 
                Voice control, screen reader support, and customizable accessibility features.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up">
                {user ? (
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentView('quizzes')}
                    className="text-lg px-10 py-7 bg-gradient-primary shadow-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    <BookOpen className="mr-2 h-6 w-6" />
                    Browse Quizzes
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={() => setCurrentView('quizzes')}
                    className="text-lg px-10 py-7 bg-gradient-primary shadow-primary hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    <BookOpen className="mr-2 h-6 w-6" />
                    Try Demo Quiz
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-10 py-7 border-2 hover:bg-accent hover:scale-105 transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>

              {!user && (
                <div className="animate-fade-in">
                  <Card className="max-w-md mx-auto p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 shadow-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <LogIn className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm text-foreground">
                        <strong className="text-primary">Sign in</strong> to save progress, track scores, and unlock features
                      </p>
                    </div>
                  </Card>
                </div>
              )}
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 text-center hover:shadow-primary transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <div className="bg-gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-primary animate-float">
                  <Mic className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Voice Control</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Navigate and answer questions using voice commands. 
                  Complete hands-free quiz experience with speech recognition.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-success transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-success/20 bg-gradient-to-br from-card to-success/5">
                <div className="bg-gradient-success w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-success animate-float" style={{ animationDelay: '0.5s' }}>
                  <Volume2 className="h-10 w-10 text-success-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Screen Reader Ready</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fully compatible with screen readers and assistive technologies. 
                  Semantic HTML and ARIA labels throughout.
                </p>
              </Card>

              <Card className="p-8 text-center hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-accent/20 bg-gradient-to-br from-card to-accent/5">
                <div className="bg-gradient-to-br from-accent-foreground to-warning w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-card animate-float" style={{ animationDelay: '1s' }}>
                  <Keyboard className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Customizable UI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Adjust font sizes, enable high contrast mode, and customize 
                  the interface to meet your specific needs.
                </p>
              </Card>
            </section>

            {/* Accessibility Features */}
            <section className="bg-gradient-to-br from-card via-primary/5 to-accent/5 rounded-3xl p-10 mb-12 shadow-card border-2 border-primary/10 animate-fade-in">
              <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Accessibility First Design
              </h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                Built from the ground up with inclusivity in mind
              </p>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl">
                      <Mic className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">Navigation Options</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Keyboard-only navigation support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Voice command recognition</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Clear focus indicators</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Skip links for screen readers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Logical tab order</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-accent/10 p-3 rounded-xl">
                      <Award className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">Visual Accessibility</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">High contrast color options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Adjustable font sizes (75% - 150%)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Color-blind friendly design</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Reduced motion options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="bg-success/20 text-success rounded-full p-1 mt-1">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-foreground">Clear visual hierarchy</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <Button 
                  size="lg"
                  onClick={() => setCurrentView('quizzes')}
                  className="bg-gradient-primary shadow-primary hover:shadow-glow transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
                >
                  Try the Accessible Quiz Experience
                </Button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
