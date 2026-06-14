---
"@mastra/otel-exporter": patch
---

RAG_EMBEDDING spans now export with proper OTel GenAI semantic conventions: gen_ai.operation.name is set to "embeddings", gen_ai.request.model and gen_ai.provider.name are populated from embedding attributes, token usage is mapped to gen_ai.usage.* attributes, and SpanKind is CLIENT. Embedding-specific metadata (dimensions, inputCount, mode) is preserved on mastra.rag_embedding.* attributes. This enables Langfuse and other OTel backends to correctly identify and cost-track embedding observations.
