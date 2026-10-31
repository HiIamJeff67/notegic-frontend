---
name: product-media-production
description: Plan, capture, edit, and verify Notegic promotional videos, GIFs, screenshots, and publishing copy using real product behavior and the established media presentation.
---

# Product media production

Use this workflow for Notegic product demonstrations and promotional media,
including retakes, clip assembly, screenshots, thumbnails, and video metadata.
For application code changes, follow the repository's coding and test skills.

## Read first

- [Product media runbook](../../../docs/runbooks/product-media-production.md):
  capture, editing, presentation, privacy, and verification requirements.
- [Website guide](../../../apps/web/src/pages/document/website/sources/website.md): current product
  terminology and the user workflow being demonstrated. Check the running
  application and source when the guide and current behavior differ.
- [Documentation media](../../../apps/web/assets/document/): shipped images,
  GIFs, and the walkthrough recording. Match filenames to the Website guide
  captions; the production runbook records capture requirements and limitations.

## Workflow

1. Establish the subject, audience, intended result, output format, and current
   application environment. Reuse approved media and presentation before
   proposing another capture or background. Give the owner a short ordered
   walkthrough before a live recording and start when they indicate readiness.
2. For Cap operations, use the installed Cap skill and CLI/local MCP first.
   Discover the current command contract and capture readiness; do not assume
   that old installation versions, authentication, permissions, or target IDs
   remain valid. Capture only the agreed window or region, without audio or
   camera unless requested. Use computer-use tools for application interactions,
   not to replace Cap capabilities exposed through its CLI/MCP.
3. When the owner operates the application, record their actions without
   performing parallel mutations. A demonstration request alone does not
   authorize changing production records, settings, permissions, or schedules.
   Use the existing authorized demo context and preserve explicit Save steps.
4. Follow the requested trim, speed, sequence, and presentation. On a retake,
   stop the active take before starting another and verify the required start
   screen. Preserve source footage through review. Never invent missing UI or
   imply that browsing an old execution record demonstrates a new execution.
5. Inspect the exported result, not only the editor preview: opening, transitions,
   important actions, ending, frame edges, floating windows, timing, and text
   readability. Replace a reviewed asset only after the replacement passes.
6. Keep reviewed media in `apps/web/assets/document/` and update affected
   [Website guide](../../../apps/web/src/pages/document/website/sources/website.md) links/captions. Use the
   owner's actual published video links recorded in that guide.
   Prepare plain, accurate titles, descriptions, and tags when requested;
   publishing or uploading requires its own explicit instruction.

Report output paths, duration, dimensions, playback speed, and unresolved
capture limitations. Keep exports local unless publication is in scope; do not
commit raw takes, Cap projects, temporary renders, or local upload packages.
