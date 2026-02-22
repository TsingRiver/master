/**
 * 灵魂猫咪插画资源库：
 * 关键逻辑：文件名与猫咪类型 key 一一对应，替换素材时仅需覆盖同名文件。
 */
export const SOUL_CAT_ARTWORK_LIBRARY = Object.freeze([
  {
    key: "ragdoll",
    url: "/cats/ragdoll.png",
    alt: "布偶猫插画",
  },
  {
    key: "british-shorthair",
    url: "/cats/british-shorthair.png",
    alt: "英短猫插画",
  },
  {
    key: "american-shorthair",
    url: "/cats/american-shorthair.png",
    alt: "美短猫插画",
  },
  {
    key: "siamese",
    url: "/cats/siamese.png",
    alt: "暹罗猫插画",
  },
  {
    key: "persian",
    url: "/cats/persian.png",
    alt: "波斯猫插画",
  },
  {
    key: "maine-coon",
    url: "/cats/maine-coon.png",
    alt: "缅因猫插画",
  },
  {
    key: "devon-rex",
    url: "/cats/devon-rex.png",
    alt: "德文卷毛猫插画",
  },
  {
    key: "orange-cat",
    url: "/cats/orange-cat.png",
    alt: "橘猫插画",
  },
  {
    key: "native-cat",
    url: "/cats/native-cat.png",
    alt: "狸花猫插画",
  },
]);

/**
 * 默认插画资源：
 * 关键逻辑：当 key 不可识别时使用稳定兜底图，避免结果页出现破图。
 */
export const SOUL_CAT_DEFAULT_ARTWORK = Object.freeze({
  url: "/cats/cover-cat.svg",
  alt: "灵魂猫咪默认插画",
});

/**
 * 插画索引表：
 * 复杂度评估：初始化 O(N)，N 为插画数量（固定 9），只在模块加载执行一次。
 */
const SOUL_CAT_ARTWORK_INDEX = Object.freeze(
  SOUL_CAT_ARTWORK_LIBRARY.reduce((indexMap, artworkItem) => {
    const normalizedKey = String(artworkItem.key ?? "").trim();
    if (!normalizedKey) {
      return indexMap;
    }

    indexMap[normalizedKey] = {
      key: normalizedKey,
      url: String(artworkItem.url ?? "").trim(),
      alt: String(artworkItem.alt ?? "").trim(),
    };
    return indexMap;
  }, {}),
);

/**
 * 根据猫咪类型 key 获取插画资源。
 * 复杂度评估：O(1)
 * @param {string} profileKey 猫咪类型 key。
 * @returns {{ key: string, url: string, alt: string }} 插画资源对象。
 */
export function resolveSoulCatArtworkByKey(profileKey) {
  const normalizedKey = String(profileKey ?? "").trim();
  const artworkItem = SOUL_CAT_ARTWORK_INDEX[normalizedKey];
  if (artworkItem && artworkItem.url) {
    return artworkItem;
  }

  return {
    key: "fallback",
    ...SOUL_CAT_DEFAULT_ARTWORK,
  };
}

/**
 * 构建封面轮播插画池。
 * 复杂度评估：O(N)
 * @returns {Array<{ key: string, url: string, alt: string }>} 可轮播插画列表。
 */
export function buildSoulCatCoverArtworkPool() {
  return SOUL_CAT_ARTWORK_LIBRARY.map((artworkItem) => ({
    key: String(artworkItem.key ?? "").trim(),
    url: String(artworkItem.url ?? "").trim(),
    alt: String(artworkItem.alt ?? "").trim(),
  })).filter((artworkItem) => Boolean(artworkItem.url));
}
