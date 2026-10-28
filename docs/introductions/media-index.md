# Website media index

Review inventory for [Website](website.md). Image numbers follow their order in
the guide, not alphabetical file order. GIFs and videos are numbered separately
in their order of appearance. Names and numbers belong in captions, not on top
of application controls.

## Status

- 21 static images are available in `images/`.
- 4 completed GIFs are available in `videos/` and embedded in the Website guide.
- 6 videos are published on YouTube and embedded in the Website guide; the
  canonical links are in [youtube-urls.md](videos/youtube-urls.md).
- Local MP4 upload packages are ignored under `videos/youtube/`, not shipped
  with the application or required to read this inventory.
- Video 04 (Material viewer) still needs supplemental import footage to show Finder completely
  outside the application frame; its original window recording clipped Finder.
- This inventory is internal. The English Website source is published through
  explicit TSX generation; see the [Website guide workflow](../runbooks/website-guide.md).

## Production procedure

Use the [Product media production skill](../../.agents/skills/product-media-production/SKILL.md)
and its [runbook](../runbooks/product-media-production.md) for capture readiness,
format selection, the 4:3 canvas, RGB frame alignment, floating windows,
trimming, playback speed, and export verification. This inventory records the
specific media, edit decisions, and limitations rather than duplicating that
procedure.

The static-image batch used unsubmitted forms and unsaved widget arrangements.
Images 01–10 show actual widget controls and the held-drag destination preview;
no production layout was saved for the batch. Image 11 uses a centered
576 × 1106 application crop at `(512, 47)` to focus on Sidebar navigation.

## Static images

All images below are completed captures for editorial review, not a claim that
the owner has approved every composition.

| ID       | Name and file                                                      | Website section                                    | What to inspect                                                                                                  |
| -------- | ------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Image 01 | [Dashboard overview](images/dashboard-overview.png)                | Beginning → Demonstration                          | Clock, Timer, To-do list, Calendar, and Scratch Pad in one unsaved demonstration layout; no guide/video widgets. |
| Image 02 | [Widget picker](images/widgets-defaults-picker.jpg)                | Dashboard → Widgets → Defaults                     | Clock and Timer previews; Guides grouping.                                                                       |
| Image 03 | [Clock settings](images/widgets-clock-settings.jpg)                | Widgets → Defaults → Clock                         | Timezone, style, visibility toggles, and font-size controls.                                                     |
| Image 04 | [Timer duration](images/widgets-timer-duration.jpg)                | Widgets → Defaults → Timer                         | Hour, minute, second, Save, and Cancel.                                                                          |
| Image 05 | [To-do list controls](images/widgets-todo-usage.jpg)               | Widgets → Defaults → To-do list                    | Centered widget; visible link/delete icons, checkbox, grip, Add new item, and Save changes.                      |
| Image 06 | [Calendar navigation](images/widgets-calendar.jpg)                 | Widgets → Defaults → Calendar                      | Complete date grid, month/year controls, arrows, and selected date.                                              |
| Image 07 | [Scratch Pad editing](images/widgets-scratch-pad-editing.jpg)      | Widgets → Defaults → Scratch Pad                   | Markdown source, widget controls, and Save changes.                                                              |
| Image 08 | [Scratch Pad preview](images/widgets-scratch-pad-preview.jpg)      | Widgets → Defaults → Scratch Pad                   | The same text rendered as a heading and list.                                                                    |
| Image 09 | [Widget drag destination](images/dashboard-layout-editing.jpg)     | Widgets → Usage → Move and resize                  | Actual owner-operated held drag: empty origin and pale destination preview. No layout was saved.                 |
| Image 10 | [Widget actions menu](images/widgets-item-menu.jpg)                | Widgets → Usage → Edit a widget                    | Edit and Delete menu, without executing either action.                                                           |
| Image 11 | [Sidebar overview](images/sidebar-overview.jpg)                    | Sidebar overview                                   | Sidebar navigation and hierarchy, with limited Dashboard context.                                                |
| Image 12 | [Block insertion menu](images/editor-block-menu.jpg)               | Block pack editor → Insert a block                 | Headings and basic-block entries in an unsubmitted template draft.                                               |
| Image 13 | [Diagram preview](images/editor-diagram-preview.jpg)               | Block pack editor → Math and diagrams              | Start → Stop rendered from Mermaid, without a selected-block outline.                                            |
| Image 14 | [Diagram source editor](images/editor-diagram-code.jpg)            | Block pack editor → Math and diagrams              | The same source, its preview, and OK; the draft was discarded.                                                   |
| Image 15 | [Routines overview](images/routines-overview.jpg)                  | Routine overviewer                                 | Station scope, empty time rail, and chart context. Charts can have a different scope.                            |
| Image 16 | [Chart picker](images/routines-chart-picker.jpg)                   | Routine overviewer → Charts                        | Overall/Routine previews and Added markers; no chart was added.                                                  |
| Image 17 | [Station creation form](images/station-create-form.jpg)            | Create your first routine → Create a station       | Name, description, icon, and background URL; form canceled.                                                      |
| Image 18 | [Routine creation form](images/routine-create-form.jpg)            | Create your first routine → Configure a routine    | Timeout, custom schedule, repeat, and pin; form canceled.                                                        |
| Image 19 | [Routine date and time picker](images/routine-schedule-picker.jpg) | Create your first routine → Choose dates and times | Calendar, 12H/24H, hour/minute lists, and associated start field.                                                |
| Image 20 | [Appearance preferences](images/preferences-appearance.jpg)        | Preference settings → Appearance                   | Theme, language, density, motion, and feedback; settings unchanged.                                              |
| Image 21 | [Editor preferences](images/preferences-editor.jpg)                | Preference settings → Editor                       | Reading width, text size, wrapping, spellcheck, and drag-handle preferences.                                     |

Images 12–14 use the production task template editor with the same block schema,
not an autosaved production note. Their crop focuses on the editing pane. The
draft was closed without saving its payload or creating a task. The standard
Block Pack editor can expose additional slash-menu items.

## Owner recordings

These clips preserve owner-operated application interactions. Playback speeds,
retained intervals, and exceptions below describe these particular edits;
future recordings follow the requested workflow and the shared runbook.

### Completed GIFs

All four clips use a 1600 × 1200 canvas, the approved background, a directly
aligned rounded frame, and the recorded macOS cursor. Excess opening and closing
holds were trimmed; playback speed is listed for each clip.

| ID     | Name and file                                           | Duration | Speed | Actual coverage                                                                      |
| ------ | ------------------------------------------------------- | -------- | ----- | ------------------------------------------------------------------------------------ |
| GIF 01 | [Sidebar navigation](videos/sidebar-navigation.gif)     | 5.21 s   | 1.5×  | Expand a Shelf and its subcategories; show the document hierarchy and hover hints.   |
| GIF 02 | [Sharing and permissions](videos/sharing-and-permissions.gif) | 18.33 s | 1.2× | Open the participant controls and Sharing overview; inspect permission and status without changing access. |
| GIF 03 | [Routine dependencies](videos/routine-dependencies.gif) | 20.46 s  | 1.5×  | Inspect existing nodes, view task information, and zoom/pan; no dependency creation. |
| GIF 04 | [Settings presentation](videos/settings-presentation.gif) | 14.54 s | 1.5× | Switch Preferences from a full page to a side sheet and back, including theme and editor reading-width controls; end on the full settings page. |

GIF 04 uses four intervals from the retake: 16–19, 23–31.8, 34–40.5, and
41–44.5 seconds. It removes extended pauses and ends before the owner returns
to Dashboard; later desktop operations are excluded. The owner's theme and
editor reading-width changes remain visible. The clip uses the corrected RGB
compositing path so the 1 px application border stays aligned on all four sides.

### Published videos

| ID | Name and file | Duration | Speed | Actual coverage |
| --- | --- | --- | --- | --- |
| Video 01 | [Website quick tour](https://youtu.be/pH21Od0Io58) | 42.73 s | 1.5× | Dashboard widget interactions, Sidebar navigation, existing Block Packs, PDF preview and page changes, the Routine dependency graph, and a top-to-bottom Routines overview through charts, definitions, and existing execution records. |
| Video 02 | [First note](https://youtu.be/s05mQsBdZ9Q) | 52.60 s | 1.5× | Create Research Project and Topic Notes, create and name Research Summary, write a heading, paragraph, and bulleted list, then return from Dashboard to the same note once. |
| Video 03 | [Block Pack editing](https://youtu.be/sloOOtnHToM) | 52.00 s | 1.5× | Extend Research Summary with a Sources heading, a two-column table, checklist entries, a TypeScript code block, a Read → Summarize → Review Diagram, and block reordering. |
| Video 04 | [Material viewer](https://youtu.be/xQ77zM2-PxM) | 36.00 s | 1.75× | Create a Material, import a PDF, inspect its path, zoom, change pages, and use annotation controls. |
| Video 05 | [Routine setup and results](https://youtu.be/H2PQbdqwrq0) | 134.00 s | 1.75×; 4× while waiting | Create Research Automation and Create Research Brief, configure a Create Brief task and date-pattern template, connect Start to the task, correct the schedule, inspect a successful execution record, and open the generated Research Brief. |
| Video 06 | [Routine task payload](https://youtu.be/CvWLjJelp9A) | 35.33 s | 1.5× | Configure a Create BlockPack payload, select a destination, edit the name and template, inspect generated JSON, and create the Task successfully. |

Video 01 retains source intervals 25–49.5, 51.5–64, and 68.2–86.3 seconds
from the Dashboard-start retake, followed by 0.5–9.5 seconds from the supplemental
Routines overview scroll recording. Both sources play at 1.5×. The join occurs
after the overview loads, replacing the original brief scrolling and idle tail
with a continuous top-to-bottom pass and a short final hold. It removes the long
opening wait and document-loading gaps. It starts on Dashboard and ends at the
Routine Task record table. The records and their captured statuses already
existed; browsing them does not demonstrate running a new Routine or a
successful execution.
The clip uses the approved background, recorded macOS cursor, and RGB-aligned
rounded frame on a 1600 × 1200 canvas. The application is centered in a
1480 × 990 frame at (60, 105) to accommodate this recording's viewport ratio.
All application interactions were owner-operated; the agent only recorded and
edited the footage. No audio, camera, or upload is included.

Video 02 retains source intervals 13–42, 50.5–57.5, 62.3–91.8, and 94.6–108
seconds from the final First note retake, all at 1.5×. It removes opening and
closing waits, an idle hold before naming the Block Pack, a loading gap, and a
pause between list entries. The first Dashboard-to-note return remains to show
how to find the note again; subsequent repeated entries and the remaining tail
are excluded. The clip ends on the completed note. It uses the same canvas,
background, frame geometry, and cursor treatment as Video 01. Record creation
and editing were owner-operated; the agent only recorded and edited the
footage. No audio, camera, or upload is included.

Video 03 retains the continuous source interval 0–78 seconds from the final
Block Pack editing retake at 1.5×. The opening is unchanged and there are no
middle cuts. The clip ends shortly after block reordering is complete, excluding
the remaining tail and the owner's reported browser-sidebar intrusion. It uses
the same canvas, background, frame geometry, and recorded cursor treatment as
Video 01. The table has Source and Status headers; the clip does not demonstrate
populated data rows or checking off an item. Editing was owner-operated; the
agent only recorded and edited the footage. No audio, camera, or upload is
included.

Video 04 replaces the former Material viewer GIF. It retains source intervals
16–54, 56.5–70.5, 72–78.5, and 81.5–86 seconds at 1.75×. These keep Material
creation, PDF import, zoom, page changes, and annotation interactions, while
removing later idle holds and part of the reload wait. The clip ends after
returning to the PDF's first page instead of holding through the remaining
tail. Creation, import, and annotation interactions were owner-operated, not
automated production mutations by the agent.

Video 05 retains source intervals 0–192.5 seconds at 1.75×, 192.5–208.5
seconds at 4×, and 208.5–243.5 seconds at 1.75×. The schedule correction remains
visible. Only the passive wait uses 4×, marked by a large `>> 4x` below the
application from playback 1:50 to 1:54; the success indicator, execution-record
details, and generated note remain at 1.75×. The long idle tail is removed,
ending on the generated note. It uses the same canvas, background, frame
geometry, and recorded cursor treatment as Video 01.

The lower-right clock and date stay outside the application in the background
gutter. The clock reconstructs recorded local time from the capture directory's
creation time, 2026-10-28 15:24:40 UTC+8, plus the source offset for each frame;
it advances with each segment's speed. It is an editing overlay with roughly
one-second precision, not a clock captured inside the application. All record
creation, schedule changes, and execution were owner-operated; the agent only
recorded and edited the footage. No audio, camera, or upload is included.

Video 06 replaces the former Routine task payload GIF. It retains the retake's
continuous source interval from 6 to 59 seconds, including the owner's explicit
Task creation and success result, but excluding the subsequent deletion used
to clean up the demonstration Task. No Routine execution is shown, and the
agent performed no application writes.

Videos 04 and 06 are converted from the existing edited GIFs to H.264 MP4 at
1600 × 1200 and 30 fps, without additional cuts or speed changes. Background,
frame, recorded cursor, and content remain as shown in those GIFs. Conversion
does not recover colors or Finder regions already absent from the GIF sources.

### Remaining capture notes

All six published videos are linked above. The supplemental Finder capture
for Video 04 remains outstanding as noted in Status; the existing converted
source cannot recover that missing region.

Keep the JSON explanation in the accompanying prose for Video 06. Do not
accelerate important text merely to keep a clip short.

Preparing or recording a demonstration does not authorize production mutations.
Workflows that create records, change permissions, save settings, or execute
tasks require an explicitly approved disposable demonstration context before
those actions are performed.

## Verification

Verify every static-image link, caption number, and file dimension together.
Keep filenames descriptive and stable when replacing a capture. A screenshot
of a menu or scrollable dialog does not imply that every item is visible at once;
the surrounding prose must not claim otherwise.
