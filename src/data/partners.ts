import type { Partner } from '@/types/partner';

export const mockPartners: Partner[] = [
  { id: 'part-001', name: '中科智联科技', region: '北京/华北', cooperationMode: 'direct_commission', status: 'active', startDate: '2025-03-01', contactName: '张总', contactPhone: '136xxxx1001', techCapability: 8, customerCoverage: 9, historicalRating: 8.5, profitShareRatio: 0.3, customerCount: 3, opportunityCount: 4, conversionRate: 0.65, totalAmount: 40000000, createdAt: '2025-03-01' },
  { id: 'part-002', name: '华信数智', region: '北京/华北', cooperationMode: 'resale_discount', status: 'active', startDate: '2025-06-15', contactName: '刘总', contactPhone: '138xxxx1002', techCapability: 7, customerCoverage: 8, historicalRating: 7.5, profitShareRatio: 0.3, customerCount: 2, opportunityCount: 2, conversionRate: 0.50, totalAmount: 12000000, createdAt: '2025-06-15' },
  { id: 'part-003', name: '鲁信科技', region: '山东', cooperationMode: 'resale_discount', status: 'active', startDate: '2025-08-01', contactName: '陈总', contactPhone: '139xxxx1003', techCapability: 6, customerCoverage: 7, historicalRating: 7.0, profitShareRatio: 0.3, customerCount: 2, opportunityCount: 2, conversionRate: 0.55, totalAmount: 15000000, createdAt: '2025-08-01' },
  { id: 'part-004', name: '皖能数科', region: '安徽', cooperationMode: 'direct_commission', status: 'observing', startDate: '2025-12-01', contactName: '吴总', contactPhone: '137xxxx1004', techCapability: 5, customerCoverage: 5, historicalRating: 6.0, profitShareRatio: 0.3, customerCount: 1, opportunityCount: 1, conversionRate: 0.30, totalAmount: 450000, createdAt: '2025-12-01' },
];
