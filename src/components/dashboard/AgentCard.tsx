import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Edit, MoreVertical, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { VoiceAgentModal } from '@/components/voice/VoiceAgentModal';

interface AgentCardProps {
  id: string;
  name: string;
  status: 'live' | 'testing' | 'draft';
  category: string;
  description?: string;
  personaName?: string;
  callsToday: number;
  avgDuration: number;
  satisfaction: number;
  delay?: number;
}

export const AgentCard = ({
  id,
  name,
  status,
  category,
  personaName,
  callsToday,
  avgDuration,
  satisfaction,
  delay = 0,
}: AgentCardProps) => {
  const navigate = useNavigate();
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  const statusConfig = {
    live: { label: '🟢 Live', class: 'badge-live' },
    testing: { label: '🟡 Testing', class: 'badge-testing' },
    draft: { label: '⚪ Draft', class: 'badge-draft' },
  };

  const config = statusConfig[status];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass-card-hover p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <span className={cn(config.class)}>{config.label}</span>
        </div>

        <h3 className="font-semibold text-foreground mb-1">{name}</h3>
        <span className="badge-category">{category}</span>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{callsToday}</p>
            <p className="text-xs text-muted-foreground">Calls today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{avgDuration}s</p>
            <p className="text-xs text-muted-foreground">Avg duration</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-1">
              {satisfaction}
              <Star className="h-3 w-3 text-warning fill-warning" />
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 bg-gradient-primary"
            onClick={() => setIsCallModalOpen(true)}
          >
            <Phone className="h-4 w-4 mr-1" />
            Test Call
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/agents/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/analytics?agent=${id}`)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem>Pause Agent</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <VoiceAgentModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        agentId={id}
        agentName={name}
        personaName={personaName}
      />
    </>
  );
};
