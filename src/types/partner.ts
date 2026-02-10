export interface Partner {
  id: string;
  name: string;
  region: string;
  cooperationMode: 'direct_commission' | 'resale_discount';
  status: 'active' | 'observing' | 'paused';
  startDate: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  techCapability: number;
  customerCoverage: number;
  historicalRating: number;
  profitShareRatio: number;
  customerCount: number;
  opportunityCount: number;
  conversionRate: number;
  totalAmount: number;
  createdAt: string;
}
