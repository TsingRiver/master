<template>
  <div
    class="survey-page soul-age-number-page"
    :class="[
      'theme-gentle-wild',
      themeConfig.theme.className,
      `survey-stage-${stage === 'submitting' ? 'result' : stage}`,
      { 'survey-page-perf-ready': isVisualEffectsReady },
    ]"
  >
    <div class="survey-aura aura-left" aria-hidden="true"></div>
    <div class="survey-aura aura-right" aria-hidden="true"></div>
    <div class="survey-noise" aria-hidden="true"></div>

    <main class="survey-shell" aria-live="polite">
      <header class="survey-header">
        <div v-if="portalMode" class="survey-hub-back-wrap">
          <a class="survey-hub-back-link" :href="portalHomeHref"
            >返回主题中心</a
          >
        </div>
        <p class="survey-badge">{{ themeConfig.theme.badge }}</p>
        <h1>{{ themeConfig.theme.title }}</h1>
        <p class="survey-desc">{{ themeConfig.theme.description }}</p>
      </header>

      <section
        v-if="stage === 'cover'"
        class="survey-card survey-cover-card card-in"
      >
        <p class="survey-cover-kicker">SOUL AGE NUMBER TEST</p>
        <h2 class="survey-cover-title">
          <span class="survey-cover-title-main">你的「灵魂年龄」是几岁？</span>
        </h2>

        <ul class="survey-cover-points">
          <li>
            通过一组日常情境题，观察你在情绪、关系、节奏与人生取向上的自然反应。
          </li>
          <li>
            这是本地测评，适合娱乐和自我观察；填写实际年龄只会影响契合度计算。
          </li>
        </ul>

        <div class="soul-age-number-cover-input-wrap">
          <label
            for="actual-age-input"
            class="soul-age-number-cover-input-label"
          >
            实际年龄（可选，默认按 25 岁估算契合度）
          </label>
          <input
            id="actual-age-input"
            v-model.trim="actualAgeInput"
            class="soul-age-number-cover-input"
            type="number"
            inputmode="numeric"
            min="12"
            max="80"
            placeholder="例如 26"
          />
        </div>

        <div class="survey-cover-actions">
          <button
            class="survey-btn survey-btn-primary survey-cover-start-btn"
            type="button"
            @click="startSurvey"
          >
            开始测试
          </button>
          <p class="survey-cover-tip">
            固定 20 题完整作答，大约需要 2-3 分钟。
          </p>
        </div>

        <div v-if="enableActiveFeedback" class="survey-feedback-entry">
          <a
            class="survey-feedback-link"
            href="javascript:void(0)"
            @click="isSuggestionVisible = true"
          >
            💬 来唠两句
          </a>
        </div>
      </section>

      <section
        v-else-if="stage === 'survey' && currentQuestion"
        class="survey-card survey-question-card card-in"
      >
        <div class="survey-progress-meta">
          <span
            >第 {{ currentQuestionNumber }} 题 / 共 {{ questionCount }} 题</span
          >
          <span>{{ progressPercent }}%</span>
        </div>
        <div
          class="soul-age-number-progress-track"
          role="progressbar"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="progressPercent"
        >
          <div
            class="soul-age-number-progress-fill"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>

        <transition
          name="soul-card-swap"
          mode="out-in"
          @before-enter="handleQuestionBeforeEnter"
        >
          <div :key="currentQuestion.id" class="survey-question-wrap">
            <p class="soul-age-number-question-kicker">
              {{ currentQuestion.dimensionLabel }}
            </p>
            <h2 class="survey-question-title">{{ currentQuestion.title }}</h2>
            <p class="survey-question-desc">
              {{ currentQuestion.description }}
            </p>

            <div
              class="soul-age-number-option-list"
              role="radiogroup"
              aria-label="灵魂年龄题目选项"
            >
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="survey-option soul-age-number-option"
                :class="{
                  'survey-option-selected':
                    currentSelectedOptionId === option.id,
                  'is-pulsing': lastTappedOptionId === option.id,
                  'is-locked': isOptionInteractionLocked,
                }"
                type="button"
                :disabled="isOptionInteractionLocked"
                @click="selectOption(option.id)"
              >
                <span class="soul-age-number-option-label">{{
                  option.label
                }}</span>
              </button>
            </div>
          </div>
        </transition>

        <div class="survey-actions survey-actions-single">
          <button
            class="survey-btn survey-btn-secondary"
            type="button"
            :disabled="currentQuestionIndex === 0 || isOptionInteractionLocked"
            @click="goPrevQuestion"
          >
            上一题
          </button>
        </div>
        <p class="soul-age-number-auto-tip">
          点击选项后会自动进入下一题，最后一题会直接计算结果。
        </p>

        <div v-if="enableActiveFeedback" class="survey-feedback-entry">
          <a
            class="survey-feedback-link"
            href="javascript:void(0)"
            @click="isSuggestionVisible = true"
          >
            💬 来唠两句
          </a>
        </div>
      </section>

      <section
        v-else-if="stage === 'submitting'"
        class="survey-card survey-result-card"
        role="status"
        aria-live="polite"
      >
        <div class="survey-loading-wrap soul-age-number-loading-wrap">
          <div class="soul-age-number-spinner" aria-hidden="true"></div>
          <p>正在整理你的 20 题总分轨迹与灵魂年龄坐标...</p>
        </div>
      </section>

      <section
        v-else-if="stage === 'result' && analysisResult"
        class="survey-card survey-result-card"
      >
        <div class="survey-result-state">
          <div class="soul-age-number-result-hero">
            <p class="soul-age-number-result-title">你的心理年龄测试结果</p>
            <p class="soul-age-number-result-subtitle">
              {{ analysisResult.ageTitle }}
            </p>

            <div class="soul-age-number-age-orb" aria-label="心理年龄结果">
              <p class="soul-age-number-age-orb-value">
                {{ analysisResult.soulAge }}
              </p>
              <p class="soul-age-number-age-orb-label">心理年龄</p>
            </div>

            <p class="soul-age-number-age-diff-line">
              {{ resultAgeDifferenceLine }}
            </p>
            <p
              v-if="resultAgeEstimateNote"
              class="soul-age-number-age-diff-note"
            >
              {{ resultAgeEstimateNote }}
            </p>

            <div
              class="soul-age-number-age-range-wrap"
              role="progressbar"
              :aria-valuemin="RESULT_AGE_TRACK_MIN"
              :aria-valuemax="RESULT_AGE_TRACK_MAX"
              :aria-valuenow="analysisResult.soulAge"
            >
              <div class="soul-age-number-age-range-track">
                <div
                  class="soul-age-number-age-range-fill"
                  :style="{ width: `${resultAgeTrackPercent}%` }"
                ></div>
                <span
                  class="soul-age-number-age-range-thumb"
                  :style="resultAgeTrackThumbStyle"
                  aria-hidden="true"
                ></span>
                <span class="soul-age-number-age-range-bound is-min">10岁</span>
                <span class="soul-age-number-age-range-value">
                  {{ analysisResult.soulAge }}岁
                </span>
                <span class="soul-age-number-age-range-bound is-max">80岁</span>
              </div>
            </div>

            <p class="soul-age-number-result-meta">
              总分 {{ analysisResult.totalScore }} / 80 ·
              {{ analysisResult.resultRangeText }}
            </p>
            <p class="survey-insight">{{ analysisResult.summaryLine }}</p>
          </div>

          <div class="survey-type-card-wrap soul-age-number-type-card-wrap">
            <h3>年龄坐标速览</h3>
            <div class="survey-type-card-grid soul-age-number-type-card-grid">
              <article
                v-for="coordinateItem in resultCoordinateCards"
                :key="coordinateItem.label"
                class="survey-type-card-item soul-age-number-type-card-item"
              >
                <p class="survey-type-card-value">{{ coordinateItem.value }}</p>
                <p class="survey-type-card-label">{{ coordinateItem.label }}</p>
                <p class="soul-age-number-type-card-desc">
                  {{ coordinateItem.description }}
                </p>
              </article>
            </div>
          </div>

          <div class="survey-distribution-wrap">
            <h3>现实年龄契合度</h3>
            <p class="soul-age-number-fit-line">
              {{ analysisResult.compatibility.line }}
            </p>
            <div
              class="soul-age-number-fit-track"
              role="progressbar"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="analysisResult.compatibility.fitPercent"
            >
              <div
                class="soul-age-number-fit-fill"
                :style="{
                  width: `${analysisResult.compatibility.fitPercent}%`,
                }"
              ></div>
            </div>
            <p class="soul-age-number-fit-percent">
              契合度 {{ analysisResult.compatibility.fitPercent }}%
            </p>

            <div class="soul-age-number-pie-layout">
              <div
                class="soul-age-number-pie-blob"
                :style="pieChartStyle"
              ></div>
              <ul class="survey-distribution-list">
                <li
                  v-for="segment in analysisResult.pieDistribution"
                  :key="segment.key"
                  class="survey-distribution-item"
                >
                  <div class="survey-distribution-meta">
                    <span>{{ segment.label }}</span>
                    <span>{{ segment.percent }}%</span>
                  </div>
                  <div class="soul-age-number-segment-bar">
                    <div
                      class="soul-age-number-segment-fill"
                      :style="{
                        width: `${segment.percent}%`,
                        background: segment.color,
                      }"
                    ></div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="survey-radar-wrap">
            <h3>维度分析</h3>
            <div class="soul-age-number-radar-layout">
              <div class="survey-radar-canvas">
                <svg
                  :viewBox="radarViewBox"
                  role="img"
                  aria-label="八维心理特质雷达图"
                >
                  <polygon
                    v-for="(gridPolygonPoints, gridIndex) in radarGridPolygons"
                    :key="`radar-grid-${gridIndex}`"
                    :points="gridPolygonPoints"
                    class="survey-radar-grid"
                  />
                  <line
                    v-for="(axisPoint, axisIndex) in radarAxisPoints"
                    :key="`radar-axis-${axisIndex}`"
                    :x1="radarCenterPoint"
                    :y1="radarCenterPoint"
                    :x2="axisPoint.outerX"
                    :y2="axisPoint.outerY"
                    class="survey-radar-axis"
                  />
                  <polygon
                    :points="radarDataPolygonPoints"
                    class="survey-radar-data"
                  />
                  <g
                    v-for="(axisPoint, pointIndex) in radarAxisPoints"
                    :key="`radar-point-${pointIndex}`"
                  >
                    <circle
                      class="soul-age-number-radar-point"
                      :cx="axisPoint.valueX"
                      :cy="axisPoint.valueY"
                      r="4"
                    />
                    <circle
                      class="soul-age-number-radar-point-hit"
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
                    class="survey-radar-label"
                  >
                    {{ labelPoint.label }}
                  </text>
                </svg>
              </div>

              <div class="soul-age-number-radar-side">
                <div class="survey-radar-legend">
                  <button
                    v-for="axisPoint in radarAxisPoints"
                    :key="`dimension-${axisPoint.key}`"
                    class="survey-radar-legend-item soul-age-number-radar-legend-item"
                    :class="{
                      'is-active': activeRadarDimensionKey === axisPoint.key,
                    }"
                    type="button"
                    @click="setActiveRadarDimension(axisPoint.key)"
                  >
                    <span class="survey-radar-dot"></span>
                    <span class="survey-radar-name">{{ axisPoint.label }}</span>
                    <span class="survey-radar-score">{{
                      axisPoint.score
                    }}</span>
                  </button>
                </div>
                <p class="soul-age-number-radar-insight">
                  {{ activeRadarInsightLine }}
                </p>
              </div>
            </div>
          </div>

          <div class="survey-top-wrap">
            <h3>灵魂成长关键词</h3>
            <ul class="survey-top-list">
              <li
                v-for="(
                  keywordItem, keywordIndex
                ) in analysisResult.keywordCards"
                :key="`keyword-${keywordIndex}`"
                class="survey-top-item"
              >
                <div class="survey-top-item-left">
                  <p class="survey-top-item-title">{{ keywordItem.keyword }}</p>
                  <div class="survey-top-tag-grid">
                    <span class="survey-top-tag-item">{{
                      keywordItem.description
                    }}</span>
                  </div>
                </div>
                <span class="survey-top-item-score"
                  >0{{ keywordIndex + 1 }}</span
                >
              </li>
            </ul>
          </div>

          <div class="survey-detail-wrap">
            <h3>核心特质解读</h3>
            <ul class="survey-bullet-list">
              <li
                v-for="(
                  descriptionLine, descriptionIndex
                ) in analysisResult.coreDescriptionLines"
                :key="`core-line-${descriptionIndex}`"
              >
                {{ descriptionLine }}
              </li>
            </ul>
          </div>

          <div class="survey-detail-wrap">
            <h3>给你的灵魂小建议</h3>
            <ul class="survey-bullet-list">
              <li
                v-for="(adviceItem, adviceIndex) in analysisResult.adviceCards"
                :key="`advice-${adviceIndex}`"
              >
                {{ adviceItem.icon }} {{ adviceItem.text }}
              </li>
            </ul>
          </div>

          <div class="survey-detail-wrap">
            <h3>灵魂同频的人</h3>
            <p class="soul-age-number-detail-copy">
              {{ resonanceLineForView }}
            </p>
          </div>

          <div class="survey-restart-wrap">
            <button
              class="survey-btn survey-btn-secondary survey-restart-btn"
              type="button"
              @click="restartSurvey"
            >
              重新测试
            </button>
          </div>

          <div v-if="enableActiveFeedback" class="survey-feedback-entry">
            <a
              class="survey-feedback-link"
              href="javascript:void(0)"
              @click="isSuggestionVisible = true"
            >
              💬 来唠两句
            </a>
          </div>
        </div>
      </section>
    </main>
  </div>

  <Like
    :visible="isLikeVisible"
    :module-path="feedbackModulePath"
    @close="isLikeVisible = false"
  />

  <Suggestion
    :visible="isSuggestionVisible"
    :module-path="feedbackModulePath"
    @close="isSuggestionVisible = false"
  />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { SOUL_AGE_QUESTION_BANK } from "../data/soulAgeNumberQuestionBank";
import { analyzeSoulAgeLocally } from "../services/soulAgeNumberAnalyzer";
import {
  shouldShowFeedback,
  markFeedbackShown,
} from "../utils/feedbackTrigger";
import Like from "./Like.vue";
import Suggestion from "./Suggestion.vue";

const enableActiveFeedback =
  import.meta.env.VITE_ENABLE_ACTIVE_FEEDBACK !== "false";

/**
 * 雷达图默认激活维度：
 * 关键逻辑：结果页首次进入时优先展示“好奇心”，保证首屏解释落在八维图顶部主轴。
 */
const DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY = "curiosity";

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
 * 评价弹窗状态。
 */
const isLikeVisible = ref(false);
const isSuggestionVisible = ref(false);

/**
 * 当前测试模块的反馈路径。
 */
const feedbackModulePath = computed(() => {
  const routePaths = props.themeConfig?.routePaths;
  return Array.isArray(routePaths) && routePaths.length > 0
    ? routePaths[0]
    : "/soul-age-number";
});

/**
 * 监听 stage 变化，进入结果页时触发评价弹窗。
 */
watch(
  () => stage.value,
  (nextStage) => {
    if (nextStage === "result") {
      const themeKey =
        String(props.themeConfig?.key ?? "").trim() || "soul-age-number";
      if (shouldShowFeedback(themeKey)) {
        markFeedbackShown(themeKey);
        window.setTimeout(() => {
          isLikeVisible.value = true;
        }, 1500);
      }
    }
  },
);

/**
 * 首屏视觉增强开关：
 * 关键逻辑：首帧先输出主体结构，再启用纹理层，降低首屏合成压力。
 */
const isVisualEffectsReady = ref(false);

/**
 * 作答状态。
 */
const questionPool = SOUL_AGE_QUESTION_BANK;
// 关键逻辑：本主题是固定 20 题总分制，必须完整保留题库顺序。
const selectedQuestionBank = ref([]);
const currentQuestionIndex = ref(0);
const answers = ref([]);
const lastTappedOptionId = ref("");
const isOptionInteractionLocked = ref(false);
const actualAgeInput = ref("");
const analysisResult = ref(null);

let autoAdvanceTimer = 0;

/**
 * 雷达图激活维度。
 */
const activeRadarDimensionKey = ref(DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY);

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
 * 进度百分比：
 * 复杂度评估：O(1)。
 */
const progressPercent = computed(() => {
  if (questionCount.value <= 0) {
    return 0;
  }

  const percentValue =
    (currentQuestionNumber.value / questionCount.value) * 100;
  return Math.round(percentValue);
});

/**
 * 结果年龄展示轨道最小值。
 */
const RESULT_AGE_TRACK_MIN = 10;

/**
 * 结果年龄展示轨道最大值。
 */
const RESULT_AGE_TRACK_MAX = 80;

/**
 * 计算结果年龄在展示轨道中的位置百分比。
 * 复杂度评估：O(1)。
 * @param {number} ageValue 待展示的年龄值。
 * @returns {number} 0~100 的轨道百分比。
 */
function resolveResultAgeTrackPercent(ageValue) {
  const parsedAgeValue = Number(ageValue);
  const safeAgeValue = Number.isFinite(parsedAgeValue)
    ? parsedAgeValue
    : RESULT_AGE_TRACK_MIN;
  const clampedAgeValue = Math.max(
    RESULT_AGE_TRACK_MIN,
    Math.min(RESULT_AGE_TRACK_MAX, safeAgeValue),
  );

  return (
    ((clampedAgeValue - RESULT_AGE_TRACK_MIN) /
      (RESULT_AGE_TRACK_MAX - RESULT_AGE_TRACK_MIN)) *
    100
  );
}

/**
 * 结果年龄在 10-80 岁展示轨道中的进度百分比。
 * 复杂度评估：O(1)。
 */
const resultAgeTrackPercent = computed(() => {
  return Number(
    resolveResultAgeTrackPercent(analysisResult.value?.soulAge).toFixed(2),
  );
});

/**
 * 结果年龄轨道指示点样式。
 * 复杂度评估：O(1)。
 */
const resultAgeTrackThumbStyle = computed(() => {
  return {
    left: `${resultAgeTrackPercent.value}%`,
  };
});

/**
 * 顶部结果区的年龄差提示文案。
 * 复杂度评估：O(1)。
 */
const resultAgeDifferenceLine = computed(() => {
  const compatibilityModel = analysisResult.value?.compatibility;
  if (!compatibilityModel) {
    return "";
  }

  const diffValue = Number(compatibilityModel.diff ?? 0);
  if (diffValue > 0) {
    return `您的心理年龄可能比实际年龄大 ${diffValue} 岁`;
  }

  if (diffValue < 0) {
    return `您的心理年龄可能比实际年龄小 ${Math.abs(diffValue)} 岁`;
  }

  return "您的心理年龄可能与实际年龄相近";
});

/**
 * 未填写实际年龄时的估算说明。
 * 复杂度评估：O(1)。
 */
const resultAgeEstimateNote = computed(() => {
  const compatibilityModel = analysisResult.value?.compatibility;
  if (!compatibilityModel || compatibilityModel.isUserProvided) {
    return "";
  }

  return `未填写实际年龄，以上差值按 ${compatibilityModel.actualAge} 岁估算。`;
});

/**
 * 结果坐标卡片。
 * 复杂度评估：O(1)。
 */
const resultCoordinateCards = computed(() => {
  if (!analysisResult.value) {
    return [];
  }

  const compatibilityModel = analysisResult.value.compatibility;
  const actualAgeLabel = compatibilityModel.isUserProvided
    ? `${compatibilityModel.actualAge} 岁`
    : `默认 ${compatibilityModel.actualAge} 岁`;

  return [
    {
      label: "TOTAL SCORE",
      value: `${analysisResult.value.totalScore} / 80`,
      description: "本次答题得到的总分结果。",
    },
    {
      label: "AGE RANGE",
      value: analysisResult.value.resultRangeText,
      description: "该总分对应的灵魂年龄分段。",
    },
    {
      label: "FIT PERCENT",
      value: `${compatibilityModel.fitPercent}%`,
      description: "现实年龄与灵魂年龄的贴合程度。",
    },
    {
      label: "REAL AGE",
      value: actualAgeLabel,
      description: compatibilityModel.isUserProvided
        ? "你填写了实际年龄，系统已按真实年龄计算契合度。"
        : "未填写实际年龄，系统已按默认 25 岁估算。",
    },
  ];
});

/**
 * 雷达图基础几何常量。
 */
const RADAR_VIEWBOX_SIZE = 360;
const RADAR_CENTER = RADAR_VIEWBOX_SIZE / 2;
const RADAR_RADIUS = 112;
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
 * D 为维度数量（当前固定 8，常数级）。
 */
const radarAxisPoints = computed(() => {
  if (radarItems.value.length < 3) {
    return [];
  }

  const axisCount = radarItems.value.length;
  return radarItems.value.map((item, index) => {
    const angleRadians = -Math.PI / 2 + (Math.PI * 2 * index) / axisCount;
    const outerPoint = resolveRadarPoint(angleRadians, 1);
    const labelPoint = resolveRadarPoint(angleRadians, 1.34);
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
 * 复杂度评估：O(D * L)
 * D 为维度数，L 为网格层数（固定 4）。
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
 * 复杂度评估：O(D)
 * D 为维度数（当前固定 8）。
 */
const radarDataPolygonPoints = computed(() =>
  radarAxisPoints.value
    .map((axisPoint) => `${axisPoint.valueX},${axisPoint.valueY}`)
    .join(" "),
);

/**
 * 雷达图标签点位。
 * 复杂度评估：O(D)。
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
    return "点击或聚焦雷达图任一维度，可查看当前维度分值与解读。";
  }

  return `${matchedItem.label} ${matchedItem.score} 分 · ${matchedItem.insight}`;
});

/**
 * 结果页展示的同频文案：
 * 关键逻辑：本地测评模式下直接返回本地分析结果。
 */
const resonanceLineForView = computed(() => {
  return String(analysisResult.value?.resonanceLine ?? "").trim();
});

/**
 * 饼图背景样式。
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

  return Math.max(12, Math.min(80, Math.round(parsedAgeValue)));
}

/**
 * 开始测试。
 */
function startSurvey() {
  clearAutoAdvanceTimer();

  const nextQuestionBank = Array.isArray(questionPool) ? [...questionPool] : [];
  if (nextQuestionBank.length === 0) {
    // 关键逻辑：题库异常时停留在封面，不进入不完整的测评流程。
    return;
  }

  // 关键逻辑：固定载入完整 20 题，确保总分与年龄映射绝对稳定。
  selectedQuestionBank.value = nextQuestionBank;
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: nextQuestionBank.length }, () => null);
  analysisResult.value = null;
  isOptionInteractionLocked.value = false;
  activeRadarDimensionKey.value = DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY;
  stage.value = "survey";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
 * 关键逻辑：双 requestAnimationFrame 确保主体先绘制，再挂装饰层。
 * 复杂度评估：O(1)。
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
  if (isOptionInteractionLocked.value || !currentQuestion.value) {
    return;
  }

  const matchedOption = Array.isArray(currentQuestion.value.options)
    ? currentQuestion.value.options.find(
        (optionItem) => optionItem.id === optionId,
      )
    : null;
  // 关键逻辑：只允许写入当前题真实存在的选项，防止过渡动画期间旧题按钮把下一题答案写成无效 ID。
  if (!matchedOption) {
    return;
  }

  answers.value[currentQuestionIndex.value] = matchedOption.id;
  lastTappedOptionId.value = matchedOption.id;
  // 关键逻辑：一旦选中当前题，先锁住交互直到新题挂载，避免快点连击造成漏计分。
  isOptionInteractionLocked.value = true;

  // 关键逻辑：短时清理脉冲状态，避免动画类常驻。
  window.setTimeout(() => {
    if (lastTappedOptionId.value === matchedOption.id) {
      lastTappedOptionId.value = "";
    }
  }, 220);

  // 关键逻辑：点击选项后自动进入下一题；最后一题直接提交。
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

  isOptionInteractionLocked.value = false;
  currentQuestionIndex.value -= 1;
}

/**
 * 提交并生成结果。
 * 关键逻辑：加载态至少 1.2 秒，避免“闪跳”导致感知不稳定。
 */
async function submitSurveyResult() {
  clearAutoAdvanceTimer();
  stage.value = "submitting";
  isOptionInteractionLocked.value = false;
  await wait(1200);

  const localResult = analyzeSoulAgeLocally({
    questions: selectedQuestionBank.value,
    answerIds: answers.value,
    actualAge: resolveActualAgeInput(),
  });
  analysisResult.value = localResult;

  activeRadarDimensionKey.value =
    analysisResult.value?.radarItems?.[0]?.key ??
    DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY;
  stage.value = "result";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 更新雷达图激活维度。
 * @param {string} dimensionKey 维度 key。
 */
function setActiveRadarDimension(dimensionKey) {
  activeRadarDimensionKey.value = String(dimensionKey ?? "").trim();
}

/**
 * 新题目开始进入时解锁交互。
 * 关键逻辑：使用 before-enter 而不是 after-enter，既能避开旧题退场阶段的误触，又不会额外拖慢答题节奏。
 */
function handleQuestionBeforeEnter() {
  isOptionInteractionLocked.value = false;
}

/**
 * 重新开始测试。
 */
function restartSurvey() {
  clearAutoAdvanceTimer();
  stage.value = "cover";
  selectedQuestionBank.value = [];
  currentQuestionIndex.value = 0;
  answers.value = [];
  analysisResult.value = null;
  isOptionInteractionLocked.value = false;
  activeRadarDimensionKey.value = DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY;
  window.scrollTo({ top: 0, behavior: "smooth" });
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
.soul-age-number-page {
  /* 关键逻辑：主题色从背景图的奶白、暖金、焦糖棕和雾褐阴影中提取，避免沿用旧的绿蓝配色。 */
  --soul-age-number-ink: #5c4739;
  --soul-age-number-ink-strong: #483528;
  --soul-age-number-muted: #8d7866;
  --soul-age-number-line: #e5d4bd;
  --soul-age-number-paper: rgba(255, 249, 241, 0.88);
  --soul-age-number-paper-strong: rgba(255, 252, 246, 0.94);
  --soul-age-number-shadow: rgba(127, 98, 71, 0.16);
  --soul-age-number-accent: #d2ad72;
  --soul-age-number-accent-strong: #b78653;
  --soul-age-number-accent-soft: #efddbf;
  --soul-age-number-radar-line: rgba(180, 151, 115, 0.3);
  --soul-age-number-radar-fill: rgba(210, 173, 114, 0.24);
  --soul-age-number-radar-stroke: rgba(172, 124, 73, 0.88);
  /* 关键逻辑：背景图改由固定伪元素承载，避免结果页随着内容高度增长而把背景拉长。 */
  --page-bg: none;
  /* 关键逻辑：去掉首层整页遮罩，避免背景图再被泛白处理。 */
  --page-overlay-one: none;
  /* 关键逻辑：去掉第二层局部光雾遮罩，确保整页只展示原始背景图。 */
  --page-overlay-two: none;
  --text-main: var(--soul-age-number-ink);
  --text-muted: var(--soul-age-number-muted);
  --surface: var(--soul-age-number-paper);
  --surface-border: rgba(226, 210, 185, 0.88);
  --shadow: 0 24px 54px var(--soul-age-number-shadow);
  --primary: var(--soul-age-number-accent);
  --primary-dark: var(--soul-age-number-accent-strong);
  --aura-left: radial-gradient(circle at 34% 34%, #fff3d6, #e0bb7b);
  --aura-right: radial-gradient(circle at 34% 34%, #f8e5c8, #c69a68);
  --noise-dot: rgba(134, 109, 84, 0.14);
  --option-border: var(--soul-age-number-line);
  --option-selected-border: #c79a64;
  --option-selected-bg: linear-gradient(180deg, #fffdf8, #f8efe0);
  --option-selected-shadow: rgba(183, 134, 83, 0.16);
  --detail-border: #e6d8c6;
  --detail-bg: linear-gradient(
    180deg,
    rgba(255, 252, 246, 0.96),
    rgba(248, 239, 226, 0.98)
  );
  --highlight-border: #e4d2b5;
  --highlight-bg: linear-gradient(145deg, #fffcf6, #f7eddc);
  isolation: isolate;
}

.soul-age-number-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* 关键逻辑：背景图固定到当前视口尺寸，结果页滚动时始终保持 100vw × 100dvh，不跟随内容拉长。 */
  background: url("/soul-age-number.jpg") center top / 100vw 100dvh no-repeat;
}

.soul-age-number-page .survey-badge {
  color: #8d6b45;
}

.soul-age-number-page .survey-cover-card {
  border-color: rgba(230, 214, 191, 0.48);
  background: linear-gradient(
    180deg,
    rgba(255, 253, 248, 0.5) 0%,
    rgba(251, 245, 235, 0.42) 24%,
    rgba(245, 234, 217, 0.5) 60%,
    rgba(255, 251, 245, 0.66) 100%
  );
  box-shadow:
    0 30px 64px rgba(123, 94, 66, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
  backdrop-filter: none;
}

.soul-age-number-page .survey-cover-card::before {
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.14) 0%,
      rgba(253, 249, 242, 0.1) 18%,
      rgba(239, 224, 196, 0.12) 42%,
      rgba(255, 252, 247, 0.38) 100%
    ),
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.08),
      transparent 34%,
      rgba(201, 164, 111, 0.16) 68%,
      transparent 100%
    );
}

.soul-age-number-page .survey-cover-title-main {
  color: var(--soul-age-number-ink-strong);
  text-shadow:
    0 3px 14px rgba(255, 255, 255, 0.74),
    0 1px 0 rgba(255, 255, 255, 0.48);
}

.soul-age-number-page .survey-option {
  background: linear-gradient(180deg, #fffdf9, #f7efe2);
}

.soul-age-number-page .survey-main-title,
.soul-age-number-page .survey-question-title {
  color: var(--soul-age-number-ink);
}

.soul-age-number-page .survey-type-card-value {
  color: var(--soul-age-number-ink-strong);
}

.soul-age-number-page .survey-type-card-label {
  color: var(--soul-age-number-muted);
}

.soul-age-number-page .survey-radar-grid,
.soul-age-number-page .survey-radar-axis {
  stroke: var(--soul-age-number-radar-line);
}

.soul-age-number-page .survey-radar-data {
  fill: var(--soul-age-number-radar-fill);
  stroke: var(--soul-age-number-radar-stroke);
}

.soul-age-number-page .survey-radar-label,
.soul-age-number-page .survey-radar-name,
.soul-age-number-page .survey-radar-score,
.soul-age-number-page .survey-distribution-meta span,
.soul-age-number-page .survey-type-card-wrap h3,
.soul-age-number-page .survey-distribution-wrap h3,
.soul-age-number-page .survey-radar-wrap h3,
.soul-age-number-page .survey-top-wrap h3,
.soul-age-number-page .survey-detail-wrap h3,
.soul-age-number-page .survey-summary-wrap h3 {
  color: #7e6856;
  fill: #7e6856;
}

.soul-age-number-page .survey-shell {
  width: min(100%, 620px);
}

.soul-age-number-cover-input-wrap {
  display: grid;
  gap: 8px;
}

.soul-age-number-cover-input-label {
  color: var(--soul-age-number-muted);
  font-size: 12px;
  font-weight: 700;
}

.soul-age-number-cover-input {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(212, 191, 160, 0.62);
  background: rgba(255, 252, 247, 0.92);
  color: var(--soul-age-number-ink);
  padding: 0 12px;
  font-size: 14px;
}

.soul-age-number-cover-input:focus {
  outline: none;
  border-color: rgba(183, 134, 83, 0.72);
  box-shadow: 0 0 0 3px rgba(210, 173, 114, 0.16);
}

.soul-age-number-progress-track {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(233, 219, 198, 0.78);
}

.soul-age-number-progress-fill,
.soul-age-number-fit-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    var(--soul-age-number-accent),
    var(--soul-age-number-accent-strong)
  );
  transition: width 260ms ease;
}

.soul-age-number-question-kicker {
  margin: 0 0 10px;
  color: var(--soul-age-number-accent-strong);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.soul-age-number-option-list {
  display: grid;
  gap: 10px;
}

.soul-age-number-option {
  width: 100%;
  display: block;
  text-align: left;
  padding: 12px 14px;
  font: inherit;
  cursor: pointer;
}

.soul-age-number-option-label {
  display: block;
  color: var(--soul-age-number-ink);
  font-size: 14px;
  line-height: 1.6;
}

.soul-age-number-option.is-pulsing {
  animation: soulOptionPulse 220ms ease;
}

.soul-age-number-auto-tip,
.soul-age-number-fit-percent,
.soul-age-number-poster-feedback,
.soul-age-number-type-card-desc {
  margin: 8px 0 0;
  color: var(--soul-age-number-muted);
  font-size: 12px;
  line-height: 1.6;
}

.soul-age-number-loading-wrap {
  min-height: 220px;
}

.soul-age-number-result-hero {
  display: grid;
  gap: 14px;
}

.soul-age-number-result-title,
.soul-age-number-result-subtitle,
.soul-age-number-age-orb-value,
.soul-age-number-age-orb-label,
.soul-age-number-age-diff-line,
.soul-age-number-age-diff-note,
.soul-age-number-age-range-bound,
.soul-age-number-age-range-value,
.soul-age-number-result-meta {
  margin: 0;
}

.soul-age-number-result-title {
  color: var(--soul-age-number-ink-strong);
  font-size: clamp(28px, 4.8vw, 36px);
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  letter-spacing: 0.01em;
}

.soul-age-number-result-subtitle {
  justify-self: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(247, 237, 220, 0.94);
  color: var(--soul-age-number-accent-strong);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.soul-age-number-age-orb {
  width: min(100%, 160px);
  aspect-ratio: 1 / 1;
  justify-self: center;
  display: grid;
  place-content: center;
  gap: 8px;
  border-radius: 999px;
  background:
    radial-gradient(
      circle at 30% 25%,
      rgba(255, 255, 255, 0.32),
      transparent 38%
    ),
    linear-gradient(160deg, #e5c996, #d3a56e 52%, #ab7548);
  border: 6px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 18px 34px rgba(151, 110, 72, 0.2);
  text-align: center;
}

.soul-age-number-age-orb-value {
  color: #ffffff;
  font-size: clamp(64px, 12vw, 86px);
  font-weight: 800;
  line-height: 1;
}

.soul-age-number-age-orb-label {
  color: rgba(255, 255, 255, 0.95);
  font-size: clamp(18px, 3.8vw, 28px);
  font-weight: 700;
  line-height: 1.1;
}

.soul-age-number-age-diff-line {
  color: var(--soul-age-number-ink-strong);
  font-size: clamp(22px, 4.1vw, 30px);
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
}

.soul-age-number-age-diff-note,
.soul-age-number-result-meta {
  color: var(--soul-age-number-muted);
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}

.soul-age-number-age-range-wrap {
  margin-top: 4px;
}

.soul-age-number-age-range-track {
  position: relative;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 62px;
  overflow: hidden;
  border-radius: 999px;
  background: linear-gradient(180deg, #fbf4ea, #f1dfc7);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 10px 20px rgba(136, 104, 74, 0.12);
}

.soul-age-number-age-range-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: inherit;
  background: linear-gradient(90deg, #dfba83, #bf8654);
  opacity: 0.9;
}

.soul-age-number-age-range-thumb {
  position: absolute;
  top: 50%;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #b37c4f;
  box-shadow:
    0 10px 18px rgba(155, 111, 66, 0.24),
    0 0 0 4px rgba(255, 255, 255, 0.55);
  transform: translate(-50%, -50%);
}

.soul-age-number-age-range-bound,
.soul-age-number-age-range-value {
  position: relative;
  z-index: 1;
  font-weight: 800;
  line-height: 1;
}

.soul-age-number-age-range-bound {
  position: absolute;
  top: 50%;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 251, 245, 0.84);
  color: #8c725a;
  font-size: 13px;
  transform: translateY(-50%);
  box-shadow: 0 6px 14px rgba(136, 104, 74, 0.1);
}

.soul-age-number-age-range-bound.is-min {
  left: 12px;
}

.soul-age-number-age-range-bound.is-max {
  right: 12px;
}

.soul-age-number-age-range-value {
  color: #ffffff;
  font-size: clamp(18px, 4.4vw, 30px);
  text-shadow: 0 1px 2px rgba(112, 78, 48, 0.22);
}

.soul-age-number-spinner {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 3px solid rgba(210, 173, 114, 0.2);
  border-top-color: var(--soul-age-number-accent-strong);
  animation: soulSpin 0.9s linear infinite;
}

.soul-age-number-type-card-wrap {
  position: relative;
  overflow: hidden;
}

.soul-age-number-type-card-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.soul-age-number-type-card-item {
  min-height: 124px;
}

.soul-age-number-fit-line,
.soul-age-number-radar-insight,
.soul-age-number-detail-copy {
  margin: 0;
  color: var(--soul-age-number-ink);
  font-size: 13px;
  line-height: 1.7;
}

.soul-age-number-fit-track,
.soul-age-number-segment-bar {
  overflow: hidden;
  border-radius: 999px;
  background: rgba(235, 223, 205, 0.84);
}

.soul-age-number-fit-track {
  margin-top: 10px;
  height: 10px;
}

.soul-age-number-segment-bar {
  height: 7px;
}

.soul-age-number-segment-fill {
  height: 100%;
  border-radius: inherit;
}

.soul-age-number-pie-layout {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(92px, 124px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.soul-age-number-pie-blob {
  max-width: 124px;
  width: 100%;
  aspect-ratio: 1 / 1;
  justify-self: center;
  border-radius: 54% 46% 58% 42% / 44% 56% 48% 52%;
  border: 2px dashed rgba(183, 134, 83, 0.42);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.7);
}

.soul-age-number-radar-layout {
  display: grid;
  gap: 14px;
}

.soul-age-number-radar-side {
  display: grid;
  gap: 10px;
}

.soul-age-number-radar-point {
  fill: var(--soul-age-number-accent-strong);
}

.soul-age-number-radar-point-hit {
  fill: transparent;
  cursor: pointer;
}

.soul-age-number-radar-legend-item {
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.soul-age-number-radar-legend-item .survey-radar-dot {
  background: var(--soul-age-number-accent-strong);
}

.soul-age-number-radar-legend-item.is-active {
  border-color: rgba(183, 134, 83, 0.52);
  background: linear-gradient(
    140deg,
    rgba(255, 253, 248, 0.98),
    rgba(247, 236, 217, 0.96)
  );
  box-shadow: 0 10px 16px rgba(136, 104, 74, 0.1);
}

.soul-card-swap-enter-active,
.soul-card-swap-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease;
}

.soul-card-swap-enter-from,
.soul-card-swap-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes soulSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes soulOptionPulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.01);
  }

  100% {
    transform: scale(1);
  }
}

@media (min-width: 900px) {
  .soul-age-number-radar-layout {
    grid-template-columns: 280px minmax(0, 1fr);
    align-items: start;
  }
}

@media (max-width: 768px) {
  .soul-age-number-result-title {
    font-size: 28px;
  }

  .soul-age-number-age-diff-line {
    font-size: 18px;
  }

  .soul-age-number-age-range-track {
    min-height: 36px;
    padding: 0 54px;
  }

  .soul-age-number-age-range-bound {
    padding: 5px 10px;
    font-size: 12px;
  }

  .soul-age-number-age-range-bound.is-min {
    left: 10px;
  }

  .soul-age-number-age-range-bound.is-max {
    right: 10px;
  }

  .soul-age-number-type-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .soul-age-number-pie-layout {
    grid-template-columns: 1fr;
  }
}
</style>
