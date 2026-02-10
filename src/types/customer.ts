export interface Customer {
  id: string;
  name: string;
  mineType: 'coal' | 'metal' | 'nonmetal';
  group?: string;
  region: string;
  tier: 'top30' | 'benchmark' | 'mid';
  category: 'stable' | 'opportunity' | 'new';
  annualCapacity?: string;
  contactPhone?: string;
  contactEmail?: string;
  partnerId?: string;
  partnerName?: string;
  opportunityCount: number;
  lastContactDate?: string;
  createdAt: string;
}

export interface Stakeholder {
  id: string;
  customerId: string;
  name: string;
  position: string;
  role: 'decision_maker' | 'key_buyer' | 'influencer' | 'internal_coach' | 'advisor' | 'partner';
  influence: number;
  relationshipStrength: number; // -3 to +3
  meetBusinessNeeds: boolean;
  socialStyle?: string;
  coreNeeds?: string;
  strategy?: string;
  phone?: string;
  email?: string;
}

export const STAKEHOLDER_ROLES = {
  decision_maker: '关键决策人',
  key_buyer: '关键买家',
  influencer: '影响人',
  internal_coach: '内部牵线人',
  advisor: '建议人',
  partner: '合作伙伴',
} as const;
