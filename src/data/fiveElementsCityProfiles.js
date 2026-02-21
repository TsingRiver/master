import { FIVE_ELEMENT_KEYS } from "../constants/fiveElements";

/**
 * 将原始五行画像归一化为 100 分制占比。
 * 复杂度评估：O(E log E)
 * E 为五行维度数量（固定 5），采用“最大余数法”保证占比总和严格为 100。
 * @param {Record<string, number>} rawProfile 原始画像对象。
 * @returns {{ metal: number, wood: number, water: number, fire: number, earth: number }} 归一化后的五行占比。
 */
function normalizeElementProfile(rawProfile) {
  const safeProfile = FIVE_ELEMENT_KEYS.reduce((profile, elementKey) => {
    const rawValue = Number(rawProfile?.[elementKey] ?? 0);
    profile[elementKey] = Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
    return profile;
  }, {});

  const totalValue = FIVE_ELEMENT_KEYS.reduce(
    (totalScore, elementKey) => totalScore + safeProfile[elementKey],
    0,
  );

  if (totalValue <= 0) {
    return {
      metal: 20,
      wood: 20,
      water: 20,
      fire: 20,
      earth: 20,
    };
  }

  const percentEntries = FIVE_ELEMENT_KEYS.map((elementKey) => {
    const exactPercent = (safeProfile[elementKey] / totalValue) * 100;
    const floorPercent = Math.floor(exactPercent);

    return {
      key: elementKey,
      floorPercent,
      fraction: exactPercent - floorPercent,
    };
  });

  const floorSum = percentEntries.reduce(
    (sumScore, item) => sumScore + item.floorPercent,
    0,
  );
  const remainderCount = 100 - floorSum;

  percentEntries
    .sort((leftItem, rightItem) => rightItem.fraction - leftItem.fraction)
    .forEach((item, index) => {
      if (index < remainderCount) {
        item.floorPercent += 1;
      }
    });

  return percentEntries.reduce((profile, item) => {
    profile[item.key] = item.floorPercent;
    return profile;
  }, {});
}

/**
 * 创建标准化城市画像对象。
 * @param {{
 *  name: string,
 *  popularityRank: number,
 *  coreElements: Array<string>,
 *  elementProfile: Record<string, number>,
 *  tags?: Array<string>,
 *  highlights?: Array<string>
 * }} citySeed 城市种子数据。
 * @returns {{
 *  name: string,
 *  popularityRank: number,
 *  coreElements: Array<string>,
 *  elementProfile: object,
 *  tags: Array<string>,
 *  highlights: Array<string>
 * }} 标准化后的城市画像对象。
 */
function createCityProfile(citySeed) {
  const normalizedName = String(citySeed?.name ?? "").trim();
  const normalizedCoreElements = Array.isArray(citySeed?.coreElements)
    ? citySeed.coreElements
        .map((elementKey) => String(elementKey ?? "").trim().toLowerCase())
        .filter((elementKey) => FIVE_ELEMENT_KEYS.includes(elementKey))
    : [];

  const normalizedTags = Array.isArray(citySeed?.tags)
    ? citySeed.tags.map((tagItem) => String(tagItem ?? "").trim()).filter(Boolean)
    : [];
  const normalizedHighlights = Array.isArray(citySeed?.highlights)
    ? citySeed.highlights
        .map((highlightItem) => String(highlightItem ?? "").trim())
        .filter(Boolean)
    : [];

  return {
    name: normalizedName,
    popularityRank: Number.isFinite(Number(citySeed?.popularityRank))
      ? Number(citySeed.popularityRank)
      : 999,
    coreElements: normalizedCoreElements,
    elementProfile: normalizeElementProfile(citySeed?.elementProfile ?? {}),
    tags: normalizedTags.slice(0, 3),
    highlights: normalizedHighlights.slice(0, 3),
  };
}

/**
 * 五行城市画像库：
 * 1. 覆盖 40 个热门城市（满足 30~50 范围）。
 * 2. 城市可按业务需要直接增删，不影响分析器主流程。
 */
const CITY_PROFILE_SEEDS = [
  {
    name: "北京",
    popularityRank: 1,
    coreElements: ["metal"],
    elementProfile: { metal: 38, wood: 14, water: 18, fire: 12, earth: 18 },
    tags: ["古都规制", "资源密度", "理性庄重"],
    highlights: ["故宫轴线与现代商务并存", "教育医疗资源覆盖广"],
  },
  {
    name: "上海",
    popularityRank: 2,
    coreElements: ["metal", "water"],
    elementProfile: { metal: 34, wood: 12, water: 24, fire: 16, earth: 14 },
    tags: ["摩登都市", "国际窗口", "效率节奏"],
    highlights: ["外滩与陆家嘴形成双核气场", "高密度商业与文化活动并存"],
  },
  {
    name: "广州",
    popularityRank: 3,
    coreElements: ["fire", "water"],
    elementProfile: { metal: 12, wood: 18, water: 22, fire: 32, earth: 16 },
    tags: ["烟火市井", "开放包容", "热忱鲜活"],
    highlights: ["早茶文化与夜间经济都很成熟", "商贸机会与生活便利度平衡"],
  },
  {
    name: "深圳",
    popularityRank: 4,
    coreElements: ["fire", "metal"],
    elementProfile: { metal: 24, wood: 16, water: 14, fire: 34, earth: 12 },
    tags: ["科创活力", "行动导向", "成长密度"],
    highlights: ["创新产业链完整，机会更新快", "城市运行效率高"],
  },
  {
    name: "杭州",
    popularityRank: 5,
    coreElements: ["wood", "water"],
    elementProfile: { metal: 14, wood: 31, water: 25, fire: 10, earth: 20 },
    tags: ["灵秀山水", "人文底蕴", "数字新城"],
    highlights: ["西湖景观与现代城区衔接自然", "新经济岗位与生活氛围兼具"],
  },
  {
    name: "苏州",
    popularityRank: 6,
    coreElements: ["wood", "metal"],
    elementProfile: { metal: 25, wood: 30, water: 18, fire: 8, earth: 19 },
    tags: ["园林雅致", "精致秩序", "温润慢感"],
    highlights: ["古典园林与现代制造业并行", "居住环境舒展且稳定"],
  },
  {
    name: "厦门",
    popularityRank: 7,
    coreElements: ["wood", "water"],
    elementProfile: { metal: 12, wood: 30, water: 30, fire: 10, earth: 18 },
    tags: ["海岛文艺", "清新松弛", "治愈感"],
    highlights: ["滨海步道与城市配套体验好", "节奏不急但生活品质在线"],
  },
  {
    name: "丽江",
    popularityRank: 8,
    coreElements: ["wood", "earth"],
    elementProfile: { metal: 8, wood: 34, water: 20, fire: 9, earth: 29 },
    tags: ["雪山古城", "静谧慵懒", "慢生活"],
    highlights: ["自然景观恢复力强", "生活节奏慢，适合阶段性沉淀"],
  },
  {
    name: "桂林",
    popularityRank: 9,
    coreElements: ["wood", "water"],
    elementProfile: { metal: 8, wood: 33, water: 26, fire: 9, earth: 24 },
    tags: ["山水诗意", "清润灵动", "松弛宜居"],
    highlights: ["喀斯特山水景观独特", "自然与日常生活距离近"],
  },
  {
    name: "西双版纳",
    popularityRank: 10,
    coreElements: ["wood", "fire"],
    elementProfile: { metal: 6, wood: 35, water: 16, fire: 27, earth: 16 },
    tags: ["热带草木", "热情灵动", "鲜活度高"],
    highlights: ["雨林生态恢复感明显", "夜市烟火和在地文化浓郁"],
  },
  {
    name: "黄山",
    popularityRank: 11,
    coreElements: ["wood", "earth"],
    elementProfile: { metal: 10, wood: 34, water: 18, fire: 8, earth: 30 },
    tags: ["山林云海", "清雅沉稳", "疗愈系"],
    highlights: ["山岳风景与温泉资源并重", "空间开阔，适合低噪生活"],
  },
  {
    name: "昆明",
    popularityRank: 12,
    coreElements: ["water", "wood"],
    elementProfile: { metal: 12, wood: 27, water: 30, fire: 10, earth: 21 },
    tags: ["四季如春", "温润灵动", "舒适耐住"],
    highlights: ["气候体感稳定，长期居住负担相对友好", "生活节奏柔和"],
  },
  {
    name: "重庆",
    popularityRank: 13,
    coreElements: ["fire", "earth"],
    elementProfile: { metal: 10, wood: 13, water: 17, fire: 35, earth: 25 },
    tags: ["山城烟火", "热辣豪爽", "生命力强"],
    highlights: ["夜景与烟火文化辨识度高", "城市性格鲜明，行动感强"],
  },
  {
    name: "长沙",
    popularityRank: 14,
    coreElements: ["fire", "earth"],
    elementProfile: { metal: 11, wood: 14, water: 16, fire: 34, earth: 25 },
    tags: ["娱乐鲜活", "热情外放", "年轻活力"],
    highlights: ["文娱活动密集，社交活跃度高", "城市体验感强"],
  },
  {
    name: "三亚",
    popularityRank: 15,
    coreElements: ["fire", "water"],
    elementProfile: { metal: 7, wood: 18, water: 33, fire: 30, earth: 12 },
    tags: ["热带海岸", "暖阳松弛", "度假感"],
    highlights: ["海岸线资源优质，恢复效率高", "适合追求温暖体感人群"],
  },
  {
    name: "海口",
    popularityRank: 16,
    coreElements: ["fire", "water"],
    elementProfile: { metal: 8, wood: 20, water: 31, fire: 27, earth: 14 },
    tags: ["海风慢城", "柔和治愈", "长期友好"],
    highlights: ["整体生活节奏更平和", "海岛属性与城市配套并存"],
  },
  {
    name: "乌鲁木齐",
    popularityRank: 17,
    coreElements: ["fire", "earth"],
    elementProfile: { metal: 15, wood: 9, water: 14, fire: 30, earth: 32 },
    tags: ["西域辽阔", "热忱粗粝", "边城张力"],
    highlights: ["地域文化独特，城市记忆点强", "生活成本与空间感具备优势"],
  },
  {
    name: "郑州",
    popularityRank: 18,
    coreElements: ["earth", "metal"],
    elementProfile: { metal: 18, wood: 12, water: 14, fire: 16, earth: 40 },
    tags: ["中原枢纽", "务实稳态", "承载力"],
    highlights: ["交通区位优势明显", "城市运转节奏偏稳健"],
  },
  {
    name: "西安",
    popularityRank: 19,
    coreElements: ["earth", "metal"],
    elementProfile: { metal: 20, wood: 11, water: 13, fire: 15, earth: 41 },
    tags: ["古都厚重", "文脉沉稳", "扎根感"],
    highlights: ["历史文化深度与现代生活融合", "城市节奏稳中带活"],
  },
  {
    name: "成都",
    popularityRank: 20,
    coreElements: ["earth", "wood"],
    elementProfile: { metal: 10, wood: 24, water: 15, fire: 18, earth: 33 },
    tags: ["松弛烟火", "安逸治愈", "长期舒适"],
    highlights: ["生活包容度高，日常幸福感稳定", "新消费与创新岗位持续增长"],
  },
  {
    name: "洛阳",
    popularityRank: 21,
    coreElements: ["earth", "metal"],
    elementProfile: { metal: 20, wood: 12, water: 12, fire: 14, earth: 42 },
    tags: ["古都文脉", "温润质朴", "沉静耐看"],
    highlights: ["文化资源密集且生活成本相对友好", "安居属性突出"],
  },
  {
    name: "合肥",
    popularityRank: 22,
    coreElements: ["earth", "water"],
    elementProfile: { metal: 16, wood: 18, water: 20, fire: 12, earth: 34 },
    tags: ["江淮稳进", "成长平衡", "实用派"],
    highlights: ["科创产业稳步上行", "通勤与生活半径相对友好"],
  },
  {
    name: "太原",
    popularityRank: 23,
    coreElements: ["earth", "metal"],
    elementProfile: { metal: 21, wood: 10, water: 12, fire: 12, earth: 45 },
    tags: ["晋地厚重", "沉稳务实", "长期耐住"],
    highlights: ["城市生活秩序稳定", "居住成本可控"],
  },
  {
    name: "兰州",
    popularityRank: 24,
    coreElements: ["earth", "water"],
    elementProfile: { metal: 18, wood: 9, water: 20, fire: 14, earth: 39 },
    tags: ["黄河底蕴", "粗粝温厚", "生活真实"],
    highlights: ["黄河沿线城市风貌独特", "生活节奏相对从容"],
  },
  {
    name: "青岛",
    popularityRank: 25,
    coreElements: ["metal", "water"],
    elementProfile: { metal: 30, wood: 15, water: 30, fire: 8, earth: 17 },
    tags: ["滨海清冽", "理性浪漫", "舒展呼吸"],
    highlights: ["海岸景观与城市秩序兼得", "气质清爽，适合长期恢复"],
  },
  {
    name: "天津",
    popularityRank: 26,
    coreElements: ["metal", "water"],
    elementProfile: { metal: 32, wood: 12, water: 24, fire: 10, earth: 22 },
    tags: ["津门从容", "洋楼风情", "节奏适中"],
    highlights: ["历史街区与现代生活并存", "通勤体系较完善"],
  },
  {
    name: "宁波",
    popularityRank: 27,
    coreElements: ["metal", "water"],
    elementProfile: { metal: 27, wood: 15, water: 26, fire: 11, earth: 21 },
    tags: ["港城务实", "理性稳进", "海派气韵"],
    highlights: ["制造业与港口经济协同", "生活效率与宜居度兼顾"],
  },
  {
    name: "无锡",
    popularityRank: 28,
    coreElements: ["metal", "water"],
    elementProfile: { metal: 28, wood: 20, water: 22, fire: 8, earth: 22 },
    tags: ["江南秩序", "精致耐住", "太湖气息"],
    highlights: ["太湖生态与城市服务融合", "生活节奏稳定"],
  },
  {
    name: "武汉",
    popularityRank: 29,
    coreElements: ["water", "fire"],
    elementProfile: { metal: 12, wood: 16, water: 33, fire: 22, earth: 17 },
    tags: ["江城流动", "兼容并蓄", "活力中枢"],
    highlights: ["双江交汇形成强流动属性", "高校与产业双资源"],
  },
  {
    name: "南京",
    popularityRank: 30,
    coreElements: ["water", "metal"],
    elementProfile: { metal: 24, wood: 16, water: 28, fire: 10, earth: 22 },
    tags: ["文脉水城", "克制温润", "平衡感"],
    highlights: ["历史底蕴与现代产业并存", "生活节奏相对友好"],
  },
  {
    name: "大连",
    popularityRank: 31,
    coreElements: ["water", "metal"],
    elementProfile: { metal: 24, wood: 14, water: 33, fire: 8, earth: 21 },
    tags: ["海风清冽", "城市呼吸感", "通透感"],
    highlights: ["海景资源突出", "城市尺度舒适"],
  },
  {
    name: "福州",
    popularityRank: 32,
    coreElements: ["water", "wood"],
    elementProfile: { metal: 12, wood: 23, water: 33, fire: 12, earth: 20 },
    tags: ["榕城温润", "海岸包容", "柔和宜居"],
    highlights: ["绿化覆盖与滨海环境兼具", "生活方式相对松弛"],
  },
  {
    name: "哈尔滨",
    popularityRank: 33,
    coreElements: ["water", "earth"],
    elementProfile: { metal: 17, wood: 12, water: 30, fire: 9, earth: 32 },
    tags: ["冰雪气质", "厚重沉静", "边界感"],
    highlights: ["季节特征鲜明，城市辨识度高", "生活节奏稳中有序"],
  },
  {
    name: "贵阳",
    popularityRank: 34,
    coreElements: ["water", "wood"],
    elementProfile: { metal: 10, wood: 24, water: 31, fire: 12, earth: 23 },
    tags: ["山地云雾", "清润慢感", "恢复力"],
    highlights: ["气候体感相对舒适", "生活成本与松弛度平衡"],
  },
  {
    name: "南宁",
    popularityRank: 35,
    coreElements: ["wood", "fire"],
    elementProfile: { metal: 8, wood: 29, water: 18, fire: 28, earth: 17 },
    tags: ["绿城生机", "暖感活力", "舒展包容"],
    highlights: ["绿化与暖热气候形成高生发感", "生活节奏不算压迫"],
  },
  {
    name: "珠海",
    popularityRank: 36,
    coreElements: ["water", "wood"],
    elementProfile: { metal: 11, wood: 24, water: 33, fire: 11, earth: 21 },
    tags: ["滨海松弛", "宜居温润", "轻度慢活"],
    highlights: ["海岸线通勤与生活体验较好", "城市体感平和"],
  },
  {
    name: "泉州",
    popularityRank: 37,
    coreElements: ["wood", "metal"],
    elementProfile: { metal: 22, wood: 28, water: 18, fire: 10, earth: 22 },
    tags: ["海丝起点", "闽南文化", "世遗之城"],
    highlights: ["商贸传统与人文底蕴并重", "城市生活带有温暖烟火感"],
  },
  {
    name: "温州",
    popularityRank: 38,
    coreElements: ["fire", "metal"],
    elementProfile: { metal: 24, wood: 16, water: 16, fire: 28, earth: 16 },
    tags: ["商贸活力", "行动驱动", "韧性城市"],
    highlights: ["民营经济活跃，创业氛围浓", "城市节奏偏快"],
  },
  {
    name: "济南",
    popularityRank: 39,
    coreElements: ["earth", "metal"],
    elementProfile: { metal: 23, wood: 13, water: 16, fire: 12, earth: 36 },
    tags: ["泉城底蕴", "稳态安居", "秩序感"],
    highlights: ["公共服务体系完善度较高", "生活与工作节奏相对均衡"],
  },
  {
    name: "沈阳",
    popularityRank: 40,
    coreElements: ["metal", "earth"],
    elementProfile: { metal: 28, wood: 10, water: 17, fire: 13, earth: 32 },
    tags: ["工业基底", "务实沉稳", "东北厚度"],
    highlights: ["城市基础设施扎实", "长期安居成本相对可控"],
  },
];

/**
 * 五行城市画像库导出。
 */
export const FIVE_ELEMENTS_CITY_PROFILES = CITY_PROFILE_SEEDS.map(createCityProfile);
