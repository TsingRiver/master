<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  testKey: {
    type: String,
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  overrideValue: {
    type: String,
    default: "",
  },
  placeholderText: {
    type: String,
    default: "",
  },
  hintText: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["apply-override", "clear-override"]);

/**
 * 输入框草稿值。
 * 关键逻辑：组件内部维护输入态，父组件只在点击“应用覆盖”时接收变更，避免每次输入都写 localStorage。
 */
const draftValue = ref("");

/**
 * 当前输入框 DOM id。
 * @returns {string} DOM id。
 */
const inputId = computed(
  () => `typeology-dev-override-input-${String(props.testKey ?? "").trim()}`,
);

/**
 * 是否存在已生效的覆盖值。
 * @returns {boolean} 是否已生效。
 */
const hasOverride = computed(() => String(props.overrideValue ?? "").trim().length > 0);

/**
 * 应用当前输入框值。
 */
function handleApplyOverride() {
  emit("apply-override", draftValue.value);
}

/**
 * 清空当前测试覆盖值。
 * 关键逻辑：先同步清空本地草稿，再通知父组件删除持久化覆盖值，避免输入框残留旧值。
 */
function handleClearOverride() {
  draftValue.value = "";
  emit("clear-override");
}

/**
 * 监听父组件覆盖值变化并回填输入框。
 * 关键逻辑：切换测试或父组件完成持久化后，输入框始终与当前测试的真实覆盖态保持一致。
 */
watch(
  () => [props.testKey, props.overrideValue],
  () => {
    draftValue.value = String(props.overrideValue ?? "").trim();
  },
  { immediate: true },
);
</script>

<template>
  <section class="typeology-dev-override-panel">
    <div class="typeology-dev-override-head">
      <h3>结果快捷设定</h3>
      <p>
        直接设定当前测试结果，便于快速查看不同组合下的页面效果。
      </p>
    </div>

    <div class="typeology-dev-override-form">
      <label :for="inputId" class="typeology-dev-override-label">
        当前测试：{{ testName }}
      </label>

      <input
        :id="inputId"
        v-model.trim="draftValue"
        class="typeology-dev-override-input"
        type="text"
        :placeholder="placeholderText"
        @keydown.enter.prevent="handleApplyOverride"
      />

      <p v-if="hintText" class="typeology-dev-override-hint">
        {{ hintText }}
      </p>

      <div class="typeology-dev-override-actions">
        <button
          type="button"
          class="typeology-dev-override-button is-primary"
          @click="handleApplyOverride"
        >
          更新结果
        </button>
        <button
          type="button"
          class="typeology-dev-override-button is-secondary"
          :disabled="!hasOverride"
          @click="handleClearOverride"
        >
          恢复默认
        </button>
      </div>

      <p v-if="hasOverride" class="typeology-dev-override-current">
        当前设定：{{ overrideValue }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.typeology-dev-override-panel {
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  border: 1px dashed rgba(116, 161, 202, 0.38);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 246, 255, 0.88));
  box-shadow: 0 12px 32px rgba(116, 161, 202, 0.12);
}

.typeology-dev-override-head h3 {
  margin: 6px 0 8px;
  font-size: 16px;
  color: #234e73;
}

.typeology-dev-override-head p:last-child {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(35, 78, 115, 0.78);
}

.typeology-dev-override-form {
  margin-top: 16px;
}

.typeology-dev-override-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #295a84;
}

.typeology-dev-override-input {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid rgba(116, 161, 202, 0.24);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  color: #1c4467;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.typeology-dev-override-input:focus {
  border-color: rgba(116, 161, 202, 0.64);
  box-shadow: 0 0 0 4px rgba(116, 161, 202, 0.12);
  transform: translateY(-1px);
}

.typeology-dev-override-hint {
  margin: 10px 2px 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(40, 79, 113, 0.76);
}

.typeology-dev-override-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.typeology-dev-override-button {
  min-height: 42px;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.typeology-dev-override-button.is-primary {
  background: linear-gradient(135deg, #74a1ca, #5d8ab5);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(93, 138, 181, 0.2);
}

.typeology-dev-override-button.is-secondary {
  background: rgba(255, 255, 255, 0.94);
  color: #3b6487;
  border: 1px solid rgba(116, 161, 202, 0.22);
}

.typeology-dev-override-button:disabled {
  opacity: 0.5;
  box-shadow: none;
}

.typeology-dev-override-current {
  margin: 12px 2px 0;
  font-size: 12px;
  color: #244f76;
}

@media (max-width: 640px) {
  .typeology-dev-override-actions {
    grid-template-columns: 1fr;
  }
}
</style>
