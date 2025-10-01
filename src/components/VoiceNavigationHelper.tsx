import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility } from '@/components/AccessibilityControls';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const VoiceNavigationHelper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { speakText, startListening, stopListening, isListening } = useAccessibility();
  const { toast } = useToast();
  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    const handleVoiceNavigation = (event: Event) => {
      const customEvent = event as CustomEvent<{ transcript: string }>;
      const command = customEvent.detail.transcript.toLowerCase().trim();
      setLastCommand(command);

      // Navigation commands
      if (command.includes('go to home') || command.includes('go home') || command === 'home') {
        navigate('/');
        speakText('Navigating to home page');
        toast({ title: "Voice Command", description: "Going to home page" });
      } else if (command.includes('go to quizzes') || command.includes('show quizzes') || command === 'quizzes') {
        navigate('/quizzes');
        speakText('Navigating to quizzes page');
        toast({ title: "Voice Command", description: "Going to quizzes page" });
      } else if (command.includes('go to profile') || command === 'profile') {
        navigate('/profile');
        speakText('Navigating to profile page');
        toast({ title: "Voice Command", description: "Going to profile page" });
      } else if (command.includes('sign in') || command.includes('login')) {
        navigate('/auth');
        speakText('Navigating to sign in page');
        toast({ title: "Voice Command", description: "Going to sign in page" });
      }
      // Page actions
      else if (command.includes('go back') || command === 'back') {
        window.history.back();
        speakText('Going back');
        toast({ title: "Voice Command", description: "Going back" });
      }
      // Help commands
      else if (command.includes('help') || command.includes('commands')) {
        const helpMessage = 'Available voice commands: Say "go to home", "go to quizzes", "go to profile", "sign in", "go back", or "help" for assistance.';
        speakText(helpMessage);
        toast({ 
          title: "Voice Commands Available", 
          description: helpMessage,
          duration: 8000 
        });
      }
      // Read current page
      else if (command.includes('where am i') || command.includes('current page')) {
        const pageName = location.pathname === '/' ? 'home' : location.pathname.slice(1);
        speakText(`You are on the ${pageName} page`);
        toast({ title: "Current Location", description: `${pageName} page` });
      }
    };

    window.addEventListener('voiceInput', handleVoiceNavigation);
    return () => window.removeEventListener('voiceInput', handleVoiceNavigation);
  }, [navigate, location, speakText, toast]);

  const toggleVoiceNavigation = () => {
    if (isListening) {
      stopListening();
      speakText('Voice navigation stopped');
      toast({ 
        title: "Voice Navigation", 
        description: "Voice commands disabled",
        variant: "default"
      });
    } else {
      startListening();
      speakText('Voice navigation activated. Say help for available commands.');
      toast({ 
        title: "Voice Navigation Active", 
        description: "Say 'help' for available commands",
        duration: 5000
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <Button
        onClick={toggleVoiceNavigation}
        size="lg"
        className={`rounded-full h-14 w-14 shadow-lg transition-all ${
          isListening 
            ? 'bg-error hover:bg-error/90 animate-pulse-glow' 
            : 'bg-primary hover:bg-primary-hover'
        }`}
        aria-label={isListening ? 'Stop voice navigation' : 'Start voice navigation'}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      {isListening && (
        <Badge 
          variant="secondary" 
          className="animate-fade-in shadow-md"
        >
          Listening...
        </Badge>
      )}
      
      {lastCommand && (
        <Badge 
          variant="outline" 
          className="animate-fade-in max-w-[200px] text-xs"
        >
          "{lastCommand}"
        </Badge>
      )}
    </div>
  );
};
