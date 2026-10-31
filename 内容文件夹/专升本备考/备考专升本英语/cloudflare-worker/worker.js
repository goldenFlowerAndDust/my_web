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
 *   LOG_TTL_DAYS             180
 *
 * 路由：
 *   GET  /api/health
 *   POST /api/tutor           Header: X-Tutor-Token
 *   GET  /api/tutor-log       Header: X-Tutor-Token
 *   POST /api/tutor-log-delete Header: X-Tutor-Token
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

async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > 20000) throw new Error("请求体过大。");
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("请求体必须是 JSON 对象。");
  }
  return data;
}

async function handleTutor(request, env) {
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

  const subject = String(payload.subject || "english").trim().toLowerCase() === "math"
    ? "math"
    : "english";
  const config = subjectConfig(subject);
  const mode = normalizeMode(payload.mode, config.categories, config.aliases);
  const topic = subject === "math" ? normalizeTopic(payload.topic) : "";
  const question = String(payload.question || "").trim();
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
    model,
    duration_ms: Date.now() - started,
    status: "ok",
  };
  const key = `log:${subject}:${mode}:${createdAt}:${crypto.randomUUID()}`;
  const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;

  let logged = true;
  let warning = "";
  try {
    await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });

    // 英语沿用旧 index:<mode>，数学使用独立的 index:math:<mode>。
    const indexKey = subject === "math" ? `index:math:${mode}` : `index:${mode}`;
    const existing = await env.TUTOR_KV.get(indexKey, "json");
    const index = Array.isArray(existing) ? existing : [];
    index.unshift(record);
    await env.TUTOR_KV.put(indexKey, JSON.stringify(index.slice(0, 50)), { expirationTtl: ttl });
  } catch (error) {
    logged = false;
    warning = "答案已生成，但云端日志索引写入失败。";
  }

  return json({
    ok: true,
    subject,
    mode,
    topic,
    time,
    answer,
    model,
    logged,
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
  const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;

  try {
    const listed = await env.TUTOR_KV.list({ prefix: PENDING_PREFIX, limit: 1000 });
    const values = await Promise.all(listed.keys.map((key) => env.TUTOR_KV.get(key.name, "json")));
    const duplicate = values.find((item) => item && String(item.word || "").toLowerCase() === word);
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
    const entries = values
      .filter((item) => item && item.word)
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
  const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;

  try {
    const listed = await env.TUTOR_KV.list({ prefix: PENDING_PREFIX, limit: 1000 });
    const values = await Promise.all(listed.keys.map((key) => env.TUTOR_KV.get(key.name, "json")));
    const duplicate = values.find((item) => item && String(item.word || "").toLowerCase() === word);
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

async function handleLog(request, env) {
  if (!authorized(request, env)) {
    return json({ ok: false, error: "访问口令不正确。" }, 401, request, env);
  }
  if (!env.TUTOR_KV) {
    return json({ ok: false, error: "云端未绑定 TUTOR_KV。" }, 500, request, env);
  }

  const url = new URL(request.url);
  const subject = (url.searchParams.get("subject") || "english").toLowerCase() === "math"
    ? "math"
    : "english";
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
        subject === "math" ? `index:math:${name}` : `index:${name}`,
        "json",
      )),
    );
    for (const index of indexes) {
      if (Array.isArray(index)) entries.push(...index);
    }
    entries = entries
      .filter((item) => item && typeof item === "object" && item.answer)
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

  const subject = cleanup.subject === "math" ? "math" : "english";
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
      const indexKey = subject === "math" ? `index:math:${mode}` : `index:${mode}`;
      const existing = await env.TUTOR_KV.get(indexKey, "json");
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
        const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;
        await env.TUTOR_KV.put(indexKey, JSON.stringify(kept), { expirationTtl: ttl });
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

  const subject = String(payload.subject || "english").trim().toLowerCase() === "math"
    ? "math"
    : "english";
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

  const indexKey = subject === "math" ? `index:math:${mode}` : `index:${mode}`;
  try {
    const existing = await env.TUTOR_KV.get(indexKey, "json");
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
      const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;
      await env.TUTOR_KV.put(indexKey, JSON.stringify(kept), { expirationTtl: ttl });
    }
    return json({ ok: true, deleted }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "删除云端答疑记录失败。" }, 500, request, env);
  }
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
