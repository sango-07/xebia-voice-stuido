import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type CallLog = Database['public']['Tables']['call_logs']['Row'];
type VoiceSession = Database['public']['Tables']['voice_sessions']['Row'];

// Get call volume data by hour for charts
export const useCallVolumeData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['call_volume', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get voice sessions from the last 24 hours
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      
      const { data, error } = await supabase
        .from('voice_sessions')
        .select('started_at')
        .eq('user_id', user.id)
        .gte('started_at', yesterday.toISOString())
        .order('started_at', { ascending: true });

      if (error) throw error;

      // Group by hour
      const hourCounts: Record<number, number> = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
      }

      (data || []).forEach((session) => {
        const hour = new Date(session.started_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      return Object.entries(hourCounts).map(([hour, calls]) => ({
        hour: `${hour}:00`,
        calls,
      }));
    },
    enabled: !!user,
  });
};

// Get sentiment distribution from call logs
export const useSentimentData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sentiment_data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('call_logs')
        .select('sentiment')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };

      (data || []).forEach((log) => {
        if (log.sentiment && counts[log.sentiment as keyof typeof counts] !== undefined) {
          counts[log.sentiment as keyof typeof counts]++;
        }
      });

      return [
        { name: 'Positive', value: counts.positive, color: '#10b981' },
        { name: 'Neutral', value: counts.neutral, color: '#f59e0b' },
        { name: 'Negative', value: counts.negative, color: '#ef4444' },
      ];
    },
    enabled: !!user,
  });
};

// Get language breakdown from call logs
export const useLanguageData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['language_data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('call_logs')
        .select('language')
        .eq('user_id', user.id);

      if (error) throw error;

      const counts: Record<string, number> = {};

      (data || []).forEach((log) => {
        const lang = log.language || 'English';
        counts[lang] = (counts[lang] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([language, calls]) => ({ language, calls }))
        .sort((a, b) => b.calls - a.calls);
    },
    enabled: !!user,
  });
};

// Get recent conversations from call logs with agent names
export const useRecentConversations = (limit = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent_conversations', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('call_logs')
        .select('*, agents(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((log) => ({
        id: log.id,
        timestamp: new Date(log.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        phone: log.customer_phone || '+91-XXXXX-XXXXX',
        agent: log.agents?.name || 'Unknown Agent',
        duration: formatDuration(log.duration_seconds || 0),
        outcome: log.outcome === 'resolved' ? 'Resolved' 
          : log.outcome === 'escalated' ? 'Escalated' 
          : 'Abandoned',
        sentiment: log.sentiment === 'positive' ? '😊' 
          : log.sentiment === 'negative' ? '😟' 
          : '😐',
      }));
    },
    enabled: !!user,
  });
};

// Get activity log from recent agents and calls
export const useActivityLog = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity_log', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const activities: Array<{ id: string; message: string; time: string; icon: string }> = [];

      // Get recent call stats
      const { data: recentCalls } = await supabase
        .from('call_logs')
        .select('agent_id, agents(name), created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Count calls per agent in last 2 hours
      const twoHoursAgo = new Date();
      twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
      
      const agentCallCounts: Record<string, { name: string; count: number }> = {};
      (recentCalls || []).forEach((call) => {
        if (new Date(call.created_at) > twoHoursAgo) {
          const agentId = call.agent_id;
          if (!agentCallCounts[agentId]) {
            agentCallCounts[agentId] = { 
              name: call.agents?.name || 'Agent', 
              count: 0 
            };
          }
          agentCallCounts[agentId].count++;
        }
      });

      Object.entries(agentCallCounts).forEach(([id, { name, count }]) => {
        if (count > 0) {
          activities.push({
            id: `calls-${id}`,
            message: `${name} handled ${count} call${count > 1 ? 's' : ''}`,
            time: '2 hours ago',
            icon: '📞',
          });
        }
      });

      // Get recently created/updated agents
      const { data: recentAgents } = await supabase
        .from('agents')
        .select('id, name, status, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      (recentAgents || []).forEach((agent) => {
        const updatedAt = new Date(agent.updated_at);
        const hoursAgo = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60));
        
        if (hoursAgo < 24) {
          activities.push({
            id: `agent-${agent.id}`,
            message: `${agent.name} ${agent.status === 'live' ? 'deployed to production' : 'updated'}`,
            time: hoursAgo < 1 ? 'Just now' : `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`,
            icon: agent.status === 'live' ? '🚀' : '✏️',
          });
        }
      });

      // Sort by recency and limit
      return activities.slice(0, 4);
    },
    enabled: !!user,
  });
};

// Get agent filter options
export const useAgentOptions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agent_options', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('agents')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

// Helper function to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
