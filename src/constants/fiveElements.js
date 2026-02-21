/**
 * 五行键名列表：
 * 关键逻辑：所有五行相关计算都基于该固定顺序，避免对象遍历顺序差异导致展示抖动。
 */
export const FIVE_ELEMENT_KEYS = Object.freeze([
  "metal",
  "wood",
  "water",
  "fire",
  "earth",
]);

/**
 * 五行展示配置：
 * 1. label：前端展示名称（意象化）。
 * 2. color：图表与标签主色。
 * 3. energyReading：结果页“五行能量解读”标准文案。
 */
export const FIVE_ELEMENT_DISPLAY_CONFIG = Object.freeze({
  metal: {
    label: "金·鎏序",
    color: "#D9CCB5",
    energyReading:
      "金·鎏序：秩序、通透、笃定，理性严谨，坚守原则，兼具内敛锋芒与温和分寸。",
  },
  wood: {
    label: "木·森屿",
    color: "#9FBFA6",
    energyReading:
      "木·森屿：舒展、生机、共情，治愈包容，思维灵活，兼具向上力量与温润善意。",
  },
  water: {
    label: "水·沧澜",
    color: "#9BB9C9",
    energyReading:
      "水·沧澜：灵动、通透、坚韧，从容变通，心思敏锐，兼具柔和韧性与深邃格局。",
  },
  fire: {
    label: "火·曜阳",
    color: "#D78E82",
    energyReading:
      "火·曜阳：热忱、果敢、鲜活，活力充沛，行动力强，兼具热烈气场与真诚暖意。",
  },
  earth: {
    label: "土·坤域",
    color: "#D9BE8B",
    energyReading:
      "土·坤域：沉稳、承载、谦和，务实笃行，心性平和，兼具厚重担当与质朴真诚。",
  },
});

/**
 * 五行均衡展示文案。
 */
export const FIVE_ELEMENT_BALANCED_LABEL = "五维调和 · 万象共生";

/**
 * 五行相生映射：A -> B 表示 A 生 B。
 */
export const FIVE_ELEMENT_GENERATE_MAP = Object.freeze({
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
});

/**
 * 五行相克映射：A -> B 表示 A 克 B。
 */
export const FIVE_ELEMENT_CONTROL_MAP = Object.freeze({
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
});

/**
 * 规范化五行键名。
 * @param {unknown} rawKey 原始键名。
 * @returns {"metal"|"wood"|"water"|"fire"|"earth"|""} 规范化键名。
 */
function normalizeElementKey(rawKey) {
  const normalizedKey = String(rawKey ?? "")
    .trim()
    .toLowerCase();

  return FIVE_ELEMENT_KEYS.includes(normalizedKey) ? normalizedKey : "";
}

/**
 * 获取五行展示名称。
 * @param {unknown} elementKey 五行键名。
 * @returns {string} 五行展示名称。
 */
export function getFiveElementLabel(elementKey) {
  const normalizedKey = normalizeElementKey(elementKey);
  return normalizedKey
    ? FIVE_ELEMENT_DISPLAY_CONFIG[normalizedKey].label
    : "未知能量";
}

/**
 * 获取五行展示色。
 * @param {unknown} elementKey 五行键名。
 * @returns {string} 十六进制颜色。
 */
export function getFiveElementColor(elementKey) {
  const normalizedKey = normalizeElementKey(elementKey);
  return normalizedKey
    ? FIVE_ELEMENT_DISPLAY_CONFIG[normalizedKey].color
    : "#B5ADA1";
}

/**
 * 判定五行关系。
 * @param {unknown} sourceElementKey 关系发起方五行。
 * @param {unknown} targetElementKey 关系目标方五行。
 * @returns {"same"|"generates"|"generatedBy"|"controls"|"controlledBy"|"neutral"} 关系类型。
 */
export function resolveFiveElementRelation(sourceElementKey, targetElementKey) {
  const sourceKey = normalizeElementKey(sourceElementKey);
  const targetKey = normalizeElementKey(targetElementKey);

  if (!sourceKey || !targetKey) {
    return "neutral";
  }

  if (sourceKey === targetKey) {
    return "same";
  }

  if (FIVE_ELEMENT_GENERATE_MAP[sourceKey] === targetKey) {
    return "generates";
  }

  if (FIVE_ELEMENT_GENERATE_MAP[targetKey] === sourceKey) {
    return "generatedBy";
  }

  if (FIVE_ELEMENT_CONTROL_MAP[sourceKey] === targetKey) {
    return "controls";
  }

  if (FIVE_ELEMENT_CONTROL_MAP[targetKey] === sourceKey) {
    return "controlledBy";
  }

  return "neutral";
}
