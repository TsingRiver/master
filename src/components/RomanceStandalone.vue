<template>
  <div class="romancex-page" :class="themeConfig.theme.className">
    <div class="romancex-background-glow romancex-glow-left" aria-hidden="true"></div>
    <div class="romancex-background-glow romancex-glow-right" aria-hidden="true"></div>
    <div class="romancex-grid-noise" aria-hidden="true"></div>

    <main class="romancex-shell" aria-live="polite">
      <transition name="romancex-hint-pop">
        <div
          v-if="isEncouragementVisible"
          class="romancex-encouragement-overlay"
          aria-hidden="true"
        >
          <p class="romancex-encouragement-text" role="status" aria-live="polite">
            {{ encouragementMessage }}
          </p>
        </div>
      </transition>

      <transition name="romancex-destiny-pop">
        <div
          v-if="isDestinyOverlayVisible"
          class="romancex-destiny-overlay"
          :class="`is-${destinyOverlayType}`"
          role="status"
          aria-live="polite"
        >
          <p class="romancex-destiny-title">{{ destinyOverlayPrimaryText }}</p>
          <p v-if="destinyOverlaySecondaryText" class="romancex-destiny-desc">
            {{ destinyOverlaySecondaryText }}
          </p>
        </div>
      </transition>

      <header class="romancex-header">
        <div v-if="portalMode" class="romancex-hub-back-wrap">
          <a class="romancex-hub-back-link" :href="portalHomeHref">返回主题中心</a>
        </div>

        <p class="romancex-badge">{{ themeConfig.theme.badge }}</p>
        <h1>{{ themeConfig.theme.title }}</h1>
        <p class="romancex-subtitle">{{ themeConfig.theme.description }}</p>
        <p
          v-if="themeConfig.theme.participantCountLabel"
          class="romancex-participant-count"
        >
          {{ themeConfig.theme.participantCountLabel }}
        </p>
      </header>

      <section v-if="stage === 'survey' && currentQuestion" class="romancex-panel romancex-question-panel">
        <div class="romancex-progress-box" :class="`is-${romanceProgressPhase}`">
          <p class="romancex-progress-hint">{{ romanceProgressHint }}</p>
          <div
            class="romancex-heart-progress"
            role="progressbar"
            aria-label="浪漫旅程进度"
            :aria-valuemin="0"
            :aria-valuemax="100"
            :aria-valuenow="progressPercent"
          >
            <svg class="romancex-heart-svg" viewBox="0 0 200 180" aria-hidden="true">
              <defs>
                <linearGradient id="romancex-heart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#f06ca6" />
                  <stop offset="100%" stop-color="#8f7ef6" />
                </linearGradient>
                <clipPath :id="heartClipPathId">
                  <rect x="0" y="0" :width="heartClipWidth" height="180" />
                </clipPath>
              </defs>
              <path
                class="romancex-heart-base"
                d="M100 164 C100 164 16 112 16 60 C16 30 40 12 64 12 C80 12 94 20 100 34 C106 20 120 12 136 12 C160 12 184 30 184 60 C184 112 100 164 100 164 Z"
              />
              <path
                class="romancex-heart-fill"
                :clip-path="`url(#${heartClipPathId})`"
                d="M100 164 C100 164 16 112 16 60 C16 30 40 12 64 12 C80 12 94 20 100 34 C106 20 120 12 136 12 C160 12 184 30 184 60 C184 112 100 164 100 164 Z"
              />
              <path
                class="romancex-heart-stroke"
                d="M100 164 C100 164 16 112 16 60 C16 30 40 12 64 12 C80 12 94 20 100 34 C106 20 120 12 136 12 C160 12 184 30 184 60 C184 112 100 164 100 164 Z"
              />
            </svg>
          </div>
        </div>

        <transition name="romancex-question-swap" mode="out-in">
          <div :key="currentQuestion.id" class="romancex-question-wrap">
            <h2 class="romancex-question-title">{{ currentQuestion.title }}</h2>
            <p class="romancex-question-desc">{{ currentQuestion.description }}</p>

            <div class="romancex-option-grid" role="radiogroup" aria-label="题目选项">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="romancex-option"
                :class="{ 'is-selected': answers[currentQuestionIndex] === option.id }"
                type="button"
                @click="selectOption(option.id)"
              >
                <span class="romancex-option-index">{{ option.id.slice(-1).toUpperCase() }}</span>
                <span class="romancex-option-label">{{ option.label }}</span>
              </button>
            </div>
          </div>
        </transition>

        <div class="romancex-actions-wrap">
          <van-button
            block
            class="romancex-btn romancex-btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrev"
          >
            上一步
          </van-button>
          <p class="romancex-auto-next-tip">点击选项自动进入下一题</p>
        </div>
      </section>

      <section v-else-if="stage === 'analyzing'" class="romancex-panel romancex-loading-panel">
        <van-loading color="#ff6f9f" size="30px" />
        <transition name="romancex-loading-swap" mode="out-in">
          <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
        </transition>
      </section>

      <section v-else-if="stage === 'result' && unifiedResult" class="romancex-panel romancex-result-panel">
        <div class="romancex-source-wrap">
          <van-tag :color="sourceTagStyle.color" :text-color="sourceTagStyle.textColor" round>
            {{ sourceTagStyle.label }}
          </van-tag>
        </div>

        <p class="romancex-result-prefix">{{ unifiedResult.prefixLabel }}</p>
        <h2 class="romancex-main-title">{{ unifiedResult.main.name }}</h2>
        <p class="romancex-main-score">{{ unifiedResult.scoreLabel }}：{{ unifiedResult.main.score }}%</p>

        <article v-if="unifiedResult.highlightCard?.content" class="romancex-highlight-card">
          <h3>{{ unifiedResult.highlightCard.title }}</h3>
          <p>{{ unifiedResult.highlightCard.content }}</p>
        </article>

        <p class="romancex-insight">{{ unifiedResult.insight }}</p>

        <section v-if="unifiedResult.tagChips?.length" class="romancex-card-block">
          <h3>命运标签</h3>
          <div class="romancex-chip-grid">
            <span
              v-for="(tagItem, tagIndex) in unifiedResult.tagChips"
              :key="`${tagItem}-${tagIndex}`"
              class="romancex-chip"
            >
              {{ tagItem }}
            </span>
          </div>
        </section>

        <section v-if="radarChartItems.length >= 3" class="romancex-card-block">
          <h3>{{ unifiedResult.radarChart.title }}</h3>
          <div class="romancex-radar-canvas">
            <svg :viewBox="radarChartViewBox" role="img" aria-label="浪漫维度雷达图">
              <polygon
                v-for="(polygonPoints, levelIndex) in radarGridPolygons"
                :key="`radar-grid-${levelIndex}`"
                :points="polygonPoints"
                class="romancex-radar-grid"
              />
              <line
                v-for="(axisPoint, axisIndex) in radarAxisPoints"
                :key="`radar-axis-${axisIndex}`"
                :x1="radarCenterPoint"
                :y1="radarCenterPoint"
                :x2="axisPoint.outerX"
                :y2="axisPoint.outerY"
                class="romancex-radar-axis"
              />
              <polygon :points="radarDataPolygonPoints" class="romancex-radar-data" />
              <circle
                v-for="(axisPoint, pointIndex) in radarAxisPoints"
                :key="`radar-point-${pointIndex}`"
                :cx="axisPoint.valueX"
                :cy="axisPoint.valueY"
                r="3.8"
                :style="{ fill: axisPoint.color || '#ff6f9f' }"
              />
              <text
                v-for="(labelPoint, labelIndex) in radarLabelPoints"
                :key="`radar-label-${labelIndex}`"
                :x="labelPoint.x"
                :y="labelPoint.y"
                class="romancex-radar-label"
              >
                {{ labelPoint.label }}
              </text>
            </svg>
          </div>
        </section>

        <section class="romancex-card-block">
          <h3>{{ unifiedResult.topThreeTitle }}</h3>
          <ul class="romancex-ranked-list">
            <li
              v-for="(item, index) in unifiedResult.topThree"
              :key="`${item.name}-${index}`"
            >
              <span>{{ index + 1 }}. {{ item.name }}</span>
              <span>{{ item.score }}%</span>
            </li>
          </ul>
        </section>

        <section
          v-for="(section, sectionIndex) in unifiedResult.detailSections"
          :key="`${section.title}-${sectionIndex}`"
          class="romancex-card-block"
        >
          <h3>{{ section.title }}</h3>
          <ul class="romancex-bullet-list">
            <li
              v-for="(item, itemIndex) in section.items"
              :key="`${item}-${itemIndex}`"
            >
              {{ item }}
            </li>
          </ul>
        </section>

        <section v-if="shouldShowPosterSection" class="romancex-card-block romancex-poster-block">
          <h3>分享海报</h3>
          <p class="romancex-poster-desc">已自动生成专属海报，可直接保存分享。</p>

          <div v-if="posterPreviewUrl" class="romancex-poster-preview">
            <img :src="posterPreviewUrl" alt="浪漫封顶值海报预览" loading="lazy" />
          </div>
          <div v-else class="romancex-poster-loading">
            <van-loading color="#ff6f9f" size="24px" />
            <span>正在生成海报...</span>
          </div>

          <div class="romancex-poster-actions">
            <van-button
              block
              class="romancex-btn romancex-btn-secondary"
              :loading="isGeneratingPoster"
              @click="handleGeneratePoster"
            >
              重新生成海报
            </van-button>
            <van-button
              block
              class="romancex-btn romancex-btn-primary"
              :disabled="!posterPreviewUrl"
              @click="savePosterImage"
            >
              保存海报
            </van-button>
          </div>
        </section>

        <section class="romancex-card-block">
          <h3>{{ unifiedResult.summaryTitle }}</h3>
          <ul class="romancex-bullet-list">
            <li
              v-for="(line, lineIndex) in summaryLinesForView"
              :key="`${line}-${lineIndex}`"
            >
              {{ line }}
            </li>
          </ul>
          <button
            v-if="(unifiedResult.summaryLines?.length ?? 0) > SUMMARY_PREVIEW_LIMIT"
            type="button"
            class="romancex-summary-toggle"
            @click="toggleSummary"
          >
            {{ showAllSummary ? "收起摘要" : "展开其余摘要" }}
          </button>
        </section>

        <p v-if="unifiedResult.easterEggText" class="romancex-easter-egg">
          {{ unifiedResult.easterEggText }}
        </p>

        <van-button
          block
          class="romancex-btn romancex-btn-primary romancex-restart-btn"
          @click="restart"
        >
          {{ unifiedResult.restartButtonText }}
        </van-button>
      </section>
    </main>

    <a
      v-if="portalMode"
      class="romancex-floating-home"
      :href="portalHomeHref"
      aria-label="返回主题中心"
    >
      返回主题中心
    </a>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { showToast } from "vant";
import {
  selectRandomQuestionsWithoutRepeat,
  selectRandomQuestionsWithDimensionCoverage,
} from "../utils/randomQuestionSelector";

/**
 * 深度分析策略常量：
 * 1. 14 秒内优先等待深度结果。
 * 2. 14 秒后先展示本地结果，再后台静默升级。
 * 3. 45 秒硬超时，确保长尾场景可兜底。
 */
const LOCAL_RESULT_FALLBACK_DELAY_MS = 14000;
const DEEP_RESULT_HARD_TIMEOUT_MS = 45000;
const SUMMARY_PREVIEW_LIMIT = 3;
const HEART_VIEWBOX_WIDTH = 200;

/**
 * 雷达图固定尺寸常量。
 */
const RADAR_VIEWBOX_SIZE = 260;
const RADAR_CENTER_POINT = RADAR_VIEWBOX_SIZE / 2;
const RADAR_RADIUS = 90;
const RADAR_GRID_LEVELS = [0.25, 0.5, 0.75, 1];

/**
 * 海报视觉风格映射。
 */
const ROMANCE_POSTER_VISUALS = {
  starlight: {
    gradientStart: "#231740",
    gradientEnd: "#533C86",
    accent: "#FFD8EA",
    accentSoft: "#A9B0FF",
  },
  candlelight: {
    gradientStart: "#612A35",
    gradientEnd: "#BA7073",
    accent: "#FFE5CA",
    accentSoft: "#FBB29E",
  },
  "sunset-park": {
    gradientStart: "#5E3E6B",
    gradientEnd: "#D68896",
    accent: "#FFD9B2",
    accentSoft: "#9FC8FF",
  },
  "warm-home": {
    gradientStart: "#5B416B",
    gradientEnd: "#A184BA",
    accent: "#FFDAEA",
    accentSoft: "#D6C6FF",
  },
  "city-night": {
    gradientStart: "#202939",
    gradientEnd: "#49546A",
    accent: "#CDD8FF",
    accentSoft: "#A5B3D4",
  },
};

/**
 * 组件入参。
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
 * 页面阶段状态。
 */
const stage = ref("survey");

/**
 * 作答主状态。
 */
const currentQuestionIndex = ref(0);
const answers = ref([]);
const selectedQuestionBank = ref([]);
const unifiedResult = ref(null);
const showAllSummary = ref(false);

/**
 * 加载文案轮播状态。
 */
const loadingMessageIndex = ref(0);
let loadingMessageTimer = null;

/**
 * 选项自动前进定时器。
 */
let autoAdvanceTimer = null;

/**
 * 海报状态。
 */
const posterPreviewUrl = ref("");
const isGeneratingPoster = ref(false);
let posterGenerationToken = 0;

/**
 * 中途激励状态。
 */
const isEncouragementVisible = ref(false);
const encouragementMessage = ref("");
const hasShownMidwayEncouragement = ref(false);
let encouragementTimer = null;

/**
 * 宿命转场状态。
 */
const isDestinyOverlayVisible = ref(false);
const destinyOverlayType = ref("processing");
const destinyOverlayPrimaryText = ref("");
const destinyOverlaySecondaryText = ref("");
const romanceProgressPhase = ref("normal");

/**
 * 守门员判定状态。
 */
const romanceGateState = ref({
  checked: false,
  passed: false,
  scorePercent: 0,
  thresholdPercent: 80,
});

/**
 * 下一步互斥锁：
 * 关键逻辑：防止用户连续点击触发并发提交。
 */
const isAdvancingToNext = ref(false);

/**
 * 深度分析会话令牌：
 * 关键逻辑：切换主题/重测时令旧请求失效，避免过期数据覆盖新状态。
 */
let deepAnalysisSessionToken = 0;

/**
 * 题库与抽题配置。
 */
const questionPool = computed(() => props.themeConfig.survey.questions);
const questionSelection = computed(() => {
  const selectionConfig = props.themeConfig.survey.questionSelection ?? {};
  return {
    minCount: selectionConfig.minCount ?? 13,
    maxCount: selectionConfig.maxCount ?? 13,
    ensureDimensionCoverage: Boolean(selectionConfig.ensureDimensionCoverage),
    dimensionKey: selectionConfig.dimensionKey ?? "",
    useSequentialQuestionOrder: Boolean(
      props.themeConfig.survey.useSequentialQuestionOrder,
    ),
  };
});

/**
 * 本轮生效题库。
 */
const questionBank = computed(() =>
  selectedQuestionBank.value.length > 0
    ? selectedQuestionBank.value
    : questionPool.value,
);

/**
 * 派生状态。
 */
const questionCount = computed(() => questionBank.value.length);
const currentQuestion = computed(() => questionBank.value[currentQuestionIndex.value]);
const isLastQuestion = computed(
  () =>
    questionBank.value.length > 0 &&
    currentQuestionIndex.value === questionBank.value.length - 1,
);
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
 * 当前加载文案。
 */
const activeLoadingMessage = computed(() => {
  const messages = props.themeConfig.theme.loadingMessages;
  return messages[loadingMessageIndex.value] ?? "";
});

/**
 * 结果来源标签样式。
 */
const sourceTagStyle = computed(() => {
  const sourceType = unifiedResult.value?.source === "local" ? "local" : "deep";
  return props.themeConfig.theme.sourceTag[sourceType];
});

/**
 * 自动下一题开关。
 */
const shouldAutoAdvance = computed(() =>
  Boolean(props.themeConfig.survey.autoAdvanceOnSelect),
);

/**
 * 浪漫进度提示文案。
 */
const romanceProgressHint = computed(() => {
  if (romanceProgressPhase.value === "processing") {
    return "宿命判定中，请稍候...";
  }

  if (romanceProgressPhase.value === "success") {
    return "信号过载，命运边界正在被突破";
  }

  if (romanceProgressPhase.value === "fail") {
    return "电波归于平静，故事停在了第 13 章";
  }

  if (isLastQuestion.value) {
    return "最后一段心动旅程，答案即将揭晓";
  }

  if (progressPercent.value >= 70) {
    return "你的浪漫拼图正在逐渐完整";
  }

  if (progressPercent.value >= 35) {
    return "心动线索持续累积中";
  }

  return "浪漫雷达已启动，请跟随直觉";
});

/**
 * 爱心进度裁剪参数：
 * 关键逻辑：通过 SVG clipPath 控制爱心填充宽度，保留神秘感且不显示题号。
 */
const heartClipPathId = "romancex-heart-clip";
const heartClipWidth = computed(
  () => (HEART_VIEWBOX_WIDTH * progressPercent.value) / 100,
);

/**
 * 雷达图数据源。
 */
const radarChartItems = computed(
  () => unifiedResult.value?.radarChart?.items ?? [],
);
const radarChartViewBox = computed(
  () => `0 0 ${RADAR_VIEWBOX_SIZE} ${RADAR_VIEWBOX_SIZE}`,
);
const radarCenterPoint = computed(() => RADAR_CENTER_POINT);

/**
 * 海报模块展示开关。
 */
const shouldShowPosterSection = computed(
  () => stage.value === "result" && Boolean(unifiedResult.value?.posterModel),
);

/**
 * 答卷摘要展示列表：
 * 关键逻辑：默认仅展示 3 条，避免结果页过长影响首屏阅读。
 */
const summaryLinesForView = computed(() => {
  const fullSummaryLines = Array.isArray(unifiedResult.value?.summaryLines)
    ? unifiedResult.value.summaryLines
    : [];

  return showAllSummary.value
    ? fullSummaryLines
    : fullSummaryLines.slice(0, SUMMARY_PREVIEW_LIMIT);
});

/**
 * 中途激励配置。
 */
const midwayEncouragementConfig = computed(() => {
  const rawConfig = props.themeConfig.survey.midwayEncouragement;
  if (!rawConfig) {
    return null;
  }

  const message = String(rawConfig.message ?? "").trim();
  if (!message) {
    return null;
  }

  return {
    triggerQuestionNumber: Math.max(
      1,
      Math.floor(Number(rawConfig.triggerQuestionNumber) || 1),
    ),
    durationMs: Math.max(500, Number(rawConfig.durationMs) || 1200),
    message,
  };
});

/**
 * 宿命守门员配置。
 */
const destinyGatekeeperConfig = computed(() => {
  const rawConfig = props.themeConfig.survey.destinyGatekeeper;
  if (!rawConfig?.enabled) {
    return null;
  }

  return {
    gateQuestionNumber: Math.max(
      1,
      Math.floor(Number(rawConfig.gateQuestionNumber) || 13),
    ),
    thresholdPercent: Math.max(
      0,
      Math.min(100, Number(rawConfig.thresholdPercent) || 80),
    ),
    unlockQuestionId: String(rawConfig.unlockQuestionId ?? "").trim(),
    processingLines: Array.isArray(rawConfig.processingLines)
      ? rawConfig.processingLines
          .map((lineItem) => String(lineItem ?? "").trim())
          .filter(Boolean)
      : [],
    unlockLine: String(rawConfig.unlockLine ?? "").trim(),
    lockLines: Array.isArray(rawConfig.lockLines)
      ? rawConfig.lockLines
          .map((lineItem) => String(lineItem ?? "").trim())
          .filter(Boolean)
      : [],
  };
});

/**
 * 雷达图百分比归一化。
 * @param {number} score 百分比分值。
 * @returns {number} 比例值。
 */
function normalizeScoreRatio(score) {
  const safeScore = Number(score ?? 0);
  if (!Number.isFinite(safeScore)) {
    return 0;
  }

  return Math.max(0, Math.min(1, safeScore / 100));
}

/**
 * 根据角度与半径比例计算雷达点位。
 * @param {number} angleRadians 角度（弧度）。
 * @param {number} ratio 半径比例。
 * @returns {{ x: number, y: number }} 点位对象。
 */
function resolveRadarPoint(angleRadians, ratio) {
  return {
    x: RADAR_CENTER_POINT + Math.cos(angleRadians) * RADAR_RADIUS * ratio,
    y: RADAR_CENTER_POINT + Math.sin(angleRadians) * RADAR_RADIUS * ratio,
  };
}

/**
 * 雷达图轴点。
 */
const radarAxisPoints = computed(() => {
  const items = radarChartItems.value;
  if (items.length < 3) {
    return [];
  }

  const axisCount = items.length;
  return items.map((item, index) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const outerPoint = resolveRadarPoint(angleRadians, 1);
    const dataPoint = resolveRadarPoint(
      angleRadians,
      normalizeScoreRatio(item.score),
    );
    const labelPoint = resolveRadarPoint(angleRadians, 1.2);

    return {
      ...item,
      outerX: outerPoint.x,
      outerY: outerPoint.y,
      valueX: dataPoint.x,
      valueY: dataPoint.y,
      labelX: labelPoint.x,
      labelY: labelPoint.y,
      label: item.label || item.name || "",
      score: Number(item.score ?? 0),
    };
  });
});

/**
 * 雷达图网格多边形。
 */
const radarGridPolygons = computed(() => {
  const axisPoints = radarAxisPoints.value;
  if (axisPoints.length < 3) {
    return [];
  }

  return RADAR_GRID_LEVELS.map((gridLevel) => {
    const polygonPoints = axisPoints.map((_, axisIndex) => {
      const angleRadians =
        -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisPoints.length;
      const point = resolveRadarPoint(angleRadians, gridLevel);
      return `${point.x},${point.y}`;
    });

    return polygonPoints.join(" ");
  });
});

/**
 * 雷达图数据面。
 */
const radarDataPolygonPoints = computed(() => {
  if (radarAxisPoints.value.length < 3) {
    return "";
  }

  return radarAxisPoints.value
    .map((axisPoint) => `${axisPoint.valueX},${axisPoint.valueY}`)
    .join(" ");
});

/**
 * 雷达图标签点。
 */
const radarLabelPoints = computed(() => {
  return radarAxisPoints.value.map((axisPoint) => ({
    x: axisPoint.labelX,
    y: axisPoint.labelY,
    label: axisPoint.label,
  }));
});

/**
 * 生成本轮题集。
 */
function rebuildQuestionBank() {
  if (questionSelection.value.useSequentialQuestionOrder) {
    /**
     * 关键逻辑：剧情模式按题库顺序取前 N 题，保证守门员题固定在第 13 题。
     */
    const sequentialCount = Math.max(
      1,
      Math.min(questionSelection.value.minCount, questionPool.value.length),
    );
    selectedQuestionBank.value = questionPool.value.slice(0, sequentialCount);
    return;
  }

  if (
    questionSelection.value.ensureDimensionCoverage &&
    questionSelection.value.dimensionKey
  ) {
    selectedQuestionBank.value = selectRandomQuestionsWithDimensionCoverage({
      questions: questionPool.value,
      minCount: questionSelection.value.minCount,
      maxCount: questionSelection.value.maxCount,
      dimensionKey: questionSelection.value.dimensionKey,
    });
    return;
  }

  selectedQuestionBank.value = selectRandomQuestionsWithoutRepeat({
    questions: questionPool.value,
    minCount: questionSelection.value.minCount,
    maxCount: questionSelection.value.maxCount,
  });
}

/**
 * 重置海报状态。
 */
function resetPosterState() {
  posterGenerationToken += 1;
  posterPreviewUrl.value = "";
  isGeneratingPoster.value = false;
}

/**
 * 重置问卷状态。
 */
function resetSurveyState() {
  deepAnalysisSessionToken += 1;
  isAdvancingToNext.value = false;
  showAllSummary.value = false;
  stopLoadingMessageTicker();
  stopAutoAdvanceTimer();
  stopEncouragementTimer();

  isEncouragementVisible.value = false;
  hasShownMidwayEncouragement.value = false;
  encouragementMessage.value = "";

  isDestinyOverlayVisible.value = false;
  destinyOverlayType.value = "processing";
  destinyOverlayPrimaryText.value = "";
  destinyOverlaySecondaryText.value = "";
  romanceProgressPhase.value = "normal";

  romanceGateState.value = {
    checked: false,
    passed: false,
    scorePercent: 0,
    thresholdPercent: destinyGatekeeperConfig.value?.thresholdPercent ?? 80,
  };

  resetPosterState();
  rebuildQuestionBank();
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: questionBank.value.length }, () => null);
  unifiedResult.value = null;
  stage.value = "survey";
}

/**
 * 启动加载文案轮播。
 */
function startLoadingMessageTicker() {
  stopLoadingMessageTicker();
  loadingMessageIndex.value = 0;
  loadingMessageTimer = window.setInterval(() => {
    const total = props.themeConfig.theme.loadingMessages.length;
    loadingMessageIndex.value = total > 0 ? (loadingMessageIndex.value + 1) % total : 0;
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
 * 停止自动下一题定时器。
 */
function stopAutoAdvanceTimer() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

/**
 * 停止中途激励定时器。
 */
function stopEncouragementTimer() {
  if (encouragementTimer) {
    window.clearTimeout(encouragementTimer);
    encouragementTimer = null;
  }
}

/**
 * 异步等待工具。
 * @param {number} durationMs 等待时长（毫秒）。
 * @returns {Promise<void>} Promise。
 */
function waitFor(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, Number(durationMs) || 0));
  });
}

/**
 * Promise 硬超时封装。
 * 复杂度评估：O(1)，仅引入定时器常数开销。
 * @template T
 * @param {Promise<T>} promise 原始 Promise。
 * @param {number} timeoutMs 超时时间。
 * @param {string} timeoutMessage 超时提示。
 * @returns {Promise<T>} 带超时控制的 Promise。
 */
function withHardTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutHandle = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, Math.max(0, Number(timeoutMs) || 0));
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutHandle) {
      window.clearTimeout(timeoutHandle);
    }
  });
}

/**
 * 是否在当前题触发中途鼓励。
 * @param {number} currentQuestionIdx 当前题索引（从 0 开始）。
 * @returns {boolean} 是否触发。
 */
function shouldTriggerMidwayEncouragement(currentQuestionIdx) {
  const config = midwayEncouragementConfig.value;
  if (!config || hasShownMidwayEncouragement.value) {
    return false;
  }

  const currentQuestionNumber = currentQuestionIdx + 1;
  return currentQuestionNumber === config.triggerQuestionNumber;
}

/**
 * 展示中途激励。
 */
function showMidwayEncouragement() {
  const config = midwayEncouragementConfig.value;
  if (!config) {
    return;
  }

  stopEncouragementTimer();
  encouragementMessage.value = config.message;
  isEncouragementVisible.value = true;
  hasShownMidwayEncouragement.value = true;
  encouragementTimer = window.setTimeout(() => {
    isEncouragementVisible.value = false;
  }, config.durationMs);
}

/**
 * 解析守门员判定结果。
 * @returns {{ passed: boolean, scorePercent: number, thresholdPercent: number }} 判定结果。
 */
function resolveGatekeeperResult() {
  const gateConfig = destinyGatekeeperConfig.value;
  if (!gateConfig) {
    return {
      passed: false,
      scorePercent: 0,
      thresholdPercent: 80,
    };
  }

  const evaluator = props.themeConfig.survey.evaluateGatekeeper;
  if (typeof evaluator !== "function") {
    return {
      passed: false,
      scorePercent: 0,
      thresholdPercent: gateConfig.thresholdPercent,
    };
  }

  const evaluatedResult = evaluator(
    questionBank.value,
    answers.value,
    gateConfig,
  );
  return {
    passed: Boolean(evaluatedResult?.passed),
    scorePercent: Math.max(
      0,
      Math.min(100, Number(evaluatedResult?.scorePercent) || 0),
    ),
    thresholdPercent: Math.max(
      0,
      Math.min(100, Number(evaluatedResult?.thresholdPercent) || gateConfig.thresholdPercent),
    ),
  };
}

/**
 * 追加解锁题（Q14）。
 * @returns {boolean} 是否追加成功。
 */
function appendDestinyUnlockQuestion() {
  const unlockQuestionId = destinyGatekeeperConfig.value?.unlockQuestionId;
  if (!unlockQuestionId) {
    return false;
  }

  const alreadyExists = selectedQuestionBank.value.some(
    (questionItem) => questionItem.id === unlockQuestionId,
  );
  if (alreadyExists) {
    return false;
  }

  const unlockQuestion = questionPool.value.find(
    (questionItem) => questionItem.id === unlockQuestionId,
  );
  if (!unlockQuestion) {
    return false;
  }

  selectedQuestionBank.value = [...selectedQuestionBank.value, unlockQuestion];
  answers.value = [...answers.value, null];
  return true;
}

/**
 * 播放宿命判定脚本。
 * @param {boolean} passed 是否通过判定。
 * @returns {Promise<void>} Promise。
 */
async function playDestinyGateOverlayScript(passed) {
  const gateConfig = destinyGatekeeperConfig.value;
  if (!gateConfig) {
    return;
  }

  const [processingPrimary = "检测到过量的浪漫因子...", processingSecondary = "正在尝试突破宿命..."] =
    gateConfig.processingLines;
  isDestinyOverlayVisible.value = true;
  destinyOverlayType.value = "processing";
  destinyOverlayPrimaryText.value = processingPrimary;
  destinyOverlaySecondaryText.value = processingSecondary;
  romanceProgressPhase.value = "processing";
  await waitFor(820);

  if (passed) {
    destinyOverlayType.value = "success";
    destinyOverlayPrimaryText.value =
      gateConfig.unlockLine || "你的坚定，为你赢得了第 14 次机会。";
    destinyOverlaySecondaryText.value = "命运裂缝已开启，正在进入新篇章...";
    romanceProgressPhase.value = "success";
    await waitFor(1180);
    isDestinyOverlayVisible.value = false;
    romanceProgressPhase.value = "normal";
    return;
  }

  const [lockPrimary = "有时候，遗憾也是一种美。", lockSecondary = "你的理性保护了你，也让你停在了第 13 章。", lockEnding = "—— 故事至此终结。"] =
    gateConfig.lockLines;
  destinyOverlayType.value = "fail";
  destinyOverlayPrimaryText.value = lockPrimary;
  destinyOverlaySecondaryText.value = `${lockSecondary} ${lockEnding}`.trim();
  romanceProgressPhase.value = "fail";
  await waitFor(1680);
  isDestinyOverlayVisible.value = false;
}

/**
 * 提交前处理宿命守门员。
 * @returns {Promise<boolean>} 是否继续进入结果阶段。
 */
async function handleDestinyGateBeforeSubmit() {
  const gateConfig = destinyGatekeeperConfig.value;
  if (!gateConfig) {
    return true;
  }

  const currentQuestionNumber = currentQuestionIndex.value + 1;
  if (
    romanceGateState.value.checked ||
    currentQuestionNumber !== gateConfig.gateQuestionNumber
  ) {
    return true;
  }

  const gateResult = resolveGatekeeperResult();
  romanceGateState.value = {
    checked: true,
    passed: gateResult.passed,
    scorePercent: gateResult.scorePercent,
    thresholdPercent: gateResult.thresholdPercent,
  };

  await playDestinyGateOverlayScript(gateResult.passed);

  if (gateResult.passed) {
    const appendedSuccess = appendDestinyUnlockQuestion();
    if (appendedSuccess) {
      // 关键逻辑：成功解锁后进入第 14 题，本次提交流程中断。
      currentQuestionIndex.value += 1;
      return false;
    }
  }

  return true;
}

/**
 * 调度自动下一题。
 * @param {number} expectedQuestionIndex 预期题目索引。
 * @param {string} optionId 当前选择选项。
 */
function scheduleAutoAdvance(expectedQuestionIndex, optionId) {
  if (!shouldAutoAdvance.value || stage.value !== "survey") {
    return;
  }

  stopAutoAdvanceTimer();
  autoAdvanceTimer = window.setTimeout(() => {
    if (stage.value !== "survey") {
      return;
    }

    if (
      currentQuestionIndex.value !== expectedQuestionIndex ||
      answers.value[expectedQuestionIndex] !== optionId
    ) {
      return;
    }

    goNext();
  }, 260);
}

/**
 * 选择选项。
 * @param {string} optionId 选项 ID。
 */
function selectOption(optionId) {
  const questionIndex = currentQuestionIndex.value;
  answers.value[questionIndex] = optionId;
  scheduleAutoAdvance(questionIndex, optionId);
}

/**
 * 返回上一题。
 */
function goPrev() {
  stopAutoAdvanceTimer();
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

/**
 * 下一步（由选项点击自动驱动）。
 */
async function goNext() {
  stopAutoAdvanceTimer();
  if (isAdvancingToNext.value) {
    return;
  }

  if (!canGoNext.value) {
    showToast("请先选择一个选项");
    return;
  }

  isAdvancingToNext.value = true;

  try {
    if (!isLastQuestion.value) {
      const shouldShowCheer = shouldTriggerMidwayEncouragement(
        currentQuestionIndex.value,
      );
      currentQuestionIndex.value += 1;
      if (shouldShowCheer) {
        showMidwayEncouragement();
      }
      return;
    }

    const shouldContinueSubmit = await handleDestinyGateBeforeSubmit();
    if (!shouldContinueSubmit) {
      return;
    }

    stage.value = "analyzing";
    const currentSessionToken = ++deepAnalysisSessionToken;

    const localResult = props.themeConfig.survey.runLocalAnalysis(
      questionBank.value,
      answers.value,
    );
    const localUnifiedResult = props.themeConfig.survey.buildLocalUnifiedResult(
      localResult,
    );

    const deepUnifiedPromise = withHardTimeout(
      (async () => {
        const deepPayload = props.themeConfig.survey.buildDeepPayload(localResult);
        const deepResult = await props.themeConfig.survey.runDeepAnalysis(deepPayload);
        return props.themeConfig.survey.buildDeepUnifiedResult(
          deepResult,
          localResult,
        );
      })(),
      DEEP_RESULT_HARD_TIMEOUT_MS,
      "深度分析耗时较长，已切换基础结果",
    );

    try {
      const firstResult = await Promise.race([
        deepUnifiedPromise.then((deepUnifiedResult) => ({
          type: "deep",
          result: deepUnifiedResult,
        })),
        waitFor(LOCAL_RESULT_FALLBACK_DELAY_MS).then(() => ({
          type: "local_timeout",
        })),
      ]);

      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }

      if (firstResult.type === "deep") {
        unifiedResult.value = firstResult.result;
        stage.value = "result";
        return;
      }

      unifiedResult.value = localUnifiedResult;
      stage.value = "result";

      deepUnifiedPromise
        .then((deepUnifiedResult) => {
          if (currentSessionToken !== deepAnalysisSessionToken) {
            return;
          }

          unifiedResult.value = deepUnifiedResult;
        })
        .catch(() => {
          // 关键逻辑：后台升级失败不额外打断用户阅读。
        });
    } catch {
      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }

      unifiedResult.value = localUnifiedResult;
      stage.value = "result";
      showToast(props.themeConfig.survey.deepFailToast);
    }
  } finally {
    isAdvancingToNext.value = false;
  }
}

/**
 * 颜色解析：把 16 进制颜色转为 RGB。
 * @param {string} hexColor 16 进制颜色。
 * @returns {{ r: number, g: number, b: number } | null} RGB 结果。
 */
function hexToRgb(hexColor) {
  const normalizedHex = String(hexColor ?? "")
    .trim()
    .replace(/^#/, "");

  if (![3, 6].includes(normalizedHex.length)) {
    return null;
  }

  const expandedHex =
    normalizedHex.length === 3
      ? normalizedHex
          .split("")
          .map((charItem) => `${charItem}${charItem}`)
          .join("")
      : normalizedHex;

  const parsedNumber = Number.parseInt(expandedHex, 16);
  if (Number.isNaN(parsedNumber)) {
    return null;
  }

  return {
    r: (parsedNumber >> 16) & 255,
    g: (parsedNumber >> 8) & 255,
    b: parsedNumber & 255,
  };
}

/**
 * RGBA 字符串生成工具。
 * @param {string} hexColor 16 进制颜色。
 * @param {number} alpha 透明度。
 * @returns {string} RGBA 字符串。
 */
function toRgbaString(hexColor, alpha) {
  const rgbColor = hexToRgb(hexColor);
  if (!rgbColor) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const safeAlpha = Math.max(0, Math.min(1, Number(alpha) || 0));
  return `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${safeAlpha})`;
}

/**
 * 解析海报视觉主题。
 * @param {string} visualKey 视觉键。
 * @returns {{ gradientStart: string, gradientEnd: string, accent: string, accentSoft: string }} 视觉配置。
 */
function resolvePosterVisual(visualKey) {
  return (
    ROMANCE_POSTER_VISUALS[visualKey] ??
    ROMANCE_POSTER_VISUALS["warm-home"]
  );
}

/**
 * Canvas 多行文本绘制。
 * 复杂度评估：O(W)，W 为文本长度。
 * @param {CanvasRenderingContext2D} context Canvas 上下文。
 * @param {string} content 文本内容。
 * @param {number} originX 起始 X。
 * @param {number} originY 起始 Y。
 * @param {number} maxWidth 最大宽度。
 * @param {number} lineHeight 行高。
 * @param {number} maxLines 最大行数。
 * @returns {number} 绘制结束后的 Y 坐标。
 */
function drawWrappedText(
  context,
  content,
  originX,
  originY,
  maxWidth,
  lineHeight,
  maxLines,
) {
  const normalizedText = String(content ?? "").trim();
  if (!normalizedText) {
    return originY;
  }

  const textChars = normalizedText.split("");
  const lines = [];
  let currentLine = "";

  textChars.forEach((charItem) => {
    const candidateLine = `${currentLine}${charItem}`;
    const candidateWidth = context.measureText(candidateLine).width;
    if (candidateWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = charItem;
      return;
    }

    currentLine = candidateLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  const safeMaxLines = Math.max(1, Math.floor(maxLines || 1));
  const visibleLines = lines.slice(0, safeMaxLines);

  if (lines.length > safeMaxLines) {
    const lastLine = visibleLines[safeMaxLines - 1];
    visibleLines[safeMaxLines - 1] = `${lastLine.replace(/.$/, "")}…`;
  }

  visibleLines.forEach((lineItem, lineIndex) => {
    context.fillText(
      lineItem,
      originX,
      originY + lineHeight * lineIndex,
    );
  });

  return originY + lineHeight * visibleLines.length;
}

/**
 * 绘制圆角矩形填充。
 * @param {CanvasRenderingContext2D} context Canvas 上下文。
 * @param {number} x 左上角 X。
 * @param {number} y 左上角 Y。
 * @param {number} width 宽度。
 * @param {number} height 高度。
 * @param {number} radius 圆角半径。
 */
function fillRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
  context.fill();
}

/**
 * 在海报中绘制雷达图。
 * @param {CanvasRenderingContext2D} context Canvas 上下文。
 * @param {Array<object>} radarItems 雷达数据。
 * @param {number} centerX 圆心 X。
 * @param {number} centerY 圆心 Y。
 * @param {number} radius 半径。
 */
function drawRadarOnPoster(context, radarItems, centerX, centerY, radius) {
  const items = Array.isArray(radarItems) ? radarItems : [];
  if (items.length < 3) {
    return;
  }

  const axisCount = items.length;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  context.save();
  context.strokeStyle = "rgba(255, 255, 255, 0.28)";
  context.lineWidth = 2;

  gridLevels.forEach((gridLevel) => {
    context.beginPath();
    items.forEach((_, axisIndex) => {
      const angleRadians = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisCount;
      const pointX = centerX + Math.cos(angleRadians) * radius * gridLevel;
      const pointY = centerY + Math.sin(angleRadians) * radius * gridLevel;
      if (axisIndex === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    });
    context.closePath();
    context.stroke();
  });

  items.forEach((_, axisIndex) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * radius;
    const pointY = centerY + Math.sin(angleRadians) * radius;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(pointX, pointY);
    context.stroke();
  });

  context.beginPath();
  items.forEach((item, axisIndex) => {
    const ratio = normalizeScoreRatio(item.score);
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * radius * ratio;
    const pointY = centerY + Math.sin(angleRadians) * radius * ratio;
    if (axisIndex === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  });
  context.closePath();
  context.fillStyle = "rgba(255, 228, 242, 0.36)";
  context.strokeStyle = "rgba(255, 246, 250, 0.95)";
  context.lineWidth = 3;
  context.fill();
  context.stroke();

  items.forEach((item, axisIndex) => {
    const ratio = normalizeScoreRatio(item.score);
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * radius * ratio;
    const pointY = centerY + Math.sin(angleRadians) * radius * ratio;
    context.beginPath();
    context.arc(pointX, pointY, 6, 0, Math.PI * 2);
    context.fillStyle = item.color || "#FFDCE9";
    context.fill();
  });

  context.fillStyle = "rgba(255, 245, 250, 0.95)";
  context.font = "600 26px 'Noto Sans SC'";
  context.textAlign = "center";
  items.forEach((item, axisIndex) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / axisCount;
    const labelX = centerX + Math.cos(angleRadians) * radius * 1.28;
    const labelY = centerY + Math.sin(angleRadians) * radius * 1.28;
    context.fillText(String(item.label || item.name || ""), labelX, labelY);
  });

  context.restore();
}

/**
 * 生成海报。
 * 复杂度评估：O(D + W)，D 为维度数量，W 为文本长度。
 * @returns {Promise<void>} Promise。
 */
async function generateRomancePoster() {
  const posterModel = unifiedResult.value?.posterModel;
  if (!posterModel) {
    return;
  }

  const currentToken = ++posterGenerationToken;
  isGeneratingPoster.value = true;

  try {
    const posterWidth = 1080;
    const posterHeight = 1920;
    const canvas = document.createElement("canvas");
    canvas.width = posterWidth;
    canvas.height = posterHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("无法初始化画布");
    }

    const visualStyle = resolvePosterVisual(posterModel.visualKey);
    const backgroundGradient = context.createLinearGradient(0, 0, 0, posterHeight);
    backgroundGradient.addColorStop(0, visualStyle.gradientStart);
    backgroundGradient.addColorStop(1, visualStyle.gradientEnd);
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, posterWidth, posterHeight);

    const glowLeft = context.createRadialGradient(
      posterWidth * 0.22,
      posterHeight * 0.16,
      40,
      posterWidth * 0.22,
      posterHeight * 0.16,
      420,
    );
    glowLeft.addColorStop(0, "rgba(255, 255, 255, 0.32)");
    glowLeft.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = glowLeft;
    context.fillRect(0, 0, posterWidth, posterHeight);

    const glowRight = context.createRadialGradient(
      posterWidth * 0.78,
      posterHeight * 0.3,
      50,
      posterWidth * 0.78,
      posterHeight * 0.3,
      380,
    );
    glowRight.addColorStop(0, "rgba(255, 214, 235, 0.24)");
    glowRight.addColorStop(1, "rgba(255, 214, 235, 0)");
    context.fillStyle = glowRight;
    context.fillRect(0, 0, posterWidth, posterHeight);

    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    fillRoundedRect(context, 84, 88, posterWidth - 168, posterHeight - 176, 42);

    context.fillStyle = visualStyle.accentSoft;
    context.font = "600 34px 'Noto Sans SC'";
    context.textAlign = "left";
    context.fillText("ROMANCE DESTINY TEST", 136, 174);

    context.fillStyle = "#3B2B54";
    context.font = "700 58px 'Noto Serif SC'";
    context.fillText("浪漫封顶值报告", 136, 258);

    context.fillStyle = "#5C4B78";
    context.font = "500 34px 'Noto Sans SC'";
    context.fillText("你的浪漫指数", 136, 324);

    context.fillStyle = visualStyle.accent;
    context.font = "700 124px 'Noto Serif SC'";
    context.fillText(`${posterModel.romanceIndex ?? 0}%`, 136, 448);

    context.fillStyle = "#3F335E";
    context.font = "700 50px 'Noto Serif SC'";
    context.fillText(String(posterModel.title ?? ""), 136, 526);

    drawRadarOnPoster(
      context,
      posterModel.radarItems ?? [],
      posterWidth / 2,
      900,
      230,
    );

    context.fillStyle = "#574870";
    context.font = "500 30px 'Noto Sans SC'";
    const quoteBottomY = drawWrappedText(
      context,
      String(posterModel.quote ?? ""),
      136,
      1240,
      posterWidth - 272,
      48,
      3,
    );

    const easterEggText = String(
      unifiedResult.value?.easterEggText ?? posterModel.easterEggText ?? "",
    ).trim();
    const ctaBaseY = quoteBottomY + 86;

    context.fillStyle = "#6B5A86";
    context.font = "500 28px 'Noto Sans SC'";
    context.fillText(
      "长按保存图片，分享你的浪漫封顶值",
      136,
      ctaBaseY,
    );

    let easterEggBottomY = ctaBaseY;
    if (easterEggText) {
      context.fillStyle = "#7C6D9C";
      context.font = "500 24px 'Noto Sans SC'";
      easterEggBottomY = drawWrappedText(
        context,
        easterEggText,
        136,
        ctaBaseY + 56,
        posterWidth - 272,
        36,
        2,
      );
    }

    const generatedTimeY = Math.max(posterHeight - 156, easterEggBottomY + 58);
    context.fillStyle = "rgba(88, 71, 118, 0.74)";
    context.font = "500 24px 'Noto Sans SC'";
    context.fillText(
      `生成时间 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
      136,
      generatedTimeY,
    );

    const generatedDataUrl = canvas.toDataURL("image/png");
    if (currentToken !== posterGenerationToken) {
      return;
    }

    posterPreviewUrl.value = generatedDataUrl;
  } catch {
    if (currentToken === posterGenerationToken) {
      showToast("海报生成失败，请重试");
    }
  } finally {
    if (currentToken === posterGenerationToken) {
      isGeneratingPoster.value = false;
    }
  }
}

/**
 * 手动触发海报生成。
 * @returns {Promise<void>} Promise。
 */
async function handleGeneratePoster() {
  await generateRomancePoster();
}

/**
 * 保存海报。
 */
function savePosterImage() {
  if (!posterPreviewUrl.value) {
    showToast("海报仍在生成，请稍候");
    return;
  }

  const downloadLink = document.createElement("a");
  downloadLink.href = posterPreviewUrl.value;
  downloadLink.download = `romance-cap-${Date.now()}.png`;
  downloadLink.click();
}

/**
 * 展开/收起答卷摘要。
 */
function toggleSummary() {
  showAllSummary.value = !showAllSummary.value;
}

/**
 * 重新测试。
 */
function restart() {
  resetSurveyState();
}

/**
 * 监听主题切换并重置。
 */
watch(
  () => props.themeConfig.key,
  () => {
    resetSurveyState();
  },
  { immediate: true },
);

/**
 * 监听阶段切换并管理加载文案轮播。
 */
watch(stage, (nextStage) => {
  if (nextStage === "analyzing") {
    startLoadingMessageTicker();
    return;
  }

  stopLoadingMessageTicker();
});

/**
 * 结果变化后自动生成海报。
 */
watch(
  [
    () => stage.value,
    () => unifiedResult.value?.posterModel,
    () => unifiedResult.value?.main?.score,
  ],
  ([nextStage, nextPosterModel]) => {
    if (nextStage !== "result" || !nextPosterModel) {
      return;
    }

    handleGeneratePoster();
  },
);

/**
 * 组件卸载清理。
 */
onBeforeUnmount(() => {
  deepAnalysisSessionToken += 1;
  stopLoadingMessageTicker();
  stopAutoAdvanceTimer();
  stopEncouragementTimer();
  isDestinyOverlayVisible.value = false;
  resetPosterState();
});
</script>

<style scoped>
.romancex-page {
  position: relative;
  min-height: 100dvh;
  padding: 18px 14px 26px;
  color: #311f47;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 195, 220, 0.42), transparent 44%),
    radial-gradient(circle at 86% 22%, rgba(190, 191, 255, 0.38), transparent 43%),
    linear-gradient(155deg, #fff7fa, #f8f2ff 45%, #eef5ff);
  font-family: "Noto Sans SC", "PingFang SC", sans-serif;
}

.romancex-grid-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.12;
  background-image:
    linear-gradient(to right, rgba(157, 123, 195, 0.22) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(157, 123, 195, 0.2) 1px, transparent 1px);
  background-size: 26px 26px;
}

.romancex-background-glow {
  position: fixed;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(4px);
}

.romancex-glow-left {
  width: 240px;
  height: 240px;
  left: -80px;
  top: -70px;
  background: radial-gradient(circle at 35% 35%, #f2a1bf, #e17ca6 70%);
  opacity: 0.5;
}

.romancex-glow-right {
  width: 260px;
  height: 260px;
  right: -96px;
  bottom: 6%;
  background: radial-gradient(circle at 35% 35%, #bcc0ff, #8f97f7 70%);
  opacity: 0.48;
}

.romancex-shell {
  position: relative;
  z-index: 2;
  width: min(100%, 600px);
  margin: 0 auto;
}

.romancex-header {
  margin: 6px 4px 20px;
}

.romancex-hub-back-wrap {
  margin-bottom: 8px;
}

.romancex-hub-back-link {
  display: inline-block;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
  padding: 6px 10px;
  background: linear-gradient(135deg, #f16ca6, #8f7ef6);
}

.romancex-badge {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: #9a6ab2;
  text-transform: uppercase;
}

.romancex-header h1 {
  margin: 9px 0 8px;
  font-size: clamp(29px, 8vw, 42px);
  line-height: 1.2;
  font-family: "Noto Serif SC", serif;
  color: #3b2757;
}

.romancex-subtitle {
  margin: 0;
  line-height: 1.65;
  color: #6f5c8d;
  font-size: 14px;
}

.romancex-participant-count {
  margin: 8px 0 0;
  color: #7d68a2;
  font-size: 12px;
}

.romancex-panel {
  position: relative;
  border-radius: 24px;
  border: 1px solid rgba(220, 200, 245, 0.82);
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.82));
  box-shadow: 0 22px 52px rgba(115, 80, 161, 0.16);
  backdrop-filter: blur(7px);
  padding: 18px 16px;
}

.romancex-progress-box {
  margin-bottom: 12px;
}

.romancex-progress-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #7b6796;
}

.romancex-heart-progress {
  position: relative;
  width: min(100%, 176px);
  margin: 0 auto;
}

.romancex-heart-svg {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 18px rgba(136, 95, 194, 0.2));
}

.romancex-heart-base {
  fill: rgba(255, 255, 255, 0.85);
}

.romancex-heart-fill {
  fill: url(#romancex-heart-gradient);
  transition: clip-path 320ms ease;
}

.romancex-heart-stroke {
  fill: transparent;
  stroke: rgba(180, 145, 220, 0.8);
  stroke-width: 2.3;
}

.romancex-progress-box.is-processing .romancex-heart-fill {
  filter: hue-rotate(14deg) saturate(1.14);
}

.romancex-progress-box.is-success .romancex-heart-fill {
  animation: romancexWaveBurst 0.62s ease-out 1;
}

.romancex-progress-box.is-fail .romancex-heart-fill {
  fill: rgba(178, 186, 206, 0.84);
  opacity: 0.72;
  filter: grayscale(0.2);
}

.romancex-question-wrap {
  min-height: 330px;
}

.romancex-question-title {
  margin: 0;
  font-size: clamp(21px, 5.6vw, 29px);
  line-height: 1.34;
  color: #3d2958;
  font-family: "Noto Serif SC", serif;
}

.romancex-question-desc {
  margin: 8px 0 16px;
  line-height: 1.64;
  color: #6f5f89;
  font-size: 13px;
}

.romancex-option-grid {
  display: grid;
  gap: 10px;
}

.romancex-option {
  width: 100%;
  border: 1px solid rgba(213, 196, 236, 0.9);
  border-radius: 14px;
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 255, 0.96));
  text-align: left;
  padding: 12px 12px 12px 11px;
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 10px;
  align-items: center;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.romancex-option:active {
  transform: scale(0.992);
}

.romancex-option.is-selected {
  border-color: rgba(225, 102, 163, 0.7);
  background: linear-gradient(155deg, #fff, #f8eeff);
  box-shadow: 0 12px 24px rgba(178, 122, 213, 0.2);
}

.romancex-option-index {
  width: 24px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, #ef6da6, #8f7ef6);
}

.romancex-option-label {
  font-size: 14px;
  line-height: 1.52;
  color: #3f3053;
}

.romancex-actions-wrap {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.romancex-auto-next-tip {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #7c6a96;
}

.romancex-btn {
  border-radius: 12px !important;
  min-height: 44px;
  font-size: 14px !important;
  font-weight: 650 !important;
}

.romancex-btn-primary {
  border: 0 !important;
  color: #fff !important;
  background: linear-gradient(133deg, #f06ca6, #8f7ef6) !important;
}

.romancex-btn-secondary {
  border: 1px solid rgba(211, 192, 235, 0.9) !important;
  color: #3f3053 !important;
  background: rgba(255, 255, 255, 0.95) !important;
}

.romancex-loading-panel {
  min-height: 210px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
}

.romancex-loading-panel p {
  margin: 0;
  color: #7a6997;
}

.romancex-source-wrap {
  margin-bottom: 8px;
}

.romancex-result-prefix {
  margin: 0;
  color: #7a6798;
  font-size: 12px;
}

.romancex-main-title {
  margin: 8px 0 8px;
  font-size: clamp(34px, 10.2vw, 50px);
  line-height: 1.1;
  color: #3a2856;
  font-family: "Noto Serif SC", serif;
}

.romancex-main-score {
  margin: 0 0 12px;
  color: #754eb0;
  font-weight: 700;
}

.romancex-highlight-card {
  border-radius: 13px;
  border: 1px solid rgba(226, 207, 245, 0.94);
  background: linear-gradient(180deg, #fff7fc, #f8f1ff);
  padding: 11px 12px;
}

.romancex-highlight-card h3 {
  margin: 0 0 6px;
  font-size: 13px;
}

.romancex-highlight-card p {
  margin: 0;
  line-height: 1.62;
  font-size: 13px;
}

.romancex-insight {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #4c3b63;
}

.romancex-card-block {
  margin-top: 16px;
  border-radius: 13px;
  border: 1px solid rgba(222, 206, 242, 0.92);
  background: linear-gradient(180deg, #fff, #fbf6ff);
  padding: 12px;
}

.romancex-card-block h3 {
  margin: 0 0 8px;
  font-size: 14px;
}

.romancex-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.romancex-chip {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #7b53a8;
  border: 1px solid rgba(210, 186, 235, 0.86);
  background: linear-gradient(160deg, #fff, #f9f1ff);
}

.romancex-radar-canvas {
  width: 100%;
  max-width: 285px;
  margin: 0 auto;
}

.romancex-radar-canvas svg {
  display: block;
  width: 100%;
  height: auto;
}

.romancex-radar-grid {
  fill: transparent;
  stroke: rgba(188, 166, 216, 0.82);
  stroke-width: 1;
}

.romancex-radar-axis {
  stroke: rgba(188, 166, 216, 0.82);
  stroke-width: 1;
}

.romancex-radar-data {
  fill: rgba(239, 108, 166, 0.21);
  stroke: rgba(138, 118, 246, 0.85);
  stroke-width: 2;
}

.romancex-radar-label {
  fill: #6f5f89;
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
}

.romancex-ranked-list,
.romancex-bullet-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.romancex-ranked-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  border: 1px solid rgba(215, 197, 237, 0.88);
  padding: 8px 10px;
  font-size: 13px;
  background: #fff;
}

.romancex-bullet-list li {
  border-radius: 10px;
  border: 1px solid rgba(215, 197, 237, 0.88);
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.62;
  background: #fff;
}

.romancex-summary-toggle {
  margin-top: 10px;
  width: 100%;
  border-radius: 10px;
  border: 1px dashed rgba(201, 174, 229, 0.92);
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(249, 241, 255, 0.95));
  color: #704f97;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 10px;
}

.romancex-easter-egg {
  margin: 13px 2px 0;
  text-align: center;
  color: #7d6a9a;
  font-size: 12px;
  line-height: 1.66;
}

.romancex-poster-desc {
  margin: 0;
  font-size: 12px;
  color: #756691;
}

.romancex-poster-preview {
  margin-top: 10px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(214, 194, 237, 0.88);
}

.romancex-poster-preview img {
  width: 100%;
  display: block;
}

.romancex-poster-loading {
  margin-top: 10px;
  min-height: 130px;
  border: 1px dashed rgba(206, 186, 232, 0.9);
  border-radius: 12px;
  display: grid;
  place-content: center;
  gap: 8px;
  color: #7c6b96;
  font-size: 12px;
}

.romancex-poster-actions {
  margin-top: 10px;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr 1fr;
}

.romancex-restart-btn {
  margin-top: 16px;
}

.romancex-floating-home {
  position: fixed;
  right: 14px;
  bottom: 16px;
  z-index: 22;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(130deg, #f06ca6, #8f7ef6);
  font-size: 12px;
  font-weight: 700;
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: 0 12px 24px rgba(78, 56, 115, 0.3);
}

.romancex-encouragement-overlay,
.romancex-destiny-overlay {
  position: absolute;
  inset: 0;
  z-index: 16;
  pointer-events: none;
  border-radius: 24px;
}

.romancex-encouragement-overlay {
  display: grid;
  place-content: center;
  padding: 18px;
}

.romancex-encouragement-text {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(134deg, rgba(240, 109, 166, 0.96), rgba(143, 126, 246, 0.96));
  box-shadow: 0 14px 30px rgba(160, 94, 189, 0.34);
}

.romancex-destiny-overlay {
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  align-content: center;
  gap: 10px;
  padding: 24px 22px;
}

.romancex-destiny-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  backdrop-filter: blur(5px);
}

.romancex-destiny-title {
  margin: 0;
  color: #fff;
  font-size: clamp(20px, 5.9vw, 30px);
  line-height: 1.3;
  font-weight: 700;
}

.romancex-destiny-desc {
  margin: 0;
  color: rgba(255, 245, 252, 0.94);
  line-height: 1.65;
  font-size: 14px;
}

.romancex-destiny-overlay.is-processing {
  animation: romancexDestinyPulse 1.2s ease-in-out infinite;
}

.romancex-destiny-overlay.is-processing::before {
  background:
    radial-gradient(circle at 50% 24%, rgba(255, 210, 233, 0.34), transparent 56%),
    linear-gradient(145deg, rgba(50, 31, 76, 0.76), rgba(23, 18, 43, 0.92));
}

.romancex-destiny-overlay.is-success {
  animation: romancexDestinyBreakout 620ms cubic-bezier(0.2, 0.7, 0.2, 1) 1;
}

.romancex-destiny-overlay.is-success::before {
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 239, 190, 0.4), transparent 60%),
    radial-gradient(circle at 50% 82%, rgba(204, 182, 255, 0.3), transparent 60%),
    linear-gradient(145deg, rgba(70, 39, 98, 0.72), rgba(25, 18, 43, 0.93));
}

.romancex-destiny-overlay.is-fail::before {
  background:
    radial-gradient(circle at 50% 16%, rgba(182, 191, 216, 0.2), transparent 56%),
    linear-gradient(155deg, rgba(27, 29, 40, 0.9), rgba(13, 13, 18, 0.95));
}

.romancex-destiny-overlay.is-fail .romancex-destiny-title {
  color: rgba(239, 243, 255, 0.95);
}

.romancex-destiny-overlay.is-fail .romancex-destiny-desc {
  color: rgba(214, 222, 245, 0.88);
}

.romancex-question-swap-enter-active,
.romancex-question-swap-leave-active,
.romancex-loading-swap-enter-active,
.romancex-loading-swap-leave-active,
.romancex-hint-pop-enter-active,
.romancex-hint-pop-leave-active,
.romancex-destiny-pop-enter-active,
.romancex-destiny-pop-leave-active {
  transition:
    opacity 250ms ease,
    transform 250ms ease,
    filter 250ms ease;
}

.romancex-question-swap-enter-from,
.romancex-loading-swap-enter-from,
.romancex-hint-pop-enter-from,
.romancex-destiny-pop-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.97);
  filter: blur(2px);
}

.romancex-question-swap-leave-to,
.romancex-loading-swap-leave-to,
.romancex-hint-pop-leave-to,
.romancex-destiny-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  filter: blur(2px);
}

@keyframes romancexWaveScan {
  from {
    filter: hue-rotate(0deg) saturate(1);
  }
  to {
    filter: hue-rotate(24deg) saturate(1.18);
  }
}

@keyframes romancexWaveBurst {
  0% {
    filter: brightness(1) saturate(1);
  }
  100% {
    filter: brightness(1.12) saturate(1.2);
  }
}

@keyframes romancexDestinyPulse {
  0%,
  100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.93;
    filter: brightness(1.08);
  }
}

@keyframes romancexDestinyBreakout {
  0% {
    transform: scale(0.94);
    filter: brightness(1);
  }
  55% {
    transform: scale(1.04);
    filter: brightness(1.14);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

@media (max-width: 390px) {
  .romancex-question-wrap {
    min-height: 330px;
  }

  .romancex-poster-actions {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 760px) {
  .romancex-page {
    padding-top: 28px;
  }

  .romancex-panel {
    padding: 22px;
  }
}
</style>
