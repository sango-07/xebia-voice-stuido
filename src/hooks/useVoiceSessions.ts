import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceSession {
  id: string;
  agent_id: string;
  room_name: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  intent: string | null;
  language: string | null;
  customer_phone: string | null;
  agent?: {
    name: string;
    persona_name: string | null;
  };
}

export function useVoiceSessions(agentId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['voice-sessions', user?.id, agentId],
    queryFn: async () => {
      let query = supabase
        .from('voice_sessions')
        .select(`
          *,
          agents (
            name,
            persona_name
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching voice sessions:', error);
        throw error;
      }

      return (data || []) as VoiceSession[];
    },
    enabled: !!user,
  });
}

export function useVoiceSessionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['voice-session-stats', user?.id],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('voice_sessions')
        .select('duration_seconds, sentiment, status')
        .eq('user_id', user!.id)
        .gte('started_at', today.toISOString());

      if (error) {
        console.error('Error fetching voice session stats:', error);
        throw error;
      }

      const sessions = data || [];
      const completedSessions = sessions.filter(s => s.status === 'ended');
      
      const totalCalls = completedSessions.length;
      const totalDuration = completedSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
      const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
      
      const positiveCalls = completedSessions.filter(s => s.sentiment === 'positive').length;
      const satisfactionRate = totalCalls > 0 ? Math.round((positiveCalls / totalCalls) * 100) : 0;

      return {
        totalCallsToday: totalCalls,
        avgDurationSeconds: avgDuration,
        satisfactionRate,
        activeCalls: sessions.filter(s => s.status === 'active').length,
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
