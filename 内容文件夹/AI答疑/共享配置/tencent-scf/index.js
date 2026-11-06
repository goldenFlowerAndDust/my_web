/**
 * 腾讯云 SCF：国内入口 → 现有 Cloudflare Worker 反向代理
 *
 * 环境变量：
 *   UPSTREAM_BASE   https://english-tutor.goldenfloweranddust.workers.dev
 *   UPSTREAM_TOKEN  Cloudflare Worker 的 TUTOR_ACCESS_TOKEN
 *   PROXY_TOKEN     给国内页面使用的新访问口令
 *   ALLOWED_ORIGIN  https://goldenfloweranddust.github.io（或 *）
 *
 * API 网关路径：/api/health、/api/tutor、/api/tutor-log、
 *               /api/pending-word、/api/pending-words
 *
 * 运行环境：Node.js 18+（使用内置 fetch）
 */

const crypto = require("crypto");

function env(name, fallback = "") {
  const value = process.env[name];
  return value === undefined || value === null ? fallback : String(value);
}

function normalizeHeaders(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const key of Object.keys(raw)) {
    out[String(key).toLowerCase()] = String(raw[key] ?? "");
  }
  return out;
}

function allowedOrigin(requestOrigin) {
  const configured = env("ALLOWED_ORIGIN", "*").trim();
  if (!configured || configured === "*") return "*";
  if (requestOrigin === configured) return requestOrigin;
  return configured;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(origin),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Tutor-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function tokenMatches(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function normalizePath(rawPath) {
  let path = String(rawPath || "/");
  const idx = path.indexOf("/api/");
  if (idx >= 0) {
    path = path.slice(idx);
  } else if (path === "/health") {
    path = "/api/health";
  }
  path = path.split("?")[0].replace(/\/+$/, "");
  return path;
}

function queryString(event, rawPath) {
  const raw = event.queryString;
  if (typeof raw === "string" && raw) {
    return raw.replace(/^\?/, "");
  }
  if (raw && typeof raw === "object") {
    const search = new URLSearchParams();
    for (const key of Object.keys(raw)) {
      if (raw[key] !== undefined && raw[key] !== null) {
        search.append(key, String(raw[key]));
      }
    }
    const text = search.toString();
    if (text) return text;
  }
  const params = event.queryStringParameters;
  if (params && typeof params === "object") {
    const search = new URLSearchParams();
    for (const key of Object.keys(params)) {
      if (params[key] !== undefined && params[key] !== null) {
        search.append(key, String(params[key]));
      }
    }
    const text = search.toString();
    if (text) return text;
  }
  const at = String(rawPath || "").indexOf("?");
  return at >= 0 ? String(rawPath).slice(at + 1) : "";
}

function readBody(event) {
  if (event.body === undefined || event.body === null) return undefined;
  if (event.isBase64Encoded) {
    return Buffer.from(String(event.body), "base64").toString("utf8");
  }
  return String(event.body);
}

function originRejected(origin) {
  const configured = env("ALLOWED_ORIGIN", "*").trim();
  if (!configured || configured === "*") return false;
  // 浏览器请求会带 Origin；本地 curl 健康检查没有 Origin，放行。
  if (!origin) return false;
  return origin !== configured;
}

async function handleRequest(event) {
  const method = String(
    event.httpMethod || event.requestContext?.httpMethod || "GET"
  ).toUpperCase();
  const headers = normalizeHeaders(event.headers);
  const origin = headers.origin || "";
  const cors = corsHeaders(origin);

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (originRejected(origin)) {
    return response(403, { ok: false, error: "来源不在允许列表中。" }, cors);
  }

  const path = normalizePath(event.path || event.requestContext?.path || "/");
  if (!path.startsWith("/api/")) {
    return response(404, { ok: false, error: "未知接口。" }, cors);
  }

  const proxyToken = env("PROXY_TOKEN");
  if (!proxyToken) {
    return response(500, { ok: false, error: "SCF 未配置 PROXY_TOKEN。" }, cors);
  }

  if (path !== "/api/health") {
    if (!tokenMatches(headers["x-tutor-token"], proxyToken)) {
      return response(401, { ok: false, error: "访问口令不正确。" }, cors);
    }
  }

  const upstreamBase = env("UPSTREAM_BASE").replace(/\/+$/, "");
  const upstreamToken = env("UPSTREAM_TOKEN");
  if (!upstreamBase || !upstreamToken) {
    return response(
      500,
      { ok: false, error: "SCF 未配置 UPSTREAM_BASE / UPSTREAM_TOKEN。" },
      cors
    );
  }

  const qs = queryString(event, event.path || event.requestContext?.path || "");
  const upstreamUrl = upstreamBase + path + (qs ? `?${qs}` : "");
  const body = readBody(event);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 115000);
  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers: {
        "Content-Type": headers["content-type"] || "application/json",
        Accept: "application/json",
        "X-Tutor-Token": upstreamToken,
      },
      body: method === "GET" || method === "HEAD" ? undefined : body,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const message =
      error && error.name === "AbortError"
        ? "上游 Cloudflare Worker 请求超时。"
        : "无法连接上游 Cloudflare Worker：" + (error.message || "网络错误");
    return response(502, { ok: false, error: message }, cors);
  }
  clearTimeout(timer);

  const text = await upstream.text();
  return response(upstream.status, text, {
    ...cors,
  });
}

exports.main_handler = async (event) => {
  try {
    return await handleRequest(event || {});
  } catch (error) {
    const headers = normalizeHeaders(event && event.headers);
    const origin = headers.origin || "";
    const message = error && error.message ? error.message : String(error);
    console.error("scf proxy error:", error);
    return response(
      500,
      { ok: false, error: "SCF 内部错误：" + message },
      corsHeaders(origin)
    );
  }
};
