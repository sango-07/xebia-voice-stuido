import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentProps {
  agentId: string;
  agentName?: string;
  personaName?: string;
  onSessionStart?: () => void;
  onSessionEnd?: (duration: number) => void;
  className?: string;
}

export function VoiceAgent({
  agentId,
  agentName,
  personaName,
  onSessionStart,
  onSessionEnd,
  className,
}: VoiceAgentProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomRef = useRef<any>(null);
  const { toast } = useToast();
  
  const { isLoading, session, isConnected, startSession, endSession } = useVoiceSession();

  // Timer for call duration
  useEffect(() => {
    if (isConnected) {
      setCallDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isConnected]);

  // Connect to LiveKit room when session is available
  useEffect(() => {
    if (!session?.token || !session?.url) return;

    const connectToRoom = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Dynamic import of livekit-client
        const { Room, RoomEvent, Track } = await import('livekit-client');
        
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        roomRef.current = room;

        // Handle room events
        room.on(RoomEvent.Connected, () => {
          console.log('Connected to LiveKit room');
          setConnectionStatus('connected');
          onSessionStart?.();
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from LiveKit room');
          setConnectionStatus('disconnected');
        });

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            console.log('Audio track subscribed from:', participant.identity);
            setIsAgentSpeaking(true);
            
            // Attach audio track to play
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Audio) {
            setIsAgentSpeaking(false);
            track.detach().forEach(el => el.remove());
          }
        });

        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const agentSpeaking = speakers.some(s => s.identity.startsWith('agent-'));
          setIsAgentSpeaking(agentSpeaking);
        });

        // Connect to the room
        await room.connect(session.url, session.token);
        console.log('Room connection initiated');

        // Enable local microphone
        await room.localParticipant.setMicrophoneEnabled(true);
        
      } catch (error) {
        console.error('Failed to connect to LiveKit room:', error);
        setConnectionStatus('disconnected');
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to voice service. Please try again.',
          variant: 'destructive',
        });
      }
    };

    connectToRoom();

    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [session, onSessionStart, toast]);

  const handleStartCall = async () => {
    await startSession({ agentId });
  };

  const handleEndCall = async () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    
    await endSession();
    onSessionEnd?.(callDuration);
    setCallDuration(0);
    setConnectionStatus('disconnected');
  };

  const toggleMute = async () => {
    if (roomRef.current) {
      const newMuted = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newMuted);
      setIsMuted(newMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    // Mute/unmute all audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.muted = !isSpeakerMuted;
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayName = personaName || session?.agent?.persona_name || 'AI Agent';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <AnimatePresence mode="wait">
        {!isConnected && connectionStatus === 'disconnected' ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center">
                <Mic className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{agentName || 'Voice Agent'}</h3>
              <p className="text-sm text-muted-foreground">Click to start conversation with {displayName}</p>
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-primary gap-2"
              onClick={handleStartCall}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Call
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Avatar with speaking animation */}
            <div className="relative">
              <motion.div
                className={cn(
                  'h-28 w-28 rounded-full flex items-center justify-center',
                  isAgentSpeaking ? 'bg-success' : 'bg-gradient-primary'
                )}
                animate={isAgentSpeaking ? {
                  scale: [1, 1.1, 1],
                  transition: { repeat: Infinity, duration: 1 }
                } : {}}
              >
                <span className="text-4xl">
                  {isAgentSpeaking ? '🗣️' : '🤖'}
                </span>
              </motion.div>
              
              {/* Speaking indicator rings */}
              {isAgentSpeaking && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-success"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-success"
                    animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                  />
                </>
              )}
            </div>

            {/* Status and duration */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
              <div className="flex items-center gap-2 justify-center mt-1">
                {connectionStatus === 'connecting' ? (
                  <span className="text-sm text-warning flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connecting...
                  </span>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {isAgentSpeaking ? 'Speaking...' : 'Listening...'}
                    </span>
                  </>
                )}
              </div>
              <p className="text-2xl font-mono text-primary mt-2">{formatDuration(callDuration)}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className={cn('h-12 w-12 rounded-full', isMuted && 'bg-destructive/20 border-destructive')}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                variant="destructive"
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className={cn('h-12 w-12 rounded-full', isSpeakerMuted && 'bg-destructive/20 border-destructive')}
                onClick={toggleSpeaker}
              >
                {isSpeakerMuted ? <VolumeX className="h-5 w-5 text-destructive" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
