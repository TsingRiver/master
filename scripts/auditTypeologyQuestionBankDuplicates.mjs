#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  MBTI_PRO_72_QUESTION_BANK,
  MBTI_PRO_120_QUESTION_BANK,
  MBTI_QUICK_32_QUESTION_BANK,
} from "../src/data/mbtiQuestionBank.js";
import {
  ENNEAGRAM_PRO_120_QUESTION_BANK,
  ENNEAGRAM_QUICK_36_QUESTION_BANK,
} from "../src/data/enneagramQuestionBank.js";
import { IDEAL_MATCH_CORE_64_QUESTION_BANK } from "../src/data/idealMatchQuestionBank.js";
import { JUNG_CLASSIC_QUESTION_BANK } from "../src/data/jungClassicQuestionBank.js";
import { ATTITUDE_PSY_CORE_64_QUESTION_BANK } from "../src/data/attitudePsyQuestionBank.js";
import { TEMPERAMENT_CORE_60_QUESTION_BANK } from "../src/data/temperamentQuestionBank.js";
import { BIG_FIVE_CORE_60_QUESTION_BANK } from "../src/data/bigFiveQuestionBank.js";
import { DND_ALIGNMENT_CORE_60_QUESTION_BANK } from "../src/data/dndAlignmentQuestionBank.js";
import { ATTACHMENT_CORE_64_QUESTION_BANK } from "../src/data/attachmentTypeQuestionBank.js";
import { HOLLAND_CORE_60_QUESTION_BANK } from "../src/data/hollandQuestionBank.js";

/**
 * 审计阈值配置：
 * 1. `minPairScore` 用于综合相似度命中；
 * 2. `minCommonSubstringLength` 用于捕获“同一句骨架 + 正反修饰”的镜像题；
 * 3. `reportLimitPerMode` 控制单模式输出规模，避免终端噪声过大。
 */
const AUDIT_THRESHOLD_CONFIG = {
  minPairScore: 0.26,
  minCommonSubstringLength: 5,
  reportLimitPerMode: 20,
};

/**
 * 题干清洗时需要剔除的标点与空白。
 * 关键逻辑：统一压缩到“语义骨架”，提升不同表述之间的可比性。
 */
const TITLE_PUNCTUATION_PATTERN = /[\s，。！？、；：,.!?;:“”"'‘’（）()【】[\]《》<>·]/g;

/**
 * 镜像题审计时需要淡化的否定词。
 * 关键逻辑：去掉“ 不 / 没 / 无 / 别 ”等反向修饰后，更容易抓到同一概念的正反两面。
 */
const MIRROR_NEGATION_PATTERN = /(不|没|无|非|别|勿|未|难以|无法|不要|不会|不太)/g;

/**
 * 需要在审计前剥离的通用句式前缀。
 * 关键逻辑：量表题常有固定开头（如“我希望”“压力大时”），直接参与比对会放大结构噪声。
 */
const AUDIT_LEAD_IN_PHRASE_LIST = [
  "我希望这段关系能",
  "我希望关系里能",
  "我希望关系里",
  "我希望关系能",
  "我希望彼此能",
  "我希望对方愿意和我",
  "我希望对方愿意",
  "我希望对方会",
  "我希望对方能",
  "我希望两个人",
  "我希望我们能",
  "我希望我们",
  "我希望对方",
  "我希望关系",
  "我希望彼此",
  "我更容易被",
  "我容易被",
  "我偏爱",
  "我喜欢",
  "压力大时，我会",
  "压力大时，我更",
  "压力大时我会",
  "压力大时我更",
  "压力大时",
  "我希望",
];

/**
 * 审计输出里对齐用的行分隔符。
 */
const OUTPUT_DIVIDER = "-".repeat(72);

/**
 * 当前脚本所在目录。
 */
const SCRIPT_FILE_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIRECTORY_PATH = path.dirname(SCRIPT_FILE_PATH);
const TYPEOLOGY_CATALOG_FILE_PATH = path.resolve(
  SCRIPT_DIRECTORY_PATH,
  "../src/data/typeologyCatalog.js",
);

/**
 * 规范化题干文本。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 规范化后的题干。
 */
function normalizeAuditTitle(rawTitle) {
  const rawText = String(rawTitle ?? "").trim();
  const normalizedLeadInList = [...AUDIT_LEAD_IN_PHRASE_LIST].sort(
    (leftPhrase, rightPhrase) => rightPhrase.length - leftPhrase.length,
  );
  let strippedText = rawText;

  normalizedLeadInList.forEach((leadInPhrase) => {
    if (strippedText.startsWith(leadInPhrase)) {
      strippedText = strippedText.slice(leadInPhrase.length);
    }
  });

  return strippedText
    .replace(TITLE_PUNCTUATION_PATTERN, "")
    .trim();
}

/**
 * 构建“镜像对比文本”。
 * 关键逻辑：在标准规范化基础上进一步剥离否定词，便于识别正反镜像题。
 * 复杂度评估：O(L)，L 为题干长度。
 * @param {string} rawTitle 原始题干。
 * @returns {string} 镜像审计文本。
 */
function buildMirrorAuditTitle(rawTitle) {
  return normalizeAuditTitle(rawTitle).replace(MIRROR_NEGATION_PATTERN, "");
}

/**
 * 构建字符 n-gram 集合。
 * 复杂度评估：O(L)，L 为文本长度。
 * @param {string} text 输入文本。
 * @param {number} size n-gram 长度。
 * @returns {Set<string>} n-gram 集合。
 */
function buildCharacterNgramSet(text, size) {
  const normalizedText = String(text ?? "");
  const safeSize = Math.max(1, Number(size) || 1);
  const ngramSet = new Set();

  if (normalizedText.length < safeSize) {
    if (normalizedText) {
      ngramSet.add(normalizedText);
    }
    return ngramSet;
  }

  for (let index = 0; index <= normalizedText.length - safeSize; index += 1) {
    ngramSet.add(normalizedText.slice(index, index + safeSize));
  }

  return ngramSet;
}

/**
 * 计算 Jaccard 相似度。
 * 复杂度评估：O(A + B)，A/B 为两个集合大小。
 * @param {Set<string>} leftSet 左集合。
 * @param {Set<string>} rightSet 右集合。
 * @returns {number} 相似度分值，范围 [0, 1]。
 */
function calculateJaccardSimilarity(leftSet, rightSet) {
  if (!(leftSet instanceof Set) || !(rightSet instanceof Set)) {
    return 0;
  }

  let intersectionCount = 0;
  leftSet.forEach((item) => {
    if (rightSet.has(item)) {
      intersectionCount += 1;
    }
  });

  const unionCount = leftSet.size + rightSet.size - intersectionCount;
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}

/**
 * 计算最长公共子串长度。
 * 关键逻辑：该指标对“只改几个修饰词，其余骨架一致”的题面更敏感。
 * 复杂度评估：O(L1 * L2)。
 * @param {string} leftText 左文本。
 * @param {string} rightText 右文本。
 * @returns {number} 最长公共子串长度。
 */
function calculateLongestCommonSubstringLength(leftText, rightText) {
  const normalizedLeftText = String(leftText ?? "");
  const normalizedRightText = String(rightText ?? "");

  if (!normalizedLeftText || !normalizedRightText) {
    return 0;
  }

  const dp = Array.from({ length: normalizedLeftText.length + 1 }, () =>
    Array(normalizedRightText.length + 1).fill(0),
  );
  let longestLength = 0;

  for (let leftIndex = 1; leftIndex <= normalizedLeftText.length; leftIndex += 1) {
    for (
      let rightIndex = 1;
      rightIndex <= normalizedRightText.length;
      rightIndex += 1
    ) {
      if (normalizedLeftText[leftIndex - 1] !== normalizedRightText[rightIndex - 1]) {
        continue;
      }

      dp[leftIndex][rightIndex] = dp[leftIndex - 1][rightIndex - 1] + 1;
      if (dp[leftIndex][rightIndex] > longestLength) {
        longestLength = dp[leftIndex][rightIndex];
      }
    }
  }

  return longestLength;
}

/**
 * 计算题对的综合相似度指标。
 * 关键逻辑：
 * 1. 原始文本 bigram / trigram 用于衡量句子结构相似度；
 * 2. 镜像文本公共子串用于捕获“同一概念的正反表述”；
 * 3. 最终分数偏保守，只把较像的候选题抬出来人工复核。
 * 复杂度评估：O(L1 * L2)。
 * @param {string} leftTitle 左题干。
 * @param {string} rightTitle 右题干。
 * @returns {{
 *   pairScore: number,
 *   normalizedCommonSubstringLength: number,
 *   mirrorCommonSubstringLength: number,
 *   bigramSimilarity: number,
 *   trigramSimilarity: number,
 *   mirrorCommonRatio: number
 * }} 相似度指标。
 */
function calculatePairSimilarityMetrics(leftTitle, rightTitle) {
  const normalizedLeftTitle = normalizeAuditTitle(leftTitle);
  const normalizedRightTitle = normalizeAuditTitle(rightTitle);
  const mirrorLeftTitle = buildMirrorAuditTitle(leftTitle);
  const mirrorRightTitle = buildMirrorAuditTitle(rightTitle);
  const leftBigramSet = buildCharacterNgramSet(normalizedLeftTitle, 2);
  const rightBigramSet = buildCharacterNgramSet(normalizedRightTitle, 2);
  const leftTrigramSet = buildCharacterNgramSet(normalizedLeftTitle, 3);
  const rightTrigramSet = buildCharacterNgramSet(normalizedRightTitle, 3);
  const bigramSimilarity = calculateJaccardSimilarity(leftBigramSet, rightBigramSet);
  const trigramSimilarity = calculateJaccardSimilarity(leftTrigramSet, rightTrigramSet);
  const normalizedCommonSubstringLength = calculateLongestCommonSubstringLength(
    normalizedLeftTitle,
    normalizedRightTitle,
  );
  const mirrorCommonSubstringLength = calculateLongestCommonSubstringLength(
    mirrorLeftTitle,
    mirrorRightTitle,
  );
  const shortestLength = Math.max(
    1,
    Math.min(normalizedLeftTitle.length, normalizedRightTitle.length),
  );
  const commonRatio = normalizedCommonSubstringLength / shortestLength;
  const mirrorCommonRatio = mirrorCommonSubstringLength / shortestLength;
  const pairScore =
    bigramSimilarity * 0.45 +
    trigramSimilarity * 0.25 +
    commonRatio * 0.15 +
    mirrorCommonRatio * 0.15;

  return {
    pairScore,
    normalizedCommonSubstringLength,
    mirrorCommonSubstringLength,
    bigramSimilarity,
    trigramSimilarity,
    mirrorCommonRatio,
  };
}

/**
 * 判断题对是否应作为候选重复题输出。
 * 复杂度评估：O(1)。
 * @param {ReturnType<typeof calculatePairSimilarityMetrics>} similarityMetrics 相似度指标。
 * @returns {boolean} 是否命中候选。
 */
function shouldReportDuplicateCandidate(similarityMetrics) {
  return (
    similarityMetrics.pairScore >= AUDIT_THRESHOLD_CONFIG.minPairScore ||
    similarityMetrics.normalizedCommonSubstringLength >=
      AUDIT_THRESHOLD_CONFIG.minCommonSubstringLength ||
    similarityMetrics.mirrorCommonSubstringLength >=
      AUDIT_THRESHOLD_CONFIG.minCommonSubstringLength
  );
}

/**
 * 对单个模式题库做候选重复审计。
 * 复杂度评估：O(N^2 * L^2)，N 为题量，L 为平均题干长度。
 * @param {Array<object>} questionList 题目列表。
 * @returns {Array<object>} 候选重复题对。
 */
function auditQuestionList(questionList) {
  const safeQuestionList = Array.isArray(questionList) ? questionList : [];
  const duplicateCandidateList = [];

  for (let leftIndex = 0; leftIndex < safeQuestionList.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < safeQuestionList.length;
      rightIndex += 1
    ) {
      const leftQuestion = safeQuestionList[leftIndex];
      const rightQuestion = safeQuestionList[rightIndex];
      const similarityMetrics = calculatePairSimilarityMetrics(
        leftQuestion?.title,
        rightQuestion?.title,
      );

      if (!shouldReportDuplicateCandidate(similarityMetrics)) {
        continue;
      }

      duplicateCandidateList.push({
        leftQuestion,
        rightQuestion,
        ...similarityMetrics,
      });
    }
  }

  duplicateCandidateList.sort((leftItem, rightItem) => {
    return rightItem.pairScore - leftItem.pairScore;
  });

  return duplicateCandidateList;
}

/**
 * 解析 `typeologyCatalog.js` 中的数组常量。
 * 关键逻辑：社会人格 / DISC 题库未独立导出，因此审计脚本直接从源码中提取蓝图。
 * 复杂度评估：O(F)，F 为 catalog 文件长度。
 * @param {string} constantName 常量名。
 * @returns {Promise<Array>} 解析后的数组。
 */
async function loadCatalogArrayLiteral(constantName) {
  const catalogSourceText = await readFile(TYPEOLOGY_CATALOG_FILE_PATH, "utf8");
  const declarationToken = `const ${constantName} = [`;
  const declarationIndex = catalogSourceText.indexOf(declarationToken);

  if (declarationIndex < 0) {
    throw new Error(`未在 typeologyCatalog.js 中找到 ${constantName}`);
  }

  const arrayStartIndex = catalogSourceText.indexOf("[", declarationIndex);
  let bracketDepth = 0;
  let arrayEndIndex = -1;

  for (let index = arrayStartIndex; index < catalogSourceText.length; index += 1) {
    const currentChar = catalogSourceText[index];
    if (currentChar === "[") {
      bracketDepth += 1;
    } else if (currentChar === "]") {
      bracketDepth -= 1;
      if (bracketDepth === 0) {
        arrayEndIndex = index;
        break;
      }
    }
  }

  if (arrayEndIndex < 0) {
    throw new Error(`解析 ${constantName} 失败，未找到数组结束位置`);
  }

  const arrayLiteral = catalogSourceText.slice(arrayStartIndex, arrayEndIndex + 1);
  // 关键逻辑：数组字面量来自当前仓库源码，受信任，可直接求值为审计输入。
  return Function(`"use strict"; return (${arrayLiteral});`)();
}

/**
 * 按 id + title 对题库做稳定去重。
 * 关键逻辑：与线上会话构建逻辑保持一致，避免审计结果和实际展示不一致。
 * 复杂度评估：O(N)。
 * @param {Array<object>} questionList 题目列表。
 * @returns {Array<object>} 去重后的题目列表。
 */
function dedupeQuestionList(questionList) {
  const safeQuestionList = Array.isArray(questionList) ? questionList : [];
  const seenIdSet = new Set();
  const seenTitleSet = new Set();
  const dedupedQuestionList = [];

  safeQuestionList.forEach((questionItem) => {
    const questionId = String(questionItem?.id ?? "").trim();
    const questionTitle = String(questionItem?.title ?? "").trim();
    if (!questionId || !questionTitle) {
      return;
    }

    if (seenIdSet.has(questionId) || seenTitleSet.has(questionTitle)) {
      return;
    }

    seenIdSet.add(questionId);
    seenTitleSet.add(questionTitle);
    dedupedQuestionList.push(questionItem);
  });

  return dedupedQuestionList;
}

/**
 * 截取正式模式题目。
 * 复杂度评估：O(N)。
 * @param {Array<object>} questionList 题库列表。
 * @param {number} count 正式题量。
 * @returns {Array<object>} 当前模式正式题目。
 */
function selectModeQuestions(questionList, count) {
  const safeCount = Math.max(0, Math.floor(Number(count) || 0));
  return dedupeQuestionList(questionList).slice(0, safeCount);
}

/**
 * 构建社会人格题目列表。
 * 复杂度评估：O(N)。
 * @param {Array<Array<string>>} blueprintList 题目蓝图。
 * @returns {Array<object>} 标准题目列表。
 */
function buildSocialPersonaQuestionList(blueprintList) {
  const safeBlueprintList = Array.isArray(blueprintList) ? blueprintList : [];
  const seenTitleSet = new Set();
  const questionList = [];

  safeBlueprintList.forEach((questionTuple, questionIndex) => {
    const questionTitle = String(questionTuple?.[0] ?? "").trim();
    if (!questionTitle || seenTitleSet.has(questionTitle)) {
      return;
    }

    seenTitleSet.add(questionTitle);
    questionList.push({
      id: `social-persona-q-${String(questionIndex + 1).padStart(3, "0")}`,
      title: questionTitle,
    });
  });

  return questionList;
}

/**
 * 构建 DISC 题目列表。
 * 复杂度评估：O(N)。
 * @param {Array<object>} blueprintList 题目蓝图。
 * @returns {Array<object>} 标准题目列表。
 */
function buildDiscQuestionList(blueprintList) {
  const safeBlueprintList = Array.isArray(blueprintList) ? blueprintList : [];
  const seenTitleSet = new Set();
  const questionList = [];

  safeBlueprintList.forEach((questionItem, questionIndex) => {
    const questionTitle = String(questionItem?.title ?? "").trim();
    if (!questionTitle || seenTitleSet.has(questionTitle)) {
      return;
    }

    seenTitleSet.add(questionTitle);
    questionList.push({
      id: `disc-q-${String(questionIndex + 1).padStart(3, "0")}`,
      title: questionTitle,
    });
  });

  return questionList;
}

/**
 * 基于候选题对构建簇。
 * 关键逻辑：同一题若与多题相连，视为同一语义簇，方便人工一次性处理。
 * 复杂度评估：O(P * α(N))，P 为候选对数量。
 * @param {Array<object>} duplicateCandidateList 候选重复题对。
 * @returns {Array<Array<string>>} 题目 ID 簇列表。
 */
function buildDuplicateClusters(duplicateCandidateList) {
  const parentMap = new Map();

  /**
   * 初始化并查集节点。
   * @param {string} nodeKey 节点键。
   * @returns {string} 节点根键。
   */
  function ensureNode(nodeKey) {
    if (!parentMap.has(nodeKey)) {
      parentMap.set(nodeKey, nodeKey);
    }
    return nodeKey;
  }

  /**
   * 查找节点根。
   * @param {string} nodeKey 节点键。
   * @returns {string} 根节点键。
   */
  function find(nodeKey) {
    const safeNodeKey = ensureNode(nodeKey);
    const parentKey = parentMap.get(safeNodeKey);
    if (parentKey === safeNodeKey) {
      return safeNodeKey;
    }

    const rootKey = find(parentKey);
    parentMap.set(safeNodeKey, rootKey);
    return rootKey;
  }

  /**
   * 合并两个节点所在集合。
   * @param {string} leftNodeKey 左节点。
   * @param {string} rightNodeKey 右节点。
   * @returns {void}
   */
  function union(leftNodeKey, rightNodeKey) {
    const leftRootKey = find(leftNodeKey);
    const rightRootKey = find(rightNodeKey);
    if (leftRootKey !== rightRootKey) {
      parentMap.set(rightRootKey, leftRootKey);
    }
  }

  duplicateCandidateList.forEach((candidateItem) => {
    const leftQuestionId = String(candidateItem?.leftQuestion?.id ?? "").trim();
    const rightQuestionId = String(candidateItem?.rightQuestion?.id ?? "").trim();
    if (!leftQuestionId || !rightQuestionId) {
      return;
    }

    ensureNode(leftQuestionId);
    ensureNode(rightQuestionId);
    union(leftQuestionId, rightQuestionId);
  });

  const clusterMap = new Map();
  parentMap.forEach((_, nodeKey) => {
    const rootKey = find(nodeKey);
    const clusterNodeList = clusterMap.get(rootKey) ?? [];
    clusterNodeList.push(nodeKey);
    clusterMap.set(rootKey, clusterNodeList);
  });

  return [...clusterMap.values()]
    .map((clusterNodeList) => clusterNodeList.sort())
    .sort((leftCluster, rightCluster) => rightCluster.length - leftCluster.length);
}

/**
 * 收集全部类型学模式的正式题目集。
 * 关键逻辑：输出与线上模式题量一致的正式题集，确保审计覆盖 quick32 / pro72 / 其他正式模式。
 * 复杂度评估：O(T * N)，T 为模式数量，N 为单模式题量。
 * @returns {Array<{ testKey: string, testName: string, modeKey: string, modeLabel: string, questions: Array<object> }>} 模式题目集。
 */
async function collectModeQuestionSets() {
  const socialPersonaBlueprintList = await loadCatalogArrayLiteral(
    "SOCIAL_PERSONA_QUESTION_BLUEPRINT",
  );
  const discBlueprintList = await loadCatalogArrayLiteral("DISC_QUESTION_BLUEPRINT");

  return [
    {
      testKey: "mbti",
      testName: "MBTI",
      modeKey: "quick32",
      modeLabel: "32题速测版",
      questions: selectModeQuestions(MBTI_QUICK_32_QUESTION_BANK, 32),
    },
    {
      testKey: "mbti",
      testName: "MBTI",
      modeKey: "pro72",
      modeLabel: "72题专业版",
      questions: selectModeQuestions(MBTI_PRO_72_QUESTION_BANK, 72),
    },
    {
      testKey: "enneagram",
      testName: "九型人格",
      modeKey: "quick36",
      modeLabel: "36题速测版",
      questions: selectModeQuestions(ENNEAGRAM_QUICK_36_QUESTION_BANK, 36),
    },
    {
      testKey: "enneagram",
      testName: "九型人格",
      modeKey: "pro120",
      modeLabel: "120题专业版",
      questions: selectModeQuestions(ENNEAGRAM_PRO_120_QUESTION_BANK, 120),
    },
    {
      testKey: "social-persona",
      testName: "社会人格",
      modeKey: "core64",
      modeLabel: "64题",
      questions: selectModeQuestions(
        buildSocialPersonaQuestionList(socialPersonaBlueprintList),
        64,
      ),
    },
    {
      testKey: "ideal-match",
      testName: "理想型",
      modeKey: "core64",
      modeLabel: "64题",
      questions: selectModeQuestions(IDEAL_MATCH_CORE_64_QUESTION_BANK, 64),
    },
    {
      testKey: "jung-classic",
      testName: "经典荣格",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(JUNG_CLASSIC_QUESTION_BANK, 60),
    },
    {
      testKey: "disc",
      testName: "DISC",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(buildDiscQuestionList(discBlueprintList), 60),
    },
    {
      testKey: "attitude-psy",
      testName: "态度心理",
      modeKey: "core64",
      modeLabel: "64题",
      questions: selectModeQuestions(ATTITUDE_PSY_CORE_64_QUESTION_BANK, 64),
    },
    {
      testKey: "temperament",
      testName: "体液气质",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(TEMPERAMENT_CORE_60_QUESTION_BANK, 60),
    },
    {
      testKey: "big-five",
      testName: "大五人格",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(BIG_FIVE_CORE_60_QUESTION_BANK, 60),
    },
    {
      testKey: "dnd-alignment",
      testName: "DnD阵营",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(DND_ALIGNMENT_CORE_60_QUESTION_BANK, 60),
    },
    {
      testKey: "attachment",
      testName: "依恋类型",
      modeKey: "core64",
      modeLabel: "64题",
      questions: selectModeQuestions(ATTACHMENT_CORE_64_QUESTION_BANK, 64),
    },
    {
      testKey: "holland",
      testName: "霍兰德",
      modeKey: "core60",
      modeLabel: "60题",
      questions: selectModeQuestions(HOLLAND_CORE_60_QUESTION_BANK, 60),
    },
  ];
}

/**
 * 输出单模式的审计结果。
 * 复杂度评估：O(C)，C 为候选数量。
 * @param {object} modeQuestionSet 模式题目集。
 * @param {Array<object>} duplicateCandidateList 候选重复题对。
 * @returns {void}
 */
function printModeAuditReport(modeQuestionSet, duplicateCandidateList) {
  const duplicateClusters = buildDuplicateClusters(duplicateCandidateList);
  const questionCount = Array.isArray(modeQuestionSet?.questions)
    ? modeQuestionSet.questions.length
    : 0;
  const reportCandidateList = duplicateCandidateList.slice(
    0,
    AUDIT_THRESHOLD_CONFIG.reportLimitPerMode,
  );

  console.log(OUTPUT_DIVIDER);
  console.log(
    `${modeQuestionSet.testName} (${modeQuestionSet.testKey}) / ` +
      `${modeQuestionSet.modeLabel} (${modeQuestionSet.modeKey})`,
  );
  console.log(
    `题量: ${questionCount}，候选重复对: ${duplicateCandidateList.length}，候选簇: ${duplicateClusters.length}`,
  );

  if (duplicateCandidateList.length === 0) {
    console.log("未发现达到阈值的重复候选。");
    return;
  }

  reportCandidateList.forEach((candidateItem, index) => {
    const pairScore = candidateItem.pairScore.toFixed(3);
    const bigramSimilarity = candidateItem.bigramSimilarity.toFixed(3);
    const trigramSimilarity = candidateItem.trigramSimilarity.toFixed(3);
    const mirrorCommonRatio = candidateItem.mirrorCommonRatio.toFixed(3);
    console.log(
      `${index + 1}. score=${pairScore} bigram=${bigramSimilarity} ` +
        `trigram=${trigramSimilarity} mirror=${mirrorCommonRatio}`,
    );
    console.log(
      `   - [${candidateItem.leftQuestion.id}] ${candidateItem.leftQuestion.title}`,
    );
    console.log(
      `   - [${candidateItem.rightQuestion.id}] ${candidateItem.rightQuestion.title}`,
    );
  });
}

/**
 * 主流程。
 * 复杂度评估：O(M * N^2 * L^2)，M 为模式数量。
 * @returns {void}
 */
async function main() {
  const modeQuestionSetList = await collectModeQuestionSets();
  let totalFindingCount = 0;

  modeQuestionSetList.forEach((modeQuestionSet) => {
    const duplicateCandidateList = auditQuestionList(modeQuestionSet.questions);
    totalFindingCount += duplicateCandidateList.length;
    printModeAuditReport(modeQuestionSet, duplicateCandidateList);
  });

  console.log(OUTPUT_DIVIDER);
  console.log(`审计完成，总候选重复对: ${totalFindingCount}`);
}

await main();
