<template>
  <!-- 关键逻辑：全屏半透明遮罩 + 居中卡片，点击遮罩关闭 -->
  <Transition name="suggestion-fade">
    <div v-if="visible" class="suggestion-overlay" @click.self="handleClose">
      <div class="suggestion-card">
        <!-- 关闭按钮 -->
        <button class="suggestion-close-btn" @click="handleClose" aria-label="关闭">×</button>

        <h2 class="suggestion-title">意见反馈</h2>

        <!-- 情绪选择：喜欢 / 不喜欢 -->
        <div class="suggestion-sentiment-row">
          <button
            class="suggestion-sentiment-btn"
            :class="{ 'sentiment-active': selectedSentiment === 'like' }"
            @click="selectedSentiment = 'like'"
          >
            <!-- 笑脸 SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 512 512">
              <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
            </svg>
            <span>喜欢</span>
          </button>
          <button
            class="suggestion-sentiment-btn"
            :class="{ 'sentiment-active': selectedSentiment === 'dislike' }"
            @click="selectedSentiment = 'dislike'"
          >
            <!-- 苦脸 SVG -->
            <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 0 512 512">
              <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM174.6 384.1c-4.5 12.5-18.2 18.9-30.7 14.4s-18.9-18.2-14.4-30.7C146.9 319.4 198.9 288 256 288s109.1 31.4 126.6 79.9c4.5 12.5-2 26.2-14.4 30.7s-26.2-2-30.7-14.4C328.2 358.5 297.2 336 256 336s-72.2 22.5-81.4 48.1zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
            </svg>
            <span>不喜欢</span>
          </button>
        </div>

        <!-- 建议文本输入 -->
        <textarea
          v-model="suggestionText"
          class="suggestion-textarea"
          placeholder="请写下你的建议或想法..."
          maxlength="2000"
          rows="4"
        ></textarea>

        <!-- 提交按钮 -->
        <button
          class="suggestion-submit-btn"
          :disabled="isSubmitting || !selectedSentiment"
          @click="handleSubmit"
        >
          <template v-if="isSubmitting">提交中...</template>
          <template v-else-if="submitSuccess">已提交 ✓</template>
          <template v-else>
            <!-- 发送图标 -->
            <svg fill="none" viewBox="0 0 24 24" height="18px" width="18px" xmlns="http://www.w3.org/2000/svg">
              <path stroke="currentColor" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M7.39999 6.32003L15.89 3.49003C19.7 2.22003 21.77 4.30003 20.51 8.11003L17.68 16.6C15.78 22.31 12.66 22.31 10.76 16.6L9.91999 14.08L7.39999 13.24C1.68999 11.34 1.68999 8.23003 7.39999 6.32003Z"></path>
              <path stroke="currentColor" stroke-linejoin="round" stroke-linecap="round" stroke-width="1.5" d="M10.11 13.6501L13.69 10.0601"></path>
            </svg>
            发送
          </template>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from "vue";
import { submitFeedback } from "../utils/feedbackTrigger";

/**
 * 组件 Props。
 */
const props = defineProps({
  /** 是否显示弹窗 */
  visible: { type: Boolean, default: false },
  /** 当前测试模块路径 */
  modulePath: { type: String, default: "" },
});

const emit = defineEmits(["close"]);

/** 选中的情绪：'like' | 'dislike' | '' */
const selectedSentiment = ref("");

/** 建议文本 */
const suggestionText = ref("");

/** 是否正在提交 */
const isSubmitting = ref(false);

/** 是否提交成功 */
const submitSuccess = ref(false);

/**
 * 重置所有表单状态。
 */
function resetForm() {
  selectedSentiment.value = "";
  suggestionText.value = "";
  isSubmitting.value = false;
  submitSuccess.value = false;
}

/**
 * 关闭弹窗。
 */
function handleClose() {
  emit("close");
}

/**
 * 提交建议。
 * 关键逻辑：提交后显示成功状态 1.5s，然后自动关闭弹窗。
 */
async function handleSubmit() {
  if (!selectedSentiment.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  await submitFeedback({
    type: "suggestion",
    rating: selectedSentiment.value,
    content: suggestionText.value.trim(),
    modulePath: props.modulePath,
  });

  isSubmitting.value = false;
  submitSuccess.value = true;

  /* 关键逻辑：提交成功后 1.5s 自动关闭弹窗 */
  setTimeout(() => {
    handleClose();
  }, 1500);
}

/**
 * 监听 visible 变化：打开时重置表单。
 */
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      resetForm();
    }
  },
);
</script>

<style scoped>
/* ============ 过渡动画 ============ */
.suggestion-fade-enter-active,
.suggestion-fade-leave-active {
  transition: opacity 0.3s ease;
}

.suggestion-fade-enter-from,
.suggestion-fade-leave-to {
  opacity: 0;
}

.suggestion-fade-enter-active .suggestion-card {
  animation: suggestion-slide-up 0.35s ease-out;
}

@keyframes suggestion-slide-up {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ============ 全屏遮罩 ============ */
.suggestion-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* ============ 卡片容器 ============ */
.suggestion-card {
  position: relative;
  width: 90%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

/* ============ 关闭按钮 ============ */
.suggestion-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #999;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s ease;
  line-height: 1;
}

.suggestion-close-btn:hover {
  color: #666;
  background: rgba(0, 0, 0, 0.06);
}

/* ============ 标题 ============ */
.suggestion-title {
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

/* ============ 情绪选择行 ============ */
.suggestion-sentiment-row {
  display: flex;
  gap: 12px;
  margin-bottom: 1rem;
  justify-content: center;
}

.suggestion-sentiment-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  background: rgba(248, 248, 248, 0.8);
  cursor: pointer;
  transition: 0.25s ease all;
  color: #666;
  font-size: 13px;
}

.suggestion-sentiment-btn svg {
  fill: #999;
  transition: 0.25s ease fill;
}

.suggestion-sentiment-btn:hover {
  border-color: #bbb;
  background: rgba(240, 240, 240, 0.9);
}

.suggestion-sentiment-btn:hover svg {
  fill: #666;
}

/* 选中态 */
.sentiment-active {
  border-color: #7ec8e3;
  background: rgba(126, 200, 227, 0.1);
  color: #2a8ab0;
}

.sentiment-active svg {
  fill: #2a8ab0;
}

/* ============ 文本域 ============ */
.suggestion-textarea {
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  background: rgba(248, 248, 248, 0.8);
  outline: none;
  resize: none;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;
}

.suggestion-textarea::placeholder {
  color: #aaa;
}

.suggestion-textarea:focus {
  border-color: #7ec8e3;
}

/* ============ 提交按钮 ============ */
.suggestion-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 1rem;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ec8e3, #a0d2db);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s ease all;
}

.suggestion-submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6bb8d5, #90c5cf);
  box-shadow: 0 4px 12px rgba(126, 200, 227, 0.35);
}

.suggestion-submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.suggestion-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
