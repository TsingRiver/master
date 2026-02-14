<template>
  <div class="survey-page" :class="themeConfig.theme.className">
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
          :color="themeConfig.theme.progressColor"
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
                    <van-radio :name="option.id" :checked-color="themeConfig.theme.checkedColor" />
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
          <van-loading :color="themeConfig.theme.checkedColor" size="28px" />
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
