// User
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Campaign
export interface Campaign {
  id: number;
  userId: number;
  name: string;
  subject: string;
  templateId: number;
  contactListId: number;
  totalRecipients: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  scheduledFor: string | null;
  sentAt: string | null;
  openRate: number;
  clickRate: number;
  template?: Template;
  contactList?: ContactList;
  createdAt: string;
  updatedAt: string;
}

// Template
export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  subject: string;
  content: string;
  thumbnail?: string;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// Contact
export interface Contact {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  company?: string;
  metadata?: Record<string, any>;
  lastEngagement?: string;
  createdAt: string;
  updatedAt: string;
}

// Contact List
export interface ContactList {
  id: number;
  name: string;
  description?: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

// Campaign Statistics
export interface CampaignStat {
  id: number;
  campaignId: number;
  contactId: number;
  contact?: Contact;
  sent: boolean;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalCampaigns: number;
  activeSubscribers: number;
  totalTemplates: number;
  deliveredEmails: number;
  recentCampaigns: {
    id: number;
    name: string;
    status: string;
    sentAt: string | null;
    openRate: number;
  }[];
}

// Campaign Performance Statistics
export interface CampaignPerformanceStats {
  campaigns: {
    id: number;
    name: string;
    sentAt: string;
    totalRecipients: number;
    openRate: number;
    clickRate: number;
  }[];
  overall: {
    totalSent: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
}

// Contact Growth Statistics
export interface ContactGrowthStats {
  growth: {
    month: string;
    count: number;
  }[];
  status: {
    status: string;
    count: number;
  }[];
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

export interface TemplatePreview {
  subject: string;
  content: string;
}

export interface TemplateResponse {
  success: boolean;
  template: Template;
  message?: string;
}

export interface TemplatesResponse {
  success: boolean;
  templates: Template[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
  };
} 