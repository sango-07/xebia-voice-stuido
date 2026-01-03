import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LiveCallCardProps {
  phone: string;
  duration: number;
  agentName: string;
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

export const LiveCallCard = ({ phone, duration, agentName, intent, sentiment, language }: LiveCallCardProps) => {
  const [currentDuration, setCurrentDuration] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sentimentConfig = {
    positive: { emoji: '😊', color: 'text-success', bg: 'bg-success/20' },
    neutral: { emoji: '😐', color: 'text-warning', bg: 'bg-warning/20' },
    negative: { emoji: '😟', color: 'text-destructive', bg: 'bg-destructive/20' },
  };

  const config = sentimentConfig[sentiment];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-4 border-l-2 border-success"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-medium text-foreground">{phone}</span>
        </div>
        <span className="text-sm font-mono text-primary">{formatDuration(currentDuration)}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Agent:</span>
          <span className="text-foreground">{agentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Intent:</span>
          <span className="text-foreground">{intent}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Sentiment:</span>
          <span className={cn('px-2 py-0.5 rounded-full text-xs flex items-center gap-1', config.bg, config.color)}>
            {config.emoji} {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Language:</span>
          <span className="text-foreground">{language}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full mt-4">
        <Eye className="h-4 w-4 mr-2" />
        View Transcript
      </Button>
    </motion.div>
  );
};
