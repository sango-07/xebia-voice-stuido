import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building, Key, CreditCard, Bell, Save, Upload } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen">
      <Header title="Settings" breadcrumb={['Home', 'Settings']} />

      <div className="p-6">
        <Tabs defaultValue="profile">
          <TabsList className="glass-card p-1 mb-6">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 max-w-2xl"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Profile Settings</h3>

              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5" 
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ''} className="mt-1.5" disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label>Role</Label>
                  <Input value={profile?.role || 'AI Consultant'} className="mt-1.5" disabled />
                </div>

                <Button 
                  className="bg-gradient-primary" 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 max-w-2xl"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Organization Settings</h3>

              <div className="space-y-4">
                <div>
                  <Label>Organization Name</Label>
                  <Input defaultValue="Xebia India" className="mt-1.5" />
                </div>

                <div>
                  <Label>Industry</Label>
                  <Input defaultValue="IT Consulting" className="mt-1.5" />
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">Active Agents</p>
                      <p className="text-sm text-muted-foreground">3 of 10 agents used</p>
                    </div>
                    <div className="w-32 h-2 bg-muted rounded-full">
                      <div className="w-[30%] h-full bg-gradient-primary rounded-full" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Team Members</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{displayName}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Admin
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-3">
                    Invite Member
                  </Button>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 max-w-2xl"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">API Keys</h3>

              <div className="space-y-3 mb-6">
                {[
                  { name: 'Production Key', key: 'xva_prod_••••••••••••abcd', created: 'Dec 15, 2024' },
                  { name: 'Development Key', key: 'xva_dev_••••••••••••efgh', created: 'Dec 10, 2024' },
                ].map((apiKey, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{apiKey.name}</p>
                      <p className="text-sm font-mono text-muted-foreground">{apiKey.key}</p>
                      <p className="text-xs text-muted-foreground mt-1">Created: {apiKey.created}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Copy</Button>
                      <Button variant="destructive" size="sm">Revoke</Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="bg-gradient-primary">
                <Key className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 max-w-2xl"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Billing</h3>

              <div className="p-4 rounded-lg bg-gradient-primary mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white/80">Current Plan</p>
                    <p className="text-2xl font-bold text-white">Professional</p>
                    <p className="text-sm text-white/80 mt-1">₹5,00,000/month</p>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-white/90">
                    Upgrade Plan
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Usage this month</span>
                  <span className="font-medium text-foreground">847 calls</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Next billing date</span>
                  <span className="font-medium text-foreground">Feb 1, 2025</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-medium text-foreground">•••• •••• •••• 4242</span>
                </div>
              </div>

              <Button variant="outline" className="mt-6">
                View Invoices
              </Button>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 max-w-2xl"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Notification Preferences</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'New call alerts', desc: 'Get notified when agents receive calls' },
                      { label: 'Daily summary', desc: 'Receive daily performance summaries' },
                      { label: 'Weekly reports', desc: 'Comprehensive weekly analytics' },
                      { label: 'Agent errors', desc: 'Immediate alerts for agent issues' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={i < 2} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">SMS Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Critical alerts', desc: 'Agent downtime or critical errors' },
                      { label: 'High volume alerts', desc: 'When call volume exceeds threshold' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="font-medium text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch defaultChecked={i === 0} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="bg-gradient-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
