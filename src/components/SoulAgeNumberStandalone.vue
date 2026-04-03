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
          <a class="survey-hub-back-link" :href="portalHomeHref">返回主题中心</a>
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
        <p class="survey-cover-intro">
          固定 20 题，A=1、B=2、C=3、D=4。不是模糊人格标签，而是直接落到 8 档具体数字年龄。
        </p>

        <ul class="survey-cover-points">
          <li>完整答完固定 20 题后，才会计算最终灵魂年龄。</li>
          <li>结果会展示年龄阶梯、6 维雷达画像、现实年龄契合度和 AI 深度解读。</li>
          <li>填写实际年龄只影响契合度模块，不会改变灵魂年龄总分结果。</li>
        </ul>

        <div class="soul-age-number-cover-rule-grid" aria-label="答题计分规则">
          <article class="soul-age-number-cover-chip">
            <span class="soul-age-number-cover-chip-key">A</span>
            <span class="soul-age-number-cover-chip-value">1 分</span>
          </article>
          <article class="soul-age-number-cover-chip">
            <span class="soul-age-number-cover-chip-key">B</span>
            <span class="soul-age-number-cover-chip-value">2 分</span>
          </article>
          <article class="soul-age-number-cover-chip">
            <span class="soul-age-number-cover-chip-key">C</span>
            <span class="soul-age-number-cover-chip-value">3 分</span>
          </article>
          <article class="soul-age-number-cover-chip">
            <span class="soul-age-number-cover-chip-key">D</span>
            <span class="soul-age-number-cover-chip-value">4 分</span>
          </article>
        </div>

        <div class="soul-age-number-cover-scale-grid" aria-label="灵魂年龄档位">
          <article
            v-for="scaleItem in SOUL_AGE_YEAR_SCALE"
            :key="`cover-scale-${scaleItem.age}`"
            class="soul-age-number-cover-scale-item"
          >
            <p class="soul-age-number-cover-scale-age">{{ scaleItem.age }}</p>
            <p class="soul-age-number-cover-scale-range">{{ scaleItem.rangeLabel }}</p>
          </article>
        </div>

        <div class="soul-age-number-cover-input-wrap">
          <label for="actual-age-input" class="soul-age-number-cover-input-label">
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
          <p class="survey-cover-hook-line">
            这一版使用和「温柔野生派」相同的通用页面模板，只替换成灵魂年龄的固定总分内容。
          </p>
          <button
            class="survey-btn survey-btn-primary survey-cover-start-btn"
            type="button"
            @click="startSurvey"
          >
            开始测试
          </button>
          <p class="survey-cover-tip">固定 20 题完整作答，大约需要 2-3 分钟。</p>
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
          <span>第 {{ currentQuestionNumber }} 题 / 共 {{ questionCount }} 题</span>
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

        <transition name="soul-card-swap" mode="out-in">
          <div :key="currentQuestion.id" class="survey-question-wrap">
            <p class="soul-age-number-question-kicker">{{ currentQuestion.dimensionLabel }}</p>
            <h2 class="survey-question-title">{{ currentQuestion.title }}</h2>
            <p class="survey-question-desc">{{ currentQuestion.description }}</p>

            <div class="soul-age-number-option-list" role="radiogroup" aria-label="灵魂年龄题目选项">
              <button
                v-for="option in currentQuestion.options"
                :key="option.id"
                class="survey-option soul-age-number-option"
                :class="{
                  'survey-option-selected': currentSelectedOptionId === option.id,
                  'is-pulsing': lastTappedOptionId === option.id,
                }"
                type="button"
                @click="selectOption(option.id)"
              >
                <span class="soul-age-number-option-tier">{{ option.tier }}</span>
                <span class="soul-age-number-option-label">{{ option.label }}</span>
                <span class="soul-age-number-option-score">{{ option.score }} 分</span>
              </button>
            </div>
          </div>
        </transition>

        <div class="survey-actions survey-actions-single">
          <button
            class="survey-btn survey-btn-secondary"
            type="button"
            :disabled="currentQuestionIndex === 0"
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
          <p class="survey-result-prefix">灵魂年龄固定总分结果</p>
          <div class="survey-main-title-row">
            <h2 class="survey-main-title">
              <span class="survey-main-title-primary">{{ analysisResult.soulAge }} 岁</span>
              <span class="survey-main-title-secondary">{{ analysisResult.ageTitle }}</span>
            </h2>
          </div>
          <p class="survey-main-score">
            总分：{{ analysisResult.totalScore }} / 80 · 命中区间：{{ analysisResult.resultRangeText }}
          </p>

          <div class="survey-main-tag-grid">
            <span class="survey-main-tag-item">固定 20 题</span>
            <span class="survey-main-tag-item">A=1 / B=2 / C=3 / D=4</span>
            <span class="survey-main-tag-item">8 档具体年龄</span>
            <span class="survey-main-tag-item">
              契合度 {{ analysisResult.compatibility.fitPercent }}%
            </span>
          </div>

          <div class="survey-highlight-box">
            <h3>一句话画像</h3>
            <p>{{ analysisResult.ageOneLine }}</p>
          </div>

          <p class="survey-insight">{{ analysisResult.summaryLine }}</p>

          <div class="survey-type-card-wrap soul-age-number-scale-wrap">
            <h3>灵魂年龄阶梯</h3>
            <div class="soul-age-number-scale-grid">
              <article
                v-for="scaleItem in resultAgeScaleItems"
                :key="`result-scale-${scaleItem.age}`"
                class="soul-age-number-scale-item"
                :class="{ 'is-active': scaleItem.isActive }"
              >
                <p class="soul-age-number-scale-age">{{ scaleItem.age }}</p>
                <p class="soul-age-number-scale-range">{{ scaleItem.rangeLabel }}</p>
              </article>
            </div>
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
                <p class="soul-age-number-type-card-desc">{{ coordinateItem.description }}</p>
              </article>
            </div>
          </div>

          <div class="survey-distribution-wrap">
            <h3>现实年龄契合度</h3>
            <p class="soul-age-number-fit-line">{{ analysisResult.compatibility.line }}</p>
            <div
              class="soul-age-number-fit-track"
              role="progressbar"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="analysisResult.compatibility.fitPercent"
            >
              <div
                class="soul-age-number-fit-fill"
                :style="{ width: `${analysisResult.compatibility.fitPercent}%` }"
              ></div>
            </div>
            <p class="soul-age-number-fit-percent">
              契合度 {{ analysisResult.compatibility.fitPercent }}%
            </p>

            <div class="soul-age-number-pie-layout">
              <div class="soul-age-number-pie-blob" :style="pieChartStyle"></div>
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
            <h3>灵魂年龄图谱</h3>
            <div class="soul-age-number-radar-layout">
              <div class="survey-radar-canvas">
                <svg :viewBox="radarViewBox" role="img" aria-label="灵魂特质雷达图">
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
                  <polygon :points="radarDataPolygonPoints" class="survey-radar-data" />
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
                    :class="{ 'is-active': activeRadarDimensionKey === axisPoint.key }"
                    type="button"
                    @click="setActiveRadarDimension(axisPoint.key)"
                  >
                    <span class="survey-radar-dot"></span>
                    <span class="survey-radar-name">{{ axisPoint.label }}</span>
                    <span class="survey-radar-score">{{ axisPoint.score }}</span>
                  </button>
                </div>
                <p class="soul-age-number-radar-insight">{{ activeRadarInsightLine }}</p>
              </div>
            </div>
          </div>

          <div class="survey-top-wrap">
            <h3>灵魂成长关键词</h3>
            <ul class="survey-top-list">
              <li
                v-for="(keywordItem, keywordIndex) in analysisResult.keywordCards"
                :key="`keyword-${keywordIndex}`"
                class="survey-top-item"
              >
                <div class="survey-top-item-left">
                  <p class="survey-top-item-title">{{ keywordItem.keyword }}</p>
                  <div class="survey-top-tag-grid">
                    <span class="survey-top-tag-item">{{ keywordItem.description }}</span>
                  </div>
                </div>
                <span class="survey-top-item-score">0{{ keywordIndex + 1 }}</span>
              </li>
            </ul>
          </div>

          <div class="survey-detail-wrap">
            <h3>核心特质解读</h3>
            <ul class="survey-bullet-list">
              <li
                v-for="(descriptionLine, descriptionIndex) in analysisResult.coreDescriptionLines"
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
            <p class="soul-age-number-detail-copy">{{ resonanceLineForView }}</p>
          </div>

          <div class="survey-detail-wrap">
            <h3>AI 深度解读</h3>
            <p v-if="aiInsightStatus === 'loading'" class="soul-age-number-detail-copy">
              AI 正在结合你的完整 20 题作答路径、总分区间和维度波形生成更细的解读...
            </p>
            <template v-else-if="aiInsightStatus === 'success' && aiInsightResult">
              <p class="soul-age-number-detail-copy">{{ aiInsightResult.deepInsight }}</p>
              <ul class="survey-bullet-list soul-age-number-ai-list">
                <li
                  v-for="(growthItem, growthIndex) in aiGrowthActionsForView"
                  :key="`ai-growth-${growthIndex}`"
                >
                  行动建议：{{ growthItem }}
                </li>
                <li
                  v-for="(avoidItem, avoidIndex) in aiAvoidSignalsForView"
                  :key="`ai-avoid-${avoidIndex}`"
                >
                  风险提醒：{{ avoidItem }}
                </li>
              </ul>
            </template>
            <p v-else class="soul-age-number-detail-copy">
              AI 深度解读暂不可用，当前已展示本地稳定解析结果。
            </p>
          </div>

          <div class="survey-poster-wrap">
            <h3>分享长图</h3>
            <p class="survey-poster-desc">
              可生成 9:16 分享卡片，保留当前灵魂年龄结果与核心关键词。
            </p>

            <div
              v-if="posterPreviewUrl"
              class="survey-poster-preview"
              :style="posterContainerStyle"
            >
              <img
                :src="posterPreviewUrl"
                alt="灵魂年龄结果海报"
                loading="lazy"
              />
            </div>
            <div
              v-else
              class="survey-poster-loading"
              :style="posterContainerStyle"
            >
              <span>
                {{ isGeneratingPoster ? "正在生成分享卡片..." : "点击下方按钮生成预览" }}
              </span>
            </div>

            <div class="survey-poster-actions">
              <button
                class="survey-btn survey-btn-primary"
                type="button"
                :disabled="isGeneratingPoster"
                @click="saveResultPoster"
              >
                {{ isGeneratingPoster ? "正在生成..." : "保存结果卡片" }}
              </button>
              <button
                class="survey-btn survey-btn-secondary"
                type="button"
                @click="shareResultToFriend"
              >
                分享给朋友
              </button>
            </div>

            <p v-if="interactionFeedback" class="soul-age-number-poster-feedback">
              {{ interactionFeedback }}
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
import { analyzeSoulAgeWithAI } from "../services/soulAgeNumberAiAnalyzer";
import { shouldShowFeedback, markFeedbackShown } from "../utils/feedbackTrigger";
import Like from "./Like.vue";
import Suggestion from "./Suggestion.vue";

const enableActiveFeedback = import.meta.env.VITE_ENABLE_ACTIVE_FEEDBACK !== "false";

/**
 * 雷达图默认激活维度：
 * 关键逻辑：结果页首次进入时优先展示“应变稳度”，保证首屏解释落在最通用维度。
 */
const DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY = "stress-response";

/**
 * 灵魂年龄档位刻度：
 * 关键逻辑：封面与结果页共用同一份年龄阶梯定义，避免展示文案漂移。
 */
const SOUL_AGE_YEAR_SCALE = Object.freeze([
  { age: 12, rangeLabel: "20-27 分" },
  { age: 16, rangeLabel: "28-35 分" },
  { age: 18, rangeLabel: "36-43 分" },
  { age: 25, rangeLabel: "44-51 分" },
  { age: 30, rangeLabel: "52-59 分" },
  { age: 35, rangeLabel: "60-67 分" },
  { age: 42, rangeLabel: "68-75 分" },
  { age: 50, rangeLabel: "76-80 分" },
]);

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
 * 海报预览容器宽高比。
 * 关键逻辑：始终预留 9:16 空间，避免海报异步生成时导致结果页 CLS。
 */
const posterContainerStyle = computed(() => ({
  aspectRatio: "9 / 16",
}));

/**
 * 进度百分比：
 * 复杂度评估：O(1)。
 */
const progressPercent = computed(() => {
  if (questionCount.value <= 0) {
    return 0;
  }

  const percentValue = (currentQuestionNumber.value / questionCount.value) * 100;
  return Math.round(percentValue);
});

/**
 * 年龄阶梯高亮视图模型。
 * 复杂度评估：O(A)
 * A 为年龄档位数量（当前固定 8）。
 */
const resultAgeScaleItems = computed(() => {
  const currentSoulAge = Number(analysisResult.value?.soulAge ?? 0);
  return SOUL_AGE_YEAR_SCALE.map((scaleItem) => ({
    ...scaleItem,
    isActive: scaleItem.age === currentSoulAge,
  }));
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
      description: "固定 20 题总分制，A=1、B=2、C=3、D=4。",
    },
    {
      label: "AGE RANGE",
      value: analysisResult.value.resultRangeText,
      description: "本次命中的分数区间，对应 8 档具体灵魂年龄中的一个落点。",
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
 * D 为维度数（固定 6）。
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

  return Math.max(12, Math.min(80, Math.round(parsedAgeValue)));
}

/**
 * 开始测试。
 */
function startSurvey() {
  clearAutoAdvanceTimer();
  resetAiInsightState();

  const nextQuestionBank = Array.isArray(questionPool) ? [...questionPool] : [];
  if (nextQuestionBank.length === 0) {
    interactionFeedback.value = "题库加载失败，请刷新页面后重试。";
    return;
  }

  // 关键逻辑：固定载入完整 20 题，确保总分与年龄映射绝对稳定。
  selectedQuestionBank.value = nextQuestionBank;
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: nextQuestionBank.length }, () => null);
  analysisResult.value = null;
  posterPreviewUrl.value = "";
  interactionFeedback.value = "";
  activeRadarDimensionKey.value = DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY;
  stage.value = "survey";
  window.scrollTo({ top: 0, behavior: "smooth" });
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
        totalScore: localResult.totalScore,
        resultRangeText: localResult.resultRangeText,
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
  answers.value[currentQuestionIndex.value] = optionId;
  lastTappedOptionId.value = optionId;

  // 关键逻辑：短时清理脉冲状态，避免动画类常驻。
  window.setTimeout(() => {
    if (lastTappedOptionId.value === optionId) {
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

  activeRadarDimensionKey.value =
    analysisResult.value?.radarItems?.[0]?.key ??
    DEFAULT_SOUL_AGE_RADAR_DIMENSION_KEY;
  stage.value = "result";
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 关键逻辑：结果页先展示本地稳定结果，再异步追加 AI 深度解读。
  void requestAiInsight(localResult);
}

/**
 * 更新雷达图激活维度。
 * @param {string} dimensionKey 维度 key。
 */
function setActiveRadarDimension(dimensionKey) {
  activeRadarDimensionKey.value = String(dimensionKey ?? "").trim();
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

  // 关键逻辑：加入轻纹理噪点，维持纸感海报的层次。
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
  context.font = "700 58px 'Source Han Serif SC', serif";
  context.textAlign = "left";
  context.fillText("你的「灵魂年龄」是几岁？", 120, 200);

  context.fillStyle = "#C19A6B";
  context.font = "700 176px 'Source Han Serif SC', serif";
  context.fillText(String(resultData.soulAge), 120, 408);

  context.fillStyle = "#5A4B3E";
  context.font = "700 46px 'PingFang SC', sans-serif";
  context.fillText(resultData.ageTagText, 120, 486);

  context.fillStyle = "#8B7D6B";
  context.font = "500 30px 'PingFang SC', sans-serif";
  context.fillText(`总分 ${resultData.totalScore}/80 · 命中 ${resultData.resultRangeText}`, 120, 548);
  context.fillText(resultData.summaryLine, 120, 602);

  // 关键逻辑：海报雷达图下移并适度缩小，避免顶部标题区域拥挤。
  const posterRadarCenterX = posterWidth / 2;
  const posterRadarCenterY = 860;
  const posterRadarRadius = 198;
  drawPosterRadar(
    context,
    posterRadarCenterX,
    posterRadarCenterY,
    posterRadarRadius,
    resultData.radarItems,
  );

  context.fillStyle = "#5A4B3E";
  context.font = "700 44px 'Source Han Serif SC', serif";
  context.fillText("核心关键词", 120, 1148);

  context.font = "600 38px 'PingFang SC', sans-serif";
  resultData.keywordCards.forEach((keywordItem, keywordIndex) => {
    const itemY = 1218 + keywordIndex * 70;
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
  context.fillText("固定 20 题总分制 · 8 档具体数字年龄结果", 120, 1740);
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
    anchorElement.download = `soul-age-number-card-${Date.now()}.png`;
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

  const shareTitle = "你的「灵魂年龄」是几岁？";
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
.soul-age-number-page .survey-shell {
  width: min(100%, 620px);
}

.soul-age-number-cover-rule-grid,
.soul-age-number-cover-scale-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.soul-age-number-cover-rule-grid {
  margin-top: 2px;
}

.soul-age-number-cover-chip,
.soul-age-number-cover-scale-item,
.soul-age-number-scale-item {
  border-radius: 12px;
  border: 1px solid rgba(174, 205, 183, 0.56);
  background: linear-gradient(
    140deg,
    rgba(251, 254, 251, 0.98),
    rgba(236, 246, 239, 0.96)
  );
  padding: 12px 10px;
}

.soul-age-number-cover-chip-key {
  display: block;
  color: #527060;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.soul-age-number-cover-chip-value {
  display: block;
  margin-top: 6px;
  color: #2f4e3f;
  font-size: 17px;
  font-weight: 700;
}

.soul-age-number-cover-scale-age,
.soul-age-number-scale-age {
  margin: 0;
  color: #31503f;
  font-size: 24px;
  line-height: 1;
  font-family: var(--survey-font-title);
  font-weight: 700;
}

.soul-age-number-cover-scale-range,
.soul-age-number-scale-range {
  margin: 6px 0 0;
  color: #638071;
  font-size: 12px;
  line-height: 1.5;
}

.soul-age-number-cover-input-wrap {
  display: grid;
  gap: 8px;
}

.soul-age-number-cover-input-label {
  color: #4f6d5b;
  font-size: 12px;
  font-weight: 700;
}

.soul-age-number-cover-input {
  width: 100%;
  min-height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(170, 205, 181, 0.56);
  background: rgba(255, 255, 255, 0.92);
  color: #355446;
  padding: 0 12px;
  font-size: 14px;
}

.soul-age-number-cover-input:focus {
  outline: none;
  border-color: rgba(103, 170, 129, 0.7);
  box-shadow: 0 0 0 3px rgba(103, 170, 129, 0.12);
}

.soul-age-number-progress-track {
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(201, 219, 207, 0.7);
}

.soul-age-number-progress-fill,
.soul-age-number-fit-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6fa77d, #8bc095);
  transition: width 260ms ease;
}

.soul-age-number-question-kicker {
  margin: 0 0 10px;
  color: #4f6d5b;
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
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 12px 14px;
  font: inherit;
  cursor: pointer;
}

.soul-age-number-option-tier {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(103, 170, 129, 0.14);
  color: #355445;
  font-size: 13px;
  font-weight: 700;
}

.soul-age-number-option-label {
  min-width: 0;
  color: #355445;
  font-size: 14px;
  line-height: 1.6;
}

.soul-age-number-option-score {
  color: #547663;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.soul-age-number-option.is-pulsing {
  animation: soulOptionPulse 220ms ease;
}

.soul-age-number-auto-tip,
.soul-age-number-fit-percent,
.soul-age-number-poster-feedback,
.soul-age-number-type-card-desc {
  margin: 8px 0 0;
  color: #638071;
  font-size: 12px;
  line-height: 1.6;
}

.soul-age-number-loading-wrap {
  min-height: 220px;
}

.soul-age-number-spinner {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 3px solid rgba(111, 167, 125, 0.18);
  border-top-color: #5c9167;
  animation: soulSpin 0.9s linear infinite;
}

.soul-age-number-scale-wrap,
.soul-age-number-type-card-wrap {
  position: relative;
  overflow: hidden;
}

.soul-age-number-scale-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.soul-age-number-scale-item {
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.soul-age-number-scale-item.is-active {
  border-color: rgba(92, 145, 103, 0.72);
  box-shadow: 0 12px 20px rgba(92, 145, 103, 0.16);
  transform: translateY(-1px);
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
  color: #355446;
  font-size: 13px;
  line-height: 1.7;
}

.soul-age-number-fit-track,
.soul-age-number-segment-bar {
  overflow: hidden;
  border-radius: 999px;
  background: rgba(211, 228, 216, 0.78);
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
  grid-template-columns: minmax(120px, 152px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.soul-age-number-pie-blob {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 54% 46% 58% 42% / 44% 56% 48% 52%;
  border: 2px dashed rgba(91, 140, 100, 0.5);
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
  fill: #5c9167;
}

.soul-age-number-radar-point-hit {
  fill: transparent;
  cursor: pointer;
}

.soul-age-number-radar-legend-item {
  width: 100%;
  cursor: pointer;
  text-align: left;
  transition: background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.soul-age-number-radar-legend-item .survey-radar-dot {
  background: #5c9167;
}

.soul-age-number-radar-legend-item.is-active {
  border-color: rgba(91, 140, 100, 0.6);
  background: linear-gradient(
    140deg,
    rgba(251, 254, 251, 0.98),
    rgba(229, 241, 233, 0.96)
  );
  box-shadow: 0 10px 16px rgba(91, 140, 100, 0.1);
}

.soul-age-number-ai-list {
  margin-top: 10px;
}

.soul-card-swap-enter-active,
.soul-card-swap-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
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
  .soul-age-number-cover-rule-grid,
  .soul-age-number-cover-scale-grid,
  .soul-age-number-scale-grid,
  .soul-age-number-type-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .soul-age-number-option {
    grid-template-columns: 32px minmax(0, 1fr);
  }

  .soul-age-number-option-score {
    grid-column: 2;
  }

  .soul-age-number-pie-layout {
    grid-template-columns: 1fr;
  }
}
</style>
