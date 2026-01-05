-- Create voice_sessions table for tracking active calls
CREATE TABLE public.voice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_phone TEXT,
  room_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'connecting' CHECK (status IN ('connecting', 'active', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  transcript TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  intent TEXT,
  language TEXT DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for voice sessions
CREATE POLICY "Users can view their own voice sessions" 
ON public.voice_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice sessions" 
ON public.voice_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice sessions" 
ON public.voice_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable realtime for live call monitoring
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_sessions;

-- Create index for faster lookups
CREATE INDEX idx_voice_sessions_agent_id ON public.voice_sessions(agent_id);
CREATE INDEX idx_voice_sessions_user_id ON public.voice_sessions(user_id);
CREATE INDEX idx_voice_sessions_status ON public.voice_sessions(status);