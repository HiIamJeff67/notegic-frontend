---
name: github-delivery
description: "Prepare and deliver frontend changes through GitHub safely: inspect scope, run required checks, create a meaningful devlog, commit with repository conventions, and push only when explicitly requested. Use for commit, push, branch, PR, or submission preparation."
---

# GitHub delivery

This skill is explicit-action only. Never commit, push, open a PR, or alter remote state merely because a change is complete.

## Before delivery

- Inspect branch, remotes, status, diff, and user-authored changes; never discard unrelated work.
- Read `docs/conventions/07-version-control.md` and the relevant testing/security/conventional docs.
- Run the smallest sufficient local verification and report failures before delivery.
- Confirm generated artifacts are source-generated and that secrets, plaintext env files, credentials, and build output are not staged.
- Add a functional devlog using `npm run devlog` when the repository workflow requires it; do not create a devlog-only commit.
- Stage only intended files and inspect the staged diff.

## Commit and remote actions

- Use the documented English lowercase commit format: `<type>(<optional-scope>)!: <description>`.
- Commit only after the user explicitly asks for a commit or delivery. Push only after the user explicitly asks to push.
- Before pushing, verify the target branch/remote and whether the work is intended for a PR. Never force-push, rewrite history, or amend another commit without explicit instruction.
- After delivery, report commit hash, branch, remote action, checks, and any remaining uncommitted files.

If the task spans the sibling backend repository, apply the same gates independently to both repos and state the coordinated order.
