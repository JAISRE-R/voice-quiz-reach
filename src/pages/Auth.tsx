import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccessibility } from '@/components/AccessibilityControls';
import { Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { speakText } = useAccessibility();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
          speakText(`Sign up failed: ${error.message}`);
        } else {
          speakText('Sign up successful! Please check your email to confirm your account.');
          toast({
            title: "Account created!",
            description: "Please check your email to confirm your account.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          speakText(`Sign in failed: ${error.message}`);
        } else {
          speakText('Successfully signed in!');
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      speakText('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    const mode = !isSignUp ? 'sign up' : 'sign in';
    speakText(`Switched to ${mode} mode`);
  };

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp 
              ? 'Join our accessible quiz platform'
              : 'Sign in to continue your learning journey'
            }
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                  aria-describedby="displayName-help"
                />
              </div>
              <p id="displayName-help" className="text-xs text-muted-foreground">
                This name will be shown on your profile
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                aria-describedby="email-help"
              />
            </div>
            <p id="email-help" className="text-xs text-muted-foreground">
              We'll use this to send you important updates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
                aria-describedby="password-help"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p id="password-help" className="text-xs text-muted-foreground">
              {isSignUp ? 'Must be at least 6 characters long' : 'Enter your account password'}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={toggleMode}
            className="text-sm"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"
            }
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-sm mb-2">Accessibility Features:</h3>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Screen reader compatible forms with proper labels</li>
            <li>• Keyboard navigation support</li>
            <li>• Voice feedback for all interactions</li>
            <li>• Clear error messages and form validation</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Auth;