import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TemplateCardProps {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  features: string[];
  integrations: string[];
  isProductionReady?: boolean;
  delay?: number;
}

export const TemplateCard = ({
  id,
  name,
  icon,
  category,
  description,
  features,
  integrations,
  isProductionReady = true,
  delay = 0,
}: TemplateCardProps) => {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    Banking: 'bg-primary/10 text-primary',
    Insurance: 'bg-secondary/10 text-secondary',
    Fintech: 'bg-success/10 text-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card-hover p-6 flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${categoryColors[category]}`}>
          {category}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

      <div className="space-y-2 mb-4">
        {features.slice(0, 4).map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-success flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {integrations.map((integration, index) => (
          <span
            key={index}
            className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
          >
            {integration}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-success flex items-center gap-1">
            <Check className="h-3 w-3" />
            {isProductionReady ? 'Production Ready' : 'In Development'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-gradient-primary hover:opacity-90"
            onClick={() => navigate(`/agents/new?template=${id}`)}
          >
            Use Template
          </Button>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
