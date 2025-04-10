import { 
  Home, 
  Users, 
  Heart, 
  Book, 
  MessageSquare, 
  Calendar,
  Settings, 
  Shield, 
  DollarSign, 
  Map, 
  LifeBuoy,
  Package, 
  FileText, 
  TrendingUp, 
  Award,
  Briefcase, 
  Activity, 
  Monitor, 
  Smile, 
  HelpCircle,
  Clipboard 
} from 'lucide-react';

export interface AppModule {
  id: string;
  title: string;
  description: string;
  icon: any; // Changed from IconType to any to avoid type dependency issues
  path: string;
  features: AppFeature[];
  webTools?: WebTool[];
  resources?: Resource[];
}

export interface AppFeature {
  id: string;
  title: string;
  description: string;
  path: string;
  features?: AppFeature[];
  permissions?: string[];
  beta?: boolean;
}

export interface WebTool {
  id: string;
  title: string;
  description: string;
  path: string;
  requiresAuth: boolean;
  pricing?: {
    type: 'free' | 'premium' | 'enterprise';
    price?: number;
  };
}

export interface Resource {
  id: string;
  title: string;
  type: 'guide' | 'article' | 'video' | 'tool';
  path: string;
  tags: string[];
}

export const APP_MODULES: AppModule[] = [
  {
    id: 'dashboard',
    title: 'Care Dashboard',
    description: 'Your personalized care command center',
    icon: Home,
    path: '/dashboard',
    features: [
      {
        id: 'overview',
        title: 'Care Overview',
        description: 'Quick access to important care information and tasks',
        path: '/dashboard/overview',
      },
      {
        id: 'insights',
        title: 'Care Insights',
        description: 'Analytics and trends from your care journey',
        path: '/dashboard/insights',
      },
      {
        id: 'notifications',
        title: 'Care Alerts',
        description: 'Important updates and reminders',
        path: '/dashboard/notifications',
        beta: true,
      },
    ],
  },
  {
    id: 'care-network',
    title: 'Care Network',
    description: 'Connect with care providers and support network',
    icon: Users,
    path: '/care-network',
    features: [
      {
        id: 'caregivers',
        title: 'Caregivers',
        description: 'Manage your caregiving team',
        path: '/care-network/caregivers',
      },
      {
        id: 'jobs',
        title: 'Caregiver Jobs',
        description: 'Post and manage caregiver positions',
        path: '/care-network/jobs',
      },
      {
        id: 'facilities',
        title: 'Care Facilities',
        description: 'Find and manage care facility relationships',
        path: '/care-network/facilities',
      },
      {
        id: 'groups',
        title: 'Care Groups',
        description: 'Join and manage care support groups',
        path: '/care-network/groups',
      },
    ],
  },
  {
    id: 'care-management',
    title: 'Care Management',
    description: 'Comprehensive care planning and tracking',
    icon: Heart,
    path: '/care-management',
    features: [
      {
        id: 'monitoring',
        title: 'Health Monitoring',
        description: 'Track health metrics and vital signs',
        path: '/care-management/monitoring',
      },
      {
        id: 'medications',
        title: 'Medications',
        description: 'Manage medications and schedules',
        path: '/care-management/medications',
      },
      {
        id: 'appointments',
        title: 'Appointments',
        description: 'Schedule and track medical appointments',
        path: '/care-management/appointments',
      },
      {
        id: 'care-plan',
        title: 'Care Plans',
        description: 'Create and manage care plans',
        path: '/care-management/care-plan',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support Services',
    description: 'Access care resources and support',
    icon: LifeBuoy,
    path: '/support',
    features: [
      {
        id: 'mental-health',
        title: 'Mental Health',
        description: 'Mental health resources and support',
        path: '/support/mental-health',
      },
      {
        id: 'guides',
        title: 'Care Guides',
        description: 'Educational resources and best practices',
        path: '/support/guides',
      },
      {
        id: 'community',
        title: 'Community',
        description: 'Connect with other caregivers',
        path: '/support/community',
      },
      {
        id: 'training',
        title: 'Training',
        description: 'Caregiver training and certification',
        path: '/support/training',
        beta: true,
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Management',
    description: 'Manage care expenses and insurance',
    icon: DollarSign,
    path: '/financial',
    features: [
      {
        id: 'insurance',
        title: 'Insurance',
        description: 'Insurance coverage and claims',
        path: '/financial/insurance',
        features: [
          {
            id: 'coverage',
            title: 'Coverage',
            description: 'View and manage insurance coverage',
            path: '/financial/insurance/coverage',
          },
          {
            id: 'claims',
            title: 'Claims',
            description: 'Submit and track insurance claims',
            path: '/financial/insurance/claims',
          },
          {
            id: 'network',
            title: 'Provider Network',
            description: 'Find in-network providers',
            path: '/financial/insurance/network',
          },
          {
            id: 'documents',
            title: 'Documents',
            description: 'Insurance documents and forms',
            path: '/financial/insurance/documents',
          },
        ],
      },
      {
        id: 'expenses',
        title: 'Expenses',
        description: 'Track and manage care expenses',
        path: '/financial/expenses',
      },
      {
        id: 'billing',
        title: 'Billing & Payments',
        description: 'Manage payments and billing history',
        path: '/financial/billing',
      },
    ],
  },
  {
    id: 'marketplace',
    title: 'Care Marketplace',
    description: 'Shop for care products and services',
    icon: Package,
    path: '/marketplace',
    features: [
      {
        id: 'essentials',
        title: 'Care Essentials',
        description: 'Essential care products',
        path: '/marketplace/essentials',
      },
      {
        id: 'services',
        title: 'Care Services',
        description: 'Professional care services',
        path: '/marketplace/services',
      },
      {
        id: 'equipment',
        title: 'Medical Equipment',
        description: 'Specialized medical equipment',
        path: '/marketplace/equipment',
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Stay connected with your care team',
    icon: MessageSquare,
    path: '/communication',
    features: [
      {
        id: 'messages',
        title: 'Messages',
        description: 'Secure messaging with care team',
        path: '/communication/messages',
      },
      {
        id: 'updates',
        title: 'Care Updates',
        description: 'Share and receive care updates',
        path: '/communication/updates',
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'Share and manage care documents',
        path: '/communication/documents',
      },
    ],
  },
];
