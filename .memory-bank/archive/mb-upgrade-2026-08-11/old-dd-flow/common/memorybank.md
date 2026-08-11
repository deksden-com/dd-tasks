# Общая привязка к Банку памяти

Перед выполнением любой фазы прочитай:

- `.memory-bank/index.md` - рабочий вход в проектный Банк памяти.
- `.memory-bank/structure.md` - карта разделов и правила размещения документов, если файл есть.
- `.memory-bank/project-policy.md` - top-level policy hub, если файл есть.
- `.memory-bank/mbb/index.md` - канонические правила ведения Банка памяти.
- Дополнительные документы MBB, указанные в конкретной фазе.

Если проект использует другой путь, например `memory-bank/`, адаптируй путь, но сохраняй смысл: сначала рабочий индекс проекта, затем карта структуры, затем policy hub, затем правила MBB.

## Порядок источников

1. Проектный Банк памяти - главный источник правил конкретного проекта.
2. MBB - канонический источник подхода, если проектное правило отсутствует или требует уточнения.
3. Код и конфигурация - источник точного текущего поведения.
4. Протокол - рабочий след конкретной волны, но не вечный владелец архитектурной истины.

Если источники расходятся, не замазывай противоречие. Зафиксируй его в протоколе, предложи решение и обнови правильный долговечный документ.

## Write-permission preflight

Если flow собирается создавать или менять active Memory Bank files, `.tasks`, `DEF-*`, dashboard-и или evidence, до первой записи прочитай и выполни `common/memorybank-write-preflight.md`.

Это отдельный gate от `mb-lint`: он проверяет фактические права текущего пользователя на macOS/Linux/Windows/WSL и предотвращает partial writes при root-owned, ACL-denied, read-only или immutable файлах.

`mb-audit` в read-only части использует `mode: read`, а перед сохранением reports/DEF/dashboard повторяет gate в `mode: report_only`.

## Active DEF preflight

`DEF-*` - это известная нерешённая задача, незакрытое решение или отложенный gate проекта. Относись к DEF как к активному входному контексту, а не как к архивной заметке.

Перед обычной работой с задачей, уже на этапе анализа пользовательского запроса и сбора проектного контекста, найди активные именованные отложения проекта:

- `DEF-*` / `DEF-MBU-*` в `.memory-bank/defs/index.md` и `.memory-bank/defs/DEF-*.md` - это первый canonical durable lookup;
- `DEF-*` в активном протоколе или protocol summary;
- `DEF-*` в `plans/`, `scenarios/`, `spec/operations/`, verification matrix, release docs and closure reports;
- `DEF-*` или known policy gaps из `.memory-bank/project-policy.md`;
- `DEF-*` / `DEF-MBU-*` в legacy/project-local deferral layer, если проект еще не мигрировал на `.memory-bank/defs/`;
- `DEF-*` в `.tasks/` текущей рабочей волны, если они относятся к текущему протоколу;
- ссылки на open deferrals из `.memory-bank/index.md`, `.memory-bank/structure.md` и профильных индексов.

Не читай `.tasks/` старых unrelated запусков как долговечную истину. Если deferral должен пережить запуск агента, он должен быть поднят в активный Банк памяти или связан из активного документа.

Для каждого найденного DEF определи:

- какую нерешённую задачу или решение он представляет;
- относится ли он к текущей пользовательской задаче, flow, touched area, scenario, evidence or delivery gate;
- что он блокирует: plan, code, merge, beta, production, scenario, documentation или только future follow-up;
- можно ли закрыть его в текущей работе;
- требуется ли решение пользователя;
- какой next gate указан и наступил ли он.

Действия:

- `relevant_close_now` - попытайся закрыть DEF или запусти `def/plan.md` / `def/fix.md`;
- `relevant_blocks_current_gate` - остановись или явно включи DEF в blockers;
- `relevant_non_blocking` - учитывай в scope, verification and report;
- `not_relevant` - не трогай, но при нетривиальном flow кратко зафиксируй причину;
- `stale_or_malformed` - не игнорируй; передай в `mb-audit`/`mb-fix` или создай follow-up.

Если DEF указывает на выбор, который влияет на понимание пользовательской задачи, границы work scope, Git/delivery route, сценарии или acceptance evidence, вынеси его в раннее обсуждение с пользователем. Не жди позднего readiness/merge gate, если решение нужно для честного плана.

Если задача пользователя начинается с накопленных DEF или пользователь просит разобраться с DEF, можно сначала запустить `.memory-bank/dd-flow/fix-def.md`: он read-only, группирует DEF и предлагает scope для последующего `protocol.md`, но сам ничего не пишет и не регистрирует.

Финальный доклад task flow должен содержать active DEF summary: какие DEF учтены, какие закрыты/обновлены, какие остались, что они блокируют и кто следующий владелец.

## Куда поднимать долговечное знание

- Продуктовый смысл, акторы, роли, доменные понятия - в `spec/product/`.
- Устройство системы, подсистемы, контракты, взаимодействия - в `spec/system/`.
- Стандарты кода, тестов, документации кода и агентной разработки - в `spec/engineering/`.
- Ветки, окружения, релизы, выкладка, откат и эксплуатационные ворота - в `spec/operations/`.
- SDLC контуры - Git policy, environment/stage policy, release policy, deploy/publish policy, verification policy and runbooks - в `spec/operations/` или локальный operations layer проекта.
- Верхнеуровневые project defaults, route-affecting policy links, check profile summary, automation policy reference and policy gaps - в `project-policy.md`.
- Причины выбора при наличии альтернатив - в `adr/`.
- Исполняемые приемочные пути - в `scenarios/`.
- Интерфейсные контракты, экраны, дизайн-система и визуальные референсы - в `ui/`.
- Пользовательские инструкции - в `guides/`.

Протокол может временно собрать всё это во время реализации. После закрытия важные выводы должны быть разнесены по своим постоянным домам.

## Knowledge Candidates

`knowledge candidates` из `<run-home>/01-specify/knowledge-extraction/candidates.json` являются provisional. Для legacy run путь может быть `.tasks/dd-flow-runs/<RUN-ID>/01-specify/knowledge-extraction/candidates.json`, если так записано в `run-index.json`. Они сохраняют пользовательские вводные, source quotes, target layer hints и merge verification hints, но не являются долговечной истиной Банка памяти.

Durable truth появляется только после merge-time promotion:

- `promoted` - записано в правильный durable layer;
- `already_documented` - уже покрыто существующим Memory Bank;
- `task_local_only` - остаётся в протоколе/specification;
- `not_applicable` или `rejected` - не поднимается;
- `deferred_as_DEF` или `needs_user_confirmation` - требует явного follow-up;
- `blocked` - закрытие текущего gate запрещено.

При promotion учитывай и code-derived knowledge: изменения в prompts, contracts, checks, tests, docs, release/deploy/Git policy and evidence, даже если они не пришли из raw user intake.
