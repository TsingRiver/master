<template>
  <div class="survey-page" :class="themeConfig.theme.className" :style="runtimeThemeStyle">
    <div class="survey-aura aura-left" aria-hidden="true"></div>
    <div class="survey-aura aura-right" aria-hidden="true"></div>
    <div class="survey-noise" aria-hidden="true"></div>

    <main class="survey-shell" aria-live="polite">
      <transition name="survey-cheer-pop">
        <div
          v-if="isEncouragementVisible"
          class="survey-cheer-overlay"
          aria-hidden="true"
        >
          <p class="survey-cheer-message" role="status" aria-live="polite">
            {{ encouragementMessage }}
          </p>
        </div>
      </transition>

      <transition name="survey-destiny-pop">
        <div
          v-if="isDestinyOverlayVisible"
          class="survey-destiny-overlay"
          :class="`survey-destiny-${destinyOverlayType}`"
          role="status"
          aria-live="polite"
        >
          <p class="survey-destiny-primary">{{ destinyOverlayPrimaryText }}</p>
          <p v-if="destinyOverlaySecondaryText" class="survey-destiny-secondary">
            {{ destinyOverlaySecondaryText }}
          </p>
        </div>
      </transition>

      <header class="survey-header">
        <div v-if="portalMode" class="survey-hub-back-wrap">
          <a class="survey-hub-back-link" :href="portalHomeHref">返回主题中心</a>
        </div>
        <p class="survey-badge">{{ themeConfig.theme.badge }}</p>
        <h1 v-if="shouldShowHeaderMainText">{{ themeConfig.theme.title }}</h1>
        <p v-if="shouldShowHeaderMainText" class="survey-desc">{{ resolvedThemeDescription }}</p>
        <p
          v-if="shouldShowHeaderMainText && themeConfig.theme.participantCountLabel"
          class="survey-participant-count"
        >
          {{ themeConfig.theme.participantCountLabel }}
        </p>
      </header>

      <section
        v-if="stage === 'loading'"
        class="survey-card survey-result-card"
      >
        <div class="survey-loading-wrap">
          <van-loading :color="activeCheckedColor" size="28px" />
          <p v-if="questionPoolLoadError">{{ questionPoolLoadError }}</p>
          <transition v-else name="survey-loading-swap" mode="out-in">
            <p :key="activeLoadingMessage">{{ activeLoadingMessage || "正在加载题库..." }}</p>
          </transition>
          <van-button
            v-if="questionPoolLoadError"
            class="survey-btn survey-btn-primary"
            block
            @click="restart"
          >
            重试加载
          </van-button>
        </div>
      </section>

      <section
        v-else-if="stage === 'cover' && coverConfig"
        class="survey-card survey-cover-card card-in"
      >
        <div
          v-if="isAncientTheme"
          class="survey-cover-symbol-layer"
          aria-hidden="true"
        >
          <span class="survey-cover-symbol symbol-fan"></span>
          <span class="survey-cover-symbol symbol-gourd"></span>
          <span class="survey-cover-symbol symbol-hairpin"></span>
        </div>
        <p v-if="coverConfig.kicker" class="survey-cover-kicker">{{ coverConfig.kicker }}</p>
        <p v-if="coverConfig.promoTag" class="survey-cover-promo-tag">
          {{ coverConfig.promoTag }}
        </p>
        <h2 class="survey-cover-title">
          <span
            v-if="coverConfig.titleEmphasis"
            class="survey-cover-title-emphasis"
          >
            {{ coverConfig.titleEmphasis }}
          </span>
          <span class="survey-cover-title-main">{{ coverConfig.titleMain }}</span>
        </h2>
        <p class="survey-cover-intro">{{ coverConfig.intro }}</p>

        <ul v-if="coverConfig.points.length" class="survey-cover-points">
          <li
            v-for="(pointItem, pointIndex) in coverConfig.points"
            :key="`${pointItem}-${pointIndex}`"
          >
            {{ pointItem }}
          </li>
        </ul>

        <div class="survey-cover-actions">
          <p
            v-if="coverConfig.hookLine"
            class="survey-cover-hook-line"
          >
            {{ coverConfig.hookLine }}
          </p>
          <van-button
            block
            class="survey-btn survey-btn-primary survey-cover-start-btn"
            @click="startSurveyFromCover"
          >
            {{ coverConfig.startButtonText }}
          </van-button>
          <p v-if="coverConfig.tip" class="survey-cover-tip">{{ coverConfig.tip }}</p>
          <p v-if="coverConfig.socialProof" class="survey-cover-social-proof">
            {{ coverConfig.socialProof }}
          </p>
        </div>
      </section>

      <section v-else-if="stage === 'survey' && currentQuestion" class="survey-card card-in">
        <template v-if="isRomanceTheme">
          <div
            class="survey-romance-progress-wrap"
            :class="`is-${romanceProgressPhase}`"
          >
            <p class="survey-romance-progress-hint">{{ romanceProgressHint }}</p>
            <div
              class="survey-romance-wave-track"
              role="progressbar"
              aria-label="浪漫旅程进度"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="progressPercent"
            >
              <div
                class="survey-romance-wave-fill"
                :style="{ width: `${progressPercent}%` }"
              ></div>
              <span
                class="survey-romance-wave-core"
                :style="{ left: romanceProgressNodeLeftPercent }"
                aria-hidden="true"
              ></span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="survey-progress-meta">
            <span>{{ progressLabel }}</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <van-progress
            :percentage="progressPercent"
            :show-pivot="false"
            :stroke-width="8"
            :color="activeProgressColor"
            :track-color="themeConfig.theme.progressTrackColor"
          />
        </template>

        <transition name="survey-fade" mode="out-in">
          <div :key="currentQuestion.id" class="survey-question-wrap">
            <h2 class="survey-question-title">{{ currentQuestion.title }}</h2>
            <p class="survey-question-desc">{{ currentQuestion.description }}</p>

            <van-radio-group
              :model-value="answers[currentQuestionIndex]"
              class="survey-option-group"
              @update:model-value="selectOption"
            >
              <van-cell-group inset class="survey-cell-group">
                <van-cell
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  :title="option.label"
                  class="survey-option"
                  :class="{ 'survey-option-selected': answers[currentQuestionIndex] === option.id }"
                  clickable
                  @click="selectOption(option.id)"
                >
                  <template #right-icon>
                    <van-radio :name="option.id" :checked-color="activeCheckedColor" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </div>
        </transition>

        <div
          class="survey-actions"
          :class="{ 'survey-actions-single': shouldAutoAdvance }"
        >
          <van-button
            block
            class="survey-btn survey-btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrev"
          >
            上一步
          </van-button>
          <van-button
            v-if="!shouldAutoAdvance"
            block
            class="survey-btn survey-btn-primary"
            :disabled="!canGoNext"
            @click="goNext"
          >
            {{ isLastQuestion ? themeConfig.theme.submitButtonText : themeConfig.theme.nextButtonText }}
          </van-button>
        </div>
      </section>

      <section
        v-else-if="stage === 'analyzing' || stage === 'result'"
        class="survey-card survey-result-card"
      >
        <div v-if="stage === 'analyzing'" class="survey-loading-wrap">
          <template v-if="isLoveBrainTheme">
            <div class="survey-brain-loader" aria-hidden="true">
              <div class="survey-brain-shell"></div>
              <div class="survey-brain-core"></div>
              <div class="survey-brain-scanline"></div>
            </div>
            <p class="survey-brain-loading-title">脑部扫描中...</p>
            <transition name="survey-loading-swap" mode="out-in">
              <p :key="activeLoadingMessage" class="survey-brain-loading-text">
                {{ activeLoadingMessage }}
              </p>
            </transition>
          </template>
          <template v-else>
            <van-loading :color="activeCheckedColor" size="28px" />
            <transition name="survey-loading-swap" mode="out-in">
              <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
            </transition>
          </template>
        </div>

        <div v-else-if="unifiedResult" class="survey-result-state">
          <div class="survey-source-wrap">
            <van-tag :color="sourceTagStyle.color" :text-color="sourceTagStyle.textColor" round>
              {{ sourceTagStyle.label }}
            </van-tag>
          </div>

          <p class="survey-result-prefix">{{ unifiedResult.prefixLabel }}</p>
          <h2 class="survey-main-title">{{ unifiedResult.main.name }}</h2>
          <p class="survey-main-score">
            {{ unifiedResult.scoreLabel }}：{{ unifiedResult.main.score }}{{ resolvedMainScoreSuffix }}
          </p>

          <div
            v-if="unifiedResult.heroArtwork?.url"
            class="survey-hero-artwork-wrap"
          >
            <img
              class="survey-hero-artwork-image"
              :src="unifiedResult.heroArtwork.url"
              :alt="unifiedResult.heroArtwork.alt || `${unifiedResult.main.name}视觉图`"
              loading="lazy"
            />
            <p v-if="unifiedResult.heroArtwork.caption" class="survey-hero-artwork-caption">
              {{ unifiedResult.heroArtwork.caption }}
            </p>
          </div>

          <div
            v-if="unifiedResult.highlightCard?.content"
            class="survey-highlight-box"
          >
            <h3>{{ unifiedResult.highlightCard.title }}</h3>
            <p>{{ unifiedResult.highlightCard.content }}</p>
          </div>

          <p class="survey-insight">{{ unifiedResult.insight }}</p>

          <div
            v-if="unifiedResult.tagChips?.length"
            class="survey-tag-wrap"
          >
            <h3>类型标签</h3>
            <div class="survey-tag-grid">
              <span
                v-for="(tagItem, tagIndex) in unifiedResult.tagChips"
                :key="`${tagItem}-${tagIndex}`"
                class="survey-tag-item"
              >
                {{ tagItem }}
              </span>
            </div>
          </div>

          <div
            v-if="unifiedResult.typeCard?.items?.length"
            class="survey-type-card-wrap"
          >
            <h3>{{ unifiedResult.typeCard.title }}</h3>
            <div class="survey-type-card-grid">
              <article
                v-for="(cardItem, cardIndex) in unifiedResult.typeCard.items"
                :key="`${cardItem.label}-${cardIndex}`"
                class="survey-type-card-item"
              >
                <p class="survey-type-card-value">{{ cardItem.value }}</p>
                <p class="survey-type-card-label">{{ cardItem.label }}</p>
              </article>
            </div>
          </div>

          <div
            v-if="unifiedResult.distributionChart?.items?.length"
            class="survey-distribution-wrap"
          >
            <h3>{{ unifiedResult.distributionChart.title }}</h3>
            <ul class="survey-distribution-list">
              <li
                v-for="(item, index) in unifiedResult.distributionChart.items"
                :key="`${item.name}-${index}`"
                class="survey-distribution-item"
              >
                <div class="survey-distribution-meta">
                  <span>{{ item.name }}</span>
                  <span>{{ item.score }}%</span>
                </div>
                <van-progress
                  :percentage="item.score"
                  :show-pivot="false"
                  :stroke-width="7"
                  :color="item.color || activeCheckedColor"
                  :track-color="themeConfig.theme.progressTrackColor"
                />
              </li>
            </ul>
          </div>

          <div
            v-if="radarChartItems.length >= 3"
            class="survey-radar-wrap"
          >
            <h3>{{ unifiedResult.radarChart.title }}</h3>
            <div class="survey-radar-canvas">
              <svg
                :viewBox="radarChartViewBox"
                role="img"
                aria-label="浪漫维度雷达图"
              >
                <polygon
                  v-for="(polygonPoints, levelIndex) in radarGridPolygons"
                  :key="`radar-grid-${levelIndex}`"
                  :points="polygonPoints"
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
                <circle
                  v-for="(axisPoint, pointIndex) in radarAxisPoints"
                  :key="`radar-point-${pointIndex}`"
                  :cx="axisPoint.valueX"
                  :cy="axisPoint.valueY"
                  r="3.6"
                  :style="{ fill: axisPoint.color || activeCheckedColor }"
                />
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
            <ul class="survey-radar-legend">
              <li
                v-for="(item, itemIndex) in radarChartItems"
                :key="`radar-legend-${itemIndex}`"
                class="survey-radar-legend-item"
              >
                <span
                  class="survey-radar-dot"
                  :style="{ background: item.color || activeCheckedColor }"
                ></span>
                <span class="survey-radar-name">{{ item.label || item.name }}</span>
                <span class="survey-radar-score">{{ item.score }}%</span>
              </li>
            </ul>
          </div>

          <div class="survey-top-wrap">
            <h3>{{ unifiedResult.topThreeTitle }}</h3>
            <ul class="survey-top-list">
              <li
                v-for="(item, index) in unifiedResult.topThree"
                :key="item.name"
                class="survey-top-item"
              >
                <span>{{ index + 1 }}. {{ item.name }}</span>
                <span>{{ item.score }}%</span>
              </li>
            </ul>
          </div>

          <div
            v-for="(section, sectionIndex) in unifiedResult.detailSections"
            :key="`${section.title}-${sectionIndex}`"
            class="survey-detail-wrap"
          >
            <h3>{{ section.title }}</h3>
            <ul class="survey-bullet-list">
              <li
                v-for="(item, itemIndex) in section.items"
                :key="`${item}-${itemIndex}`"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <p
            v-if="unifiedResult.easterEggText"
            class="survey-easter-egg"
          >
            {{ unifiedResult.easterEggText }}
          </p>

          <div v-if="shouldShowPosterSection" class="survey-poster-wrap">
            <h3>分享长图</h3>
            <p class="survey-poster-desc">
              已自动生成分享长图，可长按预览图保存，或点击按钮下载。
            </p>

            <div v-if="posterPreviewUrl" class="survey-poster-preview">
              <img :src="posterPreviewUrl" :alt="posterImageAltText" loading="lazy" />
            </div>
            <div v-else class="survey-poster-loading">
              <van-loading :color="activeCheckedColor" size="24px" />
              <span>正在生成分享长图...</span>
            </div>

            <div class="survey-poster-actions">
              <van-button
                block
                class="survey-btn survey-btn-secondary"
                :loading="isGeneratingPoster"
                @click="handleGeneratePoster"
              >
                重新生成长图
              </van-button>
              <van-button
                block
                class="survey-btn survey-btn-primary"
                :disabled="!posterPreviewUrl"
                @click="savePosterImage"
              >
                保存长图
              </van-button>
            </div>
          </div>

          <div
            v-if="resolvedSummaryLines.length"
            class="survey-summary-wrap"
          >
            <h3>{{ unifiedResult.summaryTitle }}</h3>
            <ul class="survey-summary-list">
              <li
                v-for="(line, lineIndex) in visibleSummaryLines"
                :key="`${line}-${lineIndex}`"
                class="survey-summary-item"
              >
                {{ line }}
              </li>
            </ul>
            <button
              v-if="shouldShowSummaryToggle"
              type="button"
              class="survey-summary-toggle-btn"
              @click="toggleSummaryExpandState"
            >
              {{ isSummaryExpanded ? "收起答卷回放" : "展开全部答卷回放" }}
            </button>
          </div>

          <van-button
            block
            class="survey-btn survey-btn-primary survey-restart-btn"
            @click="restart"
          >
            {{ unifiedResult.restartButtonText }}
          </van-button>
        </div>
      </section>
    </main>

    <a
      v-if="portalMode"
      class="survey-floating-home"
      :href="portalHomeHref"
      aria-label="返回主题中心"
    >
      返回主题中心
    </a>

    <!-- <div v-if="shouldShowCommercialCta" class="survey-commercial-fixed">
      <a class="survey-commercial-link" :href="commercialCtaHref">
        {{ commercialCtaText }}
      </a>
    </div> -->
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
 * 组件参数：
 * themeConfig 由配置中心传入，决定页面主题、题库和分析策略。
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
 * loading -> 题库加载阶段
 * cover -> 封面阶段（可选）
 * survey -> 问卷阶段
 * analyzing -> 生成阶段
 * result -> 结果展示阶段
 */
const stage = ref("loading");

/**
 * 问卷状态。
 */
const currentQuestionIndex = ref(0);
const answers = ref([]);
const unifiedResult = ref(null);
const selectedQuestionBank = ref([]);
const loadedQuestionPool = ref([]);
const questionPoolLoadError = ref("");
const coverPointsSnapshot = ref([]);
const themeDescriptionSnapshot = ref("");
const isSummaryExpanded = ref(false);

/**
 * 题库加载会话令牌：
 * 关键逻辑：主题快速切换时，丢弃过期异步加载结果，避免旧题库覆盖新主题。
 */
let questionPoolLoadSessionToken = 0;

/**
 * 加载文案轮播状态。
 */
const loadingMessageIndex = ref(0);
let loadingMessageTimer = null;

/**
 * 自动下一题定时器：
 * 仅在主题配置启用 autoAdvanceOnSelect 时生效。
 */
let autoAdvanceTimer = null;

/**
 * 海报状态。
 */
const posterPreviewUrl = ref("");
const isGeneratingPoster = ref(false);
let posterGenerationToken = 0;

/**
 * 中途激励文案状态：
 * 用于“题目过半”的快速鼓励动效。
 */
const isEncouragementVisible = ref(false);
const encouragementMessage = ref("");
const hasShownMidwayEncouragement = ref(false);
let encouragementTimer = null;

/**
 * 宿命解锁转场状态：
 * 1. 用于 Q13 判定时的“过载/终结”脚本。
 * 2. 通过 overlay + 进度轨道状态类共同驱动动画。
 */
const isDestinyOverlayVisible = ref(false);
const destinyOverlayType = ref("processing");
const destinyOverlayPrimaryText = ref("");
const destinyOverlaySecondaryText = ref("");
const romanceProgressPhase = ref("normal");

/**
 * 宿命守门员状态：
 * 关键逻辑：每轮只判定一次，避免重复触发解锁流程。
 */
const romanceGateState = ref({
  checked: false,
  passed: false,
  scorePercent: 0,
  thresholdPercent: 80,
});

/**
 * 下一步提交互斥锁：
 * 关键逻辑：防止用户连点导致 goNext 并发执行，引发重复判定或重复提交。
 */
const isAdvancingToNext = ref(false);

/**
 * 深度分析交互策略：
 * 1. 14 秒内若拿到深度结果，直接展示深度结果。
 * 2. 超过 14 秒先展示本地结果，深度分析在后台继续。
 * 3. 深度分析设置 45 秒硬超时，避免超长等待。
 */
const LOCAL_RESULT_FALLBACK_DELAY_MS = 14000;
const DEEP_RESULT_HARD_TIMEOUT_MS = 45000;

/**
 * 深度分析会话令牌：
 * 用于防止旧请求在重测/切换主题后覆盖新状态。
 */
let deepAnalysisSessionToken = 0;

/**
 * 2026 主题色页基础色板（中性态）：
 * 关键逻辑：用户未作答前先使用中性色，随着作答进度逐步向目标主题色过渡。
 */
const COLOR_2026_NEUTRAL_TOKENS = {
  bgStart: "#F4F6FF",
  bgMid: "#EEF2FF",
  bgEnd: "#FFF5EF",
  textMain: "#2D3250",
  textMuted: "#676E8E",
  surface: "#FFFFFF",
  surfaceBorder: "#D8DDF5",
  optionBorder: "#D3D9F0",
  optionSelectedBorder: "#9CA8DF",
  optionSelectedBgStart: "#FFFFFF",
  optionSelectedBgEnd: "#EEF2FF",
  highlightBorder: "#D7DCF4",
  highlightBgStart: "#F6F8FF",
  highlightBgEnd: "#FDEFF5",
  accent: "#6C79C6",
  accentSoft: "#A9B4E6",
  auraLeft: "#AEBBFF",
  auraRight: "#F3B7C8",
};

/**
 * 古风主题动态场景色板：
 * 1. 晨景 -> 暮景 -> 夜景，随答题进度推进。
 * 2. 每档同时覆盖背景图、薄雾、主色与边框色，保证风格一致。
 */
const ANCIENT_STAGE_RUNTIME_TOKENS = {
  dawn: {
    pageBg:
      "radial-gradient(circle at 12% 10%, rgba(255, 245, 224, 0.54), transparent 42%), radial-gradient(circle at 86% 82%, rgba(167, 105, 56, 0.2), transparent 48%), linear-gradient(136deg, #e8cfaa 0%, #cfa176 56%, #946245 100%)",
    sceneImage: "url('/ancient/scene-dawn.svg')",
    sceneOpacity: "0.78",
    sceneFilter: "saturate(1.08) brightness(1.02)",
    sceneScale: "1.04",
    scenePositionMobile: "center top",
    scenePositionDesktop: "center 24%",
    sceneVeilTop: "rgba(255, 239, 211, 0.16)",
    sceneVeilBottom: "rgba(93, 61, 42, 0.52)",
    sceneVeilOpacity: "0.92",
    primary: "#875133",
    primaryDark: "#d8a166",
    textMain: "#352314",
    textMuted: "#72543c",
    surface: "rgba(255, 250, 240, 0.9)",
    surfaceBorder: "rgba(190, 138, 89, 0.56)",
    optionBorder: "rgba(171, 120, 77, 0.46)",
    optionBg: "rgba(255, 254, 250, 0.92)",
    optionSelectedBorder: "#ad6b3f",
    optionSelectedShadow: "rgba(134, 80, 40, 0.2)",
    optionSelectedBgStart: "rgba(255, 252, 247, 0.96)",
    optionSelectedBgEnd: "rgba(245, 227, 197, 0.92)",
    detailBorder: "rgba(174, 123, 79, 0.44)",
    detailBgStart: "rgba(255, 253, 249, 0.95)",
    detailBgEnd: "rgba(249, 236, 214, 0.9)",
    highlightBorder: "rgba(168, 113, 68, 0.48)",
    highlightBgStart: "rgba(253, 246, 232, 0.96)",
    highlightBgEnd: "rgba(244, 225, 194, 0.92)",
    cardBgStart: "rgba(255, 253, 247, 0.94)",
    cardBgEnd: "rgba(250, 237, 213, 0.89)",
    cardShadow:
      "0 26px 48px rgba(86, 53, 29, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.74)",
    headerBgStart: "rgba(255, 250, 239, 0.86)",
    headerBgEnd: "rgba(247, 229, 200, 0.54)",
    auraLeft:
      "linear-gradient(160deg, rgba(148, 90, 52, 0.34) 0%, rgba(210, 140, 76, 0.24) 56%, rgba(248, 206, 150, 0.16) 100%)",
    auraRight:
      "linear-gradient(26deg, rgba(70, 42, 30, 0.3) 0%, rgba(160, 102, 60, 0.2) 58%, rgba(234, 178, 114, 0.12) 100%)",
  },
  sunset: {
    pageBg:
      "radial-gradient(circle at 12% 12%, rgba(255, 223, 183, 0.38), transparent 44%), radial-gradient(circle at 88% 84%, rgba(101, 54, 29, 0.22), transparent 48%), linear-gradient(140deg, #c88055 0%, #8e563a 56%, #5f3a2b 100%)",
    sceneImage: "url('/ancient/scene-sunset.svg')",
    sceneOpacity: "0.82",
    sceneFilter: "saturate(1.1) brightness(0.94)",
    sceneScale: "1.04",
    scenePositionMobile: "center top",
    scenePositionDesktop: "center 24%",
    sceneVeilTop: "rgba(255, 194, 148, 0.14)",
    sceneVeilBottom: "rgba(52, 32, 24, 0.56)",
    sceneVeilOpacity: "0.95",
    primary: "#7f4828",
    primaryDark: "#d49a60",
    textMain: "#2f1d14",
    textMuted: "#6a4731",
    surface: "rgba(254, 244, 232, 0.9)",
    surfaceBorder: "rgba(167, 106, 68, 0.58)",
    optionBorder: "rgba(152, 97, 61, 0.48)",
    optionBg: "rgba(255, 250, 243, 0.9)",
    optionSelectedBorder: "#a45d2f",
    optionSelectedShadow: "rgba(111, 64, 39, 0.24)",
    optionSelectedBgStart: "rgba(255, 245, 232, 0.94)",
    optionSelectedBgEnd: "rgba(237, 204, 164, 0.9)",
    detailBorder: "rgba(154, 98, 64, 0.45)",
    detailBgStart: "rgba(255, 248, 238, 0.93)",
    detailBgEnd: "rgba(235, 200, 161, 0.86)",
    highlightBorder: "rgba(150, 92, 57, 0.52)",
    highlightBgStart: "rgba(255, 240, 223, 0.95)",
    highlightBgEnd: "rgba(230, 186, 146, 0.9)",
    cardBgStart: "rgba(255, 248, 238, 0.92)",
    cardBgEnd: "rgba(236, 201, 161, 0.88)",
    cardShadow:
      "0 24px 46px rgba(74, 41, 28, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.64)",
    headerBgStart: "rgba(255, 241, 221, 0.8)",
    headerBgEnd: "rgba(228, 184, 142, 0.52)",
    auraLeft:
      "linear-gradient(160deg, rgba(123, 69, 40, 0.4) 0%, rgba(194, 108, 56, 0.3) 56%, rgba(245, 172, 102, 0.18) 100%)",
    auraRight:
      "linear-gradient(24deg, rgba(58, 28, 21, 0.4) 0%, rgba(126, 66, 43, 0.28) 58%, rgba(208, 135, 86, 0.14) 100%)",
  },
  night: {
    pageBg:
      "radial-gradient(circle at 12% 10%, rgba(199, 188, 234, 0.24), transparent 44%), radial-gradient(circle at 86% 84%, rgba(52, 38, 57, 0.32), transparent 48%), linear-gradient(138deg, #252334 0%, #332c3a 52%, #3d2f35 100%)",
    sceneImage: "url('/ancient/scene-night.svg')",
    sceneOpacity: "0.86",
    sceneFilter: "saturate(0.96) brightness(0.88)",
    sceneScale: "1.05",
    scenePositionMobile: "center top",
    scenePositionDesktop: "center 25%",
    sceneVeilTop: "rgba(31, 27, 43, 0.08)",
    sceneVeilBottom: "rgba(20, 14, 25, 0.58)",
    sceneVeilOpacity: "1",
    primary: "#9f6b43",
    primaryDark: "#dfac72",
    textMain: "#2a2225",
    textMuted: "#6f5642",
    surface: "rgba(234, 230, 241, 0.9)",
    surfaceBorder: "rgba(156, 121, 93, 0.6)",
    optionBorder: "rgba(143, 106, 80, 0.5)",
    optionBg: "rgba(244, 241, 249, 0.88)",
    optionSelectedBorder: "#9f6b43",
    optionSelectedShadow: "rgba(70, 55, 78, 0.24)",
    optionSelectedBgStart: "rgba(246, 241, 250, 0.92)",
    optionSelectedBgEnd: "rgba(219, 206, 220, 0.88)",
    detailBorder: "rgba(150, 111, 84, 0.48)",
    detailBgStart: "rgba(246, 242, 250, 0.9)",
    detailBgEnd: "rgba(214, 199, 215, 0.86)",
    highlightBorder: "rgba(155, 116, 87, 0.54)",
    highlightBgStart: "rgba(240, 235, 247, 0.94)",
    highlightBgEnd: "rgba(207, 190, 209, 0.88)",
    cardBgStart: "rgba(243, 239, 249, 0.92)",
    cardBgEnd: "rgba(207, 193, 211, 0.88)",
    cardShadow:
      "0 24px 46px rgba(35, 28, 40, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
    headerBgStart: "rgba(238, 232, 247, 0.82)",
    headerBgEnd: "rgba(198, 183, 204, 0.52)",
    auraLeft:
      "linear-gradient(160deg, rgba(70, 58, 96, 0.36) 0%, rgba(116, 84, 118, 0.24) 56%, rgba(190, 144, 104, 0.16) 100%)",
    auraRight:
      "linear-gradient(24deg, rgba(28, 21, 34, 0.4) 0%, rgba(88, 63, 82, 0.28) 58%, rgba(176, 131, 94, 0.16) 100%)",
  },
};

/**
 * 将 16 进制颜色转为 RGB 对象。
 * @param {string} hexColor 16 进制颜色（#RRGGBB 或 #RGB）。
 * @returns {{ r: number, g: number, b: number } | null} RGB 对象。
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
 * 将 RGB 对象转为 16 进制颜色。
 * @param {{ r: number, g: number, b: number }} rgbColor RGB 对象。
 * @returns {string} 16 进制颜色字符串。
 */
function rgbToHex(rgbColor) {
  const toHex = (value) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(rgbColor.r)}${toHex(rgbColor.g)}${toHex(rgbColor.b)}`;
}

/**
 * 混合两种 16 进制颜色。
 * @param {string} fromColor 起始颜色。
 * @param {string} toColor 目标颜色。
 * @param {number} ratio 混合比例（0~1）。
 * @returns {string} 混合后的 16 进制颜色。
 */
function blendHexColor(fromColor, toColor, ratio) {
  const fromRgb = hexToRgb(fromColor);
  const toRgb = hexToRgb(toColor);
  const safeRatio = Math.max(0, Math.min(1, Number(ratio) || 0));

  if (!fromRgb && !toRgb) {
    return "#FFFFFF";
  }

  if (!fromRgb) {
    return rgbToHex(toRgb);
  }

  if (!toRgb) {
    return rgbToHex(fromRgb);
  }

  return rgbToHex({
    r: fromRgb.r + (toRgb.r - fromRgb.r) * safeRatio,
    g: fromRgb.g + (toRgb.g - fromRgb.g) * safeRatio,
    b: fromRgb.b + (toRgb.b - fromRgb.b) * safeRatio,
  });
}

/**
 * 生成 RGBA 颜色字符串。
 * @param {string} hexColor 16 进制颜色。
 * @param {number} alpha 透明度（0~1）。
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
 * 题库源与抽题规则：
 * 1. questionPool 为当前主题已加载的完整题库。
 * 2. questionSelection 控制每次抽题范围（默认 10~15）。
 * 3. 可选维度覆盖策略用于保证多维题库每轮都有代表题。
 */
const questionPool = computed(() => loadedQuestionPool.value);
const questionSelection = computed(() => {
  const selectionConfig = props.themeConfig.survey.questionSelection ?? {};
  return {
    minCount: selectionConfig.minCount ?? 10,
    maxCount: selectionConfig.maxCount ?? 15,
    ensureDimensionCoverage: Boolean(selectionConfig.ensureDimensionCoverage),
    dimensionKey: selectionConfig.dimensionKey ?? "",
    useSequentialQuestionOrder: Boolean(
      props.themeConfig.survey.useSequentialQuestionOrder,
    ),
  };
});

/**
 * 解析封面语录配置：
 * 1. 兼容静态数组与函数工厂两种配置形态。
 * 2. 统一做字符串清洗，避免空白项进入 UI。
 * @param {Array<string> | (() => Array<string>) | unknown} rawPoints 原始语录配置。
 * @returns {Array<string>} 清洗后的语录数组。
 */
function resolveCoverPoints(rawPoints) {
  let resolvedPoints = rawPoints;
  if (typeof rawPoints === "function") {
    try {
      resolvedPoints = rawPoints();
    } catch {
      // 关键逻辑：语录工厂异常时直接回退空列表，避免阻断答题主流程。
      return [];
    }
  }

  if (!Array.isArray(resolvedPoints)) {
    return [];
  }

  return resolvedPoints
    .map((pointItem) => String(pointItem ?? "").trim())
    .filter(Boolean);
}

/**
 * 解析主题描述文案：
 * 1. 兼容静态字符串和函数工厂两种配置形态。
 * 2. 统一做字符串清洗，避免 UI 出现空值或异常字符。
 * @param {string | (() => string) | unknown} rawDescription 原始文案配置。
 * @returns {string} 清洗后的主题描述。
 */
function resolveThemeDescription(rawDescription) {
  let resolvedDescription = rawDescription;
  if (typeof rawDescription === "function") {
    try {
      resolvedDescription = rawDescription();
    } catch {
      // 关键逻辑：描述工厂异常时回退空串，避免阻断主流程渲染。
      return "";
    }
  }

  return String(resolvedDescription ?? "").trim();
}

/**
 * 生成主题描述快照。
 * 关键逻辑：每轮重置仅采样一次，避免渲染期间重复随机导致文案闪动。
 */
function rebuildThemeDescriptionSnapshot() {
  themeDescriptionSnapshot.value = resolveThemeDescription(
    props.themeConfig.theme?.description,
  );
}

/**
 * 生成封面语录快照。
 * 关键逻辑：每轮重置仅采样一次，避免渲染期重复计算导致文案闪动。
 */
function rebuildCoverPointsSnapshot() {
  coverPointsSnapshot.value = resolveCoverPoints(
    props.themeConfig.survey.cover?.points,
  );
}

/**
 * 解析封面标题主副结构。
 * 1. 优先使用配置中的 `titleEmphasis` + `titleMain`。
 * 2. 若未显式配置，则尝试从 title 的分隔符中拆分（如：`入梦千年：测测你在古代到底是谁？`）。
 * 复杂度评估：O(L)，L 为标题字符串长度，属于常量级开销。
 * @param {object} rawCoverConfig 封面原始配置。
 * @param {string} fallbackTitle 兜底标题。
 * @returns {{ titleEmphasis: string, titleMain: string }} 标题拆分结果。
 */
function resolveCoverTitleParts(rawCoverConfig, fallbackTitle) {
  const explicitEmphasis = String(rawCoverConfig?.titleEmphasis ?? "").trim();
  const explicitMain = String(rawCoverConfig?.titleMain ?? "").trim();
  if (explicitEmphasis || explicitMain) {
    return {
      titleEmphasis: explicitEmphasis,
      titleMain: explicitMain || fallbackTitle || "测试简介",
    };
  }

  const rawTitle = String(rawCoverConfig?.title ?? "").trim() || fallbackTitle;
  if (!rawTitle) {
    return {
      titleEmphasis: "",
      titleMain: "测试简介",
    };
  }

  const splitMatch = rawTitle.match(/^(.{2,12}?)[：:·|｜](.+)$/u);
  if (!splitMatch) {
    return {
      titleEmphasis: "",
      titleMain: rawTitle,
    };
  }

  return {
    titleEmphasis: String(splitMatch[1] ?? "").trim(),
    titleMain: String(splitMatch[2] ?? "").trim() || rawTitle,
  };
}

/**
 * 封面配置：
 * 1. 仅当 survey.cover.enabled=true 时启用。
 * 2. intro 为空时视为无效配置并自动关闭封面。
 */
const coverConfig = computed(() => {
  const rawCoverConfig = props.themeConfig.survey.cover;
  if (!rawCoverConfig?.enabled) {
    return null;
  }

  const introText = String(rawCoverConfig.intro ?? "").trim();
  if (!introText) {
    return null;
  }

  const fallbackTitle = String(props.themeConfig.theme.title ?? "").trim();
  const resolvedTitleParts = resolveCoverTitleParts(
    rawCoverConfig,
    fallbackTitle,
  );
  return {
    kicker: String(rawCoverConfig.kicker ?? "").trim(),
    promoTag: String(rawCoverConfig.promoTag ?? "").trim(),
    titleEmphasis: resolvedTitleParts.titleEmphasis,
    titleMain: resolvedTitleParts.titleMain,
    intro: introText,
    points: coverPointsSnapshot.value,
    hookLine: String(rawCoverConfig.hookLine ?? "").trim(),
    startButtonText:
      String(rawCoverConfig.startButtonText ?? "").trim() || "开始测试",
    tip: String(rawCoverConfig.tip ?? "").trim(),
    socialProof: String(rawCoverConfig.socialProof ?? "").trim(),
  };
});

/**
 * 是否启用封面阶段。
 */
const shouldUseCoverStage = computed(() => Boolean(coverConfig.value));

/**
 * 是否展示头部主标题与描述。
 * 关键逻辑：封面阶段仅保留封面卡片标题，避免与头部标题重复。
 */
const shouldShowHeaderMainText = computed(
  () => !(stage.value === "cover" && shouldUseCoverStage.value),
);

/**
 * 头部主题描述：
 * 关键逻辑：优先使用快照值，确保函数型文案只在重置时随机一次。
 */
const resolvedThemeDescription = computed(
  () =>
    themeDescriptionSnapshot.value ||
    resolveThemeDescription(props.themeConfig.theme?.description),
);

/**
 * 本次测试题库：
 * 关键逻辑：每次开测只使用随机抽出的题目列表，保证每轮题目不同且无重复。
 */
const questionBank = computed(() =>
  selectedQuestionBank.value.length > 0
    ? selectedQuestionBank.value
    : questionPool.value,
);

/**
 * 页面派生状态。
 */
const questionCount = computed(() => questionBank.value.length);
const currentQuestion = computed(
  () => questionBank.value[currentQuestionIndex.value],
);
const isLastQuestion = computed(
  () =>
    questionBank.value.length > 0 &&
    currentQuestionIndex.value === questionBank.value.length - 1,
);
const canGoNext = computed(
  () => answers.value[currentQuestionIndex.value] !== null,
);
const progressPercent = computed(() => {
  if (questionBank.value.length === 0) {
    return 0;
  }

  const doneCount = currentQuestionIndex.value + 1;
  return Math.round((doneCount / questionBank.value.length) * 100);
});
const progressLabel = computed(
  () => `问题 ${currentQuestionIndex.value + 1} / ${questionCount.value}`,
);
const activeLoadingMessage = computed(() => {
  const messages = props.themeConfig.theme.loadingMessages;
  return messages[loadingMessageIndex.value] ?? "";
});
const sourceTagStyle = computed(() => {
  const sourceType = unifiedResult.value?.source === "local" ? "local" : "deep";
  return props.themeConfig.theme.sourceTag[sourceType];
});

/**
 * 主结果分值后缀。
 * 关键逻辑：兼容“百分制”与“140 满分制”等多种评分模型。
 */
const resolvedMainScoreSuffix = computed(
  () => unifiedResult.value?.scoreSuffix ?? "%",
);

/**
 * 答卷回放默认预览条数。
 * 关键逻辑：移动端优先展示前 3 条，降低长列表首屏压迫感。
 */
const SUMMARY_PREVIEW_LIMIT = 3;

/**
 * 答卷回放原始行列表。
 * 关键逻辑：统一做数组兜底，避免结果结构异常导致渲染报错。
 */
const resolvedSummaryLines = computed(() => {
  const summaryLines = unifiedResult.value?.summaryLines;
  return Array.isArray(summaryLines) ? summaryLines : [];
});

/**
 * 当前可见的答卷回放内容。
 * 复杂度评估：O(L)
 * L 为答卷回放行数；默认分支仅切片 3 条，空间复杂度 O(1)。
 */
const visibleSummaryLines = computed(() => {
  if (isSummaryExpanded.value) {
    return resolvedSummaryLines.value;
  }

  return resolvedSummaryLines.value.slice(0, SUMMARY_PREVIEW_LIMIT);
});

/**
 * 是否显示答卷回放展开按钮。
 */
const shouldShowSummaryToggle = computed(
  () => resolvedSummaryLines.value.length > SUMMARY_PREVIEW_LIMIT,
);

/**
 * 是否为浪漫主题。
 */
const isRomanceTheme = computed(() => props.themeConfig.key === "romance");

/**
 * 是否为恋爱脑主题。
 */
const isLoveBrainTheme = computed(
  () => props.themeConfig.key === "love-brain",
);

/**
 * 海报图片替代文本。
 */
const posterImageAltText = computed(() =>
  isLoveBrainTheme.value ? "恋爱脑指数长图预览" : "浪漫指数海报预览图",
);

/**
 * 商业引导位是否展示。
 * 关键逻辑：仅结果阶段展示，避免答题阶段遮挡操作。
 */
const shouldShowCommercialCta = computed(() => {
  const ctaConfig = unifiedResult.value?.commercialCta;
  return (
    stage.value === "result" &&
    Boolean(ctaConfig?.enabled) &&
    Boolean(String(ctaConfig?.text ?? "").trim())
  );
});

/**
 * 商业引导文案。
 */
const commercialCtaText = computed(
  () =>
    String(unifiedResult.value?.commercialCta?.text ?? "").trim(),
);

/**
 * 商业引导跳转链接。
 */
const commercialCtaHref = computed(
  () => String(unifiedResult.value?.commercialCta?.href ?? "/mbti").trim() || "/mbti",
);

/**
 * 分析阶段最短展示时长。
 * 关键逻辑：用于满足“仪式化加载”体验，不影响其他主题默认行为。
 */
const minimumAnalyzingDurationMs = computed(() => {
  const configuredDuration = Number(props.themeConfig.survey.minimumAnalyzingDurationMs);
  if (!Number.isFinite(configuredDuration)) {
    return 0;
  }

  return Math.max(0, Math.floor(configuredDuration));
});

/**
 * 是否启用“选择即下一题”交互。
 */
const shouldAutoAdvance = computed(() =>
  Boolean(props.themeConfig.survey.autoAdvanceOnSelect),
);

/**
 * 浪漫主题进度提示文案：
 * 关键逻辑：不暴露具体题号，保持“神秘感”。
 */
const romanceProgressHint = computed(() => {
  if (!isRomanceTheme.value) {
    return "";
  }

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
 * 浪漫进度节点位置：
 * 关键逻辑：限制在 [6%, 97%]，防止首尾被容器裁切。
 */
const romanceProgressNodeLeftPercent = computed(() => {
  const clampedPercent = Math.max(6, Math.min(97, progressPercent.value));
  return `${clampedPercent}%`;
});

/**
 * 雷达图常量：
 * 关键逻辑：固定画布尺寸可降低布局抖动，保证移动端渲染稳定。
 */
const RADAR_VIEWBOX_SIZE = 260;
const RADAR_CENTER_POINT = RADAR_VIEWBOX_SIZE / 2;
const RADAR_RADIUS = 90;
const RADAR_GRID_LEVELS = [0.25, 0.5, 0.75, 1];

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
 * 海报生成开关：
 * 关键逻辑：仅当结果里包含 posterModel 时展示海报模块。
 */
const shouldShowPosterSection = computed(
  () => stage.value === "result" && Boolean(unifiedResult.value?.posterModel),
);

/**
 * 中途激励配置：
 * 1. triggerQuestionNumber 按人类题号（从 1 开始）配置。
 * 2. durationMs 控制激励文案停留时长。
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
 * 关键逻辑：仅在 romance 主题且显式启用时生效。
 */
const destinyGatekeeperConfig = computed(() => {
  if (!isRomanceTheme.value) {
    return null;
  }

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
      ? rawConfig.processingLines.map((lineItem) => String(lineItem ?? "").trim()).filter(Boolean)
      : [],
    unlockLine: String(rawConfig.unlockLine ?? "").trim(),
    lockLines: Array.isArray(rawConfig.lockLines)
      ? rawConfig.lockLines.map((lineItem) => String(lineItem ?? "").trim()).filter(Boolean)
      : [],
  };
});

/**
 * 是否是“2026 主题色”主题。
 */
const isColorTheme2026 = computed(
  () => props.themeConfig.key === "color-2026",
);

/**
 * 是否为古代身份主题。
 */
const isAncientTheme = computed(() => props.themeConfig.key === "ancient");

/**
 * 当前主题可用的运行时色板映射。
 */
const runtimePaletteMap = computed(
  () => props.themeConfig.theme.runtimePalette ?? {},
);

/**
 * 默认运行时颜色键。
 */
const runtimeDefaultColorKey = computed(
  () => props.themeConfig.theme.runtimeDefaultKey ?? "blue",
);

/**
 * 计算已作答题数。
 */
const answeredCount = computed(
  () => answers.value.filter((answerItem) => Boolean(answerItem)).length,
);

/**
 * 计算当前答卷颜色分值映射。
 * 复杂度评估：O(Q * K)，Q 为当前题量，K 为选项向量键数量（通常较小）。
 * @returns {{ [key: string]: number }} 颜色分值映射。
 */
function buildRuntimeColorScoreMap() {
  const paletteKeys = Object.keys(runtimePaletteMap.value);
  const scoreMap = paletteKeys.reduce((accumulator, colorKey) => {
    accumulator[colorKey] = 0;
    return accumulator;
  }, {});

  questionBank.value.forEach((questionItem, questionIndex) => {
    const selectedAnswerId = answers.value[questionIndex];
    if (!selectedAnswerId) {
      return;
    }

    const selectedOption = questionItem.options.find(
      (optionItem) => optionItem.id === selectedAnswerId,
    );
    if (!selectedOption) {
      return;
    }

    const questionWeight = Number(questionItem.weight ?? 1);
    Object.entries(selectedOption.vector ?? {}).forEach(([vectorKey, rawValue]) => {
      if (typeof scoreMap[vectorKey] !== "number") {
        return;
      }

      const safeValue = Number(rawValue ?? 0);
      if (!Number.isFinite(safeValue)) {
        return;
      }

      scoreMap[vectorKey] += safeValue * questionWeight;
    });
  });

  return scoreMap;
}

/**
 * 从分值映射中解析主导颜色键。
 * @param {{ [key: string]: number }} scoreMap 颜色分值映射。
 * @returns {string} 主导颜色键。
 */
function resolveDominantColorKey(scoreMap) {
  const scoreEntries = Object.entries(scoreMap ?? {});
  if (scoreEntries.length === 0) {
    return runtimeDefaultColorKey.value;
  }

  const sortedEntries = scoreEntries.sort((leftItem, rightItem) => {
    const scoreDiff = Number(rightItem[1] ?? 0) - Number(leftItem[1] ?? 0);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return String(leftItem[0]).localeCompare(String(rightItem[0]), "zh-Hans-CN");
  });

  return sortedEntries[0][0] ?? runtimeDefaultColorKey.value;
}

/**
 * 运行时主导颜色键：
 * 1. 结果页优先使用最终结果的 runtimeColorKey。
 * 2. 作答阶段根据当前已选答案实时计算。
 * 3. 都不可用时回退默认键。
 */
const runtimeDominantColorKey = computed(() => {
  if (!isColorTheme2026.value) {
    return runtimeDefaultColorKey.value;
  }

  if (stage.value === "result" && unifiedResult.value?.runtimeColorKey) {
    return unifiedResult.value.runtimeColorKey;
  }

  return resolveDominantColorKey(buildRuntimeColorScoreMap());
});

/**
 * 计算主题色混合进度：
 * 1. 作答阶段随进度逐步提升，形成“颜色渐变靠近”的体验。
 * 2. 结果页固定为 1，展示最终主题色状态。
 */
const runtimeBlendRatio = computed(() => {
  if (!isColorTheme2026.value) {
    return 0;
  }

  if (stage.value === "result") {
    return 1;
  }

  if (questionBank.value.length === 0) {
    return 0;
  }

  const progressRatio = answeredCount.value / questionBank.value.length;
  return Math.max(0, Math.min(0.82, progressRatio * 0.82));
});

/**
 * 计算古风主题进度比率。
 * 关键逻辑：封面阶段固定为 0，分析/结果阶段固定为 1，答题阶段按已作答比例推进。
 * @returns {number} 0~1 的进度比率。
 */
const ancientThemeProgressRatio = computed(() => {
  if (!isAncientTheme.value) {
    return 0;
  }

  if (stage.value === "analyzing" || stage.value === "result") {
    return 1;
  }

  if (stage.value !== "survey" || questionBank.value.length === 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, answeredCount.value / questionBank.value.length));
});

/**
 * 根据进度映射古风场景档位。
 * 复杂度评估：O(1)
 * 仅常数级阈值判断，不随题量增长。
 * @param {number} progressRatio 进度比率（0~1）。
 * @returns {object} 场景样式令牌。
 */
function resolveAncientRuntimeToken(progressRatio) {
  const safeRatio = Math.max(0, Math.min(1, Number(progressRatio) || 0));
  if (safeRatio < 0.34) {
    return ANCIENT_STAGE_RUNTIME_TOKENS.dawn;
  }

  if (safeRatio < 0.68) {
    return ANCIENT_STAGE_RUNTIME_TOKENS.sunset;
  }

  return ANCIENT_STAGE_RUNTIME_TOKENS.night;
}

/**
 * 古风主题当前场景令牌。
 */
const ancientRuntimeToken = computed(() =>
  resolveAncientRuntimeToken(ancientThemeProgressRatio.value),
);

/**
 * 运行时主题样式：
 * 关键逻辑：只覆盖颜色相关 CSS 变量，不改动结构布局变量，保证通用组件稳定性。
 */
const runtimeThemeStyle = computed(() => {
  if (isColorTheme2026.value) {
    const targetPalette =
      runtimePaletteMap.value[runtimeDominantColorKey.value] ??
      runtimePaletteMap.value[runtimeDefaultColorKey.value] ??
      {};
    const blendRatio = runtimeBlendRatio.value;

    const blendToken = (tokenKey) =>
      blendHexColor(
        COLOR_2026_NEUTRAL_TOKENS[tokenKey],
        targetPalette[tokenKey] ?? COLOR_2026_NEUTRAL_TOKENS[tokenKey],
        blendRatio,
      );

    const mixedAccent = blendToken("accent");

    return {
      "--runtime-bg-start": blendToken("bgStart"),
      "--runtime-bg-mid": blendToken("bgMid"),
      "--runtime-bg-end": blendToken("bgEnd"),
      "--runtime-text-main": blendToken("textMain"),
      "--runtime-text-muted": blendToken("textMuted"),
      "--runtime-surface": blendToken("surface"),
      "--runtime-surface-border": blendToken("surfaceBorder"),
      "--runtime-option-border": blendToken("optionBorder"),
      "--runtime-option-selected-border": blendToken("optionSelectedBorder"),
      "--runtime-option-selected-bg-start": blendToken("optionSelectedBgStart"),
      "--runtime-option-selected-bg-end": blendToken("optionSelectedBgEnd"),
      "--runtime-highlight-border": blendToken("highlightBorder"),
      "--runtime-highlight-bg-start": blendToken("highlightBgStart"),
      "--runtime-highlight-bg-end": blendToken("highlightBgEnd"),
      "--runtime-primary": mixedAccent,
      "--runtime-primary-dark": blendToken("accentSoft"),
      "--runtime-aura-left": blendToken("auraLeft"),
      "--runtime-aura-right": blendToken("auraRight"),
      "--runtime-shadow": `0 24px 54px ${toRgbaString(mixedAccent, 0.17)}`,
      "--runtime-option-shadow": toRgbaString(mixedAccent, 0.17),
    };
  }

  if (isAncientTheme.value) {
    const sceneToken = ancientRuntimeToken.value;
    return {
      "--ancient-page-bg": sceneToken.pageBg,
      "--ancient-scene-image": sceneToken.sceneImage,
      "--ancient-scene-opacity": sceneToken.sceneOpacity,
      "--ancient-scene-filter": sceneToken.sceneFilter,
      "--ancient-scene-scale": sceneToken.sceneScale,
      // 关键逻辑：移动端与桌面端使用独立构图定位，保证手机端主视觉完整。
      "--ancient-scene-position-mobile":
        sceneToken.scenePositionMobile ?? sceneToken.scenePosition ?? "center top",
      "--ancient-scene-position-desktop":
        sceneToken.scenePositionDesktop ?? sceneToken.scenePosition ?? "center 30%",
      "--ancient-scene-veil-top": sceneToken.sceneVeilTop,
      "--ancient-scene-veil-bottom": sceneToken.sceneVeilBottom,
      "--ancient-scene-veil-opacity": sceneToken.sceneVeilOpacity,
      "--ancient-primary": sceneToken.primary,
      "--ancient-primary-dark": sceneToken.primaryDark,
      "--ancient-text-main": sceneToken.textMain,
      "--ancient-text-muted": sceneToken.textMuted,
      "--ancient-surface": sceneToken.surface,
      "--ancient-surface-border": sceneToken.surfaceBorder,
      "--ancient-option-border": sceneToken.optionBorder,
      "--ancient-option-bg": sceneToken.optionBg,
      "--ancient-option-selected-border": sceneToken.optionSelectedBorder,
      "--ancient-option-selected-shadow": sceneToken.optionSelectedShadow,
      "--ancient-option-selected-bg-start": sceneToken.optionSelectedBgStart,
      "--ancient-option-selected-bg-end": sceneToken.optionSelectedBgEnd,
      "--ancient-detail-border": sceneToken.detailBorder,
      "--ancient-detail-bg-start": sceneToken.detailBgStart,
      "--ancient-detail-bg-end": sceneToken.detailBgEnd,
      "--ancient-highlight-border": sceneToken.highlightBorder,
      "--ancient-highlight-bg-start": sceneToken.highlightBgStart,
      "--ancient-highlight-bg-end": sceneToken.highlightBgEnd,
      "--ancient-card-bg-start": sceneToken.cardBgStart,
      "--ancient-card-bg-end": sceneToken.cardBgEnd,
      "--ancient-card-shadow": sceneToken.cardShadow,
      "--ancient-header-bg-start": sceneToken.headerBgStart,
      "--ancient-header-bg-end": sceneToken.headerBgEnd,
      "--ancient-aura-left": sceneToken.auraLeft,
      "--ancient-aura-right": sceneToken.auraRight,
    };
  }

  return {};
});

/**
 * 当前激活的选中颜色：
 * 关键逻辑：主题色页面使用运行时主色，其他主题沿用静态配置色。
 */
const activeCheckedColor = computed(() => {
  if (!isColorTheme2026.value) {
    return props.themeConfig.theme.checkedColor;
  }

  return (
    runtimeThemeStyle.value["--runtime-primary"] ??
    props.themeConfig.theme.checkedColor
  );
});

/**
 * 当前进度条颜色。
 */
const activeProgressColor = computed(() => {
  if (!isColorTheme2026.value) {
    return props.themeConfig.theme.progressColor;
  }

  const primaryColor =
    runtimeThemeStyle.value["--runtime-primary"] ?? props.themeConfig.theme.checkedColor;
  const secondaryColor =
    runtimeThemeStyle.value["--runtime-primary-dark"] ??
    props.themeConfig.theme.checkedColor;

  return `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`;
});

/**
 * 把百分比分值转换为 0~1 比例。
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
 * 根据角度和比例计算雷达图坐标点。
 * @param {number} angleRadians 极角（弧度）。
 * @param {number} ratio 半径比例（0~1）。
 * @returns {{ x: number, y: number }} 坐标点。
 */
function resolveRadarPoint(angleRadians, ratio) {
  return {
    x: RADAR_CENTER_POINT + Math.cos(angleRadians) * RADAR_RADIUS * ratio,
    y: RADAR_CENTER_POINT + Math.sin(angleRadians) * RADAR_RADIUS * ratio,
  };
}

/**
 * 雷达图每个维度的轴点与数据点。
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
 * 雷达图网格多边形点集。
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
 * 雷达图数据面点集。
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
 * 雷达图标签点位。
 */
const radarLabelPoints = computed(() => {
  return radarAxisPoints.value.map((axisPoint) => ({
    x: axisPoint.labelX,
    y: axisPoint.labelY,
    label: axisPoint.label,
  }));
});

/**
 * 海报视觉风格映射：
 * 关键逻辑：通过视觉键切换主背景，保证不同结果海报有清晰差异。
 */
const ROMANCE_POSTER_VISUALS = {
  starlight: {
    gradientStart: "#241C4A",
    gradientEnd: "#4B3B7A",
    accent: "#FFD5E9",
    accentSoft: "#9FA7FF",
  },
  candlelight: {
    gradientStart: "#5A2A38",
    gradientEnd: "#B66A6D",
    accent: "#FFE0C7",
    accentSoft: "#FFAF9F",
  },
  "sunset-park": {
    gradientStart: "#5F3A5F",
    gradientEnd: "#D1858F",
    accent: "#FFD9B0",
    accentSoft: "#9DC6FF",
  },
  "warm-home": {
    gradientStart: "#5A426A",
    gradientEnd: "#9B7FB4",
    accent: "#FFD8EA",
    accentSoft: "#D2C2FF",
  },
  "city-night": {
    gradientStart: "#1E2937",
    gradientEnd: "#445066",
    accent: "#C9D9FF",
    accentSoft: "#9DAECC",
  },
};

/**
 * 解析海报视觉风格。
 * @param {string} visualKey 海报视觉键。
 * @returns {{ gradientStart: string, gradientEnd: string, accent: string, accentSoft: string }} 视觉配置。
 */
function resolvePosterVisual(visualKey) {
  return (
    ROMANCE_POSTER_VISUALS[visualKey] ??
    ROMANCE_POSTER_VISUALS["warm-home"]
  );
}

/**
 * 加载当前主题题库。
 * 兼容两种配置：
 * 1. survey.questions 为静态数组。
 * 2. survey.questions 为异步函数（按需加载题库模块）。
 * @param {number} sessionToken 当前加载会话令牌。
 * @returns {Promise<boolean>} 是否加载成功。
 */
async function loadQuestionPoolForCurrentTheme(sessionToken) {
  const questionSource = props.themeConfig.survey.questions;
  try {
    const resolvedQuestions =
      typeof questionSource === "function"
        ? await questionSource()
        : questionSource;

    if (sessionToken !== questionPoolLoadSessionToken) {
      return false;
    }

    loadedQuestionPool.value = Array.isArray(resolvedQuestions)
      ? resolvedQuestions
      : [];

    if (loadedQuestionPool.value.length === 0) {
      questionPoolLoadError.value = "题库为空，请稍后重试";
      return false;
    }

    return true;
  } catch {
    if (sessionToken !== questionPoolLoadSessionToken) {
      return false;
    }

    questionPoolLoadError.value = "题库加载失败，请稍后重试";
    return false;
  }
}

/**
 * 生成本轮随机题集。
 */
function rebuildQuestionBank() {
  if (questionSelection.value.useSequentialQuestionOrder) {
    /**
     * 关键逻辑：按题库顺序截取前 N 题。
     * 适用于带“守门员题”的剧情化测试，避免随机打乱关键题位次。
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
 * 重置问卷状态：
 * 主题切换或点击重测时都复用该方法。
 */
async function resetSurveyState() {
  // 关键逻辑：重置时递增会话令牌，使历史深度请求全部失效。
  deepAnalysisSessionToken += 1;
  questionPoolLoadSessionToken += 1;
  const currentQuestionPoolSessionToken = questionPoolLoadSessionToken;
  isAdvancingToNext.value = false;
  stopAutoAdvanceTimer();
  stopEncouragementTimer();
  isEncouragementVisible.value = false;
  hasShownMidwayEncouragement.value = false;
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
  loadedQuestionPool.value = [];
  selectedQuestionBank.value = [];
  coverPointsSnapshot.value = [];
  themeDescriptionSnapshot.value = "";
  isSummaryExpanded.value = false;
  questionPoolLoadError.value = "";
  loadingMessageIndex.value = 0;
  currentQuestionIndex.value = 0;
  answers.value = [];
  unifiedResult.value = null;
  rebuildThemeDescriptionSnapshot();
  // 关键逻辑：重置阶段先进入 loading，避免题库未就绪时出现空白页。
  stage.value = "loading";
  stopLoadingMessageTicker();

  const loadedSuccess = await loadQuestionPoolForCurrentTheme(
    currentQuestionPoolSessionToken,
  );
  if (!loadedSuccess) {
    if (
      currentQuestionPoolSessionToken === questionPoolLoadSessionToken &&
      questionPoolLoadError.value
    ) {
      showToast(questionPoolLoadError.value);
    }
    return;
  }

  if (currentQuestionPoolSessionToken !== questionPoolLoadSessionToken) {
    return;
  }

  rebuildQuestionBank();
  rebuildCoverPointsSnapshot();
  answers.value = Array.from({ length: questionBank.value.length }, () => null);
  /**
   * 关键逻辑：封面主题重置后回到 cover；其他主题直接进入问卷。
   */
  stage.value = shouldUseCoverStage.value ? "cover" : "survey";
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
 * 清理自动下一题定时器。
 */
function stopAutoAdvanceTimer() {
  if (autoAdvanceTimer) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

/**
 * 清理中途激励定时器。
 */
function stopEncouragementTimer() {
  if (encouragementTimer) {
    window.clearTimeout(encouragementTimer);
    encouragementTimer = null;
  }
}

/**
 * 判断当前步骤是否需要触发中途激励。
 * @param {number} currentQuestionIdx 当前题目索引（从 0 开始）。
 * @returns {boolean} 是否需要触发。
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
 * 展示中途激励文案。
 * 关键逻辑：每轮答题最多触发一次，避免频繁打断。
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
 * 重置海报状态。
 */
function resetPosterState() {
  posterGenerationToken += 1;
  posterPreviewUrl.value = "";
  isGeneratingPoster.value = false;
}

/**
 * 切换答卷回放展开状态。
 */
function toggleSummaryExpandState() {
  isSummaryExpanded.value = !isSummaryExpanded.value;
}

/**
 * 睡眠等待工具。
 * @param {number} durationMs 等待时长（毫秒）。
 * @returns {Promise<void>} Promise。
 */
function waitFor(durationMs) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, Number(durationMs) || 0));
  });
}

/**
 * 保证分析页最短停留时间。
 * 关键逻辑：仅补足剩余时间，不额外延长已满足阈值的流程。
 * @param {number} analyzingStartedAt 分析开始时间戳（毫秒）。
 * @returns {Promise<void>} Promise。
 */
async function ensureMinimumAnalyzingDuration(analyzingStartedAt) {
  const minDurationMs = minimumAnalyzingDurationMs.value;
  if (minDurationMs <= 0) {
    return;
  }

  const elapsedDurationMs = Date.now() - Number(analyzingStartedAt || 0);
  const remainingDurationMs = minDurationMs - elapsedDurationMs;
  if (remainingDurationMs > 0) {
    await waitFor(remainingDurationMs);
  }
}

/**
 * 为 Promise 增加硬超时限制。
 * 复杂度评估：O(1)
 * 仅引入常数级计时器开销，不改变分析主流程复杂度。
 * @template T
 * @param {Promise<T>} promise 原始 Promise。
 * @param {number} timeoutMs 超时时间（毫秒）。
 * @param {string} timeoutMessage 超时提示语。
 * @returns {Promise<T>} 带硬超时控制的 Promise。
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
 * 解析守门员判定结果。
 * @returns {Promise<{ passed: boolean, scorePercent: number, thresholdPercent: number }>} 判定摘要。
 */
async function resolveGatekeeperResult() {
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

  let evaluatedResult = null;
  try {
    evaluatedResult = await evaluator(
      questionBank.value,
      answers.value,
      gateConfig,
    );
  } catch {
    // 关键逻辑：守门员判定异常时回退为未通过，避免阻断主流程。
    evaluatedResult = {
      passed: false,
      scorePercent: 0,
      thresholdPercent: gateConfig.thresholdPercent,
    };
  }
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
 * 在当前题集末尾追加“第 14 次机会”题目。
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
 * 播放宿命判定转场脚本。
 * @param {boolean} passed 是否通过守门员判定。
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
 * 在“最后一题提交前”处理 romance 守门员逻辑。
 * @returns {Promise<boolean>} 是否继续进入结果计算流程。
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

  const gateResult = await resolveGatekeeperResult();
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
      // 关键逻辑：解锁成功后进入第 14 题，不立即出结果。
      currentQuestionIndex.value += 1;
      return false;
    }
  }

  return true;
}

/**
 * 在 Canvas 中绘制自动换行文本。
 * 复杂度评估：O(W)
 * W 为文本词块数量，单次海报绘制中 W 较小（常量级）。
 * @param {CanvasRenderingContext2D} context Canvas 绘图上下文。
 * @param {string} content 文本内容。
 * @param {number} originX 起始 X 坐标。
 * @param {number} originY 起始 Y 坐标。
 * @param {number} maxWidth 最大文本宽度。
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

  // 关键逻辑：超出最大行数时尾行追加省略号，避免海报文案越界。
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
 * 绘制圆角矩形填充区域（兼容不支持 roundRect 的环境）。
 * @param {CanvasRenderingContext2D} context Canvas 绘图上下文。
 * @param {number} x 左上角 X 坐标。
 * @param {number} y 左上角 Y 坐标。
 * @param {number} width 矩形宽度。
 * @param {number} height 矩形高度。
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
 * 绘制海报中的雷达图。
 * @param {CanvasRenderingContext2D} context Canvas 绘图上下文。
 * @param {Array<object>} radarItems 雷达维度数据。
 * @param {number} centerX 圆心 X。
 * @param {number} centerY 圆心 Y。
 * @param {number} radius 雷达半径。
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
 * 转义 HTML 文本，避免长图模板注入异常。
 * @param {string} content 原始文本。
 * @returns {string} 安全文本。
 */
function escapeHtmlText(content) {
  return String(content ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 生成恋爱脑长图的 HTML 模板。
 * 复杂度评估：O(N)
 * N 为文案总字符量，模板拼接为线性复杂度。
 * @param {object} posterModel 海报模型。
 * @returns {string} HTML 字符串。
 */
function buildLoveBrainPosterHtml(posterModel) {
  const stageRows = (posterModel.stageDistribution ?? [])
    .map(
      (item) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,0.52);background:rgba(255,255,255,0.18);">
          <span style="font-size:26px;color:#f6fbff;">${escapeHtmlText(item.name)}</span>
          <span style="font-size:28px;font-weight:700;color:#fff;">${escapeHtmlText(item.score)}%</span>
        </div>
      `,
    )
    .join("");

  const topRiskRows = (posterModel.topRiskScenarios ?? [])
    .slice(0, 3)
    .map(
      (item, index) => `
        <li style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;border-radius:16px;background:rgba(9,20,52,0.52);border:1px solid rgba(152,206,255,0.35);padding:16px 18px;">
          <div style="display:flex;justify-content:space-between;gap:12px;">
            <span style="font-size:23px;font-weight:700;color:#ebf7ff;">${index + 1}. ${escapeHtmlText(item.name)}</span>
            <span style="font-size:24px;font-weight:700;color:#ffd1e1;">${escapeHtmlText(item.score)}%</span>
          </div>
          <p style="margin:0;font-size:21px;line-height:1.6;color:#d6e7ff;">${escapeHtmlText(item.optionLabel)}</p>
        </li>
      `,
    )
    .join("");

  return `
    <div xmlns="http://www.w3.org/1999/xhtml" style="width:1080px;height:2160px;padding:72px;box-sizing:border-box;background:
      radial-gradient(circle at 12% 10%, rgba(255,255,255,0.22), transparent 34%),
      radial-gradient(circle at 88% 16%, rgba(123,208,255,0.25), transparent 30%),
      linear-gradient(155deg, #0f1a3f 0%, #1b2861 45%, #3b2a65 100%);
      color:#f7fbff;font-family:'Noto Sans SC',sans-serif;">
      <div style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;background:rgba(147,220,255,0.22);border:1px solid rgba(181,229,255,0.4);font-size:18px;letter-spacing:0.08em;font-weight:700;">LOVE BRAIN · 1314</div>
      <h1 style="margin:22px 0 10px;font-size:64px;line-height:1.18;font-family:'Noto Serif SC',serif;">你的脑子里全是水还是野菜？</h1>
      <p style="margin:0;font-size:28px;line-height:1.6;color:#d4e8ff;">心理学内核 + 互联网梗文化，给你一份可转发的恋爱脑体检结果。</p>

      <section style="margin-top:30px;padding:24px;border-radius:24px;background:rgba(4,10,35,0.45);border:1px solid rgba(137,193,255,0.34);">
        <p style="margin:0;font-size:22px;color:#9ad1ff;letter-spacing:0.06em;">恋爱脑指数</p>
        <div style="margin-top:12px;display:flex;align-items:flex-end;gap:14px;">
          <span style="font-size:120px;line-height:1;font-family:'Noto Serif SC',serif;color:#ffffff;font-weight:700;">${escapeHtmlText(posterModel.indexScore)}</span>
          <span style="font-size:36px;line-height:1.2;color:#c5e4ff;padding-bottom:14px;">/140</span>
        </div>
        <p style="margin:14px 0 0;font-size:40px;line-height:1.35;font-family:'Noto Serif SC',serif;color:#ffd6e6;">${escapeHtmlText(posterModel.levelName)}</p>
        <p style="margin:8px 0 0;font-size:28px;color:#cde6ff;">${escapeHtmlText(posterModel.levelTitle)} · ${escapeHtmlText(posterModel.coreTag)}</p>
      </section>

      <section style="margin-top:24px;padding:24px;border-radius:22px;background:rgba(255,255,255,0.12);border:1px solid rgba(205,230,255,0.4);">
        <h2 style="margin:0 0 12px;font-size:34px;font-family:'Noto Serif SC',serif;">扎心分析</h2>
        <p style="margin:0;font-size:25px;line-height:1.7;color:#eef6ff;">${escapeHtmlText(posterModel.piercingLine)}</p>
      </section>

      <section style="margin-top:24px;display:grid;gap:12px;">
        <h2 style="margin:0;font-size:34px;font-family:'Noto Serif SC',serif;">状态分布</h2>
        ${stageRows}
      </section>

      <section style="margin-top:24px;">
        <h2 style="margin:0 0 12px;font-size:34px;font-family:'Noto Serif SC',serif;">最容易上头的场景 Top 3</h2>
        <ul style="margin:0;padding:0;display:grid;gap:10px;">${topRiskRows}</ul>
      </section>

      <section style="margin-top:24px;padding:24px;border-radius:22px;background:rgba(255, 236, 246, 0.14);border:1px solid rgba(255, 206, 226, 0.42);">
        <h2 style="margin:0 0 10px;font-size:34px;font-family:'Noto Serif SC',serif;color:#ffdceb;">结论</h2>
        <p style="margin:0;font-size:23px;line-height:1.7;color:#fbefff;">${escapeHtmlText(posterModel.narrative)}</p>
      </section>

      <p style="margin:14px 0 0;font-size:20px;color:#afc7eb;">生成时间 ${escapeHtmlText(new Date().toLocaleString("zh-CN", { hour12: false }))}</p>
    </div>
  `;
}

/**
 * 构建 SVG DataURL（基于 foreignObject 承载 HTML）。
 * @param {string} htmlMarkup HTML 模板字符串。
 * @param {number} width 海报宽度。
 * @param {number} height 海报高度。
 * @returns {string} SVG DataURL。
 */
function buildSvgDataUrlFromHtmlMarkup(htmlMarkup, width, height) {
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject x="0" y="0" width="100%" height="100%">${htmlMarkup}</foreignObject>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

/**
 * 加载图片资源。
 * @param {string} sourceUrl 图片地址。
 * @returns {Promise<HTMLImageElement>} 图片元素 Promise。
 */
function loadImageByUrl(sourceUrl) {
  return new Promise((resolve, reject) => {
    const imageElement = new Image();
    imageElement.decoding = "async";
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = () => reject(new Error("图片加载失败"));
    imageElement.src = sourceUrl;
  });
}

/**
 * 使用 HTML-to-Image 方式生成恋爱脑长图。
 * 复杂度评估：O(N)
 * N 为模板字符总量，渲染转换为单次线性流程。
 * @param {object} posterModel 海报模型。
 * @returns {Promise<string>} PNG DataURL。
 */
async function generateLoveBrainPosterDataUrl(posterModel) {
  const posterWidth = 1080;
  const posterHeight = 2160;
  const htmlMarkup = buildLoveBrainPosterHtml(posterModel);
  const svgDataUrl = buildSvgDataUrlFromHtmlMarkup(
    htmlMarkup,
    posterWidth,
    posterHeight,
  );

  const renderedImage = await loadImageByUrl(svgDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = posterWidth;
  canvas.height = posterHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法初始化画布");
  }

  context.drawImage(renderedImage, 0, 0, posterWidth, posterHeight);
  return canvas.toDataURL("image/png");
}

/**
 * 恋爱脑长图 Canvas 兜底方案：
 * 关键逻辑：当 HTML-to-Image 在低兼容环境失败时，保证仍可导出图片。
 * @param {object} posterModel 海报模型。
 * @returns {Promise<string>} PNG DataURL。
 */
async function generateLoveBrainPosterFallbackDataUrl(posterModel) {
  const posterWidth = 1080;
  const posterHeight = 2160;
  const canvas = document.createElement("canvas");
  canvas.width = posterWidth;
  canvas.height = posterHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("无法初始化画布");
  }

  const gradient = context.createLinearGradient(0, 0, 0, posterHeight);
  gradient.addColorStop(0, "#111d47");
  gradient.addColorStop(0.52, "#243674");
  gradient.addColorStop(1, "#4a2f63");
  context.fillStyle = gradient;
  context.fillRect(0, 0, posterWidth, posterHeight);

  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  fillRoundedRect(context, 72, 82, posterWidth - 144, posterHeight - 164, 40);

  context.fillStyle = "#375EA5";
  context.font = "700 34px 'Noto Sans SC'";
  context.textAlign = "left";
  context.fillText("LOVE BRAIN · 1314", 132, 168);

  context.fillStyle = "#1C2E54";
  context.font = "700 58px 'Noto Serif SC'";
  context.fillText("恋爱脑指数报告", 132, 248);

  context.fillStyle = "#49659B";
  context.font = "500 32px 'Noto Sans SC'";
  context.fillText("你的脑子里全是水还是野菜？", 132, 310);

  context.fillStyle = "#203F77";
  context.font = "700 128px 'Noto Serif SC'";
  context.fillText(`${posterModel.indexScore ?? 0}`, 132, 454);

  context.fillStyle = "#4D689D";
  context.font = "500 38px 'Noto Sans SC'";
  context.fillText("/140", 412, 454);

  context.fillStyle = "#2C3D73";
  context.font = "700 48px 'Noto Serif SC'";
  context.fillText(String(posterModel.levelName ?? ""), 132, 536);

  context.fillStyle = "#405487";
  context.font = "500 34px 'Noto Sans SC'";
  context.fillText(
    `${String(posterModel.levelTitle ?? "")} · ${String(posterModel.coreTag ?? "")}`,
    132,
    594,
  );

  context.fillStyle = "#EEF4FF";
  fillRoundedRect(context, 132, 652, posterWidth - 264, 218, 22);
  context.fillStyle = "#2C4279";
  context.font = "700 36px 'Noto Serif SC'";
  context.fillText("扎心分析", 166, 724);
  context.font = "500 30px 'Noto Sans SC'";
  drawWrappedText(
    context,
    String(posterModel.piercingLine ?? ""),
    166,
    778,
    posterWidth - 332,
    42,
    3,
  );

  context.fillStyle = "#2D426E";
  context.font = "700 36px 'Noto Serif SC'";
  context.fillText("最容易上头的场景 Top 3", 132, 964);

  const topRiskItems = Array.isArray(posterModel.topRiskScenarios)
    ? posterModel.topRiskScenarios.slice(0, 3)
    : [];
  topRiskItems.forEach((item, index) => {
    const cardTopY = 1004 + index * 180;
    context.fillStyle = "#F4F8FF";
    fillRoundedRect(context, 132, cardTopY, posterWidth - 264, 156, 18);

    context.fillStyle = "#355188";
    context.font = "700 30px 'Noto Sans SC'";
    context.fillText(`${index + 1}. ${String(item.name ?? "")}`, 162, cardTopY + 56);

    context.fillStyle = "#E56D95";
    context.font = "700 30px 'Noto Sans SC'";
    context.textAlign = "right";
    context.fillText(
      `${Number(item.score ?? 0)}%`,
      posterWidth - 162,
      cardTopY + 56,
    );
    context.textAlign = "left";

    context.fillStyle = "#6079AC";
    context.font = "500 26px 'Noto Sans SC'";
    drawWrappedText(
      context,
      String(item.optionLabel ?? ""),
      162,
      cardTopY + 102,
      posterWidth - 324,
      32,
      1,
    );
  });

  context.fillStyle = "#39558D";
  context.font = "700 36px 'Noto Serif SC'";
  context.fillText("结论", 132, 1602);
  context.font = "500 28px 'Noto Sans SC'";
  drawWrappedText(
    context,
    String(posterModel.narrative ?? ""),
    132,
    1650,
    posterWidth - 264,
    40,
    6,
  );

  context.fillStyle = "#526DA6";
  context.font = "500 24px 'Noto Sans SC'";
  context.fillText(
    `生成时间 ${new Date().toLocaleString("zh-CN", { hour12: false })}`,
    132,
    2040,
  );

  return canvas.toDataURL("image/png");
}

/**
 * 使用 Canvas 方式生成浪漫指数海报。
 * 复杂度评估：O(D + W)
 * D 为雷达维度数量（固定 4），W 为文案字符数，整体为常数级。
 * @param {object} posterModel 海报模型。
 * @returns {Promise<string>} PNG DataURL。
 */
async function generateRomancePosterDataUrl(posterModel) {
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

  // 关键逻辑：叠加两层柔光径向渐变，模拟主视觉插画氛围，避免背景过于平面。
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
  context.fillText("ROMANCE DNA TEST", 136, 174);

  context.fillStyle = "#3B2B54";
  context.font = "700 58px 'Noto Serif SC'";
  context.fillText("《你认为最浪漫的事》", 136, 258);

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
    "长按保存图片，分享你的浪漫指数",
    136,
    ctaBaseY,
  );

  let easterEggBottomY = ctaBaseY;
  if (easterEggText) {
    context.fillStyle = "#7C6D9C";
    context.font = "500 24px 'Noto Sans SC'";
    // 关键逻辑：彩蛋文案长度可能变化，使用自动换行避免越界。
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

  return canvas.toDataURL("image/png");
}

/**
 * 统一生成海报：
 * 1. romance 使用 Canvas 雷达图渲染。
 * 2. love-brain 使用 HTML-to-Image 渲染长图。
 * @returns {Promise<void>} Promise。
 */
async function generatePosterImage() {
  const posterModel = unifiedResult.value?.posterModel;
  if (!posterModel) {
    return;
  }

  const currentToken = ++posterGenerationToken;
  isGeneratingPoster.value = true;

  try {
    const renderMode = String(posterModel.renderMode ?? "canvas-romance");
    let generatedDataUrl = "";

    if (renderMode === "html-love-brain") {
      try {
        generatedDataUrl = await generateLoveBrainPosterDataUrl(posterModel);
      } catch {
        // 关键逻辑：HTML-to-Image 失败时自动退回 Canvas，保证导图能力稳定可用。
        generatedDataUrl = await generateLoveBrainPosterFallbackDataUrl(posterModel);
      }
    } else {
      generatedDataUrl = await generateRomancePosterDataUrl(posterModel);
    }

    if (currentToken !== posterGenerationToken) {
      return;
    }

    posterPreviewUrl.value = generatedDataUrl;
  } catch {
    if (currentToken === posterGenerationToken) {
      showToast("长图生成失败，请重试");
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
  await generatePosterImage();
}

/**
 * 保存海报到本地。
 */
function savePosterImage() {
  if (!posterPreviewUrl.value) {
    showToast("长图仍在生成，请稍候");
    return;
  }

  const rawFilePrefix = String(
    unifiedResult.value?.posterModel?.downloadFilePrefix ?? `${props.themeConfig.key}-result`,
  );
  // 关键逻辑：下载文件名仅保留字母/数字/中划线，避免特殊字符导致兼容问题。
  const normalizedFilePrefix =
    rawFilePrefix.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") ||
    "survey-result";

  const downloadLink = document.createElement("a");
  downloadLink.href = posterPreviewUrl.value;
  downloadLink.download = `${normalizedFilePrefix}-${Date.now()}.png`;
  downloadLink.click();
}

/**
 * 监听主题切换：
 * 关键逻辑：同一套组件可切换多主题，必须在主题变更时重置状态。
 */
watch(
  () => props.themeConfig.key,
  () => {
    // 关键逻辑：重置为异步流程，显式丢弃 Promise，避免未处理警告。
    void resetSurveyState();
  },
  { immediate: true },
);

/**
 * 监听阶段切换，管理加载文案定时器。
 */
watch(stage, (nextStage, previousStage) => {
  if (nextStage === "result" && previousStage !== "result") {
    // 关键逻辑：每次进入结果页都恢复为预览态，默认仅展示 3 条答卷回放。
    isSummaryExpanded.value = false;
  }

  if (nextStage === "analyzing") {
    startLoadingMessageTicker();
    return;
  }

  stopLoadingMessageTicker();
});

/**
 * 结果变化时自动生成海报：
 * 关键逻辑：仅在结果页且存在 posterModel 时触发，避免无效绘制。
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
 * 组件卸载时清理资源。
 */
onBeforeUnmount(() => {
  // 关键逻辑：组件销毁时令牌失效，避免卸载后异步写入。
  deepAnalysisSessionToken += 1;
  stopLoadingMessageTicker();
  stopAutoAdvanceTimer();
  stopEncouragementTimer();
  isDestinyOverlayVisible.value = false;
  resetPosterState();
});

/**
 * 调度自动下一题。
 * @param {number} expectedQuestionIndex 预期题目索引。
 * @param {string} optionId 选项 ID。
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

    // 关键逻辑：必须校验题号和答案未变化，避免重复点击导致跨题跳转。
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
 * 上一步。
 */
function goPrev() {
  stopAutoAdvanceTimer();
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

/**
 * 下一步：
 * 1. 非最后一题，直接进入下一题。
 * 2. 最后一题执行“14 秒快速回显 + 深度后台升级”策略。
 * 3. 深度失败时回退本地结果，保证流程稳定可用。
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
      // 关键逻辑：在第 N 题完成后进入下一题时触发激励，减少“题目过长”体感。
      const shouldShowCheer = shouldTriggerMidwayEncouragement(
        currentQuestionIndex.value,
      );
      currentQuestionIndex.value += 1;
      if (shouldShowCheer) {
        showMidwayEncouragement();
      }
      return;
    }

    /**
     * romance 宿命模式：
     * 1. 在 Q13 触发守门员判定。
     * 2. 通过时动态解锁 Q14 并中断本次提交。
     * 3. 未通过时继续当前提交流程（13 题结局）。
     */
    const shouldContinueSubmit = await handleDestinyGateBeforeSubmit();
    if (!shouldContinueSubmit) {
      return;
    }

    stage.value = "analyzing";
    const analyzingStartedAt = Date.now();
    const currentSessionToken = ++deepAnalysisSessionToken;

    const localResult = await props.themeConfig.survey.runLocalAnalysis(
      questionBank.value,
      answers.value,
    );
    const localUnifiedResult = props.themeConfig.survey.buildLocalUnifiedResult(
      localResult,
    );

    /**
     * 深度统一结果 Promise：
     * 关键逻辑：包含硬超时限制，避免长时间挂起影响用户体验。
     */
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
      /**
       * 首屏结果竞争：
       * 1. 14 秒内拿到深度结果 -> 直接展示深度结果。
       * 2. 14 秒仍未拿到 -> 先展示本地结果，深度结果后台继续。
       */
      const firstResult = await Promise.race([
        deepUnifiedPromise.then((deepUnifiedResult) => ({
          type: "deep",
          result: deepUnifiedResult,
        })),
        waitFor(LOCAL_RESULT_FALLBACK_DELAY_MS).then(() => ({
          type: "local_timeout",
        })),
      ]);

      // 关键逻辑：若会话已失效（重测/切换主题），不写入任何过期结果。
      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }

      if (firstResult.type === "deep") {
        // 关键逻辑：补足分析页最短停留时长，确保“扫描完成”仪式感一致。
        await ensureMinimumAnalyzingDuration(analyzingStartedAt);
        if (currentSessionToken !== deepAnalysisSessionToken) {
          return;
        }
        unifiedResult.value = firstResult.result;
        stage.value = "result";
        return;
      }

      // 关键逻辑：即使走本地回显分支，也保持最短分析展示时长一致。
      await ensureMinimumAnalyzingDuration(analyzingStartedAt);
      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }
      unifiedResult.value = localUnifiedResult;
      stage.value = "result";

      /**
       * 后台静默升级：
       * 本地结果先回显后，深度结果返回时自动替换，不额外打断用户。
       */
      deepUnifiedPromise
        .then((deepUnifiedResult) => {
          if (currentSessionToken !== deepAnalysisSessionToken) {
            return;
          }

          unifiedResult.value = deepUnifiedResult;
        })
        .catch(() => {
          // 关键逻辑：后台升级失败不额外提示，避免阅读中断。
        });
    } catch {
      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }

      // 关键逻辑：失败兜底同样遵守最短动画时长，避免“闪跳”观感。
      await ensureMinimumAnalyzingDuration(analyzingStartedAt);
      if (currentSessionToken !== deepAnalysisSessionToken) {
        return;
      }
      // 关键逻辑：深度调用失败时必须可用本地兜底，保证核心流程可用。
      unifiedResult.value = localUnifiedResult;
      stage.value = "result";
      showToast(props.themeConfig.survey.deepFailToast);
      return;
    }
  } finally {
    isAdvancingToNext.value = false;
  }
}

/**
 * 重新测试。
 */
function restart() {
  // 关键逻辑：重测流程包含异步题库加载，显式忽略 Promise 即可。
  void resetSurveyState();
}

/**
 * 从封面进入问卷。
 * 关键逻辑：仅允许在 cover 阶段触发，避免误改分析/结果阶段状态。
 */
function startSurveyFromCover() {
  if (!shouldUseCoverStage.value || stage.value !== "cover") {
    return;
  }

  stage.value = "survey";
}
</script>
