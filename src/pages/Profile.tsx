import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  Clock, 
  Target, 
  Settings, 
  Accessibility, 
  Volume2,
  Eye,
  Keyboard,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  display_name: string | null;
  accessibility_preferences: any;
}

interface UserScore {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number | null;
  quiz_id: string;
  quizzes?: {
    title: string;
    difficulty: string | null;
  };
}

interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  colorTheme: 'default' | 'high-contrast' | 'dark';
  screenReader: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;
  reducedMotion: boolean;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<AccessibilityPreferences>({
    fontSize: 'normal',
    colorTheme: 'default',
    screenReader: false,
    keyboardNavigation: true,
    voiceControl: false,
    reducedMotion: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || '');
        if (profileData.accessibility_preferences && typeof profileData.accessibility_preferences === 'object') {
          const savedPrefs = profileData.accessibility_preferences as Partial<AccessibilityPreferences>;
          setAccessibilityPrefs(prev => ({ ...prev, ...savedPrefs }));
        }
      }

      // Fetch user scores with quiz details
      const { data: scoresData, error: scoresError } = await supabase
        .from('user_scores')
        .select(`
          *,
          quizzes:quiz_id (
            title,
            difficulty
          )
        `)
        .eq('user_id', user!.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (scoresError) throw scoresError;
      setScores(scoresData || []);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName || null,
          accessibility_preferences: accessibilityPrefs as any,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateStats = () => {
    if (scores.length === 0) return { average: 0, totalQuizzes: 0, bestScore: 0 };
    
    const totalScore = scores.reduce((sum, score) => sum + (score.score / score.total_questions * 100), 0);
    const average = Math.round(totalScore / scores.length);
    const bestScore = Math.round(Math.max(...scores.map(s => s.score / s.total_questions * 100)));
    
    return {
      average,
      totalQuizzes: scores.length,
      bestScore
    };
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              User Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your account, view your quiz performance, and customize accessibility settings
            </p>
          </header>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4" aria-label="Profile sections">
              <TabsTrigger value="overview" aria-label="Profile overview">
                <User className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" aria-label="Quiz performance">
                <Trophy className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="settings" aria-label="Account settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="accessibility" aria-label="Accessibility preferences">
                <Accessibility className="h-4 w-4 mr-2" />
                Accessibility
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4">
                      <User className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <CardTitle>{displayName || user?.email || 'User'}</CardTitle>
                    <CardDescription>Quiz Platform Member</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-primary">{stats.totalQuizzes}</div>
                        <div className="text-muted-foreground">Quizzes Taken</div>
                      </div>
                      <div>
                        <div className="font-semibold text-success">{stats.average}%</div>
                        <div className="text-muted-foreground">Avg Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Average Score</span>
                        <span className="font-semibold">{stats.average}%</span>
                      </div>
                      <Progress value={stats.average} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Best Score</span>
                        <span className="font-semibold">{stats.bestScore}%</span>
                      </div>
                      <Progress value={stats.bestScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-warning" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scores.length > 0 ? (
                      <div className="space-y-3">
                        {scores.slice(0, 3).map((score) => (
                          <div key={score.id} className="flex justify-between items-center text-sm">
                            <div>
                              <div className="font-medium">{score.quizzes?.title || 'Quiz'}</div>
                              <div className="text-muted-foreground">
                                {new Date(score.completed_at).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge variant={score.score / score.total_questions >= 0.8 ? 'default' : 'secondary'}>
                              {Math.round(score.score / score.total_questions * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No quiz attempts yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz History</CardTitle>
                  <CardDescription>Your complete quiz performance history</CardDescription>
                </CardHeader>
                <CardContent>
                  {scores.length > 0 ? (
                    <div className="space-y-4">
                      {scores.map((score) => (
                        <div key={score.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{score.quizzes?.title || 'Quiz'}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(score.completed_at).toLocaleDateString()} at{' '}
                                {new Date(score.completed_at).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge 
                                className={score.score / score.total_questions >= 0.8 ? 'bg-success' : 'bg-warning'}
                              >
                                {Math.round(score.score / score.total_questions * 100)}%
                              </Badge>
                              {score.quizzes?.difficulty && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {score.quizzes.difficulty}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Score: </span>
                              <span className="font-medium">{score.score}/{score.total_questions}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Accuracy: </span>
                              <span className="font-medium">
                                {Math.round(score.score / score.total_questions * 100)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Time: </span>
                              <span className="font-medium">
                                {score.time_taken ? `${Math.round(score.time_taken / 60)}m` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Quiz History</h3>
                      <p className="text-muted-foreground mb-4">
                        Start taking quizzes to see your performance history here.
                      </p>
                      <Button onClick={() => navigate('/quizzes')}>
                        Browse Quizzes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        aria-describedby="email-description"
                      />
                      <p id="email-description" className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed here
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving}
                      aria-describedby="save-status"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Accessibility className="h-5 w-5 mr-2" />
                    Accessibility Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize the interface to meet your accessibility needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="flex items-center mb-2">
                          <Eye className="h-4 w-4 mr-2" />
                          Font Size
                        </Label>
                        <Select 
                          value={accessibilityPrefs.fontSize} 
                          onValueChange={(value: any) => 
                            setAccessibilityPrefs({...accessibilityPrefs, fontSize: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="extra-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="flex items-center mb-2">
                          <Palette className="h-4 w-4 mr-2" />
                          Color Theme
                        </Label>
                        <Select 
                          value={accessibilityPrefs.colorTheme} 
                          onValueChange={(value: any) => 
                            setAccessibilityPrefs({...accessibilityPrefs, colorTheme: value})
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="high-contrast">High Contrast</SelectItem>
                            <SelectItem value="dark">Dark Mode</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center">
                          <Volume2 className="h-4 w-4 mr-2" />
                          Screen Reader Support
                        </Label>
                        <Switch
                          checked={accessibilityPrefs.screenReader}
                          onCheckedChange={(checked) =>
                            setAccessibilityPrefs({...accessibilityPrefs, screenReader: checked})
                          }
                          aria-label="Enable screen reader support"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="flex items-center">
                          <Keyboard className="h-4 w-4 mr-2" />
                          Enhanced Keyboard Navigation
                        </Label>
                        <Switch
                          checked={accessibilityPrefs.keyboardNavigation}
                          onCheckedChange={(checked) =>
                            setAccessibilityPrefs({...accessibilityPrefs, keyboardNavigation: checked})
                          }
                          aria-label="Enable enhanced keyboard navigation"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="voice-control">Voice Control</Label>
                        <Switch
                          id="voice-control"
                          checked={accessibilityPrefs.voiceControl}
                          onCheckedChange={(checked) =>
                            setAccessibilityPrefs({...accessibilityPrefs, voiceControl: checked})
                          }
                          aria-label="Enable voice control"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="reduced-motion">Reduced Motion</Label>
                        <Switch
                          id="reduced-motion"
                          checked={accessibilityPrefs.reducedMotion}
                          onCheckedChange={(checked) =>
                            setAccessibilityPrefs({...accessibilityPrefs, reducedMotion: checked})
                          }
                          aria-label="Enable reduced motion"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Button 
                      onClick={saveProfile} 
                      disabled={saving}
                      className="w-full md:w-auto"
                    >
                      {saving ? 'Saving Preferences...' : 'Save Accessibility Preferences'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;