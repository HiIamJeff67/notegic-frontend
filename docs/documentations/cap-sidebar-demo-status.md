# Sidebar demo: local Cap setup

Status: the production sidebar trial has been recorded and rendered locally.
Review the [GIF, MP4, and overview still](sidebar-demo/README.md).
This is a local setup note, not public product documentation.

## Verified installation

- Cap Desktop 0.6.1: `/Applications/Cap.app`.
- Bundled CLI 0.1.0: `/Applications/Cap.app/Contents/MacOS/cap-cli`.
- CLI shim: `/Users/jeff/.local/bin/cap` (already on PATH).
- Official Cap and Cap Demo skills installed under
  `/Users/jeff/.codex/skills/`.
- Local MCP entry merged into `/Users/jeff/.codex/config.toml`:
  `cap = { command = "cap", args = ["mcp", "serve"] }`.
- App and CLI code signatures passed verification outside the execution
  sandbox; Gatekeeper accepted the notarized app.
- `cap automations list --json` returned no rules.
- `cap record status --json` returned no active recordings.

The current CLI works, but the MCP server refuses to initialize without Cap
account authentication (`AUTH_REQUIRED`). No Cap cloud login was attempted.
Local capture and export were verified through the CLI; cloud access was not
needed for this trial. Codex was restarted to reload the installed integration.
The configured MCP server is not yet an authenticated, verified connection.

## Permission issue: resolved

Initially, Cap was enabled for Screen & System Audio Recording but
ChatGPT.app was disabled. CLI diagnostics reported `screenRecording: denied`
and `captureReady: false`, and window discovery returned an empty list.

After the user enabled the additional permission and reopened ChatGPT.app,
diagnostics returned `screenRecording: granted` and `captureReady: true`.
The production Zen window could then be discovered and recorded. No
permissions were reset or changed by the agent.

The permission test reported an Accessibility warning for input tracking.
The final recording contained no usable cursor-motion samples, so the trial
uses Cap's manual-focus zoom and no synthesized cursor. No additional
Accessibility grant was requested. The real pointer can remain visible in
the source capture.

## Agreed trial

- Production: `https://www.notegic.com/app/dashboard`.
- Capture only the relevant browser window, without microphone, camera, or
  system audio.
- Use read-only sidebar navigation; do not create, edit, or delete production
  resources.
- Start with an overview, zoom into the sidebar, show the hierarchy, and zoom
  back out.
- Use Cap's simple dark background and browser frame; no generated images or
  screenshot slideshow.
- Keep recording, editing, and exports local. Do not invoke uploads, shareable
  links, or cloud processing.
- Verify a short capture for the system sharing indicator before the full take.
- Save reviewed output under this documentation directory and remove only
  temporary files created for this trial.

## Result

The trial uses a 12-second continuous selection from the real production
recording, Cap's native dark background and browser frame, and a manual 1.85×
sidebar zoom. The website was not resized or modified to create the effect.
Only the selected browser window was captured, with no audio or camera.

Cap reported complete recording metadata and passed project validation.
The GIF was decoded and its opening, zoomed, expanded, collapsing, and closing
frames inspected. The sidebar groups were returned to their starting state;
no production content was created, edited, or deleted.

No Cap cloud login, upload, or sharing command was used. Temporary recordings
and intermediate exports were removed after final verification; the reviewed
assets are kept in [sidebar-demo](sidebar-demo/README.md).
