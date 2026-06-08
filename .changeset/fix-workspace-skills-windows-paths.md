---
"@mastra/core": patch
---

fix(workspace-skills): handle Windows backslash path separators

WorkspaceSkills hardcoded '/' as the path separator in five places,
causing skills configured with absolute Windows paths
(e.g. C:\Users\me\skills\my-skill) to load with wrong names or fail
entirely. Adds a splitPathSegments() helper that splits on both '/'
and '\' and updates #getParentPath, #discoverDirectSkill, addSkill,
and #determineSource to use it.

Fixes #17670
