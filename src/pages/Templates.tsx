import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { Button } from '@/components/ui/button';
import { templates } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categories = ['All', 'Banking', 'Insurance', 'Fintech'];

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState('All');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <TemplateCard key={template.id} {...template} delay={0.1 * index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
