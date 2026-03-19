<template>
  <section class="license-auth-shell">
    <div class="license-auth-panel">
      <p class="license-auth-eyebrow">License Access</p>
      <h1 class="license-auth-title">输入授权码后继续访问</h1>
      <p class="license-auth-description">
        当前申请访问：<strong>{{ targetPath }}</strong>
      </p>

      <div class="license-auth-form">
        <label class="license-auth-label" for="license-code-input"
          >授权码</label
        >
        <input
          id="license-code-input"
          v-model.trim="licenseCode"
          class="license-auth-input"
          type="text"
          autocomplete="one-time-code"
          placeholder="请输入授权码"
          :disabled="submitting || checkingSession"
          @keyup.enter="handleSubmit"
        />

        <button
          class="license-auth-button"
          type="button"
          :disabled="!licenseCode || submitting || checkingSession"
          @click="handleSubmit"
        >
          {{ submitting ? "授权中..." : "验证并进入" }}
        </button>
        <p class="license-auth-purchase-tip">
          如尚未购买或需获取授权码，请联系客服。
        </p>
      </div>

      <p v-if="statusMessage" class="license-auth-status" :class="statusClass">
        {{ statusMessage }}
      </p>

      <p class="license-auth-tip">
        授权成功后将绑定当前浏览器环境；<br />同一授权码默认最多可绑定 2 个浏览
        器环境，超出名额后会被拒绝。
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import {
  activateLicenseAccess,
  checkLicenseSession,
  clearLicenseSessionToken,
  persistLicenseSessionToken,
} from "../services/licenseClient";

const props = defineProps({
  /**
   * 当前要申请的授权范围路径。
   */
  targetPath: {
    type: String,
    required: true,
  },
  /**
   * URL 中预填的授权码。
   */
  prefillCode: {
    type: String,
    default: "",
  },
});

const licenseCode = ref("");
const submitting = ref(false);
const checkingSession = ref(false);
const statusMessage = ref("");
const statusType = ref("");

/**
 * 状态文案样式类。
 */
const statusClass = computed(() =>
  statusType.value ? `license-auth-status--${statusType.value}` : "",
);

/**
 * 跳转到授权通过后的目标页。
 */
function navigateToTarget() {
  window.location.replace(props.targetPath);
}

/**
 * 将后端错误码映射为用户可读文案。
 * @param {string} errorCode 后端错误码。
 * @returns {string} 展示文案。
 */
function resolveErrorMessage(errorCode) {
  const errorMessageMap = {
    LICENSE_API_BASE_URL_MISSING:
      "未配置授权服务地址，请先补充 VITE_LICENSE_API_BASE_URL。",
    LICENSE_CODE_NOT_FOUND: "授权码不存在，请检查后重试。",
    LICENSE_CODE_DISABLED: "该授权码已停用，请联系管理员。",
    LICENSE_USAGE_LIMIT_REACHED:
      "该授权码可绑定的浏览器环境名额已用完，请联系管理员增加名额。",
    DEVICE_ID_REQUIRED: "当前浏览器环境标识异常，请刷新后重试。",
    DEVICE_MISMATCH: "当前浏览器环境与授权会话不一致，请重新输入授权码。",
    DEVICE_NOT_BOUND: "当前浏览器环境尚未绑定到该授权码，请重新输入授权码。",
    UNSUPPORTED_SCOPE_PATH: "当前页面不在授权范围内，请联系管理员。",
    INVALID_SESSION: "会话已失效，请重新输入授权码。",
    LICENSE_INACTIVE: "该授权码已失效，请联系管理员。",
    SCOPE_NOT_GRANTED:
      "该授权码尚未获得当前页面的访问权限，请输入授权码继续授权。",
    SESSION_MISSING: "",
  };

  if (errorCode in errorMessageMap) {
    return errorMessageMap[errorCode];
  }

  return `授权失败 (${errorCode})，请检查网络或稍后重试。`;
}

/**
 * 尝试复用现有会话。
 * 关键逻辑：若 Cookie 已拥有当前页面权限，则直接跳转，避免用户重复输入授权码。
 * @returns {Promise<void>} 校验完成。
 */
async function tryRestoreSession() {
  checkingSession.value = true;

  try {
    const validationResult = await checkLicenseSession(props.targetPath);
    if (validationResult.valid) {
      if (validationResult.sessionToken) {
        persistLicenseSessionToken(validationResult.sessionToken);
      }
      navigateToTarget();
      return;
    }

    const messageText = resolveErrorMessage(validationResult.reason);
    if (messageText) {
      statusMessage.value = messageText;
      statusType.value = "warning";
    }
  } catch (error) {
    const errorCode = String(error?.code ?? error?.message ?? "").trim();
    const messageText = resolveErrorMessage(errorCode);
    if (messageText) {
      statusMessage.value = messageText;
      statusType.value = "warning";
    }

    // 关键逻辑：会话异常时主动清理本地 Cookie，避免后续页面继续带着无效会话循环跳转。
    clearLicenseSessionToken();
  } finally {
    checkingSession.value = false;
  }
}

/**
 * 提交授权码。
 * @returns {Promise<void>} 提交完成。
 */
async function handleSubmit() {
  if (!licenseCode.value || submitting.value) {
    return;
  }

  submitting.value = true;
  statusMessage.value = "正在校验授权码...";
  statusType.value = "warning";

  try {
    const activationResult = await activateLicenseAccess({
      code: licenseCode.value,
      targetPath: props.targetPath,
    });

    persistLicenseSessionToken(activationResult.sessionToken);
    statusMessage.value = "授权成功，正在进入页面...";
    statusType.value = "success";
    navigateToTarget();
  } catch (error) {
    const errorCode = String(error?.code ?? error?.message ?? "").trim();
    statusMessage.value = resolveErrorMessage(errorCode);
    statusType.value = "error";
  } finally {
    submitting.value = false;
  }
}

/**
 * 首次进入授权页时优先尝试复用旧会话。
 */
onMounted(() => {
  void tryRestoreSession();
});

/**
 * 同步 URL 传入的授权码。
 * 关键逻辑：只负责自动填入输入框，不自动提交，避免用户误触发重复消耗次数。
 */
watch(
  () => props.prefillCode,
  (nextCode) => {
    const normalizedCode = String(nextCode ?? "")
      .trim()
      .toUpperCase();
    if (!normalizedCode) {
      return;
    }

    licenseCode.value = normalizedCode;
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.license-auth-shell {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(
      circle at top left,
      rgba(128, 90, 213, 0.24),
      transparent 42%
    ),
    radial-gradient(
      circle at bottom right,
      rgba(94, 85, 116, 0.28),
      transparent 40%
    ),
    linear-gradient(180deg, #f7f5fb 0%, #ede9f7 100%);
}

.license-auth-panel {
  width: min(100%, 460px);
  padding: 28px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(94, 85, 116, 0.14);
  box-shadow: 0 28px 60px rgba(94, 85, 116, 0.14);
  display: grid;
  gap: 16px;
}

.license-auth-eyebrow {
  margin: 0;
  color: #7c6f99;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.license-auth-title {
  margin: 0;
  color: #2f2a3b;
  font-size: 28px;
  line-height: 1.3;
}

.license-auth-description,
.license-auth-tip {
  margin: 0;
  color: #615a73;
  line-height: 1.7;
}

.license-auth-form {
  display: grid;
  gap: 12px;
}

.license-auth-label {
  color: #413954;
  font-size: 14px;
  font-weight: 600;
}

.license-auth-input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(94, 85, 116, 0.2);
  color: #2f2a3b;
  background: #ffffff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.license-auth-input:focus {
  border-color: #5e5574;
  box-shadow: 0 0 0 4px rgba(94, 85, 116, 0.12);
}

.license-auth-button {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  background: #5e5574;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.license-auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.license-auth-purchase-tip {
  margin: 0;
  color: #615a73;
  font-size: 13px;
  text-align: center;
}

.license-auth-status {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.6;
  background: rgba(94, 85, 116, 0.08);
  color: #5e5574;
}

.license-auth-status--success {
  background: rgba(6, 95, 70, 0.08);
  color: #065f46;
}

.license-auth-status--warning {
  background: rgba(146, 64, 14, 0.08);
  color: #92400e;
}

.license-auth-status--error {
  background: rgba(185, 28, 28, 0.08);
  color: #b91c1c;
}

@media (max-width: 640px) {
  .license-auth-shell {
    padding: 16px;
  }

  .license-auth-panel {
    padding: 22px;
    border-radius: 20px;
  }

  .license-auth-title {
    font-size: 24px;
  }
}
</style>
