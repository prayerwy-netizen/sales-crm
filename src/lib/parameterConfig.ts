import type { StageKey, DimensionKey } from './constants';

/**
 * 评估流程级别：简化 / 标准 / 完整
 * 决定每个阶段需要填写哪些维度
 */
export type EvalLevel = 'simplified' | 'standard' | 'complete';

export interface ParameterConfig {
  productLine: 'full_solution' | 'saas' | 'maas';
  amountRange: string;
  amountMin: number;
  amountMax: number;
  description: string;
  evalLevel: EvalLevel;
}

/**
 * 9 套参数配置：产品线 × 金额区间
 */
export const PARAMETER_CONFIGS: ParameterConfig[] = [
  // 全案建设
  { productLine: 'full_solution', amountRange: '<300万', amountMin: 0, amountMax: 300, description: '单岗位敏捷切入版，简化评估流程', evalLevel: 'simplified' },
  { productLine: 'full_solution', amountRange: '300-1000万', amountMin: 300, amountMax: 1000, description: '分期建设版，标准评估流程', evalLevel: 'standard' },
  { productLine: 'full_solution', amountRange: '>1000万', amountMin: 1000, amountMax: Infinity, description: '全矿井完整建设，完整评估流程', evalLevel: 'complete' },
  // SaaS订阅
  { productLine: 'saas', amountRange: '<50万', amountMin: 0, amountMax: 50, description: '小规模订阅（<50路），简化评估流程', evalLevel: 'simplified' },
  { productLine: 'saas', amountRange: '50-200万', amountMin: 50, amountMax: 200, description: '中等规模订阅，标准评估流程', evalLevel: 'standard' },
  { productLine: 'saas', amountRange: '>200万', amountMin: 200, amountMax: Infinity, description: '大规模订阅（集团级），完整评估流程', evalLevel: 'complete' },
  // MaaS服务
  { productLine: 'maas', amountRange: '<300万', amountMin: 0, amountMax: 300, description: '基础MaaS部署，简化评估流程', evalLevel: 'simplified' },
  { productLine: 'maas', amountRange: '300-500万', amountMin: 300, amountMax: 500, description: '标准MaaS部署，标准评估流程', evalLevel: 'standard' },
  { productLine: 'maas', amountRange: '>500万', amountMin: 500, amountMax: Infinity, description: '定制化MaaS+应用，完整评估流程', evalLevel: 'complete' },
];

/**
 * 每个评估级别在每个阶段需要的维度
 *
 * complete = 完整（所有适用维度都必填）
 * standard = 标准（跳过部分非核心维度）
 * simplified = 简化（仅核心维度必填）
 */
const LEVEL_STAGE_DIMS: Record<EvalLevel, Record<StageKey, DimensionKey[]>> = {
  complete: {
    lead:      ['dim1', 'dim2'],
    qualified: ['dim1', 'dim2', 'dim3', 'dim4'],
    presales:  ['dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6', 'dim7'],
    bidding:   ['dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6', 'dim7', 'dim8', 'dim9', 'dim10'],
    contract:  [],
  },
  standard: {
    lead:      ['dim1'],
    qualified: ['dim1', 'dim2', 'dim3'],
    presales:  ['dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6'],
    bidding:   ['dim1', 'dim2', 'dim3', 'dim4', 'dim5', 'dim6', 'dim7', 'dim8', 'dim9', 'dim10'],
    contract:  [],
  },
  simplified: {
    lead:      ['dim1'],
    qualified: ['dim1', 'dim2'],
    presales:  ['dim1', 'dim2', 'dim3', 'dim5'],
    bidding:   ['dim1', 'dim2', 'dim3', 'dim5', 'dim8', 'dim9', 'dim10'],
    contract:  [],
  },
};

/**
 * 根据产品线和金额匹配参数配置
 */
export function matchConfig(
  productLine: string,
  expectedAmount: number
): ParameterConfig | null {
  // expectedAmount 单位为万元
  return (
    PARAMETER_CONFIGS.find(
      (c) =>
        c.productLine === productLine &&
        expectedAmount >= c.amountMin &&
        expectedAmount < c.amountMax
    ) ?? null
  );
}

/**
 * 获取指定阶段需要填写的维度列表
 * 如果无法匹配配置，回退到 complete 级别
 */
export function getRequiredDimensions(
  productLine: string,
  expectedAmount: number,
  stage: StageKey
): DimensionKey[] {
  const config = matchConfig(productLine, expectedAmount);
  const level = config?.evalLevel ?? 'complete';
  return LEVEL_STAGE_DIMS[level][stage] ?? [];
}

/**
 * 获取指定级别在指定阶段需要的维度
 */
export function getDimensionsByLevel(
  level: EvalLevel,
  stage: StageKey
): DimensionKey[] {
  return LEVEL_STAGE_DIMS[level][stage] ?? [];
}

/**
 * 获取完整的级别-阶段-维度映射（用于设置页展示）
 */
export function getLevelStageMatrix() {
  return LEVEL_STAGE_DIMS;
}
