import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LiveCall {
  id: string;
  phone: string;
  duration: number;
  agentName: string;
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  roomName: string;
}

export function useLiveCalls() {
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLiveCalls([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial active sessions
    const fetchActiveSessions = async () => {
      const { data, error } = await supabase
        .from('voice_sessions')
        .select(`
          id,
          customer_phone,
          started_at,
          room_name,
          intent,
          sentiment,
          language,
          agents (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching active sessions:', error);
        return;
      }

      const calls: LiveCall[] = (data || []).map((session: any) => ({
        id: session.id,
        phone: session.customer_phone || 'Unknown',
        duration: Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000),
        agentName: session.agents?.name || 'Unknown Agent',
        intent: session.intent || 'General inquiry',
        sentiment: session.sentiment || 'neutral',
        language: session.language || 'English',
        roomName: session.room_name,
      }));

      setLiveCalls(calls);
      setIsLoading(false);
    };

    fetchActiveSessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('voice-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voice_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Voice session change:', payload);

          if (payload.eventType === 'INSERT' && (payload.new as any).status === 'active') {
            // New active call
            const { data: agentData } = await supabase
              .from('agents')
              .select('name')
              .eq('id', (payload.new as any).agent_id)
              .single();

            const newCall: LiveCall = {
              id: (payload.new as any).id,
              phone: (payload.new as any).customer_phone || 'Unknown',
              duration: 0,
              agentName: agentData?.name || 'Unknown Agent',
              intent: (payload.new as any).intent || 'General inquiry',
              sentiment: (payload.new as any).sentiment || 'neutral',
              language: (payload.new as any).language || 'English',
              roomName: (payload.new as any).room_name,
            };

            setLiveCalls(prev => [newCall, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            if ((payload.new as any).status === 'ended') {
              // Call ended - remove from list
              setLiveCalls(prev => prev.filter(call => call.id !== (payload.new as any).id));
            } else if ((payload.new as any).status === 'active') {
              // Call became active
              setLiveCalls(prev => {
                const exists = prev.some(call => call.id === (payload.new as any).id);
                if (!exists) {
                  // Fetch and add
                  fetchActiveSessions();
                }
                return prev;
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setLiveCalls(prev => prev.filter(call => call.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { liveCalls, isLoading };
}
