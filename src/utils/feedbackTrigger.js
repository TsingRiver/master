/**
 * 评价弹窗触发逻辑：
 * 关键逻辑：通过 localStorage 缓存弹窗状态，每个测试模块只弹出一次（不论用户是否操作）。
 */

/**
 * localStorage 缓存前缀。
 */
const FEEDBACK_SHOWN_PREFIX = "asking_feedback_shown_";

/**
 * 构建缓存 key。
 * @param {string} themeKey 测试主题 key（如 "city"、"mbti"）。
 * @returns {string} localStorage 存储 key。
 */
function buildStorageKey(themeKey) {
  return `${FEEDBACK_SHOWN_PREFIX}${String(themeKey ?? "").trim()}`;
}

/**
 * 判断是否应展示评价弹窗。
 * 关键逻辑：检查 localStorage 中对应主题的弹窗状态，已弹出过则不再弹出。
 * @param {string} themeKey 测试主题 key。
 * @returns {boolean} 是否应弹出。
 */
export function shouldShowFeedback(themeKey) {
  // 当被动配置明确关闭时（'false' 表示禁用被动意见反馈弹窗）
  if (import.meta.env.VITE_ENABLE_PASSIVE_FEEDBACK === 'false') {
    return false;
  }

  const storageKey = buildStorageKey(themeKey);

  try {
    return localStorage.getItem(storageKey) !== "1";
  } catch {
    /* 关键逻辑：无痕模式或存储被禁用时，默认不弹出，避免每次都弹。 */
    return false;
  }
}

/**
 * 标记评价弹窗已展示。
 * 关键逻辑：一旦弹出即标记，不论用户是否操作，下次不再弹出。
 * @param {string} themeKey 测试主题 key。
 */
export function markFeedbackShown(themeKey) {
  const storageKey = buildStorageKey(themeKey);

  try {
    localStorage.setItem(storageKey, "1");
  } catch {
    /* 关键逻辑：写入失败时静默忽略，不影响主流程。 */
  }
}

/**
 * 反馈 API 基础地址。
 * 关键逻辑：生产环境使用环境变量配置的地址，开发环境回退到本地。
 */
const FEEDBACK_API_BASE_URL = String(
  import.meta.env.VITE_FEEDBACK_API_BASE_URL ?? "",
).trim();

/**
 * 构建完整 API 地址。
 * @param {string} path API 路径。
 * @returns {string} 完整 URL。
 */
function buildApiUrl(path) {
  if (FEEDBACK_API_BASE_URL) {
    return `${FEEDBACK_API_BASE_URL}${path}`;
  }

  return path;
}

/**
 * 提交反馈到后端。
 * @param {{ type: "rating"|"suggestion", rating: "like"|"dislike", content?: string, modulePath: string }} params 反馈参数。
 * @returns {Promise<{ ok: boolean }>} 提交结果。
 */
export async function submitFeedback(params) {
  try {
    const response = await fetch(buildApiUrl("/api/feedback/submit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: params.type,
        rating: params.rating,
        content: params.content ?? "",
        modulePath: params.modulePath,
      }),
    });

    if (!response.ok) {
      return { ok: false };
    }

    const result = await response.json();
    return { ok: Boolean(result?.ok) };
  } catch {
    /* 关键逻辑：网络异常时静默失败，不影响用户体验。 */
    return { ok: false };
  }
}
