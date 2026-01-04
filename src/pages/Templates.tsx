import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { Button } from '@/components/ui/button';
import { useTemplates } from '@/hooks/useTemplates';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const categories = ['All', 'Banking', 'Insurance', 'Fintech'];

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const { data: templates = [], isLoading } = useTemplates();

  const filteredTemplates = activeCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Header title="Agent Templates" breadcrumb={['Home', 'Templates']} />

      <div className="p-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Pre-built Voice Agents for BFSI
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Production-ready voice agents for common use cases. Select a template, customize for your client, and deploy in minutes.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          {categories.map((category) => {
            const count = category === 'All'
              ? templates.length
              : templates.filter((t) => t.category === category).length;
            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  activeCategory === category && 'bg-gradient-primary'
                )}
              >
                {category} ({count})
              </Button>
            );
          })}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <TemplateCard 
                key={template.id} 
                id={template.id}
                name={template.name}
                description={template.description}
                category={template.category}
                icon={template.icon || '🤖'}
                features={template.features || []}
                integrations={template.integrations || []}
                isProductionReady={template.is_production_ready ?? true}
                delay={0.1 * index} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
