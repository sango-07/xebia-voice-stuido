-- Create enum for agent status
CREATE TYPE public.agent_status AS ENUM ('live', 'testing', 'draft');

-- Create enum for agent category
CREATE TYPE public.agent_category AS ENUM ('Banking', 'Insurance', 'Fintech');

-- Create enum for call sentiment
CREATE TYPE public.call_sentiment AS ENUM ('positive', 'neutral', 'negative');

-- Create enum for call outcome
CREATE TYPE public.call_outcome AS ENUM ('resolved', 'escalated', 'abandoned');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'AI Consultant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status agent_status DEFAULT 'draft' NOT NULL,
  category agent_category DEFAULT 'Banking' NOT NULL,
  system_prompt TEXT,
  persona_name TEXT DEFAULT 'Maya',
  company_name TEXT,
  voice_gender TEXT DEFAULT 'female',
  voice_accent TEXT DEFAULT 'Mumbai',
  languages TEXT[] DEFAULT ARRAY['English'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create templates table (public, read-only for users)
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category agent_category NOT NULL,
  icon TEXT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  integrations TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_production_ready BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create call_logs table for analytics
CREATE TABLE public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_phone TEXT,
  duration_seconds INTEGER DEFAULT 0,
  intent TEXT,
  sentiment call_sentiment DEFAULT 'neutral',
  outcome call_outcome DEFAULT 'resolved',
  language TEXT DEFAULT 'English',
  transcript TEXT,
  cost_rupees NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create knowledge_documents table
CREATE TABLE public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_url TEXT,
  status TEXT DEFAULT 'processing',
  chunks_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Agents policies
CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- Templates policies (public read access)
CREATE POLICY "Anyone can view templates"
  ON public.templates FOR SELECT
  USING (true);

-- Call logs policies
CREATE POLICY "Users can view their own call logs"
  ON public.call_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own call logs"
  ON public.call_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Knowledge documents policies
CREATE POLICY "Users can manage knowledge docs for their agents"
  ON public.knowledge_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = knowledge_documents.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.templates (name, description, category, icon, features, integrations, is_production_ready) VALUES
('Balance Inquiry Agent', 'Help customers check account balances instantly. Handles authentication, balance queries, and transaction history.', 'Banking', '💰', ARRAY['Multi-language support', 'Automated authentication', 'CRM integration ready', 'Compliance built-in'], ARRAY['Finacle', 'TCS BaNCS'], true),
('Payment Collection Agent', 'Automated payment reminders and collection. Empathetic approach with flexible payment plans.', 'Banking', '💳', ARRAY['Payment scheduling', 'Flexible plans', 'SMS notifications', 'Payment tracking'], ARRAY['Finacle', 'Razorpay', 'Twilio'], true),
('Loan Status Agent', 'Check loan application status and eligibility. Guides customers through the process.', 'Banking', '🏠', ARRAY['Application tracking', 'Document guidance', 'Eligibility check', 'Multi-language'], ARRAY['Finacle', 'Document Management'], true),
('Claims Status Agent', 'Help policyholders track claim status and upload documents. Empathetic handling of sensitive situations.', 'Insurance', '🛡️', ARRAY['Claim tracking', 'Document upload', 'Status updates', 'Empathetic responses'], ARRAY['Guidewire', 'Duck Creek'], true),
('Policy Renewal Agent', 'Proactive policy renewal reminders. Highlights benefits and processes renewals seamlessly.', 'Insurance', '📋', ARRAY['Renewal reminders', 'Benefit highlights', 'Payment processing', 'Policy comparison'], ARRAY['Policy Management', 'Payment Gateway'], true),
('KYC Verification Agent', 'Guide customers through KYC verification. Collects Aadhaar, PAN, and address proof with clear instructions.', 'Fintech', '🔍', ARRAY['Aadhaar verification', 'PAN validation', 'Document collection', 'Clear guidance'], ARRAY['Aadhaar API', 'DigiLocker'], true);