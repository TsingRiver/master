<template>
  <div class="survey-page" :class="themeConfig.theme.className" :style="runtimeThemeStyle">
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

      <section v-if="stage === 'survey' && currentQuestion" class="survey-card card-in">
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

        <div class="survey-actions">
          <van-button
            block
            class="survey-btn survey-btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrev"
          >
            上一步
          </van-button>
          <van-button
            block
            class="survey-btn survey-btn-primary"
            :disabled="!canGoNext"
            @click="goNext"
          >
            {{ isLastQuestion ? themeConfig.theme.submitButtonText : themeConfig.theme.nextButtonText }}
          </van-button>
        </div>
      </section>

      <section v-else-if="stage !== 'survey'" class="survey-card survey-result-card">
        <div v-if="stage === 'analyzing'" class="survey-loading-wrap">
          <van-loading :color="activeCheckedColor" size="28px" />
          <transition name="survey-loading-swap" mode="out-in">
            <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
          </transition>
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
            {{ unifiedResult.scoreLabel }}：{{ unifiedResult.main.score }}%
          </p>

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

          <div class="survey-summary-wrap">
            <h3>{{ unifiedResult.summaryTitle }}</h3>
            <ul class="survey-summary-list">
              <li
                v-for="(line, lineIndex) in unifiedResult.summaryLines"
                :key="`${line}-${lineIndex}`"
                class="survey-summary-item"
              >
                {{ line }}
              </li>
            </ul>
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
 * survey -> 问卷阶段
 * analyzing -> 生成阶段
 * result -> 结果展示阶段
 */
const stage = ref("survey");

/**
 * 问卷状态。
 */
const currentQuestionIndex = ref(0);
const answers = ref([]);
const unifiedResult = ref(null);
const selectedQuestionBank = ref([]);

/**
 * 加载文案轮播状态。
 */
const loadingMessageIndex = ref(0);
let loadingMessageTimer = null;

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
 * 1. questionPool 为完整题库。
 * 2. questionSelection 控制每次抽题范围（默认 10~15）。
 * 3. 可选维度覆盖策略用于保证多维题库每轮都有代表题。
 */
const questionPool = computed(() => props.themeConfig.survey.questions);
const questionSelection = computed(() => {
  const selectionConfig = props.themeConfig.survey.questionSelection ?? {};
  return {
    minCount: selectionConfig.minCount ?? 10,
    maxCount: selectionConfig.maxCount ?? 15,
    ensureDimensionCoverage: Boolean(selectionConfig.ensureDimensionCoverage),
    dimensionKey: selectionConfig.dimensionKey ?? "",
  };
});

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
 * 是否是“2026 主题色”主题。
 */
const isColorTheme2026 = computed(
  () => props.themeConfig.key === "color-2026",
);

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
 * 运行时主题样式：
 * 关键逻辑：只覆盖颜色相关 CSS 变量，不改动结构布局变量，保证通用组件稳定性。
 */
const runtimeThemeStyle = computed(() => {
  if (!isColorTheme2026.value) {
    return {};
  }

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
 * 生成本轮随机题集。
 */
function rebuildQuestionBank() {
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
function resetSurveyState() {
  rebuildQuestionBank();
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: questionBank.value.length }, () => null);
  unifiedResult.value = null;
  stage.value = "survey";
  stopLoadingMessageTicker();
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
 * 监听主题切换：
 * 关键逻辑：同一套组件可切换多主题，必须在主题变更时重置状态。
 */
watch(
  () => props.themeConfig.key,
  () => {
    resetSurveyState();
  },
  { immediate: true },
);

/**
 * 监听阶段切换，管理加载文案定时器。
 */
watch(stage, (nextStage) => {
  if (nextStage === "analyzing") {
    startLoadingMessageTicker();
    return;
  }

  stopLoadingMessageTicker();
});

/**
 * 组件卸载时清理资源。
 */
onBeforeUnmount(() => {
  stopLoadingMessageTicker();
});

/**
 * 选择选项。
 * @param {string} optionId 选项 ID。
 */
function selectOption(optionId) {
  answers.value[currentQuestionIndex.value] = optionId;
}

/**
 * 上一步。
 */
function goPrev() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

/**
 * 下一步：
 * 1. 非最后一题，直接进入下一题。
 * 2. 最后一题，执行本地分析 + 深度分析，失败时回退本地结果。
 */
async function goNext() {
  if (!canGoNext.value) {
    showToast("请先选择一个选项");
    return;
  }

  if (!isLastQuestion.value) {
    currentQuestionIndex.value += 1;
    return;
  }

  stage.value = "analyzing";

  const localResult = props.themeConfig.survey.runLocalAnalysis(
    questionBank.value,
    answers.value,
  );

  try {
    const deepPayload = props.themeConfig.survey.buildDeepPayload(localResult);
    const deepResult = await props.themeConfig.survey.runDeepAnalysis(deepPayload);
    unifiedResult.value = props.themeConfig.survey.buildDeepUnifiedResult(
      deepResult,
      localResult,
    );
  } catch (error) {
    // 关键逻辑：深度调用失败时必须可用本地兜底，保证核心流程可用。
    unifiedResult.value = props.themeConfig.survey.buildLocalUnifiedResult(
      localResult,
    );

    showToast(error?.message || props.themeConfig.survey.deepFailToast);
  }

  stage.value = "result";
}

/**
 * 重新测试。
 */
function restart() {
  resetSurveyState();
}
</script>
