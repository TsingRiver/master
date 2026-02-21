<template>
  <div
    class="typeology-page"
    :class="[
      activeTestConfig.effectClass,
      { 'typeology-page-perf-ready': isVisualEffectsReady },
    ]"
  >
    <div class="typeology-aura aura-left" aria-hidden="true"></div>
    <div class="typeology-aura aura-right" aria-hidden="true"></div>
    <div class="typeology-noise" aria-hidden="true"></div>

    <main class="typeology-shell" aria-live="polite">
      <header class="typeology-header">
        <div v-if="portalMode" class="typeology-hub-back-wrap">
          <a class="typeology-hub-back-link" :href="portalHomeHref">返回主题中心</a>
        </div>
        <p class="typeology-badge">TYPEOLOGY CARD</p>
        <h1>{{ activeTestConfig.heroTitle }}</h1>
        <p class="typeology-desc">{{ activeTestConfig.shortDescription }}</p>
      </header>

      <section class="typeology-hero-media" :style="activeHeroMediaStyle">
        <div class="typeology-hero-media-mask">
          <p>{{ activeVisualMeta.heroTitle }}</p>
          <span>{{ activeVisualMeta.heroTagline }}</span>
        </div>
      </section>

      <section class="typeology-test-switcher">
        <button
          v-for="testItem in orderedTests"
          :key="testItem.key"
          type="button"
          class="typeology-test-chip"
          :class="{ 'is-active': activeTestConfig.key === testItem.key }"
          @click="handleTestChipClick(testItem.key)"
        >
          {{ testItem.name }}
        </button>
      </section>

      <section
        v-if="stage === STAGE_HOME"
        class="typeology-panel typeology-start-panel"
      >
        <div class="typeology-start-title-wrap">
          <h2>{{ activeTestConfig.name }} · 选择测试版本</h2>
          <p>根据当前状态选择版本，按第一直觉作答即可，结果会更贴近真实倾向。</p>
        </div>

        <div class="typeology-mode-grid">
          <button
            v-for="modeItem in activeTestConfig.modes"
            :key="modeItem.key"
            type="button"
            class="typeology-mode-button"
            :class="{ 'is-selected': selectedModeKey === modeItem.key }"
            @click="selectMode(modeItem.key)"
          >
            <strong>{{ modeItem.label }}</strong>
            <span>基础题量：{{ modeItem.baseCount }} 题</span>
            <span>{{ buildModeRangeLabel(modeItem) }}</span>
          </button>
        </div>

        <van-button
          block
          class="typeology-btn typeology-btn-primary typeology-start-submit"
          @click="startCurrentTest"
        >
          开始 {{ activeTestConfig.name }}
        </van-button>
      </section>

      <section
        v-if="stage === STAGE_TESTING && currentQuestion"
        class="typeology-panel typeology-question-panel"
      >
        <div class="typeology-progress-meta">
          <span>{{ runningModeLabel }} · {{ progressLabel }}</span>
          <span>{{ progressPercent }}%</span>
        </div>

        <van-progress
          :percentage="progressPercent"
          :show-pivot="false"
          :stroke-width="8"
          :color="progressColor"
          :track-color="progressTrackColor"
        />

        <transition name="typeology-fade" mode="out-in">
          <div :key="currentQuestion.id" class="typeology-question-wrap">
            <p
              v-if="currentQuestion.contextLabel"
              class="typeology-question-context"
            >
              {{ currentQuestion.contextLabel }}
            </p>
            <h2>{{ displayQuestionTitle }}</h2>
            <p class="typeology-question-description">{{ currentQuestion.description }}</p>

            <van-radio-group
              :model-value="answers[currentQuestionIndex]"
              class="typeology-option-group"
            >
              <van-cell-group inset class="typeology-cell-group">
                <van-cell
                  v-for="optionItem in currentQuestion.options"
                  :key="optionItem.id"
                  :title="optionItem.label"
                  class="typeology-option"
                  :class="{
                    'typeology-option-selected':
                      answers[currentQuestionIndex] === optionItem.id,
                  }"
                  clickable
                  @click="handleOptionSelect(optionItem.id)"
                >
                  <template #right-icon>
                    <van-radio
                      :name="optionItem.id"
                      :checked-color="accentColor"
                      @click.stop="handleOptionSelect(optionItem.id)"
                    />
                  </template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </div>
        </transition>

        <div class="typeology-actions">
          <van-button
            block
            class="typeology-btn typeology-btn-secondary"
            :disabled="currentQuestionIndex === 0 || isNavigatingQuestion"
            @click="goPrevQuestion"
          >
            上一题
          </van-button>
        </div>

        <van-button
          block
          class="typeology-btn typeology-btn-ghost typeology-question-quit-btn"
          @click="quitCurrentTest"
        >
          退出本轮作答
        </van-button>
      </section>

      <section
        v-if="stage === STAGE_ANALYZING"
        class="typeology-panel typeology-loading-panel"
      >
        <van-loading :color="accentColor" size="30px" />
        <transition name="typeology-loading-swap" mode="out-in">
          <p :key="activeLoadingMessage">{{ activeLoadingMessage }}</p>
        </transition>
      </section>

      <section
        v-if="stage === STAGE_DETAIL && currentResult"
        class="typeology-panel typeology-detail-panel"
      >
        <div class="typeology-result-head">
          <p class="typeology-result-prefix">{{ currentResult.testName }} 主结果</p>
          <h2>{{ currentResult.mainResult.label }}</h2>
          <p class="typeology-result-score">
            匹配度：{{ currentResult.mainResult.score }}% · {{ currentResult.modeLabel }}
          </p>
        </div>

        <div class="typeology-highlight-box">
          <h3>结果摘要</h3>
          <p>
            {{ insightForView }}
            <span
              v-if="isAiInsightStreaming && aiStreamingNarrativeText"
              class="typeology-ai-cursor"
              aria-hidden="true"
            ></span>
          </p>
        </div>

        <div class="typeology-score-wrap">
          <h3>Top 3 匹配</h3>
          <ul class="typeology-score-list">
            <li
              v-for="(topItem, topIndex) in currentResult.topThree"
              :key="`${topItem.key}-${topIndex}`"
            >
              <span>{{ topIndex + 1 }}. {{ topItem.label }}</span>
              <span>{{ topItem.score }}%</span>
            </li>
          </ul>
        </div>

        <div class="typeology-detail-section">
          <h3>核心标签</h3>
          <ul
            v-if="isAiInsightStreaming && detailTagsForView.length === 0"
            class="typeology-bullet-list typeology-bullet-list-skeleton"
          >
            <li v-for="lineIndex in 3" :key="`tag-skeleton-${lineIndex}`">
              <span class="typeology-skeleton-line"></span>
            </li>
          </ul>
          <ul v-else class="typeology-bullet-list">
            <li
              v-for="(tagItem, tagIndex) in detailTagsForView"
              :key="`${tagItem}-${tagIndex}`"
            >
              {{ tagItem }}
              <span
                v-if="
                  isAiInsightStreaming &&
                  detailTagsForView.length > 0 &&
                  tagIndex === detailTagsForView.length - 1
                "
                class="typeology-ai-cursor"
                aria-hidden="true"
              ></span>
            </li>
          </ul>
        </div>

        <div class="typeology-detail-section">
          <h3>建议动作</h3>
          <ul
            v-if="isAiInsightStreaming && detailActionsForView.length === 0"
            class="typeology-bullet-list typeology-bullet-list-skeleton"
          >
            <li v-for="lineIndex in 3" :key="`action-skeleton-${lineIndex}`">
              <span class="typeology-skeleton-line"></span>
            </li>
          </ul>
          <ul v-else class="typeology-bullet-list">
            <li
              v-for="(actionItem, actionIndex) in detailActionsForView"
              :key="`${actionItem}-${actionIndex}`"
            >
              {{ actionItem }}
              <span
                v-if="
                  isAiInsightStreaming &&
                  detailActionsForView.length > 0 &&
                  actionIndex === detailActionsForView.length - 1
                "
                class="typeology-ai-cursor"
                aria-hidden="true"
              ></span>
            </li>
          </ul>
        </div>

        <div class="typeology-detail-section">
          <h3>
            答卷摘要 {{ showAllSummary ? "" : `（前 ${SUMMARY_PREVIEW_LIMIT} 条）` }}
          </h3>
          <ul class="typeology-bullet-list">
            <li
              v-for="(summaryItem, summaryIndex) in summaryLinesForView"
              :key="`${summaryItem}-${summaryIndex}`"
            >
              {{ summaryItem }}
            </li>
          </ul>
          <button
            v-if="currentResult.summaryLines.length > SUMMARY_PREVIEW_LIMIT"
            type="button"
            class="typeology-summary-toggle"
            @click="toggleSummary"
          >
            {{ showAllSummary ? "收起摘要" : "展开全部摘要" }}
          </button>
        </div>

        <div class="typeology-ai-section">
          <div class="typeology-ai-title-wrap">
            <h3>进阶解读</h3>
            <span v-if="currentResult.aiInsight?.generatedAt && !isAiInsightStreaming">
              {{
                formatTimestamp(currentResult.aiInsight.generatedAt)
              }}
            </span>
            <span v-else-if="isAiInsightStreaming" class="typeology-ai-stream-status">
              <van-loading :color="accentColor" size="14px" />
              AI 生成中
            </span>
          </div>

          <p v-if="!currentResult.aiInsight && !isAiInsightStreaming" class="typeology-ai-empty">
            可继续生成进阶解读，获得更细的优势、提醒和行动建议。
          </p>

          <template v-else-if="isAiInsightStreaming">
            <p class="typeology-ai-title">
              {{ currentResult.aiInsight?.title || "AI 正在生成你的专属解读" }}
              <span class="typeology-ai-cursor" aria-hidden="true"></span>
            </p>

            <p
              v-if="aiStreamingNarrativeText"
              class="typeology-ai-narrative"
            >
              {{ aiStreamingNarrativeText }}
              <span class="typeology-ai-cursor" aria-hidden="true"></span>
            </p>

            <div v-else class="typeology-ai-narrative-skeleton">
              <span class="typeology-skeleton-line is-wide"></span>
              <span class="typeology-skeleton-line"></span>
              <span class="typeology-skeleton-line is-short"></span>
            </div>

            <div class="typeology-ai-grid typeology-ai-grid-skeleton">
              <article v-for="sectionName in ['优势信号', '提醒信号', '行动建议']" :key="sectionName">
                <h4>{{ sectionName }}</h4>
                <ul class="typeology-skeleton-list">
                  <li v-for="lineIndex in 3" :key="`${sectionName}-${lineIndex}`">
                    <span class="typeology-skeleton-line"></span>
                  </li>
                </ul>
              </article>
            </div>
          </template>

          <template v-else>
            <p class="typeology-ai-title">{{ currentResult.aiInsight.title }}</p>
            <p class="typeology-ai-narrative">
              {{ currentResult.aiInsight.narrative }}
            </p>

            <div class="typeology-ai-grid">
              <article>
                <h4>优势信号</h4>
                <ul>
                  <li
                    v-for="(item, index) in currentResult.aiInsight.strengths"
                    :key="`strength-${index}`"
                  >
                    {{ item }}
                  </li>
                </ul>
              </article>
              <article>
                <h4>提醒信号</h4>
                <ul>
                  <li
                    v-for="(item, index) in currentResult.aiInsight.risks"
                    :key="`risk-${index}`"
                  >
                    {{ item }}
                  </li>
                </ul>
              </article>
              <article>
                <h4>行动建议</h4>
                <ul>
                  <li
                    v-for="(item, index) in currentResult.aiInsight.suggestions"
                    :key="`suggestion-${index}`"
                  >
                    {{ item }}
                  </li>
                </ul>
              </article>
            </div>
          </template>

          <van-button
            block
            class="typeology-btn typeology-btn-primary typeology-ai-generate-btn"
            :loading="isGeneratingAiInsight"
            loading-text="生成中..."
            @click="generateAiInsight"
          >
            AI解读
          </van-button>
        </div>

        <div class="typeology-actions">
          <van-button
            block
            class="typeology-btn typeology-btn-secondary"
            @click="restartCurrentType"
          >
            重新测试 {{ activeTestConfig.name }}
          </van-button>
          <van-button
            block
            class="typeology-btn typeology-btn-ghost"
            @click="backToHome"
          >
            返回测试面板
          </van-button>
        </div>
      </section>

      <section class="typeology-panel typeology-card-panel">
        <div class="typeology-module-head">
          <h2>我的类型学卡片</h2>
          <p>未测试显示占位符；已测试可直接进入详情。</p>
        </div>

        <div class="typeology-card-grid">
          <button
            v-for="cardItem in typeCardItems"
            :key="cardItem.testKey"
            type="button"
            class="typeology-card-item"
            :class="{ 'is-complete': cardItem.completed }"
            @click="handleCardClick(cardItem.testKey)"
          >
            <p class="typeology-card-value">{{ cardItem.displayValue }}</p>
            <p class="typeology-card-label">{{ cardItem.testName }}</p>
            <p class="typeology-card-status">
              {{ cardItem.completed ? "查看详情" : "去测试" }}
            </p>
          </button>
        </div>
      </section>

      <section class="typeology-panel typeology-knowledge-panel">
        <div class="typeology-module-head">
          <h2>类型简介与历史</h2>
          <p>仅展示当前选中的测试内容。</p>
        </div>

        <article class="typeology-knowledge-item">
          <div class="typeology-knowledge-media" :style="activeKnowledgeMediaStyle">
            <span>{{ activeVisualMeta.knowledgeTitle }}</span>
          </div>
          <h3>{{ activeTestConfig.name }}</h3>
          <p>{{ activeKnowledgeContent.moduleDescription }}</p>
          <p class="typeology-history">{{ activeKnowledgeContent.history }}</p>
          <button
            type="button"
            class="typeology-knowledge-link"
            @click="handleCardClick(activeTestConfig.key)"
          >
            {{ resultCache[activeTestConfig.key] ? "查看该测试结果" : "进入该测试" }}
          </button>
        </article>

        <article
          v-if="activeDeepGuide"
          class="typeology-knowledge-item typeology-deep-guide-panel"
        >
          <h3>{{ activeDeepGuide.title }}</h3>
          <p>{{ activeDeepGuide.intro }}</p>

          <div class="typeology-deep-guide-grid">
            <article
              v-for="snapshotItem in activeDeepGuide.snapshots"
              :key="`${activeTestConfig.key}-${snapshotItem.name}`"
              class="typeology-deep-guide-item"
            >
              <h4>{{ snapshotItem.name }}</h4>
              <p><strong>思维模式：</strong>{{ snapshotItem.thinkingPattern }}</p>
              <p><strong>情绪反应：</strong>{{ snapshotItem.emotionalPattern }}</p>
              <p><strong>行为习惯：</strong>{{ snapshotItem.behaviorPattern }}</p>
            </article>
          </div>
        </article>

        <article
          v-if="isEnneagramActive"
          class="typeology-knowledge-item enneagram-arcane-panel"
        >
          <h3>九型人格星盘</h3>
          <p>
            九型人格强调“动机”与“防御”。下方星盘用于展示 9 型结构；每型卡片覆盖思维模式、情绪反应、行为习惯三个观察维度。
          </p>

          <div class="enneagram-orbit-board">
            <div class="enneagram-orbit-stage">
              <svg
                class="enneagram-orbit-svg"
                viewBox="0 0 360 360"
                role="img"
                aria-label="九型人格星盘结构图"
              >
                <circle cx="180" cy="180" r="124" class="orbit-ring"></circle>

                <!-- 关键逻辑：外环 + 内部经典连接线，强化九型结构的玄幻感与辨识度。 -->
                <polyline
                  points="180,56 260,85 302,160 286,244 222,296 138,296 74,244 58,160 100,85 180,56"
                  class="orbit-outline"
                ></polyline>
                <polyline
                  points="260,85 222,296 302,160 100,85 138,296 58,160 260,85"
                  class="orbit-star"
                ></polyline>
                <polyline
                  points="180,56 286,244 74,244 180,56"
                  class="orbit-triangle"
                ></polyline>
                <circle cx="180" cy="180" r="42" class="orbit-core"></circle>
              </svg>

              <div
                v-for="profileItem in ENNEAGRAM_PROFILE_GUIDE"
                :key="`orbit-${profileItem.key}`"
                class="enneagram-orbit-node"
                :style="{
                  left: `${profileItem.orbitPosition.x}%`,
                  top: `${profileItem.orbitPosition.y}%`,
                }"
              >
                <span>{{ profileItem.shortName }}</span>
              </div>
            </div>
          </div>

          <div class="enneagram-profile-grid">
            <article
              v-for="profileItem in ENNEAGRAM_PROFILE_GUIDE"
              :key="`profile-${profileItem.key}`"
              class="enneagram-profile-item"
            >
              <h4>{{ profileItem.shortName }}</h4>
              <p><strong>思维模式：</strong>{{ profileItem.thinkingPattern }}</p>
              <p><strong>情绪反应：</strong>{{ profileItem.emotionalPattern }}</p>
              <p><strong>行为习惯：</strong>{{ profileItem.behaviorPattern }}</p>
            </article>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { showConfirmDialog, showToast } from "vant";
import {
  DEFAULT_TYPEOLOGY_TEST_KEY,
  TYPEOLOGY_TEST_ORDER,
  getTypeologyQuestionPool,
  getTypeologyTestConfig,
} from "../data/typeologyCatalog";
import {
  analyzeTypeologyLocally,
  buildTypeologyTestSession,
  resolveModeConfig,
} from "../services/typeologyAnalyzer";
import { analyzeTypeologyWithAi } from "../services/typeologyAiAnalyzer";
import {
  loadTypeologyResultCache,
  loadTypeologyProgressCache,
  removeTypeologyProgressCache,
  saveTypeologyProgressCache,
  upsertTypeologyCachedResult,
} from "../services/typeologyStorage";

/**
 * 摘要默认预览条数。
 */
const SUMMARY_PREVIEW_LIMIT = 3;

/**
 * 页面阶段常量。
 */
const STAGE_HOME = "home";
const STAGE_TESTING = "testing";
const STAGE_ANALYZING = "analyzing";
const STAGE_DETAIL = "detail";

/**
 * 作答进度缓存版本：
 * 关键逻辑：题库结构变化时可通过提升版本号让旧进度自动失效，避免恢复错题。
 */
// 关键逻辑：题库模式映射与题面变更后提升版本号，避免旧缓存恢复到错误题目。
const TYPEOLOGY_PROGRESS_SCHEMA_VERSION = 10;

/**
 * 进度缓存最小答题阈值。
 * 关键逻辑：答题少于该值时不保存，避免大量低价值碎片缓存。
 */
const TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT = 10;

/**
 * 类型学卡片默认展示顺序。
 * 关键逻辑：仅影响“我的类型学卡片”模块，不影响顶部测试切换顺序。
 */
const TYPEOLOGY_CARD_DEFAULT_ORDER = [
  "mbti",
  "enneagram",
  "holland",
  "attachment",
  "dnd-alignment",
  "big-five",
  "temperament",
  "social-persona",
  "ideal-match",
  "jung-classic",
  "disc",
  "attitude-psy",
];

/**
 * 九型人格扩展说明：
 * 关键逻辑：仅在当前类型为 enneagram 时渲染，避免其它类型页面信息过载。
 */
const ENNEAGRAM_PROFILE_GUIDE = [
  {
    key: "e1",
    shortName: "1号 完美型",
    thinkingPattern: "先校准规则与标准，再判断行为是否“正确”。",
    emotionalPattern: "面对混乱易紧绷，常被“应该”驱动情绪。",
    behaviorPattern: "习惯修正细节、优化流程，追求秩序一致。",
    orbitPosition: { x: 73, y: 12 },
  },
  {
    key: "e2",
    shortName: "2号 助人型",
    thinkingPattern: "先感知他人需求，思考如何连接与支持。",
    emotionalPattern: "被需要时温暖充盈，被忽视时易失落。",
    behaviorPattern: "主动照顾他人，常把关系和付出放在前面。",
    orbitPosition: { x: 88, y: 34 },
  },
  {
    key: "e3",
    shortName: "3号 成就型",
    thinkingPattern: "优先评估目标、效率与可见成果。",
    emotionalPattern: "对成败反馈敏感，胜利感驱动强。",
    behaviorPattern: "节奏快、执行强、擅长推进并展示成果。",
    orbitPosition: { x: 89, y: 55 },
  },
  {
    key: "e4",
    shortName: "4号 自我型",
    thinkingPattern: "先确认内在感受与意义，再决定投入方式。",
    emotionalPattern: "情绪体验深，容易在共鸣与落差间波动。",
    behaviorPattern: "重视独特表达与审美，追求真实感。",
    orbitPosition: { x: 74, y: 78 },
  },
  {
    key: "e5",
    shortName: "5号 观察型",
    thinkingPattern: "先观察和建模，确保理解后再行动。",
    emotionalPattern: "高干扰环境下倾向抽离，情绪表达克制。",
    behaviorPattern: "偏好独立空间、深度研究与低噪音决策。",
    orbitPosition: { x: 50, y: 91 },
  },
  {
    key: "e6",
    shortName: "6号 忠诚型",
    thinkingPattern: "先评估风险与后果，再决定是否承诺。",
    emotionalPattern: "不确定时警觉增强，确认边界后更安心。",
    behaviorPattern: "习惯准备备选方案，强调可靠与责任。",
    orbitPosition: { x: 26, y: 78 },
  },
  {
    key: "e7",
    shortName: "7号 活跃型",
    thinkingPattern: "先看可能性和空间，偏好多路径探索。",
    emotionalPattern: "厌恶受限，情绪偏乐观并快速切换。",
    behaviorPattern: "喜欢新鲜体验，行动轻快但容易分散。",
    orbitPosition: { x: 11, y: 55 },
  },
  {
    key: "e8",
    shortName: "8号 领袖型",
    thinkingPattern: "先看力量与边界，再决定掌控策略。",
    emotionalPattern: "受压时会迅速进入强势对抗状态。",
    behaviorPattern: "表达直接、行动果断，保护欲与掌控欲并存。",
    orbitPosition: { x: 12, y: 34 },
  },
  {
    key: "e9",
    shortName: "9号 和平型",
    thinkingPattern: "优先维持整体平衡，寻找共存方案。",
    emotionalPattern: "冲突中倾向降噪，情绪趋缓和与回避。",
    behaviorPattern: "温和包容、擅长调和，但易延后表达立场。",
    orbitPosition: { x: 50, y: 10 },
  },
];

/**
 * 类型学简介增强文案：
 * 关键逻辑：页面优先使用该用户向长文案，避免展示开发过程术语。
 */
const TYPEOLOGY_KNOWLEDGE_CONTENT_MAP = {
  mbti: {
    moduleDescription:
      "MBTI 主要观察你在信息获取、决策偏好和生活节奏上的自然倾向。它更像一面“沟通镜子”，帮助你理解自己在不同场景为什么会这样思考、这样表达、这样做选择。",
    history:
      "MBTI 由荣格心理类型理论发展而来，长期应用在团队协作、职业沟通和个人成长中。它不是对能力高低的评判，而是帮助你找到更顺手的学习方式、协作方式和决策方式。",
  },
  enneagram: {
    moduleDescription:
      "九型人格关注“内在动机”与“防御机制”，核心是理解你为何会重复某种反应模式。它不仅看行为表面，更看行为背后的需求、恐惧与价值守护点。",
    history:
      "九型人格常见于心理成长与教练场景，尤其适合用于自我觉察与关系沟通。通过识别主型与压力反应，你可以更快发现自己的惯性路径，并逐步建立更成熟、稳定的应对方式。",
  },
  "social-persona": {
    moduleDescription:
      "社会人格聚焦你在群体中的角色倾向，比如你更像发起者、连接者、观察者还是稳定器。它能帮助你理解在团队协作、人际边界与影响力表达中的自然站位。",
    history:
      "这类测评广泛用于组织协作优化与沟通训练，常见于团队盘点和管理发展项目。它的价值在于“看清自己怎么与人协作”，从而把优势放到最合适的位置上。",
  },
  "ideal-match": {
    moduleDescription:
      "理想型测试并不只谈“喜欢谁”，而是识别你在关系中真正需要的匹配维度。它会从节奏、安全感、冲突处理和价值观契合等角度，呈现你的关系偏好画像。",
    history:
      "理想型测评常用于关系咨询与自我探索，帮助区分“短期吸引”与“长期适配”。当你更清楚自己的关系机制时，通常也更容易建立稳定、轻松且有成长感的关系。",
  },
  "jung-classic": {
    moduleDescription:
      "经典荣格测试聚焦心理功能偏好，例如你更习惯先逻辑分析、先感受关系，还是先抓全局直觉。它能帮助你看见自己在思考、判断与表达上的底层运行方式。",
    history:
      "荣格类型学是现代人格理论的重要来源之一，后续多种类型模型都受到它的影响。它强调“偏好不等于上限”，目的不是贴标签，而是帮助你更有意识地使用和发展自己的功能组合。",
  },
  disc: {
    moduleDescription:
      "DISC 主要描述你在现实互动中的行为风格，比如面对压力时更果断推进、重关系感染、稳态协作或谨慎求证。它非常适合用于优化沟通语气、分工方式与协作节奏。",
    history:
      "DISC 在企业培训与团队管理中应用多年，强调行为差异是风格差异而非优劣差异。通过识别自己的风格，你可以更快找到“既高效又不内耗”的协作方式。",
  },
  "attitude-psy": {
    moduleDescription:
      "态度心理关注你在逻辑、情感、意志、体验四个维度上的优先顺位，也就是你遇事时“先用哪套系统”。这个模型能帮助你解释很多看似矛盾、但其实有规律的反应模式。",
    history:
      "态度心理常用于关系互动和决策风格研究，尤其适合做自我复盘。它的价值在于把抽象感受转成可观察的心理顺位，让你更容易做出可执行的调整。",
  },
  temperament: {
    moduleDescription:
      "体液气质测试用于识别你的情绪节奏与反应底色，如多血质、胆汁质、粘液质、抑郁质。它更接近日常状态观察，帮助你理解自己在压力、恢复和互动中的天然节拍。",
    history:
      "体液气质概念源于古典传统，现代多用于性格风格描述与自我观察。它不是医学诊断，也不是固定命运，而是一套帮助你理解“自己为何如此反应”的参考坐标。",
  },
  "big-five": {
    moduleDescription:
      "大五人格从开放性、尽责性、外向性、宜人性、情绪稳定性五个维度描述个体差异。它适合用于长期观察，因为能较稳定地呈现你在工作、学习与关系中的行为倾向。",
    history:
      "大五模型是现代心理学研究中使用最广的结构之一，拥有较多实证支持。它常用于教育、职业与组织场景，帮助人们用更客观的维度理解自己和他人的差异。",
  },
  "dnd-alignment": {
    moduleDescription:
      "DnD 阵营测试把价值选择放到“秩序-混乱”与“善良-功利”两个轴上，形成九宫格人格阵营。它适合观察你在规则、原则、利益与道德冲突中的选择偏向。",
    history:
      "该模型源于角色扮演体系，后来被广泛用于性格讨论和叙事创作。它更偏价值观镜像，不代表现实道德审判，重点是帮助你看见自己在关键抉择中的底层立场。",
  },
  attachment: {
    moduleDescription:
      "依恋类型测试聚焦亲密关系里的安全感来源、冲突反应与靠近方式。你会看到自己更偏安全、焦虑、回避还是拉扯型模式，以及这些模式如何影响关系体验。",
    history:
      "依恋理论在关系研究中影响深远，常用于解释情绪触发、沟通误会和修复路径。理解依恋风格的意义，不是自我否定，而是学会更稳定地表达需求与建立边界。",
  },
  holland: {
    moduleDescription:
      "霍兰德测试通过 RIASEC 六大兴趣维度，帮助你识别更有能量的工作任务和职业环境。它关注“你更愿意做什么、在哪类场景更容易进入状态”。",
    history:
      "霍兰德模型在职业测评与教育规划中应用成熟，常用于岗位探索与职业转向。它不是替你做决定，而是提供一个清晰坐标，帮助你做更匹配的职业选择。",
  },
};

/**
 * 类型学深度解读模板：
 * 关键逻辑：每个测试至少提供 4 组画像，统一输出“思维/情绪/行为”三视角说明。
 */
const TYPEOLOGY_DEEP_GUIDE_MAP = {
  mbti: {
    title: "MBTI 深入观察：四条轴如何影响日常",
    intro:
      "MBTI 不只是四个字母，它会在你处理信息、表达观点、安排节奏时持续体现。以下是常见画像，你可以对照自己在高压与放松状态下的差异。",
    snapshots: [
      {
        name: "外倾推进型（E偏高）",
        thinkingPattern: "通过互动来整理思路，讨论越充分，判断越清晰。",
        emotionalPattern: "被回应和被看见时能量上升，沉默环境会感到闷。",
        behaviorPattern: "更愿意先启动再优化，偏好公开协作与快速反馈。",
      },
      {
        name: "内倾深潜型（I偏高）",
        thinkingPattern: "先在脑内形成结构，再选择合适时机表达。",
        emotionalPattern: "需要独处恢复精力，噪音过高时容易耗竭。",
        behaviorPattern: "偏好深度专注和一对一沟通，决策前会先观察。",
      },
      {
        name: "直觉洞察型（N偏高）",
        thinkingPattern: "习惯从现象抽模式，先看长期趋势和可能性。",
        emotionalPattern: "面对新想法容易兴奋，重复流程会降低热情。",
        behaviorPattern: "常跨领域联想，喜欢探索新路径并快速迭代。",
      },
      {
        name: "感觉务实型（S偏高）",
        thinkingPattern: "优先依赖事实、经验和可验证信息。",
        emotionalPattern: "在边界清晰的任务中更安心，模糊场景易焦躁。",
        behaviorPattern: "重视步骤和落地执行，强调“先做成再扩展”。",
      },
    ],
  },
  enneagram: {
    title: "九型人格深入观察：动机与防御的循环",
    intro:
      "九型人格的重点是“你为什么会这样做”。当需求被满足时会更松弛，当核心担忧被触发时会进入防御。以下是常见状态切片。",
    snapshots: [
      {
        name: "秩序修正型（1号倾向）",
        thinkingPattern: "先判断对错与标准，再决定如何行动。",
        emotionalPattern: "遇到失序会紧绷，容易出现内在苛责。",
        behaviorPattern: "主动纠偏、优化流程，追求可持续改进。",
      },
      {
        name: "关系付出型（2号倾向）",
        thinkingPattern: "先感知他人需求，再思考如何提供支持。",
        emotionalPattern: "被需要时满足感高，被忽略时容易委屈。",
        behaviorPattern: "习惯主动帮助、维系关系，但可能忽略自己。",
      },
      {
        name: "目标成就型（3号倾向）",
        thinkingPattern: "优先关注结果、效率与可见成果。",
        emotionalPattern: "对成败反馈敏感，赢面会显著影响状态。",
        behaviorPattern: "执行节奏快，擅长目标拆解和外部展示。",
      },
      {
        name: "平衡调和型（9号倾向）",
        thinkingPattern: "先看整体和谐，再考虑个人立场表达。",
        emotionalPattern: "冲突会触发回避，安稳场景下更有耐心。",
        behaviorPattern: "擅长调和与缓冲，但可能推迟关键决策。",
      },
    ],
  },
  "social-persona": {
    title: "社会人格深入观察：你在群体中如何发力",
    intro:
      "社会人格看的是你在多人互动中的默认策略，包括你如何建立信任、推动协作、处理边界，以及在不同关系层级中的角色变化。",
    snapshots: [
      {
        name: "发起领航型",
        thinkingPattern: "先定方向再分配任务，习惯把复杂问题结构化。",
        emotionalPattern: "局面失控时会不耐烦，目标清晰时更自信。",
        behaviorPattern: "主动推进、承担责任，偏好“先跑起来”。",
      },
      {
        name: "关系连接型",
        thinkingPattern: "先对齐关系和语境，再讨论方案细节。",
        emotionalPattern: "氛围好时能量高，冷场与对立会明显消耗。",
        behaviorPattern: "擅长搭桥、协调、多方沟通与资源联结。",
      },
      {
        name: "冷静观察型",
        thinkingPattern: "先收集信息和信号，避免过早站队。",
        emotionalPattern: "面对情绪化争执会先降温，偏理性抽离。",
        behaviorPattern: "少说多看，关键时刻给出高质量判断。",
      },
      {
        name: "稳定托底型",
        thinkingPattern: "优先保证系统稳定和执行连续性。",
        emotionalPattern: "突发变化会先紧张，明确流程后迅速恢复。",
        behaviorPattern: "擅长补位、维护秩序，重视承诺兑现。",
      },
    ],
  },
  "ideal-match": {
    title: "理想型深入观察：关系偏好的底层机制",
    intro:
      "理想型不只是一眼心动，更是长期相处的匹配逻辑。你可以从“吸引点”“安全感来源”“冲突处理方式”三个角度识别自己的关系模式。",
    snapshots: [
      {
        name: "稳定共建型",
        thinkingPattern: "优先看价值观一致和长期生活兼容。",
        emotionalPattern: "确定性越高越安心，关系波动会触发防御。",
        behaviorPattern: "重视承诺、节奏和共同规划。",
      },
      {
        name: "高能吸引型",
        thinkingPattern: "先看化学反应和情绪张力，再看现实匹配。",
        emotionalPattern: "热度高时投入极快，降温时容易失落。",
        behaviorPattern: "表达直接、需要新鲜感，关系节奏起伏大。",
      },
      {
        name: "共同成长型",
        thinkingPattern: "强调彼此是否能互相激发与升级。",
        emotionalPattern: "看到共同进步会满足，停滞会焦虑。",
        behaviorPattern: "偏好目标协作、共同复盘与阶段突破。",
      },
      {
        name: "疗愈陪伴型",
        thinkingPattern: "先看是否被理解、被接住，再谈效率。",
        emotionalPattern: "共情和稳定回应会显著提升安全感。",
        behaviorPattern: "重视高质量陪伴，倾向慢热深度连接。",
      },
    ],
  },
  "jung-classic": {
    title: "荣格功能深入观察：你更常调用哪套系统",
    intro:
      "经典荣格关注心理功能的优先级。不同功能组合会影响你在“理解信息、形成判断、处理关系、执行行动”上的方式与节奏。",
    snapshots: [
      {
        name: "结构执行路径（Te/Si倾向）",
        thinkingPattern: "重视结构、标准与可执行流程。",
        emotionalPattern: "规则清晰时稳定，混乱失序时易紧绷。",
        behaviorPattern: "擅长制定步骤、推进落地与质量控制。",
      },
      {
        name: "逻辑建模路径（Ti/Ne倾向）",
        thinkingPattern: "偏好抽象推演和模型自洽。",
        emotionalPattern: "被粗糙结论打断时会烦躁，独立思考更舒适。",
        behaviorPattern: "爱拆解问题、探索多解、强调原理层理解。",
      },
      {
        name: "关系共振路径（Fe/Fi倾向）",
        thinkingPattern: "先看关系语境，再确定表达与决策方式。",
        emotionalPattern: "关系温度变化会直接影响状态。",
        behaviorPattern: "擅长共情与沟通调节，重视价值一致。",
      },
      {
        name: "直觉前瞻路径（Ni/Se倾向）",
        thinkingPattern: "在整体图景与现场信号间快速切换。",
        emotionalPattern: "灵感命中时兴奋，长期停滞时会焦躁。",
        behaviorPattern: "既能抓趋势，也能在关键节点迅速行动。",
      },
    ],
  },
  disc: {
    title: "DISC 深入观察：行为风格在压力中的变化",
    intro:
      "DISC 的价值在于你能看清自己“常态下怎么做”“高压下会变成什么样”。当你知道风格边界，就更容易做沟通和协作上的补位。",
    snapshots: [
      {
        name: "D 支配型",
        thinkingPattern: "优先结果与速度，快速做方向判断。",
        emotionalPattern: "受阻时容易上火，突破后恢复很快。",
        behaviorPattern: "果断推进、敢拍板，但需留意沟通压强。",
      },
      {
        name: "I 影响型",
        thinkingPattern: "先调动氛围和人心，再推进任务。",
        emotionalPattern: "被回应会兴奋，长期孤立会明显掉能量。",
        behaviorPattern: "表达强、感染力高，适合破冰与动员。",
      },
      {
        name: "S 稳健型",
        thinkingPattern: "优先维持稳定节奏和关系连续性。",
        emotionalPattern: "突变场景会紧张，熟悉环境中韧性很强。",
        behaviorPattern: "耐心、可靠、可持续输出，擅长托底。",
      },
      {
        name: "C 谨慎型",
        thinkingPattern: "先校验标准与风险，再做动作。",
        emotionalPattern: "不确定度过高会焦虑，信息充分会安心。",
        behaviorPattern: "重精度与规范，擅长质量与风险控制。",
      },
    ],
  },
  "attitude-psy": {
    title: "态度心理深入观察：你的优先顺位在说什么",
    intro:
      "态度心理的关键不是“你有什么”，而是“你先用什么”。优先顺位会直接影响你的沟通方式、冲突策略和决策节奏。",
    snapshots: [
      {
        name: "逻辑先行",
        thinkingPattern: "先看结构与因果，强调论证完整性。",
        emotionalPattern: "情绪化信息过多时会先抽离降噪。",
        behaviorPattern: "偏好理性讨论、模型拆解和规则表达。",
      },
      {
        name: "情感先行",
        thinkingPattern: "先看关系和感受，再判断可行性。",
        emotionalPattern: "对他人情绪波动敏感，易共振。",
        behaviorPattern: "重视共情表达、关系修复和温度管理。",
      },
      {
        name: "意志先行",
        thinkingPattern: "先定目标主线，再处理协商细节。",
        emotionalPattern: "拖延和失控会触发急躁与强推进。",
        behaviorPattern: "行动驱动明显，擅长攻坚与收口。",
      },
      {
        name: "体验先行",
        thinkingPattern: "先从体感和现实反馈判断对错。",
        emotionalPattern: "环境舒适度会直接影响情绪稳定。",
        behaviorPattern: "强调实感、可持续和生活化落地。",
      },
    ],
  },
  temperament: {
    title: "体液气质深入观察：你的情绪与行动节拍",
    intro:
      "体液气质更像“底色节奏图”。它不会定义你是谁，但能帮助你理解在不同压力强度下，你更容易出现哪种节拍和反应方式。",
    snapshots: [
      {
        name: "多血质节拍",
        thinkingPattern: "先看机会和趣味性，偏好轻快推进。",
        emotionalPattern: "情绪起落快，积极反馈能迅速点燃状态。",
        behaviorPattern: "社交活跃、表达外放、行动启动快。",
      },
      {
        name: "胆汁质节拍",
        thinkingPattern: "优先目标与掌控，强调结果导向。",
        emotionalPattern: "阻力会触发斗志，也容易出现急躁。",
        behaviorPattern: "推进力强、决断快，适合高压攻坚。",
      },
      {
        name: "粘液质节拍",
        thinkingPattern: "偏好稳定流程和长期持续。",
        emotionalPattern: "波动低、恢复稳，但变化期反应慢半拍。",
        behaviorPattern: "耐心托底、节奏均匀、协作稳定。",
      },
      {
        name: "抑郁质节拍",
        thinkingPattern: "重深度、重细节、重意义。",
        emotionalPattern: "体验更细腻，容易反复咀嚼感受。",
        behaviorPattern: "观察力强、审美高、适合深潜型任务。",
      },
    ],
  },
  "big-five": {
    title: "大五人格深入观察：五维如何组合成你的风格",
    intro:
      "大五人格看的是五个维度的组合，而不是单项高低。你可以把它理解为一张长期行为雷达：不同组合会形成不同的协作风格和生活节奏。",
    snapshots: [
      {
        name: "高开放 + 高尽责",
        thinkingPattern: "既能创新发散，也能结构化收口。",
        emotionalPattern: "对新事物有热情，但也在意执行质量。",
        behaviorPattern: "适合做从0到1并持续迭代的任务。",
      },
      {
        name: "高外向 + 高宜人",
        thinkingPattern: "重互动与共识，善于在关系中推进目标。",
        emotionalPattern: "社会反馈会明显影响状态与动力。",
        behaviorPattern: "擅长沟通、组织与资源协同。",
      },
      {
        name: "高尽责 + 高稳定",
        thinkingPattern: "偏流程与责任，重预期可控性。",
        emotionalPattern: "在秩序清晰的环境里最稳定高效。",
        behaviorPattern: "执行可靠、抗压稳，适合关键托底位。",
      },
      {
        name: "高开放 + 高敏感",
        thinkingPattern: "创意丰富且感知细腻，关注深层意义。",
        emotionalPattern: "对环境和关系信号更敏锐。",
        behaviorPattern: "适合创作、洞察、策略和精细表达。",
      },
    ],
  },
  "dnd-alignment": {
    title: "DnD 阵营深入观察：价值选择如何落到行为",
    intro:
      "阵营模型的重点是价值取向，而非道德评判。你可以观察自己在规则冲突、利益冲突、善恶冲突时，最自然会站在哪一侧。",
    snapshots: [
      {
        name: "守序善良",
        thinkingPattern: "先看规则合法性，再看是否有利他价值。",
        emotionalPattern: "不公会触发强烈责任感与修复冲动。",
        behaviorPattern: "重制度与公义，偏好可复制的善意实践。",
      },
      {
        name: "中立善良",
        thinkingPattern: "优先“结果是否真正有帮助”。",
        emotionalPattern: "对真实痛点敏感，能共情也能执行。",
        behaviorPattern: "灵活调度资源，为达成善意结果服务。",
      },
      {
        name: "混乱中立",
        thinkingPattern: "优先个人自由与情境适配。",
        emotionalPattern: "被过度约束时会明显抗拒。",
        behaviorPattern: "风格机动，喜欢探索非标准路径。",
      },
      {
        name: "守序中立",
        thinkingPattern: "先保系统稳定，再讨论个体偏好。",
        emotionalPattern: "秩序被破坏时焦虑上升。",
        behaviorPattern: "重流程与边界，擅长制度执行与维护。",
      },
    ],
  },
  attachment: {
    title: "依恋类型深入观察：亲密关系中的默认脚本",
    intro:
      "依恋模式决定你在亲密关系里如何靠近、如何防御、如何修复。理解自己的默认脚本后，你会更容易用“清晰表达”替代“反复内耗”。",
    snapshots: [
      {
        name: "安全型",
        thinkingPattern: "能在亲密和边界之间保持平衡。",
        emotionalPattern: "冲突中有波动，但能较快回到沟通。",
        behaviorPattern: "愿意表达需求，也能接纳对方差异。",
      },
      {
        name: "焦虑型",
        thinkingPattern: "持续确认关系信号，担心失联或被忽视。",
        emotionalPattern: "不确定时警觉升高，易反复揣测。",
        behaviorPattern: "高投入高敏感，常通过追问寻求确定性。",
      },
      {
        name: "回避型",
        thinkingPattern: "强调独立与边界，避免情绪卷入。",
        emotionalPattern: "关系过近时会出现防御和抽离。",
        behaviorPattern: "倾向理性表达，脆弱感外显较少。",
      },
      {
        name: "恐惧型",
        thinkingPattern: "既渴望靠近又担心受伤，内在拉扯明显。",
        emotionalPattern: "关系波动时情绪起伏更大。",
        behaviorPattern: "靠近与撤退交替，需要更稳的安全框架。",
      },
    ],
  },
  holland: {
    title: "霍兰德深入观察：兴趣类型如何映射职业场景",
    intro:
      "霍兰德模型重在“兴趣能量匹配”。当岗位环境与你的兴趣代码一致时，通常更容易持续投入并形成长期成长。",
    snapshots: [
      {
        name: "现实/研究导向（R/I）",
        thinkingPattern: "偏好问题拆解和实证验证。",
        emotionalPattern: "在可操作、可验证任务里更有安全感。",
        behaviorPattern: "擅长动手、分析、优化与技术深耕。",
      },
      {
        name: "艺术/社会导向（A/S）",
        thinkingPattern: "重创意表达与他人感受链接。",
        emotionalPattern: "高共鸣场景会显著提升投入度。",
        behaviorPattern: "适合内容创作、设计表达、咨询助人。",
      },
      {
        name: "企业/常规导向（E/C）",
        thinkingPattern: "强调目标推进和系统组织。",
        emotionalPattern: "成果可见且流程可控时状态更稳。",
        behaviorPattern: "擅长管理、协调、运营与规则执行。",
      },
      {
        name: "混合型兴趣组合",
        thinkingPattern: "跨维度切换能力强，适应面更广。",
        emotionalPattern: "对单一重复场景耐受度相对较低。",
        behaviorPattern: "适合复合岗位与跨职能协作路径。",
      },
    ],
  },
};

/**
 * 类型学视觉资源配置：
 * 1. 每种测试可绑定独立视觉图。
 * 2. 页面会将视觉图应用到头图与简介区，强化主题识别。
 */
const TYPEOLOGY_VISUAL_ASSET_MAP = {
  default: {
    imagePath: "/type-images/type-default.svg",
    heroTitle: "类型学探索场",
    heroTagline: "从题目到画像，看到更稳定的自己",
    knowledgeTitle: "主题视觉卡",
  },
  mbti: {
    imagePath: "/type-images/mbti.svg",
    heroTitle: "认知维度正在展开",
    heroTagline: "看见你在信息、判断与节奏上的天然偏好",
    knowledgeTitle: "MBTI 认知谱系",
  },
  enneagram: {
    imagePath: "/type-images/enneagram.svg",
    heroTitle: "九型星盘已点亮",
    heroTagline: "动机、防御与成长路径正在显现",
    knowledgeTitle: "九型人格星盘",
  },
  "social-persona": {
    imagePath: "/type-images/social.svg",
    heroTitle: "社会角色画像",
    heroTagline: "识别你在群体中的影响方式与协作站位",
    knowledgeTitle: "社会人格映射",
  },
  "ideal-match": {
    imagePath: "/type-images/ideal.svg",
    heroTitle: "关系偏好图谱",
    heroTagline: "看见你真正看重的长期匹配维度",
    knowledgeTitle: "理想型关系图",
  },
  "jung-classic": {
    imagePath: "/type-images/jung.svg",
    heroTitle: "心理功能矩阵",
    heroTagline: "理解你的思维与感受系统如何联动",
    knowledgeTitle: "荣格功能图",
  },
  disc: {
    imagePath: "/type-images/disc.svg",
    heroTitle: "行为风格坐标",
    heroTagline: "在推进、沟通与协作中找到你的优势位",
    knowledgeTitle: "DISC 行为盘",
  },
  "attitude-psy": {
    imagePath: "/type-images/attitude.svg",
    heroTitle: "态度顺位模型",
    heroTagline: "识别你遇事时最先启动的心理系统",
    knowledgeTitle: "态度心理图",
  },
  temperament: {
    imagePath: "/type-images/temperament.svg",
    heroTitle: "气质节奏曲线",
    heroTagline: "观察你的情绪与行动节拍如何变化",
    knowledgeTitle: "体液气质图",
  },
  "big-five": {
    imagePath: "/type-images/bigfive.svg",
    heroTitle: "五维人格雷达",
    heroTagline: "用更稳定的维度理解你的行为特征",
    knowledgeTitle: "大五人格图",
  },
  "dnd-alignment": {
    imagePath: "/type-images/dnd.svg",
    heroTitle: "阵营价值坐标",
    heroTagline: "规则、善恶、自由之间，你会如何抉择",
    knowledgeTitle: "阵营星域图",
  },
  attachment: {
    imagePath: "/type-images/attachment.svg",
    heroTitle: "依恋关系镜像",
    heroTagline: "理解你在亲密关系里的靠近与防御方式",
    knowledgeTitle: "依恋模式图",
  },
  holland: {
    imagePath: "/type-images/holland.svg",
    heroTitle: "职业兴趣航图",
    heroTagline: "找到让你更有能量的任务与岗位环境",
    knowledgeTitle: "霍兰德兴趣图",
  },
};

/**
 * 组件参数。
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
 * 当前测试状态。
 */
const stage = ref(STAGE_HOME);

/**
 * 首屏视觉增强开关：
 * 关键逻辑：首帧先渲染关键文本与测试入口，再启用光效与滤镜，降低首屏合成压力。
 */
const isVisualEffectsReady = ref(false);
const activeTestKey = ref(DEFAULT_TYPEOLOGY_TEST_KEY);
const selectedModeKey = ref("");
const runningModeConfig = ref(null);
const questionBank = ref([]);
const answers = ref([]);
const currentQuestionIndex = ref(0);
const currentResult = ref(null);
const resultCache = ref(loadTypeologyResultCache());
const showAllSummary = ref(false);
const isGeneratingAiInsight = ref(false);
const isAiInsightStreaming = ref(false);
const aiInsightStreamRawText = ref("");
/**
 * 答题跳转锁：
 * 关键逻辑：避免用户连续点击导致同一道题触发多次跳转或重复提交。
 */
const isNavigatingQuestion = ref(false);

/**
 * 加载文案轮播状态。
 */
const loadingMessageIndex = ref(0);
let loadingTickerTimer = null;

/**
 * 计算测试顺序列表。
 * 关键逻辑：通过顺序配置映射测试定义，避免组件内部写死测试数组。
 */
const orderedTests = computed(() =>
  TYPEOLOGY_TEST_ORDER.map((testKey) => getTypeologyTestConfig(testKey)).filter(
    Boolean,
  ),
);

/**
 * 当前激活测试配置。
 */
const activeTestConfig = computed(
  () =>
    getTypeologyTestConfig(activeTestKey.value) ??
    orderedTests.value[0] ??
    props.themeConfig,
);

/**
 * 当前运行模式标题。
 */
const runningModeLabel = computed(
  () =>
    runningModeConfig.value?.label ??
    resolveModeConfig(activeTestConfig.value, selectedModeKey.value)?.label ??
    "测试模式",
);

/**
 * 当前题目。
 */
const currentQuestion = computed(
  () => questionBank.value[currentQuestionIndex.value],
);

/**
 * 解析题目核心陈述句（默认短句展示）。
 * 关键逻辑：
 * 1. 有场景标签时，优先取冒号后的核心句。
 * 2. 无冒号时尝试剥离“xx时，”场景前缀，保留可直接作答内容。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {object|null|undefined} questionItem 当前题目对象。
 * @returns {string} 核心陈述句。
 */
function resolveQuestionCoreTitle(questionItem) {
  const rawTitle = String(questionItem?.title ?? "").trim();
  if (!rawTitle) {
    return "";
  }

  const hasContextLabel = String(questionItem?.contextLabel ?? "").trim().length > 0;
  if (!hasContextLabel) {
    return rawTitle;
  }

  const colonIndex = Math.max(rawTitle.lastIndexOf("："), rawTitle.lastIndexOf(":"));
  if (colonIndex >= 0 && colonIndex < rawTitle.length - 1) {
    return rawTitle.slice(colonIndex + 1).trim();
  }

  const scenePrefixPattern = /^[^，。]{2,24}(?:时|后|里)，/;
  const compactTitle = rawTitle.replace(scenePrefixPattern, "").trim();
  return compactTitle || rawTitle;
}

/**
 * 提取题干中的场景短语。
 * 关键逻辑：用于“短句重复”时做轻量区分显示，避免同轮出现视觉重复题面。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 场景短语，例如“需要说服他人时”。
 */
function resolveQuestionSceneTitle(rawTitle) {
  const normalizedTitle = String(rawTitle ?? "").trim();
  if (!normalizedTitle) {
    return "";
  }

  const sceneMatch = normalizedTitle.match(/^([^，。:：]{2,24}(?:时|后|里))/);
  return sceneMatch?.[1] ?? "";
}

/**
 * 为当前会话构建“最终展示题干”映射。
 * 关键逻辑：
 * 1. 默认用核心短句。
 * 2. 若短句在同轮重复，则加“场景 · 短句”。
 * 3. 若仍重复，则回退原题干，最终保证展示唯一性。
 * 复杂度评估：O(N * L)，N 为题量，L 为题干平均长度。
 * @param {Array<object>} questionList 本轮题目列表。
 * @returns {Map<string, string>} key=questionId, value=展示题干。
 */
function buildDisplayQuestionTitleMap(questionList) {
  const safeQuestionList = Array.isArray(questionList) ? questionList : [];
  const questionMetaById = new Map();
  const coreTitleCountMap = new Map();
  const displayTitleMap = new Map();

  safeQuestionList.forEach((questionItem) => {
    const questionId = String(questionItem?.id ?? "").trim();
    if (!questionId) {
      return;
    }

    const rawTitle = String(questionItem?.title ?? "").trim();
    const coreTitle = resolveQuestionCoreTitle(questionItem) || rawTitle;
    const sceneTitle = resolveQuestionSceneTitle(rawTitle);
    questionMetaById.set(questionId, {
      rawTitle,
      coreTitle,
      sceneTitle,
    });

    coreTitleCountMap.set(coreTitle, (coreTitleCountMap.get(coreTitle) ?? 0) + 1);
    displayTitleMap.set(questionId, coreTitle);
  });

  const sceneDisplayCountMap = new Map();
  displayTitleMap.forEach((displayTitle, questionId) => {
    if ((coreTitleCountMap.get(displayTitle) ?? 0) <= 1) {
      return;
    }

    const questionMeta = questionMetaById.get(questionId);
    if (!questionMeta) {
      return;
    }

    const sceneDisplayTitle =
      questionMeta.sceneTitle && questionMeta.coreTitle
        ? `${questionMeta.sceneTitle} · ${questionMeta.coreTitle}`
        : questionMeta.rawTitle || questionMeta.coreTitle;
    displayTitleMap.set(questionId, sceneDisplayTitle);
    sceneDisplayCountMap.set(
      sceneDisplayTitle,
      (sceneDisplayCountMap.get(sceneDisplayTitle) ?? 0) + 1,
    );
  });

  // 关键逻辑：二次兜底，若“场景 · 短句”仍撞车，则回退完整原题干。
  displayTitleMap.forEach((displayTitle, questionId) => {
    if ((sceneDisplayCountMap.get(displayTitle) ?? 0) <= 1) {
      return;
    }

    const questionMeta = questionMetaById.get(questionId);
    if (!questionMeta) {
      return;
    }

    displayTitleMap.set(questionId, questionMeta.rawTitle || displayTitle);
  });

  return displayTitleMap;
}

/**
 * 当前会话展示题干映射。
 */
const displayQuestionTitleMap = computed(() =>
  buildDisplayQuestionTitleMap(questionBank.value),
);

/**
 * 当前题目展示标题。
 */
const displayQuestionTitle = computed(() => {
  const questionId = String(currentQuestion.value?.id ?? "").trim();
  if (!questionId) {
    return resolveQuestionCoreTitle(currentQuestion.value);
  }

  return (
    displayQuestionTitleMap.value.get(questionId) ??
    resolveQuestionCoreTitle(currentQuestion.value)
  );
});

/**
 * 进度百分比。
 */
const progressPercent = computed(() => {
  if (questionBank.value.length === 0) {
    return 0;
  }

  return Math.round(
    ((currentQuestionIndex.value + 1) / questionBank.value.length) * 100,
  );
});

/**
 * 进度文案。
 */
const progressLabel = computed(
  () => `问题 ${currentQuestionIndex.value + 1} / ${questionBank.value.length}`,
);

/**
 * 加载文案列表。
 */
const loadingMessages = computed(() => [
  `正在整理「${activeTestConfig.value.name}」答卷...`,
  `正在匹配「${activeTestConfig.value.name}」类型谱系...`,
  "正在生成你的类型学卡片...",
]);

/**
 * 当前加载文案。
 */
const activeLoadingMessage = computed(
  () => loadingMessages.value[loadingMessageIndex.value] ?? "正在生成中...",
);

/**
 * 当前主题色。
 */
const accentColor = computed(() => {
  const testKey = activeTestConfig.value.key;
  const colorMap = {
    mbti: "#ef6b84",
    // 关键逻辑：九型人格使用星盘同系粉紫色，保证整页视觉一致。
    enneagram: "#ff5ca8",
    "social-persona": "#23a37f",
    "ideal-match": "#ff7e6f",
    "jung-classic": "#00a0a8",
    disc: "#e67e22",
    "attitude-psy": "#8f62e8",
    temperament: "#d65b7f",
    "big-five": "#2f9ed9",
    "dnd-alignment": "#9465d3",
    attachment: "#5e91f4",
    holland: "#3baf76",
  };
  return colorMap[testKey] ?? "#4a67ff";
});

/**
 * 当前进度条渐变色。
 */
const progressColor = computed(
  () => `linear-gradient(90deg, ${accentColor.value}, rgba(255,255,255,0.85))`,
);

/**
 * 当前进度条轨道色。
 */
const progressTrackColor = computed(() => "rgba(255, 255, 255, 0.18)");

/**
 * 卡片列表渲染数据。
 * 复杂度评估：O(N)，N 为测试类型数量（当前固定 12）。
 */
const typeCardItems = computed(() => {
  const orderedTestMap = new Map(orderedTests.value.map((testItem) => [testItem.key, testItem]));
  const defaultOrderedTests = [];

  TYPEOLOGY_CARD_DEFAULT_ORDER.forEach((testKey) => {
    const matchedTest = orderedTestMap.get(testKey);
    if (matchedTest) {
      defaultOrderedTests.push(matchedTest);
      orderedTestMap.delete(testKey);
    }
  });

  orderedTestMap.forEach((testItem) => {
    defaultOrderedTests.push(testItem);
  });

  const completedCards = [];
  const pendingCards = [];

  defaultOrderedTests.forEach((testItem) => {
    const cachedResult = resultCache.value[testItem.key];
    const normalizedCardItem = {
      testKey: testItem.key,
      testName: testItem.name,
      completed: Boolean(cachedResult),
      displayValue: cachedResult?.displayValue ?? "待测试",
    };

    if (normalizedCardItem.completed) {
      completedCards.push(normalizedCardItem);
      return;
    }

    pendingCards.push(normalizedCardItem);
  });

  // 关键逻辑：已完成卡片优先展示；若全部完成则仍保持默认顺序。
  return [...completedCards, ...pendingCards];
});

/**
 * 当前结果摘要展示列表。
 */
const summaryLinesForView = computed(() => {
  const fullSummaryLines = currentResult.value?.summaryLines ?? [];
  return showAllSummary.value
    ? fullSummaryLines
    : fullSummaryLines.slice(0, SUMMARY_PREVIEW_LIMIT);
});

/**
 * AI 流式预览文本：
 * 关键逻辑：优先提取 narrative / insight 字段，避免把半截 JSON 直接展示给用户。
 */
const aiStreamingNarrativeText = computed(() =>
  resolveAiNarrativePreviewText(aiInsightStreamRawText.value),
);

/**
 * AI 流式核心标签预览。
 */
const aiStreamingTagPreview = computed(() =>
  extractStringArrayPreviewFromJsonStream(aiInsightStreamRawText.value, "strengths", 3),
);

/**
 * AI 流式建议动作预览。
 */
const aiStreamingActionPreview = computed(() =>
  extractStringArrayPreviewFromJsonStream(aiInsightStreamRawText.value, "suggestions", 3),
);

/**
 * 结果摘要视图文案：
 * 关键逻辑：流式期间优先显示 AI 叙事预览，完成后显示已落盘结果。
 */
const insightForView = computed(() => {
  if (isAiInsightStreaming.value && aiStreamingNarrativeText.value) {
    return aiStreamingNarrativeText.value;
  }

  return currentResult.value?.insight ?? "";
});

/**
 * 核心标签视图数据：
 * 关键逻辑：流式期间优先显示 AI 预览，完成后优先显示 AI strengths。
 */
const detailTagsForView = computed(() => {
  if (isAiInsightStreaming.value && aiStreamingTagPreview.value.length > 0) {
    return aiStreamingTagPreview.value;
  }

  const aiTagList = currentResult.value?.aiInsight?.strengths;
  if (Array.isArray(aiTagList) && aiTagList.length > 0) {
    return aiTagList;
  }

  return currentResult.value?.detailTags ?? [];
});

/**
 * 建议动作视图数据：
 * 关键逻辑：流式期间优先显示 AI 预览，完成后优先显示 AI suggestions。
 */
const detailActionsForView = computed(() => {
  if (isAiInsightStreaming.value && aiStreamingActionPreview.value.length > 0) {
    return aiStreamingActionPreview.value;
  }

  const aiSuggestionList = currentResult.value?.aiInsight?.suggestions;
  if (Array.isArray(aiSuggestionList) && aiSuggestionList.length > 0) {
    return aiSuggestionList;
  }

  return currentResult.value?.detailActions ?? [];
});

/**
 * 当前类型的简介与历史文案：
 * 关键逻辑：优先使用增强文案，缺失时回退配置原文案，保证所有类型都有内容。
 */
const activeKnowledgeContent = computed(() => {
  const fallbackContent = {
    moduleDescription: activeTestConfig.value?.moduleDescription ?? "",
    history: activeTestConfig.value?.history ?? "",
  };

  return (
    TYPEOLOGY_KNOWLEDGE_CONTENT_MAP[activeTestConfig.value?.key] ??
    fallbackContent
  );
});

/**
 * 当前类型的结构化深度解读。
 */
const activeDeepGuide = computed(
  () => TYPEOLOGY_DEEP_GUIDE_MAP[activeTestConfig.value?.key] ?? null,
);

/**
 * 当前类型对应的视觉配置。
 */
const activeVisualMeta = computed(
  () =>
    TYPEOLOGY_VISUAL_ASSET_MAP[activeTestConfig.value?.key] ??
    TYPEOLOGY_VISUAL_ASSET_MAP.default,
);

/**
 * 头部视觉图样式。
 * 关键逻辑：使用本地 SVG 作为背景图，避免外链资源不稳定。
 */
const activeHeroMediaStyle = computed(() => ({
  backgroundImage: `linear-gradient(130deg, color-mix(in srgb, ${accentColor.value} 35%, transparent), transparent 48%), url('${activeVisualMeta.value.imagePath}')`,
}));

/**
 * 简介区视觉图样式。
 */
const activeKnowledgeMediaStyle = computed(() => ({
  backgroundImage: `linear-gradient(125deg, color-mix(in srgb, ${accentColor.value} 22%, rgba(8,10,20,0.25)), rgba(8,10,20,0.15)), url('${activeVisualMeta.value.imagePath}')`,
}));

/**
 * 当前是否为九型人格测试。
 */
const isEnneagramActive = computed(
  () => activeTestConfig.value?.key === "enneagram",
);

/**
 * 睡眠函数，用于保证“生成中”动画有可见停留时间。
 * @param {number} milliseconds 等待毫秒数。
 * @returns {Promise<void>} Promise 对象。
 */
function sleep(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

/**
 * AI 流式预览刷新间隔（毫秒）。
 * 关键逻辑：对流式回调做节流，避免高频 DOM 更新影响交互流畅度。
 */
const AI_STREAM_PREVIEW_FLUSH_INTERVAL_MS = 80;

/**
 * 当前 AI 请求会话令牌。
 * 关键逻辑：新请求会递增令牌，旧请求回调自动失效，避免串流写入错位。
 */
let aiInsightRequestSessionToken = 0;

/**
 * 当前 AI 请求取消控制器。
 */
let aiInsightRequestController = null;

/**
 * AI 预览节流定时器。
 */
let aiInsightPreviewFlushTimer = null;

/**
 * AI 预览待刷新的原始文本。
 */
let aiInsightPendingPreviewText = "";

/**
 * 清理 AI 预览节流定时器。
 */
function clearAiInsightPreviewFlushTimer() {
  if (aiInsightPreviewFlushTimer) {
    window.clearTimeout(aiInsightPreviewFlushTimer);
    aiInsightPreviewFlushTimer = null;
  }
}

/**
 * 立即刷新 AI 预览文本到响应式状态。
 */
function flushAiInsightPreviewText() {
  clearAiInsightPreviewFlushTimer();
  aiInsightStreamRawText.value = aiInsightPendingPreviewText;
}

/**
 * 节流写入 AI 预览文本。
 * 复杂度评估：O(1)，仅覆盖缓存并等待下一次定时刷新。
 * @param {string} nextRawText 最新累计文本。
 */
function scheduleAiInsightPreviewText(nextRawText) {
  aiInsightPendingPreviewText = String(nextRawText ?? "");
  if (aiInsightPreviewFlushTimer) {
    return;
  }

  aiInsightPreviewFlushTimer = window.setTimeout(() => {
    aiInsightPreviewFlushTimer = null;
    aiInsightStreamRawText.value = aiInsightPendingPreviewText;
  }, AI_STREAM_PREVIEW_FLUSH_INTERVAL_MS);
}

/**
 * 解码 JSON 字符串片段（允许缺失末尾引号的流式中间态）。
 * 复杂度评估：O(L)，L 为片段长度。
 * @param {string} rawSegment JSON 字符串片段。
 * @returns {string} 解码后的文本。
 */
function decodePartialJsonStringSegment(rawSegment) {
  const normalizedSegment = String(rawSegment ?? "");
  if (!normalizedSegment) {
    return "";
  }

  const safeSegment = normalizedSegment
    .replace(/\\u[0-9a-fA-F]{0,3}$/g, "")
    .replace(/\\$/g, "");

  try {
    return JSON.parse(`"${safeSegment}"`);
  } catch {
    return safeSegment
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}

/**
 * 从流式 JSON 文本中提取字段值预览。
 * 关键逻辑：字段可能尚未闭合，提取时只做“前缀可读”展示。
 * 复杂度评估：O(L)，L 为当前累计文本长度。
 * @param {string} streamRawText 流式累计文本。
 * @param {string} fieldName 目标字段名。
 * @returns {string} 字段预览文本。
 */
function extractFieldPreviewFromJsonStream(streamRawText, fieldName) {
  const normalizedText = String(streamRawText ?? "");
  if (!normalizedText) {
    return "";
  }

  const fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)`, "i");
  const matchedResult = normalizedText.match(fieldPattern);
  if (!matchedResult?.[1]) {
    return "";
  }

  return decodePartialJsonStringSegment(matchedResult[1]);
}

/**
 * 生成 AI 流式叙事预览文本。
 * 关键逻辑：
 * 1. 通用类型优先读取 narrative；
 * 2. MBTI 深度结果优先读取 insight；
 * 3. 若字段尚未产出则返回空字符串，由骨架屏占位。
 * @param {string} streamRawText 流式累计文本。
 * @returns {string} 可展示叙事文本。
 */
function resolveAiNarrativePreviewText(streamRawText) {
  const narrativePreview = extractFieldPreviewFromJsonStream(streamRawText, "narrative");
  if (narrativePreview) {
    return narrativePreview;
  }

  return extractFieldPreviewFromJsonStream(streamRawText, "insight");
}

/**
 * 从流式 JSON 文本中提取字符串数组字段预览。
 * 关键逻辑：允许数组尚未闭合时提取已返回项，提升“边生成边可读”的即时感。
 * 复杂度评估：O(L)，L 为当前累计文本长度。
 * @param {string} streamRawText 流式累计文本。
 * @param {string} fieldName 字段名。
 * @param {number} limit 最大返回条数。
 * @returns {Array<string>} 可展示字符串数组。
 */
function extractStringArrayPreviewFromJsonStream(streamRawText, fieldName, limit) {
  const normalizedText = String(streamRawText ?? "");
  if (!normalizedText) {
    return [];
  }

  const fieldAnchor = `"${fieldName}"`;
  const fieldStartIndex = normalizedText.indexOf(fieldAnchor);
  if (fieldStartIndex < 0) {
    return [];
  }

  const bracketStartIndex = normalizedText.indexOf("[", fieldStartIndex + fieldAnchor.length);
  if (bracketStartIndex < 0) {
    return [];
  }

  const parsedItemList = [];
  let isInString = false;
  let isEscaped = false;
  let currentItemRaw = "";

  for (let index = bracketStartIndex + 1; index < normalizedText.length; index += 1) {
    const currentChar = normalizedText[index];

    if (isInString) {
      if (isEscaped) {
        currentItemRaw += currentChar;
        isEscaped = false;
        continue;
      }

      if (currentChar === "\\") {
        currentItemRaw += currentChar;
        isEscaped = true;
        continue;
      }

      if (currentChar === '"') {
        const decodedItem = decodePartialJsonStringSegment(currentItemRaw).trim();
        if (decodedItem) {
          parsedItemList.push(decodedItem);
          if (parsedItemList.length >= limit) {
            break;
          }
        }
        currentItemRaw = "";
        isInString = false;
        continue;
      }

      currentItemRaw += currentChar;
      continue;
    }

    if (currentChar === "]") {
      break;
    }

    if (currentChar === '"') {
      isInString = true;
      currentItemRaw = "";
    }
  }

  if (parsedItemList.length < limit && isInString && currentItemRaw.trim()) {
    const partialItem = decodePartialJsonStringSegment(currentItemRaw).trim();
    if (partialItem) {
      parsedItemList.push(partialItem);
    }
  }

  const dedupedItemSet = new Set();
  const dedupedItemList = [];
  parsedItemList.forEach((itemText) => {
    if (dedupedItemSet.has(itemText)) {
      return;
    }
    dedupedItemSet.add(itemText);
    dedupedItemList.push(itemText);
  });

  return dedupedItemList.slice(0, limit);
}

/**
 * 清理 AI 串流 UI 状态。
 */
function resetAiInsightStreamingUiState() {
  clearAiInsightPreviewFlushTimer();
  aiInsightPendingPreviewText = "";
  aiInsightStreamRawText.value = "";
  isAiInsightStreaming.value = false;
}

/**
 * 取消当前 AI 解读请求。
 * 关键逻辑：用于切换测试、返回首页、重开测试等场景，避免旧请求回写新页面状态。
 */
function cancelActiveAiInsightRequest() {
  aiInsightRequestSessionToken += 1;
  if (aiInsightRequestController) {
    aiInsightRequestController.abort();
    aiInsightRequestController = null;
  }
  resetAiInsightStreamingUiState();
  isGeneratingAiInsight.value = false;
}

/**
 * 更新当前测试默认模式。
 */
function syncSelectedModeByActiveTest() {
  const modeList = activeTestConfig.value?.modes ?? [];
  if (modeList.length === 0) {
    selectedModeKey.value = "";
    return;
  }

  const hasSelectedMode = modeList.some(
    (modeItem) => modeItem.key === selectedModeKey.value,
  );
  selectedModeKey.value = hasSelectedMode
    ? selectedModeKey.value
    : modeList[0].key;
}

/**
 * 构建模式提示文案。
 * @param {object} modeItem 模式对象。
 * @returns {string} 文案。
 */
function buildModeRangeLabel(modeItem) {
  const baseCount = Number(modeItem?.baseCount ?? 0);

  if (baseCount >= 100) {
    return "覆盖维度更全面，适合深入了解自己。";
  }

  if (baseCount >= 70) {
    return "内容更完整，适合做一次系统测评。";
  }

  if (baseCount <= 24) {
    return "节奏较轻，适合快速完成并了解核心倾向。";
  }

  if (baseCount <= 36) {
    return "更轻量的版本，适合先做初步认识。";
  }

  return "标准版本，兼顾作答效率与结果稳定性。";
}

/**
 * 切换模式。
 * @param {string} modeKey 模式键。
 */
function selectMode(modeKey) {
  selectedModeKey.value = modeKey;
}

/**
 * 点击顶部测试切换。
 * @param {string} testKey 测试键。
 */
async function handleTestChipClick(testKey) {
  if (testKey === activeTestKey.value) {
    return;
  }

  const canSwitch = await confirmBeforeSwitchTest(testKey);
  if (!canSwitch) {
    return;
  }

  cancelActiveAiInsightRequest();
  activeTestKey.value = testKey;

  // 关键逻辑：详情页下切换测试，优先展示该测试缓存结果，否则回到首页。
  const nextCachedResult = resultCache.value[testKey];
  if (stage.value === STAGE_DETAIL) {
    if (nextCachedResult) {
      currentResult.value = nextCachedResult;
      showAllSummary.value = false;
    } else {
      currentResult.value = null;
      stage.value = STAGE_HOME;
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 点击类型学卡片。
 * @param {string} testKey 测试键。
 */
async function handleCardClick(testKey) {
  const canSwitch = await confirmBeforeSwitchTest(testKey);
  if (!canSwitch) {
    return;
  }

  cancelActiveAiInsightRequest();
  const cachedResult = resultCache.value[testKey];
  activeTestKey.value = testKey;

  if (cachedResult) {
    currentResult.value = cachedResult;
    stage.value = STAGE_DETAIL;
    showAllSummary.value = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  currentResult.value = null;
  stage.value = STAGE_HOME;
  showToast(`已切换到「${getTypeologyTestConfig(testKey)?.name ?? ""}」，请选择版本开始`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * 激活当前测试会话。
 */
function activateTestingSession({
  modeConfig,
  questions,
  answerIds,
  questionIndex,
}) {
  cancelActiveAiInsightRequest();
  const normalizedQuestionBank = Array.isArray(questions) ? questions : [];
  const normalizedAnswers = Array.isArray(answerIds)
    ? answerIds.slice(0, normalizedQuestionBank.length)
    : [];
  while (normalizedAnswers.length < normalizedQuestionBank.length) {
    normalizedAnswers.push(null);
  }

  const safeQuestionIndex = Math.max(
    0,
    Math.min(
      Number(normalizedQuestionBank.length > 0 ? normalizedQuestionBank.length - 1 : 0),
      Number(questionIndex ?? 0) || 0,
    ),
  );

  runningModeConfig.value = modeConfig ?? null;
  questionBank.value = normalizedQuestionBank;
  answers.value = normalizedAnswers;
  currentQuestionIndex.value = safeQuestionIndex;
  isNavigatingQuestion.value = false;
  stage.value = STAGE_TESTING;
  currentResult.value = null;
  showAllSummary.value = false;
}

/**
 * 构建可持久化的进度对象。
 * @param {object} params 参数对象。
 * @param {string} params.testKey 测试键。
 * @param {object} params.modeConfig 运行模式对象。
 * @param {Array<object>} params.questions 题目列表。
 * @param {Array<string|null>} params.answerIds 答案列表。
 * @param {number} params.questionIndex 当前题目索引。
 * @returns {object} 进度对象。
 */
function buildTestingProgressPayload({
  testKey,
  modeConfig,
  questions,
  answerIds,
  questionIndex,
}) {
  const normalizedQuestionBank = Array.isArray(questions) ? questions : [];
  const normalizedAnswers = Array.isArray(answerIds)
    ? answerIds.slice(0, normalizedQuestionBank.length)
    : [];

  while (normalizedAnswers.length < normalizedQuestionBank.length) {
    normalizedAnswers.push(null);
  }

  const answeredCount = normalizedAnswers.filter(Boolean).length;

  return {
    schemaVersion: TYPEOLOGY_PROGRESS_SCHEMA_VERSION,
    testKey,
    modeKey: modeConfig?.key ?? "",
    questionIds: normalizedQuestionBank.map((questionItem) => questionItem.id),
    answerIds: normalizedAnswers,
    answeredCount,
    currentQuestionIndex: Math.max(0, Number(questionIndex ?? 0) || 0),
    updatedAt: Date.now(),
  };
}

/**
 * 计算已作答题数。
 * 复杂度评估：O(Q)，Q 为当前会话题量。
 * @param {Array<string|null>} answerIdList 当前答案列表。
 * @returns {number} 已作答题数。
 */
function resolveAnsweredQuestionCount(answerIdList) {
  const normalizedAnswerList = Array.isArray(answerIdList) ? answerIdList : [];
  return normalizedAnswerList.filter(Boolean).length;
}

/**
 * 保存当前作答进度。
 * 复杂度评估：O(Q)，Q 为本轮题量（最多约 120）；每次仅执行一次轻量 JSON 序列化。
 * @returns {boolean} 是否成功写入进度缓存。
 */
function persistCurrentTestingProgress() {
  const testKey = String(activeTestConfig.value?.key ?? "").trim();
  if (!testKey || questionBank.value.length === 0) {
    return false;
  }

  const answeredCount = resolveAnsweredQuestionCount(answers.value);
  if (answeredCount < TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT) {
    // 关键逻辑：答题不足阈值时不留缓存，同时清理旧缓存避免误恢复。
    clearTypeologyProgressByTestKey(testKey);
    return false;
  }

  const modeConfig =
    runningModeConfig.value ??
    resolveModeConfig(activeTestConfig.value, selectedModeKey.value);

  const progressPayload = buildTestingProgressPayload({
    testKey,
    modeConfig,
    questions: questionBank.value,
    answerIds: answers.value,
    questionIndex: currentQuestionIndex.value,
  });

  saveTypeologyProgressCache(testKey, progressPayload);
  return true;
}

/**
 * 清理当前测试进度缓存。
 * @param {string} testKey 测试键。
 */
function clearTypeologyProgressByTestKey(testKey) {
  removeTypeologyProgressCache(testKey);
}

/**
 * 按缓存中的题目 ID 恢复题目列表。
 * @param {string} testKey 测试键。
 * @param {Array<string>} questionIdList 题目 ID 列表。
 * @returns {Array<object>|null} 可恢复题目列表；若题库结构变更导致缺题则返回 null。
 */
function restoreQuestionsByProgress(testKey, questionIdList) {
  const normalizedQuestionIdList = Array.isArray(questionIdList) ? questionIdList : [];
  if (normalizedQuestionIdList.length === 0) {
    return null;
  }

  const questionPool = getTypeologyQuestionPool(testKey);
  const questionMap = new Map(questionPool.map((questionItem) => [questionItem.id, questionItem]));

  const restoredQuestions = normalizedQuestionIdList
    .map((questionId) => questionMap.get(questionId))
    .filter(Boolean);

  if (restoredQuestions.length !== normalizedQuestionIdList.length) {
    // 关键逻辑：题库更新后若无法完整恢复，进度视为失效并走新会话。
    return null;
  }

  return restoredQuestions;
}

/**
 * 标准化恢复后的答案列表。
 * @param {Array<object>} restoredQuestions 恢复后的题目列表。
 * @param {Array<string|null>} cachedAnswerIds 缓存答案列表。
 * @returns {{ normalizedAnswers: Array<string|null>, answeredCount: number }} 标准化结果。
 */
function normalizeRestoredAnswers(restoredQuestions, cachedAnswerIds) {
  const normalizedAnswers = restoredQuestions.map((questionItem, questionIndex) => {
    const cachedAnswerId = Array.isArray(cachedAnswerIds) ? cachedAnswerIds[questionIndex] : null;
    const isValidAnswer = questionItem.options.some(
      (optionItem) => optionItem.id === cachedAnswerId,
    );
    return isValidAnswer ? cachedAnswerId : null;
  });

  return {
    normalizedAnswers,
    answeredCount: normalizedAnswers.filter(Boolean).length,
  };
}

/**
 * 读取缓存中的已作答题数。
 * 关键逻辑：优先使用缓存字段，缺失时回退为按答案数组实时计算，兼容旧版本缓存。
 * @param {object} cachedProgress 缓存进度对象。
 * @param {Array<string|null>} normalizedAnswers 标准化答案数组。
 * @returns {number} 已作答题数。
 */
function resolveCachedAnsweredCount(cachedProgress, normalizedAnswers) {
  const cachedAnsweredCount = Number(cachedProgress?.answeredCount ?? 0);
  if (Number.isFinite(cachedAnsweredCount) && cachedAnsweredCount >= 0) {
    return Math.floor(cachedAnsweredCount);
  }

  return resolveAnsweredQuestionCount(normalizedAnswers);
}

/**
 * 判断题目列表是否存在重复题干。
 * 复杂度评估：O(Q)，Q 为题量。
 * @param {Array<object>} questionList 题目列表。
 * @returns {boolean} 是否存在重复题干。
 */
function hasDuplicateQuestionTitles(questionList) {
  const seenTitleSet = new Set();

  for (let index = 0; index < questionList.length; index += 1) {
    const normalizedTitle = String(questionList[index]?.title ?? "").trim();
    if (!normalizedTitle) {
      continue;
    }

    if (seenTitleSet.has(normalizedTitle)) {
      return true;
    }

    seenTitleSet.add(normalizedTitle);
  }

  return false;
}

/**
 * 构建可恢复的会话对象。
 * @param {object} params 参数对象。
 * @param {object} params.testConfig 测试配置。
 * @param {object|null} params.cachedProgress 缓存进度对象。
 * @returns {object|null} 可恢复会话对象；无效时返回 null。
 */
function buildRestorableSession({ testConfig, cachedProgress }) {
  if (!cachedProgress || typeof cachedProgress !== "object") {
    return null;
  }

  const normalizedTestKey = String(testConfig?.key ?? "").trim();
  if (!normalizedTestKey) {
    return null;
  }

  const schemaVersion = Number(cachedProgress.schemaVersion ?? 0);
  const progressTestKey = String(cachedProgress.testKey ?? "").trim();
  if (
    schemaVersion !== TYPEOLOGY_PROGRESS_SCHEMA_VERSION ||
    progressTestKey !== normalizedTestKey
  ) {
    return null;
  }

  const restoredQuestions = restoreQuestionsByProgress(
    normalizedTestKey,
    cachedProgress.questionIds,
  );
  if (!restoredQuestions || restoredQuestions.length === 0) {
    return null;
  }

  if (hasDuplicateQuestionTitles(restoredQuestions)) {
    // 关键逻辑：历史缓存存在重复题干时直接失效，避免用户继续答“重复题”。
    return null;
  }

  const { normalizedAnswers } = normalizeRestoredAnswers(
    restoredQuestions,
    cachedProgress.answerIds,
  );
  const cachedAnsweredCount = resolveCachedAnsweredCount(
    cachedProgress,
    normalizedAnswers,
  );
  if (cachedAnsweredCount < TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT) {
    return null;
  }

  const savedQuestionIndex = Number(cachedProgress.currentQuestionIndex ?? 0);
  const resumeQuestionIndex = Math.max(
    0,
    Math.min(restoredQuestions.length - 1, Number.isFinite(savedQuestionIndex) ? savedQuestionIndex : 0),
  );
  const reachedQuestionNumber = Math.max(
    1,
    Math.min(restoredQuestions.length, cachedAnsweredCount),
  );

  return {
    modeConfig: resolveModeConfig(testConfig, cachedProgress.modeKey),
    questions: restoredQuestions,
    answerIds: normalizedAnswers,
    resumeQuestionIndex,
    reachedQuestionNumber,
  };
}

/**
 * 启动当前测试：
 * 关键逻辑：优先尝试恢复进度；用户选择“重新开始”后清理旧进度并新建会话。
 */
async function startCurrentTest() {
  const testConfig = activeTestConfig.value;
  const testKey = String(testConfig?.key ?? "").trim();
  const cachedProgress = loadTypeologyProgressCache(testKey);
  const restorableSession = buildRestorableSession({
    testConfig,
    cachedProgress,
  });

  if (cachedProgress && !restorableSession) {
    clearTypeologyProgressByTestKey(testKey);
  }

  if (restorableSession) {
    try {
      await showConfirmDialog({
        title: "继续上次测试？",
        message: `上次答题到第${restorableSession.reachedQuestionNumber}题，继续测试吗？`,
        confirmButtonText: "继续",
        cancelButtonText: "重新开始",
        closeOnClickOverlay: true,
      });

      selectedModeKey.value = restorableSession.modeConfig?.key ?? selectedModeKey.value;
      activateTestingSession({
        modeConfig: restorableSession.modeConfig,
        questions: restorableSession.questions,
        answerIds: restorableSession.answerIds,
        questionIndex: restorableSession.resumeQuestionIndex,
      });
      showToast("已恢复上次进度");
      return;
    } catch {
      clearTypeologyProgressByTestKey(testKey);
    }
  }

  const sessionPayload = buildTypeologyTestSession({
    testConfig,
    modeKey: selectedModeKey.value,
  });

  if (!sessionPayload?.questions?.length) {
    showToast("题库暂不可用，请稍后重试");
    return;
  }

  activateTestingSession({
    modeConfig: sessionPayload.modeConfig,
    questions: sessionPayload.questions,
    answerIds: Array.from({ length: sessionPayload.questions.length }, () => null),
    questionIndex: 0,
  });

  // 关键逻辑：每轮题目都重新抽取并重置答案，保证轮次独立且无重复题。
}

/**
 * 重置当前作答会话状态。
 * 关键逻辑：统一在一个方法里清理会话数据，避免多处退出逻辑状态不一致。
 */
function resetTestingSessionState() {
  runningModeConfig.value = null;
  questionBank.value = [];
  answers.value = [];
  currentQuestionIndex.value = 0;
  isNavigatingQuestion.value = false;
}

/**
 * 切换测试前确认是否退出当前作答。
 * @param {string} nextTestKey 目标测试键。
 * @returns {Promise<boolean>} 是否允许切换。
 */
async function confirmBeforeSwitchTest(nextTestKey) {
  if (stage.value === STAGE_ANALYZING) {
    showToast("结果生成中，请稍候");
    return false;
  }

  if (stage.value !== STAGE_TESTING) {
    return true;
  }

  const targetName = getTypeologyTestConfig(nextTestKey)?.name ?? "目标测试";

  try {
    await showConfirmDialog({
      title: "确认退出当前作答？",
      message: `切换到「${targetName}」后将离开当前作答页，已答满${TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT}题时会自动保存进度。`,
      confirmButtonText: "退出并切换",
      cancelButtonText: "继续作答",
      closeOnClickOverlay: true,
    });

    const hasPersistedProgress = persistCurrentTestingProgress();
    resetTestingSessionState();
    stage.value = STAGE_HOME;
    if (hasPersistedProgress) {
      showToast("已保存当前进度");
    } else {
      showToast(`已退出当前作答（少于${TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT}题不保存进度）`);
    }
    return true;
  } catch {
    // 关键逻辑：用户取消时保持当前题目和作答进度，不做任何状态变更。
    return false;
  }
}

/**
 * 退出当前测试。
 */
function quitCurrentTest() {
  const hasPersistedProgress = persistCurrentTestingProgress();
  resetTestingSessionState();
  stage.value = STAGE_HOME;
  if (hasPersistedProgress) {
    showToast("已保存当前进度");
  } else {
    showToast(`已退出当前作答（少于${TYPEOLOGY_PROGRESS_MIN_ANSWER_COUNT}题不保存进度）`);
  }
}

/**
 * 选中答案。
 * @param {string} optionId 选项 ID。
 */
async function handleOptionSelect(optionId) {
  if (stage.value !== STAGE_TESTING || !optionId || isNavigatingQuestion.value) {
    return;
  }

  const selectedIndex = currentQuestionIndex.value;
  answers.value[selectedIndex] = optionId;
  isNavigatingQuestion.value = true;

  try {
    if (selectedIndex < questionBank.value.length - 1) {
      // 关键逻辑：保存当前题答案后直接推进到下一题，减少一次手动“下一题”操作。
      currentQuestionIndex.value = selectedIndex + 1;
      persistCurrentTestingProgress();
      return;
    }

    // 关键逻辑：最后一题在提交前先落盘，避免提交链路中断导致最后一步丢失。
    persistCurrentTestingProgress();
    await submitCurrentTest();
  } finally {
    isNavigatingQuestion.value = false;
  }
}

/**
 * 上一题。
 */
function goPrevQuestion() {
  if (isNavigatingQuestion.value) {
    return;
  }

  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value -= 1;
    persistCurrentTestingProgress();
  }
}

/**
 * 执行 AI 解读请求并合并结果。
 * 关键逻辑：
 * 1. 支持流式预览；
 * 2. 支持会话令牌防串写；
 * 3. 支持外部中断，避免切换页面后的脏写入。
 * @param {object} params 参数对象。
 * @param {object} params.baseResult 本地结果基线。
 * @param {number} params.timeoutMs 请求超时（毫秒）。
 * @param {boolean} params.showSuccessToast 是否显示成功提示。
 * @param {boolean} params.showErrorToast 是否显示失败提示。
 * @returns {Promise<void>} Promise。
 */
async function runAiInsightGeneration({
  baseResult,
  timeoutMs,
  showSuccessToast,
  showErrorToast,
}) {
  if (!baseResult) {
    return;
  }

  const testConfigSnapshot = activeTestConfig.value;
  const testKeySnapshot = String(testConfigSnapshot?.key ?? "").trim();
  if (!testKeySnapshot) {
    return;
  }

  // 关键逻辑：每轮先中断旧请求，确保只有最新一轮可以写回状态。
  cancelActiveAiInsightRequest();
  const requestSessionToken = aiInsightRequestSessionToken + 1;
  aiInsightRequestSessionToken = requestSessionToken;
  aiInsightRequestController = new AbortController();
  isGeneratingAiInsight.value = true;
  isAiInsightStreaming.value = true;

  try {
    const aiInsightResult = await analyzeTypeologyWithAi({
      testConfig: testConfigSnapshot,
      localResult: baseResult,
      timeoutMs,
      abortSignal: aiInsightRequestController.signal,
      onStreamText: (fullText) => {
        if (requestSessionToken !== aiInsightRequestSessionToken) {
          return;
        }
        scheduleAiInsightPreviewText(fullText);
      },
    });

    if (requestSessionToken !== aiInsightRequestSessionToken) {
      return;
    }

    flushAiInsightPreviewText();

    const mergedResult = {
      ...baseResult,
      aiInsight: aiInsightResult,
      insight: aiInsightResult?.narrative ?? baseResult.insight,
      // 关键逻辑：主结果卡中的“核心标签/建议动作”与 AI 解读保持一致，避免两套文案割裂。
      detailTags:
        Array.isArray(aiInsightResult?.strengths) && aiInsightResult.strengths.length > 0
          ? aiInsightResult.strengths
          : baseResult.detailTags,
      detailActions:
        Array.isArray(aiInsightResult?.suggestions) && aiInsightResult.suggestions.length > 0
          ? aiInsightResult.suggestions
          : baseResult.detailActions,
    };

    resultCache.value = upsertTypeologyCachedResult(testKeySnapshot, mergedResult);
    if (String(activeTestConfig.value?.key ?? "").trim() === testKeySnapshot) {
      currentResult.value = mergedResult;
    }

    if (showSuccessToast) {
      showToast("进阶解读已更新");
    }
  } catch (error) {
    const isCancelledByContext =
      requestSessionToken !== aiInsightRequestSessionToken ||
      String(error?.message ?? "").includes("请求已取消");
    if (isCancelledByContext) {
      return;
    }

    if (showErrorToast) {
      showToast(error?.message ?? "进阶解读暂不可用，请稍后重试");
    }
  } finally {
    if (requestSessionToken === aiInsightRequestSessionToken) {
      aiInsightRequestController = null;
      isGeneratingAiInsight.value = false;
      resetAiInsightStreamingUiState();
    }
  }
}

/**
 * 提交当前测试并生成本地结果。
 */
async function submitCurrentTest() {
  stage.value = STAGE_ANALYZING;
  await sleep(500);

  const modeConfig =
    runningModeConfig.value ??
    resolveModeConfig(activeTestConfig.value, selectedModeKey.value);

  const localResult = analyzeTypeologyLocally({
    testConfig: activeTestConfig.value,
    selectedQuestions: questionBank.value,
    answerIds: answers.value,
    modeConfig,
  });

  const localPersistedResult = {
    ...localResult,
    aiInsight: null,
  };

  resultCache.value = upsertTypeologyCachedResult(
    activeTestConfig.value.key,
    localPersistedResult,
  );
  clearTypeologyProgressByTestKey(activeTestConfig.value.key);

  currentResult.value = localPersistedResult;
  stage.value = STAGE_DETAIL;
  showAllSummary.value = false;

  // 关键逻辑：结果页先展示本地结果，再流式填充 AI 文案，缩短用户“首屏等待”时间。
  void runAiInsightGeneration({
    baseResult: localPersistedResult,
    timeoutMs: 16000,
    showSuccessToast: false,
    showErrorToast: false,
  });
}

/**
 * 重新测试当前类型。
 */
function restartCurrentType() {
  cancelActiveAiInsightRequest();
  clearTypeologyProgressByTestKey(activeTestConfig.value.key);
  stage.value = STAGE_HOME;
  currentResult.value = null;
  questionBank.value = [];
  answers.value = [];
  currentQuestionIndex.value = 0;
  showAllSummary.value = false;
}

/**
 * 返回测试面板。
 */
function backToHome() {
  cancelActiveAiInsightRequest();
  stage.value = STAGE_HOME;
  currentResult.value = null;
  showAllSummary.value = false;
}

/**
 * 展开/收起摘要。
 */
function toggleSummary() {
  showAllSummary.value = !showAllSummary.value;
}

/**
 * 格式化时间戳。
 * @param {number} timestamp 毫秒级时间戳。
 * @returns {string} 可读时间文本。
 */
function formatTimestamp(timestamp) {
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const dateObject = new Date(timestamp);
  const month = String(dateObject.getMonth() + 1).padStart(2, "0");
  const day = String(dateObject.getDate()).padStart(2, "0");
  const hours = String(dateObject.getHours()).padStart(2, "0");
  const minutes = String(dateObject.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

/**
 * 生成进阶解读。
 */
async function generateAiInsight() {
  if (!currentResult.value || isGeneratingAiInsight.value) {
    return;
  }

  const baseResult = {
    ...currentResult.value,
  };

  await runAiInsightGeneration({
    baseResult,
    timeoutMs: 20000,
    showSuccessToast: true,
    showErrorToast: true,
  });
}

/**
 * 启动加载文案轮播。
 */
function startLoadingTicker() {
  stopLoadingTicker();
  loadingMessageIndex.value = 0;
  loadingTickerTimer = window.setInterval(() => {
    const messageCount = loadingMessages.value.length;
    loadingMessageIndex.value =
      messageCount > 0 ? (loadingMessageIndex.value + 1) % messageCount : 0;
  }, 1200);
}

/**
 * 停止加载文案轮播。
 */
function stopLoadingTicker() {
  if (loadingTickerTimer) {
    window.clearInterval(loadingTickerTimer);
    loadingTickerTimer = null;
  }
}

/**
 * 首帧后启用视觉增强层。
 * 关键逻辑：双 requestAnimationFrame 用于确保关键内容先完成绘制。
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
 * 监听测试类型变化，重置默认模式。
 */
watch(
  () => activeTestConfig.value.key,
  () => {
    syncSelectedModeByActiveTest();
  },
  { immediate: true },
);

/**
 * 监听阶段变化，控制加载动画轮播。
 */
watch(stage, (nextStage) => {
  if (nextStage === STAGE_ANALYZING) {
    startLoadingTicker();
    return;
  }

  stopLoadingTicker();
});

/**
 * 组件挂载后延迟启用重视觉效果。
 */
onMounted(() => {
  enableVisualEffectsAfterFirstPaint();
});

/**
 * 组件卸载时清理定时器。
 */
onBeforeUnmount(() => {
  if (stage.value === STAGE_TESTING || stage.value === STAGE_ANALYZING) {
    // 关键逻辑：页面卸载前兜底保存进度，避免刷新/跳转导致最近一题丢失。
    persistCurrentTestingProgress();
  }
  cancelActiveAiInsightRequest();
  stopLoadingTicker();
});
</script>

<style scoped>
.typeology-page {
  --type-bg:
    radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.78), transparent 34%),
    linear-gradient(135deg, #f6f7ff, #edf4ff 48%, #fef1e8);
  --type-text: #1e2f4a;
  --type-muted: #61718a;
  --type-surface: rgba(255, 255, 255, 0.84);
  --type-border: rgba(198, 215, 243, 0.82);
  --type-accent: #4a67ff;
  --type-accent-soft: #8ea2ff;
  --type-shadow: 0 22px 54px rgba(43, 72, 128, 0.18);
  --type-card-bg: rgba(255, 255, 255, 0.96);
  --type-card-border: rgba(188, 206, 238, 0.9);
  --type-chip-bg: rgba(255, 255, 255, 0.7);
  --type-chip-border: rgba(184, 206, 245, 0.82);
  --type-chip-active-bg: rgba(74, 103, 255, 0.17);
  --type-secondary-btn-bg: color-mix(in srgb, var(--type-accent) 24%, var(--type-card-bg) 76%);
  --type-secondary-btn-text: var(--type-text);
  --type-secondary-btn-border: transparent;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: var(--type-text);
  padding: 18px 12px 34px;
  background: var(--type-bg);
}

.typeology-aura {
  position: fixed;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(4px);
  opacity: 0.42;
  animation: typeologyFloat 8.2s ease-in-out infinite alternate;
}

.aura-left {
  width: 220px;
  height: 220px;
  left: -70px;
  top: -72px;
  background: radial-gradient(circle at 32% 32%, #bac9ff, #7996ff);
}

.aura-right {
  width: 248px;
  height: 248px;
  right: -88px;
  bottom: 10%;
  background: radial-gradient(circle at 30% 30%, #ffc59f, #fb8f67);
  animation-delay: 1.2s;
}

.typeology-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.1;
  background-image:
    radial-gradient(rgba(76, 103, 150, 0.5) 0.45px, transparent 0.45px),
    radial-gradient(rgba(76, 103, 150, 0.35) 0.3px, transparent 0.3px);
  background-size:
    18px 18px,
    21px 21px;
  background-position:
    0 0,
    10px 9px;
}

/* 首屏性能策略：
 * 关键逻辑：首帧优先显示可交互内容，再启用氛围背景与入场动画。 */
.typeology-page:not(.typeology-page-perf-ready) .typeology-aura,
.typeology-page:not(.typeology-page-perf-ready) .typeology-noise {
  display: none;
}

.typeology-page:not(.typeology-page-perf-ready) .typeology-header,
.typeology-page:not(.typeology-page-perf-ready) .typeology-hero-media,
.typeology-page:not(.typeology-page-perf-ready) .typeology-panel {
  animation: none;
}

.typeology-page:not(.typeology-page-perf-ready) .typeology-panel {
  backdrop-filter: none;
}

.typeology-shell {
  width: min(100%, 720px);
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: grid;
  gap: 12px;
}

.typeology-header {
  margin: 8px 4px 2px;
  animation: typeologyFadeUp 500ms ease both;
}

.typeology-hub-back-wrap {
  margin-bottom: 8px;
}

.typeology-hub-back-link {
  display: inline-block;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border-radius: 10px;
  padding: 6px 10px;
  background: linear-gradient(135deg, var(--type-accent), var(--type-accent-soft));
}

.typeology-badge {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--type-accent);
}

.typeology-header h1 {
  margin: 10px 0 8px;
  font-size: clamp(26px, 7vw, 38px);
  line-height: 1.24;
  font-family: "Noto Serif SC", serif;
}

.typeology-desc {
  margin: 0;
  color: var(--type-muted);
  font-size: 14px;
  line-height: 1.62;
}

.typeology-hero-media {
  height: 156px;
  border-radius: 18px;
  border: 1px solid var(--type-border);
  background-size: cover;
  background-position: center;
  overflow: hidden;
  box-shadow: var(--type-shadow);
  position: relative;
  animation: typeologyFadeUp 480ms ease both;
}

.typeology-hero-media-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(7, 9, 18, 0.06), rgba(7, 10, 20, 0.62));
}

.typeology-hero-media-mask p {
  margin: 0;
  color: #fff;
  font-size: 18px;
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
}

.typeology-hero-media-mask span {
  margin: 0;
  color: rgba(245, 246, 255, 0.9);
  font-size: 12px;
}

.typeology-test-switcher {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 4px;
  scrollbar-width: none;
}

.typeology-test-switcher::-webkit-scrollbar {
  display: none;
}

.typeology-test-chip {
  border: 1px solid var(--type-chip-border);
  background: var(--type-chip-bg);
  color: var(--type-text);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.typeology-test-chip.is-active {
  border-color: color-mix(in srgb, var(--type-accent) 80%, #ffffff 20%);
  background: var(--type-chip-active-bg);
  color: color-mix(in srgb, var(--type-accent) 88%, #0b1120 12%);
}

.typeology-panel {
  border-radius: 18px;
  border: 1px solid var(--type-border);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--type-accent) 8%, transparent), transparent 34%),
    var(--type-surface);
  box-shadow: var(--type-shadow);
  backdrop-filter: blur(8px);
  padding: 14px;
  animation: typeologyFadeUp 420ms ease both;
}

.typeology-start-title-wrap h2 {
  margin: 0;
  font-size: 21px;
  line-height: 1.3;
  font-family: "Noto Serif SC", serif;
}

.typeology-start-title-wrap p {
  margin: 8px 0 0;
  color: var(--type-muted);
  font-size: 13px;
  line-height: 1.58;
}

.typeology-mode-grid {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.typeology-start-submit {
  margin-top: 14px;
}

.typeology-mode-button {
  text-align: left;
  border-radius: 14px;
  border: 1px solid var(--type-card-border);
  background: var(--type-card-bg);
  padding: 12px;
  display: grid;
  gap: 4px;
  color: var(--type-text);
}

.typeology-mode-button strong {
  font-size: 15px;
}

.typeology-mode-button span {
  font-size: 12px;
  color: var(--type-muted);
}

.typeology-mode-button.is-selected {
  border-color: color-mix(in srgb, var(--type-accent) 70%, #ffffff 30%);
  box-shadow: 0 12px 24px color-mix(in srgb, var(--type-accent) 26%, transparent);
  transform: translateY(-1px);
}

.typeology-question-wrap h2 {
  margin: 12px 0 6px;
  font-size: 22px;
  line-height: 1.35;
  font-family: "Noto Serif SC", serif;
}

.typeology-question-context {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  margin: 8px 0 2px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--type-accent) 48%, #ffffff 52%);
  background: color-mix(in srgb, var(--type-accent-soft) 78%, #ffffff 22%);
  color: color-mix(in srgb, var(--type-text) 76%, var(--type-accent) 24%);
  font-size: 12px;
  line-height: 1.35;
  font-weight: 600;
}

.typeology-question-description {
  margin: 0 0 10px;
  color: color-mix(in srgb, var(--type-text) 78%, var(--type-muted) 22%);
  font-size: 14px;
  line-height: 1.62;
}

.typeology-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 700;
  color: color-mix(in srgb, var(--type-text) 86%, var(--type-muted) 14%);
}

.typeology-progress-meta span:last-child {
  font-size: 16px;
  color: var(--type-text);
}

.typeology-cell-group {
  /* 关键逻辑：移除 Vant inset 默认左右 margin，仅保留本组件的顶部节奏间距。 */
  --van-cell-group-inset-padding: 0;
  margin: 10px 0 0;
  background: transparent !important;
}

.typeology-option {
  border: 1px solid var(--type-card-border) !important;
  border-radius: 12px !important;
  margin-bottom: 8px;
  background: var(--type-card-bg) !important;
  overflow: hidden;
}

.typeology-option :deep(.van-cell) {
  background: transparent !important;
}

/* 关键逻辑：van-cell 的分割线来自根节点 ::after，需直接覆盖根节点伪元素。 */
.typeology-option::after,
.typeology-option :deep(.van-cell:after) {
  content: none !important;
  display: none !important;
  border: 0 !important;
}

.typeology-option :deep(.van-cell__title) {
  color: var(--type-text) !important;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
}

.typeology-option-selected {
  border-color: color-mix(in srgb, var(--type-accent) 72%, #ffffff 28%) !important;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--type-accent) 22%, transparent);
}

.typeology-actions {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.typeology-btn {
  border-radius: 12px !important;
  border: none !important;
  font-weight: 700;
  font-size: 16px !important;
  min-height: 46px !important;
}

.typeology-btn :deep(.van-button__text) {
  color: inherit;
}

.typeology-btn-primary {
  background: linear-gradient(135deg, var(--type-accent), var(--type-accent-soft)) !important;
  color: #fff !important;
}

.typeology-btn-primary :deep(.van-button__text),
.typeology-btn-primary :deep(.van-loading__text) {
  color: #fff !important;
}

.typeology-btn-secondary {
  /* 关键逻辑：次按钮使用主题变量，支持深色主题单独提升对比度。 */
  background: var(--type-secondary-btn-bg) !important;
  color: var(--type-secondary-btn-text) !important;
  border: 1px solid var(--type-secondary-btn-border) !important;
}

.typeology-btn-ghost {
  background: transparent !important;
  border: 1px dashed var(--type-chip-border) !important;
  color: color-mix(in srgb, var(--type-text) 88%, var(--type-muted) 12%) !important;
}

.typeology-question-quit-btn {
  margin-top: 12px;
}

.typeology-ai-generate-btn {
  margin-top: 12px;
}

.typeology-btn.van-button--disabled {
  opacity: 0.58;
  background: color-mix(in srgb, var(--type-card-bg) 74%, #959ab0 26%) !important;
  color: color-mix(in srgb, var(--type-text) 76%, #a9aec2 24%) !important;
}

.typeology-loading-panel {
  min-height: 170px;
  display: grid;
  place-items: center;
  text-align: center;
}

.typeology-loading-panel p {
  margin: 10px 0 0;
  color: var(--type-muted);
  font-size: 14px;
}

.typeology-result-head h2 {
  margin: 7px 0 4px;
  font-size: 30px;
  line-height: 1.2;
  font-family: "Noto Serif SC", serif;
}

.typeology-result-prefix {
  margin: 0;
  color: var(--type-muted);
  font-size: 13px;
}

.typeology-result-score {
  margin: 0;
  color: var(--type-muted);
  font-size: 13px;
}

.typeology-highlight-box {
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--type-card-border) 72%, var(--type-accent) 28%);
  /* 关键逻辑：摘要卡背景基于主题卡片色混合，避免深色主题出现“浅底+浅字”的可读性冲突。 */
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--type-accent) 15%, transparent),
      transparent 72%
    ),
    color-mix(in srgb, var(--type-card-bg) 88%, var(--type-accent) 12%);
  padding: 12px;
}

.typeology-highlight-box h3 {
  margin: 0 0 6px;
  font-size: 14px;
  color: var(--type-text);
}

.typeology-highlight-box p {
  margin: 0;
  line-height: 1.6;
  color: var(--type-text);
  font-size: 13px;
}

.typeology-score-wrap,
.typeology-detail-section,
.typeology-ai-section {
  margin-top: 12px;
  border-radius: 14px;
  border: 1px solid var(--type-card-border);
  background: var(--type-card-bg);
  padding: 12px;
}

.typeology-score-wrap h3,
.typeology-detail-section h3,
.typeology-ai-section h3 {
  margin: 0;
  font-size: 15px;
}

.typeology-score-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.typeology-score-list li {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  color: var(--type-text);
}

.typeology-bullet-list {
  margin: 8px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 5px;
}

.typeology-bullet-list li {
  line-height: 1.6;
  color: var(--type-muted);
  font-size: 13px;
}

.typeology-bullet-list-skeleton {
  list-style: none;
  padding-left: 0;
}

.typeology-summary-toggle {
  margin-top: 10px;
  border: 1px solid var(--type-chip-border);
  border-radius: 10px;
  background: transparent;
  color: var(--type-accent);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 9px;
}

.typeology-ai-title-wrap {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.typeology-ai-title-wrap span {
  color: var(--type-muted);
  font-size: 12px;
}

.typeology-ai-stream-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--type-muted);
}

.typeology-ai-empty {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--type-muted);
}

.typeology-ai-title {
  margin: 9px 0 5px;
  font-size: 14px;
  color: var(--type-text);
  font-weight: 700;
}

.typeology-ai-narrative {
  margin: 0;
  color: var(--type-muted);
  line-height: 1.6;
  font-size: 13px;
}

.typeology-ai-cursor {
  display: inline-block;
  width: 6px;
  height: 1em;
  margin-left: 3px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--type-accent) 82%, #ffffff 18%);
  vertical-align: -1px;
  animation: typeologyCursorBlink 1s steps(1, end) infinite;
}

.typeology-ai-narrative-skeleton {
  margin-top: 6px;
  display: grid;
  gap: 6px;
}

.typeology-ai-grid {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.typeology-ai-grid article {
  border: 1px solid color-mix(in srgb, var(--type-card-border) 74%, var(--type-accent) 26%);
  border-radius: 12px;
  padding: 10px;
  /* 关键逻辑：子卡背景跟随主题卡片色，避免深色主题出现“浅灰底+浅色字”导致不可读。 */
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--type-accent) 14%, transparent),
      transparent 70%
    ),
    color-mix(in srgb, var(--type-card-bg) 90%, var(--type-accent) 10%);
}

.typeology-ai-grid h4 {
  margin: 0;
  font-size: 13px;
  color: var(--type-text);
}

.typeology-ai-grid ul {
  margin: 6px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
}

.typeology-ai-grid li {
  color: color-mix(in srgb, var(--type-text) 82%, var(--type-muted) 18%);
  font-size: 12px;
}

.typeology-ai-grid-skeleton article {
  position: relative;
  overflow: hidden;
}

.typeology-skeleton-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.typeology-skeleton-line {
  display: block;
  width: 82%;
  height: 10px;
  border-radius: 999px;
  background:
    linear-gradient(
      100deg,
      color-mix(in srgb, var(--type-card-border) 82%, transparent) 20%,
      color-mix(in srgb, var(--type-card-border) 52%, #ffffff 48%) 50%,
      color-mix(in srgb, var(--type-card-border) 82%, transparent) 80%
    );
  background-size: 220% 100%;
  animation: typeologySkeletonShimmer 1.15s linear infinite;
}

.typeology-skeleton-line.is-wide {
  width: 95%;
}

.typeology-skeleton-line.is-short {
  width: 65%;
}

.typeology-module-head h2 {
  margin: 0;
  font-size: 20px;
  font-family: "Noto Serif SC", serif;
}

.typeology-module-head p {
  margin: 7px 0 0;
  font-size: 13px;
  color: var(--type-muted);
}

.typeology-card-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.typeology-card-item {
  border-radius: 14px;
  border: 1px solid var(--type-card-border);
  background: var(--type-card-bg);
  padding: 10px;
  text-align: left;
  color: var(--type-text);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.typeology-card-item:active {
  transform: translateY(1px) scale(0.995);
}

.typeology-card-item.is-complete {
  border-color: color-mix(in srgb, var(--type-accent) 60%, #ffffff 40%);
  box-shadow: 0 10px 18px color-mix(in srgb, var(--type-accent) 20%, transparent);
}

.typeology-card-value {
  margin: 0;
  font-size: 22px;
  line-height: 1.18;
  font-family: "Noto Serif SC", serif;
}

.typeology-card-label {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--type-muted);
}

.typeology-card-status {
  margin: 5px 0 0;
  font-size: 11px;
  color: var(--type-accent);
}

.typeology-knowledge-item {
  margin-top: 10px;
  border: 1px solid var(--type-card-border);
  border-radius: 14px;
  background: var(--type-card-bg);
  padding: 12px;
}

.typeology-knowledge-media {
  height: 112px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--type-card-border) 80%, #ffffff 20%);
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.typeology-knowledge-media::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12, 16, 28, 0.08), rgba(12, 16, 28, 0.56));
}

.typeology-knowledge-media span {
  position: absolute;
  left: 10px;
  bottom: 9px;
  z-index: 1;
  color: #f6f8ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.typeology-knowledge-item h3 {
  margin: 10px 0 0;
  font-size: 17px;
}

.typeology-knowledge-item p {
  margin: 7px 0 0;
  color: var(--type-muted);
  font-size: 13px;
  line-height: 1.58;
}

.typeology-history {
  color: color-mix(in srgb, var(--type-muted) 84%, #24324c 16%) !important;
}

.typeology-knowledge-link {
  margin-top: 9px;
  border: 0;
  background: transparent;
  color: var(--type-accent);
  font-size: 12px;
  font-weight: 700;
  padding: 0;
}

.typeology-deep-guide-panel {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--type-accent) 10%, transparent), transparent 42%),
    var(--type-card-bg);
}

.typeology-deep-guide-grid {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.typeology-deep-guide-item {
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--type-card-border) 86%, #ffffff 14%);
  background: color-mix(in srgb, var(--type-card-bg) 88%, #ffffff 12%);
  padding: 10px;
}

.typeology-deep-guide-item h4 {
  margin: 0;
  font-size: 14px;
  color: var(--type-text);
}

.typeology-deep-guide-item p {
  margin: 6px 0 0;
  color: var(--type-muted);
  font-size: 12px;
  line-height: 1.58;
}

.typeology-deep-guide-item strong {
  color: color-mix(in srgb, var(--type-accent) 82%, #ffffff 18%);
  font-weight: 700;
}

.enneagram-arcane-panel {
  border-color: rgba(255, 128, 164, 0.36);
  background:
    radial-gradient(circle at 12% 10%, rgba(255, 116, 160, 0.2), transparent 38%),
    radial-gradient(circle at 88% 16%, rgba(161, 120, 255, 0.24), transparent 42%),
    linear-gradient(145deg, #0b0c14, #121527 56%, #1b1423);
  box-shadow:
    inset 0 0 0 1px rgba(255, 173, 213, 0.12),
    0 18px 38px rgba(10, 9, 17, 0.52);
}

.enneagram-arcane-panel h3 {
  color: #ffe5f4;
}

.enneagram-arcane-panel > p {
  color: #d9c6e8;
}

.enneagram-orbit-board {
  margin-top: 12px;
  position: relative;
  height: 372px;
  border-radius: 16px;
  border: 1px solid rgba(255, 155, 193, 0.26);
  background:
    radial-gradient(circle at 50% 42%, rgba(255, 140, 194, 0.1), transparent 42%),
    linear-gradient(180deg, rgba(14, 16, 29, 0.88), rgba(20, 17, 34, 0.88));
  overflow: hidden;
}

.enneagram-orbit-stage {
  position: relative;
  width: min(95%, 430px);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  top: 10px;
}

.enneagram-orbit-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.orbit-ring {
  fill: none;
  stroke: rgba(248, 205, 225, 0.2);
  stroke-width: 1.5;
}

.orbit-outline,
.orbit-star,
.orbit-triangle {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.orbit-outline {
  stroke: rgba(255, 166, 210, 0.55);
  stroke-width: 2;
}

.orbit-star {
  stroke: rgba(255, 95, 162, 0.85);
  stroke-width: 2.2;
  filter: drop-shadow(0 0 6px rgba(255, 82, 162, 0.45));
}

.orbit-triangle {
  stroke: rgba(163, 143, 255, 0.82);
  stroke-width: 2;
  filter: drop-shadow(0 0 6px rgba(163, 143, 255, 0.42));
}

.orbit-core {
  fill: rgba(255, 120, 184, 0.1);
  stroke: rgba(255, 170, 212, 0.48);
  stroke-width: 1.6;
}

.enneagram-orbit-node {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 176, 212, 0.42);
  background: rgba(14, 16, 27, 0.78);
  box-shadow: 0 0 10px rgba(255, 108, 172, 0.2);
}

.enneagram-orbit-node span {
  color: #ffe4f5;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.enneagram-profile-grid {
  margin-top: 12px;
  display: grid;
  gap: 8px;
}

.enneagram-profile-item {
  border-radius: 12px;
  border: 1px solid rgba(255, 156, 198, 0.24);
  background: rgba(17, 19, 31, 0.72);
  padding: 10px;
}

.enneagram-profile-item h4 {
  margin: 0;
  color: #ffe9f6;
  font-size: 14px;
}

.enneagram-profile-item p {
  margin: 6px 0 0;
  color: #d8c7e8;
  font-size: 12px;
  line-height: 1.55;
}

.enneagram-profile-item strong {
  color: #ff9ac8;
  font-weight: 700;
}

.theme-type-mbti {
  --type-bg:
    radial-gradient(circle at 18% 16%, rgba(255, 160, 188, 0.32), transparent 36%),
    linear-gradient(135deg, #181b30, #23243f 56%, #2d2149);
  --type-text: #f5f2ff;
  --type-muted: #bfb8dc;
  --type-surface: rgba(21, 24, 40, 0.88);
  --type-border: rgba(114, 110, 170, 0.52);
  --type-accent: #ef6b84;
  --type-accent-soft: #9795ff;
  --type-shadow: 0 24px 56px rgba(7, 9, 19, 0.5);
  --type-card-bg: rgba(25, 29, 48, 0.96);
  --type-card-border: rgba(68, 72, 112, 0.95);
  --type-chip-bg: rgba(21, 25, 43, 0.76);
  --type-chip-border: rgba(79, 89, 132, 0.88);
  --type-chip-active-bg: rgba(239, 107, 132, 0.22);
  --type-secondary-btn-bg: linear-gradient(
    135deg,
    rgba(119, 84, 154, 0.66),
    rgba(94, 67, 139, 0.72)
  );
  --type-secondary-btn-text: #f9f3ff;
  --type-secondary-btn-border: rgba(197, 160, 235, 0.56);
}

.theme-type-enneagram {
  --type-bg:
    radial-gradient(circle at 13% 10%, rgba(255, 113, 176, 0.22), transparent 34%),
    radial-gradient(circle at 84% 16%, rgba(163, 120, 255, 0.22), transparent 36%),
    linear-gradient(132deg, #0c0d15, #13162a 54%, #1b1428);
  --type-text: #f8f0ff;
  --type-muted: #c9b7dd;
  --type-surface: rgba(18, 19, 34, 0.88);
  --type-border: rgba(165, 111, 190, 0.44);
  --type-accent: #ff5ca8;
  --type-accent-soft: #a57aff;
  --type-shadow: 0 24px 56px rgba(8, 8, 17, 0.54);
  --type-card-bg: rgba(20, 18, 33, 0.92);
  --type-card-border: rgba(170, 109, 189, 0.36);
  --type-chip-bg: rgba(24, 20, 39, 0.78);
  --type-chip-border: rgba(165, 120, 202, 0.42);
  --type-chip-active-bg: rgba(255, 92, 168, 0.2);
  --type-secondary-btn-bg: linear-gradient(
    135deg,
    rgba(122, 67, 123, 0.64),
    rgba(96, 54, 112, 0.72)
  );
  --type-secondary-btn-text: #ffeaf8;
  --type-secondary-btn-border: rgba(255, 151, 212, 0.5);
}

.theme-type-social {
  --type-bg:
    radial-gradient(circle at 15% 14%, rgba(135, 236, 211, 0.4), transparent 34%),
    linear-gradient(132deg, #eaf9f5, #e5f8ef 52%, #f5fff8);
  --type-text: #113b32;
  --type-muted: #4f766d;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(169, 225, 208, 0.86);
  --type-accent: #169b77;
  --type-accent-soft: #58c7a8;
}

.theme-type-ideal {
  --type-bg:
    radial-gradient(circle at 15% 16%, rgba(255, 203, 188, 0.38), transparent 35%),
    linear-gradient(132deg, #fff2ee, #ffeceb 52%, #fff8f3);
  --type-text: #4a2c35;
  --type-muted: #89616f;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(248, 202, 200, 0.84);
  --type-accent: #ef6f7e;
  --type-accent-soft: #f7a29f;
}

.theme-type-jung {
  --type-bg:
    radial-gradient(circle at 14% 12%, rgba(156, 238, 243, 0.38), transparent 35%),
    linear-gradient(130deg, #edf9ff, #ebfbff 48%, #f2ffff);
  --type-text: #1c3c4a;
  --type-muted: #5d7f8d;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(176, 225, 236, 0.82);
  --type-accent: #1d94ae;
  --type-accent-soft: #6ec6da;
}

.theme-type-disc {
  --type-bg:
    radial-gradient(circle at 14% 13%, rgba(255, 216, 170, 0.38), transparent 35%),
    linear-gradient(132deg, #fff6eb, #fff2df 48%, #fff9f1);
  --type-text: #4c331f;
  --type-muted: #86664a;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(244, 212, 167, 0.84);
  --type-accent: #db7c2d;
  --type-accent-soft: #f2a056;
}

.theme-type-attitude {
  --type-bg:
    radial-gradient(circle at 16% 12%, rgba(211, 181, 255, 0.38), transparent 34%),
    linear-gradient(132deg, #f4edff, #f1e8ff 48%, #faf5ff);
  --type-text: #37275b;
  --type-muted: #756296;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(219, 201, 255, 0.86);
  --type-accent: #8b5ce9;
  --type-accent-soft: #b08cf4;
}

.theme-type-temperament {
  --type-bg:
    radial-gradient(circle at 16% 13%, rgba(255, 189, 204, 0.36), transparent 34%),
    linear-gradient(132deg, #fff1f5, #ffeef3 49%, #fff7fb);
  --type-text: #4a2640;
  --type-muted: #835d75;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(247, 199, 214, 0.84);
  --type-accent: #d35b86;
  --type-accent-soft: #eb87a6;
}

.theme-type-bigfive {
  --type-bg:
    radial-gradient(circle at 16% 11%, rgba(168, 214, 255, 0.42), transparent 35%),
    linear-gradient(132deg, #eff7ff, #e9f3ff 48%, #f5f9ff);
  --type-text: #19395c;
  --type-muted: #5a7898;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(187, 215, 244, 0.84);
  --type-accent: #2f8fce;
  --type-accent-soft: #78b7e8;
}

.theme-type-dnd {
  --type-bg:
    radial-gradient(circle at 17% 12%, rgba(220, 190, 255, 0.35), transparent 34%),
    linear-gradient(132deg, #f5efff, #f0e8ff 48%, #faf5ff);
  --type-text: #332457;
  --type-muted: #6e5a96;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(214, 194, 251, 0.85);
  --type-accent: #8f62d7;
  --type-accent-soft: #b08ce9;
}

.theme-type-attachment {
  --type-bg:
    radial-gradient(circle at 16% 12%, rgba(182, 209, 255, 0.38), transparent 35%),
    linear-gradient(132deg, #eef4ff, #e9f0ff 49%, #f6f9ff);
  --type-text: #233b61;
  --type-muted: #627e9f;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(187, 208, 244, 0.84);
  --type-accent: #5f8fe8;
  --type-accent-soft: #8fb4f6;
}

.theme-type-holland {
  --type-bg:
    radial-gradient(circle at 16% 13%, rgba(178, 238, 191, 0.38), transparent 34%),
    linear-gradient(132deg, #effcf2, #e8faed 49%, #f7fff8);
  --type-text: #214635;
  --type-muted: #5c836f;
  --type-surface: rgba(255, 255, 255, 0.9);
  --type-border: rgba(183, 235, 197, 0.84);
  --type-accent: #3ea36c;
  --type-accent-soft: #77c898;
}

@keyframes typeologyFloat {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-16px);
  }
}

@keyframes typeologyFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typeologyCursorBlink {
  0%,
  48% {
    opacity: 1;
  }
  52%,
  100% {
    opacity: 0;
  }
}

@keyframes typeologySkeletonShimmer {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}

.typeology-fade-enter-active,
.typeology-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.typeology-fade-enter-from,
.typeology-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.typeology-loading-swap-enter-active,
.typeology-loading-swap-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.typeology-loading-swap-enter-from,
.typeology-loading-swap-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 640px) {
  .typeology-mode-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .typeology-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .typeology-ai-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .typeology-deep-guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 759px) {
  .typeology-panel {
    /* 关键逻辑：移动端关闭毛玻璃，减少触控场景下的重绘开销。 */
    backdrop-filter: none;
  }
}
</style>
