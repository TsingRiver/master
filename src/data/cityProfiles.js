import { DIMENSION_KEYS } from "../constants/dimensions";

/**
 * 城市画像维度基准：
 * 1. 先按区域给出基础分布，覆盖气候、节奏、预算、职业机会等核心维度。
 * 2. 再按城市层级做统一修正，保证全国覆盖时结果仍有可解释性。
 */
const REGION_PROFILE_PRESETS = {
  municipality: {
    climateWarm: 6,
    paceFast: 9,
    budgetHigh: 9,
    careerTech: 9,
    naturePreference: 5,
    transitPublic: 9,
    foodDiversity: 9,
    familyFriendly: 6,
  },
  north: {
    climateWarm: 5,
    paceFast: 6,
    budgetHigh: 5,
    careerTech: 6,
    naturePreference: 6,
    transitPublic: 6,
    foodDiversity: 6,
    familyFriendly: 7,
  },
  northeast: {
    climateWarm: 4,
    paceFast: 5,
    budgetHigh: 4,
    careerTech: 5,
    naturePreference: 7,
    transitPublic: 6,
    foodDiversity: 6,
    familyFriendly: 7,
  },
  eastCoast: {
    climateWarm: 6,
    paceFast: 7,
    budgetHigh: 6,
    careerTech: 7,
    naturePreference: 7,
    transitPublic: 7,
    foodDiversity: 7,
    familyFriendly: 8,
  },
  central: {
    climateWarm: 6,
    paceFast: 6,
    budgetHigh: 5,
    careerTech: 6,
    naturePreference: 6,
    transitPublic: 6,
    foodDiversity: 7,
    familyFriendly: 7,
  },
  southCoast: {
    climateWarm: 8,
    paceFast: 6,
    budgetHigh: 6,
    careerTech: 6,
    naturePreference: 7,
    transitPublic: 6,
    foodDiversity: 7,
    familyFriendly: 7,
  },
  southwest: {
    climateWarm: 7,
    paceFast: 5,
    budgetHigh: 4,
    careerTech: 5,
    naturePreference: 8,
    transitPublic: 5,
    foodDiversity: 7,
    familyFriendly: 8,
  },
  northwest: {
    climateWarm: 5,
    paceFast: 5,
    budgetHigh: 4,
    careerTech: 5,
    naturePreference: 8,
    transitPublic: 5,
    foodDiversity: 6,
    familyFriendly: 7,
  },
  plateau: {
    climateWarm: 3,
    paceFast: 4,
    budgetHigh: 4,
    careerTech: 4,
    naturePreference: 9,
    transitPublic: 4,
    foodDiversity: 6,
    familyFriendly: 7,
  },
};

/**
 * 城市层级修正：
 * - nationalCore：全国核心城市。
 * - regionalCore：区域中心城市。
 * - balanced：常规均衡城市。
 * - slowLiving：慢节奏/低压力倾向。
 * - tourism：旅游与生活方式导向。
 */
const TIER_PROFILE_ADJUSTMENTS = {
  nationalCore: {
    paceFast: 2,
    budgetHigh: 2,
    careerTech: 2,
    transitPublic: 2,
    foodDiversity: 1,
    familyFriendly: -1,
  },
  regionalCore: {
    paceFast: 1,
    budgetHigh: 1,
    careerTech: 1,
    transitPublic: 1,
    foodDiversity: 1,
  },
  balanced: {},
  slowLiving: {
    paceFast: -1,
    budgetHigh: -1,
    careerTech: -1,
    naturePreference: 1,
    familyFriendly: 1,
  },
  tourism: {
    paceFast: -1,
    budgetHigh: 1,
    naturePreference: 1,
    foodDiversity: 1,
  },
};

/**
 * 区域标签文案：
 * 关键逻辑：给每个城市提供一个稳定的地域辨识标签，便于结果页快速识别风格。
 */
const REGION_TAG_LABELS = {
  municipality: "核心都会",
  north: "北方务实",
  northeast: "雪境城市",
  eastCoast: "沿海经济带",
  central: "中部枢纽",
  southCoast: "南方海风",
  southwest: "西南烟火",
  northwest: "西北辽阔",
  plateau: "高原日光",
};

/**
 * 层级标签文案：
 * 关键逻辑：补充“城市机会密度”标签，避免标签信息只体现地理，不体现生活节奏差异。
 */
const TIER_TAG_LABELS = {
  nationalCore: "全国核心",
  regionalCore: "区域中心",
  balanced: "生活均衡",
  slowLiving: "松弛宜居",
  tourism: "旅行友好",
};

/**
 * 维度标签词典：
 * 关键逻辑：将 8 个量化维度映射为用户可读短标签，统一标签口径，降低理解成本。
 */
const DIMENSION_TAG_COPY = {
  climateWarm: {
    high: "暖感气候",
    medium: "四季平衡",
    low: "清凉四季",
  },
  paceFast: {
    high: "效率节奏",
    medium: "节奏适中",
    low: "慢生活感",
  },
  budgetHigh: {
    high: "高能消费",
    medium: "成本平衡",
    low: "成本友好",
  },
  careerTech: {
    high: "成长机会",
    medium: "发展稳定",
    low: "安稳就业",
  },
  naturePreference: {
    high: "自然疗愈",
    medium: "绿意宜居",
    low: "都市密度",
  },
  transitPublic: {
    high: "通勤友好",
    medium: "出行均衡",
    low: "自驾便利",
  },
  foodDiversity: {
    high: "美食丰盛",
    medium: "风味均衡",
    low: "饮食朴实",
  },
  familyFriendly: {
    high: "安居友好",
    medium: "长期稳定",
    low: "流动机会",
  },
};

/**
 * 全国地级市分组（含直辖市），仅覆盖中国大陆。
 * 总量：297 个地级市（不含县级市/港澳台）。
 */
const PREFECTURE_CITY_GROUPS = [
  {
    provinceName: "北京市",
    regionKey: "municipality",
    defaultTierKey: "nationalCore",
    cityNames: ["北京"],
  },
  {
    provinceName: "天津市",
    regionKey: "municipality",
    defaultTierKey: "regionalCore",
    cityNames: ["天津"],
  },
  {
    provinceName: "上海市",
    regionKey: "municipality",
    defaultTierKey: "nationalCore",
    cityNames: ["上海"],
  },
  {
    provinceName: "重庆市",
    regionKey: "southwest",
    defaultTierKey: "regionalCore",
    cityNames: ["重庆"],
  },
  {
    provinceName: "河北省",
    regionKey: "north",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["石家庄", "唐山", "保定", "廊坊"],
    slowLivingCityNames: ["张家口", "承德", "衡水"],
    cityNames: [
      "石家庄",
      "唐山",
      "秦皇岛",
      "邯郸",
      "邢台",
      "保定",
      "张家口",
      "承德",
      "沧州",
      "廊坊",
      "衡水",
    ],
  },
  {
    provinceName: "山西省",
    regionKey: "north",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["太原"],
    slowLivingCityNames: ["朔州", "忻州", "吕梁"],
    cityNames: [
      "太原",
      "大同",
      "阳泉",
      "长治",
      "晋城",
      "朔州",
      "晋中",
      "运城",
      "忻州",
      "临汾",
      "吕梁",
    ],
  },
  {
    provinceName: "内蒙古自治区",
    regionKey: "northwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["呼和浩特", "包头", "鄂尔多斯", "呼伦贝尔"],
    slowLivingCityNames: ["乌海", "巴彦淖尔", "乌兰察布"],
    cityNames: [
      "呼和浩特",
      "包头",
      "乌海",
      "赤峰",
      "通辽",
      "鄂尔多斯",
      "呼伦贝尔",
      "巴彦淖尔",
      "乌兰察布",
    ],
  },
  {
    provinceName: "辽宁省",
    regionKey: "northeast",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["沈阳", "大连"],
    slowLivingCityNames: ["朝阳", "阜新"],
    cityNames: [
      "沈阳",
      "大连",
      "鞍山",
      "抚顺",
      "本溪",
      "丹东",
      "锦州",
      "营口",
      "阜新",
      "辽阳",
      "盘锦",
      "铁岭",
      "朝阳",
      "葫芦岛",
    ],
  },
  {
    provinceName: "吉林省",
    regionKey: "northeast",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["长春", "吉林"],
    slowLivingCityNames: ["白山", "白城"],
    cityNames: ["长春", "吉林", "四平", "辽源", "通化", "白山", "松原", "白城"],
  },
  {
    provinceName: "黑龙江省",
    regionKey: "northeast",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["哈尔滨", "大庆"],
    slowLivingCityNames: ["伊春", "黑河"],
    cityNames: [
      "哈尔滨",
      "齐齐哈尔",
      "鸡西",
      "鹤岗",
      "双鸭山",
      "大庆",
      "伊春",
      "佳木斯",
      "七台河",
      "牡丹江",
      "黑河",
      "绥化",
    ],
  },
  {
    provinceName: "江苏省",
    regionKey: "eastCoast",
    defaultTierKey: "regionalCore",
    nationalCoreCityNames: ["南京", "苏州"],
    regionalCoreCityNames: ["无锡", "常州", "南通", "徐州"],
    cityNames: [
      "南京",
      "无锡",
      "徐州",
      "常州",
      "苏州",
      "南通",
      "连云港",
      "淮安",
      "盐城",
      "扬州",
      "镇江",
      "泰州",
      "宿迁",
    ],
  },
  {
    provinceName: "浙江省",
    regionKey: "eastCoast",
    defaultTierKey: "regionalCore",
    nationalCoreCityNames: ["杭州", "宁波"],
    regionalCoreCityNames: ["温州", "绍兴", "嘉兴", "金华"],
    tourismCityNames: ["舟山", "丽水", "台州"],
    cityNames: [
      "杭州",
      "宁波",
      "温州",
      "嘉兴",
      "湖州",
      "绍兴",
      "金华",
      "衢州",
      "舟山",
      "台州",
      "丽水",
    ],
  },
  {
    provinceName: "安徽省",
    regionKey: "central",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["合肥", "芜湖"],
    slowLivingCityNames: ["黄山", "池州"],
    cityNames: [
      "合肥",
      "芜湖",
      "蚌埠",
      "淮南",
      "马鞍山",
      "淮北",
      "铜陵",
      "安庆",
      "黄山",
      "滁州",
      "阜阳",
      "宿州",
      "六安",
      "亳州",
      "池州",
      "宣城",
    ],
  },
  {
    provinceName: "福建省",
    regionKey: "southCoast",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["福州", "厦门", "泉州"],
    tourismCityNames: ["厦门", "三明", "南平", "龙岩", "宁德"],
    cityNames: ["福州", "厦门", "莆田", "三明", "泉州", "漳州", "南平", "龙岩", "宁德"],
  },
  {
    provinceName: "江西省",
    regionKey: "central",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["南昌", "九江", "赣州"],
    slowLivingCityNames: ["景德镇", "吉安"],
    cityNames: [
      "南昌",
      "景德镇",
      "萍乡",
      "九江",
      "新余",
      "鹰潭",
      "赣州",
      "吉安",
      "宜春",
      "抚州",
      "上饶",
    ],
  },
  {
    provinceName: "山东省",
    regionKey: "eastCoast",
    defaultTierKey: "regionalCore",
    nationalCoreCityNames: ["青岛"],
    regionalCoreCityNames: ["济南", "烟台", "潍坊", "临沂", "济宁"],
    tourismCityNames: ["威海", "日照", "泰安"],
    cityNames: [
      "济南",
      "青岛",
      "淄博",
      "枣庄",
      "东营",
      "烟台",
      "潍坊",
      "济宁",
      "泰安",
      "威海",
      "日照",
      "临沂",
      "德州",
      "聊城",
      "滨州",
      "菏泽",
    ],
  },
  {
    provinceName: "河南省",
    regionKey: "central",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["郑州", "洛阳", "南阳"],
    cityNames: [
      "郑州",
      "开封",
      "洛阳",
      "平顶山",
      "安阳",
      "鹤壁",
      "新乡",
      "焦作",
      "濮阳",
      "许昌",
      "漯河",
      "三门峡",
      "南阳",
      "商丘",
      "信阳",
      "周口",
      "驻马店",
    ],
  },
  {
    provinceName: "湖北省",
    regionKey: "central",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["武汉", "襄阳", "宜昌"],
    cityNames: ["武汉", "黄石", "十堰", "宜昌", "襄阳", "鄂州", "荆门", "孝感", "荆州", "黄冈", "咸宁", "随州"],
  },
  {
    provinceName: "湖南省",
    regionKey: "central",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["长沙", "株洲", "岳阳"],
    slowLivingCityNames: ["张家界", "怀化"],
    cityNames: [
      "长沙",
      "株洲",
      "湘潭",
      "衡阳",
      "邵阳",
      "岳阳",
      "常德",
      "张家界",
      "益阳",
      "郴州",
      "永州",
      "怀化",
      "娄底",
    ],
  },
  {
    provinceName: "广东省",
    regionKey: "southCoast",
    defaultTierKey: "regionalCore",
    nationalCoreCityNames: ["广州", "深圳"],
    regionalCoreCityNames: ["佛山", "东莞", "珠海", "惠州", "中山"],
    tourismCityNames: ["珠海", "汕头", "阳江", "潮州"],
    cityNames: [
      "广州",
      "深圳",
      "珠海",
      "汕头",
      "佛山",
      "韶关",
      "湛江",
      "肇庆",
      "江门",
      "茂名",
      "惠州",
      "梅州",
      "汕尾",
      "河源",
      "阳江",
      "清远",
      "东莞",
      "中山",
      "潮州",
      "揭阳",
      "云浮",
    ],
  },
  {
    provinceName: "广西壮族自治区",
    regionKey: "southCoast",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["南宁", "柳州", "桂林"],
    tourismCityNames: ["桂林", "北海", "崇左", "河池", "百色"],
    cityNames: [
      "南宁",
      "柳州",
      "桂林",
      "梧州",
      "北海",
      "防城港",
      "钦州",
      "贵港",
      "玉林",
      "百色",
      "贺州",
      "河池",
      "来宾",
      "崇左",
    ],
  },
  {
    provinceName: "海南省",
    regionKey: "southCoast",
    defaultTierKey: "tourism",
    regionalCoreCityNames: ["海口", "三亚"],
    tourismCityNames: ["海口", "三亚", "三沙", "儋州"],
    cityNames: ["海口", "三亚", "三沙", "儋州"],
  },
  {
    provinceName: "四川省",
    regionKey: "southwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["成都", "绵阳", "宜宾", "南充"],
    tourismCityNames: ["乐山", "雅安", "广元"],
    cityNames: [
      "成都",
      "自贡",
      "攀枝花",
      "泸州",
      "德阳",
      "绵阳",
      "广元",
      "遂宁",
      "内江",
      "乐山",
      "南充",
      "眉山",
      "宜宾",
      "广安",
      "达州",
      "雅安",
      "巴中",
      "资阳",
    ],
  },
  {
    provinceName: "贵州省",
    regionKey: "southwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["贵阳", "遵义"],
    slowLivingCityNames: ["安顺", "铜仁"],
    cityNames: ["贵阳", "六盘水", "遵义", "安顺", "毕节", "铜仁"],
  },
  {
    provinceName: "云南省",
    regionKey: "southwest",
    defaultTierKey: "slowLiving",
    regionalCoreCityNames: ["昆明", "曲靖"],
    tourismCityNames: ["丽江", "普洱", "保山", "临沧"],
    cityNames: ["昆明", "曲靖", "玉溪", "保山", "昭通", "丽江", "普洱", "临沧"],
  },
  {
    provinceName: "西藏自治区",
    regionKey: "plateau",
    defaultTierKey: "slowLiving",
    regionalCoreCityNames: ["拉萨"],
    cityNames: ["拉萨", "日喀则", "昌都", "林芝", "山南", "那曲"],
  },
  {
    provinceName: "陕西省",
    regionKey: "northwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["西安", "咸阳", "宝鸡"],
    cityNames: ["西安", "铜川", "宝鸡", "咸阳", "渭南", "延安", "汉中", "榆林", "安康", "商洛"],
  },
  {
    provinceName: "甘肃省",
    regionKey: "northwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["兰州"],
    slowLivingCityNames: ["酒泉", "嘉峪关", "张掖", "陇南"],
    cityNames: [
      "兰州",
      "嘉峪关",
      "金昌",
      "白银",
      "天水",
      "武威",
      "张掖",
      "平凉",
      "酒泉",
      "庆阳",
      "定西",
      "陇南",
    ],
  },
  {
    provinceName: "青海省",
    regionKey: "plateau",
    defaultTierKey: "slowLiving",
    regionalCoreCityNames: ["西宁"],
    cityNames: ["西宁", "海东"],
  },
  {
    provinceName: "宁夏回族自治区",
    regionKey: "northwest",
    defaultTierKey: "balanced",
    regionalCoreCityNames: ["银川"],
    cityNames: ["银川", "石嘴山", "吴忠", "固原", "中卫"],
  },
  {
    provinceName: "新疆维吾尔自治区",
    regionKey: "northwest",
    defaultTierKey: "slowLiving",
    regionalCoreCityNames: ["乌鲁木齐", "克拉玛依"],
    tourismCityNames: ["吐鲁番", "哈密"],
    cityNames: ["乌鲁木齐", "克拉玛依", "吐鲁番", "哈密"],
  },
];

/**
 * 重点城市画像覆盖：
 * 保留历史样本城市的精细画像，确保新老版本结果稳定衔接。
 */
const CITY_PROFILE_OVERRIDES = {
  北京: {
    climateWarm: 5,
    paceFast: 10,
    budgetHigh: 10,
    careerTech: 10,
    naturePreference: 6,
    transitPublic: 10,
    foodDiversity: 9,
    familyFriendly: 6,
  },
  上海: {
    climateWarm: 5,
    paceFast: 10,
    budgetHigh: 10,
    careerTech: 9,
    naturePreference: 4,
    transitPublic: 10,
    foodDiversity: 10,
    familyFriendly: 6,
  },
  深圳: {
    climateWarm: 9,
    paceFast: 9,
    budgetHigh: 8,
    careerTech: 10,
    naturePreference: 6,
    transitPublic: 8,
    foodDiversity: 8,
    familyFriendly: 6,
  },
  广州: {
    climateWarm: 8,
    paceFast: 8,
    budgetHigh: 8,
    careerTech: 8,
    naturePreference: 6,
    transitPublic: 9,
    foodDiversity: 9,
    familyFriendly: 7,
  },
  杭州: {
    climateWarm: 7,
    paceFast: 7,
    budgetHigh: 7,
    careerTech: 8,
    naturePreference: 8,
    transitPublic: 8,
    foodDiversity: 8,
    familyFriendly: 8,
  },
  成都: {
    climateWarm: 7,
    paceFast: 5,
    budgetHigh: 5,
    careerTech: 6,
    naturePreference: 7,
    transitPublic: 7,
    foodDiversity: 9,
    familyFriendly: 8,
  },
  苏州: {
    climateWarm: 6,
    paceFast: 6,
    budgetHigh: 7,
    careerTech: 7,
    naturePreference: 8,
    transitPublic: 8,
    foodDiversity: 7,
    familyFriendly: 9,
  },
  厦门: {
    climateWarm: 9,
    paceFast: 4,
    budgetHigh: 7,
    careerTech: 5,
    naturePreference: 9,
    transitPublic: 6,
    foodDiversity: 7,
    familyFriendly: 8,
  },
  青岛: {
    climateWarm: 6,
    paceFast: 5,
    budgetHigh: 6,
    careerTech: 6,
    naturePreference: 8,
    transitPublic: 7,
    foodDiversity: 8,
    familyFriendly: 8,
  },
  昆明: {
    climateWarm: 8,
    paceFast: 3,
    budgetHigh: 4,
    careerTech: 4,
    naturePreference: 10,
    transitPublic: 5,
    foodDiversity: 7,
    familyFriendly: 8,
  },
  宁波: {
    climateWarm: 7,
    paceFast: 6,
    budgetHigh: 6,
    careerTech: 6,
    naturePreference: 8,
    transitPublic: 7,
    foodDiversity: 7,
    familyFriendly: 8,
  },
  南京: {
    climateWarm: 6,
    paceFast: 7,
    budgetHigh: 7,
    careerTech: 7,
    naturePreference: 7,
    transitPublic: 8,
    foodDiversity: 8,
    familyFriendly: 8,
  },
  武汉: {
    climateWarm: 7,
    paceFast: 7,
    budgetHigh: 6,
    careerTech: 7,
    naturePreference: 6,
    transitPublic: 8,
    foodDiversity: 8,
    familyFriendly: 7,
  },
};

/**
 * 重点城市标签覆盖：
 * 保持历史产出文案风格的一致性。
 */
const CITY_TRAIT_OVERRIDES = {
  杭州: ["数字经济强", "山水与城市共存", "生活便利度高"],
  成都: ["生活节奏友好", "餐饮文化强", "长期居住舒适"],
  深圳: ["创新产业密集", "机会窗口大", "城市效率高"],
  上海: ["国际化程度高", "公共交通成熟", "职业机会密集"],
  苏州: ["宜居稳定", "制造与新兴产业并重", "家庭友好"],
  厦门: ["气候舒适", "滨海生活感强", "节奏相对平和"],
  青岛: ["海滨环境优势", "宜居属性好", "生活成本相对均衡"],
  昆明: ["四季体感友好", "自然资源丰富", "慢节奏生活"],
  广州: ["商贸与产业并重", "交通网络成熟", "饮食文化多样"],
  宁波: ["产业基础扎实", "海港城市优势", "生活平衡感较好"],
  南京: ["教育资源集中", "历史与现代融合", "综合平衡能力强"],
  武汉: ["区域中心城市", "产业结构多元", "通勤网络较完善"],
};

/**
 * 城市短标签覆盖：
 * 关键逻辑：重点城市使用人工校准短标签，保证分享卡与结果页的语义准确性。
 */
const CITY_TAG_OVERRIDES = {
  泉州: ["海丝起点", "闽南文化", "世遗之城"],
  北京: ["首都文化", "资源密集", "公共服务"],
  上海: ["国际都会", "现代商业", "高效通勤"],
  广州: ["商贸枢纽", "岭南烟火", "生活便利"],
  深圳: ["创新前沿", "机会密集", "年轻活力"],
  杭州: ["数字经济", "江南山水", "新消费活跃"],
  苏州: ["园林古韵", "制造强市", "安居友好"],
  南京: ["六朝底蕴", "教育资源", "综合均衡"],
  成都: ["巴蜀烟火", "生活松弛", "新经济增长"],
  武汉: ["九省通衢", "高校密集", "产业多元"],
  厦门: ["滨海慢调", "文艺气质", "气候舒适"],
  青岛: ["海湾风光", "啤酒文化", "宜居平衡"],
  昆明: ["春城气候", "自然疗愈", "节奏舒缓"],
  宁波: ["港口优势", "制造基础", "生活平衡"],
};

/**
 * 将分值裁剪到 [0, 10] 区间。
 * @param {number} score 原始分值。
 * @returns {number} 合法分值。
 */
function clampProfileValue(score) {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(10, Math.round(score)));
}

/**
 * 合并画像对象：
 * 1. 先应用基准画像。
 * 2. 再叠加层级修正。
 * @param {object} baseProfile 区域基准画像。
 * @param {object} adjustmentProfile 层级修正画像。
 * @returns {object} 合并后的画像。
 */
function mergeProfiles(baseProfile, adjustmentProfile) {
  return DIMENSION_KEYS.reduce((mergedProfile, dimensionKey) => {
    const baseScore = baseProfile[dimensionKey] ?? 0;
    const adjustmentScore = adjustmentProfile[dimensionKey] ?? 0;
    mergedProfile[dimensionKey] = clampProfileValue(baseScore + adjustmentScore);
    return mergedProfile;
  }, {});
}

/**
 * 解析城市层级。
 * @param {object} group 城市分组配置。
 * @param {string} cityName 城市名。
 * @returns {string} 层级 key。
 */
function resolveCityTierKey(group, cityName) {
  if (group.nationalCoreCityNames?.includes(cityName)) {
    return "nationalCore";
  }

  if (group.regionalCoreCityNames?.includes(cityName)) {
    return "regionalCore";
  }

  if (group.tourismCityNames?.includes(cityName)) {
    return "tourism";
  }

  if (group.slowLivingCityNames?.includes(cityName)) {
    return "slowLiving";
  }

  return group.defaultTierKey;
}

/**
 * 把维度分值映射为短标签。
 * @param {string} dimensionKey 维度 key。
 * @param {number} score 维度分值（0~10）。
 * @returns {string} 标签文案。
 */
function resolveDimensionTag(dimensionKey, score) {
  const copyGroup = DIMENSION_TAG_COPY[dimensionKey];
  if (!copyGroup) {
    return "";
  }

  if (score >= 8) {
    return copyGroup.high;
  }

  if (score <= 4) {
    return copyGroup.low;
  }

  return copyGroup.medium;
}

/**
 * 根据画像自动生成标签。
 * @param {object} profile 城市画像。
 * @returns {Array<string>} 标签数组。
 */
function buildTraitsFromProfile(profile) {
  const climateTrait =
    profile.climateWarm >= 8
      ? "体感偏暖，户外生活窗口更长"
      : profile.climateWarm <= 4
        ? "四季分明，偏好凉爽气候"
        : "气候相对均衡，季节体感稳定";

  const paceTrait =
    profile.paceFast >= 8
      ? "节奏偏快，机会密度较高"
      : profile.paceFast <= 4
        ? "节奏舒缓，生活压力相对可控"
        : "节奏适中，兼顾效率与松弛";

  const livingTrait =
    profile.careerTech >= 8
      ? "职业机会密集，成长路径多"
      : profile.familyFriendly >= 8
        ? "长期安居友好，生活稳定性高"
        : "生活与工作相对均衡，适合长期打磨";

  return [climateTrait, paceTrait, livingTrait];
}

/**
 * 生成城市短标签。
 * 复杂度评估：O(D log D)
 * D 为维度数（固定 8），先排序维度，再选取 2 个差异化标签。
 * @param {object} group 城市分组配置。
 * @param {string} tierKey 城市层级 key。
 * @param {string} cityName 城市名。
 * @param {object} profile 城市画像。
 * @returns {Array<string>} 短标签数组（最多 3 个）。
 */
function buildCityTags(group, tierKey, cityName, profile) {
  const overrideTags = CITY_TAG_OVERRIDES[cityName];
  if (Array.isArray(overrideTags) && overrideTags.length > 0) {
    return overrideTags.slice(0, 3);
  }

  const selectedTags = [];
  const regionTag = REGION_TAG_LABELS[group.regionKey];
  const tierTag = TIER_TAG_LABELS[tierKey];
  if (regionTag) {
    selectedTags.push(regionTag);
  }
  if (tierTag && tierTag !== regionTag) {
    selectedTags.push(tierTag);
  }

  const rankedDimensionItems = DIMENSION_KEYS.map((dimensionKey) => ({
    dimensionKey,
    score: Number(profile[dimensionKey] ?? 5),
    // 关键逻辑：按“偏离中位值 5”的幅度排序，优先选出有辨识度的维度标签。
    deviation: Math.abs(Number(profile[dimensionKey] ?? 5) - 5),
  })).sort((leftItem, rightItem) => rightItem.deviation - leftItem.deviation);

  rankedDimensionItems.forEach((dimensionItem) => {
    if (selectedTags.length >= 3) {
      return;
    }

    const dimensionTag = resolveDimensionTag(
      dimensionItem.dimensionKey,
      dimensionItem.score,
    );
    if (dimensionTag && !selectedTags.includes(dimensionTag)) {
      selectedTags.push(dimensionTag);
    }
  });

  return selectedTags.slice(0, 3);
}

/**
 * 构建单个城市画像。
 * @param {object} group 城市分组配置。
 * @param {string} cityName 城市名。
 * @returns {{ name: string, profile: object, traits: Array<string>, tags: Array<string>, province: string }} 标准城市画像。
 */
function createCityProfileItem(group, cityName) {
  const regionProfile = REGION_PROFILE_PRESETS[group.regionKey];
  const tierKey = resolveCityTierKey(group, cityName);
  const tierAdjustment = TIER_PROFILE_ADJUSTMENTS[tierKey] ?? {};

  // 关键逻辑：统一通过“区域基线 + 层级修正 + 城市覆盖”构建最终画像，保证可维护性。
  const mergedProfile = mergeProfiles(regionProfile, tierAdjustment);
  const overrideProfile = CITY_PROFILE_OVERRIDES[cityName] ?? {};
  const finalProfile = {
    ...mergedProfile,
    ...overrideProfile,
  };

  return {
    name: cityName,
    province: group.provinceName,
    profile: finalProfile,
    traits: CITY_TRAIT_OVERRIDES[cityName] ?? buildTraitsFromProfile(finalProfile),
    tags: buildCityTags(group, tierKey, cityName, finalProfile),
  };
}

/**
 * 全国城市画像库：
 * - 本地规则会在 297 个地级市上计算匹配分。
 * - 深度分析阶段只会拿本地 TopK 结果（由调用层控制）减少 AI 压力。
 */
export const CITY_PROFILES = PREFECTURE_CITY_GROUPS.flatMap((group) =>
  group.cityNames.map((cityName) => createCityProfileItem(group, cityName)),
);
