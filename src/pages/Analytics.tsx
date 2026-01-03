import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, TrendingUp, TrendingDown, Phone, Clock, Target, Star } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { callVolumeData, sentimentData, languageData, outcomeData, recentConversations } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [agentFilter, setAgentFilter] = useState('all');

  const metrics = [
    { title: 'Total Calls', value: '847', trend: '+12%', trendUp: true, icon: Phone },
    { title: 'Avg Duration', value: '52s', trend: '-5%', trendUp: true, icon: Clock },
    { title: 'Containment Rate', value: '89%', trend: '+3%', trendUp: true, icon: Target },
    { title: 'Satisfaction', value: '4.6', trend: '+0.2', trendUp: true, icon: Star },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Analytics" breadcrumb={['Home', 'Analytics']} />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="balance">Balance Inquiry</SelectItem>
                <SelectItem value="payment">Payment Collection</SelectItem>
                <SelectItem value="loan">Loan Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="stat-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-2 text-sm',
                      metric.trendUp ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {metric.trendUp ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{metric.trend}</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <metric.icon className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Call Volume Over Time</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callVolumeData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                <XAxis dataKey="hour" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(222, 47%, 8%)',
                    border: '1px solid hsl(217, 33%, 17%)',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="hsl(239, 84%, 67%)"
                  strokeWidth={2}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sentiment Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Sentiment Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Language Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Language Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                  <XAxis type="number" stroke="hsl(215, 20%, 65%)" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="language"
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(217, 33%, 17%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="calls" fill="hsl(239, 84%, 67%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 border-l-4 border-success"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💰</span>
            <h3 className="text-lg font-semibold text-foreground">Cost Savings Analysis</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">AI Cost per call</span>
                  <span className="font-medium text-foreground">₹8</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Human cost per call</span>
                  <span className="font-medium text-foreground">₹250</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground">Total calls this period</span>
                  <span className="font-medium text-foreground">847</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between p-3 rounded-lg bg-success/10">
                  <span className="text-success font-medium">Total Savings</span>
                  <span className="font-bold text-success text-xl">₹2,04,974 (97%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Projections</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-foreground">₹61.5L</p>
                  <p className="text-xs text-muted-foreground">Monthly projection</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-foreground">₹7.38 Cr</p>
                  <p className="text-xs text-muted-foreground">Annual projection</p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 text-center col-span-2">
                  <p className="text-3xl font-bold gradient-text">1,130%</p>
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary">
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Conversations</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Agent
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Outcome
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Sentiment
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentConversations.map((conv) => (
                  <tr key={conv.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 text-sm text-foreground">{conv.timestamp}</td>
                    <td className="py-3 px-4 text-sm text-foreground font-mono">{conv.phone}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{conv.agent}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{conv.duration}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs',
                          conv.outcome === 'Resolved'
                            ? 'bg-success/20 text-success'
                            : conv.outcome === 'Escalated'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-destructive/20 text-destructive'
                        )}
                      >
                        {conv.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xl">{conv.sentiment}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing 1-5 of 847</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
