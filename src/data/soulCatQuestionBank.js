/**
 * 灵魂猫咪测试题库（16题）：
 * 1. 每题固定 4 个选项，对应 A/B/C/D。
 * 2. 评分规则沿用全局约定：A=1、B=2、C=3、D=4。
 * 3. 题目按顺序完整出题，不做随机抽取，避免结果波动影响可解释性。
 */

/**
 * 选项分值映射：
 * 关键逻辑：统一在常量层定义，保证题库与分析器评分口径一致。
 */
const OPTION_SCORE_BY_INDEX = [1, 2, 3, 4];

/**
 * 构建标准化单题结构。
 * @param {object} params 题目参数。
 * @param {string} params.id 题目 ID。
 * @param {string} params.title 题目标题。
 * @param {Array<string>} params.options 选项文案数组（A/B/C/D）。
 * @returns {{ id: string, title: string, description: string, weight: number, options: Array<object> }} 标准题目对象。
 */
function buildQuestion({ id, title, options }) {
  return {
    id,
    title,
    description: "按第一反应选择最像你的一项。",
    weight: 1,
    options: options.map((label, optionIndex) => {
      const optionChar = String.fromCharCode(97 + optionIndex);
      const scoreValue = OPTION_SCORE_BY_INDEX[optionIndex] ?? 1;

      return {
        id: `${id}-option-${optionChar}`,
        label,
        score: scoreValue,
      };
    }),
  };
}

/**
 * 原始题目配置（16 题）。
 */
const RAW_SOUL_CAT_QUESTION_ITEMS = [
  {
    title: "你更偏向哪种生活节奏？",
    options: ["安静宅家，不爱社交", "偶尔出门，喜欢稳定", "爱热闹，喜欢到处逛", "自由随性，不想被管"],
  },
  {
    title: "朋友约你出门，你通常？",
    options: ["能不去就不去", "看心情，想去就去", "基本都会答应", "临时变卦也很正常"],
  },
  {
    title: "你对待陌生人的态度是？",
    options: ["有点警惕，慢热", "礼貌客气，保持距离", "自来熟，很快聊开", "看眼缘，合得来就亲"],
  },
  {
    title: "你生气时会？",
    options: ["默默冷处理", "直接说出来，但不记仇", "当场发泄，过后就忘", "假装没事，心里记着"],
  },
  {
    title: "你对“被人照顾”的感觉是？",
    options: ["很享受，愿意依赖", "适度就好，别太黏", "不太习惯，更喜欢独立", "完全不喜欢，只想自己来"],
  },
  {
    title: "你更喜欢的天气是？",
    options: ["温暖晴天，晒晒太阳", "舒服阴天，不晒不冷", "下雨天，宅家最棒", "有风的天气，清爽自由"],
  },
  {
    title: "你吃东西的习惯更像？",
    options: ["挑食，只爱吃喜欢的", "不挑，有啥吃啥", "爱吃，但控制量", "随缘，饿了才吃"],
  },
  {
    title: "你睡觉时更偏向？",
    options: ["睡得沉，不容易醒", "浅眠，一点动静就醒", "喜欢抱东西睡", "睡姿随意，怎么舒服怎么来"],
  },
  {
    title: "你在群体里通常是？",
    options: ["安静观察型", "温和协调型", "活跃气氛型", "独来独往型"],
  },
  {
    title: "你对“家”的理解是？",
    options: ["绝对安全、放松的地方", "稳定舒服的小窝", "可以招待朋友的场所", "只是一个落脚点"],
  },
  {
    title: "你处理压力的方式是？",
    options: ["躲起来独处回血", "找人倾诉", "用运动 / 玩乐发泄", "硬扛，慢慢消化"],
  },
  {
    title: "你对颜值的态度是？",
    options: ["很在意，喜欢精致好看", "舒服干净就行", "无所谓，内在更重要", "随性，自己开心最重要"],
  },
  {
    title: "你更认同哪一句？",
    options: ["温柔是最强大的力量", "真诚比什么都重要", "开心快乐才是人生真谛", "自由永远第一"],
  },
  {
    title: "如果有下辈子，你希望？",
    options: ["被人好好宠爱一生", "平安安稳，无忧无虑", "体验很多有趣的事", "无拘无束，自由自在"],
  },
  {
    title: "你更喜欢的互动方式是？",
    options: ["轻轻贴贴，温柔陪伴", "一起发呆，安静待着", "一起玩闹，充满活力", "各自独立，互不打扰"],
  },
  {
    title: "你觉得自己骨子里是？",
    options: ["柔软又敏感", "稳重又温柔", "阳光又开朗", "独立又倔强"],
  },
];

/**
 * 灵魂猫咪主题标准题库。
 */
export const SOUL_CAT_QUESTION_BANK = RAW_SOUL_CAT_QUESTION_ITEMS.map(
  (item, index) =>
    buildQuestion({
      id: `soul-cat-q-${String(index + 1).padStart(3, "0")}`,
      title: item.title,
      options: item.options,
    }),
);
