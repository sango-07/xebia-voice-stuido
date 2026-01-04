import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Play,
  Rocket,
  Settings,
  Mic,
  BookOpen,
  Wrench,
  GitBranch,
  Shield,
  Check,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { connectors } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useAgent, useCreateAgent, useUpdateAgent } from '@/hooks/useAgents';
import { useTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';

const AgentBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const isEditing = !!id;
  const { toast } = useToast();

  const { data: existingAgent } = useAgent(id);
  const { data: template } = useTemplate(templateId || undefined);
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const [agentName, setAgentName] = useState('New Agent');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'testing' | 'live'>('draft');
  const [category, setCategory] = useState<'Banking' | 'Insurance' | 'Fintech'>('Banking');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [personaName, setPersonaName] = useState('Maya');
  const [companyName, setCompanyName] = useState('');
  const [personality, setPersonality] = useState('friendly');
  const [verbosity, setVerbosity] = useState([50]);
  const [formality, setFormality] = useState([50]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing agent or template data
  useEffect(() => {
    if (existingAgent) {
      setAgentName(existingAgent.name);
      setDescription(existingAgent.description || '');
      setStatus(existingAgent.status);
      setCategory(existingAgent.category);
      setSystemPrompt(existingAgent.system_prompt || '');
      setPersonaName(existingAgent.persona_name || 'Maya');
      setCompanyName(existingAgent.company_name || '');
    } else if (template) {
      setAgentName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setSystemPrompt(`You are ${personaName}, an AI assistant. ${template.description}`);
    }
  }, [existingAgent, template]);

  const handleSave = async () => {
    if (!agentName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an agent name.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateAgent.mutateAsync({
          id,
          name: agentName,
          description,
          status,
          category,
          system_prompt: systemPrompt,
          persona_name: personaName,
          company_name: companyName,
        });
      } else {
        await createAgent.mutateAsync({
          name: agentName,
          description,
          status,
          category,
          system_prompt: systemPrompt,
          persona_name: personaName,
          company_name: companyName,
        });
        navigate('/agents');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeploy = async () => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateAgent.mutateAsync({
          id,
          name: agentName,
          description,
          status: 'live',
          category,
          system_prompt: systemPrompt,
          persona_name: personaName,
          company_name: companyName,
        });
      } else {
        await createAgent.mutateAsync({
          name: agentName,
          description,
          status: 'live',
          category,
          system_prompt: systemPrompt,
          persona_name: personaName,
          company_name: companyName,
        });
      }
      toast({
        title: 'Agent deployed!',
        description: 'Your agent is now live and ready to take calls.',
      });
      navigate('/agents');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'instructions', label: 'Instructions', icon: Settings },
    { id: 'voice', label: 'Voice & Model', icon: Mic },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'tools', label: 'Tools & Integrations', icon: Wrench },
    { id: 'flow', label: 'Conversation Flow', icon: GitBranch },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title={isEditing ? 'Edit Agent' : 'Create New Agent'}
        breadcrumb={['Home', 'Agents', isEditing ? 'Edit' : 'New']}
      />

      {/* Top Bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-16 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none h-auto p-0 focus-visible:ring-0 w-64"
            />
            <Select value={status} onValueChange={(val) => setStatus(val as 'draft' | 'testing' | 'live')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="live">Live</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button variant="secondary">
              <Play className="h-4 w-4 mr-2" />
              Test Agent
            </Button>
            <Button className="bg-gradient-primary" onClick={handleDeploy} disabled={isSaving}>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="instructions" className="p-6">
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

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {/* Agent Persona */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Agent Persona</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Agent Name</Label>
                    <Input 
                      placeholder="Maya" 
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label>Bank/Company Name</Label>
                    <Input 
                      placeholder="HDFC Bank" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1.5" 
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val as 'Banking' | 'Insurance' | 'Fintech')}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Banking">Banking</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Describe what this agent does..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5 min-h-20"
                  />
                </div>
              </motion.div>

              {/* System Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">System Instructions</h3>
                <Textarea
                  className="min-h-40 font-mono text-sm"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are Maya, an AI assistant..."
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{systemPrompt.length} / 2000 characters</span>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Insert Variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_name">{'{bank_name}'}</SelectItem>
                      <SelectItem value="customer_name">{'{customer_name}'}</SelectItem>
                      <SelectItem value="date">{'{date}'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Personality Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Personality Settings</h3>
                <RadioGroup value={personality} onValueChange={setPersonality} className="space-y-3">
                  {[
                    { value: 'professional', label: 'Professional', desc: 'Formal, efficient, business-focused' },
                    { value: 'friendly', label: 'Friendly', desc: 'Warm, personable, conversational' },
                    { value: 'empathetic', label: 'Empathetic', desc: 'Caring, patient, understanding' },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        personality === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-muted-foreground'
                      )}
                      onClick={() => setPersonality(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div>
                        <Label htmlFor={option.value} className="cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Verbosity</Label>
                      <span className="text-xs text-muted-foreground">Concise ←→ Detailed</span>
                    </div>
                    <Slider value={verbosity} onValueChange={setVerbosity} max={100} step={1} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Formality</Label>
                      <span className="text-xs text-muted-foreground">Casual ←→ Formal</span>
                    </div>
                    <Slider value={formality} onValueChange={setFormality} max={100} step={1} />
                  </div>
                </div>
              </motion.div>

              {/* Language Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Language Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['English (Indian)', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi'].map((lang, i) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox id={lang} defaultChecked={i < 2} />
                      <Label htmlFor={lang} className="text-sm cursor-pointer">
                        {lang}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <Label htmlFor="auto-detect">Auto-detect language</Label>
                    <p className="text-xs text-muted-foreground">Automatically detect customer's language</p>
                  </div>
                  <Switch id="auto-detect" defaultChecked />
                </div>
              </motion.div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 sticky top-36"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Preview Conversation</h3>
                <div className="space-y-3 mb-4">
                  <div className="bg-primary/10 rounded-lg p-3 text-sm">
                    <span className="text-primary font-medium">AI:</span>{' '}
                    <span className="text-foreground">
                      Thank you for calling HDFC Bank. I'm Maya, your virtual assistant. How may I help you today?
                    </span>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    <span className="text-muted-foreground font-medium">Customer:</span>{' '}
                    <span className="text-foreground">What's my account balance?</span>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 text-sm">
                    <span className="text-primary font-medium">AI:</span>{' '}
                    <span className="text-foreground">
                      I'd be happy to help you check your balance. For security, could you please confirm your registered mobile number?
                    </span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Test Response
                </Button>

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">💡 Tips</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Keep system prompt under 2000 characters</li>
                    <li>• Use {'{variables}'} for dynamic content</li>
                    <li>• Test in multiple languages before deploying</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* Voice & Model Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">AI Model Selection</h3>
              <RadioGroup defaultValue="realtime" className="space-y-3">
                {[
                  {
                    value: 'realtime',
                    title: 'Realtime Pipeline (Recommended)',
                    model: 'Gemini 2.0 Flash / OpenAI Realtime',
                    badges: ['Low latency', 'Multi-language native'],
                    desc: 'Best for: Natural conversations, quick responses',
                    cost: '₹0.08/minute',
                  },
                  {
                    value: 'traditional',
                    title: 'Traditional Pipeline',
                    model: 'Claude 3.5 Sonnet + ElevenLabs',
                    badges: ['Best reasoning'],
                    desc: 'Best for: Complex queries, multi-step logic',
                    cost: '₹0.12/minute',
                  },
                  {
                    value: 'hybrid',
                    title: 'Hybrid (Smart Routing)',
                    model: 'Auto-switch based on complexity',
                    badges: ['Best of both'],
                    desc: 'Automatically switch based on query complexity',
                    cost: '₹0.10/minute avg',
                  },
                ].map((option) => (
                  <div
                    key={option.value}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.title}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{option.model}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {option.badges.map((badge) => (
                            <span
                              key={badge}
                              className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{option.desc}</p>
                        <p className="text-xs font-medium text-success mt-1">{option.cost}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            {/* Voice Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Voice Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label>Voice Gender</Label>
                  <RadioGroup defaultValue="female" className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="neutral" id="neutral" />
                      <Label htmlFor="neutral">Neutral</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Voice Age</Label>
                  <RadioGroup defaultValue="mid" className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="young" id="young" />
                      <Label htmlFor="young">Young (20s)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mid" id="mid" />
                      <Label htmlFor="mid">Mid (30s)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="senior" id="senior" />
                      <Label htmlFor="senior">Senior (40s+)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Accent (English)</Label>
                  <Select defaultValue="mumbai">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Speaking Rate</Label>
                    <span className="text-xs text-muted-foreground">Normal</span>
                  </div>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Energy Level</Label>
                  </div>
                  <RadioGroup defaultValue="moderate" className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="calm" id="calm" />
                      <Label htmlFor="calm">Calm</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="moderate" />
                      <Label htmlFor="moderate">Moderate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="energetic" id="energetic" />
                      <Label htmlFor="energetic">Energetic</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </motion.div>

            {/* Voice Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 lg:col-span-2"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Voice Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Professional Female (Mumbai)', selected: true },
                  { name: 'Friendly Female (Delhi)', selected: false },
                  { name: 'Professional Male (Bangalore)', selected: false },
                ].map((voice, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-lg border transition-colors cursor-pointer',
                      voice.selected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                        <Mic className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{voice.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      "Thank you for calling HDFC Bank..."
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="h-3 w-3 mr-1" />
                        Play
                      </Button>
                      <Button
                        variant={voice.selected ? 'default' : 'secondary'}
                        size="sm"
                        className="flex-1"
                      >
                        {voice.selected ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Upload Documents</h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium mb-1">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <p className="text-xs text-muted-foreground">
                  Supported: PDF, DOCX, TXT, CSV, JSON
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-foreground mb-3">Indexed Documents</h4>
                <div className="space-y-2">
                  {[
                    { name: 'HDFC_Home_Loan_Brochure.pdf', size: '2.4 MB', chunks: 24, status: 'indexed' },
                    { name: 'Interest_Rates_2024.xlsx', size: '156 KB', chunks: 12, status: 'indexed' },
                    { name: 'FAQs.txt', size: '45 KB', chunks: null, status: 'processing' },
                  ].map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {doc.status === 'indexed' ? (
                          <span className="text-xs text-success">{doc.chunks} chunks</span>
                        ) : (
                          <span className="text-xs text-warning">Processing...</span>
                        )}
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Test Knowledge Search</h3>
              <div className="flex gap-2 mb-4">
                <Input placeholder="What are the interest rates for home loans?" className="flex-1" />
                <Button>Search</Button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-success">Score: 0.94</span>
                    <span className="text-xs text-muted-foreground">
                      HDFC_Home_Loan_Brochure.pdf (Page 3)
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    "Home loan interest rates start from 8.5% p.a. for salaried individuals with a CIBIL score above 750..."
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Knowledge Base Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-xs text-muted-foreground">Documents</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold text-foreground">156</p>
                    <p className="text-xs text-muted-foreground">Chunks</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Available Connectors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectors.map((connector, index) => (
                <motion.div
                  key={connector.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className={cn(
                    'glass-card p-5',
                    connector.status === 'connected' && 'border-success/30'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{connector.name}</h4>
                      <p className="text-xs text-muted-foreground">{connector.vendor}</p>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs',
                        connector.status === 'connected'
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {connector.status === 'connected' ? '✓ Connected' : 'Available'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{connector.category}</p>

                  {connector.status === 'connected' && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Available tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {connector.tools.map((tool) => (
                          <code
                            key={tool}
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                          >
                            {tool}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {connector.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          Configure
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1">
                          Test
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full" size="sm">
                        Connect
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Flow Tab */}
        <TabsContent value="flow" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Conversation Flow Builder</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Auto-layout
                </Button>
                <Button variant="outline" size="sm">
                  Validate Flow
                </Button>
              </div>
            </div>

            {/* Simplified Flow Preview */}
            <div className="h-96 bg-muted/30 rounded-lg border border-border relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  {[
                    { icon: '🎤', label: 'Greeting Node' },
                    { icon: '🔐', label: 'Authentication Node' },
                    { icon: '🎯', label: 'Intent Detection' },
                    { icon: '📊', label: 'Data Query' },
                    { icon: '🗣️', label: 'Response Node' },
                    { icon: '👋', label: 'Closing Node' },
                  ].map((node, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="px-4 py-3 rounded-lg bg-card border border-border flex items-center gap-2"
                      >
                        <span className="text-xl">{node.icon}</span>
                        <span className="text-sm font-medium">{node.label}</span>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                💡 Drag nodes from the sidebar to customize your conversation flow
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Regulatory Compliance</h3>
              <div className="space-y-3">
                {[
                  { name: 'RBI Guidelines (Banking)', status: 'configured', desc: 'Reserve Bank of India regulations' },
                  { name: 'IRDAI Regulations (Insurance)', status: 'review', desc: 'Insurance regulatory requirements' },
                  { name: 'PCI-DSS Level 1', status: 'configured', desc: 'Payment Card Industry Data Security' },
                  { name: 'Data Encryption (AES-256)', status: 'enabled', desc: 'End-to-end encryption' },
                  { name: 'PII Masking', status: 'enabled', desc: 'Auto-mask card numbers, Aadhaar' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox defaultChecked id={`compliance-${index}`} />
                      <div>
                        <Label htmlFor={`compliance-${index}`} className="cursor-pointer">
                          {item.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        item.status === 'configured' || item.status === 'enabled'
                          ? 'bg-success/20 text-success'
                          : 'bg-warning/20 text-warning'
                      )}
                    >
                      {item.status === 'review' ? '⚠️ Needs Review' : '✓ ' + item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Call Recording Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable call recording</Label>
                    <p className="text-xs text-muted-foreground">Record all calls for quality assurance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer consent required</Label>
                    <p className="text-xs text-muted-foreground">Ask for consent before recording</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div>
                  <Label>Consent message</Label>
                  <Textarea
                    className="mt-1.5"
                    defaultValue="This call may be recorded for quality and training purposes."
                  />
                </div>
                <div>
                  <Label>Retention period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Security Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {['🛡️ RBI Compliant', '🔒 PCI-DSS Level 1', '✅ ISO 27001', '🔐 SOC 2 Type II'].map((badge) => (
                    <span key={badge} className="px-3 py-1.5 rounded-lg bg-muted text-sm">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentBuilder;
