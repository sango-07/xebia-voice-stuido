import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VoiceSessionConfig {
  agentId: string;
  participantName?: string;
}

interface VoiceSession {
  token: string;
  url: string;
  roomName: string;
  sessionId: string;
  agent: {
    id: string;
    name: string;
    persona_name: string;
    system_prompt: string;
    voice_gender: string;
    voice_accent: string;
  };
}

export function useVoiceSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const startSession = useCallback(async (config: VoiceSessionConfig): Promise<VoiceSession | null> => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to use voice agents.',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('livekit-token', {
        body: {
          agentId: config.agentId,
          participantName: config.participantName || user.email?.split('@')[0] || 'User',
        },
      });

      if (error) {
        console.error('Error getting LiveKit token:', error);
        throw new Error(error.message || 'Failed to initialize voice session');
      }

      if (!data?.token || !data?.url) {
        throw new Error('Invalid response from voice service');
      }

      console.log('Voice session started:', data.roomName);
      setSession(data);
      setIsConnected(true);

      return data;
    } catch (error) {
      console.error('Failed to start voice session:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to start voice session',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const endSession = useCallback(async (transcript?: string, sentiment?: string, intent?: string) => {
    if (!session?.sessionId) {
      setSession(null);
      setIsConnected(false);
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('end-voice-session', {
        body: {
          sessionId: session.sessionId,
          transcript,
          sentiment,
          intent,
        },
      });

      if (error) {
        console.error('Error ending session:', error);
      }

      console.log('Voice session ended');
    } catch (error) {
      console.error('Failed to end voice session:', error);
    } finally {
      setSession(null);
      setIsConnected(false);
    }
  }, [session]);

  return {
    isLoading,
    session,
    isConnected,
    startSession,
    endSession,
  };
}
