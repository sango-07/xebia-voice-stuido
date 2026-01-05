import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, PhoneOff, Volume2, VolumeX, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
  personaName?: string;
}

export function VoiceAgentModal({
  isOpen,
  onClose,
  agentId,
  agentName,
  personaName,
}: VoiceAgentModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [roomRef, setRoomRef] = useState<any>(null);
  
  const { toast } = useToast();
  const { isLoading, session, startSession, endSession } = useVoiceSession();

  // Start session when modal opens
  useEffect(() => {
    if (isOpen && connectionStatus === 'idle') {
      handleConnect();
    }
  }, [isOpen]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Connect to LiveKit when session available
  useEffect(() => {
    if (!session?.token || !session?.url) return;

    const connectRoom = async () => {
      try {
        const { Room, RoomEvent, Track } = await import('livekit-client');
        
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        room.on(RoomEvent.Connected, () => {
          console.log('Connected to room');
          setConnectionStatus('connected');
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from room');
          setConnectionStatus('idle');
        });

        room.on(RoomEvent.TrackSubscribed, (track, _, participant) => {
          if (track.kind === Track.Kind.Audio) {
            const audioEl = track.attach();
            document.body.appendChild(audioEl);
            setIsAgentSpeaking(true);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track) => {
          track.detach().forEach(el => el.remove());
          setIsAgentSpeaking(false);
        });

        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          setIsAgentSpeaking(speakers.some(s => s.identity.includes('agent')));
        });

        await room.connect(session.url, session.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        
        setRoomRef(room);
      } catch (error) {
        console.error('Room connection error:', error);
        setConnectionStatus('error');
        toast({
          title: 'Connection Failed',
          description: 'Could not connect to voice service',
          variant: 'destructive',
        });
      }
    };

    connectRoom();

    return () => {
      if (roomRef) {
        roomRef.disconnect();
      }
    };
  }, [session]);

  const handleConnect = async () => {
    setConnectionStatus('connecting');
    await startSession({ agentId });
  };

  const handleDisconnect = async () => {
    if (roomRef) {
      roomRef.disconnect();
      setRoomRef(null);
    }
    await endSession();
    setCallDuration(0);
    setConnectionStatus('idle');
    onClose();
  };

  const toggleMute = async () => {
    if (roomRef) {
      await roomRef.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    document.querySelectorAll('audio').forEach(a => a.muted = !isSpeakerMuted);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isOpen) return null;

  const displayName = personaName || session?.agent?.persona_name || 'AI Agent';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && isMinimized && setIsMinimized(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={isMinimized 
            ? { scale: 0.5, y: '70vh', x: '30vw' }
            : { scale: 1, y: 0, x: 0 }
          }
          exit={{ scale: 0.9, y: 20 }}
          className={cn(
            'relative glass-card overflow-hidden',
            isMinimized ? 'w-48 h-24 rounded-2xl cursor-pointer' : 'w-full max-w-md p-8 rounded-2xl'
          )}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          {/* Header */}
          <div className={cn('flex items-center justify-between', isMinimized ? 'p-3' : 'mb-6')}>
            {!isMinimized && (
              <div>
                <h2 className="text-xl font-semibold text-foreground">{agentName}</h2>
                <p className="text-sm text-muted-foreground">Speaking with {displayName}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              )}
              {isMinimized ? (
                <div className="flex items-center gap-2 w-full">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-mono">{formatTime(callDuration)}</span>
                  <Button variant="ghost" size="icon" className="ml-auto" onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="icon" onClick={handleDisconnect}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div
                    className={cn(
                      'h-32 w-32 rounded-full flex items-center justify-center text-5xl',
                      connectionStatus === 'connected' && isAgentSpeaking ? 'bg-success' : 'bg-gradient-primary'
                    )}
                    animate={isAgentSpeaking ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    {connectionStatus === 'connecting' || isLoading ? '⏳' : isAgentSpeaking ? '🗣️' : '🤖'}
                  </motion.div>
                  
                  {isAgentSpeaking && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-success"
                      animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="text-center mb-6">
                {connectionStatus === 'connecting' || isLoading ? (
                  <div className="flex items-center justify-center gap-2 text-warning">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Connecting...</span>
                  </div>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm text-muted-foreground">
                        {isAgentSpeaking ? 'Agent speaking...' : 'Listening...'}
                      </span>
                    </div>
                    <p className="text-3xl font-mono text-primary mt-2">{formatTime(callDuration)}</p>
                  </>
                ) : connectionStatus === 'error' ? (
                  <div className="text-destructive">Connection failed. Try again.</div>
                ) : null}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={cn('h-14 w-14 rounded-full', isMuted && 'bg-destructive/20 border-destructive')}
                  onClick={toggleMute}
                  disabled={connectionStatus !== 'connected'}
                >
                  {isMuted ? <MicOff className="h-6 w-6 text-destructive" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  className="h-16 w-16 rounded-full"
                  onClick={handleDisconnect}
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={cn('h-14 w-14 rounded-full', isSpeakerMuted && 'bg-destructive/20 border-destructive')}
                  onClick={toggleSpeaker}
                  disabled={connectionStatus !== 'connected'}
                >
                  {isSpeakerMuted ? <VolumeX className="h-6 w-6 text-destructive" /> : <Volume2 className="h-6 w-6" />}
                </Button>
              </div>

              {/* Retry button for errors */}
              {connectionStatus === 'error' && (
                <Button className="w-full mt-4" onClick={handleConnect}>
                  Try Again
                </Button>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
