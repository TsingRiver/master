<template>
  <div
    class="soul-page"
    :class="[
      themeConfig.theme.className,
      { 'soul-page-perf-ready': isVisualEffectsReady },
    ]"
  >
    <div class="soul-paper-texture" aria-hidden="true"></div>
    <div class="soul-tree-rings" aria-hidden="true"></div>

    <main class="soul-shell">
      <div v-if="portalMode" class="soul-portal-back-wrap">
        <a class="soul-portal-back-link" :href="portalHomeHref">返回主题中心</a>
      </div>

      <section v-if="stage === 'cover'" class="soul-cover">
        <p class="soul-cover-kicker">SOUL AGE TEST</p>
        <h1 class="soul-cover-title">
          <span class="soul-deco soul-deco-left" aria-hidden="true">❦</span>
          你的灵魂，藏着几岁的自己？
          <span class="soul-deco soul-deco-right" aria-hidden="true">❧</span>
        </h1>
        <p class="soul-cover-subtitle">完成精选的 12 题，解锁内心最真实的灵魂年龄</p>

        <div class="soul-cover-age-input-wrap">
          <label for="actual-age-input" class="soul-cover-age-label">
            实际年龄（可选，默认按 25 岁计算契合度）
          </label>
          <input
            id="actual-age-input"
            v-model.trim="actualAgeInput"
            class="soul-cover-age-input"
            type="number"
            inputmode="numeric"
            min="18"
            max="60"
            placeholder="例如 26"
          />
        </div>

        <button class="soul-btn soul-btn-primary soul-cover-start-btn" type="button" @click="startSurvey">
          开始测试 →
        </button>
      </section>

      <section v-else-if="stage === 'survey' && currentQuestion" class="soul-survey">
        <header class="soul-survey-top">
          <div class="soul-progress-wrap">
            <div class="soul-progress-track" role="progressbar" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="progressPercent">
              <div class="soul-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
            </div>
            <p class="soul-progress-text">第 {{ currentQuestionNumber }} 题 / 共 {{ questionCount }} 题</p>
          </div>
        </header>

        <transition name="soul-card-swap" mode="out-in">
          <article :key="currentQuestion.id" class="soul-question-card">
            <h2 class="soul-question-title">{{ currentQuestion.title }}</h2>

            <div class="soul-option-list" role="radiogroup" aria-label="灵魂年龄题目选项">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="soul-option-item"
                :class="{
                  'is-selected': currentSelectedOptionId === option.id,
                  'is-pulsing': lastTappedOptionId === option.id,
                }"
                type="button"
                @click="selectOption(option.id)"
              >
                <span class="soul-option-label">{{ option.label }}</span>
              </button>
            </div>
          </article>
        </transition>

        <footer class="soul-survey-bottom">
          <button
            class="soul-btn soul-btn-secondary soul-prev-btn"
            type="button"
            :disabled="currentQuestionIndex === 0"
            @click="goPrevQuestion"
          >
            上一题
          </button>
          <p class="soul-auto-next-tip">点击选项后将自动进入下一题</p>
        </footer>
      </section>

      <section v-else-if="stage === 'submitting'" class="soul-submitting-card" role="status" aria-live="polite">
        <div class="soul-submitting-spinner" aria-hidden="true"></div>
        <p class="soul-submitting-text">正在解锁你的灵魂年龄...</p>
      </section>

      <section v-else-if="stage === 'result' && analysisResult" class="soul-result">
        <header class="soul-result-hero">
          <p class="soul-result-age-number">{{ analysisResult.soulAge }}</p>
          <p class="soul-result-age-tag">{{ analysisResult.ageTagText }}</p>
          <p class="soul-result-summary">{{ analysisResult.summaryLine }}</p>
        </header>

        <article class="soul-result-module soul-result-module-key soul-result-module-core">
          <h3 class="soul-result-module-title">
            <span>灵魂年龄核心特质</span>
            <span class="soul-module-pill">核心</span>
          </h3>

          <div class="soul-radar-wrap">
            <svg class="soul-radar-svg" :viewBox="radarViewBox" role="img" aria-label="灵魂特质雷达图">
              <polygon
                v-for="(gridPolygonPoints, gridIndex) in radarGridPolygons"
                :key="`radar-grid-${gridIndex}`"
                :points="gridPolygonPoints"
                class="soul-radar-grid"
              />

              <line
                v-for="(axisPoint, axisIndex) in radarAxisPoints"
                :key="`radar-axis-${axisIndex}`"
                :x1="radarCenterPoint"
                :y1="radarCenterPoint"
                :x2="axisPoint.outerX"
                :y2="axisPoint.outerY"
                class="soul-radar-axis"
              />

              <polygon :points="radarDataPolygonPoints" class="soul-radar-data"></polygon>

              <g
                v-for="(axisPoint, pointIndex) in radarAxisPoints"
                :key="`radar-point-${pointIndex}`"
              >
                <circle
                  class="soul-radar-point"
                  :cx="axisPoint.valueX"
                  :cy="axisPoint.valueY"
                  r="4"
                  @mouseenter="setActiveRadarDimension(axisPoint.key)"
                  @focus="setActiveRadarDimension(axisPoint.key)"
                  @click="setActiveRadarDimension(axisPoint.key)"
                />
                <circle
                  class="soul-radar-point-hit"
                  :cx="axisPoint.valueX"
                  :cy="axisPoint.valueY"
                  r="12"
                  tabindex="0"
                  @mouseenter="setActiveRadarDimension(axisPoint.key)"
                  @focus="setActiveRadarDimension(axisPoint.key)"
                  @click="setActiveRadarDimension(axisPoint.key)"
                />
              </g>

              <text
                v-for="(labelPoint, labelIndex) in radarLabelPoints"
                :key="`radar-label-${labelIndex}`"
                :x="labelPoint.x"
                :y="labelPoint.y"
                class="soul-radar-label"
              >
                {{ labelPoint.label }}
              </text>
            </svg>
          </div>

          <p class="soul-radar-insight">{{ activeRadarInsightLine }}</p>
          <p
            v-for="(descriptionLine, descriptionIndex) in analysisResult.coreDescriptionLines"
            :key="`core-line-${descriptionIndex}`"
            class="soul-core-line"
          >
            {{ descriptionLine }}
          </p>
        </article>

        <article class="soul-result-module">
          <h3 class="soul-result-module-title">灵魂成长关键词</h3>
          <div class="soul-keyword-grid">
            <div
              v-for="(keywordItem, keywordIndex) in analysisResult.keywordCards"
              :key="`keyword-${keywordIndex}`"
              class="soul-keyword-tag"
              :class="`shape-${keywordItem.shape}`"
            >
              <p class="soul-keyword-title">{{ keywordItem.keyword }}</p>
              <p class="soul-keyword-desc">{{ keywordItem.description }}</p>
            </div>
          </div>
        </article>

        <article class="soul-result-module soul-fit-module soul-result-module-key soul-result-module-fit">
          <h3 class="soul-result-module-title">
            <span>灵魂与实际年龄的契合度</span>
            <span class="soul-module-pill">重点</span>
          </h3>
          <div class="soul-fit-layout">
            <div class="soul-fit-copy">
              <p class="soul-fit-line">{{ analysisResult.compatibility.line }}</p>
              <div class="soul-fit-progress-track" role="progressbar" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="analysisResult.compatibility.fitPercent">
                <div class="soul-fit-progress-fill" :style="{ width: `${analysisResult.compatibility.fitPercent}%` }"></div>
              </div>
              <p class="soul-fit-progress-text">契合度 {{ analysisResult.compatibility.fitPercent }}%</p>
            </div>

            <div class="soul-pie-wrap">
              <div class="soul-pie-blob" :style="pieChartStyle"></div>
              <ul class="soul-pie-legend">
                <li
                  v-for="segment in analysisResult.pieDistribution"
                  :key="segment.key"
                  class="soul-pie-legend-item"
                >
                  <span class="soul-pie-dot" :style="{ backgroundColor: segment.color }"></span>
                  <span>{{ segment.label }} {{ segment.percent }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </article>

        <article class="soul-result-module soul-result-module-key soul-result-module-advice">
          <h3 class="soul-result-module-title">
            <span>给你的灵魂小建议</span>
            <span class="soul-module-pill">行动</span>
          </h3>
          <div class="soul-advice-list">
            <div
              v-for="(adviceItem, adviceIndex) in analysisResult.adviceCards"
              :key="`advice-${adviceIndex}`"
              class="soul-advice-card"
            >
              <span class="soul-advice-icon" aria-hidden="true">{{ adviceItem.icon }}</span>
              <p class="soul-advice-text">{{ adviceItem.text }}</p>
            </div>
          </div>
        </article>

        <article class="soul-result-module">
          <h3 class="soul-result-module-title">灵魂同频的人</h3>
          <p class="soul-resonance-line">{{ resonanceLineForView }}</p>
        </article>

        <article class="soul-result-module soul-result-module-key soul-result-module-ai">
          <h3 class="soul-result-module-title">
            <span>AI 深度解读</span>
            <span class="soul-module-pill">AI</span>
          </h3>
          <p v-if="aiInsightStatus === 'loading'" class="soul-ai-status">
            AI 正在结合你的答卷生成更细致的解读...
          </p>
          <template v-else-if="aiInsightStatus === 'success' && aiInsightResult">
            <p class="soul-ai-paragraph">{{ aiInsightResult.deepInsight }}</p>

            <div class="soul-ai-columns">
              <div class="soul-ai-column">
                <p class="soul-ai-column-title">AI 行动建议</p>
                <ul class="soul-ai-list">
                  <li
                    v-for="(growthItem, growthIndex) in aiGrowthActionsForView"
                    :key="`ai-growth-${growthIndex}`"
                  >
                    {{ growthItem }}
                  </li>
                </ul>
              </div>

              <div class="soul-ai-column">
                <p class="soul-ai-column-title">AI 风险提醒</p>
                <ul class="soul-ai-list">
                  <li
                    v-for="(avoidItem, avoidIndex) in aiAvoidSignalsForView"
                    :key="`ai-avoid-${avoidIndex}`"
                  >
                    {{ avoidItem }}
                  </li>
                </ul>
              </div>
            </div>
          </template>
          <p v-else class="soul-ai-status">
            AI 深度解读暂不可用，当前已展示本地稳定解析结果。
          </p>
        </article>

        <footer class="soul-result-actions">
          <button class="soul-btn soul-btn-primary" type="button" :disabled="isGeneratingPoster" @click="saveResultPoster">
            {{ isGeneratingPoster ? "正在生成..." : "保存结果卡片" }}
          </button>
          <button class="soul-btn soul-btn-secondary" type="button" @click="shareResultToFriend">
            分享给朋友，测 TA 的灵魂年龄
          </button>
          <p class="soul-flow-copy">
            测试结果已保存至账户，可随时查看～
          </p>
          <button class="soul-btn soul-btn-text" type="button" @click="restartSurvey">
            重新测试
          </button>
          <p v-if="interactionFeedback" class="soul-interaction-feedback">{{ interactionFeedback }}</p>
        </footer>

        <section class="soul-poster-preview-block">
          <p class="soul-poster-preview-title">9:16 分享卡片预览</p>
          <div class="soul-poster-preview-media" :style="posterContainerStyle">
            <img
              v-if="posterPreviewUrl"
              :src="posterPreviewUrl"
              alt="灵魂年龄结果海报"
              class="soul-poster-preview-image"
              loading="lazy"
            />
            <div v-else class="soul-poster-preview-loading">
              <span>
                {{ isGeneratingPoster ? "正在生成分享卡片..." : "点击“保存结果卡片”生成预览" }}
              </span>
            </div>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { SOUL_AGE_QUESTION_BANK } from "../data/soulAgeQuestionBank";
import { analyzeSoulAgeLocally } from "../services/soulAgeAnalyzer";
import { analyzeSoulAgeWithAI } from "../services/soulAgeAiAnalyzer";
import { selectRandomQuestionsWithoutRepeat } from "../utils/randomQuestionSelector";

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
 * 页面阶段状态：
 * 1. cover：首屏封面。
 * 2. survey：答题页。
 * 3. submitting：提交加载态。
 * 4. result：结果页。
 */
const stage = ref("cover");

/**
 * 首屏视觉增强开关：
 * 关键逻辑：首帧先渲染核心内容，再启用纹理与装饰层，降低初始绘制压力。
 */
const isVisualEffectsReady = ref(false);

/**
 * 作答状态。
 */
const questionPool = SOUL_AGE_QUESTION_BANK;
// 关键逻辑：本轮题集固定为 12 题，每次开始测试都从 20 题题库随机抽取。
const selectedQuestionBank = ref([]);
const currentQuestionIndex = ref(0);
const answers = ref([]);
const lastTappedOptionId = ref("");
const actualAgeInput = ref("");
const analysisResult = ref(null);

/**
 * 分享与海报状态。
 */
const isGeneratingPoster = ref(false);
const posterPreviewUrl = ref("");
const interactionFeedback = ref("");
let autoAdvanceTimer = 0;

/**
 * AI 深度解读状态：
 * 1. idle：初始态或已重置。
 * 2. loading：AI 请求中。
 * 3. success：AI 返回成功。
 * 4. failed：AI 请求失败（回落本地结果）。
 */
const aiInsightStatus = ref("idle");
const aiInsightResult = ref(null);
let aiInsightRequestToken = 0;

/**
 * 雷达图激活维度。
 */
const activeRadarDimensionKey = ref("rationality");

/**
 * 派生状态：题量、当前题、是否最后一题。
 */
const questionCount = computed(() => selectedQuestionBank.value.length);
const currentQuestionNumber = computed(() => currentQuestionIndex.value + 1);
const currentQuestion = computed(
  () => selectedQuestionBank.value[currentQuestionIndex.value],
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === questionCount.value - 1,
);
const currentSelectedOptionId = computed(
  () => answers.value[currentQuestionIndex.value],
);

/**
 * 海报预览容器宽高比。
 * 关键逻辑：始终预留 9:16 空间，避免海报异步生成时导致结果页 CLS。
 */
const posterContainerStyle = computed(() => ({
  aspectRatio: "9 / 16",
}));

/**
 * 进度百分比：
 * 关键逻辑：进度按“当前题号 / 总题数”展示，视觉更稳定。
 */
const progressPercent = computed(() => {
  const percentValue = (currentQuestionNumber.value / questionCount.value) * 100;
  return Math.round(percentValue);
});

/**
 * 雷达图基础几何常量。
 */
const RADAR_VIEWBOX_SIZE = 320;
const RADAR_CENTER = RADAR_VIEWBOX_SIZE / 2;
const RADAR_RADIUS = 102;
const RADAR_GRID_LEVELS = [0.25, 0.5, 0.75, 1];

/**
 * 雷达图视窗字符串。
 */
const radarViewBox = computed(
  () => `0 0 ${RADAR_VIEWBOX_SIZE} ${RADAR_VIEWBOX_SIZE}`,
);
const radarCenterPoint = computed(() => RADAR_CENTER);

/**
 * 雷达图数据列表。
 */
const radarItems = computed(() => analysisResult.value?.radarItems ?? []);

/**
 * 计算极坐标点位。
 * @param {number} angleRadians 角度弧度值。
 * @param {number} ratio 半径占比（0~1）。
 * @returns {{ x: number, y: number }} 画布点位。
 */
function resolveRadarPoint(angleRadians, ratio) {
  return {
    x: RADAR_CENTER + Math.cos(angleRadians) * RADAR_RADIUS * ratio,
    y: RADAR_CENTER + Math.sin(angleRadians) * RADAR_RADIUS * ratio,
  };
}

/**
 * 雷达图轴点位。
 * 复杂度评估：O(D)
 * D 为维度数量（固定 6，常数级）。
 */
const radarAxisPoints = computed(() => {
  if (radarItems.value.length < 3) {
    return [];
  }

  const axisCount = radarItems.value.length;
  return radarItems.value.map((item, index) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const outerPoint = resolveRadarPoint(angleRadians, 1);
    const labelPoint = resolveRadarPoint(angleRadians, 1.23);
    const valuePoint = resolveRadarPoint(
      angleRadians,
      Math.max(0, Math.min(1, Number(item.score ?? 0) / 100)),
    );

    return {
      ...item,
      outerX: outerPoint.x,
      outerY: outerPoint.y,
      labelX: labelPoint.x,
      labelY: labelPoint.y,
      valueX: valuePoint.x,
      valueY: valuePoint.y,
    };
  });
});

/**
 * 雷达图网格多边形。
 */
const radarGridPolygons = computed(() => {
  if (radarAxisPoints.value.length < 3) {
    return [];
  }

  return RADAR_GRID_LEVELS.map((levelItem) => {
    const points = radarAxisPoints.value.map((_, axisIndex) => {
      const angleRadians =
        -Math.PI / 2 + (Math.PI * 2 * axisIndex) / radarAxisPoints.value.length;
      const point = resolveRadarPoint(angleRadians, levelItem);
      return `${point.x},${point.y}`;
    });
    return points.join(" ");
  });
});

/**
 * 雷达图数据面多边形。
 */
const radarDataPolygonPoints = computed(() =>
  radarAxisPoints.value
    .map((axisPoint) => `${axisPoint.valueX},${axisPoint.valueY}`)
    .join(" "),
);

/**
 * 雷达图标签点位。
 */
const radarLabelPoints = computed(() =>
  radarAxisPoints.value.map((axisPoint) => ({
    x: axisPoint.labelX,
    y: axisPoint.labelY,
    label: axisPoint.label,
  })),
);

/**
 * 当前激活维度的解读。
 */
const activeRadarInsightLine = computed(() => {
  const matchedItem = radarItems.value.find(
    (item) => item.key === activeRadarDimensionKey.value,
  );

  if (!matchedItem) {
    return "将鼠标移动到雷达图维度点位，可查看每项得分与解读。";
  }

  return `${matchedItem.label} ${matchedItem.score} 分 -> ${matchedItem.insight}`;
});

/**
 * 结果页展示的同频文案：
 * 关键逻辑：AI 成功优先展示 AI 同频文案，失败时回退本地解析。
 */
const resonanceLineForView = computed(() => {
  const aiResonanceLine = String(aiInsightResult.value?.resonanceLine ?? "").trim();
  if (aiInsightStatus.value === "success" && aiResonanceLine) {
    return aiResonanceLine;
  }

  return String(analysisResult.value?.resonanceLine ?? "").trim();
});

/**
 * AI 模块行动建议展示列表。
 */
const aiGrowthActionsForView = computed(() => {
  if (aiInsightStatus.value !== "success") {
    return [];
  }

  return Array.isArray(aiInsightResult.value?.growthActions)
    ? aiInsightResult.value.growthActions
    : [];
});

/**
 * AI 模块风险提醒展示列表。
 */
const aiAvoidSignalsForView = computed(() => {
  if (aiInsightStatus.value !== "success") {
    return [];
  }

  return Array.isArray(aiInsightResult.value?.avoidSignals)
    ? aiInsightResult.value.avoidSignals
    : [];
});

/**
 * 饼图背景样式（手绘不规则感）。
 * 复杂度评估：O(S)
 * S 为饼图分段数（固定 3，常数级）。
 */
const pieChartStyle = computed(() => {
  const pieSegments = analysisResult.value?.pieDistribution ?? [];
  if (pieSegments.length === 0) {
    return {};
  }

  let cursorPercent = 0;
  const gradientStops = pieSegments.map((segmentItem) => {
    const startPercent = cursorPercent;
    cursorPercent += Number(segmentItem.percent ?? 0);
    return `${segmentItem.color} ${startPercent}% ${cursorPercent}%`;
  });

  return {
    background: `conic-gradient(${gradientStops.join(", ")})`,
  };
});

/**
 * 延迟工具函数。
 * @param {number} durationMs 延迟毫秒数。
 * @returns {Promise<void>} Promise 对象。
 */
function wait(durationMs) {
  return new Promise((resolvePromise) => {
    window.setTimeout(resolvePromise, durationMs);
  });
}

/**
 * 重置 AI 解读状态。
 * 关键逻辑：递增请求令牌，使旧请求结果自然失效，避免重测串结果。
 */
function resetAiInsightState() {
  aiInsightRequestToken += 1;
  aiInsightStatus.value = "idle";
  aiInsightResult.value = null;
}

/**
 * 解析用户输入实际年龄。
 * @returns {number | null} 可用年龄值；无效时返回 null。
 */
function resolveActualAgeInput() {
  const rawInputValue = String(actualAgeInput.value ?? "").trim();
  if (!rawInputValue) {
    return null;
  }

  const parsedAgeValue = Number(rawInputValue);
  if (!Number.isFinite(parsedAgeValue)) {
    return null;
  }

  return Math.max(18, Math.min(60, Math.round(parsedAgeValue)));
}

/**
 * 开始测试。
 */
function startSurvey() {
  clearAutoAdvanceTimer();
  resetAiInsightState();

  const nextQuestionBank = selectRandomQuestionsWithoutRepeat({
    questions: questionPool,
    minCount: 12,
    maxCount: 12,
  });

  if (nextQuestionBank.length === 0) {
    interactionFeedback.value = "题库加载失败，请刷新页面后重试。";
    return;
  }

  // 关键逻辑：每次开始测试都重新随机抽 12 题，保证每轮题目组合不同。
  selectedQuestionBank.value = nextQuestionBank;
  // 关键逻辑：每次开始都重置状态，避免重测串数据。
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: selectedQuestionBank.value.length }, () => null);
  analysisResult.value = null;
  posterPreviewUrl.value = "";
  interactionFeedback.value = "";
  activeRadarDimensionKey.value = "rationality";
  stage.value = "survey";
}

/**
 * 发起 AI 深度解读请求（异步，不阻塞结果页首屏渲染）。
 * @param {object} localResult 本地分析结果对象。
 * @returns {Promise<void>} Promise。
 */
async function requestAiInsight(localResult) {
  const currentRequestToken = ++aiInsightRequestToken;
  aiInsightStatus.value = "loading";
  aiInsightResult.value = null;

  try {
    const aiResult = await analyzeSoulAgeWithAI(
      {
        soulAge: localResult.soulAge,
        ageTitle: localResult.ageTitle,
        summaryLine: localResult.summaryLine,
        radarItems: localResult.radarItems,
        keywordCards: localResult.keywordCards,
        adviceCards: localResult.adviceCards,
        resonanceLine: localResult.resonanceLine,
        summaryLines: localResult.summaryLines,
      },
      { timeoutMs: 22000 },
    );

    if (currentRequestToken !== aiInsightRequestToken) {
      return;
    }

    aiInsightResult.value = aiResult;
    aiInsightStatus.value = "success";
  } catch {
    if (currentRequestToken !== aiInsightRequestToken) {
      return;
    }

    aiInsightStatus.value = "failed";
    aiInsightResult.value = null;
  }
}

/**
 * 清理自动下一题定时器。
 */
function clearAutoAdvanceTimer() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = 0;
  }
}

/**
 * 首帧后启用视觉增强层。
 * 关键逻辑：双 requestAnimationFrame 确保关键内容先绘制，再打开纹理层。
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
 * 选择当前题目选项。
 * @param {string} optionId 选项 ID。
 */
function selectOption(optionId) {
  answers.value[currentQuestionIndex.value] = optionId;
  lastTappedOptionId.value = optionId;

  // 关键逻辑：短时清理脉冲状态，避免动画类常驻。
  window.setTimeout(() => {
    if (lastTappedOptionId.value === optionId) {
      lastTappedOptionId.value = "";
    }
  }, 220);

  // 关键逻辑：选项点击后自动进入下一题；最后一题点选后直接提交。
  clearAutoAdvanceTimer();
  autoAdvanceTimer = window.setTimeout(async () => {
    if (stage.value !== "survey") {
      return;
    }

    if (isLastQuestion.value) {
      await submitSurveyResult();
      return;
    }

    currentQuestionIndex.value += 1;
  }, 220);
}

/**
 * 返回上一题。
 */
function goPrevQuestion() {
  clearAutoAdvanceTimer();

  if (currentQuestionIndex.value <= 0) {
    return;
  }

  currentQuestionIndex.value -= 1;
}

/**
 * 提交并生成结果。
 * 关键逻辑：加载态至少 1.2 秒，避免“闪跳”导致感知不稳定。
 */
async function submitSurveyResult() {
  clearAutoAdvanceTimer();
  stage.value = "submitting";
  await wait(1200);

  const localResult = analyzeSoulAgeLocally({
    questions: selectedQuestionBank.value,
    answerIds: answers.value,
    actualAge: resolveActualAgeInput(),
  });
  analysisResult.value = localResult;

  activeRadarDimensionKey.value = analysisResult.value?.radarItems?.[0]?.key ?? "rationality";
  stage.value = "result";

  // 关键逻辑：结果页先展示本地稳定结果，再异步追加 AI 深度解读。
  void requestAiInsight(localResult);
}

/**
 * 更新雷达图激活维度。
 * @param {string} dimensionKey 维度 key。
 */
function setActiveRadarDimension(dimensionKey) {
  activeRadarDimensionKey.value = dimensionKey;
}

/**
 * 绘制圆角矩形。
 * @param {CanvasRenderingContext2D} context 2D 绘图上下文。
 * @param {number} x 左上角 X 坐标。
 * @param {number} y 左上角 Y 坐标。
 * @param {number} width 宽度。
 * @param {number} height 高度。
 * @param {number} radius 圆角半径。
 */
function fillRoundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
  context.fill();
}

/**
 * 在海报画布中绘制简化雷达图。
 * @param {CanvasRenderingContext2D} context 2D 绘图上下文。
 * @param {number} centerX 圆心 X。
 * @param {number} centerY 圆心 Y。
 * @param {number} radius 雷达半径。
 * @param {Array<{ label: string, score: number }>} items 维度数组。
 */
function drawPosterRadar(context, centerX, centerY, radius, items) {
  if (!Array.isArray(items) || items.length < 3) {
    return;
  }

  const axisCount = items.length;
  const levels = [0.25, 0.5, 0.75, 1];

  context.save();
  context.strokeStyle = "rgba(193, 154, 107, 0.5)";
  context.setLineDash([8, 8]);
  context.lineWidth = 1.4;

  levels.forEach((levelItem) => {
    context.beginPath();
    items.forEach((_, index) => {
      const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
      const pointX = centerX + Math.cos(angleRadians) * radius * levelItem;
      const pointY = centerY + Math.sin(angleRadians) * radius * levelItem;
      if (index === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    });
    context.closePath();
    context.stroke();
  });

  context.setLineDash([]);
  context.strokeStyle = "rgba(193, 154, 107, 0.6)";
  items.forEach((_, index) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * radius;
    const pointY = centerY + Math.sin(angleRadians) * radius;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(pointX, pointY);
    context.stroke();
  });

  context.fillStyle = "rgba(232, 213, 196, 0.3)";
  context.strokeStyle = "#C19A6B";
  context.lineWidth = 2;
  context.beginPath();
  items.forEach((item, index) => {
    const ratio = Math.max(0, Math.min(1, Number(item.score ?? 0) / 100));
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * radius * ratio;
    const pointY = centerY + Math.sin(angleRadians) * radius * ratio;
    if (index === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  });
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = "#5A4B3E";
  context.font = "bold 24px 'PingFang SC', sans-serif";
  context.textAlign = "center";
  items.forEach((item, index) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const pointX = centerX + Math.cos(angleRadians) * (radius + 34);
    const pointY = centerY + Math.sin(angleRadians) * (radius + 34);
    context.fillText(String(item.label ?? ""), pointX, pointY);
  });
  context.restore();
}

/**
 * 绘制伪二维码（离线可用占位图形）。
 * 复杂度评估：O(N^2)
 * N 为网格边长（当前固定 21）。
 * @param {CanvasRenderingContext2D} context 2D 绘图上下文。
 * @param {number} startX 左上角 X 坐标。
 * @param {number} startY 左上角 Y 坐标。
 * @param {number} size 总尺寸。
 */
function drawPseudoQrCode(context, startX, startY, size) {
  const gridSize = 21;
  const cellSize = size / gridSize;

  context.fillStyle = "#fff";
  context.fillRect(startX, startY, size, size);
  context.fillStyle = "#5A4B3E";

  for (let rowIndex = 0; rowIndex < gridSize; rowIndex += 1) {
    for (let colIndex = 0; colIndex < gridSize; colIndex += 1) {
      const isFinderCorner =
        (rowIndex < 7 && colIndex < 7) ||
        (rowIndex < 7 && colIndex >= 14) ||
        (rowIndex >= 14 && colIndex < 7);

      const hashSeed = (rowIndex * 17 + colIndex * 31 + 13) % 7;
      const shouldFill = isFinderCorner || hashSeed <= 2;

      if (!shouldFill) {
        continue;
      }

      context.fillRect(
        startX + colIndex * cellSize,
        startY + rowIndex * cellSize,
        cellSize,
        cellSize,
      );
    }
  }
}

/**
 * 生成 9:16 结果海报。
 * @returns {Promise<string>} PNG Data URL。
 */
async function generatePosterDataUrl() {
  const resultData = analysisResult.value;
  if (!resultData) {
    throw new Error("结果数据为空");
  }

  const posterWidth = 1080;
  const posterHeight = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = posterWidth;
  canvas.height = posterHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法创建 2D 绘图上下文");
  }

  context.fillStyle = "#F8F5F2";
  context.fillRect(0, 0, posterWidth, posterHeight);

  // 关键逻辑：添加轻纹理噪点，保留复古纸张质感。
  context.fillStyle = "rgba(193, 154, 107, 0.07)";
  for (let index = 0; index < 1100; index += 1) {
    const pointX = Math.random() * posterWidth;
    const pointY = Math.random() * posterHeight;
    const pointSize = Math.random() * 2.2;
    context.fillRect(pointX, pointY, pointSize, pointSize);
  }

  context.fillStyle = "rgba(212, 185, 150, 0.22)";
  fillRoundedRect(context, 70, 70, posterWidth - 140, posterHeight - 140, 42);

  context.fillStyle = "#5A4B3E";
  context.font = "700 58px 'Noto Serif SC', serif";
  context.textAlign = "left";
  context.fillText("你的灵魂，藏着几岁的自己？", 120, 200);

  context.fillStyle = "#C19A6B";
  context.font = "700 176px 'Noto Serif SC', serif";
  context.fillText(String(resultData.soulAge), 120, 408);

  context.fillStyle = "#5A4B3E";
  context.font = "700 46px 'PingFang SC', sans-serif";
  context.fillText(resultData.ageTagText, 120, 486);

  /**
   * 关键逻辑：海报雷达图下移并轻微缩小，
   * 避免顶部维度标签与年龄标题区域发生重叠。
   */
  const posterRadarCenterX = posterWidth / 2;
  const posterRadarCenterY = 828;
  const posterRadarRadius = 198;
  drawPosterRadar(
    context,
    posterRadarCenterX,
    posterRadarCenterY,
    posterRadarRadius,
    resultData.radarItems,
  );

  context.fillStyle = "#5A4B3E";
  context.font = "700 44px 'Noto Serif SC', serif";
  context.fillText("核心关键词", 120, 1120);

  context.font = "600 38px 'PingFang SC', sans-serif";
  resultData.keywordCards.forEach((keywordItem, keywordIndex) => {
    const itemY = 1190 + keywordIndex * 70;
    context.fillStyle = "#5A4B3E";
    context.fillText(`${keywordIndex + 1}. ${keywordItem.keyword}`, 130, itemY);
    context.fillStyle = "#8B7D6B";
    context.font = "500 30px 'PingFang SC', sans-serif";
    context.fillText(keywordItem.description, 330, itemY);
    context.font = "600 38px 'PingFang SC', sans-serif";
  });

  context.fillStyle = "#5A4B3E";
  context.font = "600 34px 'PingFang SC', sans-serif";
  context.fillText("扫码测你的灵魂年龄", 120, 1660);

  drawPseudoQrCode(context, posterWidth - 340, 1520, 190);
  context.strokeStyle = "#E8D5C4";
  context.lineWidth = 8;
  context.strokeRect(posterWidth - 340, 1520, 190, 190);

  context.fillStyle = "#8B7D6B";
  context.font = "500 28px 'PingFang SC', sans-serif";
  context.fillText("20 题池随机抽 12 题 · 温柔治愈系测试", 120, 1740);
  context.fillText("结果仅供娱乐与自我觉察参考", 120, 1790);

  return canvas.toDataURL("image/png");
}

/**
 * 保存结果海报（生成 + 下载）。
 */
async function saveResultPoster() {
  if (!analysisResult.value) {
    return;
  }

  try {
    isGeneratingPoster.value = true;
    interactionFeedback.value = "";

    // 关键逻辑：没有预览图时先生成，避免重复渲染。
    if (!posterPreviewUrl.value) {
      posterPreviewUrl.value = await generatePosterDataUrl();
    }

    const anchorElement = document.createElement("a");
    anchorElement.href = posterPreviewUrl.value;
    anchorElement.download = `soul-age-card-${Date.now()}.png`;
    anchorElement.click();
  } catch {
    interactionFeedback.value = "海报生成失败，请稍后重试。";
  } finally {
    isGeneratingPoster.value = false;
  }
}

/**
 * 分享结果给朋友。
 */
async function shareResultToFriend() {
  if (!analysisResult.value) {
    return;
  }

  const shareTitle = "你的灵魂，藏着几岁的自己？";
  const shareText = `我测出的灵魂年龄是 ${analysisResult.value.soulAge} 岁，快来测测你的是多少。`;
  const shareUrl = window.location.href;

  try {
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      interactionFeedback.value = "已打开系统分享面板。";
      return;
    }

    await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
    interactionFeedback.value = "分享文案已复制，快发给朋友吧。";
  } catch {
    interactionFeedback.value = "当前环境不支持自动分享，请手动复制链接。";
  }
}

/**
 * 重新开始测试。
 */
function restartSurvey() {
  clearAutoAdvanceTimer();
  resetAiInsightState();
  stage.value = "cover";
  selectedQuestionBank.value = [];
  currentQuestionIndex.value = 0;
  answers.value = [];
  analysisResult.value = null;
  posterPreviewUrl.value = "";
  interactionFeedback.value = "";
  activeRadarDimensionKey.value = "rationality";
}

/**
 * 组件挂载后延迟启用纹理层。
 */
onMounted(() => {
  enableVisualEffectsAfterFirstPaint();
});

/**
 * 组件卸载时清理自动跳题定时器，避免悬挂回调。
 */
onBeforeUnmount(() => {
  clearAutoAdvanceTimer();
});
</script>

<style scoped>
.soul-page {
  --soul-bg: #f8f5f2;
  --soul-card: #f8f5f2;
  --soul-border: #e8d5c4;
  --soul-text-main: #5a4b3e;
  --soul-text-sub: #8b7d6b;
  --soul-gold: #d4b996;
  --soul-brown: #c19a6b;
  --soul-blue: #b8d4e3;
  min-height: 100vh;
  background: var(--soul-bg);
  color: var(--soul-text-main);
  position: relative;
  overflow-x: hidden;
  padding: 20px 14px 36px;
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.soul-paper-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
  background:
    radial-gradient(circle at 15% 20%, rgba(193, 154, 107, 0.12), transparent 38%),
    radial-gradient(circle at 80% 12%, rgba(184, 212, 227, 0.18), transparent 35%),
    repeating-linear-gradient(
      10deg,
      rgba(90, 75, 62, 0.02) 0px,
      rgba(90, 75, 62, 0.02) 1px,
      transparent 1px,
      transparent 6px
    );
  z-index: 0;
}

/* 首屏性能策略：
 * 关键逻辑：首帧先输出结构与文本，纹理装饰层延后启用，减少首屏合成负担。 */
.soul-page:not(.soul-page-perf-ready) .soul-paper-texture,
.soul-page:not(.soul-page-perf-ready) .soul-tree-rings {
  display: none;
}

.soul-tree-rings {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.16;
  background:
    radial-gradient(circle at 72% 34%, transparent 0 130px, rgba(193, 154, 107, 0.2) 132px, transparent 136px),
    radial-gradient(circle at 72% 34%, transparent 0 170px, rgba(193, 154, 107, 0.14) 172px, transparent 176px),
    radial-gradient(circle at 72% 34%, transparent 0 210px, rgba(193, 154, 107, 0.1) 212px, transparent 216px);
  filter: blur(1px);
  z-index: 0;
}

.soul-shell {
  position: relative;
  z-index: 1;
  width: min(100%, 980px);
  margin: 0 auto;
}

.soul-portal-back-wrap {
  margin-bottom: 10px;
}

.soul-portal-back-link {
  font-size: 13px;
  color: var(--soul-text-sub);
  text-decoration: none;
  border-bottom: 1px dashed var(--soul-border);
}

.soul-cover {
  min-height: min(76vh, 740px);
  border-radius: 18px;
  border: 1px solid rgba(232, 213, 196, 0.9);
  background: rgba(248, 245, 242, 0.92);
  box-shadow: 0 22px 42px rgba(90, 75, 62, 0.1);
  padding: 44px 22px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.soul-cover-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--soul-text-sub);
}

.soul-cover-title {
  margin: 18px 0 10px;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  font-size: clamp(28px, 5.1vw, 36px);
  line-height: 1.35;
  color: var(--soul-text-main);
  font-weight: 700;
}

.soul-deco {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--soul-gold);
  font-size: clamp(20px, 3.4vw, 24px);
}

.soul-deco-left {
  margin-right: 8px;
}

.soul-deco-right {
  margin-left: 8px;
}

.soul-cover-subtitle {
  margin: 0;
  font-size: 16px;
  color: var(--soul-text-sub);
}

.soul-cover-age-input-wrap {
  width: min(100%, 360px);
  margin-top: 26px;
}

.soul-cover-age-label {
  display: block;
  margin-bottom: 8px;
  text-align: left;
  font-size: 13px;
  color: var(--soul-text-sub);
}

.soul-cover-age-input {
  width: 100%;
  border: 1px solid var(--soul-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--soul-text-main);
  padding: 10px 12px;
  font-size: 15px;
}

.soul-cover-age-input:focus {
  outline: 2px solid rgba(212, 185, 150, 0.42);
  border-color: var(--soul-gold);
}

.soul-btn {
  border: none;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.soul-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.soul-btn-primary {
  border-radius: 8px;
  background: var(--soul-border);
  color: var(--soul-text-main);
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(193, 154, 107, 0.18);
}

.soul-btn-primary:hover:not(:disabled) {
  background: var(--soul-gold);
  transform: translateY(-1px);
}

.soul-cover-start-btn {
  margin-top: 22px;
  width: min(80%, 300px);
  min-height: 52px;
}

.soul-survey {
  display: grid;
  gap: 16px;
}

.soul-survey-top {
  display: block;
}

.soul-progress-wrap {
  flex: 1;
}

.soul-progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f0eee9;
  overflow: hidden;
}

.soul-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: #d4b996;
  transition: width 300ms ease;
}

.soul-progress-text {
  margin: 8px 0 0;
  color: var(--soul-text-sub);
  font-size: 14px;
}

.soul-question-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(232, 213, 196, 0.48);
  padding: 24px;
}

.soul-question-title {
  margin: 0;
  color: var(--soul-text-main);
  font-size: clamp(18px, 3.2vw, 20px);
  line-height: 1.5;
  text-align: center;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
}

.soul-option-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.soul-option-item {
  border: 1px solid var(--soul-border);
  border-radius: 6px;
  background: #fff;
  text-align: left;
  padding: 14px 16px;
  min-height: 54px;
  font-size: 16px;
  line-height: 1.4;
  color: var(--soul-text-sub);
  transition: background-color 200ms ease, border-color 200ms ease, transform 200ms ease;
}

.soul-option-item:hover {
  background: #f5f0eb;
}

.soul-option-item.is-selected {
  background: var(--soul-border);
  color: var(--soul-text-main);
  border-width: 1.5px;
  border-color: var(--soul-brown);
}

.soul-option-item.is-pulsing {
  animation: soulOptionPulse 200ms ease;
}

.soul-survey-bottom {
  display: grid;
  gap: 8px;
}

.soul-prev-btn {
  width: min(100%, 320px);
  min-height: 46px;
  margin: 0 auto;
}

.soul-auto-next-tip {
  margin: 0;
  text-align: center;
  color: var(--soul-text-sub);
  font-size: 13px;
}

.soul-submitting-card {
  border-radius: 16px;
  border: 1px solid rgba(232, 213, 196, 0.88);
  background: rgba(248, 245, 242, 0.94);
  box-shadow: 0 18px 40px rgba(90, 75, 62, 0.1);
  padding: 42px 24px;
  text-align: center;
}

.soul-submitting-spinner {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  border-radius: 999px;
  border: 3px solid rgba(212, 185, 150, 0.24);
  border-top-color: var(--soul-gold);
  animation: soulSpin 0.9s linear infinite;
}

.soul-submitting-text {
  margin: 14px 0 0;
  font-size: 15px;
  color: var(--soul-text-sub);
}

.soul-result {
  display: grid;
  gap: 14px;
}

.soul-result-hero {
  border-radius: 16px;
  border: 1.5px solid rgba(193, 154, 107, 0.35);
  background:
    radial-gradient(circle at 88% 14%, rgba(212, 185, 150, 0.18), transparent 34%),
    linear-gradient(145deg, rgba(248, 245, 242, 0.98), rgba(255, 255, 255, 0.94));
  box-shadow: 0 20px 44px rgba(90, 75, 62, 0.12);
  padding: 24px 18px;
  text-align: center;
}

.soul-result-age-number {
  margin: 0;
  color: var(--soul-brown);
  font-size: clamp(48px, 8vw, 60px);
  font-weight: 800;
  text-shadow: 0 0 10px rgba(193, 154, 107, 0.3);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
}

.soul-result-age-tag {
  margin: 8px auto 0;
  background: var(--soul-border);
  color: var(--soul-text-main);
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 18px;
}

.soul-result-summary {
  margin: 12px auto 0;
  color: var(--soul-text-sub);
  font-size: 16px;
  line-height: 1.5;
  max-width: 760px;
}

.soul-result-module {
  --module-accent: rgba(193, 154, 107, 0.28);
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(232, 213, 196, 0.85);
  background: rgba(248, 245, 242, 0.95);
  box-shadow: 0 10px 26px rgba(90, 75, 62, 0.09);
  padding: 18px 16px;
}

.soul-result-module::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 4px;
  background: var(--module-accent);
}

.soul-result-module-title {
  margin: 0;
  font-size: 18px;
  color: var(--soul-text-main);
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.soul-module-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 24px;
  border-radius: 999px;
  padding: 0 10px;
  font-size: 12px;
  letter-spacing: 0.02em;
  font-weight: 700;
  color: #5a4b3e;
  background: rgba(212, 185, 150, 0.4);
  border: 1px solid rgba(193, 154, 107, 0.45);
}

.soul-result-module-key {
  border-width: 1.5px;
  box-shadow: 0 14px 30px rgba(90, 75, 62, 0.12);
}

.soul-result-module-core {
  --module-accent: linear-gradient(90deg, rgba(193, 154, 107, 0.65), rgba(212, 185, 150, 0.25));
  background:
    linear-gradient(160deg, rgba(255, 250, 245, 0.96), rgba(248, 245, 242, 0.96)),
    rgba(248, 245, 242, 0.95);
}

.soul-result-module-fit {
  --module-accent: linear-gradient(90deg, rgba(152, 187, 204, 0.8), rgba(193, 154, 107, 0.38));
  background:
    linear-gradient(150deg, rgba(238, 247, 250, 0.94), rgba(248, 245, 242, 0.96) 62%),
    rgba(248, 245, 242, 0.95);
}

.soul-result-module-advice {
  --module-accent: linear-gradient(90deg, rgba(232, 213, 196, 0.9), rgba(212, 185, 150, 0.4));
  background:
    linear-gradient(155deg, rgba(255, 248, 241, 0.96), rgba(248, 245, 242, 0.95)),
    rgba(248, 245, 242, 0.95);
}

.soul-result-module-ai {
  --module-accent: linear-gradient(90deg, rgba(212, 185, 150, 0.9), rgba(184, 212, 227, 0.46));
  background:
    radial-gradient(circle at 94% 16%, rgba(212, 185, 150, 0.16), transparent 28%),
    linear-gradient(150deg, rgba(255, 251, 245, 0.96), rgba(248, 245, 242, 0.95)),
    rgba(248, 245, 242, 0.95);
}

.soul-result-module-fit .soul-fit-progress-fill {
  background: linear-gradient(90deg, #8fb8cc, #d4b996);
}

.soul-radar-wrap {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.soul-radar-svg {
  width: min(100%, 260px);
  height: auto;
}

.soul-radar-grid {
  fill: none;
  stroke: rgba(193, 154, 107, 0.26);
  stroke-width: 1.2;
  stroke-dasharray: 5 5;
}

.soul-radar-axis {
  stroke: rgba(193, 154, 107, 0.32);
  stroke-width: 1;
}

.soul-radar-data {
  fill: rgba(232, 213, 196, 0.3);
  stroke: #c19a6b;
  stroke-width: 2;
}

.soul-radar-point {
  fill: #c19a6b;
}

.soul-radar-point-hit {
  fill: transparent;
  cursor: pointer;
}

.soul-radar-label {
  font-size: 14px;
  fill: #5a4b3e;
  text-anchor: middle;
}

.soul-radar-insight {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--soul-text-main);
  background: rgba(232, 213, 196, 0.35);
  border-radius: 8px;
  padding: 8px 10px;
}

.soul-core-line {
  margin: 8px 0 0;
  color: var(--soul-text-main);
  font-size: 16px;
  line-height: 1.6;
}

.soul-keyword-grid {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.soul-keyword-tag {
  background: var(--soul-card);
  border: 1px solid var(--soul-brown);
  padding: 12px 14px;
  min-width: 170px;
  flex: 1;
}

.soul-keyword-tag.shape-cloud {
  border-radius: 52% 48% 50% 50% / 46% 50% 50% 54%;
}

.soul-keyword-tag.shape-leaf {
  border-radius: 58% 42% 44% 56% / 34% 63% 37% 66%;
  transform: rotate(-1deg);
}

.soul-keyword-tag.shape-drop {
  border-radius: 40% 52% 56% 44% / 66% 42% 58% 34%;
}

.soul-keyword-title {
  margin: 0;
  color: var(--soul-text-main);
  font-size: 15px;
  font-weight: 700;
}

.soul-keyword-desc {
  margin: 6px 0 0;
  color: var(--soul-text-sub);
  font-size: 12px;
  line-height: 1.5;
}

.soul-fit-layout {
  margin-top: 10px;
  display: grid;
  gap: 14px;
}

.soul-fit-line {
  margin: 0;
  color: var(--soul-text-main);
  font-size: 16px;
  line-height: 1.55;
}

.soul-fit-progress-track {
  margin-top: 10px;
  height: 9px;
  border-radius: 999px;
  background: #f0eee9;
  overflow: hidden;
}

.soul-fit-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4b996, #c19a6b);
  transition: width 300ms ease;
}

.soul-fit-progress-text {
  margin: 8px 0 0;
  color: var(--soul-text-sub);
  font-size: 14px;
}

.soul-pie-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.soul-pie-blob {
  width: clamp(160px, 34vw, 200px);
  aspect-ratio: 1 / 1;
  border-radius: 54% 46% 58% 42% / 44% 56% 48% 52%;
  border: 2px dashed rgba(193, 154, 107, 0.65);
  transform: rotate(-6deg);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.65);
  flex: 0 0 auto;
}

.soul-pie-legend {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 7px;
}

.soul-pie-legend-item {
  color: var(--soul-text-main);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.soul-pie-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.soul-advice-list {
  margin-top: 10px;
  display: grid;
  gap: 12px;
}

.soul-advice-card {
  border-radius: 12px;
  border: 1px dashed var(--soul-border);
  background: var(--soul-card);
  padding: 14px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.soul-advice-icon {
  color: var(--soul-gold);
  font-size: 18px;
  line-height: 1.1;
}

.soul-advice-text {
  margin: 0;
  color: var(--soul-text-main);
  font-size: 15px;
  line-height: 1.5;
}

.soul-resonance-line {
  margin: 10px 0 0;
  color: var(--soul-text-sub);
  font-size: 15px;
  line-height: 1.6;
}

.soul-ai-status {
  margin: 10px 0 0;
  color: var(--soul-text-sub);
  font-size: 14px;
  line-height: 1.6;
}

.soul-ai-paragraph {
  margin: 10px 0 0;
  color: var(--soul-text-main);
  font-size: 15px;
  line-height: 1.7;
}

.soul-ai-columns {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.soul-ai-column {
  border: 1px dashed var(--soul-border);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  padding: 10px 12px;
}

.soul-ai-column-title {
  margin: 0;
  color: var(--soul-text-main);
  font-size: 14px;
  font-weight: 700;
}

.soul-ai-list {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--soul-text-main);
  font-size: 14px;
  line-height: 1.6;
}

.soul-ai-list li + li {
  margin-top: 4px;
}

.soul-result-actions {
  border-radius: 14px;
  border: 1px solid rgba(232, 213, 196, 0.86);
  background: rgba(248, 245, 242, 0.95);
  box-shadow: 0 10px 26px rgba(90, 75, 62, 0.08);
  padding: 16px;
  display: grid;
  gap: 10px;
}

.soul-result-actions .soul-btn-primary,
.soul-result-actions .soul-btn-secondary {
  min-height: 46px;
  border-radius: 8px;
  font-size: 16px;
}

.soul-btn-secondary {
  border: 1px solid var(--soul-border);
  background: #fff;
  color: var(--soul-text-main);
}

.soul-btn-secondary:hover {
  background: #f5f0eb;
}

.soul-flow-copy {
  margin: 2px 0 0;
  color: var(--soul-text-sub);
  font-size: 14px;
  line-height: 1.5;
}

.soul-btn-text {
  width: fit-content;
  border-radius: 8px;
  background: transparent;
  color: var(--soul-text-sub);
  font-size: 14px;
  padding: 2px 0;
}

.soul-interaction-feedback {
  margin: 0;
  color: var(--soul-text-sub);
  font-size: 13px;
}

.soul-poster-preview-block {
  border-radius: 14px;
  border: 1px solid rgba(232, 213, 196, 0.86);
  background: rgba(248, 245, 242, 0.95);
  padding: 14px;
}

.soul-poster-preview-title {
  margin: 0 0 10px;
  color: var(--soul-text-main);
  font-size: 15px;
}

.soul-poster-preview-image {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  border: 1px solid var(--soul-border);
  display: block;
  object-fit: cover;
}

.soul-poster-preview-media {
  width: min(100%, 300px);
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
}

.soul-poster-preview-loading {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  border: 1px dashed var(--soul-border);
  background: rgba(255, 255, 255, 0.72);
  display: grid;
  place-items: center;
  color: var(--soul-text-sub);
  font-size: 13px;
}

.soul-card-swap-enter-active,
.soul-card-swap-leave-active {
  /* 关键逻辑：仅过渡 transform/opacity，避免 `all` 引发多余重排。 */
  transition:
    opacity 300ms ease,
    transform 300ms ease;
}

.soul-card-swap-enter-from,
.soul-card-swap-leave-to {
  opacity: 0.8;
  transform: translateY(10px);
}

@keyframes soulSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes soulOptionPulse {
  0% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@media (min-width: 900px) {
  .soul-page {
    padding-top: 34px;
    padding-bottom: 48px;
  }

  .soul-cover {
    min-height: 78vh;
    padding-top: 56px;
    padding-bottom: 56px;
  }

  .soul-cover-start-btn {
    width: 300px;
  }

  .soul-fit-layout {
    grid-template-columns: 1.25fr 0.95fr;
    align-items: center;
  }

  .soul-radar-svg {
    width: 260px;
  }

  .soul-survey {
    max-width: 780px;
    margin: 0 auto;
  }

  .soul-ai-columns {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .soul-paper-texture {
    opacity: 0.2;
  }

  .soul-tree-rings {
    filter: none;
  }

  .soul-cover {
    padding-top: 52px;
    padding-bottom: 52px;
  }

  .soul-cover-title {
    font-size: 28px;
  }

  .soul-question-card {
    padding: 20px;
  }

  .soul-option-item {
    font-size: 15px;
  }

  .soul-option-item.is-pulsing {
    animation: none;
  }

  .soul-radar-svg {
    width: 200px;
  }

  .soul-pie-wrap {
    flex-wrap: wrap;
  }
}
</style>
