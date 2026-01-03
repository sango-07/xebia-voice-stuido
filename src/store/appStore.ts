import { create } from 'zustand';

interface Agent {
  id: string;
  name: string;
  status: 'live' | 'testing' | 'draft';
  category: 'Banking' | 'Insurance' | 'Fintech';
  callsToday: number;
  avgDuration: number;
  satisfaction: number;
  description: string;
}

interface LiveCall {
  id: string;
  phone: string;
  duration: number;
  agentName: string;
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
}

interface AppState {
  agents: Agent[];
  liveCalls: LiveCall[];
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  agents: [
    {
      id: '1',
      name: 'Balance Inquiry Agent',
      status: 'live',
      category: 'Banking',
      callsToday: 45,
      avgDuration: 52,
      satisfaction: 4.6,
      description: 'Help customers check account balances instantly.',
    },
    {
      id: '2',
      name: 'Payment Collection Agent',
      status: 'live',
      category: 'Banking',
      callsToday: 28,
      avgDuration: 78,
      satisfaction: 4.3,
      description: 'Automated payment reminders and collection.',
    },
    {
      id: '3',
      name: 'Loan Status Agent',
      status: 'testing',
      category: 'Banking',
      callsToday: 12,
      avgDuration: 65,
      satisfaction: 4.5,
      description: 'Check loan application status and eligibility.',
    },
  ],
  liveCalls: [
    {
      id: '1',
      phone: '+91-98765-XXXXX',
      duration: 42,
      agentName: 'Balance Inquiry Agent',
      intent: 'Balance check',
      sentiment: 'positive',
      language: 'English',
    },
    {
      id: '2',
      phone: '+91-93456-XXXXX',
      duration: 78,
      agentName: 'Loan Status Agent',
      intent: 'Application status',
      sentiment: 'neutral',
      language: 'Hindi',
    },
  ],
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
