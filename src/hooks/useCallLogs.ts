import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type CallLog = Database['public']['Tables']['call_logs']['Row'];

export const useCallLogs = (agentId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['call_logs', user?.id, agentId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('call_logs')
        .select('*, agents(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (CallLog & { agents: { name: string } | null })[];
    },
    enabled: !!user,
  });
};

export const useCallAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['call_analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const logs = data as CallLog[];
      
      const totalCalls = logs.length;
      const avgDuration = logs.length > 0 
        ? Math.round(logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / logs.length)
        : 0;
      
      const sentimentCounts = {
        positive: logs.filter(l => l.sentiment === 'positive').length,
        neutral: logs.filter(l => l.sentiment === 'neutral').length,
        negative: logs.filter(l => l.sentiment === 'negative').length,
      };
      
      const outcomeCounts = {
        resolved: logs.filter(l => l.outcome === 'resolved').length,
        escalated: logs.filter(l => l.outcome === 'escalated').length,
        abandoned: logs.filter(l => l.outcome === 'abandoned').length,
      };

      const containmentRate = totalCalls > 0 
        ? Math.round((outcomeCounts.resolved / totalCalls) * 100)
        : 0;

      const totalCost = logs.reduce((sum, log) => sum + Number(log.cost_rupees || 0), 0);

      const languageCounts: Record<string, number> = {};
      logs.forEach(log => {
        const lang = log.language || 'English';
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });

      return {
        totalCalls,
        avgDuration,
        containmentRate,
        totalCost,
        sentimentCounts,
        outcomeCounts,
        languageCounts,
      };
    },
    enabled: !!user,
  });
};
