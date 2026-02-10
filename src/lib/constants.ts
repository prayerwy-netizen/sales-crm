export const STAGES = [
  { key: 'lead', label: '寻找线索', color: '#3B82F6' },
  { key: 'qualified', label: '确认商机', color: '#60A5FA' },
  { key: 'presales', label: '售前支持', color: '#F59E0B' },
  { key: 'bidding', label: '投标报价', color: '#F97316' },
  { key: 'contract', label: '合同签订', color: '#22C55E' },
] as const;

export type StageKey = (typeof STAGES)[number]['key'];

export const DIMENSIONS = [
  { key: 'dim1', label: '附1-客户购买意愿', stages: ['lead', 'qualified', 'presales', 'bidding'] },
  { key: 'dim2', label: '附2-客户关系', stages: ['lead', 'qualified', 'presales', 'bidding'] },
  { key: 'dim3', label: '附3-需求分析', stages: ['qualified', 'presales', 'bidding'] },
  { key: 'dim4', label: '附4-竞争情况', stages: ['qualified', 'presales', 'bidding'] },
  { key: 'dim5', label: '附5-解决方案', stages: ['presales', 'bidding'] },
  { key: 'dim6', label: '附6-价值主张', stages: ['presales', 'bidding'] },
  { key: 'dim7', label: '附7-交付团队/技能', stages: ['presales', 'bidding'] },
  { key: 'dim8', label: '附8-交付能力', stages: ['bidding'] },
  { key: 'dim9', label: '附9-报价策略', stages: ['bidding'] },
  { key: 'dim10', label: '附10-利润率', stages: ['bidding'] },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]['key'];

export const OPP_STATUSES = [
  { key: 'active', label: '进行中', color: 'blue' },
  { key: 'won', label: '赢单', color: 'green' },
  { key: 'lost', label: '输单', color: 'red' },
  { key: 'suspended', label: '搁置', color: 'gray' },
] as const;

export const COMPETITION_MODES = [
  { key: 'exclusive', label: '独家' },
  { key: 'competitive', label: '竞争' },
  { key: 'replacement', label: '替换' },
] as const;

export const PRODUCT_LINES = [
  { key: 'full_solution', label: '全案建设' },
  { key: 'saas', label: 'SaaS订阅' },
  { key: 'maas', label: 'MaaS服务' },
] as const;

export const SALES_PATHS = [
  { key: 'direct_commission', label: '直签佣金制' },
  { key: 'resale_discount', label: '转售折扣制' },
] as const;

export const CUSTOMER_TIERS = [
  { key: 'top30', label: '头部集团客户(Top30)', color: 'red' },
  { key: 'benchmark', label: '标杆矿井', color: 'orange' },
  { key: 'mid', label: '腰部矿井', color: 'blue' },
] as const;

export const CUSTOMER_CATEGORIES = [
  { key: 'stable', label: '稳定客户', score: 10 },
  { key: 'opportunity', label: '机会客户', score: 8 },
  { key: 'new', label: '全新客户', score: 6 },
] as const;

export const PARTNER_STATUSES = [
  { key: 'active', label: '活跃', color: 'green' },
  { key: 'observing', label: '观察', color: 'yellow' },
  { key: 'paused', label: '暂停', color: 'gray' },
] as const;

export const MINE_TYPES = [
  { key: 'coal', label: '煤矿' },
  { key: 'metal', label: '金属矿' },
  { key: 'nonmetal', label: '非金属矿' },
] as const;

export const COMM_METHODS = [
  { key: 'visit', label: '拜访' },
  { key: 'phone', label: '电话' },
  { key: 'wechat', label: '微信' },
  { key: 'email', label: '邮件' },
  { key: 'feishu', label: '飞书' },
] as const;
