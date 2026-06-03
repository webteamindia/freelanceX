/**
 * Shared helpers for freelanceX smoke tests.
 */

export const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

export class SmokeRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.steps = [];
  }

  async step(name, fn, { optional = false } = {}) {
    const label = optional ? `${name} (optional)` : name;
    process.stdout.write(`${colors.cyan}→${colors.reset} ${label} ... `);
    try {
      const result = await fn();
      this.passed += 1;
      this.steps.push({ name, status: "pass", result });
      console.log(`${colors.green}OK${colors.reset}`);
      return result;
    } catch (err) {
      if (optional) {
        this.skipped += 1;
        this.steps.push({ name, status: "skip", error: err.message });
        console.log(`${colors.yellow}SKIP${colors.reset} ${err.message}`);
        return null;
      }
      this.failed += 1;
      this.steps.push({ name, status: "fail", error: err.message });
      console.log(`${colors.red}FAIL${colors.reset}`);
      console.log(`  ${colors.red}${err.message}${colors.reset}`);
      if (err.detail) {
        console.log(`  ${colors.dim}${JSON.stringify(err.detail)}${colors.reset}`);
      }
      throw err;
    }
  }

  summary() {
    console.log("\n" + "—".repeat(50));
    console.log(
      `${colors.green}${this.passed} passed${colors.reset}, ` +
        `${colors.red}${this.failed} failed${colors.reset}, ` +
        `${colors.yellow}${this.skipped} skipped${colors.reset}`
    );
    return this.failed === 0;
  }
}

export function assert(condition, message, detail) {
  if (!condition) {
    const err = new Error(message);
    if (detail !== undefined) err.detail = detail;
    throw err;
  }
}

export function createApiClient(baseUrl) {
  const normalized = baseUrl.replace(/\/$/, "");

  async function request(method, path, { token, body, query } = {}) {
    let url = `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
    if (query) {
      const params = new URLSearchParams(query);
      url += `?${params}`;
    }

    const headers = { Accept: "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return { status: res.status, data, ok: res.ok };
  }

  return {
    get: (path, opts) => request("GET", path, opts),
    post: (path, opts) => request("POST", path, opts),
    put: (path, opts) => request("PUT", path, opts),
    patch: (path, opts) => request("PATCH", path, opts),
    delete: (path, opts) => request("DELETE", path, opts),
  };
}

export function uniqueEmail(role) {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `smoke-${role}-${ts}-${rand}@ffiver.test`;
}
