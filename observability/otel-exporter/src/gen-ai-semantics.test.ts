import { SpanType } from '@mastra/core/observability';
import type { AnyExportedSpan, ModelGenerationAttributes, RagEmbeddingAttributes, UsageStats } from '@mastra/core/observability';
import { describe, it, expect } from 'vitest';
import { getAttributes, formatUsageMetrics } from './gen-ai-semantics';

function createModelGenerationSpan(attributes: ModelGenerationAttributes): AnyExportedSpan {
  return {
    id: 'test-span-id',
    traceId: 'test-trace-id',
    name: 'test-generation',
    type: SpanType.MODEL_GENERATION,
    startTime: new Date(),
    isRootSpan: false,
    isEvent: false,
    attributes,
  } as AnyExportedSpan;
}

describe('getAttributes - token usage', () => {
  it('should extract basic tokens', () => {
    const span = createModelGenerationSpan({
      model: 'gpt-4',
      provider: 'openai',
      usage: { inputTokens: 100, outputTokens: 50 },
    });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.usage.input_tokens']).toBe(100);
    expect(attrs['gen_ai.usage.output_tokens']).toBe(50);
  });

  it('should extract cacheRead from inputDetails using OTel-spec attribute name', () => {
    const span = createModelGenerationSpan({
      model: 'claude-3-opus',
      provider: 'anthropic',
      usage: { inputTokens: 1000, outputTokens: 200, inputDetails: { cacheRead: 800 } },
    });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.usage.cache_read.input_tokens']).toBe(800);
  });

  it('should extract cacheWrite from inputDetails using OTel-spec attribute name', () => {
    const span = createModelGenerationSpan({
      model: 'claude-3-opus',
      provider: 'anthropic',
      usage: { inputTokens: 1000, outputTokens: 200, inputDetails: { cacheWrite: 500 } },
    });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.usage.cache_creation.input_tokens']).toBe(500);
  });

  it('should extract reasoning from outputDetails', () => {
    const span = createModelGenerationSpan({
      model: 'o1-preview',
      provider: 'openai',
      usage: { inputTokens: 100, outputTokens: 500, outputDetails: { reasoning: 400 } },
    });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.usage.reasoning_tokens']).toBe(400);
  });
});

describe('formatUsageMetrics', () => {
  it('should extract basic tokens', () => {
    const usage: UsageStats = { inputTokens: 100, outputTokens: 50 };
    const result = formatUsageMetrics(usage);
    expect(result['gen_ai.usage.input_tokens']).toBe(100);
    expect(result['gen_ai.usage.output_tokens']).toBe(50);
  });

  it('should extract cacheRead from inputDetails using OTel-spec attribute name', () => {
    const usage: UsageStats = { inputTokens: 1000, outputTokens: 200, inputDetails: { cacheRead: 800 } };
    const result = formatUsageMetrics(usage);
    expect(result['gen_ai.usage.cache_read.input_tokens']).toBe(800);
  });

  it('should extract cacheWrite from inputDetails using OTel-spec attribute name', () => {
    const usage: UsageStats = { inputTokens: 1000, outputTokens: 200, inputDetails: { cacheWrite: 500 } };
    const result = formatUsageMetrics(usage);
    expect(result['gen_ai.usage.cache_creation.input_tokens']).toBe(500);
  });

  it('should extract reasoning from outputDetails', () => {
    const usage: UsageStats = { inputTokens: 100, outputTokens: 500, outputDetails: { reasoning: 400 } };
    const result = formatUsageMetrics(usage);
    expect(result['gen_ai.usage.reasoning_tokens']).toBe(400);
  });

  it('should not emit non-spec cache attribute names that older versions used', () => {
    const usage: UsageStats = {
      inputTokens: 1000,
      outputTokens: 500,
      inputDetails: { cacheRead: 600, cacheWrite: 200 },
    };
    const result = formatUsageMetrics(usage) as Record<string, unknown>;
    expect(result['gen_ai.usage.cached_input_tokens']).toBeUndefined();
    expect(result['gen_ai.usage.cache_write_tokens']).toBeUndefined();
  });

  it('should return empty metrics for undefined usage', () => {
    const result = formatUsageMetrics(undefined);
    expect(result).toEqual({});
  });
});

function createRagEmbeddingSpan(attributes: RagEmbeddingAttributes): AnyExportedSpan {
  return {
    id: 'test-span-id',
    traceId: 'test-trace-id',
    name: 'rag_embedding test-embedding-model',
    type: SpanType.RAG_EMBEDDING,
    startTime: new Date(),
    isRootSpan: false,
    isEvent: false,
    attributes,
  } as AnyExportedSpan;
}

describe('getAttributes - RAG_EMBEDDING spans', () => {
  it('sets gen_ai.operation.name to "embeddings"', () => {
    const span = createRagEmbeddingSpan({ model: 'text-embedding-3-small', provider: 'openai' });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.operation.name']).toBe('embeddings');
  });

  it('maps model to gen_ai.request.model', () => {
    const span = createRagEmbeddingSpan({ model: 'text-embedding-3-small', provider: 'openai' });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.request.model']).toBe('text-embedding-3-small');
  });

  it('maps provider to gen_ai.system via normalizeProvider', () => {
    const span = createRagEmbeddingSpan({ model: 'text-embedding-3-small', provider: 'openai' });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.provider.name']).toBe('openai');
  });

  it('maps usage.inputTokens to gen_ai.usage.input_tokens', () => {
    const span = createRagEmbeddingSpan({
      model: 'text-embedding-3-small',
      provider: 'openai',
      usage: { inputTokens: 42, outputTokens: 0 },
    });
    const attrs = getAttributes(span);
    expect(attrs['gen_ai.usage.input_tokens']).toBe(42);
  });

  it('preserves embedding-specific metadata on mastra.rag_embedding.* attributes', () => {
    const span = createRagEmbeddingSpan({
      model: 'text-embedding-3-small',
      provider: 'openai',
      dimensions: 1536,
      inputCount: 10,
      mode: 'ingest',
    });
    const attrs = getAttributes(span);
    expect(attrs['mastra.rag_embedding.dimensions']).toBe(1536);
    expect(attrs['mastra.rag_embedding.input_count']).toBe(10);
    expect(attrs['mastra.rag_embedding.mode']).toBe('ingest');
  });
});
