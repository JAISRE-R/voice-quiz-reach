import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings, Home, User, BookOpen, HelpCircle, LogOut } from 'lucide-react';
import { AccessibilityControls, useAccessibility } from './AccessibilityControls';
import { toast } from '@/hooks/use-toast';

export const Navigation: React.FC = () => {
  const [showAccessibilityControls, setShowAccessibilityControls] = useState(false);
  const { speakText } = useAccessibility();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = (section: string, path?: string) => {
    speakText(`Navigating to ${section}`);
    if (path) {
      navigate(path);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      speakText('Successfully signed out');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      speakText('Error signing out');
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav 
        className="bg-card border-b border-border px-4 py-3"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-primary">
              QuizAccess
            </h1>
            
            <div className="hidden md:flex space-x-1">
              <Button
                variant="ghost"
                onClick={() => handleNavClick('home', '/')}
                className="flex items-center gap-2"
                aria-label="Go to home page"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleNavClick('quizzes', '/quizzes')}
                className="flex items-center gap-2"
                aria-label="Browse available quizzes"
              >
                <BookOpen className="h-4 w-4" />
                Quizzes
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleNavClick('profile', '/profile')}
                className="flex items-center gap-2"
                aria-label="View your profile"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleNavClick('help')}
                className="flex items-center gap-2"
                aria-label="Get help and support"
              >
                <HelpCircle className="h-4 w-4" />
                Help
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAccessibilityControls(!showAccessibilityControls);
                speakText(showAccessibilityControls ? "Closed accessibility settings" : "Opened accessibility settings");
              }}
              className="flex items-center gap-2"
              aria-label="Open accessibility settings"
              aria-expanded={showAccessibilityControls}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Accessibility</span>
            </Button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavClick('profile', '/profile')}
                  aria-label={`Welcome ${user.email}`}
                >
                  <User className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  handleNavClick('sign in');
                  navigate('/auth');
                }}
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex space-x-1 overflow-x-auto pb-2">
          <Button variant="ghost" size="sm" onClick={() => handleNavClick('home', '/')}>
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavClick('quizzes', '/quizzes')}>
            <BookOpen className="h-4 w-4 mr-1" />
            Quizzes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavClick('profile', '/profile')}>
            <User className="h-4 w-4 mr-1" />
            Profile
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleNavClick('help')}>
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
          </Button>
        </div>
      </nav>

      <AccessibilityControls
        isOpen={showAccessibilityControls}
        onClose={() => setShowAccessibilityControls(false)}
      />
    </>
  );
};