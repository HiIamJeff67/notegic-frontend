# Product media production

Create promotional videos, GIFs, screenshots, and publishing copy that show
Notegic's actual behavior. The entry point for agents is
[product-media-production](../../.agents/skills/product-media-production/SKILL.md).
Use the [Website guide](../introductions/website.md) for product terminology and
the [media index](../introductions/media-index.md) for existing assets and
individual edit decisions. This runbook owns the reusable production procedure;
the index owns capture history and the published asset inventory.

## Plan the demonstration

- Describe the user-visible result and the shortest understandable sequence.
  Preserve the distinction between notes, reference Materials, Routine
  definitions, and execution records. Do not present planned features as shipped.
- Choose a screenshot for a static state, a GIF for a short looping interaction,
  and a video for a complete workflow, detailed editing, or a scheduled wait.
  Roughly 5–25 seconds is useful GIF planning guidance, not a hard limit.
- Start from the agreed page and state. A workflow tour may start on Dashboard;
  a focused editor demonstration may start in that editor. Include creation
  when it explains the workflow rather than beginning with an unexplained object.
- Agree on the capture context and allowed mutations. Reuse disposable demo
  data where available. Previous read-only production captures do not authorize
  future writes; previous owner-operated creation does not authorize agent writes.
  Do not expose credentials, private notes, notifications, unrelated windows,
  or personal account information in public output.

## Capture with Cap

Use Cap's CLI or local MCP for capabilities it exposes. Inspect the installed
contract with `cap guide --json`, check readiness with `cap doctor --json`, and
discover the current capture target with `cap targets --json`. Consult current
help for start, status, stop, editing, and export arguments instead of copying
historical target IDs or version-specific flags.

For owner-operated takes, provide the steps, start the requested recording,
and leave application interaction to the owner. For an unknown duration, use
the supported detached recording lifecycle and verify the stopped recording
before editing. On a restart, stop the old take, confirm the actual start
screen, and preserve useful footage until the new result is reviewed.

Capture only the agreed window or region. Microphone, system audio, and camera
stay off unless requested. Test a short take for sharing indicators and frame
coverage before a long recording. If a tool reports permission or discovery
failure, diagnose the capturing process's permissions and current target list;
do not reset operating-system permissions or silently broaden the capture.

Local capture/export can be usable while Cap cloud/MCP authentication is
unavailable. Check the current CLI result rather than treating an old cloud
authentication failure as a local recording blocker. Do not log into an account,
change system permissions, install software, or enable cloud processing solely
because a historical setup note mentions it.

## Presentation and compositing

Reuse the owner's approved background and rounded application frame. Locate
the current source artwork or approved project; if unavailable, resolve that
missing asset rather than generating a replacement or claiming an old path works.

The current Website media uses a 1600 × 1200, 4:3 outer canvas. The static-image
default is a 1480 × 1110 application crop at `(60, 45)`; the workflow videos use
a 1480 × 990 frame at `(60, 105)`. These are existing presets, not permission
to stretch footage. Preserve the source aspect ratio, center the application,
and adjust the inner frame when the subject needs another crop. A focused
Sidebar image can be narrower while retaining enough surrounding context.

- Keep a uniform 1 px border directly on all four application edges. Composite
  the frame and application in RGB/RGBA, such as `overlay=format=rgb`, at exact
  integer coordinates before final encoder color conversion. YUV420 overlay can
  round odd offsets to even positions: `(61, 121)` may land at `(60, 120)`,
  hiding the top/left border and making the bottom/right border look thicker.
- Preserve actual UI, styles, menus, pointer movement, and relevant context.
  Do not synthesize missing cursor tracking, fake drag destinations, reconstruct
  controls, or hide a product limitation through compositing.
- Finder and other relevant native floating windows may overlap the application
  and extend over the background, but must remain inside the outer canvas.
  Composite them above the application mask and border. Capture their complete
  area in the source: window-only footage cannot recover pixels outside its
  capture boundary. Use an authorized supplemental take when necessary.
- Keep labels outside application controls. For an accelerated passive wait,
  use an English numeric indicator such as `>> 4x` in the background gutter.
  A requested clock/date overlay also belongs outside the application. Describe
  reconstructed capture time as an editing overlay, not a clock recorded in-app.

## Edit for clarity

Use the owner's requested speed and trim instructions. Recent approved clips
use 1.5× or 1.75× for interactions; they are examples, not a universal setting.
Trim idle openings, long pauses, repeated navigation, accidental browser-sidebar
exposure, and idle tails without removing the action or result being explained.
Keep names, payloads, settings, and success/error results readable. Accelerate
passive waits separately and visibly; do not accelerate important text merely
to meet a duration target.

Join supplemental footage at a matching state after the destination loads.
Preserve causal order and continuous time where it matters. Do not turn an old
execution record into evidence of a new run, remove a failed Save while claiming
success, or imply that creating a Task executes it. Retain the relevant evidence
when a workflow demonstrates scheduling, execution, and generated output.

Use GIF only while it remains useful as a loop. A longer or large GIF can be
converted to MP4 for seeking and efficient playback. Converting a GIF cannot
recover colors, resolution, or native-window regions already lost in that source.
Keep the existing cuts and speed unless another edit is requested.

## Export and verify

Inspect both metadata and decoded output with Cap's supported validation/export
tools and a compatible installed media inspector such as `ffprobe`/`ffmpeg`.
Do not install another tool merely to follow an old command. Verify:

1. Correct format, dimensions, aspect ratio, duration, speed, and requested audio.
2. Opening, closing, each join, key actions, success/error evidence, readable text,
   and retained pointer movement. Decode the GIF rather than trusting one still.
3. All four frame edges at normal scale, including after scrolling or zooming.
   Inspect floating-window boundaries and the entire outer canvas.
4. Consistent artwork and framing with neighboring approved assets, and no
   private information, sharing badge, unrelated browser UI, or accidental tail.
5. Accurate filenames, captions, numbering, local links, and published URLs.

Report defects that the available source cannot repair. Preserve a reviewed
output until its replacement passes. Clean up only task-owned temporary renders
and takes that are no longer needed; do not delete an unrelated recording library.

## Repository and publication handoff

Keep guide sources and reviewed images/GIFs under `docs/introductions/`.
Use descriptive filenames, with separate Image, GIF, and Video numbering in
captions. Keep raw captures, editor projects, temporary exports, and local YouTube
upload packages out of Git. The current `.gitignore` excludes `youtube/` packages;
that exclusion does not replace reviewing the staged file list.

The owner uploaded the current six videos publicly; their actual links live in
[youtube-urls.md](../introductions/videos/youtube-urls.md). Use those links for
public guide content rather than a workstation-local MP4. Uploading, changing
visibility, or publishing another asset requires an explicit instruction.
When asked, supply a complete, plain product title, a concise description of
the demonstrated outcome, relevant tags, and an accurate thumbnail. Avoid hype
and unsupported feature claims.

After changing the Website source, follow the
[Website generation workflow](website-guide.md), regenerate explicitly, and
review the generated TSX with its source. Image/GIF loading and video embedding
remain owned by Article components; do not add publishing or runtime dependencies
on this operational runbook or the media inventory.
