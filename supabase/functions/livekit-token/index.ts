import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// LiveKit token generation using API
async function generateLiveKitToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  participantIdentity: string,
  participantName: string
): Promise<string> {
  // Create JWT header
  const header = {
    alg: "HS256",
    typ: "JWT"
  };

  // Create JWT payload with LiveKit claims
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
    sub: participantIdentity,
    name: participantName,
    nbf: now,
    exp: now + 86400, // 24 hours
    iat: now,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    }
  };

  // Encode header and payload
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Sign with HMAC-SHA256
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      console.error('Missing LiveKit configuration');
      throw new Error('LiveKit configuration missing');
    }

    // Get the authorization header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Verify user with Supabase
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    const { agentId, roomName: providedRoomName, participantName } = await req.json();

    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    // Verify user owns this agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', user.id)
      .single();

    if (agentError || !agent) {
      console.error('Agent lookup error:', agentError);
      throw new Error('Agent not found or unauthorized');
    }

    console.log('Found agent:', agent.name);

    // Generate unique room name if not provided
    const roomName = providedRoomName || `agent-${agentId}-${Date.now()}`;
    const identity = `user-${user.id}`;
    const displayName = participantName || 'User';

    // Generate LiveKit token
    const livekitToken = await generateLiveKitToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      roomName,
      identity,
      displayName
    );

    console.log('Generated token for room:', roomName);

    // Create voice session record
    const { data: session, error: sessionError } = await supabase
      .from('voice_sessions')
      .insert({
        agent_id: agentId,
        user_id: user.id,
        room_name: roomName,
        status: 'connecting'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      // Continue anyway - token is valid even if session tracking fails
    } else {
      console.log('Created voice session:', session.id);
    }

    return new Response(
      JSON.stringify({
        token: livekitToken,
        url: LIVEKIT_URL,
        roomName,
        sessionId: session?.id,
        agent: {
          id: agent.id,
          name: agent.name,
          persona_name: agent.persona_name,
          system_prompt: agent.system_prompt,
          voice_gender: agent.voice_gender,
          voice_accent: agent.voice_accent
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error generating LiveKit token:', error);
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
