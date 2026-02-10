import type { ActionPlanItem } from '@/app/(main)/opportunities/[id]/_components/dimensions/shared/ActionPlanTable';

export interface AIActionPlanRequest {
  dimensionKey: string;
  dimensionLabel: string;
  formData: Record<string, unknown>;
}

export interface AIActionPlanResponse {
  plans: Pick<ActionPlanItem, 'content' | 'executor' | 'plannedDate' | 'measureResult'>[];
}

// 基于规则的 fallback 模板（无 API Key 时使用）
const dimensionTemplates: Record<string, (data: Record<string, unknown>) => AIActionPlanResponse> = {
  dim1: () => ({
    plans: [
      { content: '与客户确认采购预算和资金计划落实情况', executor: '', plannedDate: getFutureDate(7), measureResult: '获取客户书面确认' },
      { content: '了解客户内部审批流程和关键节点', executor: '', plannedDate: getFutureDate(14), measureResult: '绘制客户采购决策流程图' },
    ],
  }),
  dim2: () => ({
    plans: [
      { content: '安排高层拜访关键决策人，建立高层互信', executor: '', plannedDate: getFutureDate(7), measureResult: '完成高层会面并获得正面反馈' },
      { content: '梳理干系人关系图谱，制定逐个突破策略', executor: '', plannedDate: getFutureDate(5), measureResult: '完成干系人分析报告' },
    ],
  }),
  dim3: () => ({
    plans: [
      { content: '组织需求调研会，深入了解客户痛点和业务目标', executor: '', plannedDate: getFutureDate(7), measureResult: '输出需求调研报告' },
      { content: '与客户技术团队对接，确认技术需求细节', executor: '', plannedDate: getFutureDate(10), measureResult: '完成技术需求确认单' },
    ],
  }),
  dim4: () => ({
    plans: [
      { content: '收集竞争对手最新动态和报价信息', executor: '', plannedDate: getFutureDate(5), measureResult: '完成竞品分析报告' },
      { content: '制定差异化竞争策略，突出我方技术优势', executor: '', plannedDate: getFutureDate(10), measureResult: '输出差异化竞争方案' },
    ],
  }),
  dim5: () => ({
    plans: [
      { content: '根据客户反馈优化解决方案，提升客户认可度', executor: '', plannedDate: getFutureDate(7), measureResult: '客户认可度提升至80%以上' },
      { content: '准备方案演示材料，安排技术交流会', executor: '', plannedDate: getFutureDate(14), measureResult: '完成技术交流并获得客户认可' },
    ],
  }),
  dim6: () => ({
    plans: [
      { content: '量化客户收益，制作ROI分析报告', executor: '', plannedDate: getFutureDate(7), measureResult: '完成ROI分析并获得客户认同' },
      { content: '收集同行业成功案例数据，增强价值说服力', executor: '', plannedDate: getFutureDate(10), measureResult: '整理3个以上标杆案例' },
    ],
  }),
  dim7: () => ({
    plans: [
      { content: '评估团队能力缺口，协调资源补充关键角色', executor: '', plannedDate: getFutureDate(5), measureResult: '关键角色到位率达100%' },
      { content: '组织团队内部培训，提升项目交付能力', executor: '', plannedDate: getFutureDate(14), measureResult: '完成培训并通过考核' },
    ],
  }),
  dim8: () => ({
    plans: [
      { content: '制定详细交付计划和里程碑节点', executor: '', plannedDate: getFutureDate(7), measureResult: '交付计划获得客户确认' },
      { content: '评估产品标准化程度，识别定制化需求', executor: '', plannedDate: getFutureDate(10), measureResult: '完成产品适配性评估报告' },
    ],
  }),
  dim9: () => ({
    plans: [
      { content: '分析竞争对手定价策略，制定有竞争力的报价方案', executor: '', plannedDate: getFutureDate(7), measureResult: '完成报价方案并通过内部审批' },
      { content: '与客户沟通付款方式，争取有利条款', executor: '', plannedDate: getFutureDate(14), measureResult: '达成双方可接受的付款方案' },
    ],
  }),
  dim10: () => ({
    plans: [
      { content: '优化成本结构，提升项目毛利率', executor: '', plannedDate: getFutureDate(7), measureResult: '毛利率达到公司要求标准' },
      { content: '评估项目风险成本，预留合理利润空间', executor: '', plannedDate: getFutureDate(10), measureResult: '完成风险成本评估报告' },
    ],
  }),
};

function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateFallbackPlans(req: AIActionPlanRequest): AIActionPlanResponse {
  const template = dimensionTemplates[req.dimensionKey];
  if (template) return template(req.formData);
  return {
    plans: [
      { content: '制定针对性行动计划，推进当前维度评分提升', executor: '', plannedDate: getFutureDate(7), measureResult: '维度评分提升至目标值' },
    ],
  };
}
