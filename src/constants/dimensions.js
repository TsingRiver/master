/**
 * 偏好维度中文标签：
 * 用于结果解释、摘要展示和 AI 提示词构建，统一维护避免魔法字符串散落。
 */
export const DIMENSION_LABELS = {
  climateWarm: "气候舒适度偏好",
  paceFast: "生活节奏偏好",
  budgetHigh: "可接受居住成本",
  careerTech: "职业机会诉求",
  naturePreference: "自然环境偏好",
  transitPublic: "公共交通依赖度",
  foodDiversity: "饮食/文化多样性",
  familyFriendly: "长期安居与家庭友好",
};

/**
 * 偏好维度字段数组：
 * 统一作为循环入口，确保前后端处理维度顺序一致。
 */
export const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS);
