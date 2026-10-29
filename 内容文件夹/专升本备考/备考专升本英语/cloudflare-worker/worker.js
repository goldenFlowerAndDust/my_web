/**
 * Cloudflare Worker：专升本英语答疑代理
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
 *   POST /api/pending-word     Header: X-Tutor-Token
 *   GET  /api/pending-words    Header: X-Tutor-Token
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

function normalizeMode(raw) {
  const value = String(raw || "").trim();
  if (CATEGORIES.includes(value)) return value;
  return ALIASES[value.toLowerCase()] || "";
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

  const mode = normalizeMode(payload.mode);
  const question = String(payload.question || "").trim();
  if (!mode) {
    return json({ ok: false, error: "未知的答疑分类，请使用：单词解释 / 作文 / 句子分析 / 其他。" }, 400, request, env);
  }
  if (!question) {
    return json({ ok: false, error: "请输入要问的问题。" }, 400, request, env);
  }
  if (question.length > 2000) {
    return json({ ok: false, error: "问题太长了，请控制在 2000 字以内。" }, 400, request, env);
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
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({ mode, question }, null, 0),
          },
        ],
        temperature: 0.35,
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
    mode,
    question,
    answer,
    model,
    duration_ms: Date.now() - started,
    status: "ok",
  };
  const key = `log:${mode}:${createdAt}:${crypto.randomUUID()}`;
  const ttl = Math.max(1, Number(env.LOG_TTL_DAYS || 180) || 180) * 86400;

  let logged = true;
  let warning = "";
  try {
    await env.TUTOR_KV.put(key, JSON.stringify(record), { expirationTtl: ttl });

    // 单独的 log key 用于存档；index 用于快速读取历史，避免一次列出/读取大量 KV key。
    const indexKey = `index:${mode}`;
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
    mode,
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
    const values = await Promise.all(listed.keys.map((key) => env.TUTOR_KV.get(key.name, "json")));
    const entries = values
      .filter((item) => item && item.word)
      .sort((a, b) => String(b.created_at || b.time || "").localeCompare(String(a.created_at || a.time || "")));
    return json({ ok: true, total: entries.length, entries }, 200, request, env);
  } catch (error) {
    return json({ ok: false, error: "读取云端待归档单词失败。" }, 500, request, env);
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
  const rawCategory = url.searchParams.get("category") || "all";
  const category = rawCategory === "all" ? "all" : normalizeMode(rawCategory);
  if (!category) {
    return json({ ok: false, error: "未知的答疑分类。" }, 400, request, env);
  }
  let limit = Number(url.searchParams.get("limit") || 20);
  if (!Number.isFinite(limit)) limit = 20;
  limit = Math.max(1, Math.min(Math.floor(limit), 50));

  const categories = category === "all" ? CATEGORIES : [category];
  let entries = [];
  let total = 0;
  try {
    const indexes = await Promise.all(
      categories.map((name) => env.TUTOR_KV.get(`index:${name}`, "json")),
    );
    for (const index of indexes) {
      if (Array.isArray(index)) entries.push(...index);
    }
    entries = entries
      .filter((item) => item && typeof item === "object" && item.answer)
      .sort((a, b) => String(b.created_at || b.time || "").localeCompare(String(a.created_at || a.time || "")));
    total = entries.length;
    entries = entries.slice(0, limit);
  } catch (error) {
    return json({ ok: false, error: "读取云端日志失败，请稍后重试。" }, 500, request, env);
  }

  return json({ ok: true, category, total, entries }, 200, request, env);
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

  if (path === "/api/pending-words" && request.method === "GET") {
    return handlePendingWords(request, env);
  }

  if (path === "/api/tutor-log" && request.method === "GET") {
    return handleLog(request, env);
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
