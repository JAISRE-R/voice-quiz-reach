import React from 'react';
import { Navigation } from '@/components/Navigation';
import { QuizInterface } from '@/components/QuizInterface';
import { AccessibilityProvider } from '@/components/AccessibilityControls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Award, Mic } from 'lucide-react';

const Index = () => {
  const [showQuiz, setShowQuiz] = React.useState(false);

  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gradient-background">
        <Navigation />
        
        <main id="main-content" className="container mx-auto px-4 py-8">
          {showQuiz ? (
            <QuizInterface />
          ) : (
            <>
              {/* Hero Section */}
              <section className="text-center py-12 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Accessible Learning
                  <span className="block text-primary mt-2">For Everyone</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Experience our inclusive quiz platform designed specifically for differently-abled users. 
                  Voice control, screen reader support, and customizable accessibility features ensure 
                  everyone can learn and succeed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    onClick={() => setShowQuiz(true)}
                    className="text-lg px-8 py-6 bg-gradient-primary"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Start Demo Quiz
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-6"
                  >
                    Learn More
                  </Button>
                </div>
              </section>

              {/* Features Grid */}
              <section className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Voice Control</h3>
                  <p className="text-muted-foreground">
                    Navigate and answer questions using voice commands. 
                    Complete hands-free quiz experience with speech recognition.
                  </p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-success/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Screen Reader Ready</h3>
                  <p className="text-muted-foreground">
                    Fully compatible with screen readers and assistive technologies. 
                    Semantic HTML and ARIA labels throughout.
                  </p>
                </Card>

                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-warning/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-warning" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Customizable UI</h3>
                  <p className="text-muted-foreground">
                    Adjust font sizes, enable high contrast mode, and customize 
                    the interface to meet your specific needs.
                  </p>
                </Card>
              </section>

              {/* Accessibility Features */}
              <section className="bg-card rounded-lg p-8 mb-12">
                <h2 className="text-3xl font-bold text-center mb-8">Accessibility First Design</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Navigation Options</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Keyboard-only navigation support</li>
                      <li>• Voice command recognition</li>
                      <li>• Clear focus indicators</li>
                      <li>• Skip links for screen readers</li>
                      <li>• Logical tab order</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Visual Accessibility</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• High contrast color options</li>
                      <li>• Adjustable font sizes (75% - 150%)</li>
                      <li>• Color-blind friendly design</li>
                      <li>• Reduced motion options</li>
                      <li>• Clear visual hierarchy</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowQuiz(true)}
                  >
                    Try the Accessible Quiz Experience
                  </Button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </AccessibilityProvider>
  );
};

export default Index;
