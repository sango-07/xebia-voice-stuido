import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/useAgents';
import { Skeleton } from '@/components/ui/skeleton';

const Agents = () => {
  const navigate = useNavigate();
  const { data: agents = [], isLoading } = useAgents();

  return (
    <div className="min-h-screen">
      <Header title="My Agents" breadcrumb={['Home', 'Agents']} />

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-foreground">Your Voice Agents</h2>
            <p className="text-muted-foreground">Manage and monitor your deployed AI voice agents</p>
          </div>
          <Button className="bg-gradient-primary" onClick={() => navigate('/agents/new')}>
            <Plus className="h-5 w-5 mr-2" />
            Create New Agent
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-6 w-16 mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                id={agent.id}
                name={agent.name}
                status={agent.status}
                category={agent.category}
                description={agent.description || ''}
                callsToday={0}
                avgDuration={0}
                satisfaction={0}
                delay={0.1 * index}
              />
            ))}

            {/* Empty State Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => navigate('/templates')}
              className="glass-card p-6 border-dashed border-2 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:border-primary/50 transition-colors group"
            >
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-foreground mb-1">Add New Agent</p>
              <p className="text-sm text-muted-foreground text-center">
                Choose from templates or build from scratch
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
