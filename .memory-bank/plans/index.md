---
file: '.memory-bank/plans/index.md'
description: 'Подтверждённое направление планирования.'
purpose: 'Связывает approved foundation plan с source-backed реализацией и acceptance evidence.'
version: '0.5.0'
date: '2026-08-02'
status: 'ACTIVE'
c4_level: 'project'
parent: '.memory-bank/index.md'
history:
  - version: '0.5.0'
    date: '2026-08-02'
    changes: 'Local foundation integration и readiness accepted; текущий RUN-005 ведёт user-authorized direct fixation с exact tag/remote targets через обход только queue completion defect CLI 0.4.0.'
  - version: '0.4.0'
    date: '2026-08-02'
    changes: 'Foundation fast-forward integrated into main; fresh integrated-checkout scenario, quality, docs and DB checks passed; checkpoint fixation remains user-gated.'
  - version: '0.3.0'
    date: '2026-08-02'
    changes: 'Local readiness accepted after fresh SCN-001, quality, browser, DB and docs checks; canonical merge remains next.'
  - version: '0.2.0'
    date: '2026-08-02'
    changes: 'Foundation plan реализован в feature branch; verification matrix и SCN-001 остаются владельцами readiness acceptance.'
---
# Плановое направление

README задаёт foundation scope: pnpm workspaces; apps/web на React, Vite,
Tailwind CSS и shadcn/ui; apps/api на Hono; PostgreSQL с Drizzle и
миграциями; Biome, tsc --noEmit, Vitest, Playwright, детерминированные
seed/reset-команды. Этот scope source-backed реализован в feature branch и
принят после local readiness; local integration завершена в stable `main`.
Для checkpoint fixation текущий протокол использует отдельный RUN-005:
annotated tag `checkpoint-01-foundation`, `main` → `origin/main`, tag → `origin`,
без force; CI, release, deploy и production claims по-прежнему отсутствуют.

- [Матрица проверки foundation](verification-matrix.md) — canonical row for
  `SCN-001`; после свежего readiness run строка принята как `accepted_local`.
