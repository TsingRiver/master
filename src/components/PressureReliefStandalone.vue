<template>
  <div class="relief-page">
    <div class="relief-orb relief-orb--sage" aria-hidden="true"></div>
    <div class="relief-orb relief-orb--lavender" aria-hidden="true"></div>

    <main class="relief-shell" aria-live="polite">
      <template v-if="stage === 'home'">
        <header class="relief-home-header relief-fade-in">
          <p class="relief-brand">脑袋放气站</p>
          <h1>你的脑袋，<br />该放放气了吗？</h1>
          <p class="relief-home-subtitle">
            觉得自己压力不大？快看看你最近的状态。
          </p>
        </header>

        <section class="relief-home-card relief-fade-in" aria-label="测试简介">
          <img
            class="relief-home-illustration"
            src="/pressure-relief/home-cloud.webp"
            alt="趴在软垫上的小气团，身边有解压球和方便面"
          />
          <p class="relief-info-pill">12 道小题 · 约 1 分钟 · 附一份放松小建议</p>
          <button class="relief-button relief-button--primary" type="button" @click="startQuiz">
            看看我是哪颗气团
          </button>
          <p class="relief-home-tip">按第一反应选就好，没有标准答案。</p>
        </section>
      </template>

      <template v-else-if="stage === 'quiz' && currentQuestion">
        <header class="relief-quiz-header">
          <button class="relief-text-button" type="button" @click="goPreviousQuestion">
            <span aria-hidden="true">←</span> 上一题
          </button>
          <p class="relief-count">{{ formattedQuestionNumber }} / 12</p>
        </header>

        <div
          class="relief-progress-track"
          role="progressbar"
          aria-label="答题进度"
          :aria-valuemin="0"
          :aria-valuemax="12"
          :aria-valuenow="currentQuestionIndex + 1"
        >
          <span class="relief-progress-fill" :style="{ width: `${progressPercent}%` }"></span>
        </div>

        <section class="relief-question-card relief-question-enter" :key="currentQuestion.id">
          <p v-if="currentQuestion.timeNote" class="relief-time-pill">
            {{ currentQuestion.timeNote }}
          </p>
          <img
            class="relief-question-illustration"
            src="/pressure-relief/home-cloud.webp"
            alt=""
            aria-hidden="true"
          />
          <p class="relief-question-kicker">{{ currentQuestion.title }}</p>
          <h1 class="relief-question-title">{{ currentQuestion.prompt }}</h1>

          <div class="relief-option-list" role="radiogroup" :aria-label="currentQuestion.prompt">
            <button
              v-for="option in currentQuestion.options"
              :key="option.id"
              class="relief-option"
              :class="{ 'is-selected': answers[currentQuestion.id] === option.id }"
              type="button"
              role="radio"
              :aria-checked="answers[currentQuestion.id] === option.id"
              :disabled="isOptionLocked"
              @click="selectOption(option.id)"
            >
              <span class="relief-option-mark" aria-hidden="true">{{ option.id }}</span>
              <span>{{ option.label }}</span>
              <span class="relief-option-check" aria-hidden="true">✓</span>
            </button>
          </div>

          <button
            v-if="isLastQuestion"
            class="relief-button relief-button--primary relief-submit-button"
            type="button"
            :disabled="!answers[currentQuestion.id]"
            @click="submitQuiz"
          >
            看看我的气团
          </button>
        </section>
      </template>

      <template v-else-if="stage === 'result' && resultSnapshot">
        <section class="relief-result-head relief-fade-in">
          <p class="relief-brand">脑袋放气站</p>
          <h1>{{ resultConfig.title }}</h1>
          <img
            class="relief-result-hero"
            :src="resultConfig.heroImage"
            :alt="resultConfig.heroAlt"
          />
          <p class="relief-result-subtitle">{{ resultConfig.subtitle }}</p>
        </section>

        <section class="relief-pressure-card" aria-label="当下压力值">
          <div class="relief-pressure-card-heading">
            <p>当下压力值</p>
            <strong>{{ resultSnapshot.pressureValue }} <small>/ 100</small></strong>
          </div>
          <div
            class="relief-pressure-meter"
            :class="{ 'is-ready': isMeterReady, 'is-static': isRestoredResult }"
            role="meter"
            aria-label="当下压力值"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="resultSnapshot.pressureValue"
          >
            <span
              class="relief-pressure-meter-fill"
              :style="{
                width: isMeterReady ? `${resultSnapshot.pressureValue}%` : '0%',
                backgroundColor: resultConfig.color,
              }"
            ></span>
          </div>
          <div class="relief-meter-labels" aria-hidden="true">
            <span>0 · 比较松弛</span>
            <span>100 · 压力满格，需要释放</span>
          </div>
          <p class="relief-meter-note">根据本次回答换算，仅作趣味参考。</p>
        </section>

        <p class="relief-preference-chip">{{ preferenceConfig.label }}</p>

        <section class="relief-content-card">
          <p class="relief-section-eyebrow">当下压力</p>
          <div class="relief-interpretation-list">
            <p v-for="interpretation in resultSnapshot.interpretations" :key="interpretation.id">
              {{ interpretation.text }}
            </p>
          </div>
        </section>

        <section class="relief-content-card relief-advice-card">
          <div class="relief-advice-heading">
            <div>
              <p class="relief-section-eyebrow">今天的小建议</p>
              <h2>先给自己一点空隙</h2>
            </div>
            <img :src="resultConfig.adviceImage" alt="" aria-hidden="true" />
          </div>
          <ol class="relief-tip-list">
            <li v-for="tip in resultSnapshot.tips" :key="tip.id">{{ tip.text }}</li>
          </ol>
        </section>

        <section class="relief-content-card relief-preference-card">
          <p class="relief-section-eyebrow">你的小动作偏好</p>
          <h2>{{ preferenceConfig.label }}</h2>
          <p>{{ preferenceConfig.description }}</p>
          <p v-if="resultSnapshot.showHandCareNote" class="relief-hand-care-note">
            如果啃咬或抠弄让皮肤受伤，或让你困扰，可以寻求专业帮助。
          </p>
        </section>

        <blockquote class="relief-quote">{{ resultConfig.quote }}</blockquote>

        <section class="relief-result-actions" aria-label="结果操作">
          <button class="relief-button relief-button--primary" type="button" @click="saveResultCard">
            保存结果卡
          </button>
          <p v-if="shareFeedback" class="relief-share-feedback" role="status">{{ shareFeedback }}</p>
          <button class="relief-button relief-button--secondary" type="button" @click="restartQuiz">
            再测一次
          </button>
        </section>

        <footer class="relief-result-footer">
          <img src="/pressure-relief/footer-cloud.webp" alt="" aria-hidden="true" />
          <p>如果紧绷感持续困扰你，或已经影响日常生活，可以考虑寻求专业支持。</p>
        </footer>
      </template>

      <p class="relief-disclaimer">趣味自查，仅供了解当下感受，不是心理诊断。</p>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  PRESSURE_RELIEF_QUESTIONS,
  PRESSURE_RELIEF_VERSION,
  getPressureReliefPreference,
  getPressureReliefResult,
} from "../features/pressure-relief/pressureRelief.config.js";
import {
  buildPressureReliefSnapshot,
  isPressureReliefSnapshotValid,
} from "../features/pressure-relief/pressureRelief.scoring.js";

const STORAGE_KEY = "asking:pressure-relief:v1.2";
const stage = ref("home");
const currentQuestionIndex = ref(0);
const answers = ref({});
const resultSnapshot = ref(null);
const isOptionLocked = ref(false);
const isMeterReady = ref(false);
const isRestoredResult = ref(false);
const shareFeedback = ref("");
let transitionTimerId = null;

/** 当前正在展示的题目。 */
const currentQuestion = computed(
  () => PRESSURE_RELIEF_QUESTIONS[currentQuestionIndex.value] ?? null,
);

/** 当前题号的两位数展示格式。 */
const formattedQuestionNumber = computed(() => String(currentQuestionIndex.value + 1).padStart(2, "0"));

/** 当前作答流程的百分比进度。 */
const progressPercent = computed(() => ((currentQuestionIndex.value + 1) / PRESSURE_RELIEF_QUESTIONS.length) * 100);

/** 是否已到最后一道题。 */
const isLastQuestion = computed(() => currentQuestionIndex.value === PRESSURE_RELIEF_QUESTIONS.length - 1);

/** 当前快照对应的状态文案和图片配置。 */
const resultConfig = computed(() => getPressureReliefResult(resultSnapshot.value?.resultId));

/** 当前快照对应的小动作偏好配置。 */
const preferenceConfig = computed(() => getPressureReliefPreference(resultSnapshot.value?.preferenceId));

/**
 * 判断题目答案对象是否只包含当前题库允许的选项。
 * @param {unknown} candidateAnswers 待校验的答案对象。
 * @returns {boolean} 是否可用于恢复流程。
 */
function hasOnlyValidAnswers(candidateAnswers) {
  if (!candidateAnswers || typeof candidateAnswers !== "object") {
    return false;
  }

  return Object.entries(candidateAnswers).every(([questionId, optionId]) => {
    const question = PRESSURE_RELIEF_QUESTIONS.find((item) => item.id === questionId);
    return Boolean(question?.options.some((option) => option.id === optionId));
  });
}

/**
 * 返回第一道未完成题目的索引。
 * @param {Record<string, string>} currentAnswers 当前答案映射。
 * @returns {number} 未完成题目索引；全部完成时返回 -1。
 */
function findFirstUnansweredIndex(currentAnswers) {
  return PRESSURE_RELIEF_QUESTIONS.findIndex(
    (question) => !currentAnswers[question.id],
  );
}

/**
 * 安全保存本次会话，存储不可用时保持内存中的作答流程可用。
 */
function persistSession() {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: PRESSURE_RELIEF_VERSION,
        stage: stage.value,
        currentQuestionIndex: currentQuestionIndex.value,
        answers: answers.value,
        resultSnapshot: resultSnapshot.value,
      }),
    );
  } catch {
    // 关键逻辑：隐私模式或存储被禁用时不阻塞本地测试。
  }
}

/**
 * 清除本测试自己的会话记录，避免覆盖站内其他测试的数据。
 */
function clearPersistedSession() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 关键逻辑：存储不可用时无需额外处理，内存状态由调用方重置。
  }
}

/**
 * 将滚动位置回到页面顶部，确保切换题目或结果时从主要内容开始阅读。
 */
function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 开始一轮新的测试。
 */
function startQuiz() {
  stage.value = "quiz";
  currentQuestionIndex.value = 0;
  answers.value = {};
  resultSnapshot.value = null;
  shareFeedback.value = "";
  isRestoredResult.value = false;
  persistSession();
  scrollToPageTop();
}

/**
 * 记录当前选择，并在非末题后短暂锁定点击再进入下一题。
 * @param {string} optionId 用户选中的选项 ID。
 */
function selectOption(optionId) {
  if (isOptionLocked.value || !currentQuestion.value) {
    return;
  }

  answers.value = {
    ...answers.value,
    [currentQuestion.value.id]: optionId,
  };
  persistSession();

  if (isLastQuestion.value) {
    return;
  }

  // 关键逻辑：短暂保留选中反馈，再进入下一题；锁定期间忽略连点，避免跳题。
  isOptionLocked.value = true;
  transitionTimerId = window.setTimeout(() => {
    currentQuestionIndex.value += 1;
    isOptionLocked.value = false;
    persistSession();
    scrollToPageTop();
  }, 220);
}

/**
 * 回到前一题以便修改答案，第一题则回到首页而不保留半成品流程。
 */
function goPreviousQuestion() {
  if (isOptionLocked.value) {
    return;
  }

  if (currentQuestionIndex.value === 0) {
    stage.value = "home";
    currentQuestionIndex.value = 0;
    answers.value = {};
    resultSnapshot.value = null;
    clearPersistedSession();
    scrollToPageTop();
    return;
  }

  currentQuestionIndex.value -= 1;
  persistSession();
  scrollToPageTop();
}

/**
 * 生成一次稳定的结果快照，并在首次进入结果页时播放压力条填充。
 */
async function submitQuiz() {
  if (!isLastQuestion.value || !answers.value[currentQuestion.value?.id]) {
    return;
  }

  resultSnapshot.value = buildPressureReliefSnapshot(answers.value);
  stage.value = "result";
  isMeterReady.value = false;
  isRestoredResult.value = false;
  shareFeedback.value = "";
  persistSession();
  scrollToPageTop();

  await nextTick();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    isMeterReady.value = true;
    return;
  }

  window.requestAnimationFrame(() => {
    isMeterReady.value = true;
  });
}

/**
 * 清空本次作答并重新回到第一题，新的完整提交才会重新抽取文案。
 */
function restartQuiz() {
  clearPersistedSession();
  startQuiz();
}

/**
 * 加载图片资源，供原生 Canvas 导出结果卡使用。
 * @param {string} source 图片地址。
 * @returns {Promise<HTMLImageElement>} 已加载图片元素。
 */
function loadShareImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

/**
 * 绘制圆角矩形，兼容结果卡导出使用的二维画布。
 * @param {CanvasRenderingContext2D} context 画布上下文。
 * @param {number} x 起始横坐标。
 * @param {number} y 起始纵坐标。
 * @param {number} width 宽度。
 * @param {number} height 高度。
 * @param {number} radius 圆角半径。
 */
function drawRoundedRect(context, x, y, width, height, radius) {
  const resolvedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + resolvedRadius, y);
  context.arcTo(x + width, y, x + width, y + height, resolvedRadius);
  context.arcTo(x + width, y + height, x, y + height, resolvedRadius);
  context.arcTo(x, y + height, x, y, resolvedRadius);
  context.arcTo(x, y, x + width, y, resolvedRadius);
  context.closePath();
}

/**
 * 按指定宽度把文本分行绘制到分享卡，防止中文长句截断。
 * @param {CanvasRenderingContext2D} context 画布上下文。
 * @param {string} value 待绘制文本。
 * @param {number} x 起始横坐标。
 * @param {number} y 起始纵坐标。
 * @param {number} maxWidth 单行最大宽度。
 * @param {number} lineHeight 行高。
 * @returns {number} 绘制结束后的纵坐标。
 */
function drawWrappedText(context, value, x, y, maxWidth, lineHeight) {
  let line = "";
  let currentY = y;
  [...value].forEach((character) => {
    const nextLine = `${line}${character}`;
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = character;
      currentY += lineHeight;
      return;
    }
    line = nextLine;
  });
  if (line) {
    context.fillText(line, x, currentY);
  }
  return currentY + lineHeight;
}

/**
 * 导出 1080 × 1440 的本地 PNG 结果卡，不传递用户答案或分数到网络。
 */
async function saveResultCard() {
  if (!resultSnapshot.value) {
    return;
  }

  shareFeedback.value = "正在生成图片…";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("当前浏览器不支持图片生成");
    }

    const heroImage = await loadShareImage(resultConfig.value.heroImage);
    context.fillStyle = "#FFF8EF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#E9E0F5";
    context.beginPath();
    context.arc(934, 124, 182, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#DDEAD6";
    context.beginPath();
    context.arc(110, 1300, 210, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#70675F";
    context.font = "600 30px PingFang SC, sans-serif";
    context.fillText("脑袋放气站 · 约 1 分钟趣味小测", 92, 112);
    context.fillStyle = "#39352F";
    context.font = "700 68px PingFang SC, sans-serif";
    context.fillText(`我是「${resultConfig.value.title}」`, 92, 206);
    context.drawImage(heroImage, 180, 238, 720, 540);

    drawRoundedRect(context, 80, 820, 920, 330, 52);
    context.fillStyle = "#FFFFFF";
    context.fill();
    context.fillStyle = "#70675F";
    context.font = "600 28px PingFang SC, sans-serif";
    context.fillText("当下压力值", 134, 902);
    context.fillStyle = "#39352F";
    context.font = "700 84px PingFang SC, sans-serif";
    context.fillText(`${resultSnapshot.value.pressureValue}`, 132, 1008);
    context.font = "500 30px PingFang SC, sans-serif";
    context.fillText("/ 100", 276, 1005);
    drawRoundedRect(context, 134, 1042, 812, 24, 12);
    context.fillStyle = "#F1EAE1";
    context.fill();
    drawRoundedRect(
      context,
      134,
      1042,
      Math.max(0, (812 * resultSnapshot.value.pressureValue) / 100),
      24,
      12,
    );
    context.fillStyle = resultConfig.value.color;
    context.fill();
    context.fillStyle = "#70675F";
    context.font = "500 26px PingFang SC, sans-serif";
    context.fillText(preferenceConfig.value.label, 134, 1110);

    context.fillStyle = "#39352F";
    context.font = "600 37px PingFang SC, sans-serif";
    drawWrappedText(context, resultConfig.value.quote, 92, 1230, 890, 54);
    context.fillStyle = "#70675F";
    context.font = "500 22px PingFang SC, sans-serif";
    drawWrappedText(
      context,
      "当下状态不代表一直如此 · 数值根据回答换算，仅作趣味参考，非心理诊断。",
      92,
      1332,
      886,
      32,
    );

    const downloadImage = (blob) => {
      const imageUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = imageUrl;
      anchor.download = `脑袋放气站-${resultConfig.value.title}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
    };

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          shareFeedback.value = "图片暂时没生成好，可以重试或截图保存。";
          return;
        }
        downloadImage(blob);
        shareFeedback.value = "结果卡已生成，可在下载内容中保存或分享。";
      }, "image/png");
      return;
    }

    const fallbackAnchor = document.createElement("a");
    fallbackAnchor.href = canvas.toDataURL("image/png");
    fallbackAnchor.download = `脑袋放气站-${resultConfig.value.title}.png`;
    document.body.appendChild(fallbackAnchor);
    fallbackAnchor.click();
    fallbackAnchor.remove();
    shareFeedback.value = "结果卡已生成，可在下载内容中保存或分享。";
  } catch {
    shareFeedback.value = "图片暂时没生成好，可以重试或截图保存。";
  }
}

/**
 * 从当前标签页恢复答案和已生成的结果快照；损坏缓存会被清理，完整答案仍可重新生成一次快照。
 */
function restoreSession() {
  let persistedSession;
  try {
    const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
    persistedSession = rawValue ? JSON.parse(rawValue) : null;
  } catch {
    clearPersistedSession();
    return;
  }

  if (!persistedSession || persistedSession.version !== PRESSURE_RELIEF_VERSION) {
    clearPersistedSession();
    return;
  }

  if (!hasOnlyValidAnswers(persistedSession.answers)) {
    clearPersistedSession();
    return;
  }

  answers.value = persistedSession.answers;
  const unansweredIndex = findFirstUnansweredIndex(answers.value);
  const hasCompletedAllQuestions = unansweredIndex === -1;

  if (hasCompletedAllQuestions) {
    if (isPressureReliefSnapshotValid(persistedSession.resultSnapshot, answers.value)) {
      resultSnapshot.value = persistedSession.resultSnapshot;
    } else {
      // 关键逻辑：答案完整但文案快照失效时仅补建一次，避免结果页因旧缓存白屏。
      resultSnapshot.value = buildPressureReliefSnapshot(answers.value);
    }
    stage.value = "result";
    isMeterReady.value = true;
    isRestoredResult.value = true;
    persistSession();
    return;
  }

  stage.value = "quiz";
  const persistedIndex = Number(persistedSession.currentQuestionIndex);
  currentQuestionIndex.value = Number.isInteger(persistedIndex)
    && persistedIndex >= 0
    && persistedIndex < PRESSURE_RELIEF_QUESTIONS.length
    ? Math.min(persistedIndex, Math.max(0, unansweredIndex))
    : Math.max(0, unansweredIndex);
  persistSession();
}

onMounted(restoreSession);
onBeforeUnmount(() => {
  if (transitionTimerId !== null) {
    window.clearTimeout(transitionTimerId);
  }
});
</script>

<style scoped>
.relief-page {
  --relief-bg: #fff8ef;
  --relief-text: #39352f;
  --relief-muted: #70675f;
  --relief-border: rgba(143, 122, 96, 0.17);
  --relief-surface: rgba(255, 255, 255, 0.9);
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  background: var(--relief-bg);
  color: var(--relief-text);
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.relief-shell {
  width: min(100%, 480px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 34px 20px max(32px, env(safe-area-inset-bottom));
  position: relative;
  z-index: 1;
}

.relief-orb {
  position: fixed;
  z-index: 0;
  width: 250px;
  height: 250px;
  border-radius: 999px;
  filter: blur(4px);
  opacity: 0.46;
  pointer-events: none;
}

.relief-orb--sage {
  top: -118px;
  left: -128px;
  background: #ddead6;
}

.relief-orb--lavender {
  right: -130px;
  bottom: 16vh;
  background: #e9e0f5;
}

.relief-brand,
.relief-section-eyebrow,
.relief-question-kicker {
  margin: 0;
  color: #a26d42;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.relief-home-header {
  text-align: center;
}

.relief-home-header h1 {
  margin: 14px 0 12px;
  font-family: "Songti SC", "STSong", serif;
  font-size: clamp(33px, 9vw, 44px);
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.24;
}

.relief-home-subtitle {
  margin: 0;
  color: var(--relief-muted);
  font-size: 16px;
  line-height: 1.72;
}

.relief-home-card,
.relief-question-card,
.relief-pressure-card,
.relief-content-card {
  border: 1px solid var(--relief-border);
  border-radius: 28px;
  background: var(--relief-surface);
  box-shadow: 0 16px 40px rgba(113, 83, 50, 0.09);
}

.relief-home-card {
  margin-top: 24px;
  padding: 16px 18px 24px;
  text-align: center;
}

.relief-home-illustration {
  display: block;
  width: min(100%, 320px);
  height: 214px;
  margin: -8px auto 2px;
  object-fit: contain;
}

.relief-info-pill,
.relief-time-pill,
.relief-preference-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  border-radius: 999px;
  background: #f9e9c8;
  color: #705638;
  font-size: 13px;
  line-height: 1.4;
}

.relief-info-pill {
  padding: 8px 14px;
}

.relief-button {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 16px;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.relief-button:hover {
  transform: translateY(-1px);
}

.relief-button:focus-visible,
.relief-option:focus-visible,
.relief-text-button:focus-visible {
  outline: 3px solid #a86f43;
  outline-offset: 3px;
}

.relief-button--primary {
  margin-top: 20px;
  background: #ffd180;
  color: var(--relief-text);
  box-shadow: 0 9px 0 #e6b960, 0 15px 26px rgba(184, 131, 64, 0.18);
}

.relief-button--primary:active {
  transform: translateY(5px);
  box-shadow: 0 4px 0 #e6b960, 0 8px 18px rgba(184, 131, 64, 0.14);
}

.relief-button--primary:disabled {
  cursor: not-allowed;
  transform: none;
  background: #e7d8c3;
  color: #a09180;
  box-shadow: none;
}

.relief-button--secondary {
  margin-top: 14px;
  border: 1px solid #d4b994;
  background: rgba(255, 255, 255, 0.62);
  color: #705638;
}

.relief-home-tip {
  margin: 18px 0 0;
  color: var(--relief-muted);
  font-size: 13px;
  line-height: 1.55;
}

.relief-quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.relief-text-button {
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #725a43;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.relief-count {
  margin: 0;
  color: #8a775f;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.relief-progress-track,
.relief-pressure-meter {
  overflow: hidden;
  border-radius: 999px;
  background: #f0e4d4;
}

.relief-progress-track {
  height: 9px;
  margin-bottom: 20px;
}

.relief-progress-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ddead6, #ffd180);
  transition: width 260ms ease;
}

.relief-question-card {
  min-height: 535px;
  padding: 24px 20px 22px;
}

.relief-time-pill {
  padding: 6px 11px;
  background: #e9e0f5;
  color: #6d5a88;
  font-size: 12px;
}

.relief-question-illustration {
  display: block;
  width: 76px;
  height: 62px;
  margin: 8px auto 0;
  object-fit: contain;
}

.relief-question-kicker {
  margin-top: 3px;
  text-align: center;
}

.relief-question-title {
  margin: 10px auto 24px;
  max-width: 360px;
  font-family: "Songti SC", "STSong", serif;
  font-size: clamp(24px, 6.5vw, 29px);
  line-height: 1.45;
  text-align: center;
}

.relief-option-list {
  display: grid;
  gap: 12px;
}

.relief-option {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 20px;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 64px;
  padding: 13px 14px;
  border: 1.5px solid #e8dccc;
  border-radius: 18px;
  background: #fff;
  color: var(--relief-text);
  font: inherit;
  font-size: 15px;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.relief-option:hover {
  border-color: #d2a36d;
  transform: translateY(-1px);
}

.relief-option:disabled {
  cursor: wait;
}

.relief-option.is-selected {
  border-color: #a96e42;
  background: #fff8eb;
}

.relief-option-mark {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  background: #f4ebdf;
  color: #8a6b4e;
  font-size: 12px;
  font-weight: 700;
}

.relief-option.is-selected .relief-option-mark {
  background: #ffd180;
  color: #60401f;
}

.relief-option-check {
  color: transparent;
  font-size: 17px;
  font-weight: 700;
}

.relief-option.is-selected .relief-option-check {
  color: #9d6239;
}

.relief-submit-button {
  margin-top: 24px;
}

.relief-result-head {
  text-align: center;
}

.relief-result-head h1 {
  margin: 13px 0 0;
  font-family: "Songti SC", "STSong", serif;
  font-size: clamp(32px, 8.8vw, 42px);
  line-height: 1.25;
}

.relief-result-hero {
  display: block;
  width: 216px;
  height: 216px;
  margin: 4px auto -2px;
  object-fit: contain;
}

.relief-result-subtitle {
  margin: 0;
  color: var(--relief-muted);
  font-size: 17px;
  line-height: 1.6;
}

.relief-pressure-card {
  margin-top: 22px;
  padding: 20px;
}

.relief-pressure-card-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.relief-pressure-card-heading p {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
}

.relief-pressure-card-heading strong {
  color: #554337;
  font-size: 32px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.relief-pressure-card-heading small {
  color: var(--relief-muted);
  font-size: 14px;
  font-weight: 600;
}

.relief-pressure-meter {
  height: 12px;
}

.relief-pressure-meter-fill {
  display: block;
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.relief-pressure-meter.is-static .relief-pressure-meter-fill {
  transition: none;
}

.relief-meter-labels {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: #877967;
  font-size: 10px;
  line-height: 1.4;
}

.relief-meter-labels span:last-child {
  text-align: right;
}

.relief-meter-note {
  margin: 14px 0 0;
  color: var(--relief-muted);
  font-size: 12px;
}

.relief-preference-chip {
  margin: 14px 0 0;
  padding: 8px 13px;
  background: #ddecf5;
  color: #4e7284;
  font-weight: 700;
}

.relief-content-card {
  margin-top: 16px;
  padding: 22px 20px;
}

.relief-interpretation-list {
  display: grid;
  gap: 13px;
  margin-top: 12px;
}

.relief-interpretation-list p,
.relief-preference-card > p {
  margin: 0;
  color: #554d43;
  font-size: 15px;
  line-height: 1.8;
}

.relief-advice-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.relief-advice-heading h2,
.relief-preference-card h2 {
  margin: 7px 0 0;
  font-family: "Songti SC", "STSong", serif;
  font-size: 24px;
}

.relief-advice-heading img {
  width: 92px;
  height: 74px;
  object-fit: contain;
}

.relief-tip-list {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  counter-reset: relief-tip;
}

.relief-tip-list li {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  color: #554d43;
  font-size: 15px;
  line-height: 1.72;
  counter-increment: relief-tip;
}

.relief-tip-list li::before {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 50%;
  background: #f9e9c8;
  color: #775a3a;
  content: counter(relief-tip);
  font-size: 12px;
  font-weight: 700;
}

.relief-hand-care-note {
  margin-top: 15px !important;
  padding: 11px 12px;
  border-radius: 13px;
  background: #fff5ee;
  color: #87634e !important;
  font-size: 13px !important;
  line-height: 1.65 !important;
}

.relief-quote {
  margin: 26px 0 0;
  padding: 2px 24px;
  color: #76593e;
  font-family: "Songti SC", "STSong", serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.65;
  text-align: center;
}

.relief-quote::before,
.relief-quote::after {
  color: #d9af72;
  font-size: 30px;
  vertical-align: -6px;
}

.relief-quote::before { content: "“"; margin-right: 3px; }
.relief-quote::after { content: "”"; margin-left: 3px; }

.relief-result-actions {
  margin-top: 24px;
}

.relief-share-feedback {
  margin: 14px 0 0;
  color: #70675f;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.relief-result-footer {
  margin: 22px auto 0;
  max-width: 360px;
  text-align: center;
}

.relief-result-footer img {
  display: block;
  width: 72px;
  height: 72px;
  margin: 0 auto -12px;
  object-fit: contain;
}

.relief-result-footer p,
.relief-disclaimer {
  margin: 0;
  color: #867969;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
  margin-top: 20px;
}

.relief-disclaimer {
  margin: 20px auto 0;
  max-width: 320px;
}

.relief-fade-in { animation: reliefFadeIn 420ms ease both; }
.relief-question-enter { animation: reliefQuestionIn 260ms ease both; }

@keyframes reliefFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes reliefQuestionIn {
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 360px) {
  .relief-shell { padding-right: 15px; padding-left: 15px; }
  .relief-question-card { padding-right: 15px; padding-left: 15px; }
  .relief-meter-labels { font-size: 9px; }
}

@media (prefers-reduced-motion: reduce) {
  .relief-button,
  .relief-option,
  .relief-progress-fill,
  .relief-pressure-meter-fill { transition: none; }
  .relief-fade-in,
  .relief-question-enter { animation: none; }
}
</style>
