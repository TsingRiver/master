<template>
  <div class="page">
    <div class="bg-orb bg-orb-left" aria-hidden="true"></div>
    <div class="bg-orb bg-orb-right" aria-hidden="true"></div>

    <main class="app-shell" aria-live="polite">
      <header class="app-header">
        <p class="header-tag">Daily Life Relocation Survey</p>
        <h1>通过生活习惯，推断最适合你的居住城市</h1>
        <p class="header-desc">
          回答 {{ questionCount }} 个日常问题，系统会先做结构化匹配，再对答卷进行深度解析并给出最终推荐。
        </p>
      </header>

      <section v-if="stage === 'survey'" class="card is-visible" aria-label="问卷区域">
        <div class="card-top">
          <div class="progress-meta">
            <span>{{ progressLabel }}</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <van-progress
            :percentage="progressPercent"
            :show-pivot="false"
            :stroke-width="8"
            color="linear-gradient(90deg, #0f8a63, #43b78b)"
            track-color="rgba(40, 95, 75, 0.13)"
          />
        </div>

        <transition name="fade-slide" mode="out-in">
          <div :key="currentQuestion.id" class="question-wrap">
            <h2 class="question-title">{{ currentQuestion.title }}</h2>
            <p class="question-description">{{ currentQuestion.description }}</p>

            <van-radio-group
              :model-value="answers[currentQuestionIndex]"
              class="option-group"
              @update:model-value="selectOption"
            >
              <van-cell-group inset class="option-cell-group">
                <van-cell
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="option-cell"
                  :class="{ 'is-selected': answers[currentQuestionIndex] === option.id }"
                  clickable
                  :title="option.label"
                  @click="selectOption(option.id)"
                >
                  <template #right-icon>
                    <van-radio :name="option.id" checked-color="#0f8a63" />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </div>
        </transition>

        <div class="actions">
          <van-button
            block
            class="btn btn-secondary"
            :disabled="currentQuestionIndex === 0"
            @click="goPrev"
          >
            上一步
          </van-button>
          <van-button block class="btn btn-primary" :disabled="!canGoNext" @click="goNext">
            {{ isLastQuestion ? "汇总并开始匹配" : "下一步" }}
          </van-button>
        </div>
      </section>

      <section v-else class="card result-card" aria-label="分析结果区域">
        <div v-if="stage === 'analyzing'" class="loading-state">
          <van-loading color="#0f8a63" size="26px" />
          <p>正在汇总答卷并生成匹配结果...</p>
        </div>

        <div v-else-if="analysisResult" class="result-state">
          <div class="result-source-wrap">
            <van-tag
              :color="analysisResult.source === 'ai' ? '#e8f7f0' : '#fff3e3'"
              :text-color="analysisResult.source === 'ai' ? '#1b6a50' : '#9c5d00'"
              round
            >
              {{ analysisResult.source === "ai" ? "深度匹配结果" : "本地规则兜底结果" }}
            </van-tag>
          </div>

          <p class="result-prefix">最终推荐城市</p>
          <h2 class="result-city">{{ analysisResult.topCity.name }}</h2>
          <p class="result-score">综合匹配度：{{ analysisResult.topCity.score }}%</p>
          <p class="result-insight">{{ analysisResult.insight }}</p>
          <p class="result-advice">{{ analysisResult.cityLifeAdvice }}</p>

          <div class="result-tags">
            <van-tag type="primary" color="#e9f7f1" text-color="#1a6a4f">生活习惯映射</van-tag>
            <van-tag type="primary" color="#e9f7f1" text-color="#1a6a4f">结构化偏好拟合</van-tag>
            <van-tag type="primary" color="#e9f7f1" text-color="#1a6a4f">语义化结论生成</van-tag>
          </div>

          <div class="rank-wrap">
            <h3>Top 3 匹配城市</h3>
            <ul class="top-list">
              <li
                v-for="(city, index) in analysisResult.topThree"
                :key="city.name"
                class="top-item"
              >
                <span>{{ index + 1 }}. {{ city.name }}</span>
                <span class="top-score">{{ city.score }}%</span>
              </li>
            </ul>
          </div>

          <div class="summary-wrap">
            <h3>答卷汇总（已用于深度解析）</h3>
            <ul class="summary-list">
              <li
                v-for="(line, lineIndex) in analysisResult.summaryLines"
                :key="`${line}-${lineIndex}`"
                class="summary-item"
              >
                {{ line }}
              </li>
            </ul>
          </div>

          <van-button block class="btn btn-primary btn-block" @click="restartSurvey">
            重新测评
          </van-button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { showToast } from "vant";
import { QUESTION_BANK } from "./data/questionBank";
import { CITY_PROFILES } from "./data/cityProfiles";
import { analyzeCitiesLocally } from "./services/localAnalyzer";
import { analyzeCityWithAI } from "./services/aiAnalyzer";

/**
 * 页面阶段：
 * survey -> 问卷阶段
 * analyzing -> 汇总与 AI 分析阶段
 * result -> 结果展示阶段
 */
const stage = ref("survey");

/**
 * 问卷游标和答案状态。
 */
const currentQuestionIndex = ref(0);
const answers = ref(Array.from({ length: QUESTION_BANK.length }, () => null));

/**
 * 最终结果对象：
 * source: ai | local
 */
const analysisResult = ref(null);

/**
 * 题目总数。
 */
const questionCount = QUESTION_BANK.length;

/**
 * 当前题目。
 */
const currentQuestion = computed(() => QUESTION_BANK[currentQuestionIndex.value]);

/**
 * 是否为最后一题。
 */
const isLastQuestion = computed(
  () => currentQuestionIndex.value === QUESTION_BANK.length - 1,
);

/**
 * 当前题是否已作答。
 */
const canGoNext = computed(
  () => answers.value[currentQuestionIndex.value] !== null,
);

/**
 * 顶部进度百分比。
 */
const progressPercent = computed(() => {
  const doneCount = currentQuestionIndex.value + 1;
  return Math.round((doneCount / QUESTION_BANK.length) * 100);
});

/**
 * 顶部进度文案。
 */
const progressLabel = computed(
  () => `问题 ${currentQuestionIndex.value + 1} / ${QUESTION_BANK.length}`,
);

/**
 * 选择当前问题选项。
 * @param {string} optionId 选项 ID。
 */
function selectOption(optionId) {
  answers.value[currentQuestionIndex.value] = optionId;
}

/**
 * 回到上一题。
 */
function goPrev() {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
  }
}

/**
 * 构建 AI 输入负载。
 * @param {object} localResult 本地分析结果。
 * @returns {{ answerSummary: Array<object>, summaryLines: Array<string>, preferenceVector: object, candidateCities: Array<object>, localTopThree: Array<object> }} AI 接口负载。
 */
function buildAiPayload(localResult) {
  return {
    answerSummary: localResult.answerSummary,
    summaryLines: localResult.summaryLines,
    preferenceVector: localResult.preferenceVector,
    // 关键逻辑：仅传必要字段，控制提示词长度，降低接口延迟与成本。
    candidateCities: CITY_PROFILES.map((item) => ({
      name: item.name,
      profile: item.profile,
      traits: item.traits,
    })),
    localTopThree: localResult.topThree.map((item) => ({
      name: item.name,
      score: item.score,
      traits: item.traits,
    })),
  };
}

/**
 * 把 AI 输出和本地结果合并成统一渲染结构。
 * @param {object} aiResult AI 返回结果。
 * @param {object} localResult 本地分析结果。
 * @returns {{ source: string, topCity: object, topThree: Array<object>, insight: string, cityLifeAdvice: string, summaryLines: Array<string> }} 页面渲染结果。
 */
function mergeAiResult(aiResult, localResult) {
  return {
    source: "ai",
    topCity: aiResult.topCity,
    topThree: aiResult.topThree,
    insight: aiResult.insight,
    cityLifeAdvice: aiResult.cityLifeAdvice,
    summaryLines: localResult.summaryLines,
  };
}

/**
 * 下一步：
 * 1. 中间题：进入下一题。
 * 2. 最后一题：先本地分析，再调用百炼 AI 做最终结论。
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

  const localResult = analyzeCitiesLocally({
    questions: QUESTION_BANK,
    answerIds: answers.value,
    cities: CITY_PROFILES,
  });

  try {
    const aiResult = await analyzeCityWithAI(buildAiPayload(localResult), {
      timeoutMs: 18000,
    });

    analysisResult.value = mergeAiResult(aiResult, localResult);
  } catch (error) {
    // 关键逻辑：AI 不可用时自动回退，保证主流程不中断。
    analysisResult.value = {
      source: "local",
      topCity: { name: localResult.topCity.name, score: localResult.topCity.score },
      topThree: localResult.topThree.map((item) => ({
        name: item.name,
        score: item.score,
      })),
      insight: localResult.localInsight,
      cityLifeAdvice: "深度解析暂不可用，建议先按 Top3 城市做 1-3 个月短租试住验证。",
      summaryLines: localResult.summaryLines,
    };

    showToast(error?.message || "深度匹配失败，已切换为本地分析结果");
  }

  stage.value = "result";
}

/**
 * 重新开始问卷：
 * 清理答卷和结果状态。
 */
function restartSurvey() {
  currentQuestionIndex.value = 0;
  answers.value = Array.from({ length: QUESTION_BANK.length }, () => null);
  analysisResult.value = null;
  stage.value = "survey";
}
</script>
