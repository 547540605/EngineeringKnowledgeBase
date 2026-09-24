---
name: engineering-knowledge-base
description: Use the shared EngineeringKnowledgeBase when the user asks to add, record, remember, document, or check reusable engineering knowledge. Search the central knowledge base first and add only genuinely new topics. The central README is the rules authority; do not change those rules from another project.
---

# Shared Engineering Knowledge Base

Use this skill to maintain the user's shared EngineeringKnowledgeBase from any Codex project.

## Canonical location and authority

- Resolve the knowledge-base root on the current computer in this order:
  1. The `ENGINEERING_KB_ROOT` environment variable, when it points to a directory containing
     `README.md`.
  2. The compatible default: `C:\Repository\547540605\EngineeringKnowledgeBase`.
- If neither location is available, do not read or write knowledge. Tell the user to follow
  `PLUGIN-INSTALL.md` in the GitHub repository and start a new task after configuring the path.
- In the instructions below, `KB_ROOT` means the resolved knowledge-base root.
- Canonical rules: `KB_ROOT\README.md`
- Reader-facing update summary: `KB_ROOT\CHANGELOG.md`
- Browser documentation site: `https://547540605.github.io/EngineeringKnowledgeBase/`

Always read `KB_ROOT\README.md` before deciding where or how to record knowledge. Do not copy its
rules into this skill: the README is the single source of truth and may evolve independently of the
plugin.

The current README says the repository is both a human knowledge system and an AI/RAG/agent memory
source. Its important operating principles include recording reusable knowledge, preserving facts,
examples, logs, and errors, keeping one topic per subject, searching before adding, and recording
domain and related/upstream/downstream knowledge.

## Browser documentation site

The browser site is a read-only presentation and sharing entry point for the same Markdown
repository. Use it when the user wants to browse or share a human-friendly page. Use the local
`KB_ROOT` Git tree as the authority for duplicate checks and all writes.

- The site may lag behind the repository until the GitHub Pages workflow finishes.
- A topic visible on the site is evidence that it exists; link to its browser URL when useful.
- A topic missing from the site is not evidence that it is absent from the repository. Always search
  the local `KB_ROOT` tree before adding.
- Never write through the website and never treat the website as the rules source.
- After adding a topic, tell the user that the browser page will become available after the repository
  is pushed and the Pages deployment succeeds.
- The browser site renders LaTeX equations with MathJax. When recording mathematical content, use
  inline LaTeX such as `$K_p e(t)$` and display LaTeX on separate lines as `$$ ... $$`; do not rely
  on Unicode approximations or plain-text underscores for subscripts and integrals. Keep formulas
  inside fenced code blocks only when showing literal source text rather than a rendered equation.

## Scope boundary

When this skill is invoked from a project other than the canonical knowledge-base root:

- You may read the central knowledge base.
- You may add a new knowledge topic to the central knowledge base when the user explicitly asks to
  add, record, remember, document, or save it.
- You must not edit the canonical README's rules, rewrite the knowledge-base structure, or modify
  this plugin's instructions.
- If the user asks to change a rule, explain that rules can only be changed explicitly from the
  canonical knowledge-base project, then stop that rule-changing action.
- Do not write the knowledge into the current product/project repository unless the user separately
  asks for a project-local copy.

This is an agent policy. File-system permissions may still require user approval when the current
project is outside the knowledge-base directory.

## Add-knowledge workflow

Follow this workflow whenever the user asks to add knowledge.

### 1. Read the rules first

Read `KB_ROOT\README.md` and any applicable rule or structure documentation under `KB_ROOT`. If the
canonical README cannot be read, do not write anything; report the path and the reason.

### 2. Search before writing

Search the entire `KB_ROOT` tree with exact terms, important synonyms, error messages, API names,
and distinctive phrases from the user's description. Prefer `rg` or an equivalent fast text search.

Inspect promising matches instead of relying only on filenames. Determine whether the same concept,
problem, or reusable solution is already covered.

### 3. Apply the user's duplicate policy

- If an existing topic covers the requested knowledge, do not add, append, or rewrite anything.
- Report that it already exists and give the matching file path and relevant section.
- Do not “improve” an existing topic unless the user explicitly asks to update or expand it.
- Treat a genuinely different concept as a new topic even when it is related; link the topics rather
  than merging unrelated subjects.

### 4. Record only a new topic

If no existing topic covers it:

- Classify it using the existing knowledge hierarchy and current README rules.
- Keep one topic per subject; do not create a chronological conversation dump.
- Use a searchable, keyword-rich title.
- Prefer the repository's existing structure. While the README says the current stage may record all
  knowledge in the root README, use an existing dedicated topic file or domain directory if the
  repository has since evolved and its rules support that placement.
- Record durable facts: problem or context, root cause, solution, example, conclusion, and notes as
  applicable.
- Preserve code, commands, logs, and error messages verbatim when they are useful for future search,
  RAG, or troubleshooting.
- Include the topic's domain plus related, upstream, and downstream knowledge where meaningful.
- Keep the change narrowly scoped to the new topic. Do not rewrite unrelated content or change rules.

### 5. Verify the result

After writing, re-read the changed section or file and verify:

- the topic was not already present;
- the title is searchable;
- the content follows the canonical README;
- examples and logs were preserved;
- related knowledge is named;
- Markdown structure and links remain valid.

Report whether the topic was added or skipped as a duplicate. For an addition, report the exact file
and a short summary of the recorded topic. For a duplicate, report the existing file and section.

### 6. Record the reader-facing update summary

When a new topic was added or an existing topic was explicitly updated, update the canonical
`CHANGELOG.md` in the same turn before publishing:

- Use the current date in `YYYY-MM-DD` format. Add to that date's existing section when present;
  otherwise create a newest-first date section.
- Put the entry under `新增` for a new topic or `更新` for an explicitly changed topic. Use `维护`
  only for reader-visible structure or documentation-site changes.
- Link to the changed knowledge file and give one concise, factual sentence about what changed and
  why it matters. Do not duplicate the full article or Git commit message.
- Do not add an entry if the requested topic was a duplicate and no knowledge file changed.

### 7. Publish a verified addition

When a new topic was added or an existing topic was explicitly updated, publish it so the browser
documentation site can follow the repository:

1. Before writing, record the canonical repository's existing Git status. After writing, compare the
   status again and identify the exact files changed by this turn.
2. If the repository contains unrelated pre-existing changes, do not stage, commit, or push them.
   Report that automatic publishing stopped because the canonical tree is dirty and list the paths
   that need to be handled from the knowledge-base project.
3. If the only changes are the verified topic files from this turn plus `CHANGELOG.md`, stage those
   exact paths only. Never use a blanket `git add -A` or stage generated `docs/`/`site/` output.
4. Review the staged diff, commit with a focused message, and push `main` to the configured `origin`.
   Do not rewrite history, force-push, or modify the canonical README as part of publishing.
5. After a successful push, report the commit, the `CHANGELOG.md` entry, and tell the user that
   GitHub Actions will rebuild and publish the browser site. The site is a read-only view and may
   take a short time to reflect the new topic. If authentication, network, or Git permissions
   prevent the push, report that the local topic was added but the browser site cannot update until
   the push succeeds.

## Conversation interpretation

Use this skill for explicit requests such as “记录下来”, “加入知识库”, “写到仓库”, “后面可能会
用”, “记住这个”, “整理成文档”, or “加到工程知识库”. If the user only asks a normal technical
question and does not ask to record it, answer the question without changing the knowledge base.
