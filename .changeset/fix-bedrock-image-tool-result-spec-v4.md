---
"@mastra/core": patch
---

Fix image tool-results being sent in the removed spec-v3 `image-data`/`file-data` shape to genuine spec-v4 (LanguageModelV4) providers like Amazon Bedrock, which only accept `text`/`file` tool-result content. Spec-v4 models now get a dedicated conversion path that emits the tagged `file` shape (`{ type: 'file', data: { type: 'data', data }, mediaType }`) instead of being folded into the spec-v3 conversion.
