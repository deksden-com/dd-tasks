# Аспект: навыки и инструкции агентов

## Цель

Проверить, что project-specific agent skills, prompts, runbooks and tool notes находятся в устойчивом месте, связаны с политиками проекта и не конфликтуют с каноническими flow.

## Нормативная база

- `.memory-bank/mbb/aspects/13-agent-skills.md`
- `.memory-bank/mbb/ai-runtime-prompt-architecture.md`
- `.memory-bank/dd-flow/index.md`

## Что читать в проекте

- `skills/`, agent guides and prompt/runbook folders;
- `.memory-bank/project-policy.md`;
- `spec/engineering/`, `spec/operations/`;
- recent protocol evidence where agents used special tools or profiles.

## Что проверять

- local skills are discoverable and scoped to project needs;
- provider/model/tool profiles for AI pipelines are documented when relevant;
- agent instructions do not bypass SDLC, Git, verification or security policies;
- deprecated skills/prompts have replacement hints or archive status.

## Какие `DEF-*` создавать

Группа: `SKILLS`.

Создавай `DEF-*`, если missing/conflicting agent guidance can cause unsafe writes, wrong model/tool usage, lost evidence or repeated flow mistakes.
