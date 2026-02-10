-- ============================================
-- Sales CRM 种子数据（Mock 数据导入）
-- 在建表 SQL 执行成功后执行本文件
-- ============================================

-- 合作伙伴（先插入，因为客户和商机会引用）
INSERT INTO sales_crm_partners (id, name, region, cooperation_mode, status, start_date, contact_name, contact_phone, tech_capability, customer_coverage, historical_rating, profit_share_ratio, customer_count, opportunity_count, conversion_rate, total_amount) VALUES
('part-001', '中科智联科技', '北京', 'direct_commission', 'active', '2024-03-15', '张明', '13800001111', 85, 70, 90, 0.15, 3, 4, 0.75, 4000),
('part-002', '华信数智', '北京', 'resale_discount', 'active', '2024-06-01', '刘洋', '13800002222', 78, 65, 82, 0.20, 2, 2, 0.60, 1200),
('part-003', '鲁信科技', '山东', 'resale_discount', 'active', '2024-01-10', '陈伟', '13800003333', 72, 80, 75, 0.18, 2, 2, 0.55, 1500),
('part-004', '皖能数科', '安徽', 'direct_commission', 'observing', '2025-01-20', '赵磊', '13800004444', 60, 40, 0, 0.12, 1, 1, 0, 45);

-- 客户
INSERT INTO sales_crm_customers (id, name, mine_type, "group", region, tier, category, annual_capacity, partner_id, partner_name, opportunity_count, last_contact_date, created_at) VALUES
('cust-001', '华电煤业集团', 'coal', '华电集团', '内蒙古', 'top30', 'opportunity', '5000万吨/年', 'part-001', '中科智联科技', 3, '2026-02-05', '2025-06-15T00:00:00Z'),
('cust-002', '晋能控股集团', 'coal', '晋能控股', '山西', 'top30', 'stable', '8000万吨/年', 'part-001', '中科智联科技', 2, '2026-01-20', '2025-03-10T00:00:00Z'),
('cust-003', '国家能源集团', 'coal', '国家能源', '北京', 'top30', 'new', '10000万吨/年', 'part-002', '华信数智', 1, '2026-02-01', '2025-09-01T00:00:00Z'),
('cust-004', '山东能源集团', 'coal', '山东能源', '山东', 'top30', 'stable', '6000万吨/年', 'part-003', '鲁信科技', 2, '2026-01-15', '2025-01-20T00:00:00Z'),
('cust-005', '陕西煤业化工集团', 'coal', '陕煤集团', '陕西', 'top30', 'opportunity', '7000万吨/年', 'part-001', '中科智联科技', 1, '2026-02-06', '2025-04-01T00:00:00Z'),
('cust-006', '中煤能源集团', 'coal', '中煤集团', '北京', 'top30', 'new', '4000万吨/年', NULL, NULL, 1, '2025-12-10', '2025-10-15T00:00:00Z'),
('cust-007', '淮北矿业集团', 'coal', '淮北矿业', '安徽', 'benchmark', 'new', '2000万吨/年', 'part-004', '皖能数科', 1, '2025-11-20', '2025-11-01T00:00:00Z'),
('cust-008', '兖矿能源集团', 'coal', '兖矿能源', '山东', 'top30', 'opportunity', '5500万吨/年', 'part-003', '鲁信科技', 1, '2026-01-28', '2025-05-20T00:00:00Z');

-- 商机
INSERT INTO sales_crm_opportunities (id, name, customer_id, customer_name, partner_id, partner_name, product_line, sales_path, expected_amount, expected_close_date, competition_mode, stage, status, owner_id, owner_name, win_rate, ai_risk, created_at, updated_at) VALUES
('opp-001', '华电煤业集团全案建设项目', 'cust-001', '华电煤业集团', 'part-001', '中科智联科技', 'full_solution', 'direct_commission', 1800, '2026-06-30', 'competitive', 'presales', 'active', 'user-001', '张伟', 0.65, '竞争对手报价可能更低', '2025-08-01T00:00:00Z', '2026-02-05T00:00:00Z'),
('opp-002', '晋能控股SaaS订阅项目', 'cust-002', '晋能控股集团', 'part-001', '中科智联科技', 'saas', 'direct_commission', 120, '2026-04-15', 'exclusive', 'bidding', 'active', 'user-001', '张伟', 0.82, NULL, '2025-09-15T00:00:00Z', '2026-01-20T00:00:00Z'),
('opp-003', '国家能源集团MaaS服务', 'cust-003', '国家能源集团', 'part-002', '华信数智', 'maas', 'resale_discount', 550, '2026-09-30', 'competitive', 'qualified', 'active', 'user-002', '李娜', 0.45, '客户决策周期长，需持续跟进', '2025-10-01T00:00:00Z', '2026-02-01T00:00:00Z'),
('opp-004', '山东能源全案建设二期', 'cust-004', '山东能源集团', 'part-003', '鲁信科技', 'full_solution', 'resale_discount', 850, '2026-07-31', 'replacement', 'presales', 'active', 'user-002', '李娜', 0.58, NULL, '2025-11-01T00:00:00Z', '2026-01-15T00:00:00Z'),
('opp-005', '陕煤集团视频识别SaaS', 'cust-005', '陕西煤业化工集团', 'part-001', '中科智联科技', 'saas', 'direct_commission', 80, '2026-03-15', 'exclusive', 'contract', 'active', 'user-001', '张伟', 0.92, NULL, '2025-07-01T00:00:00Z', '2026-02-06T00:00:00Z'),
('opp-006', '中煤集团智能体全案', 'cust-006', '中煤能源集团', NULL, NULL, 'full_solution', 'direct_commission', 2200, '2026-12-31', 'competitive', 'lead', 'active', 'user-003', '王磊', 0.30, '项目尚在早期，客户需求不明确', '2025-12-01T00:00:00Z', '2025-12-10T00:00:00Z'),
('opp-007', '淮北矿业SaaS试点', 'cust-007', '淮北矿业集团', 'part-004', '皖能数科', 'saas', 'direct_commission', 45, '2026-05-31', 'competitive', 'lead', 'active', 'user-003', '王磊', 0.35, NULL, '2025-11-15T00:00:00Z', '2025-11-20T00:00:00Z'),
('opp-008', '兖矿能源MaaS部署', 'cust-008', '兖矿能源集团', 'part-003', '鲁信科技', 'maas', 'resale_discount', 320, '2026-08-31', 'competitive', 'qualified', 'active', 'user-002', '李娜', 0.52, NULL, '2025-06-01T00:00:00Z', '2026-01-28T00:00:00Z');

-- 干系人
INSERT INTO sales_crm_stakeholders (id, customer_id, name, position, role, influence, relationship_strength, meet_business_needs, social_style, core_needs, strategy) VALUES
('sh-001', 'cust-001', '王处长', '安全生产处处长', 'key_buyer', 8, 2, true, 'driver', '提升矿山安全管理效率', '定期拜访，提供行业案例'),
('sh-002', 'cust-001', '李副总', '分管副总经理', 'decision_maker', 10, 0, false, 'analytical', '降本增效，数字化转型', '通过王处长引荐，准备高层汇报'),
('sh-003', 'cust-001', '赵工', '信息中心主任', 'influencer', 6, 1, true, 'amiable', '系统稳定性和易用性', '技术交流，邀请参观标杆项目');

-- 沟通记录
INSERT INTO sales_crm_communications (id, entity_type, entity_id, entity_name, opportunity_id, method, content, participants, next_follow_up, created_at, created_by) VALUES
('comm-001', 'customer', 'cust-001', '华电煤业集团', 'opp-001', 'visit', '拜访华电安全生产处，讨论全案建设方案。王处长对视频识别模块很感兴趣，要求下周提供详细技术方案。', ARRAY['张伟','王处长','赵工'], '2026-02-12', '2026-02-05T10:00:00Z', '张伟'),
('comm-002', 'partner', 'part-001', '中科智联科技', NULL, 'phone', '与中科智联张明沟通华电项目进展，确认技术支持资源到位。', ARRAY['张伟','张明'], '2026-02-10', '2026-02-03T14:30:00Z', '张伟'),
('comm-003', 'customer', 'cust-003', '国家能源集团', 'opp-003', 'feishu', '飞书会议讨论MaaS服务方案，客户对数据安全有顾虑，需要补充安全白皮书。', ARRAY['李娜','国能信息部张主任'], '2026-02-08', '2026-02-01T09:00:00Z', '李娜'),
('comm-004', 'customer', 'cust-005', '陕西煤业化工集团', 'opp-005', 'visit', '陕煤集团合同签署前最终确认，商务条款基本达成一致。', ARRAY['张伟','陕煤采购部李经理'], '2026-02-10', '2026-02-06T15:00:00Z', '张伟'),
('comm-005', 'customer', 'cust-008', '兖矿能源集团', 'opp-008', 'wechat', '微信沟通视频识别率问题，客户反馈夜间识别率偏低，需要优化算法。', ARRAY['李娜','兖矿技术部王工'], '2026-02-05', '2026-01-28T16:00:00Z', '李娜');
