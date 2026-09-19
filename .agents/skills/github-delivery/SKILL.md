---
name: github-delivery
description: "Deliver the complete current frontend worktree through GitHub when the user explicitly invokes $github-delivery: inspect every tracked and untracked change, run required checks, create a meaningful devlog, use a proportional number of commits, and push until Git status is clean."
---

# GitHub delivery

This skill is explicit-action only. Never commit, push, open a PR, or alter remote state merely because a change is complete.

## Invocation contract

An explicit invocation of `$github-delivery` authorizes delivery of the complete current worktree in the target repository, including changes that predate the current task or were authored by the user. Inspect every tracked and untracked path, organize the work into an appropriate number of commits, commit every deliverable change, and push the current branch. Continue until `git status --short` is empty.

Do not omit or discard a change merely because it is unrelated to the latest request. Preserve all work and stop for clarification only when a path cannot be delivered safely—for example, it contains a likely secret, an unexplained generated or binary artifact, a merge conflict, or a required check that fails.

Invocation does not authorize creating or pushing tags, force-pushing, rewriting history, opening a PR, or merging. Those actions require a separate explicit request. In particular, never create a tag as part of normal delivery.

## Before delivery

- Inspect branch, remotes, status, diff, and user-authored changes; never discard unrelated work.
- Read `docs/conventions/07-version-control.md` and the relevant testing/security/accessibility/conventional docs.
- Confirm generated, route, localization, analytics, and sibling-repository effects before staging.
- Run the smallest sufficient local verification and report failures before delivery.
- Confirm generated artifacts are source-generated and that secrets, plaintext env files, credentials, and build output are not staged.
- Use the minimum sensible number of commits for the actual change size. Prefer one commit when the current worktree is small and can be reviewed safely as a unit, even when it contains several minor concerns. Split only when changes are materially large, independently reviewable or revertible, or require a clear dependency order; never split merely because files or concerns differ.

## Commit and remote actions

- Use the documented English lowercase commit format: `<type>(<optional-scope>)!: <description>`.
- When one commit contains multiple change items, keep a concise header and describe the items in the commit body with a Markdown bullet list, using one `- ` item per change. This is preferred over creating several tiny commits only to give each item its own header.
- For each planned group, stage only that group, run `npm run devlog`, stage the generated devlog entry, inspect `git diff --cached`, and then commit.
- Repeat grouping, verification, devlog generation, staging, and committing until no deliverable tracked or untracked changes remain.
- Before pushing, fetch and compare local and upstream history. Do not guess through divergence.
- Push the completed commit series only after the worktree is fully committed. Never force-push, rewrite history, or amend another commit without separate explicit instruction.
- Finish only after the push succeeds and `git status --short` is empty. Report the branch, every commit hash, checks, push result, confirmation that no tag was created, and any blocker if the worktree could not be made clean.

If the task spans the sibling backend repository, apply the same gates independently to both repos and state the coordinated order.
