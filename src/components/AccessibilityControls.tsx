import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, Type, Palette, Volume2, Mic } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
  
  class SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
  }
  
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  voiceEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  speakText: (text: string) => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    voiceEnabled: true,
    soundEnabled: true,
    reducedMotion: false,
  });
  
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis] = useState(window.speechSynthesis);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Apply settings to document
    if (newSettings.fontSize !== undefined) {
      document.documentElement.style.fontSize = `${newSettings.fontSize}%`;
    }
    
    if (newSettings.highContrast !== undefined) {
      document.documentElement.classList.toggle('high-contrast', newSettings.highContrast);
    }
    
    if (newSettings.reducedMotion !== undefined) {
      document.documentElement.classList.toggle('reduce-motion', newSettings.reducedMotion);
    }
  };

  const speakText = (text: string) => {
    if (!settings.voiceEnabled || !synthesis) return;
    
    // Cancel any current speech
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    synthesis.speak(utterance);
  };

  const startListening = async (): Promise<void> => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      newRecognition.continuous = false;
      newRecognition.interimResults = false;
      newRecognition.lang = 'en-US';
      
      newRecognition.onstart = () => {
        setIsListening(true);
        speakText("Listening for your answer");
      };
      
      newRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        // This will be handled by the quiz component
        document.dispatchEvent(new CustomEvent('voiceInput', { detail: transcript }));
      };
      
      newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        });
        setIsListening(false);
      };
      
      newRecognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(newRecognition);
      newRecognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Voice Recognition Error",
        description: "Could not start voice recognition.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    speakText,
    startListening,
    stopListening,
    isListening,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

interface AccessibilityControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, speakText } = useAccessibility();

  if (!isOpen) return null;

  return (
    <Card className="fixed top-4 right-4 z-50 p-6 w-80 shadow-lg border-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          aria-label="Close accessibility settings"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Font Size */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Type className="h-4 w-4" />
            Font Size: {settings.fontSize}%
          </label>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSettings({ fontSize: value })}
            min={75}
            max={150}
            step={25}
            className="w-full"
            aria-label="Adjust font size"
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast" className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            High Contrast Mode
          </label>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Voice Features */}
        <div className="flex items-center justify-between">
          <label htmlFor="voice-enabled" className="flex items-center gap-2 text-sm font-medium">
            <Volume2 className="h-4 w-4" />
            Text-to-Speech
          </label>
          <Switch
            id="voice-enabled"
            checked={settings.voiceEnabled}
            onCheckedChange={(checked) => updateSettings({ voiceEnabled: checked })}
            aria-label="Toggle text-to-speech"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <label htmlFor="reduced-motion" className="text-sm font-medium">
            Reduce Motion
          </label>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            aria-label="Toggle reduced motion"
          />
        </div>

        <Button 
          onClick={() => speakText("Accessibility settings updated")}
          variant="outline"
          className="w-full"
        >
          Test Voice
        </Button>
      </div>
    </Card>
  );
};