<template>
  <div class="fortune-page">
    <div class="fortune-aura aura-left" aria-hidden="true"></div>
    <div class="fortune-aura aura-right" aria-hidden="true"></div>
    <div class="fortune-grid" aria-hidden="true"></div>

    <main class="fortune-shell" aria-live="polite">
      <header class="fortune-header">
        <p class="fortune-badge">FORTUNE · 2026</p>
        <h1>测你 2026 年的转运关键词</h1>
        <p class="fortune-desc">
          通过日常选择识别你的年度势能结构，生成主关键词、机会动作与避坑信号。
        </p>
      </header>

      <section v-if="stage === 'survey'" class="fortune-card card-in">
        <div class="fortune-progress-meta">
          <span>{{ progressLabel }}</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <van-progress
          :percentage="progressPercent"
          :show-pivot="false"
          :stroke-width="8"
          color="linear-gradient(90deg, #ff7a3d, #f7b955)"
          track-color="rgba(163, 88, 43, 0.15)"
        />

        <transition name="fortune-fade" mode="out-in">
          <div :key="currentQuestion.id" class="fortune-question-wrap">
            <h2 class="fortune-question-title">{{ currentQuestion.title }}</h2>
            <p class="fortune-question-desc">{{ currentQuestion.description }}</p>

            <van-radio-group
              :model-value="answers[currentQuestionIndex]"
              class="fortune-option-group"
              @update:model-value="selectOption"
            >
              <van-cell-group inset class="fortune-cell-group">
                <van-cell
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  :title="option.label"
                  class="fortune-option"
                  :class="{ 'fortune-option-selected': answers[currentQuestionIndex] === option.id }"
                  clickable
                  @click="selectOption(option.id)"
                >
                  <template #right-icon>
                    <van-radio :name="option.id" checked-color="#ff7a3d" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </div>
        </transition>

        <div class="fortune-actions">
          <van-button
            block
            class="fortune-btn fortune-btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrev"
          >
            上一步
          </van-button>
          <van-button
            block
            class="fortune-btn fortune-btn-primary"
            :disabled="!canGoNext"
            @click="goNext"
          >
            {{ isLastQuestion ? "开始 2026 关键词解析" : "下一题" }}
          </van-button>
        </div>
      </section>

      <section v-else class="fortune-card fortune-result-card">
        <div v-if="stage === 'analyzing'" class="fortune-loading-wrap">
          <van-loading color="#ff7a3d" size="28px" />
          <transition name="fortune-loading-swap" mode="out-in">
            <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
          </transition>
        </div>

        <div v-else-if="result" class="fortune-result-state">
          <div class="fortune-source-wrap">
            <van-tag
              :color="result.source === 'ai' ? '#fff1e7' : '#fff5de'"
              :text-color="result.source === 'ai' ? '#a14f1f' : '#9c6500'"
              round
            >
              {{ result.source === "ai" ? "深度解读结果" : "基础解析结果" }}
            </van-tag>
          </div>

          <p class="fortune-result-prefix">你的 2026 主关键词</p>
          <h2 class="fortune-main-keyword">{{ result.mainKeyword.name }}</h2>
          <p class="fortune-main-score">关键词匹配度：{{ result.mainKeyword.score }}%</p>

          <div class="fortune-theme-box">
            <h3>年度主题</h3>
            <p>{{ result.annualTheme }}</p>
          </div>

          <p class="fortune-insight">{{ result.insight }}</p>

          <div class="fortune-top-wrap">
            <h3>关键词 Top 3</h3>
            <ul class="fortune-top-list">
              <li
                v-for="(item, index) in result.topThree"
                :key="item.name"
                class="fortune-top-item"
              >
                <span>{{ index + 1 }}. {{ item.name }}</span>
                <span>{{ item.score }}%</span>
              </li>
            </ul>
          </div>

          <div class="fortune-advice-wrap">
            <h3>机会动作</h3>
            <ul class="fortune-bullet-list">
              <li
                v-for="(action, actionIndex) in result.opportunityActions"
                :key="`${action}-${actionIndex}`"
              >
                {{ action }}
              </li>
            </ul>
          </div>

          <div class="fortune-warning-wrap">
            <h3>避坑信号</h3>
            <ul class="fortune-bullet-list">
              <li
                v-for="(signal, signalIndex) in result.avoidSignals"
                :key="`${signal}-${signalIndex}`"
              >
                {{ signal }}
              </li>
            </ul>
          </div>

          <div class="fortune-summary-wrap">
            <h3>答卷摘要</h3>
            <ul class="fortune-summary-list">
              <li
                v-for="(line, lineIndex) in result.summaryLines"
                :key="`${line}-${lineIndex}`"
                class="fortune-summary-item"
              >
                {{ line }}
              </li>
            </ul>
          </div>

          <van-button block class="fortune-btn fortune-btn-primary fortune-restart-btn" @click="restart">
            重新测试
          </van-button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { showToast } from "vant";
import { FORTUNE_2026_QUESTION_BANK } from "./data/fortune2026QuestionBank";
import { analyzeFortune2026Locally } from "./services/fortune2026Analyzer";
import { analyzeFortune2026WithAI } from "./services/fortune2026AiAnalyzer";

/**
 * 页面阶段：
 * survey -> 问卷阶段
 * analyzing -> AI 分析阶段
 * result -> 结果展示阶段
 */
const stage = ref("survey");

/**
 * 问卷状态。
 */
const currentQuestionIndex = ref(0);
const answers = ref(
  Array.from({ length: FORTUNE_2026_QUESTION_BANK.length }, () => null),
);
const result = ref(null);

/**
 * 主题化加载文案：
 * 在分析阶段轮播展示，强化“测试氛围”并降低等待焦虑。
 */
const LOADING_MESSAGES = [
  "正在测试你的年度势能...",
  "正在校准你的关键词轨迹...",
  "正在匹配你的转运主轴...",
  "正在生成你的 2026 提示...",
];
const loadingMessageIndex = ref(0);
let loadingMessageTimer = null;

/**
 * 派生状态。
 */
const questionCount = FORTUNE_2026_QUESTION_BANK.length;
const currentQuestion = computed(
  () => FORTUNE_2026_QUESTION_BANK[currentQuestionIndex.value],
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === FORTUNE_2026_QUESTION_BANK.length - 1,
);
const canGoNext = computed(
  () => answers.value[currentQuestionIndex.value] !== null,
);
const progressPercent = computed(() => {
  const doneCount = currentQuestionIndex.value + 1;
  return Math.round((doneCount / FORTUNE_2026_QUESTION_BANK.length) * 100);
});
const progressLabel = computed(
  () => `问题 ${currentQuestionIndex.value + 1} / ${questionCount}`,
);
const activeLoadingMessage = computed(
  () => LOADING_MESSAGES[loadingMessageIndex.value],
);

/**
 * 启动加载文案轮播。
 */
function startLoadingMessageTicker() {
  stopLoadingMessageTicker();
  loadingMessageIndex.value = 0;
  loadingMessageTimer = window.setInterval(() => {
    loadingMessageIndex.value =
      (loadingMessageIndex.value + 1) % LOADING_MESSAGES.length;
  }, 1300);
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
 * 监听分析阶段切换，统一管理轮播定时器生命周期。
 */
watch(stage, (nextStage) => {
  if (nextStage === "analyzing") {
    startLoadingMessageTicker();
    return;
  }

  stopLoadingMessageTicker();
});

/**
 * 组件卸载时清理定时器，防止内存泄露。
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
 * 构建 Fortune AI 请求负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ summaryLines: Array<string>, preferenceVector: object, keywordCandidates: Array<object>, localTopThree: Array<object> }} 负载数据。
 */
function buildFortuneAiPayload(localResult) {
  return {
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    keywordCandidates: localResult.scoredKeywords.map((item) => ({
      keyword: item.keyword,
      meaning: item.meaning,
      profile: item.profile,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      keyword: item.keyword,
      score: item.score,
      meaning: item.meaning,
    })),
  };
}

/**
 * 把 AI 结果与本地结果拼装为统一渲染结构。
 * @param {object} aiResult AI 结果。
 * @param {object} localResult 本地分析结果。
 * @returns {{ source: string, mainKeyword: object, topThree: Array<object>, annualTheme: string, insight: string, opportunityActions: Array<string>, avoidSignals: Array<string>, summaryLines: Array<string> }} 展示结果。
 */
function mergeAiResult(aiResult, localResult) {
  return {
    source: "ai",
    mainKeyword: aiResult.mainKeyword,
    topThree: aiResult.topThree,
    annualTheme: aiResult.annualTheme,
    insight: aiResult.insight,
    opportunityActions: aiResult.opportunityActions,
    avoidSignals: aiResult.avoidSignals,
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 下一步：
 * 1. 非最后一题：进入下一题。
 * 2. 最后一题：本地分析 + AI 分析，失败则兜底本地结果。
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

  const localResult = analyzeFortune2026Locally({
    questions: FORTUNE_2026_QUESTION_BANK,
    answerIds: answers.value,
  });

  try {
    const aiResult = await analyzeFortune2026WithAI(
      buildFortuneAiPayload(localResult),
      { timeoutMs: 18000 },
    );

    result.value = mergeAiResult(aiResult, localResult);
  } catch (error) {
    // 关键逻辑：AI 不可用时使用本地模型兜底，保持测试可用性。
    result.value = {
      source: "local",
      mainKeyword: {
        name: localResult.topKeyword.keyword,
        score: localResult.topKeyword.score,
      },
      topThree: localResult.topThree.map((item) => ({
        name: item.keyword,
        score: item.score,
      })),
      annualTheme: "先稳住节奏，再把优势动作做成连续复利。",
      insight: localResult.localNarrative,
      opportunityActions: [
        "把本周最关键事项压缩为 3 件，并设完成标准。",
        "把一次尝试动作提前到今天执行，避免长期准备不落地。",
        "每周固定一次复盘，记录有效策略并持续迭代。",
      ],
      avoidSignals: ["目标频繁切换", "连续两周没有明确推进结果"],
      summaryLines: localResult.summaryLines,
    };

    showToast(error?.message || "深度解读暂不可用，已切换基础解析");
  }

  stage.value = "result";
}

/**
 * 重新测试。
 */
function restart() {
  currentQuestionIndex.value = 0;
  answers.value = Array.from(
    { length: FORTUNE_2026_QUESTION_BANK.length },
    () => null,
  );
  result.value = null;
  stage.value = "survey";
}
</script>
