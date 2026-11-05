/**
 * Cloudflare Worker：专升本英语 / 数学答疑代理
 *
 * 绑定：
 *   TUTOR_KV                 KV namespace（日志）
 * 机密：
 *   DEEPSEEK_API_KEY         DeepSeek API Key
 *   TUTOR_ACCESS_TOKEN       页面访问口令（自己生成，至少 24 位）
 * 变量：
 *   DEEPSEEK_MODEL           deepseek-chat
 *   ALLOWED_ORIGIN           *（先用 * 测试，之后可改成 https://你的用户名.github.io）
 *   RATE_LIMIT_PER_MINUTE    10
 *   LOG_RETENTION_HOURS      24（答疑记录与待归档单词保留小时数）
 *
 * 路由：
 *   GET  /api/health
 *   POST /api/tutor           Header: X-Tutor-Token
 *   POST /api/tutor-preview   Header: X-Tutor-Token（只分析，不写日志、不入队）
 *   GET  /api/tutor-log       Header: X-Tutor-Token
 *   POST /api/tutor-log-delete Header: X-Tutor-Token
 *   POST /api/review-queue     Header: X-Tutor-Token
 *   GET  /api/review-pending   Header: X-Tutor-Token
 *   POST /api/delete-review-pending  Body: cleanup_token
 *   POST /api/pending-word     Header: X-Tutor-Token
 *   POST /api/queue-word       Header: X-Tutor-Token
 *   GET  /api/pending-words    Header: X-Tutor-Token
 *   POST /api/delete-pending-words     Body: cleanup_token + words
 *   POST /api/delete-tutor-logs        Body: cleanup_token + records
 *
 * /api/tutor 的 subject：
 *   缺省 / english → 英语教师
 *   math           → 数学家
 */

const CATEGORIES = ["单词解释", "作文", "句子分析", "其他"];
const PENDING_PREFIX = "pending:";
const REVIEW_PREFIX = "review:";
const REVIEW_CLEANUP_PREFIX = "review-cleanup:";
const ALIASES = {
  word: "单词解释",
  words: "单词解释",
  单词: "单词解释",
  词汇: "单词解释",
  essay: "作文",
  writing: "作文",
  composition: "作文",
  写作: "作文",
  sentence: "句子分析",
  sentences: "句子分析",
  句子: "句子分析",
  grammar: "其他",
  语法: "其他",
  other: "其他",
  qa: "其他",
  问答: "其他",
};

const SYSTEM_PROMPT = `你是一位资深英语教师，长期从事专升本英语教学，熟悉专升本考试大纲、常见题型、学生失分点和中国学生的英语学习难点。你的回答对象是准备专升本考试的中文母语大学生。

总要求：
1. 用中文讲解，英文例句、范文和需要学习的表达用英文。
2. 只输出 Markdown 正文，不要输出 HTML、JSON、代码围栏外的系统说明，也不要提到“日志”“API”“系统提示”。
3. 先给结论，再解释；语言清楚、具体，不说空话。
4. 不要使用 Markdown 表格，避免大段无法在手机上阅读的文字；用二级/三级标题、短段落和列表组织。
5. 涉及语法判断、词义辨析、翻译时，给依据和例子；不确定的内容要明确说“这里需要结合语境判断”，不要编造。
6. 如果题目信息不足，按最合理的考试语境先作答，并在开头用一句话说明你的假设；不要反问用户。
7. 遵守题目中的词数、文体、难度要求；没有要求时，按专升本水平作答。

根据用户给出的 mode 执行：

【单词解释】
- 给出音标、词性、核心中文义（不要堆砌生僻义）。
- 给 2—3 个高频搭配或短语，并配英文例句和中文翻译。
- 做易混词/形近词辨析；说明常见错误。
- 给记忆提示或构词提示；如适合，补充派生词。
- 如果这个词在专升本阅读/写作中常考，点明用法。

【作文】
用户会给一个作文题材或题目。按以下顺序输出：
1. **审题**：判断题目类型、写作对象、立场，给 3 个要点。
2. **反例**：写一小段学生常见但存在明显问题的英文（明确标注“反例”），然后逐条指出问题：语法、搭配、逻辑、中式英语等。
3. **修改示范**：把反例改成正确、自然的英文，并说明修改理由。
4. **范文**：按题目要求写一篇完整范文（没有词数要求时写 120—150 词），结构清楚，适合专升本考场。
5. **可复用表达**：给 3—5 个可迁移的句式或替换表达。
反例和范文必须清楚分开，不要把反例当成范文。

【句子分析】
- 先抄原句（用户没给原句时，先说明缺少原句，再给一个同类型示例，不要假装分析）。
- 找主干：主语、谓语、宾语/表语。
- 拆修饰：从句、非谓语、介词短语、插入语，说明各自修饰谁。
- 点出核心语法/句型，并给一个可迁移的仿写。
- 给中文翻译；必要时说明易错点。

【其他】
- 直接回答语法、用法、翻译、备考方法等问题。
- 先给结论，再给规则/例子/常见错误。
- 如果问题适合用对比表格，改用并列要点，避免 Markdown 表格。

最后检查：答案是否直接解决了用户的问题？作文是否同时有“反例”和“修改/范文”？句子分析是否真的拆了主干？单词解释是否有例句？`;

const MATH_CATEGORIES = ["题目讲解", "错题诊断", "概念公式", "其他"];
const RESOLVE_WORD_PROMPT = `你是英语词汇索引器。用户会输入一个英文单词，或一个中文意思。
你只返回一个 JSON 对象，不要输出其他文字：
{"word":"单个小写英文单词","meaning_zh":"对应的简短中文意思"}
规则：
1. word 必须是单个小写英文单词，不能是短语、句子或中文。
2. 如果中文意思对应多个词，选最常用、最适合专升本基础词汇的一个。
3. 如果无法确定单一英文单词，返回 {"word":"","meaning_zh":""}。`;
const MATH_TOPICS = [
  "极限",
  "导数与微分",
  "积分",
  "三角函数",
  "矩阵",
  "向量与空间几何",
  "微分方程",
  "无穷级数",
  "多元函数",
  "概率统计",
  "其他",
];
const MATH_TOPIC_ALIASES = {
  limit: "极限",
  limits: "极限",
  极限: "极限",
  derivative: "导数与微分",
  differential: "导数与微分",
  differentiation: "导数与微分",
  导数: "导数与微分",
  微分: "导数与微分",
  导数与微分: "导数与微分",
  integral: "积分",
  integration: "积分",
  积分: "积分",
  trigonometry: "三角函数",
  trigonometric: "三角函数",
  三角函数: "三角函数",
  matrix: "矩阵",
  matrices: "矩阵",
  矩阵: "矩阵",
  vector: "向量与空间几何",
  vectors: "向量与空间几何",
  向量: "向量与空间几何",
  空间几何: "向量与空间几何",
  "differential equation": "微分方程",
  微分方程: "微分方程",
  series: "无穷级数",
  无穷级数: "无穷级数",
  multivariable: "多元函数",
  多元函数: "多元函数",
  probability: "概率统计",
  statistics: "概率统计",
  概率: "概率统计",
  统计: "概率统计",
  other: "其他",
  其他: "其他",
};
const MATH_ALIASES = {
  problem: "题目讲解",
  question: "题目讲解",
  solution: "题目讲解",
  题目: "题目讲解",
  讲解: "题目讲解",
  错题: "错题诊断",
  diagnosis: "错题诊断",
  mistake: "错题诊断",
  error: "错题诊断",
  concept: "概念公式",
  formula: "概念公式",
  概念: "概念公式",
  公式: "概念公式",
  other: "其他",
  qa: "其他",
  问答: "其他",
};

const MATH_SYSTEM_PROMPT = `你是一位严谨、耐心的专升本数学老师，具有数学家的严谨和教学经验。你熟悉专升本高等数学、初等数学衔接、常见题型、计算易错点和学生的思维卡点。你的回答对象是准备专升本考试的中文母语大学生。

总要求：
1. 用中文讲解；数学公式用 LaTeX，行内用 $...$，独立公式用 $$...$$。
2. 只输出 Markdown 正文，不要输出 HTML、JSON、代码围栏外的系统说明，也不要提到“日志”“API”“系统提示”。
3. 先判断题目类型和知识点，再给结论/步骤；不要跳步，关键变形说明依据。
4. 计算题要展示过程并检验；证明题要写清已知、求证、关键推理；应用题要写清变量和条件。
5. 不确定或题目信息不足时，先明确假设，再按最合理的考试语境作答；不要编造条件。
6. 不要使用 Markdown 表格；用二级/三级标题、短段落、编号列表组织。
7. 语言具体、克制，不堆砌套话；最后指出最容易错的一步。

根据用户给出的 mode 执行：

【题目讲解】
- 先抄出/概括题目，确认要求求什么。
- 指出知识点、所属章节和可能的方法。
- 给出完整解题步骤，每一步写清依据（公式、定理、等价变形）。
- 单独标出最终答案，并做代回/量纲/范围检验。
- 最后给 1—2 个同类题提醒或易错点。

【错题诊断】
- 先复述学生的解法或错误答案（如果没有，明确说明按常见错误分析）。
- 找到第一处真正的错误，说明错因（概念、公式条件、计算、逻辑、审题）。
- 给出正确解法，并对比错误解法的关键差异。
- 给一个同类型变式，帮助学生迁移。

【概念公式】
- 给定义、使用条件、几何/代数意义。
- 写清公式的常见变形和适用边界。
- 给一个典型例子和一个反例/易错点。
- 如果多个概念易混，用并列要点对比，不用表格。

【其他】
- 回答学习方法、考试策略、概念疑问、计算技巧等问题。
- 先给结论，再给依据和例子。
- 需要时给出可执行的练习建议。

最后检查：题目条件是否用全？每一步是否可复核？最终答案是否单独标出？公式是否符合 LaTeX？`;

function corsHeaders(request, env) {
  const configured = String(env.ALLOWED_ORIGIN || "*").trim();
  const requestOrigin = request.headers.get("Origin") || "";
  let allowOrigin = "*";
  if (configured !== "*") {
    allowOrigin = configured === requestOrigin ? requestOrigin : configured;
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Tutor-Token",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function originAllowed(request, env) {
  const configured = String(env.ALLOWED_ORIGIN || "*").trim();
  if (configured === "*") return true;
  return (request.headers.get("Origin") || "") === configured;
}

function json(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request, env),
    },
  });
}

function normalizeMode(raw, categories = CATEGORIES, aliases = ALIASES) {
  const value = String(raw || "").trim();
  if (categories.includes(value)) return value;
  return aliases[value.toLowerCase()] || "";
}

function normalizeTopic(raw) {
  const value = String(raw || "").trim();
  if (MATH_TOPICS.includes(value)) return value;
  return MATH_TOPIC_ALIASES[value.toLowerCase()] || "其他";
}

const POLITICS_CATEGORIES = ["概念辨析", "材料分析", "时政热点", "其他"];
const POLITICS_ALIASES = {
  concept: "概念辨析",
  concepts: "概念辨析",
  material: "材料分析",
  analysis: "材料分析",
  current: "时政热点",
  news: "时政热点",
  概念: "概念辨析",
  材料: "材料分析",
  时政: "时政热点",
};

const IT_CATEGORIES = ["基础概念", "操作题", "编程题", "其他"];
const IT_ALIASES = {
  concept: "基础概念",
  concepts: "基础概念",
  operation: "操作题",
  operations: "操作题",
  coding: "编程题",
  program: "编程题",
  概念: "基础概念",
  操作: "操作题",
  编程: "编程题",
};

const POLITICS_SYSTEM_PROMPT = `你是一位熟悉专升本政治考纲的教师。用中文讲解，先给结论，再解释概念、材料和答题思路；材料分析题要分点作答，语言准确、适合考场。只输出 Markdown 正文，不要输出系统说明或代码围栏。`;
const IT_SYSTEM_PROMPT = `你是一位熟悉专升本信息技术/计算机基础的教师。用中文讲解，概念题给准确答案，操作题给步骤，编程题给可运行示例和关键解释。只输出 Markdown 正文，不要输出系统说明或代码围栏。`;

const CODE_LANGUAGES = {
  python: {
    name: "Python",
    prompt: "你是一位资深的 Python 工程师和中文导师。先判断问题属于概念、报错、代码审查还是实现方案；概念题讲机制并给最小例子，报错题先解释错误类型再定位第一处错误，代码题给完整可运行示例并说明依赖。不要编造标准库或第三方库 API；代码块标注 python。最后指出一个常见误区。",
  },
  javascript: {
    name: "JavaScript",
    prompt: "你是一位熟悉浏览器和 Node.js 的 JavaScript 工程师。先确认运行环境；讲清作用域、this、原型、事件循环、Promise/async 等机制；写完整可运行代码，标明运行环境；不要编造 DOM、Web API 或框架行为。代码块标注 javascript 或 html。最后指出一个易错点。",
  },
  web: {
    name: "HTML + CSS",
    prompt: "你是一位重视语义、可访问性和响应式布局的前端工程师。HTML/CSS 问题优先给原生、可维护方案；布局优先 Flex/Grid，说明关键尺寸和响应式断点；不要依赖框架，不编造浏览器支持；分别用 html 和 css 代码块给出可运行片段。最后指出一个常见误区。",
  },
  mysql: {
    name: "MySQL",
    prompt: "你是一位重视数据正确性的 MySQL 工程师。没有表结构时先声明假设；SQL 先保证结果正确，再谈索引和执行计划；说明 MySQL 版本差异；修改或删除数据时提醒备份、WHERE 条件和事务；不要编造函数、索引行为或执行计划；SQL 用 sql 代码块。最后指出一个易错点。",
  },
  node: {
    name: "Node.js",
    prompt: "你是一位熟悉 Node.js 运行时和服务器开发的工程师。先确认 Node 版本和 CommonJS/ESM；区分同步/异步，避免阻塞事件循环；文件路径使用 path 模块；服务器示例要能运行并说明端口、路由、错误处理；不要编造 npm 包 API；代码块标注 javascript 或 bash。最后指出一个易错点。",
  },
};

const CODE_IDS = Object.keys(CODE_LANGUAGES);


function subjectConfig(subject) {
  if (subject === "math") {
    return {
      subject: "math",
      categories: MATH_CATEGORIES,
      aliases: MATH_ALIASES,
      topics: MATH_TOPICS,
      prompt: MATH_SYSTEM_PROMPT,
      temperature: 0.2,
      maxTokens: 4000,
      maxQuestion: 4000,
      label: "数学",
    };
  }
  if (subject === "politics") {
    return {
      subject: "politics",
      categories: POLITICS_CATEGORIES,
      aliases: POLITICS_ALIASES,
      topics: [],
      prompt: POLITICS_SYSTEM_PROMPT,
      temperature: 0.3,
      maxTokens: 3200,
      maxQuestion: 3000,
      label: "政治",
    };
  }
  if (subject === "it") {
    return {
      subject: "it",
      categories: IT_CATEGORIES,
      aliases: IT_ALIASES,
      topics: [],
      prompt: IT_SYSTEM_PROMPT,
      temperature: 0.25,
      maxTokens: 3600,
      maxQuestion: 4000,
      label: "信息技术",
    };
  }
  return {
    subject: "english",
    categories: CATEGORIES,
    aliases: ALIASES,
    topics: [],
    prompt: SYSTEM_PROMPT,
    temperature: 0.35,
    maxTokens: 3200,
    maxQuestion: 2000,
    label: "英语",
  };
}

const SUBJECT_IDS = ["english", "math", "politics", "it"];

function normalizeSubject(raw) {
  const id = String(raw || "english").trim().toLowerCase();
  return SUBJECT_IDS.includes(id) ? id : "english";
}

function logIndexKey(subject, mode) {
  if (subject === "english") return `index:${mode}`;
  return `index:${subject}:${mode}`;
}

function retentionHours(env) {
  const value = Number(env.LOG_RETENTION_HOURS || 24);
  return Number.isFinite(value) && value > 0 ? value : 24;
}

function retentionSeconds(env) {
  return Math.max(60, Math.round(retentionHours(env) * 3600));
}

function retentionCutoff(env) {
  return Date.now() - retentionHours(env) * 3600 * 1000;
}

function isRecentRecord(item, cutoff) {
  const created = Date.parse(String((item && item.created_at) || ""));
  return !Number.isFinite(created) || created >= cutoff;
}

function formatShanghai(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const map = {};
    for (const part of parts) map[part.type] = part.value;
    return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
  } catch (error) {
    return date.toISOString().slice(0, 19).replace("T", " ");
  }
}

function constantTimeEqual(a, b) {
  const left = new TextEncoder().encode(String(a || ""));
  const right = new TextEncoder().encode(String(b || ""));
  let diff = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i += 1) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }
  return diff === 0;
}

function authorized(request, env) {
  const expected = String(env.TUTOR_ACCESS_TOKEN || "");
  if (!expected) return false;
  const provided = request.headers.get("X-Tutor-Token") || "";
  return constantTimeEqual(provided, expected);
}

async function readJsonBody(request, maxLength = 20000) {
  const text = await request.text();
  if (text.length > maxLength) throw new Error("请求体过大。");
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("请求体必须是 JSON 对象。");
  }
  return data;
}

function normalizeUsage(raw) {
  if (!raw || typeof raw !== "object") return {};
  const usage = {};
  for (const key of ["prompt_tokens", "completion_tokens", "total_tokens", "prompt_cache_hit_tokens", "prompt_cache_miss_tokens"]) {
    const value = Number(raw[key]);
    usage[key] = Number.isFinite(value) ? value : 0;
  }
  if (!usage.total_tokens) usage.total_tokens = (usage.prompt_tokens || 0) + (usage.completion_tokens || 0);
  return usage;
}

function cleanHistory(history, maxMessages) {
  if (!Array.isArray(history)) return [];
  return history.slice(-maxMessages).map((item) => {
    if (!item || typeof item !== "object") return null;
    const role = String(item.role || "").trim();
    const content = String(item.content || "").trim();
    if ((role !== "user" && role !== "assistant") || !content) return null;
    return { role, content: content.slice(0, 12000) };
  }).filter(Boolean);
}

async function handleTutor(request, env, preview = false) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }

  const apiKey = String(env.DEEPSEEK_API_KEY || "");
  if (!apiKey) {
    return json({ ok: false, error: "云端未配置 DEEPSEEK_API_KEY。" }, 500, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV，无法记录日志。" }, 500, request, env);
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }

  const subject = normalizeSubject(payload.subject);
  const config = subjectConfig(subject);
  const mode = normalizeMode(payload.mode, config.categories, config.aliases);
  const topic = subject === "math" ? normalizeTopic(payload.topic) : "";
  const question = String(payload.question || "").trim();
  const conversationId = String(payload.conversation_id || "").trim().slice(0, 64);
  const history = cleanHistory(payload.history, 16);
  if (!mode) {
    return json({
      ok: false,
      error: "未知的答疑分类，请使用：" + config.categories.join(" / ") + "。",
    }, 400, request, env);
  }
  if (!question) {
    return json({ ok: false, error: "请输入要问的问题。" }, 400, request, env);
  }
  if (question.length > config.maxQuestion) {
    return json({ ok: false, error: "问题太长了，请控制在 " + config.maxQuestion + " 字以内。" }, 400, request, env);
  }

  const limit = Math.max(1, Math.min(Number(env.RATE_LIMIT_PER_MINUTE || 10) || 10, 100));
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const minute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:${ip}:${minute}`;
  try {
    const used = Number((await env.TUTOR_KV.get(rateKey)) || 0);
    if (used >= limit) {
      return json({ ok: false, error: "问得太快了，请等一分钟再试。" }, 429, request, env);
    }
    await env.TUTOR_KV.put(rateKey, String(used + 1), { expirationTtl: 120 });
  } catch (error) {
    return json({ ok: false, error: "云端限流检查失败，请稍后重试。" }, 500, request, env);
  }

  const model = String(env.DEEPSEEK_MODEL || "deepseek-chat");
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let apiResponse;
  try {
    apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: config.prompt },
          ...history,
          {
            role: "user",
            content: JSON.stringify({ subject, mode, topic, question }, null, 0),
          },
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const message = error.name === "AbortError"
      ? "DeepSeek API 请求超时，请稍后重试。"
      : "无法连接 DeepSeek API：" + (error.message || "网络错误");
    return json({ ok: false, error: message }, 502, request, env);
  }
  clearTimeout(timer);

  if (!apiResponse.ok) {
    const detail = (await apiResponse.text()).slice(0, 500);
    return json(
      { ok: false, error: `DeepSeek API 返回 HTTP ${apiResponse.status}：${detail}` },
      502,
      request,
      env,
    );
  }

  let data;
  try {
    data = await apiResponse.json();
  } catch (error) {
    return json({ ok: false, error: "DeepSeek API 返回内容无法解析。" }, 502, request, env);
  }

  const answer = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!answer) {
    return json({ ok: false, error: "AI 没有返回内容，请换一种问法重试。" }, 502, request, env);
  }

  const now = new Date();
  const time = formatShanghai(now);
  const createdAt = now.toISOString();
  const record = {
    created_at: createdAt,
    time,
    subject,
    mode,
    topic,
    question,
    answer,
    conversation_id: conversationId,
    usage: normalizeUsage(data?.usage),
    model,
    duration_ms: Date.now() - started,
    status: "ok",
  };
  const ttl = retentionSeconds(env);

  let logged = false;
  let warning = "";
  if (!preview) {
    try {
      // 只写分类索引；历史读取也只读索引，避免同一答案在 KV 里存两份。
      const idxKey = logIndexKey(subject, mode);
      const existing = await env.TUTOR_KV.get(idxKey, "json");
      const cutoff = retentionCutoff(env);
      const index = (Array.isArray(existing) ? existing : [])
        .filter((item) => isRecentRecord(item, cutoff));
      index.unshift(record);
      await env.TUTOR_KV.put(idxKey, JSON.stringify(index.slice(0, 50)), { expirationTtl: ttl });
      logged = true;
    } catch (error) {
      logged = false;
      warning = "答案已生成，但云端日志索引写入失败。";
    }
  }

  return json({
    ok: true,
    subject,
    mode,
    topic,
    time,
    answer,
    model,
    preview,
    logged,
    usage: normalizeUsage(data?.usage),
    ...(warning ? { warning } : {}),
  }, 200, request, env);
}

function normalizePendingWord(raw) {
  const word = String(raw || "").trim();
  if (!/^[A-Za-z][A-Za-z'-]{1,40}$/.test(word)) return "";
  return word.toLowerCase();
}

async function handlePendingWord(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }

  const word = normalizePendingWord(payload.word);
  const question = String(payload.question || "").trim().slice(0, 2000);
  if (!word) {
    return json({ ok: false, error: "待归档的必须是一个英文单词。" }, 400, request, env);
  }

  const now = new Date();
  const createdAt = now.toISOString();
  const time = formatShanghai(now);
  const ttl = retentionSeconds(env);

  try {
    const listed = await env.TUTOR_KV.list({ prefix: PENDING_PREFIX, limit: 1000 });
    const values = await Promise.all(listed.keys.map((key) => env.TUTOR_KV.get(key.name, "json")));
    const cutoff = retentionCutoff(env);
    const duplicate = values.find((item) => item && isRecentRecord(item, cutoff) && String(item.word || "").toLowerCase() === word);
    if (duplicate) {
      return json({
        ok: true,
        queued: false,
        already_pending: true,
        word,
        message: "这个词已经在云端待归档队列中。",
      }, 200, request, env);
    }
  } catch (error) {
    // 列表失败时仍然尝试写入，避免用户问完却丢失待归档词。
  }

  const key = `${PENDING_PREFIX}${createdAt}:${crypto.randomUUID()}`;
  const record = {
    created_at: createdAt,
    time,
    word,
    question,
    source: "tutor",
  };
  try {
    await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });
  } catch (error) {
    return json({ ok: false, error: "云端待归档队列写入失败。" }, 500, request, env);
  }

  return json({
    ok: true,
    queued: true,
    word,
    time,
    message: "已加入云端待归档单词；回本地导出后归档。",
  }, 200, request, env);
}

async function handlePendingWords(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  try {
    const listed = await env.TUTOR_KV.list({ prefix: PENDING_PREFIX, limit: 1000 });
    const keys = listed.keys.map((key) => key.name);
    const values = await Promise.all(keys.map((key) => env.TUTOR_KV.get(key, "json")));
    const cutoff = retentionCutoff(env);
    const entries = values
      .filter((item) => item && item.word)
      .filter((item) => isRecentRecord(item, cutoff))
      .sort((a, b) => String(b.created_at || b.time || "").localeCompare(String(a.created_at || a.time || "")));
    let cleanupToken = "";
    if (entries.length) {
      cleanupToken = crypto.randomUUID().replace(/-/g, "");
      await env.TUTOR_KV.put(
        `cleanup:${cleanupToken}`,
        JSON.stringify({ keys, created_at: new Date().toISOString() }),
        { expirationTtl: 21600 }
      );
    }
    return json({
      ok: true,
      total: entries.length,
      entries,
      cleanup_token: cleanupToken,
      cleanup_url: new URL(request.url).origin + "/api/delete-pending-words"
    }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "读取云端待归档单词失败。" }, 500, request, env);
  }
}

async function handleDeletePendingWords(request, env) {
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: "请求 JSON 格式不正确。" }, 400, request, env);
  }
  const token = String(payload.cleanup_token || "").trim();
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return json({ ok: false, error: "清理令牌无效。" }, 401, request, env);
  }
  const words = new Set(
    (Array.isArray(payload.words) ? payload.words : [])
      .map((word) => String(word || "").trim().toLowerCase())
      .filter((word) => /^[a-z][a-z'-]{1,40}$/.test(word))
  );
  if (!words.size) {
    return json({ ok: false, error: "没有要清理的单词。" }, 400, request, env);
  }

  try {
    const cleanup = await env.TUTOR_KV.get(`cleanup:${token}`, "json");
    if (!cleanup || !Array.isArray(cleanup.keys)) {
      return json({ ok: false, error: "清理令牌已过期，请重新导出待归档 JSON。" }, 410, request, env);
    }
    let deleted = 0;
    for (const key of cleanup.keys) {
      const item = await env.TUTOR_KV.get(key, "json");
      if (!item || !words.has(String(item.word || "").toLowerCase())) continue;
      await env.TUTOR_KV.delete(key);
      deleted += 1;
    }
    return json({ ok: true, deleted }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "删除云端待归档单词失败。" }, 500, request, env);
  }
}

function parseJsonLoose(text) {
  const raw = String(text || "").trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (error) {
    return null;
  }
}

async function resolveWordQuery(query, env) {
  const apiKey = String(env.DEEPSEEK_API_KEY || "");
  if (!apiKey) throw new Error("云端未配置 DEEPSEEK_API_KEY。");
  const model = String(env.DEEPSEEK_MODEL || "deepseek-chat");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: RESOLVE_WORD_PROMPT },
          { role: "user", content: query }
        ],
        temperature: 0,
        max_tokens: 200
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error("词义解析失败：" + detail);
  }
  const data = await response.json();
  const content = data && data.choices && data.choices[0]
    && data.choices[0].message && data.choices[0].message.content;
  return parseJsonLoose(content) || {};
}

async function enqueuePendingWord(env, word, question, source, meaningZh) {
  const now = new Date();
  const createdAt = now.toISOString();
  const time = formatShanghai(now);
  const ttl = retentionSeconds(env);

  try {
    const listed = await env.TUTOR_KV.list({ prefix: PENDING_PREFIX, limit: 1000 });
    const values = await Promise.all(listed.keys.map((key) => env.TUTOR_KV.get(key.name, "json")));
    const cutoff = retentionCutoff(env);
    const duplicate = values.find((item) => item && isRecentRecord(item, cutoff) && String(item.word || "").toLowerCase() === word);
    if (duplicate) {
      return {
        ok: true,
        queued: false,
        already_pending: true,
        word,
        meaning_zh: duplicate.meaning_zh || meaningZh || "",
        message: "这个词已经在云端待归档队列中。"
      };
    }
  } catch (error) {
    // 列表失败时仍然尝试写入，避免用户输入后丢失。
  }

  const key = `${PENDING_PREFIX}${createdAt}:${crypto.randomUUID()}`;
  const record = {
    created_at: createdAt,
    time,
    word,
    question,
    meaning_zh: meaningZh || "",
    source: source || "generator"
  };
  await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });
  return {
    ok: true,
    queued: true,
    already_pending: false,
    word,
    meaning_zh: meaningZh || "",
    time,
    message: "已加入云端待归档；回本地导出 JSON 后拖入 导入待归档单词.bat。"
  };
}

async function handleQueueWord(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }

  const query = String(payload.query || payload.word || "").trim().slice(0, 80);
  if (!query) {
    return json({ ok: false, error: "请输入一个英文单词或中文意思。" }, 400, request, env);
  }

  const english = /^[A-Za-z][A-Za-z'-]{1,40}$/;
  const hasHan = /[\u4e00-\u9fff]/.test(query);
  if (!english.test(query) && !hasHan) {
    return json({ ok: false, error: "生成器只接受一个英文单词，或一个中文意思。" }, 400, request, env);
  }
  if (hasHan && (query.length > 40 || /[\n\r?？!！。]/.test(query))) {
    return json({ ok: false, error: "中文只输入简短意思，不要输入完整句子或问句。" }, 400, request, env);
  }

  let word = "";
  let meaningZh = "";
  if (english.test(query)) {
    word = query.toLowerCase();
  } else {
    try {
      const resolved = await resolveWordQuery(query, env);
      word = String(resolved.word || "").trim().toLowerCase();
      meaningZh = String(resolved.meaning_zh || "").trim();
    } catch (error) {
      return json({ ok: false, error: error.message || "词义解析失败。" }, 502, request, env);
    }
    if (!english.test(word)) {
      return json({ ok: false, error: "没有找到对应的单一英文单词，请换一个中文意思。" }, 400, request, env);
    }
  }

  try {
    const result = await enqueuePendingWord(env, word, query, "generator", meaningZh);
    return json(result, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "写入云端待归档失败。" }, 500, request, env);
  }
}

function normalizeReviewUpdates(raw) {
  if (!Array.isArray(raw)) {
    return { updates: [], error: "复习记录必须是数组。" };
  }
  if (!raw.length) {
    return { updates: [], error: "没有需要上传的复习记录。" };
  }
  if (raw.length > 200) {
    return { updates: [], error: "一次最多上传 200 条复习记录。" };
  }
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const merged = new Map();
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { updates: [], error: "复习记录格式不正确。" };
    }
    const name = String(item.name || "").trim();
    const level = Number(item.level);
    const nextDate = String(item.nextDate || "").trim();
    const lastReviewed = String(item.lastReviewed || "").trim();
    if (!name) return { updates: [], error: "复习记录缺少单词名。" };
    if (!Number.isInteger(level) || level < 0 || level > 7) {
      return { updates: [], error: `${name} 的 level 不合法。` };
    }
    if (!dateRe.test(nextDate)) {
      return { updates: [], error: `${name} 的 nextDate 不合法。` };
    }
    if (lastReviewed && !dateRe.test(lastReviewed)) {
      return { updates: [], error: `${name} 的 lastReviewed 不合法。` };
    }
    merged.set(name, { name, level, nextDate, lastReviewed: lastReviewed || null });
  }
  return { updates: Array.from(merged.values()), error: "" };
}

async function handleReviewQueue(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }
  const parsed = normalizeReviewUpdates(payload.updates);
  if (parsed.error) {
    return json({ ok: false, error: parsed.error }, 400, request, env);
  }

  const now = new Date();
  const createdAt = now.toISOString();
  const batchId = crypto.randomUUID().replace(/-/g, "");
  const ttl = retentionSeconds(env);
  const record = {
    batch_id: batchId,
    created_at: createdAt,
    time: formatShanghai(now),
    source: "review",
    updates: parsed.updates,
  };
  const key = `${REVIEW_PREFIX}${createdAt}:${batchId}`;
  try {
    await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });
  } catch (error) {
    return json({ ok: false, error: "云端复习队列写入失败。" }, 500, request, env);
  }
  return json({
    ok: true,
    batch_id: batchId,
    count: parsed.updates.length,
    time: record.time,
    message: "已上传复习批次；24 小时内回本地同步。",
  }, 200, request, env);
}

async function handleReviewPending(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  try {
    const listed = await env.TUTOR_KV.list({ prefix: REVIEW_PREFIX, limit: 1000 });
    const keys = listed.keys.map((key) => key.name);
    const values = await Promise.all(keys.map((key) => env.TUTOR_KV.get(key, "json")));
    const cutoff = retentionCutoff(env);
    const batches = values
      .filter((item) => item && Array.isArray(item.updates) && item.updates.length)
      .filter((item) => isRecentRecord(item, cutoff))
      .sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));
    const total = batches.reduce((sum, item) => sum + item.updates.length, 0);
    let cleanupToken = "";
    if (keys.length) {
      cleanupToken = crypto.randomUUID().replace(/-/g, "");
      await env.TUTOR_KV.put(
        `${REVIEW_CLEANUP_PREFIX}${cleanupToken}`,
        JSON.stringify({ keys, created_at: new Date().toISOString() }),
        { expirationTtl: 21600 }
      );
    }
    return json({
      ok: true,
      total,
      batches,
      cleanup_token: cleanupToken,
      cleanup_url: new URL(request.url).origin + "/api/delete-review-pending",
    }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "读取云端复习队列失败。" }, 500, request, env);
  }
}

async function handleDeleteReviewPending(request, env) {
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: "请求 JSON 格式不正确。" }, 400, request, env);
  }
  const token = String(payload.cleanup_token || "").trim();
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return json({ ok: false, error: "清理令牌无效。" }, 401, request, env);
  }
  try {
    const cleanup = await env.TUTOR_KV.get(`${REVIEW_CLEANUP_PREFIX}${token}`, "json");
    if (!cleanup || !Array.isArray(cleanup.keys)) {
      return json({ ok: false, error: "清理令牌已过期，请重新拉取。" }, 410, request, env);
    }
    let deleted = 0;
    for (const key of cleanup.keys) {
      if (typeof key === "string" && key.startsWith(REVIEW_PREFIX)) {
        await env.TUTOR_KV.delete(key);
        deleted += 1;
      }
    }
    await env.TUTOR_KV.delete(`${REVIEW_CLEANUP_PREFIX}${token}`);
    return json({ ok: true, deleted }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "清理云端复习队列失败。" }, 500, request, env);
  }
}

async function handleLog(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  const url = new URL(request.url);
  const subject = normalizeSubject(url.searchParams.get("subject"));
  const config = subjectConfig(subject);
  const rawCategory = url.searchParams.get("category") || "all";
  const category = rawCategory === "all"
    ? "all"
    : normalizeMode(rawCategory, config.categories, config.aliases);
  if (!category) {
    return json({ ok: false, error: "未知的答疑分类。" }, 400, request, env);
  }
  const rawTopic = url.searchParams.get("topic") || "all";
  const topic = subject === "math" && rawTopic !== "all"
    ? normalizeTopic(rawTopic)
    : "all";
  let limit = Number(url.searchParams.get("limit") || 20);
  if (!Number.isFinite(limit)) limit = 20;
  limit = Math.max(1, Math.min(Math.floor(limit), 50));

  const categories = category === "all" ? config.categories : [category];
  let entries = [];
  let total = 0;
  try {
    const indexes = await Promise.all(
      categories.map((name) => env.TUTOR_KV.get(
        logIndexKey(subject, name),
        "json",
      )),
    );
    const cutoff = retentionCutoff(env);
    for (const index of indexes) {
      if (Array.isArray(index)) entries.push(...index);
    }
    entries = entries
      .filter((item) => item && typeof item === "object" && item.answer)
      .filter((item) => isRecentRecord(item, cutoff))
      .filter((item) => topic === "all" || normalizeTopic(item.topic) === topic)
      .sort((a, b) => String(b.created_at || b.time || "").localeCompare(String(a.created_at || a.time || "")));
    total = entries.length;
    entries = entries.slice(0, limit);
  } catch (error) {
    return json({ ok: false, error: "读取云端日志失败，请稍后重试。" }, 500, request, env);
  }

  let cleanupToken = "";
  if (url.searchParams.get("export") === "1" && entries.length) {
    cleanupToken = crypto.randomUUID().replace(/-/g, "");
    const refs = entries.map((item) => ({
      mode: normalizeMode(item.mode, config.categories, config.aliases),
      time: String(item.time || ""),
      question: String(item.question || "").slice(0, 500)
    }));
    try {
      await env.TUTOR_KV.put(
        `cleanup-log:${cleanupToken}`,
        JSON.stringify({ subject, entries: refs }),
        { expirationTtl: 21600 }
      );
    } catch (error) {
      cleanupToken = "";
    }
  }

  return json({
    ok: true,
    subject,
    category,
    topic,
    total,
    entries,
    cleanup_token: cleanupToken,
    cleanup_url: new URL(request.url).origin + "/api/delete-tutor-logs"
  }, 200, request, env);
}

async function handleDeleteTutorLogs(request, env) {
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: "请求 JSON 格式不正确。" }, 400, request, env);
  }
  const token = String(payload.cleanup_token || "").trim();
  if (!/^[a-f0-9]{32}$/.test(token)) {
    return json({ ok: false, error: "清理令牌无效。" }, 401, request, env);
  }
  const cleanup = await env.TUTOR_KV.get(`cleanup-log:${token}`, "json");
  if (!cleanup || !Array.isArray(cleanup.entries)) {
    return json({ ok: false, error: "清理令牌已过期，请重新导出答疑记录。" }, 410, request, env);
  }

  const subject = normalizeSubject(cleanup.subject);
  const config = subjectConfig(subject);
  const records = Array.isArray(payload.records) ? payload.records : [];
  const wanted = new Map();
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const mode = normalizeMode(record.mode, config.categories, config.aliases);
    const time = String(record.time || "").trim();
    const question = String(record.question || "").trim().slice(0, 500);
    if (!mode || !time || !question) continue;
    if (!wanted.has(mode)) wanted.set(mode, []);
    wanted.get(mode).push({ time, question });
  }
  if (!wanted.size) {
    return json({ ok: false, error: "没有要清理的答疑记录。" }, 400, request, env);
  }

  let deleted = 0;
  try {
    for (const [mode, refs] of wanted.entries()) {
      const key = logIndexKey(subject, mode);
      const existing = await env.TUTOR_KV.get(key, "json");
      if (!Array.isArray(existing) || !existing.length) continue;
      const kept = existing.filter((item) => {
        if (!item || typeof item !== "object") return true;
        const itemMode = normalizeMode(item.mode, config.categories, config.aliases);
        const itemTime = String(item.time || "").trim();
        const itemQuestion = String(item.question || "").trim().slice(0, 500);
        return !(itemMode === mode && refs.some((ref) => (
          ref.time === itemTime && ref.question === itemQuestion
        )));
      });
      if (kept.length !== existing.length) {
        deleted += existing.length - kept.length;
        await env.TUTOR_KV.put(key, JSON.stringify(kept), { expirationTtl: retentionSeconds(env) });
      }
    }
    return json({ ok: true, deleted }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "删除云端答疑记录失败。" }, 500, request, env);
  }
}

async function handleLogDelete(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }

  const subject = normalizeSubject(payload.subject);
  const config = subjectConfig(subject);
  const mode = normalizeMode(payload.mode, config.categories, config.aliases);
  const createdAt = String(payload.created_at || "").trim();
  const time = String(payload.time || "").trim();
  if (!mode) {
    return json({ ok: false, error: "未知的答疑分类。" }, 400, request, env);
  }
  if (!createdAt && !time) {
    return json({ ok: false, error: "缺少要删除的记录时间。" }, 400, request, env);
  }

  const key = logIndexKey(subject, mode);
  try {
    const existing = await env.TUTOR_KV.get(key, "json");
    if (!Array.isArray(existing) || !existing.length) {
      return json({ ok: true, deleted: 0 }, 200, request, env);
    }
    const kept = existing.filter((item) => {
      if (!item || typeof item !== "object") return true;
      if (createdAt && String(item.created_at || "") === createdAt) return false;
      if (time && String(item.time || "") === time) return false;
      return true;
    });
    const deleted = existing.length - kept.length;
    if (deleted > 0) {
      await env.TUTOR_KV.put(key, JSON.stringify(kept), { expirationTtl: retentionSeconds(env) });
    }
    return json({ ok: true, deleted }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "删除云端答疑记录失败。" }, 500, request, env);
  }
}


const CONVERSATION_SUBJECTS = {
  english: { label: "英语", max: 8 },
  math: { label: "数学", max: 8 },
  code: { label: "编程", max: 20 },
};

function emptyConversationDocument(subject) {
  const config = CONVERSATION_SUBJECTS[subject];
  return {
    version: 1,
    subject,
    subject_label: config.label,
    updated_at: new Date().toISOString(),
    max_rounds: config.max,
    windows: {},
    deleted: {},
  };
}

function cleanConversationMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content)
    .map((m) => {
      const item = { role: m.role, content: m.content };
      for (const key of ["html", "mode", "time", "language", "language_name"]) {
        if (m[key]) item[key] = String(m[key]);
      }
      if (m.usage && typeof m.usage === "object") item.usage = m.usage;
      return item;
    });
}

async function handleConversations(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  const url = new URL(request.url);
  let payload = {};
  if (request.method === "POST") {
    try { payload = await readJsonBody(request, 5000000); } catch (error) {
      return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
    }
  }
  const subject = String(payload.subject || url.searchParams.get("subject") || "").trim();
  const config = CONVERSATION_SUBJECTS[subject];
  if (!config) return json({ ok: false, error: "未知科目。" }, 400, request, env);
  const key = "conversations:" + subject;
  let doc = null;
  try {
    doc = await env.TUTOR_KV.get(key, "json");
  } catch (error) { /* ignore */ }
  if (!doc || typeof doc !== "object" || !doc.windows) doc = emptyConversationDocument(subject);
  if (!doc.deleted || typeof doc.deleted !== "object") doc.deleted = {};
  doc.subject = subject;
  doc.subject_label = config.label;
  doc.max_rounds = config.max;

  if (request.method === "GET") {
    return json({ ok: true, document: doc }, 200, request, env);
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: "只支持 GET/POST。" }, 405, request, env);
  }
  const action = String(payload.action || "upsert");
  const windowId = String(payload.window_id || "").trim();
  if (action === "upsert") {
    if (!windowId) return json({ ok: false, error: "window_id 不能为空。" }, 400, request, env);
    const messages = cleanConversationMessages(payload.messages);
    const rounds = Math.floor(messages.length / 2);
    if (rounds > config.max) {
      return json({ ok: false, error: config.label + "最多 " + config.max + " 轮。" }, 400, request, env);
    }
    delete doc.deleted[windowId];
    if (!messages.length) {
      delete doc.windows[windowId];
      doc.deleted[windowId] = new Date().toISOString();
    } else {
      doc.windows[windowId] = {
        id: windowId,
        title: String(payload.title || "新对话").slice(0, 120),
        created_at: (doc.windows[windowId] && doc.windows[windowId].created_at) || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: String(payload.mode || ""),
        language: String(payload.language || ""),
        language_name: String(payload.language_name || ""),
        topic: String(payload.topic || ""),
        max_rounds: config.max,
        rounds,
        messages,
      };
    }
  } else if (action === "remove_round") {
    const window = doc.windows[windowId];
    if (!window) return json({ ok: false, error: "窗口不存在。" }, 404, request, env);
    const messages = cleanConversationMessages(window.messages);
    const start = Math.max(0, Number(payload.round) || 0) * 2;
    if (start + 1 >= messages.length) return json({ ok: false, error: "轮次不存在。" }, 404, request, env);
    messages.splice(start, 2);
    if (!messages.length) {
      delete doc.windows[windowId];
      doc.deleted[windowId] = new Date().toISOString();
    } else {
      window.messages = messages;
      window.rounds = Math.floor(messages.length / 2);
      window.updated_at = new Date().toISOString();
      const firstUser = messages.find((m) => m.role === "user");
      if (firstUser) window.title = String(firstUser.content || "新对话").slice(0, 120);
    }
  } else if (action === "delete_window") {
    delete doc.windows[windowId];
    doc.deleted[windowId] = new Date().toISOString();
  } else {
    return json({ ok: false, error: "未知对话历史操作。" }, 400, request, env);
  }
  doc.updated_at = new Date().toISOString();
  try {
    await env.TUTOR_KV.put(key, JSON.stringify(doc));
  } catch (error) {
    return json({ ok: false, error: "云端对话历史写入失败。" }, 500, request, env);
  }
  return json({ ok: true, document: doc }, 200, request, env);
}

async function handleCodeTutor(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  const apiKey = String(env.DEEPSEEK_API_KEY || "");
  if (!apiKey) {
    return json({ ok: false, error: "云端未配置 DEEPSEEK_API_KEY。" }, 500, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch (error) {
    return json({ ok: false, error: error.message || "请求体不合法。" }, 400, request, env);
  }

  const language = String(payload.language || "").trim().toLowerCase();
  const config = CODE_LANGUAGES[language];
  if (!config) {
    return json({ ok: false, error: "未知语言，请使用：" + CODE_IDS.join(" / ") + "。" }, 400, request, env);
  }
  const question = String(payload.question || "").trim();
  const conversationId = String(payload.conversation_id || "").trim().slice(0, 64);
  const history = cleanHistory(payload.history, 40);
  if (!question) {
    return json({ ok: false, error: "请输入要问的问题。" }, 400, request, env);
  }
  if (question.length > 20000) {
    return json({ ok: false, error: "问题太长，请控制在 20000 字以内。" }, 400, request, env);
  }

  const limit = Math.max(1, Math.min(Number(env.RATE_LIMIT_PER_MINUTE || 10) || 10, 100));
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const minute = Math.floor(Date.now() / 60000);
  const rateKey = `rate:code:${ip}:${minute}`;
  try {
    const used = Number((await env.TUTOR_KV.get(rateKey)) || 0);
    if (used >= limit) {
      return json({ ok: false, error: "问得太快了，请等一分钟再试。" }, 429, request, env);
    }
    await env.TUTOR_KV.put(rateKey, String(used + 1), { expirationTtl: 120 });
  } catch (error) {
    return json({ ok: false, error: "云端限流检查失败，请稍后重试。" }, 500, request, env);
  }

  const model = String(env.DEEPSEEK_MODEL || "deepseek-chat");
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let apiResponse;
  try {
    apiResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: config.prompt },
          ...history,
          { role: "user", content: JSON.stringify({ subject: "code", language, question }) },
        ],
        temperature: 0.3,
        max_tokens: 3200,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const message = error.name === "AbortError"
      ? "DeepSeek API 请求超时，请稍后重试。"
      : "无法连接 DeepSeek API：" + (error.message || "网络错误");
    return json({ ok: false, error: message }, 502, request, env);
  }
  clearTimeout(timer);

  if (!apiResponse.ok) {
    const detail = (await apiResponse.text()).slice(0, 500);
    return json({ ok: false, error: `DeepSeek API 返回 HTTP ${apiResponse.status}：${detail}` }, 502, request, env);
  }

  let data;
  try {
    data = await apiResponse.json();
  } catch (error) {
    return json({ ok: false, error: "DeepSeek API 返回内容无法解析。" }, 502, request, env);
  }
  const answer = String(data?.choices?.[0]?.message?.content || "").trim();
  if (!answer) {
    return json({ ok: false, error: "AI 没有返回内容，请换一种问法。" }, 502, request, env);
  }

  const now = new Date();
  const time = formatShanghai(now);
  const record = {
    created_at: now.toISOString(),
    time,
    subject: "code",
    language,
    language_name: config.name,
    mode: language,
    question,
    answer,
    conversation_id: conversationId,
    usage: normalizeUsage(data?.usage),
    model,
    duration_ms: Date.now() - started,
    status: "ok",
  };
  let logged = false;
  let warning = "";
  try {
    const key = logIndexKey("code", language);
    const existing = await env.TUTOR_KV.get(key, "json");
    const cutoff = retentionCutoff(env);
    const index = (Array.isArray(existing) ? existing : []).filter((item) => isRecentRecord(item, cutoff));
    index.unshift(record);
    await env.TUTOR_KV.put(key, JSON.stringify(index.slice(0, 50)), { expirationTtl: retentionSeconds(env) });
    logged = true;
  } catch (error) {
    warning = "答案已生成，但云端日志写入失败。";
  }

  return json({
    ok: true,
    subject: "code",
    language,
    language_name: config.name,
    time,
    answer,
    model,
    logged,
    warning,
    usage: normalizeUsage(data?.usage),
  }, 200, request, env);
}

async function handleCodeLog(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }
  const url = new URL(request.url);
  const language = String(url.searchParams.get("language") || "").trim().toLowerCase();
  if (language && !CODE_LANGUAGES[language]) {
    return json({ ok: false, error: "未知语言。" }, 400, request, env);
  }
  const keys = language ? [language] : CODE_IDS;
  const cutoff = retentionCutoff(env);
  const entries = [];
  for (const id of keys) {
    const existing = await env.TUTOR_KV.get(logIndexKey("code", id), "json");
    if (Array.isArray(existing)) {
      entries.push(...existing.filter((item) => isRecentRecord(item, cutoff)));
    }
  }
  entries.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return json({
    ok: true,
    subject: "code",
    language: language || "all",
    total: entries.length,
    entries: entries.slice(0, 50),
  }, 200, request, env);
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (!originAllowed(request, env)) {
    return json({ ok: false, error: "来源不在允许列表中。" }, 403, request, env);
  }

  if (path === "/api/conversations" && (request.method === "GET" || request.method === "POST")) {
    return handleConversations(request, env);
  }

  if (path === "/api/health" && request.method === "GET") {
    return json({
      ok: true,
      service: "english-tutor",
      model: String(env.DEEPSEEK_MODEL || "deepseek-chat"),
      has_key: Boolean(env.DEEPSEEK_API_KEY),
      kv_bound: Boolean(env.TUTOR_KV),
      auth_required: true,
      time: formatShanghai(new Date()),
    }, 200, request, env);
  }

  if (path === "/api/tutor" && request.method === "POST") {
    return handleTutor(request, env);
  }

  if (path === "/api/tutor-preview" && request.method === "POST") {
    return handleTutor(request, env, true);
  }

  if (path === "/api/code" && request.method === "POST") {
    return handleCodeTutor(request, env);
  }

  if (path === "/api/code-log" && request.method === "GET") {
    return handleCodeLog(request, env);
  }

  if (path === "/api/review-queue" && request.method === "POST") {
    return handleReviewQueue(request, env);
  }

  if (path === "/api/review-pending" && request.method === "GET") {
    return handleReviewPending(request, env);
  }

  if (path === "/api/delete-review-pending" && request.method === "POST") {
    return handleDeleteReviewPending(request, env);
  }

  if (path === "/api/pending-word" && request.method === "POST") {
    return handlePendingWord(request, env);
  }

  if (path === "/api/queue-word" && request.method === "POST") {
    return handleQueueWord(request, env);
  }

  if (path === "/api/pending-words" && request.method === "GET") {
    return handlePendingWords(request, env);
  }

  if (path === "/api/delete-pending-words" && request.method === "POST") {
    return handleDeletePendingWords(request, env);
  }

  if (path === "/api/delete-tutor-logs" && request.method === "POST") {
    return handleDeleteTutorLogs(request, env);
  }

  if (path === "/api/tutor-log" && request.method === "GET") {
    return handleLog(request, env);
  }

  if (path === "/api/tutor-log-delete" && request.method === "POST") {
    return handleLogDelete(request, env);
  }

  return json({ ok: false, error: "未知接口。" }, 404, request, env);
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error("worker error:", error && error.message ? error.message : error);
      return json({ ok: false, error: "云端服务内部错误。" }, 500, request, env);
    }
  },
};
