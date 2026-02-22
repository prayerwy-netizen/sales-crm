-- ============================================
-- Sales CRM 完整数据库表结构
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 1. 客户表
CREATE TABLE IF NOT EXISTS sales_crm_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mine_type TEXT NOT NULL DEFAULT 'coal',
  "group" TEXT,
  region TEXT NOT NULL,
  tier TEXT NOT NULL,
  category TEXT NOT NULL,
  annual_capacity TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  partner_id TEXT,
  partner_name TEXT,
  opportunity_count INTEGER DEFAULT 0,
  last_contact_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 干系人表
CREATE TABLE IF NOT EXISTS sales_crm_stakeholders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES sales_crm_customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  role TEXT NOT NULL,
  influence INTEGER DEFAULT 0,
  relationship_strength INTEGER DEFAULT 0,
  meet_business_needs BOOLEAN DEFAULT false,
  social_style TEXT,
  core_needs TEXT,
  strategy TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 合作伙伴表
CREATE TABLE IF NOT EXISTS sales_crm_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  cooperation_mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  tech_capability INTEGER DEFAULT 0,
  customer_coverage INTEGER DEFAULT 0,
  historical_rating INTEGER DEFAULT 0,
  profit_share_ratio NUMERIC DEFAULT 0,
  customer_count INTEGER DEFAULT 0,
  opportunity_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 商机表
CREATE TABLE IF NOT EXISTS sales_crm_opportunities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  customer_id TEXT REFERENCES sales_crm_customers(id),
  customer_name TEXT,
  partner_id TEXT REFERENCES sales_crm_partners(id),
  partner_name TEXT,
  product_line TEXT NOT NULL,
  sales_path TEXT NOT NULL,
  expected_amount NUMERIC DEFAULT 0,
  expected_close_date TEXT,
  competition_mode TEXT DEFAULT 'competitive',
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_id TEXT,
  owner_name TEXT,
  owner_avatar TEXT,
  win_rate NUMERIC DEFAULT 0,
  ai_risk TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. 沟通记录表
CREATE TABLE IF NOT EXISTS sales_crm_communications (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  opportunity_id TEXT REFERENCES sales_crm_opportunities(id),
  method TEXT NOT NULL,
  content TEXT,
  participants TEXT[] DEFAULT '{}',
  next_follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT
);

-- 6. 产品资料库表
CREATE TABLE IF NOT EXISTS sales_crm_resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 启用 RLS 并设置开放策略（开发阶段）
-- ============================================

ALTER TABLE sales_crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all" ON sales_crm_customers;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_stakeholders;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_partners;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_opportunities;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_communications;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_resources;

CREATE POLICY "Allow all" ON sales_crm_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_stakeholders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_opportunities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_communications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_resources FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 创建索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stakeholders_customer ON sales_crm_stakeholders(customer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_customer ON sales_crm_opportunities(customer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_partner ON sales_crm_opportunities(partner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON sales_crm_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_communications_entity ON sales_crm_communications(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_communications_opportunity ON sales_crm_communications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON sales_crm_resources(type);

-- ============================================
-- 基础客户数据库（导入自客户信息Excel）
-- ============================================

-- 7. 基础客户表（客户主数据）
CREATE TABLE IF NOT EXISTS sales_crm_base_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_representative TEXT,
  social_credit_code TEXT,
  province TEXT,
  city TEXT,
  county TEXT,
  business_type TEXT,
  customer_type TEXT,
  detail_address TEXT,
  customer_grade TEXT,
  credit_score INTEGER,
  actual_controller TEXT,
  second_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. 基础联系人表
CREATE TABLE IF NOT EXISTS sales_crm_base_contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES sales_crm_base_customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone1 TEXT,
  phone2 TEXT,
  position TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE sales_crm_base_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_crm_base_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_base_customers;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_base_contacts;
CREATE POLICY "Allow all" ON sales_crm_base_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON sales_crm_base_contacts FOR ALL USING (true) WITH CHECK (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_base_customers_province ON sales_crm_base_customers(province);
CREATE INDEX IF NOT EXISTS idx_base_customers_business_type ON sales_crm_base_customers(business_type);
CREATE INDEX IF NOT EXISTS idx_base_customers_customer_type ON sales_crm_base_customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_base_customers_grade ON sales_crm_base_customers(customer_grade);
CREATE INDEX IF NOT EXISTS idx_base_customers_controller ON sales_crm_base_customers(actual_controller);
CREATE INDEX IF NOT EXISTS idx_base_customers_name ON sales_crm_base_customers(name);
CREATE INDEX IF NOT EXISTS idx_base_contacts_customer ON sales_crm_base_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_base_contacts_phone ON sales_crm_base_contacts(phone1);

-- 9. 渠道关联关系表（经销商/总集成商 ↔ 终端客户）
CREATE TABLE IF NOT EXISTS sales_crm_base_relations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  dealer_id TEXT NOT NULL REFERENCES sales_crm_base_customers(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES sales_crm_base_customers(id) ON DELETE CASCADE,
  shared_contact_name TEXT,
  shared_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dealer_id, customer_id)
);

ALTER TABLE sales_crm_base_relations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON sales_crm_base_relations;
CREATE POLICY "Allow all" ON sales_crm_base_relations FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_base_relations_dealer ON sales_crm_base_relations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_base_relations_customer ON sales_crm_base_relations(customer_id);
