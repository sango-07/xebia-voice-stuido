import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Template = Database['public']['Tables']['templates']['Row'];

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Template[];
    },
  });
};

export const useTemplate = (id: string | undefined) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Template | null;
    },
    enabled: !!id,
  });
};
