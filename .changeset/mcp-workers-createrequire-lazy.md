---
"@mastra/mcp": patch
---

Fix Cloudflare Workers crashing at module init. `createRequire(import.meta.url)` was called unconditionally at module scope to support optional Datadog tracing, but on Workers `import.meta.url` is undefined, so `createRequire` threw immediately on import -- crashing the whole worker before any code ran, even when Datadog was never used. `require` is now created lazily inside `loadDatadogTracer()`, only when Datadog tracing is actually detected.
