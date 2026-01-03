import { motion } from 'framer-motion';
import { Plus, LayoutTemplate, Phone, Bot, Target, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LiveCallCard } from '@/components/dashboard/LiveCallCard';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { callVolumeData, activityLog } from '@/data/mockData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { agents, liveCalls } = useAppStore();

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" breadcrumb={['Home', 'Dashboard']} />

      <div className="p-6 space-y-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8"
        >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[size:20px_20px]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-primary-foreground mb-2">Welcome back, Priya! 👋</h2>
            <p className="text-primary-foreground/80 text-lg mb-6">
              You have {agents.filter(a => a.status === 'live').length} active agents handling 127 calls today
            </p>
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                onClick={() => navigate('/agents/new')}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Agent
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/templates')}
              >
                <LayoutTemplate className="h-5 w-5 mr-2" />
                View Templates
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Calls Today"
            value="127"
            trend="+12% from yesterday"
            trendUp={true}
            icon={<Phone className="h-6 w-6" />}
            delay={0.1}
          />
          <MetricCard
            title="Active Agents"
            value="3"
            trend="2 in production, 1 in testing"
            icon={<Bot className="h-6 w-6" />}
            delay={0.2}
          />
          <MetricCard
            title="Containment Rate"
            value="94%"
            trend="+3% from last week"
            trendUp={true}
            icon={<Target className="h-6 w-6" />}
            delay={0.3}
          />
          <MetricCard
            title="Cost Saved Today"
            value="₹30,734"
            trend="96% savings vs human agents"
            trendUp={true}
            icon={<IndianRupee className="h-6 w-6" />}
            delay={0.4}
          />
        </div>

        {/* Live Calls Monitor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">
              Live Calls ({liveCalls.length} in progress)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveCalls.map((call) => (
              <LiveCallCard key={call.id} {...call} />
            ))}
          </div>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Call Volume (Last 24 Hours)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={callVolumeData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis
                    dataKey="hour"
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="hsl(239, 84%, 67%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {activityLog.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* My Agents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">My Agents</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/agents')}>
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <AgentCard key={agent.id} {...agent} delay={0.1 * index} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
