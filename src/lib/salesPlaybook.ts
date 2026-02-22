/**
 * 销售方法论剧本框架
 * 将15套销售方法论结构化，映射到10维度评估体系和5个商机阶段
 * 供AI模块（赢单建议/对话录入）调用
 */

import type { StageKey, DimensionKey } from './constants';

// ─── 类型定义 ───

export interface JudgmentRule {
  /** 当满足此条件时 */
  condition: string;
  /** 给出的判断 */
  assessment: string;
  /** 风险等级 */
  level: 'good' | 'warning' | 'danger';
}

export interface StageAction {
  stage: StageKey;
  actions: string[];
}

export interface SalesFormula {
  id: string;
  name: string;
  /** 核心公式 */
  formula: string;
  /** 一句话描述 */
  summary: string;
  /** 适用阶段 */
  stages: StageKey[];
  /** 关联维度 */
  dimensions: DimensionKey[];
  /** 判断规则：根据维度数据给出评估 */
  judgmentRules: JudgmentRule[];
  /** 各阶段行动建议 */
  stageActions: StageAction[];
  /** 风险信号 */
  riskSignals: string[];
}

export type PlaybookMap = Record<string, SalesFormula>;

// ─── 剧本数据 ───

export const SALES_PLAYBOOK: SalesFormula[] = [
  // 1. 信任公式
  {
    id: 'trust_formula',
    name: '信任公式',
    formula: 'Trust = (C专业度 × R可靠度 × I亲密度) / S自我导向',
    summary: '信任是成交的基础，自我导向越高信任越低',
    stages: ['lead', 'qualified', 'presales', 'bidding'],
    dimensions: ['dim2'],
    judgmentRules: [
      { condition: '客户关系评分低于3分', assessment: '信任基础薄弱，需优先建立专业度和可靠度', level: 'danger' },
      { condition: '多次承诺未兑现', assessment: '可靠度(R)受损，信任公式分子坍塌', level: 'danger' },
      { condition: '沟通以产品推销为主', assessment: '自我导向(S)过高，信任公式分母过大', level: 'warning' },
      { condition: '客户主动分享内部信息', assessment: '亲密度(I)良好，信任基础扎实', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '提升专业度(C)：见面前准备该客户行业的3个核心痛点，开场说"我研究了一下你们行业，发现XX问题很普遍，你们有没有遇到过？"',
        '降低自我导向(S)：前20分钟只问不讲，用"您目前最关注的是什么？"代替介绍产品',
      ]},
      { stage: 'qualified', actions: [
        '提升可靠度(R)：每次说"我回去查一下"后必须在24小时内回复，哪怕没结果也要说"还在跟进中"',
        '提升亲密度(I)：找到一个非工作共同点（孩子/老家/爱好），下次见面主动提起"上次你说的XX，后来怎么样了？"',
      ]},
      { stage: 'presales', actions: [
        '方案汇报时开头说"这份方案是根据您上次说的XX问题专门设计的"，而不是"我们公司有个产品"',
        '承诺响应时效：明确告诉客户"有任何问题，4小时内必回复"，然后严格执行',
      ]},
      { stage: 'bidding', actions: [
        '报价时说"我站在您的角度算了一下，这个投入对您意味着什么"，而不是"我们的价格是XX"',
        '主动说出方案的局限性："这个方案有一点需要提前说明……"，反而增加可信度',
      ]},
    ],
    riskSignals: ['客户只在工作场合见面，拒绝私下交流', '客户对你的承诺持怀疑态度', '客户不愿透露内部决策信息'],
  },

  // 2. TRUST阶段模型
  {
    id: 'trust_stage_model',
    name: 'TRUST阶段模型',
    formula: 'T恐惧 → R抵触 → U理解 → S接纳 → T信任',
    summary: '客户信任是分阶段递进的，不能跳级',
    stages: ['lead', 'qualified', 'presales', 'bidding'],
    dimensions: ['dim2'],
    judgmentRules: [
      { condition: '客户拒绝见面或不回消息', assessment: '处于T(恐惧)阶段，需降低接触压力', level: 'danger' },
      { condition: '客户见面但态度冷淡、质疑多', assessment: '处于R(抵触)阶段，需耐心展示专业价值', level: 'warning' },
      { condition: '客户开始主动提问和讨论', assessment: '进入U(理解)阶段，可深入挖掘需求', level: 'good' },
      { condition: '客户愿意引荐内部其他人', assessment: '达到S(接纳)或T(信任)阶段', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '判断阶段：客户不回消息=T恐惧，见面冷淡=R抵触。T阶段不要主动推销，先发一条有价值的行业资讯，说"看到这个想到你们，不知道有没有参考价值"',
        'R阶段破冰话术："我不是来卖东西的，就是想了解一下你们现在在这块是怎么做的，看看有没有我能帮上忙的地方"',
      ]},
      { stage: 'qualified', actions: [
        'R→U：用专业问题展示价值，例如"你们现在这个流程，有没有考虑过XX风险？我见过几个类似的客户踩过这个坑"',
        'U→S：建立个人连接，找到一件能帮客户解决的小事，做完后说"顺手帮你弄了，不用谢"',
      ]},
      { stage: 'presales', actions: [
        '让客户参与方案共创："这个方案我有两个思路，想听听您更倾向哪个方向，您比我更了解内部情况"',
      ]},
      { stage: 'bidding', actions: [
        '确认信任阶段："您觉得如果内部有人问起为什么选我们，您会怎么说？"——能流畅回答说明已达T阶段',
      ]},
    ],
    riskSignals: ['商机推进到presales但客户仍在R阶段', '客户关系阶段与商机阶段不匹配'],
  },

  // 3. 破冰公式
  {
    id: 'icebreaker',
    name: '破冰公式',
    formula: '接纳度 = (信你说的 + 信你公司 + 信你产品) × 逻辑顺序',
    summary: '先让客户信人，再信公司，最后信产品；田忌赛马策略扬长避短',
    stages: ['lead', 'qualified'],
    dimensions: ['dim1', 'dim2'],
    judgmentRules: [
      { condition: '首次拜访直接讲产品', assessment: '破冰顺序错误，客户尚未建立对人的信任', level: 'warning' },
      { condition: '客户对公司品牌有认知', assessment: '可适当前置公司信任，加速破冰', level: 'good' },
      { condition: '客户对行业方案有成见', assessment: '需用田忌赛马策略，避开劣势维度', level: 'warning' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '第一步信人（开场白）："我在这个行业跑了X年，见过很多客户在XX问题上吃亏，今天来主要想听听你们的情况，看看我的经验有没有参考价值"——先建立个人可信度，不提产品',
        '第二步信司（时机到了再说）：等客户问"你们公司是做什么的"时，用标杆案例回答："我们服务过XX集团，帮他们解决了XX问题，结果是……"',
        '第三步信品（最后）：只有客户主动问"你们产品怎么样"时才介绍，用"我们有个功能专门针对你刚才说的那个问题"来切入',
      ]},
      { stage: 'qualified', actions: [
        '田忌赛马：先问"你们在评估这类方案时最看重哪几点？"，然后把客户说的前两点对准我方强项重点展开，主动回避我方弱项',
      ]},
    ],
    riskSignals: ['销售急于展示产品PPT', '客户对公司完全没有认知', '客户有过不好的同类产品体验'],
  },

  // 4. 需求公式(挖需/SPIN)
  {
    id: 'need_formula',
    name: '需求公式',
    formula: '需求 = (现状 - 理想) × 痛苦系数',
    summary: '用SPIN提问法让客户自己算出需求；高层用四部曲：回顾过去→面向未来→寻找卡点→我是解药',
    stages: ['qualified', 'presales', 'bidding'],
    dimensions: ['dim3'],
    judgmentRules: [
      { condition: '客户痛点描述模糊或未确认', assessment: '需求公式的"现状"变量未锁定，需用S类问题确认事实', level: 'danger' },
      { condition: '客户承认问题但不紧迫', assessment: '痛苦系数低，需用I类问题放大后果', level: 'warning' },
      { condition: '客户主动描述理想状态', assessment: '需求公式完整，可进入方案阶段', level: 'good' },
      { condition: '面对高层只讲产品不问战略', assessment: '高层对话四部曲缺失，需从"回顾过去"开始', level: 'danger' },
    ],
    stageActions: [
      { stage: 'qualified', actions: [
        'S背景问题（锁定现状）：先问事实，例如"您目前这块业务是怎么运作的？负责的团队有多少人？"',
        'P难点问题（挖掘痛点）：例如"在这个过程中，哪个环节最让您头疼？上次出问题是什么情况？"',
        'I暗示问题（放大后果）：例如"如果这个问题持续下去，对您Q4的目标达成会有什么影响？领导那边怎么看这件事？"',
      ]},
      { stage: 'presales', actions: [
        'N效益问题（描绘理想）：例如"如果这个问题解决了，您觉得团队效率能提升多少？对您个人的考核有什么帮助？"',
        '高层对话四步走：①回顾过去："您在这个行业做了这么多年，当初最大的挑战是什么？"②面向未来："您今年最想在哪个方向有所突破？"③寻找卡点："目前最大的阻碍是什么？"④我是解药："我们有个客户遇到了类似情况，他们是这样解决的……"',
      ]},
      { stage: 'bidding', actions: [
        '量化痛苦系数：问"如果这个问题不解决，一年下来大概损失多少？"让客户自己算出数字',
        '确认三变量：现状是什么、理想是什么、差距有多大——三个都要客户亲口说出来',
      ]},
    ],
    riskSignals: ['客户说"我们暂时没什么需求"', '只有执行层认可需求，高层未确认', '痛点是销售总结的而非客户自己说的'],
  },

  // 5. 决策链五维分析法
  {
    id: 'decision_chain',
    name: '决策链五维分析',
    formula: '每个KP按5维度打分(-1~3)：马斯洛需求/变革态度/决策关注点/联系紧密度/对我方态度',
    summary: '把决策链上每个人量化分析，找出支持者、反对者和关键摇摆人',
    stages: ['qualified', 'presales', 'bidding'],
    dimensions: ['dim1', 'dim2'],
    judgmentRules: [
      { condition: '关键决策人对我方态度为负分', assessment: '存在关键反对者，需制定专项攻关策略', level: 'danger' },
      { condition: '决策链中有人未被识别或未接触', assessment: '决策链不完整，存在暗箱风险', level: 'warning' },
      { condition: '多数KP对我方态度为正且联系紧密', assessment: '决策链支持度良好', level: 'good' },
    ],
    stageActions: [
      { stage: 'qualified', actions: [
        '绘制决策链地图：问线人"这件事最终谁拍板？谁负责评估？谁负责用？谁管预算？"——四个角色必须全部找到',
        '五维打分话术：问"XX总对这类项目一般是什么态度？他上次做类似决策是怎么考虑的？"——通过侧面了解每个KP的变革态度和关注点',
      ]},
      { stage: 'presales', actions: [
        '攻关摇摆人：先问"您在这个项目里最担心的是什么？"，找到其马斯洛需求（安全感/被认可/晋升），然后针对性满足',
        '让支持者帮你说话："您觉得XX总那边，我们需要准备什么才能让他放心？能不能帮我引荐一下？"',
      ]},
      { stage: 'bidding', actions: [
        '确认最终决策人态度："如果明天就要决策，您觉得XX总会怎么看？"——提前暴露风险',
        '预防反对者翻盘：主动约反对者单独沟通，说"我听说您对XX有些顾虑，我专门来听一下，看看能不能解决"',
      ]},
    ],
    riskSignals: ['只接触了一个联系人，未覆盖决策链', '技术决策人支持但商务决策人未接触', '竞争对手与某KP关系更紧密'],
  },

  // 6. 信任银行
  {
    id: 'trust_bank',
    name: '信任银行',
    formula: '知己知彼 → 建立连接(十同法) → 积累信任 → 施加影响',
    summary: '信任像银行存款，先存后取；用"十同法"快速建立连接',
    stages: ['lead', 'qualified', 'presales', 'bidding'],
    dimensions: ['dim2'],
    judgmentRules: [
      { condition: '尚未找到与客户的共同点', assessment: '信任银行余额为零，需用十同法破局', level: 'warning' },
      { condition: '只存不取，关系停留在私交层面', assessment: '需适时将信任转化为商业影响力', level: 'warning' },
      { condition: '客户主动帮你推荐或站台', assessment: '信任银行余额充足，可施加影响', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '研究客户背景：见面前查LinkedIn/公众号/行业报道，找到3个共同点备用（同乡/同校/同爱好/同行业经历）',
        '十同法开场："我看你是XX地方人，我也在那边待过……"或"我看你之前在XX公司，我有个朋友也在那边……"——找到共同点后自然切入',
      ]},
      { stage: 'qualified', actions: [
        '持续存款（不求回报）：主动发送客户行业的有价值信息，说"看到这个报告想到你，不知道有没有用，发给你参考"——不附带任何商业诉求',
        '存款后不急取款：至少存3次款再提第一个商业请求，否则关系账户透支',
      ]},
      { stage: 'presales', actions: [
        '适度取款话术："我有个不情之请，能不能帮我引荐一下XX部门的负责人？就说是朋友，不用解释太多"',
      ]},
      { stage: 'bidding', actions: [
        '关键取款话术："我知道这个请求有点难，但我真的需要你帮我在XX总面前说一句话，就说你觉得我们方案靠谱就行"',
      ]},
    ],
    riskSignals: ['频繁请求客户帮忙但很少提供价值', '信任银行透支：客户开始回避你'],
  },

  // 7. 线人效应
  {
    id: 'insider_effect',
    name: '线人效应',
    formula: '找角落里的人 + 双重需求分析(组织需求+个人需求)',
    summary: '在客户内部发展信息提供者，分析其组织需求和个人需求双重驱动',
    stages: ['lead', 'qualified', 'presales'],
    dimensions: ['dim2', 'dim1'],
    judgmentRules: [
      { condition: '没有内部线人', assessment: '信息严重不对称，处于被动状态', level: 'danger' },
      { condition: '线人只提供表面信息', assessment: '线人信任度不够或层级太低', level: 'warning' },
      { condition: '线人主动提供竞品动态和内部决策信息', assessment: '线人效应发挥良好', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '找角落里的人：不要只盯着决策者，先找助理/专员/基层员工，说"我想了解一下你们日常工作流程，你最了解实际情况，能聊聊吗？"',
        '分析个人需求：聊天时问"你在这个岗位多久了？接下来有什么打算？"——判断其是否有晋升/被认可的需求，找到帮助他的切入点',
      ]},
      { stage: 'qualified', actions: [
        '通过线人摸底："你们内部对这类项目一般怎么评估？上次做类似采购是什么流程？竞争对手有没有来拜访过？"',
        '满足线人需求：帮线人准备一份他可以向上汇报的材料，让他在领导面前有表现机会',
      ]},
      { stage: 'presales', actions: [
        '让线人传递信息："能不能帮我把这个方案亮点提前跟XX总提一下？就说你觉得这个思路挺有意思的"',
      ]},
    ],
    riskSignals: ['线人突然不回消息', '线人提供的信息与实际不符', '过度依赖单一线人'],
  },

  // 8. 四顿饭理论
  {
    id: 'four_meals',
    name: '四顿饭理论',
    formula: '第1顿(单独约出)→第2顿(非工作日约出)→第3顿(领导来能约出)→第4顿(去家里吃)',
    summary: '用4级饭局测试客户关系深度，从泛泛之交到生死之交',
    stages: ['lead', 'qualified', 'presales', 'bidding'],
    dimensions: ['dim2'],
    judgmentRules: [
      { condition: '无法单独约出KP', assessment: '关系处于第0级，连入场券都没有', level: 'danger' },
      { condition: '能单独吃饭但仅限工作日', assessment: '关系第1级，仍是公事公办', level: 'warning' },
      { condition: '客户愿意非工作日见面', assessment: '关系第2级，已建立私交', level: 'good' },
      { condition: '客户愿意见你的领导或邀你去家里', assessment: '关系第3-4级，已成为铁杆盟友', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '约第1顿饭话术："我最近研究了一个你们行业的案例，有些想法想听听你的看法，找个时间吃个饭聊聊？就你一个人，不用带团队"',
        '如果对方推脱：降低门槛，改成"喝杯咖啡，半小时就够"，先把人约出来再说',
      ]},
      { stage: 'qualified', actions: [
        '约第2顿饭（非工作日）："周末有没有空？带家人一起，就当放松一下，我知道一个不错的地方"',
        '饭局上的核心问题："你在这个公司做了这么久，觉得现在最大的挑战是什么？"——引导说出个人真实想法',
      ]},
      { stage: 'presales', actions: [
        '约第3顿饭（带领导）："我们老板一直想认识你，他对你们行业很感兴趣，能不能安排一下？就当朋友聚聚"',
      ]},
      { stage: 'bidding', actions: [
        '第4顿饭信号：如果客户主动说"改天来我家吃饭"，立刻接住："好啊，什么时候方便？"——这是最高信任信号，此时可以直接问"我们这个项目你觉得胜算怎么样？"',
      ]},
    ],
    riskSignals: ['商机到了bidding阶段但关系还停留在第1顿', '客户只愿意多人聚餐不愿单独见面', '饭局上只聊天不聊实质内容'],
  },

  // 9. 推进关系/新木桶理论
  {
    id: 'relationship_barrel',
    name: '推进关系/新木桶理论',
    formula: '客户关系 = 竖板(多个KP覆盖) + 底板(关系深度) + 桥梁(内部推荐链)',
    summary: '先搭桥找到人，再造底板加深关系，再加竖板扩大覆盖；KP推进13招',
    stages: ['lead', 'qualified', 'presales', 'bidding'],
    dimensions: ['dim2'],
    judgmentRules: [
      { condition: '只接触1-2个联系人', assessment: '竖板不足，客户关系结构脆弱', level: 'danger' },
      { condition: '接触面广但关系都浅', assessment: '有竖板无底板，关键时刻没人帮你', level: 'warning' },
      { condition: '多KP覆盖且有深度关系', assessment: '木桶结构完整，抗风险能力强', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '搭桥话术：找到共同认识的人，说"我有个朋友认识你们XX总，能不能帮我引荐一下？就说是朋友介绍，不用解释太多"',
        '没有共同关系时：通过行业活动/协会/展会自然接触，第一句话说"我在XX场合见过你，一直想找机会聊聊"',
      ]},
      { stage: 'qualified', actions: [
        '造底板（13招之核心3招）：①帮小忙建立欠人情："我帮你整理了一份竞品对比，你看看有没有用"；②制造共同经历："我们一起去参观了XX标杆客户"；③建立私人连接："上次你说孩子要考XX，我帮你打听了一下……"',
      ]},
      { stage: 'presales', actions: [
        '加竖板：通过已建立关系的人引荐其他部门，说"能不能帮我引荐一下你们技术部的负责人？就说是你的朋友，我不会让你为难的"',
      ]},
      { stage: 'bidding', actions: [
        '检查木桶短板：列出决策链上所有人，找出"完全没接触过"的人，立刻想办法通过现有关系搭桥',
      ]},
    ],
    riskSignals: ['唯一联系人离职或调岗', '竞争对手的KP覆盖面比你广', '关键部门(如财务/法务)完全未接触'],
  },

  // 10. 快速获客公式
  {
    id: 'customer_acquisition',
    name: '快速获客公式',
    formula: '获客效率 = (内部挖掘 + 生态借力 + 广域搜索) / 无效扫街',
    summary: '三条获客路径优先级：先挖存量，再借生态，最后广域搜索',
    stages: ['lead'],
    dimensions: ['dim1'],
    judgmentRules: [
      { condition: '线索全靠陌拜和扫街', assessment: '获客效率极低，需开发内部挖掘和生态渠道', level: 'danger' },
      { condition: '有合作伙伴转介绍', assessment: '生态借力通道已打通', level: 'good' },
      { condition: '老客户有复购或转介绍', assessment: '内部挖掘效率最高', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '内部挖掘（优先）：整理现有客户名单，找出"买了A产品但没买B产品"的客户，打电话说"上次合作很顺利，我最近有个新方案想听听你的意见"',
        '生态借力：联系合作伙伴说"你们最近有没有客户在找XX类解决方案？我们可以互相转介绍，你推给我，我推给你"',
        '广域搜索（最后用）：看招标公告/行业展会，找到目标后第一句话说"我看到你们在招标XX项目，我们在这块有些经验，想来聊聊"',
      ]},
    ],
    riskSignals: ['线索来源单一', '过度依赖某一个渠道', '大量线索但转化率极低'],
  },

  // 11. 客户分级
  {
    id: 'customer_tiering',
    name: '客户分级',
    formula: '先分类(行业/规模) → 再分级(多指标加权) → 差异化资源配置',
    summary: '不同级别客户投入不同资源，头部客户重兵投入，腰部客户标准化服务',
    stages: ['lead', 'qualified'],
    dimensions: ['dim1'],
    judgmentRules: [
      { condition: '客户为头部集团(Top30)', assessment: '高优先级，需配置最强资源', level: 'good' },
      { condition: '客户为标杆矿井', assessment: '中高优先级，赢单后有标杆效应', level: 'good' },
      { condition: '客户级别低但投入资源多', assessment: '资源错配风险，需重新评估投入产出比', level: 'warning' },
    ],
    stageActions: [
      { stage: 'lead', actions: [
        '快速分级：见面前查企业规模/营收/行业地位，判断是Top30/标杆/腰部，决定投入多少时间',
        '分级标准问法："你们集团在行业里大概排第几？全国有多少个矿/工厂/站点？"——用规模判断潜在合同金额',
      ]},
      { stage: 'qualified', actions: [
        'Top30客户：立刻升级资源，安排公司高层拜访，说"我们CEO专门来拜访，他对你们行业很感兴趣"',
        '腰部客户：用标准化流程，说"我们有一套专门针对你们这类客户的快速上线方案，3个月就能见效"——不要过度定制',
      ]},
    ],
    riskSignals: ['所有客户一视同仁，无差异化策略', '在低价值客户上花费过多时间'],
  },

  // 12. 报价公式
  {
    id: 'pricing_formula',
    name: '报价公式',
    formula: '报价 = (量化收益 - 风险承诺) / 战略投入',
    summary: '报价单不是价格表而是投资回报书；顺序：现状→痛点→方案→投入→ROI→竞品对比',
    stages: ['presales', 'bidding'],
    dimensions: ['dim5', 'dim6', 'dim9'],
    judgmentRules: [
      { condition: '报价单以产品参数和价格开头', assessment: '推销式报价，触发客户防御机制', level: 'danger' },
      { condition: '未量化客户收益和ROI', assessment: '客户只能比价格，无法比价值', level: 'warning' },
      { condition: '报价包含ROI和回本周期', assessment: '顾问式报价，客户看到的是投资而非成本', level: 'good' },
    ],
    stageActions: [
      { stage: 'presales', actions: [
        '量化痛点损失：问"你们现在这个问题，一年大概造成多少损失？人工成本/效率损失/事故风险各算多少？"——让客户自己算出数字',
        '计算ROI：用客户自己说的损失数字，算"我们的方案投入XX万，第一年就能帮你省XX万，18个月回本"',
      ]},
      { stage: 'bidding', actions: [
        '报价顺序话术：先说"你们现在的情况是……（现状）"→"这导致了……（痛点）"→"我们的方案是……（解法）"→最后才说"投入是XX万"→"按你们刚才说的损失，第一年ROI是XX%"',
        '竞品对比话术："我知道XX竞品报价比我们低30%，但你算一下：他们没有XX功能，你们需要额外投入XX人力，加起来其实比我们贵"',
      ]},
    ],
    riskSignals: ['客户说"太贵了"', '客户拿竞品低价压你', '报价后客户只讨论价格不讨论方案'],
  },

  // 13. 消除疑虑公式
  {
    id: 'objection_handling',
    name: '消除疑虑公式',
    formula: '成交安全值 = (信任资产 × 方案确定性) / 客户心理负担',
    summary: '客户不签约是因为心理负担大于安全感；四类风险：实施/个人/政治/战略',
    stages: ['bidding'],
    dimensions: ['dim1', 'dim5'],
    judgmentRules: [
      { condition: '客户反复要求修改方案细节', assessment: '方案确定性不足，实施风险担忧', level: 'warning' },
      { condition: '客户担心"选错了怎么办"', assessment: '个人风险担忧，需提供安全网', level: 'warning' },
      { condition: '客户说"我再想想"迟迟不决策', assessment: '心理负担大于安全值，需逐一排除四类风险', level: 'danger' },
      { condition: '客户主动讨论实施计划和时间表', assessment: '安全值已超过心理负担，接近成交', level: 'good' },
    ],
    stageActions: [
      { stage: 'bidding', actions: [
        '排查实施风险："我们来聊聊落地的事，你们内部谁负责对接？IT部门需要配合什么？上线期间业务会不会受影响？"——主动暴露风险再解决，比客户自己想到要好',
        '消除个人风险："我理解你要对这个决策负责，所以我们可以先做一个小范围POC验证，成了再全面推，这样你的风险最小"',
        '消除政治风险："如果内部有人对这个方案有顾虑，能不能安排我直接跟他聊一次？我来解释，不用你夹在中间"',
        '降低心理负担："我们可以在合同里加一条：如果3个月内达不到XX效果，退还XX%费用"——用承诺兜底换签约',
      ]},
    ],
    riskSignals: ['客户在最后阶段突然沉默', '客户要求延长决策时间', '客户内部出现反对声音'],
  },

  // 14. 客户满意公式
  {
    id: 'customer_satisfaction',
    name: '客户满意公式',
    formula: '满意度 = 客户体验 - 客户预期',
    summary: '管理预期比提升体验更重要；预期管理三步法：设底线→给惊喜→控节奏',
    stages: ['presales', 'bidding', 'contract'],
    dimensions: ['dim5', 'dim8'],
    judgmentRules: [
      { condition: '过度承诺功能或交付时间', assessment: '预期被拉高，交付后必然不满意', level: 'danger' },
      { condition: '客户对交付成果有明确量化标准', assessment: '预期可控，需确保体验≥预期', level: 'good' },
      { condition: '客户期望模糊但很高', assessment: '需主动设定底线管理预期', level: 'warning' },
    ],
    stageActions: [
      { stage: 'presales', actions: [
        '设底线话术："我需要提前说清楚，这个方案能做到XX，但做不到XX——我宁愿现在说清楚，也不要后面让你失望"',
        '分阶段交付：把项目拆成3个里程碑，每个里程碑前说"这个阶段结束你会看到XX，我们对齐一下预期"',
      ]},
      { stage: 'bidding', actions: [
        '合同中明确验收标准："验收条件我们写具体一点，比如系统响应时间<3秒、数据准确率>99%，这样双方都有依据"',
        '预留惊喜空间：承诺80%，内部目标120%，交付时超出预期，客户自然满意',
      ]},
      { stage: 'contract', actions: [
        '主动汇报进度：每周发一条进度更新，哪怕没有大进展也说"本周完成了XX，下周计划XX"——消除信息不对称',
        '制造惊喜节点：在关键里程碑提前完成时，主动告知："原计划下周交付，我们提前完成了，你看一下"',
      ]},
    ],
    riskSignals: ['销售承诺与交付团队能力不匹配', '客户预期远超方案实际能力', '竞品过度承诺拉高了行业预期'],
  },

  // 15. 回款公式
  {
    id: 'collection_formula',
    name: '回款公式',
    formula: 'DSO思维 + 双超会议 + 红绿灯管理 + 5条回款铁律',
    summary: '回款从签约前就要设计；DSO(应收账款周转天数)是核心指标',
    stages: ['bidding', 'contract'],
    dimensions: ['dim9', 'dim10'],
    judgmentRules: [
      { condition: '合同无明确付款节点和违约条款', assessment: '回款风险极高，需重新谈判付款条件', level: 'danger' },
      { condition: '客户历史回款记录差', assessment: '需加强付款保障条款或调整合作模式', level: 'warning' },
      { condition: '付款节点与交付里程碑挂钩', assessment: '回款结构合理', level: 'good' },
    ],
    stageActions: [
      { stage: 'bidding', actions: [
        '谈付款条件话术："我们合同里的付款节点是这样设计的：签约付30%，上线付40%，验收付30%——这样你们的风险最小，我们也有动力快速交付"',
        '5条铁律之首：签约前必须谈好付款条件，说"这个项目我们会投入很多资源，所以付款节点需要提前确认，这是我们合作的基础"',
      ]},
      { stage: 'contract', actions: [
        '红绿灯管理：到期前一周主动联系："下周是第一笔款的时间节点，财务那边需要我们提供什么材料？我提前准备好"',
        '逾期30天启动双超会议话术："我们内部有个规定，超期超额的项目需要专项跟进，我需要了解一下付款卡在哪个环节，是预算问题还是流程问题？"',
        'DSO控制：每月算一次应收账款周转天数，超过60天立刻升级处理，找客户高层说"我们的合作很顺利，但财务上有个小问题需要您协调一下"',
      ]},
    ],
    riskSignals: ['客户要求全部验收后付款', '预付比例低于20%', '客户所在行业普遍回款困难'],
  },

  // 16. 拜访目标公式
  {
    id: 'visit_objective',
    name: '拜访目标公式',
    formula: '拜访目标 = 拿到"下一次见面"的入场券；三招：制造亏欠/制造悬念/制造求教',
    summary: '每次拜访的核心目标不是卖产品，而是确保客户愿意再见你一次',
    stages: ['lead', 'qualified'],
    dimensions: ['dim2', 'dim1'],
    judgmentRules: [
      { condition: '拜访后无明确下次见面时间', assessment: '拜访无效，"空荡荡"风险，需用三招制造下次理由', level: 'danger' },
      { condition: '拜访目标定为"签单"或"摸需求"', assessment: '目标过高，信任不足时客户不会透露真实信息', level: 'warning' },
      { condition: '每次拜访都有明确的下一步和时间', assessment: '拜访节奏健康，商机持续推进', level: 'good' },
    ],
    stageActions: [
      { stage: 'lead', actions: ['制造亏欠：主动帮客户做力所能及的事(整理数据/美化PPT/对比表)', '制造悬念：讲到最精彩处故意留白，约下次带详细模型', '制造求教：请客户当老师指点草案，三天后送修改版'] },
      { stage: 'qualified', actions: ['每次拜访前明确"用什么理由让客户再见我一次"', '拜访结束必须锁定：下次时间+下次议题+下次参与人'] },
    ],
    riskSignals: ['客户说"有机会再联系"但无具体时间', '连续两次拜访未产生实质推进', '拜访后只有"聊得不错"的感觉但无具体产出'],
  },
];

// ─── 辅助函数 ───

/** 按商机阶段筛选适用的方法论 */
export function getPlaybookByStage(stage: StageKey): SalesFormula[] {
  return SALES_PLAYBOOK.filter((p) => p.stages.includes(stage));
}

/** 按维度筛选相关方法论 */
export function getPlaybookByDimension(dim: DimensionKey): SalesFormula[] {
  return SALES_PLAYBOOK.filter((p) => p.dimensions.includes(dim));
}

/** 生成AI提示词中的销售方法论上下文 */
export function buildPlaybookPrompt(stage: StageKey): string {
  const formulas = getPlaybookByStage(stage);
  if (!formulas.length) return '';

  const lines = formulas.map((f) => {
    const actions = f.stageActions
      .filter((a) => a.stage === stage)
      .flatMap((a) => a.actions);
    const risks = f.riskSignals.slice(0, 2);

    return `【${f.name}】${f.formula}
  行动建议：${actions.join('；')}
  风险信号：${risks.join('；')}`;
  });

  return `\n## 销售方法论参考（当前阶段：${stage}）\n${lines.join('\n\n')}`;
}

/** 根据维度评分数据，匹配判断规则，返回风险提示和行动建议 */
export function evaluateByPlaybook(
  stage: StageKey,
  dimensionScores: Partial<Record<DimensionKey, number>>,
): { risks: string[]; actions: string[] } {
  const formulas = getPlaybookByStage(stage);
  const risks: string[] = [];
  const actions: string[] = [];

  for (const f of formulas) {
    // 收集该方法论关联维度的低分项
    const lowDims = f.dimensions.filter(
      (d) => dimensionScores[d] !== undefined && dimensionScores[d]! < 5,
    );

    if (lowDims.length > 0) {
      // 取danger和warning级别的判断规则
      const dangerRules = f.judgmentRules.filter((r) => r.level === 'danger');
      const warnRules = f.judgmentRules.filter((r) => r.level === 'warning');

      if (dangerRules.length) risks.push(`[${f.name}] ${dangerRules[0].assessment}`);
      if (warnRules.length) risks.push(`[${f.name}] ${warnRules[0].assessment}`);

      // 取当前阶段的行动建议
      const stageActs = f.stageActions.find((a) => a.stage === stage);
      if (stageActs) actions.push(...stageActs.actions.slice(0, 2));
    }
  }

  return { risks, actions };
}
