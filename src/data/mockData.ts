export const templates = [
  {
    id: '1',
    name: 'Balance Inquiry Agent',
    icon: '💰',
    category: 'Banking',
    description: 'Help customers check account balances instantly. Handles authentication, balance queries, and transaction history.',
    features: ['Multi-language support', 'Automated authentication', 'CRM integration ready', 'Compliance built-in'],
    integrations: ['Finacle', 'TCS BaNCS'],
    status: 'Production Ready',
  },
  {
    id: '2',
    name: 'Payment Collection Agent',
    icon: '💳',
    category: 'Banking',
    description: 'Automated payment reminders and collection. Empathetic approach with flexible payment plans.',
    features: ['Payment scheduling', 'EMI calculator', 'Multi-channel follow-up', 'Payment gateway integration'],
    integrations: ['Finacle', 'Razorpay', 'Twilio'],
    status: 'Production Ready',
  },
  {
    id: '3',
    name: 'Loan Status Agent',
    icon: '🏠',
    category: 'Banking',
    description: 'Check loan application status, eligibility, and required documents. Guides customers through the process.',
    features: ['Application tracking', 'Document verification', 'Eligibility check', 'EMI calculation'],
    integrations: ['Finacle', 'Document Management'],
    status: 'Production Ready',
  },
  {
    id: '4',
    name: 'Claims Status Agent',
    icon: '🛡️',
    category: 'Insurance',
    description: 'Help policyholders track claim status and upload documents. Empathetic handling of sensitive situations.',
    features: ['Claim tracking', 'Document upload', 'Status notifications', 'Escalation handling'],
    integrations: ['Guidewire', 'Duck Creek'],
    status: 'Production Ready',
  },
  {
    id: '5',
    name: 'Policy Renewal Agent',
    icon: '📋',
    category: 'Insurance',
    description: 'Proactive policy renewal reminders. Highlights benefits and processes renewals seamlessly.',
    features: ['Auto-reminders', 'Premium calculation', 'Coverage comparison', 'Instant renewal'],
    integrations: ['Policy Management', 'Payment Gateway'],
    status: 'Production Ready',
  },
  {
    id: '6',
    name: 'KYC Verification Agent',
    icon: '🔍',
    category: 'Fintech',
    description: 'Guide customers through KYC verification. Collects Aadhaar, PAN, and address proof with clear instructions.',
    features: ['Aadhaar verification', 'PAN validation', 'Address proof', 'Video KYC'],
    integrations: ['Aadhaar API', 'DigiLocker'],
    status: 'Production Ready',
  },
];

export const callVolumeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  calls: Math.floor(Math.random() * 50) + 10,
}));

export const sentimentData = [
  { name: 'Positive', value: 65, color: '#10b981' },
  { name: 'Neutral', value: 28, color: '#f59e0b' },
  { name: 'Negative', value: 7, color: '#ef4444' },
];

export const languageData = [
  { language: 'English', calls: 520 },
  { language: 'Hindi', calls: 287 },
  { language: 'Tamil', calls: 32 },
  { language: 'Telugu', calls: 8 },
];

export const outcomeData = [
  { outcome: 'Resolved', percentage: 89 },
  { outcome: 'Escalated', percentage: 8 },
  { outcome: 'Abandoned', percentage: 3 },
];

export const recentConversations = [
  { id: '1', timestamp: '10:45 AM', phone: '+91-98765-XXXXX', agent: 'Balance Inquiry', duration: '0:52', outcome: 'Resolved', sentiment: '😊' },
  { id: '2', timestamp: '10:42 AM', phone: '+91-93456-XXXXX', agent: 'Loan Status', duration: '1:18', outcome: 'Resolved', sentiment: '😐' },
  { id: '3', timestamp: '10:38 AM', phone: '+91-87654-XXXXX', agent: 'Payment Collection', duration: '2:05', outcome: 'Escalated', sentiment: '😟' },
  { id: '4', timestamp: '10:35 AM', phone: '+91-76543-XXXXX', agent: 'Balance Inquiry', duration: '0:38', outcome: 'Resolved', sentiment: '😊' },
  { id: '5', timestamp: '10:30 AM', phone: '+91-65432-XXXXX', agent: 'Claims Status', duration: '1:42', outcome: 'Resolved', sentiment: '😊' },
];

export const connectors = [
  {
    id: '1',
    name: 'Finacle',
    vendor: 'Infosys',
    category: 'Core Banking',
    status: 'connected',
    tools: ['get_account_balance', 'get_transactions', 'check_loan_eligibility'],
  },
  {
    id: '2',
    name: 'Flexcube',
    vendor: 'Oracle',
    category: 'Core Banking',
    status: 'available',
    tools: ['account_inquiry', 'transaction_history'],
  },
  {
    id: '3',
    name: 'TCS BaNCS',
    vendor: 'TCS',
    category: 'Core Banking',
    status: 'available',
    tools: ['account_management', 'loan_processing'],
  },
  {
    id: '4',
    name: 'Salesforce',
    vendor: 'Salesforce',
    category: 'CRM',
    status: 'connected',
    tools: ['create_lead', 'update_contact', 'log_interaction'],
  },
  {
    id: '5',
    name: 'Twilio',
    vendor: 'Twilio',
    category: 'Communication',
    status: 'connected',
    tools: ['send_sms', 'send_whatsapp', 'make_call'],
  },
  {
    id: '6',
    name: 'Razorpay',
    vendor: 'Razorpay',
    category: 'Payment',
    status: 'available',
    tools: ['create_payment_link', 'check_payment_status'],
  },
];

export const activityLog = [
  { id: '1', message: 'Balance Inquiry Agent handled 45 calls', time: '2 hours ago', icon: '📞' },
  { id: '2', message: 'New template deployed: Payment Collection', time: '3 hours ago', icon: '🚀' },
  { id: '3', message: 'Agent performance improved by 8%', time: '5 hours ago', icon: '📈' },
  { id: '4', message: '100+ calls milestone reached', time: '1 day ago', icon: '🎉' },
];
