-- 渠道关联关系表（单独执行）
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
