---
file: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/intake/user-input.md'
description: 'Буквальная пользовательская постановка задачи для PRT-001-checkpoint-01-foundation.'
purpose: 'Сохраняет provenance исходных границ, порядка фаз, runtime/Git ограничений и требуемого финального handoff.'
version: '0.1.0'
date: '2026-08-01'
status: 'ACTIVE'
parent: '.memory-bank/protocol/PRT-001-checkpoint-01-foundation/index.md'
related_protocols:
  - .memory-bank/protocol/PRT-001-checkpoint-01-foundation/summary.md
tags: [protocol, source-user-input, INPUT-001, checkpoint-01]
history:
  - version: '0.1.0'
    date: '2026-08-01'
    changes: 'Сохранён буквальный содержательный ввод пользователя перед protocol bootstrap.'
---

# Raw user input

- `input_id`: `INPUT-001`
- `timestamp`: `2026-08-01T15:40:35+02:00`
- `source`: `codex_delegation.input`
- `source_thread_id`: `019fb9e5-2ecd-79e0-b5a3-2f9d9aac1624`
- `protocol_id`: `PRT-001-checkpoint-01-foundation`
- `run_id`: `N/A - dd-flow CLI unavailable; no run registered`

Ниже сохранён исходный пользовательский ввод без суммаризации или улучшения формулировок:

> Работай только с проектом /Users/deksden/Documents/_Projects/dd-tasks.
>
> Цель этой задачи — начать checkpoint-01-foundation строго по установленному Memory Bank/dd-flow. Выполни только две части: обязательный прайминг и стадию protocol. До specify, plan и code НЕ переходи: после полного завершения protocol остановись и дай итоговый отчёт для независимого ревью основной задачей.
>
> Обязательная последовательность:
> 1. Перейди в точный stable root /Users/deksden/Documents/_Projects/dd-tasks и проверь Git-состояние/ветку/remote/теги.
> 2. До любых изменений полностью прочитай .memory-bank/dd-flow/prime.md и все применимые правила/ссылки, которые он требует. Выполни прайминг честно; не подменяй его кратким просмотром.
> 3. Затем полностью прочитай .memory-bank/dd-flow/protocol.md и все применимые общие правила, MBB и project Memory Bank.
> 4. Создай/оформи протокол для checkpoint-01-foundation. Scope foundation ограничен README и .memory-bank/plans/index.md: pnpm monorepo; apps/web React+Vite+Tailwind+shadcn/ui; apps/api Hono; PostgreSQL+Drizzle+migrations; Biome; tsc --noEmit; Vitest; Playwright; deterministic seed/reset; root quality commands; минимальные health/error surfaces. Не реализуй код и не импортируй будущие продуктовые эпики как текущее поведение.
> 5. Соблюдай flow runtime/worktree/Git правила. Если штатный runtime CLI недоступен, зафиксируй честный degraded/file-only статус и используй только разрешённый fallback — не изобретай runtime state.
> 6. Проверь созданные артефакты, навигацию, traceability, границы scope, Git-контур и отсутствие скрытых eval-материалов. Выполни применимые lint/schema/consistency проверки.
> 7. Не коммить, не пушь и не создавай тег без отдельного разрешения. Не меняй checkpoint-00-initial и snapshot-00-memory-bank.
> 8. Заверши финальным сообщением: что прочитано при priming; protocol id/path; какие файлы изменены; принятый scope/out-of-scope; вопросы/DEF/blockers; verification evidence; точный следующий безопасный шаг. После protocol остановись перед specify.
>
> Если требуется содержательное решение пользователя, которого нет в README/Memory Bank, не угадывай: сформулируй вопрос и остановись на корректном gate.
