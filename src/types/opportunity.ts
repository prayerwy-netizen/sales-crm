import type { StageKey, DimensionKey } from '@/lib/constants';

export interface Opportunity {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  partnerId?: string;
  partnerName?: string;
  productLine: 'full_solution' | 'saas' | 'maas';
  salesPath: 'direct_commission' | 'resale_discount';
  expectedAmount: number;
  expectedCloseDate: string;
  competitionMode: 'exclusive' | 'competitive' | 'replacement';
  stage: StageKey;
  status: 'active' | 'won' | 'lost' | 'suspended';
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  winRate: number;
  aiRisk?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DimensionScore {
  dimensionKey: DimensionKey;
  contentScore: number;
  selfScore: number;
  reviewScore: number;
}

export interface ActionPlan {
  id: string;
  opportunityId: string;
  dimensionKey?: DimensionKey;
  content: string;
  executor: string;
  plannedDate: string;
  measureResult?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CommunicationRecord {
  id: string;
  entityType: 'customer' | 'partner';
  entityId: string;
  entityName: string;
  opportunityId?: string;
  method: 'visit' | 'phone' | 'wechat' | 'email' | 'feishu';
  content: string;
  participants: string[];
  nextFollowUp?: string;
  createdAt: string;
  createdBy: string;
}
