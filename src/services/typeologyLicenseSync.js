import {
  clearLicenseTypeologyResults,
  readLicenseAccessContext,
  readLicenseTypeologyResults,
  upsertLicenseTypeologyResult,
} from "./licenseClient";
import {
  loadTypeologyResultCache,
  saveTypeologyResultCache,
} from "./typeologyStorage";
import { sanitizeTypeologyResult } from "./mbtiResultIntegrity";
import { resolveLicenseScopePath } from "../config/licenseAccess";

/**
 * 云端清空待同步标记前缀：
 * 关键逻辑：当本地已清空但远端删除失败时，用该标记阻止旧云端结果重新覆盖回来。
 */
const TYPEOLOGY_REMOTE_CLEAR_PENDING_KEY_PREFIX =
  "asking_typeology_remote_clear_pending_v1_";

/**
 * 从主题配置解析当前结果同步目标路径。
 * @param {object} themeConfig 当前主题配置。
 * @returns {string} 当前主题对应的 canonical path。
 */
export function resolveTypeologySyncTargetPath(themeConfig) {
  const routePathList = Array.isArray(themeConfig?.routePaths)
    ? themeConfig.routePaths
    : [];
  const primaryRoutePath = String(routePathList[0] ?? "").trim();
  return resolveLicenseScopePath(primaryRoutePath) ?? primaryRoutePath ?? "";
}

/**
 * 判断缓存中是否已有至少一份结果。
 * @param {Record<string, object>} cacheObject 本地结果缓存。
 * @returns {boolean} 是否存在结果。
 */
export function hasTypeologyCachedResults(cacheObject) {
  return Object.keys(cacheObject ?? {}).length > 0;
}

/**
 * 读取当前授权上下文下的结果同步状态。
 * @param {string} targetPath 当前业务路径。
 * @returns {{ syncEnabled: boolean, licenseId: string, scopePath: string, hasRemoteResults: boolean, remoteTestKeys: Array<string>, latestUpdatedAt: string | null, hasPendingRemoteClear: boolean }} 同步状态。
 */
export function readTypeologyLicenseSyncState(targetPath) {
  const licenseAccessContext = readLicenseAccessContext(targetPath);
  const normalizedLicenseId = String(licenseAccessContext?.licenseId ?? "").trim();
  const remoteSummary =
    licenseAccessContext?.typeologyResultSummary &&
    typeof licenseAccessContext.typeologyResultSummary === "object"
      ? licenseAccessContext.typeologyResultSummary
      : null;

  return {
    syncEnabled: Boolean(normalizedLicenseId),
    licenseId: normalizedLicenseId,
    scopePath: String(licenseAccessContext?.scopePath ?? "").trim(),
    hasRemoteResults: Boolean(remoteSummary?.hasAnyResult),
    remoteTestKeys: Array.isArray(remoteSummary?.testKeys)
      ? remoteSummary.testKeys
      : [],
    latestUpdatedAt: remoteSummary?.latestUpdatedAt ?? null,
    hasPendingRemoteClear: readPendingRemoteClearFlag(targetPath),
  };
}

/**
 * 构建远端清空待同步标记键。
 * @param {string} licenseId 授权码 ID。
 * @returns {string} localStorage 键。
 */
function buildPendingRemoteClearStorageKey(licenseId) {
  return `${TYPEOLOGY_REMOTE_CLEAR_PENDING_KEY_PREFIX}${licenseId}`;
}

/**
 * 读取远端清空待同步标记。
 * @param {string} targetPath 当前业务路径。
 * @returns {boolean} 是否存在待同步清空任务。
 */
function readPendingRemoteClearFlag(targetPath) {
  const licenseAccessContext = readLicenseAccessContext(targetPath);
  const normalizedLicenseId = String(licenseAccessContext?.licenseId ?? "").trim();
  if (!normalizedLicenseId) {
    return false;
  }

  try {
    return Boolean(
      window.localStorage.getItem(
        buildPendingRemoteClearStorageKey(normalizedLicenseId),
      ),
    );
  } catch {
    return false;
  }
}

/**
 * 写入远端清空待同步标记。
 * @param {string} targetPath 当前业务路径。
 * @param {boolean} pending 是否处于待同步状态。
 */
function persistPendingRemoteClearFlag(targetPath, pending) {
  const licenseAccessContext = readLicenseAccessContext(targetPath);
  const normalizedLicenseId = String(licenseAccessContext?.licenseId ?? "").trim();
  if (!normalizedLicenseId) {
    return;
  }

  const storageKey = buildPendingRemoteClearStorageKey(normalizedLicenseId);
  try {
    if (pending) {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          pending: true,
          updatedAt: Date.now(),
        }),
      );
      return;
    }

    window.localStorage.removeItem(storageKey);
  } catch {
    // 关键逻辑：清空待同步标记失败时不阻断主流程，最多退化为远端状态延迟校准。
  }
}

/**
 * 构建可入库的 MBTI 本地结果快照。
 * 关键逻辑：保留 AI 再生成所需的最小字段集，避免把答卷明细整包写入数据库。
 * @param {object|null|undefined} mbtiLocalResult 原始 MBTI 本地结果。
 * @returns {object|null} 可持久化的 MBTI 子快照。
 */
function buildPersistableMbtiLocalResult(mbtiLocalResult) {
  if (!mbtiLocalResult || typeof mbtiLocalResult !== "object") {
    return null;
  }

  return {
    topType: mbtiLocalResult.topType ?? null,
    topThree: Array.isArray(mbtiLocalResult.topThree)
      ? mbtiLocalResult.topThree.map((typeItem) => ({
          type: String(typeItem?.type ?? "").trim(),
          title: String(typeItem?.title ?? "").trim(),
          score: Number(typeItem?.score ?? 0) || 0,
        }))
      : [],
    scoredTypes: Array.isArray(mbtiLocalResult.scoredTypes)
      ? mbtiLocalResult.scoredTypes.map((typeItem) => ({
          type: String(typeItem?.type ?? "").trim(),
          title: String(typeItem?.title ?? "").trim(),
          score: Number(typeItem?.score ?? 0) || 0,
        }))
      : [],
    axisScores:
      mbtiLocalResult.axisScores && typeof mbtiLocalResult.axisScores === "object"
        ? mbtiLocalResult.axisScores
        : {},
    summaryLines: Array.isArray(mbtiLocalResult.summaryLines)
      ? mbtiLocalResult.summaryLines
      : [],
    localNarrative: String(mbtiLocalResult.localNarrative ?? "").trim(),
  };
}

/**
 * 构建可入库的结果快照。
 * 关键逻辑：
 * 1. 仅保留展示与 AI 再生成所需字段；
 * 2. 删除答卷明细、整份 scoreBoard 等高体积字段，降低长期存储成本。
 * @param {object} resultPayload 原始结果对象。
 * @returns {object} 可安全入库的结果快照。
 */
export function createPersistableTypeologyResultSnapshot(resultPayload) {
  if (!resultPayload || typeof resultPayload !== "object") {
    return {};
  }

  const persistableSnapshot = {
    testKey: String(resultPayload.testKey ?? "").trim(),
    testName: String(resultPayload.testName ?? "").trim(),
    modeKey: String(resultPayload.modeKey ?? "").trim(),
    modeLabel: String(resultPayload.modeLabel ?? "").trim(),
    questionCount: Number(resultPayload.questionCount ?? 0) || 0,
    completedAt: Number(resultPayload.completedAt ?? Date.now()) || Date.now(),
    source: String(resultPayload.source ?? "local").trim() || "local",
    displayValue: String(resultPayload.displayValue ?? "").trim(),
    mainResult:
      resultPayload.mainResult && typeof resultPayload.mainResult === "object"
        ? resultPayload.mainResult
        : null,
    topThree: Array.isArray(resultPayload.topThree) ? resultPayload.topThree : [],
    summaryLines: Array.isArray(resultPayload.summaryLines)
      ? resultPayload.summaryLines
      : [],
    insight: String(resultPayload.insight ?? "").trim(),
    summaryText: String(resultPayload.summaryText ?? "").trim(),
    detailTags: Array.isArray(resultPayload.detailTags)
      ? resultPayload.detailTags
      : [],
    detailActions: Array.isArray(resultPayload.detailActions)
      ? resultPayload.detailActions
      : [],
    scoreLabel: String(resultPayload.scoreLabel ?? "").trim(),
    dualHighProfile:
      resultPayload.dualHighProfile &&
      typeof resultPayload.dualHighProfile === "object"
        ? resultPayload.dualHighProfile
        : null,
    aiInsight:
      resultPayload.aiInsight && typeof resultPayload.aiInsight === "object"
        ? resultPayload.aiInsight
        : null,
    softInterventionMeta:
      resultPayload.softInterventionMeta &&
      typeof resultPayload.softInterventionMeta === "object"
        ? resultPayload.softInterventionMeta
        : null,
  };

  const mbtiLocalResult = buildPersistableMbtiLocalResult(
    resultPayload.mbtiLocalResult,
  );
  if (mbtiLocalResult) {
    persistableSnapshot.mbtiLocalResult = mbtiLocalResult;
  }

  return sanitizeTypeologyResult(persistableSnapshot);
}

/**
 * 尝试冲刷远端待清空任务。
 * @param {string} targetPath 当前业务路径。
 * @returns {Promise<{ ok: boolean, skipped: boolean, error?: Error }>} 执行结果。
 */
async function flushPendingTypeologyResultClear(targetPath) {
  if (!readPendingRemoteClearFlag(targetPath)) {
    return {
      ok: true,
      skipped: true,
    };
  }

  try {
    await clearLicenseTypeologyResults(targetPath);
    persistPendingRemoteClearFlag(targetPath, false);
    return {
      ok: true,
      skipped: false,
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error,
    };
  }
}

/**
 * 增量同步单条结果到授权码。
 * @param {{ targetPath: string, testKey: string, resultPayload: object }} payload 同步参数。
 * @returns {Promise<{ ok: boolean, skipped: boolean, error?: Error }>} 同步结果。
 */
export async function syncTypeologyResultToLicense(payload) {
  const syncState = readTypeologyLicenseSyncState(payload.targetPath);
  if (!syncState.syncEnabled) {
    return {
      ok: true,
      skipped: true,
    };
  }

  const clearFlushResult = await flushPendingTypeologyResultClear(payload.targetPath);
  if (!clearFlushResult.ok) {
    return {
      ok: false,
      skipped: false,
      error: clearFlushResult.error,
    };
  }

  try {
    await upsertLicenseTypeologyResult({
      targetPath: payload.targetPath,
      testKey: payload.testKey,
      resultPayload: createPersistableTypeologyResultSnapshot(payload.resultPayload),
    });
    return {
      ok: true,
      skipped: false,
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error,
    };
  }
}

/**
 * 从授权码恢复结果，并且只补本地缺失的测试，不覆盖已有结果。
 * @param {{ targetPath: string, currentCacheObject?: Record<string, object> }} payload 恢复参数。
 * @returns {Promise<{ restoredCount: number, resultCache: Record<string, object>, skippedReason: string | null }>} 恢复结果。
 */
export async function restoreTypeologyResultCacheFromLicense(payload) {
  const normalizedTargetPath = String(payload.targetPath ?? "").trim();
  const currentCacheObject =
    payload.currentCacheObject && typeof payload.currentCacheObject === "object"
      ? payload.currentCacheObject
      : loadTypeologyResultCache({ targetPath: normalizedTargetPath });
  const syncState = readTypeologyLicenseSyncState(normalizedTargetPath);

  if (!syncState.syncEnabled) {
    return {
      restoredCount: 0,
      resultCache: currentCacheObject,
      skippedReason: "SYNC_DISABLED",
    };
  }

  const clearFlushResult = await flushPendingTypeologyResultClear(normalizedTargetPath);
  if (!clearFlushResult.ok) {
    return {
      restoredCount: 0,
      resultCache: currentCacheObject,
      skippedReason: "REMOTE_CLEAR_PENDING",
    };
  }

  const remoteResultData = await readLicenseTypeologyResults(normalizedTargetPath);
  const remoteResultMap =
    remoteResultData?.resultMap && typeof remoteResultData.resultMap === "object"
      ? remoteResultData.resultMap
      : {};

  const nextCacheObject = {
    ...currentCacheObject,
  };
  let restoredCount = 0;

  Object.entries(remoteResultMap).forEach(([testKey, resultPayload]) => {
    if (nextCacheObject[testKey]) {
      return;
    }

    nextCacheObject[testKey] = sanitizeTypeologyResult(resultPayload);
    restoredCount += 1;
  });

  if (restoredCount > 0) {
    saveTypeologyResultCache(nextCacheObject, {
      targetPath: normalizedTargetPath,
    });
  }

  return {
    restoredCount,
    resultCache: nextCacheObject,
    skippedReason: null,
  };
}

/**
 * 清空授权码绑定的远端结果。
 * 关键逻辑：先写入待同步标记，再请求远端删除，确保中途失败时不会把旧云端结果重新拉回本地。
 * @param {string} targetPath 当前业务路径。
 * @returns {Promise<{ ok: boolean, skipped: boolean, pending: boolean, error?: Error }>} 清空结果。
 */
export async function clearTypeologyResultsFromLicense(targetPath) {
  const syncState = readTypeologyLicenseSyncState(targetPath);
  if (!syncState.syncEnabled) {
    return {
      ok: true,
      skipped: true,
      pending: false,
    };
  }

  persistPendingRemoteClearFlag(targetPath, true);

  try {
    await clearLicenseTypeologyResults(targetPath);
    persistPendingRemoteClearFlag(targetPath, false);
    return {
      ok: true,
      skipped: false,
      pending: false,
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      pending: true,
      error,
    };
  }
}
