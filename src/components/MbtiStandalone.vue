<template>
  <div
    class="mbti-standalone-page"
    :class="[
      themeConfig.theme.className,
      { 'mbti-page-perf-ready': isVisualEffectsReady },
    ]"
  >
    <div class="mbti-aura aura-left" aria-hidden="true"></div>
    <div class="mbti-aura aura-right" aria-hidden="true"></div>

    <main class="mbti-shell" aria-live="polite">
      <header class="mbti-header">
        <div v-if="portalMode" class="mbti-hub-back-wrap">
          <a class="mbti-hub-back-link" :href="portalHomeHref">返回主题中心</a>
        </div>

        <p class="mbti-badge">{{ themeConfig.theme.badge }}</p>
        <h1>{{ themeConfig.theme.title }}</h1>
        <p class="mbti-desc">{{ themeConfig.theme.description }}</p>
      </header>

      <section v-if="stage === 'version'" class="mbti-panel mbti-version-panel">
        <h2>选择测试版本</h2>
        <p>先选择题量，再开始作答。</p>

        <div class="mbti-version-buttons">
          <button
            v-for="versionOption in versionOptions"
            :key="versionOption.key"
            class="mbti-version-button"
            type="button"
            @click="startVersionTest(versionOption.key)"
          >
            <strong>{{ versionOption.title }}</strong>
            <span>{{ versionOption.description }}</span>
          </button>
        </div>
      </section>

      <section v-else-if="stage === 'survey' && currentQuestion" class="mbti-panel mbti-survey-panel">
        <div class="mbti-progress-meta">
          <span>{{ currentVersionLabel }} · {{ progressLabel }}</span>
          <span>{{ progressPercent }}%</span>
        </div>

        <van-progress
          :percentage="progressPercent"
          :show-pivot="false"
          :stroke-width="8"
          :color="themeConfig.theme.progressColor"
          :track-color="themeConfig.theme.progressTrackColor"
        />

        <transition name="mbti-fade" mode="out-in">
          <div :key="currentQuestion.id" class="mbti-question-wrap">
            <h2 class="mbti-question-title">{{ currentQuestion.title }}</h2>
            <p class="mbti-question-desc">{{ currentQuestion.description }}</p>

            <van-radio-group
              :model-value="answers[currentQuestionIndex]"
              class="mbti-option-group"
              @update:model-value="selectOption"
            >
              <van-cell-group inset class="mbti-cell-group">
                <van-cell
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  :title="option.label"
                  class="mbti-option"
                  :class="{ 'mbti-option-selected': answers[currentQuestionIndex] === option.id }"
                  clickable
                  @click="selectOption(option.id)"
                >
                  <template #right-icon>
                    <van-radio :name="option.id" :checked-color="themeConfig.theme.checkedColor" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </div>
        </transition>

        <div class="mbti-actions">
          <van-button
            block
            class="mbti-btn mbti-btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrevQuestion"
          >
            上一题
          </van-button>
          <van-button
            block
            class="mbti-btn mbti-btn-primary"
            :disabled="!canGoNext"
            @click="goNextQuestion"
          >
            {{ isLastQuestion ? '提交并生成结果' : '下一题' }}
          </van-button>
        </div>

        <van-button
          block
          class="mbti-btn mbti-btn-ghost"
          @click="resetToVersion"
        >
          返回版本选择
        </van-button>
      </section>

      <section v-else-if="stage === 'analyzing'" class="mbti-panel mbti-loading-panel">
        <van-loading :color="themeConfig.theme.checkedColor" size="30px" />
        <transition name="mbti-loading-swap" mode="out-in">
          <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
        </transition>
      </section>

      <section v-else-if="stage === 'result' && resultModel" class="mbti-panel mbti-result-panel">
        <div class="mbti-source-wrap">
          <van-tag :color="sourceTagStyle.color" :text-color="sourceTagStyle.textColor" round>
            {{ sourceTagStyle.label }}
          </van-tag>
        </div>

        <p class="mbti-result-prefix">你的主类型</p>
        <h2 class="mbti-main-type">{{ resultModel.main.name }}</h2>
        <p class="mbti-main-score">类型匹配度：{{ resultModel.main.score }}%</p>

        <div class="mbti-highlight-box">
          <h3>类型短评</h3>
          <p>{{ resultModel.profileTitle }}</p>
        </div>

        <div class="mbti-type-card-wrap">
          <h3>{{ resultModel.typeCard.title }}</h3>
          <div class="mbti-type-card-grid">
            <article
              v-for="(cardItem, cardIndex) in resultModel.typeCard.items"
              :key="`${cardItem.label}-${cardIndex}`"
              class="mbti-type-card-item"
            >
              <p class="mbti-type-card-value">{{ cardItem.value }}</p>
              <p class="mbti-type-card-label">{{ cardItem.label }}</p>
            </article>
          </div>
        </div>

        <p class="mbti-insight">{{ resultModel.insight }}</p>

        <div class="mbti-detail-wrap">
          <h3>MBTI Top 3</h3>
          <ul class="mbti-top-list">
            <li
              v-for="(item, index) in resultModel.topThree"
              :key="`${item.name}-${index}`"
            >
              <span>{{ index + 1 }}. {{ item.name }}</span>
              <span>{{ item.score }}%</span>
            </li>
          </ul>
        </div>

        <div class="mbti-detail-wrap">
          <h3>维度倾向</h3>
          <ul class="mbti-bullet-list">
            <li
              v-for="(line, lineIndex) in resultModel.axisSummaryLines"
              :key="`axis-${lineIndex}`"
            >
              {{ line }}
            </li>
          </ul>
        </div>

        <div class="mbti-detail-wrap">
          <h3>发展建议</h3>
          <ul class="mbti-bullet-list">
            <li
              v-for="(line, lineIndex) in resultModel.growthActions"
              :key="`growth-${lineIndex}`"
            >
              {{ line }}
            </li>
          </ul>
        </div>

        <div class="mbti-detail-wrap">
          <h3>盲点提醒</h3>
          <ul class="mbti-bullet-list">
            <li
              v-for="(line, lineIndex) in resultModel.blindSpots"
              :key="`blind-${lineIndex}`"
            >
              {{ line }}
            </li>
          </ul>
        </div>

        <div class="mbti-detail-wrap">
          <h3>答卷摘要 {{ showAllSummary ? '' : '（前12条）' }}</h3>
          <ul class="mbti-bullet-list">
            <li
              v-for="(line, lineIndex) in summaryLinesForView"
              :key="`summary-${lineIndex}`"
            >
              {{ line }}
            </li>
          </ul>
          <button
            v-if="resultModel.summaryLines.length > SUMMARY_PREVIEW_LIMIT"
            type="button"
            class="mbti-summary-toggle"
            @click="toggleSummary"
          >
            {{ showAllSummary ? '收起摘要' : '展开全部摘要' }}
          </button>
        </div>

        <van-button
          block
          class="mbti-btn mbti-btn-primary mbti-restart-btn"
          @click="resetToVersion"
        >
          重新选择版本
        </van-button>
      </section>
    </main>

    <a
      v-if="portalMode"
      class="mbti-floating-home"
      :href="portalHomeHref"
      aria-label="返回主题中心"
    >
      返回主题中心
    </a>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { showToast } from "vant";
import {
  MBTI_PRO_120_QUESTION_BANK,
  MBTI_QUICK_36_QUESTION_BANK,
  MBTI_VERSION_CONFIG,
} from "../data/mbtiQuestionBank";
import { analyzeMbtiLocally } from "../services/mbtiAnalyzer";
import { analyzeMbtiWithDeepInsight } from "../services/mbtiAiAnalyzer";

/**
 * 摘要默认预览条数。
 */
const SUMMARY_PREVIEW_LIMIT = 12;

/**
 * MBTI 默认加载文案。
 */
const DEFAULT_LOADING_MESSAGES = [
  "正在校准你的四维度偏好...",
  "正在比对 16 型人格画像...",
  "正在生成你的类型学卡片...",
  "正在整理你的人格建议...",
];

/**
 * 组件参数定义。
 */
const props = defineProps({
  themeConfig: {
    type: Object,
    required: true,
  },
  portalMode: {
    type: Boolean,
    default: false,
  },
  portalHomeHref: {
    type: String,
    default: "",
  },
});

/**
 * 页面阶段：
 * version -> 版本选择
 * survey -> 答题阶段
 * analyzing -> 分析阶段
 * result -> 结果展示
 */
const stage = ref("version");

/**
 * 首屏视觉增强开关：
 * 关键逻辑：首帧先渲染文本与交互按钮，再启用背景氛围层与滤镜，优化首屏体验。
 */
const isVisualEffectsReady = ref(false);

/**
 * MBTI 作答状态。
 */
const selectedVersionKey = ref("");
const questionBank = ref([]);
const answers = ref([]);
const currentQuestionIndex = ref(0);
const resultModel = ref(null);
const showAllSummary = ref(false);

/**
 * 加载文案轮播状态。
 */
const loadingMessageIndex = ref(0);
let loadingMessageTimer = null;

/**
 * 版本题库映射。
 */
const VERSION_QUESTION_BANK_MAP = {
  quick36: MBTI_QUICK_36_QUESTION_BANK,
  pro120: MBTI_PRO_120_QUESTION_BANK,
};

/**
 * 版本按钮数据。
 */
const versionOptions = computed(() => [
  MBTI_VERSION_CONFIG.pro120,
  MBTI_VERSION_CONFIG.quick36,
]);

/**
 * 当前版本配置。
 */
const currentVersion = computed(
  () => MBTI_VERSION_CONFIG[selectedVersionKey.value] ?? null,
);

/**
 * 当前版本名称。
 */
const currentVersionLabel = computed(
  () => currentVersion.value?.title ?? "未选择版本",
);

/**
 * 当前题目。
 */
const currentQuestion = computed(
  () => questionBank.value[currentQuestionIndex.value],
);

/**
 * 是否最后一题。
 */
const isLastQuestion = computed(
  () =>
    questionBank.value.length > 0 &&
    currentQuestionIndex.value === questionBank.value.length - 1,
);

/**
 * 是否允许下一步。
 */
const canGoNext = computed(
  () => answers.value[currentQuestionIndex.value] !== null,
);

/**
 * 进度百分比。
 */
const progressPercent = computed(() => {
  if (questionBank.value.length === 0) {
    return 0;
  }

  const doneCount = currentQuestionIndex.value + 1;
  return Math.round((doneCount / questionBank.value.length) * 100);
});

/**
 * 进度文案。
 */
const progressLabel = computed(
  () => `问题 ${currentQuestionIndex.value + 1} / ${questionBank.value.length}`,
);

/**
 * 加载文案来源。
 */
const loadingMessages = computed(() => {
  const themeLoadingMessages = props.themeConfig?.theme?.loadingMessages;
  return Array.isArray(themeLoadingMessages) && themeLoadingMessages.length > 0
    ? themeLoadingMessages
    : DEFAULT_LOADING_MESSAGES;
});

/**
 * 当前展示的加载文案。
 */
const activeLoadingMessage = computed(
  () => loadingMessages.value[loadingMessageIndex.value] ?? "正在分析中...",
);

/**
 * 结果来源标签样式。
 */
const sourceTagStyle = computed(() => {
  const sourceType = resultModel.value?.source === "local" ? "local" : "deep";
  const themeSourceTag = props.themeConfig?.theme?.sourceTag?.[sourceType];

  if (themeSourceTag) {
    return themeSourceTag;
  }

  return sourceType === "local"
    ? {
        label: "基础解析结果",
        color: "#eef0ff",
        textColor: "#3d3f7b",
      }
    : {
        label: "深度解析结果",
        color: "#ffeaf0",
        textColor: "#9d2242",
      };
});

/**
 * 摘要展示列表。
 */
const summaryLinesForView = computed(() => {
  const fullSummaryLines = resultModel.value?.summaryLines ?? [];

  return showAllSummary.value
    ? fullSummaryLines
    : fullSummaryLines.slice(0, SUMMARY_PREVIEW_LIMIT);
});

/**
 * 构建 MBTI 深度分析请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, axisScores: object, typeCandidates: Array<object>, localTopThree: Array<object>, localResult: object }} 深度分析负载。
 */
function buildMbtiDeepPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    axisScores: localResult.axisScores,
    typeCandidates: localResult.scoredTypes.map((item) => ({
      type: item.type,
      title: item.title,
      score: item.score,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      name: item.type,
      score: item.score,
      title: item.title,
    })),
    // 关键逻辑：深度结果异常时需要完整本地结果兜底。
    localResult,
  };
}

/**
 * 构建深度结果展示模型。
 * @param {object} deepResult 深度分析结果。
 * @param {object} localResult 本地分析结果。
 * @returns {{ source: string, main: object, profileTitle: string, insight: string, typeCard: object, topThree: Array<object>, axisSummaryLines: Array<string>, growthActions: Array<string>, blindSpots: Array<string>, summaryLines: Array<string> }} 页面结果模型。
 */
function buildDeepResultModel(deepResult, localResult) {
  return {
    source: "deep",
    main: deepResult.mainType,
    profileTitle: deepResult.profileTitle,
    insight: deepResult.insight,
    typeCard: deepResult.typeCard ?? localResult.typeCard,
    topThree: deepResult.topThree,
    axisSummaryLines: localResult.axisSummaryLines,
    growthActions: deepResult.growthActions,
    blindSpots: deepResult.blindSpots,
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 构建本地兜底结果展示模型。
 * @param {object} localResult 本地分析结果。
 * @returns {{ source: string, main: object, profileTitle: string, insight: string, typeCard: object, topThree: Array<object>, axisSummaryLines: Array<string>, growthActions: Array<string>, blindSpots: Array<string>, summaryLines: Array<string> }} 页面结果模型。
 */
function buildLocalResultModel(localResult) {
  return {
    source: "local",
    main: {
      name: localResult.topType.type,
      score: localResult.topType.score,
    },
    profileTitle: `${localResult.topType.type} · ${localResult.topType.title}`,
    insight: localResult.localNarrative,
    typeCard: localResult.typeCard,
    topThree: localResult.topThree.map((item) => ({
      name: item.type,
      score: item.score,
    })),
    axisSummaryLines: localResult.axisSummaryLines,
    growthActions: [
      "把你最擅长的决策方式固定到一个关键场景，连续复用 4 周。",
      "每周做一次反向维度练习（例如偏 T 的人练 F 视角表达）。",
      "把你的协作偏好写成工作说明，减少沟通损耗。",
    ],
    blindSpots: ["类型是偏好而不是能力上限", "高压下要防止维度失衡导致误判"],
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 启动指定版本测试。
 * @param {"quick36"|"pro120"} versionKey 版本键。
 */
function startVersionTest(versionKey) {
  const versionConfig = MBTI_VERSION_CONFIG[versionKey];
  const versionQuestionBank = VERSION_QUESTION_BANK_MAP[versionKey];

  if (!versionConfig || !Array.isArray(versionQuestionBank)) {
    showToast("版本配置异常，请稍后重试");
    return;
  }

  selectedVersionKey.value = versionKey;
  questionBank.value = versionQuestionBank;
  answers.value = Array.from({ length: versionQuestionBank.length }, () => null);
  currentQuestionIndex.value = 0;
  resultModel.value = null;
  showAllSummary.value = false;
  stage.value = "survey";
}

/**
 * 返回版本选择页并重置状态。
 */
function resetToVersion() {
  selectedVersionKey.value = "";
  questionBank.value = [];
  answers.value = [];
  currentQuestionIndex.value = 0;
  resultModel.value = null;
  showAllSummary.value = false;
  stage.value = "version";
  stopLoadingMessageTicker();
}

/**
 * 选中答案。
 * @param {string} optionId 选项 ID。
 */
function selectOption(optionId) {
  answers.value[currentQuestionIndex.value] = optionId;
}

/**
 * 上一题。
 */
function goPrevQuestion() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

/**
 * 下一题或提交。
 * 关键逻辑：
 * 1. 非最后一题直接跳转。
 * 2. 最后一题执行“本地分析 + 深度增强”，失败时回退本地结果。
 */
async function goNextQuestion() {
  if (!canGoNext.value) {
    showToast("请先选择一个选项");
    return;
  }

  if (!isLastQuestion.value) {
    currentQuestionIndex.value += 1;
    return;
  }

  stage.value = "analyzing";

  const localResult = analyzeMbtiLocally({
    questions: questionBank.value,
    answerIds: answers.value,
  });

  try {
    const deepPayload = buildMbtiDeepPayload(localResult);
    const deepResult = await analyzeMbtiWithDeepInsight(deepPayload, {
      timeoutMs: 18000,
    });

    resultModel.value = buildDeepResultModel(deepResult, localResult);
  } catch (error) {
    resultModel.value = buildLocalResultModel(localResult);
    showToast(error?.message || "深度解析暂不可用，已切换基础解析");
  }

  showAllSummary.value = false;
  stage.value = "result";
}

/**
 * 展开/收起摘要。
 */
function toggleSummary() {
  showAllSummary.value = !showAllSummary.value;
}

/**
 * 启动加载文案轮播。
 */
function startLoadingMessageTicker() {
  stopLoadingMessageTicker();
  loadingMessageIndex.value = 0;

  loadingMessageTimer = window.setInterval(() => {
    const messageCount = loadingMessages.value.length;
    loadingMessageIndex.value =
      messageCount > 0 ? (loadingMessageIndex.value + 1) % messageCount : 0;
  }, 1250);
}

/**
 * 停止加载文案轮播。
 */
function stopLoadingMessageTicker() {
  if (loadingMessageTimer) {
    window.clearInterval(loadingMessageTimer);
    loadingMessageTimer = null;
  }
}

/**
 * 首帧后启用视觉增强层。
 * 关键逻辑：双 requestAnimationFrame 可避免重视觉样式抢占首次绘制。
 * 复杂度评估：O(1)，仅固定次数回调调度。
 */
function enableVisualEffectsAfterFirstPaint() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      isVisualEffectsReady.value = true;
    });
  });
}

/**
 * 监听阶段变化，控制加载轮播定时器。
 */
watch(stage, (nextStage) => {
  if (nextStage === "analyzing") {
    startLoadingMessageTicker();
    return;
  }

  stopLoadingMessageTicker();
});

/**
 * 组件挂载后延迟启用重视觉效果。
 */
onMounted(() => {
  enableVisualEffectsAfterFirstPaint();
});

/**
 * 组件销毁时清理资源。
 */
onBeforeUnmount(() => {
  stopLoadingMessageTicker();
});
</script>

<style scoped>
.mbti-standalone-page {
  --mbti-bg: radial-gradient(circle at 15% 18%, rgba(238, 95, 137, 0.2), transparent 34%),
    radial-gradient(circle at 85% 20%, rgba(137, 123, 244, 0.2), transparent 36%),
    linear-gradient(132deg, #121423, #1b1d31 56%, #2a1d3f);
  --mbti-panel: rgba(19, 22, 37, 0.82);
  --mbti-panel-border: rgba(112, 112, 167, 0.42);
  --mbti-text: #f4f0ff;
  --mbti-muted: #c9c0dd;
  --mbti-primary: #ef5a78;
  --mbti-secondary: #8f8df5;
  --mbti-card-bg: #161a2a;
  --mbti-card-border: #3d3f65;
  min-height: 100vh;
  color: var(--mbti-text);
  background: var(--mbti-bg);
  padding: 22px 14px 34px;
  position: relative;
  overflow-x: hidden;
}

.mbti-aura {
  position: fixed;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(5px);
  opacity: 0.45;
  animation: mbtiFloat 8s ease-in-out infinite alternate;
}

/* 首屏性能策略：
 * 关键逻辑：首帧优先渲染标题与版本选择按钮，再启用装饰背景与入场动画。 */
.mbti-standalone-page:not(.mbti-page-perf-ready) .mbti-aura {
  display: none;
}

.mbti-standalone-page:not(.mbti-page-perf-ready) .mbti-header,
.mbti-standalone-page:not(.mbti-page-perf-ready) .mbti-panel {
  animation: none;
}

.mbti-standalone-page:not(.mbti-page-perf-ready) .mbti-panel {
  backdrop-filter: none;
}

.aura-left {
  width: 220px;
  height: 220px;
  left: -72px;
  top: -70px;
  background: radial-gradient(circle at 35% 35%, #ff96b0, #d85789);
}

.aura-right {
  width: 244px;
  height: 244px;
  right: -90px;
  bottom: 8%;
  background: radial-gradient(circle at 35% 35%, #9e9cff, #615fd4);
  animation-delay: 1.2s;
}

.mbti-shell {
  width: min(100%, 620px);
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.mbti-header {
  margin: 8px 4px 20px;
  animation: mbtiFadeUp 520ms ease both;
}

.mbti-hub-back-wrap {
  margin-bottom: 8px;
}

.mbti-hub-back-link {
  display: inline-block;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
  padding: 6px 10px;
  background: linear-gradient(135deg, var(--mbti-primary), var(--mbti-secondary));
}

.mbti-badge {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: #ffd2dc;
  text-transform: uppercase;
}

.mbti-header h1 {
  margin: 10px 0 8px;
  font-size: clamp(27px, 7.2vw, 38px);
  line-height: 1.24;
  font-family: "Noto Serif SC", serif;
}

.mbti-desc {
  margin: 0;
  color: var(--mbti-muted);
  font-size: 14px;
  line-height: 1.62;
}

.mbti-panel {
  border-radius: 20px;
  border: 1px solid var(--mbti-panel-border);
  background: var(--mbti-panel);
  box-shadow: 0 24px 56px rgba(7, 8, 18, 0.45);
  backdrop-filter: blur(8px);
  padding: 16px;
  animation: mbtiFadeUp 420ms ease both;
}

.mbti-version-panel h2 {
  margin: 0;
  font-size: 24px;
  font-family: "Noto Serif SC", serif;
}

.mbti-version-panel p {
  margin: 8px 0 0;
  color: var(--mbti-muted);
  font-size: 13px;
}

.mbti-version-buttons {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.mbti-version-button {
  border: 1px solid var(--mbti-card-border);
  background: linear-gradient(140deg, #1b1e32, #20223b);
  color: var(--mbti-text);
  border-radius: 14px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
}

.mbti-version-button:active {
  transform: scale(0.99);
}

.mbti-version-button:hover {
  border-color: #7371e2;
  box-shadow: 0 14px 24px rgba(87, 84, 177, 0.25);
}

.mbti-version-button strong {
  display: block;
  font-size: 20px;
  line-height: 1.2;
  font-family: "Noto Serif SC", serif;
}

.mbti-version-button span {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: var(--mbti-muted);
}

.mbti-progress-meta {
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--mbti-muted);
}

.mbti-question-wrap {
  min-height: 356px;
  margin-top: 16px;
}

.mbti-question-title {
  margin: 0 0 8px;
  font-size: clamp(22px, 6vw, 30px);
  line-height: 1.34;
  font-family: "Noto Serif SC", serif;
}

.mbti-question-desc {
  margin: 0 0 16px;
  color: var(--mbti-muted);
  font-size: 13px;
  line-height: 1.6;
}

.mbti-cell-group {
  /* 关键逻辑：覆盖 Vant inset 默认外边距，避免答案选项出现额外缩进。 */
  --van-cell-group-inset-padding: 0;
  background: transparent !important;
}

.mbti-option {
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid var(--mbti-card-border);
  background: rgba(20, 22, 34, 0.88);
  transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.mbti-option:active {
  transform: scale(0.99);
}

.mbti-option-selected {
  border-color: #7f7df0;
  box-shadow: 0 12px 22px rgba(105, 102, 208, 0.24);
  background: linear-gradient(180deg, #222441, #2a2849);
}

.mbti-actions {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mbti-btn {
  border-radius: 12px !important;
  min-height: 42px;
  font-size: 14px !important;
  font-weight: 600 !important;
}

.mbti-btn-primary {
  color: #fff !important;
  border: 0 !important;
  background: linear-gradient(130deg, var(--mbti-primary), var(--mbti-secondary)) !important;
}

.mbti-btn-secondary {
  color: var(--mbti-text) !important;
  border: 1px solid var(--mbti-card-border) !important;
  background: #1a1d2d !important;
}

.mbti-btn-ghost {
  margin-top: 10px;
  color: var(--mbti-muted) !important;
  border: 1px dashed #575a8f !important;
  background: transparent !important;
}

.mbti-loading-panel {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 30px 4px;
}

.mbti-loading-panel p {
  margin: 0;
  color: var(--mbti-muted);
}

.mbti-source-wrap {
  margin-bottom: 8px;
}

.mbti-result-prefix {
  margin: 0;
  color: var(--mbti-muted);
  font-size: 12px;
}

.mbti-main-type {
  margin: 8px 0 6px;
  font-size: clamp(36px, 11vw, 52px);
  line-height: 1.1;
  letter-spacing: 0.03em;
  font-family: "Noto Serif SC", serif;
}

.mbti-main-score {
  margin: 0 0 12px;
  font-weight: 700;
  color: #ffd4dd;
}

.mbti-highlight-box {
  border-radius: 12px;
  border: 1px solid #4c4e77;
  background: linear-gradient(180deg, #222548, #29283f);
  padding: 11px 12px;
}

.mbti-highlight-box h3 {
  margin: 0 0 6px;
  font-size: 13px;
}

.mbti-highlight-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.62;
}

.mbti-type-card-wrap {
  margin-top: 14px;
  border-radius: 14px;
  border: 1px solid #3d3f65;
  padding: 12px;
  background: linear-gradient(180deg, #1c1e33, #20223a);
}

.mbti-type-card-wrap h3 {
  margin: 0 0 10px;
  font-size: 14px;
}

.mbti-type-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.mbti-type-card-item {
  border-radius: 12px;
  border: 1px solid #3f436b;
  background: var(--mbti-card-bg);
  min-height: 106px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
}

.mbti-type-card-value {
  margin: 0;
  font-size: clamp(16px, 5vw, 28px);
  line-height: 1.16;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  word-break: break-word;
}

.mbti-type-card-label {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--mbti-muted);
}

.mbti-insight {
  margin: 14px 0 0;
  line-height: 1.72;
  font-size: 14px;
}

.mbti-detail-wrap {
  margin-top: 14px;
  border-radius: 12px;
  border: 1px solid #3d3f65;
  background: linear-gradient(180deg, #1c1f34, #21233b);
  padding: 12px;
}

.mbti-detail-wrap h3 {
  margin: 0 0 8px;
  font-size: 14px;
}

.mbti-top-list,
.mbti-bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.mbti-top-list li,
.mbti-bullet-list li {
  border-radius: 10px;
  border: 1px solid #3f436b;
  background: #161a2b;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.6;
}

.mbti-top-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mbti-summary-toggle {
  margin-top: 10px;
  border: 1px dashed #6669a3;
  color: #d8d2f3;
  background: transparent;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.mbti-restart-btn {
  margin-top: 16px;
}

.mbti-floating-home {
  position: fixed;
  right: 14px;
  bottom: 16px;
  z-index: 20;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(132deg, var(--mbti-primary), var(--mbti-secondary));
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.mbti-fade-enter-active,
.mbti-fade-leave-active {
  /* 关键逻辑：避免 `all` 触发无关属性过渡，减少主线程样式计算压力。 */
  transition:
    opacity 260ms ease,
    transform 260ms ease;
}

.mbti-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.mbti-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

.mbti-loading-swap-enter-active,
.mbti-loading-swap-leave-active {
  transition: opacity 240ms ease, transform 240ms ease, filter 240ms ease;
}

.mbti-loading-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(2px);
}

.mbti-loading-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(2px);
}

@keyframes mbtiFloat {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-16px);
  }
}

@keyframes mbtiFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 360px) {
  .mbti-question-wrap {
    min-height: 390px;
  }
}

@media (max-width: 759px) {
  .mbti-panel {
    /* 关键逻辑：移动端关闭毛玻璃，降低合成层压力与交互延迟。 */
    backdrop-filter: none;
  }
}

@media (min-width: 760px) {
  .mbti-standalone-page {
    padding-top: 30px;
  }

  .mbti-panel {
    padding: 20px;
  }

  .mbti-question-wrap {
    min-height: 340px;
  }
}
</style>
