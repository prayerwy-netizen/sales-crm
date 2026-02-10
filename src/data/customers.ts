import type { Customer, Stakeholder } from '@/types/customer';

export const mockCustomers: Customer[] = [
  { id: 'cust-001', name: '华电煤业集团', mineType: 'coal', group: '中国华电集团', region: '北京', tier: 'top30', category: 'opportunity', annualCapacity: '5000万吨', contactPhone: '010-8888xxxx', opportunityCount: 2, lastContactDate: '2026-02-05', partnerId: 'part-001', partnerName: '中科智联科技', createdAt: '2025-06-15' },
  { id: 'cust-002', name: '晋能控股集团', mineType: 'coal', group: '晋能控股', region: '山西', tier: 'top30', category: 'stable', annualCapacity: '8000万吨', opportunityCount: 1, lastContactDate: '2026-02-03', createdAt: '2025-03-20' },
  { id: 'cust-003', name: '国家能源集团', mineType: 'coal', group: '国家能源', region: '北京', tier: 'top30', category: 'new', annualCapacity: '6亿吨', opportunityCount: 1, lastContactDate: '2026-02-01', partnerId: 'part-002', partnerName: '华信数智', createdAt: '2026-01-08' },
  { id: 'cust-004', name: '山东能源集团', mineType: 'coal', group: '山东能源', region: '山东', tier: 'top30', category: 'stable', annualCapacity: '1.5亿吨', opportunityCount: 1, lastContactDate: '2026-01-28', partnerId: 'part-003', partnerName: '鲁信科技', createdAt: '2025-08-10' },
  { id: 'cust-005', name: '陕西煤业化工集团', mineType: 'coal', group: '陕煤集团', region: '陕西', tier: 'top30', category: 'opportunity', annualCapacity: '2亿吨', opportunityCount: 1, lastContactDate: '2026-02-06', createdAt: '2025-10-05' },
  { id: 'cust-006', name: '中煤能源集团', mineType: 'coal', group: '中煤能源', region: '北京', tier: 'top30', category: 'new', annualCapacity: '1亿吨', opportunityCount: 1, lastContactDate: '2026-02-07', partnerId: 'part-001', partnerName: '中科智联科技', createdAt: '2026-02-01' },
  { id: 'cust-007', name: '淮北矿业集团', mineType: 'coal', region: '安徽', tier: 'benchmark', category: 'new', annualCapacity: '3000万吨', opportunityCount: 1, lastContactDate: '2026-02-04', partnerId: 'part-004', partnerName: '皖能数科', createdAt: '2026-01-25' },
  { id: 'cust-008', name: '兖矿能源集团', mineType: 'coal', group: '山东能源', region: '山东', tier: 'top30', category: 'opportunity', annualCapacity: '1亿吨', opportunityCount: 1, lastContactDate: '2026-01-15', createdAt: '2025-12-20' },
];

export const mockStakeholders: Stakeholder[] = [
  { id: 'sh-001', customerId: 'cust-001', name: '王处长', position: '安全部处长', role: 'key_buyer', influence: 8, relationshipStrength: 2, meetBusinessNeeds: true, socialStyle: '分析型', coreNeeds: '降低安全事故率', strategy: '定期技术交流', phone: '138xxxx0001' },
  { id: 'sh-002', customerId: 'cust-001', name: '李副总', position: '集团副总裁', role: 'decision_maker', influence: 10, relationshipStrength: 0, meetBusinessNeeds: false, socialStyle: '驱动型', coreNeeds: '数字化转型业绩', strategy: '安排高层拜访', phone: '139xxxx0002' },
  { id: 'sh-003', customerId: 'cust-001', name: '赵工', position: '信息中心主任', role: 'influencer', influence: 6, relationshipStrength: 1, meetBusinessNeeds: true, socialStyle: '友善型', coreNeeds: '系统集成便利性', phone: '137xxxx0003' },
];
