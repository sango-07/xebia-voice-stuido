import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Verify user
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { sessionId, transcript, sentiment, intent, language } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    console.log('Ending voice session:', sessionId);

    // Get the session to calculate duration
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error('Session lookup error:', sessionError);
      throw new Error('Session not found');
    }

    // Calculate duration
    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

    // Update the session
    const { error: updateError } = await supabase
      .from('voice_sessions')
      .update({
        status: 'ended',
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        transcript: transcript || null,
        sentiment: sentiment || 'neutral',
        intent: intent || null,
        language: language || 'English'
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Session update error:', updateError);
      throw new Error('Failed to update session');
    }

    // Also create a call_log entry for analytics
    const { error: callLogError } = await supabase
      .from('call_logs')
      .insert({
        agent_id: session.agent_id,
        user_id: user.id,
        duration_seconds: durationSeconds,
        sentiment: sentiment || 'neutral',
        outcome: 'resolved',
        intent: intent || null,
        language: language || 'English',
        transcript: transcript || null,
        customer_phone: session.customer_phone
      });

    if (callLogError) {
      console.error('Call log creation error:', callLogError);
      // Don't throw - session was updated successfully
    }

    console.log('Voice session ended successfully, duration:', durationSeconds, 'seconds');

    return new Response(
      JSON.stringify({ 
        success: true,
        durationSeconds 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error ending voice session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: errorMessage === 'Unauthorized' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
