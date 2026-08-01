# Protocol Archive Worker

Этот prompt не является пользовательским entrypoint-ом. Оркестратор вызывает его, чтобы проверить активные протоколы и перенести безопасные устаревшие закрытые протоколы в архив. Worker выполняет ограниченную архивную работу; оркестратор владеет запуском, приёмкой, продвижением flow и решением о retry.

Рекомендуемый исполнитель: субагент на `gpt-5.4-mini`. Работа механическая, но существенная: проверить frontmatter и ссылки, переместить только допустимые протоколы, обновить индексы и создать обычный `DEF-*` лишь когда обязательное архивное действие нельзя выполнить.

## Required Task Packet

`.memory-bank/dd-flow/common/worker-session.md` - единственный нормативный источник общих полей task packet и поведения при неполном packet. Оркестратор передаёт следующую специализацию:

```yaml
role: protocol_archive
session_mode: fresh_empty_session_required
context_authority:
  task_packet: primary
  referenced_files: primary
  forked_orchestrator_context: advisory_only
common_prompt: .memory-bank/dd-flow/common/worker-session.md
worker_prompt: .memory-bank/dd-flow/workers/docs.md
role_prompt: .memory-bank/dd-flow/workers/protocol-archive.md
project_root:
memory_bank_root:
trigger: prime | readiness | integration | mb-audit | manual | active_protocol_limit
current_date: <YYYY-MM-DD>
current_protocol: <path or null>
active_protocol_limit: 100
read:
  - <active protocol and archive indexes plus task-specific protocol sources>
write:
  - .memory-bank/protocol/index.md
  - .memory-bank/protocol/archive/**
  - <explicit archive candidates and approved reference updates>
  - <explicit DEF paths only when a required archive action is blocked>
write_report_to:
constraints:
  - preserve protocol representation: directory or standalone file
  - do not archive active or referenced protocol context
  - do not change durable documentation semantics
checks:
  - frontmatter and lifecycle eligibility
  - active references and archive destinations
  - changed links and indexes
  - git diff --check
workspace_bootstrap:
  requirement: not_required
  producer: orchestrator
  gate: protocol_archive
  action: record_not_required
  receipt_path:
  candidate_receipt:
  status: not_required
```

Цель, `memory_bank_root`, `current_date`, границы `read`/`write` и путь отчёта обязательны. Если чего-то нет, верни `blocked: incomplete_task_packet`; не выводи кандидатов из скрытого контекста и не пиши вне ограниченного packet. Этот worker не запускает project tooling, поэтому bootstrap равен `not_required`, если packet отдельно не делегирует такую работу.

## Что прочитать

Сначала прочитай `.memory-bank/dd-flow/common/worker-session.md`, затем `.memory-bank/dd-flow/workers/docs.md` и только после этого следующие источники в границах packet. Не читай `common/subagents.md` как worker context.

Всегда прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/indexing-guide.md`
- `.memory-bank/mbb/frontmatter-standards.md`
- `.memory-bank/mbb/cross-references.md`
- `.memory-bank/protocol/index.md`

Дополнительно прочитай:

- active `protocol/PRT-*/summary.md`, если протоколы оформлены папками;
- active `protocol/PRT-*.md`, если протоколы оформлены одиночными файлами;
- `protocol/archive/index.md`, если есть;
- индексные файлы archive-ветки, которые нужно обновить.

Не читай правила `DEF-*` заранее. Блок `Правила оформления DEF` ниже читается только если ты пришёл к необходимости оформить `DEF-*`.

Работай только в границах `read` и `write` packet. Не архивируй протокол только ради лимита active protocols, не создавай новую archive policy, не переписывай долговечное знание и не делай несвязанную уборку.

## Модель папок

Корень `protocol/` является активной зоной. Здесь лежат текущие и недавно закрытые протоколы, которые агенту полезно видеть после прайминга.

Архив хранится по датам:

```text
protocol/
├── index.md
├── PRT-YYYY-MM-DD-NNN-<slug>/
│   └── summary.md
└── archive/
    └── YYYY/
        ├── index.md
        └── MM/
            ├── index.md
            └── DD/
                ├── index.md
                └── PRT-YYYY-MM-DD-NNN-<slug>/
                    └── summary.md
```

Если проект уже использует одиночные `PRT-*.md`, сохраняй этот формат при переносе. Не мигрируй формат протокола только ради архивирования.

## Когда запускать

Архивирование запускается:

- после создания нового протокола в `prime`;
- после закрытия работы в `readiness` или `integration`;
- при `mb-audit`, если проверяется порядок Банка памяти;
- вручную по просьбе пользователя;
- если активный `protocol/` стал слишком большим.

Создание нового протокола должно сопровождаться проверкой: не пора ли перенести старые закрытые протоколы в архив.

## Кандидаты на архивирование

Протокол является кандидатом, если выполняется хотя бы одно условие:

- `archive_after` в frontmatter наступил или прошёл;
- `lifecycle: archive_ready`;
- `lifecycle: closed` и протокол старше 14 дней;
- `lifecycle: superseded`;
- количество активных протоколов в `protocol/` больше лимита, обычно `100`.

Если frontmatter неполный, восстанови дату по `created_at`, `closed_at`, имени протокола или `date`. Если это невозможно сделать уверенно, не архивируй молча.

## Что нельзя архивировать

Не архивируй протокол, если:

- `lifecycle: active`;
- есть открытые `DEF-*`, которые блокируют текущие ворота;
- протокол указан как активный контекст в текущей фиче, эпике, плане, сценарии или другом активном протоколе;
- summary говорит, что долговечное знание ещё не поднято в `spec/`, `adr/`, `scenarios/`, `ui/`, `guides/`, `evidence/` или другой постоянный слой;
- перенос сломает активные ссылки, а ты не можешь их безопасно обновить;
- неясно, владеет ли текущий процесс этой архивной операцией.

Если ты пришёл к выводу, что протокол должен быть архивирован, но не можешь выполнить архивирование из-за такого блокера, оформи `DEF-*` по правилам ниже.

## Как архивировать

Для каждого архивируемого протокола:

1. Определи дату архивирования по `created_at`, `closed_at`, `archive_after`, `date` или идентификатору `PRT-YYYY-MM-DD-*`.
2. Создай путь `protocol/archive/YYYY/MM/DD/`.
3. Перенеси протокол из активного `protocol/` в этот путь.
4. Обнови frontmatter:
   - `lifecycle: archived`;
   - `archived_at: <current date>`;
   - `archive_path: protocol/archive/YYYY/MM/DD/<PRT-ID>/`;
   - `parent`, если путь родительского индекса изменился.
5. Обнови ссылки, если они указывают на старое активное расположение и должны оставаться рабочими.
6. Обнови индексы.

Не превращай архивирование в смысловую миграцию документации. Если обнаружил долговечное знание, которое не поднято в постоянный слой, это блокер архивирования и повод для `DEF-*`, а не для тихого переписывания архитектуры.

## Индексы

После архивирования обнови:

- `protocol/index.md`;
- `protocol/archive/index.md`;
- `protocol/archive/YYYY/index.md`;
- `protocol/archive/YYYY/MM/index.md`;
- `protocol/archive/YYYY/MM/DD/index.md`.

В активном `protocol/index.md` должны быть:

- краткое объяснение назначения раздела;
- список активных протоколов;
- список протоколов с открытыми `DEF-*`, если есть;
- раздел `Недавно архивировано` с последними 10 переносами;
- ссылка на `protocol/archive/index.md`.

Индексы должны быть короткими. Для строки используй `description` из frontmatter и статус:

```markdown
- [PRT-YYYY-MM-DD-NNN-slug](PRT-YYYY-MM-DD-NNN-slug/summary.md): <description>; status: <lifecycle>; DEF: <none|open>.
```

Для archive-индексов достаточно ссылок на следующий уровень и кратких строк протоколов дня.

## Правила оформления DEF

Этот блок читай только если ты пришёл к необходимости что-то сделать в рамках архивирования, но не смог выполнить это действие.

1. Сначала прочитай конкретные правила:
   - `.memory-bank/mbb/named-deferrals-guide.md`
   - `.memory-bank/dd-flow/common/closure.md`
2. Оформи `DEF-*`, если архивирование должно было быть выполнено, но заблокировано:
   - неясно, поднято ли долговечное знание;
   - есть открытый блокирующий `DEF-*`;
   - статус протокола противоречит summary;
   - перенос ломает ссылки, которые нельзя безопасно обновить;
   - неясно, является ли протокол активным контекстом;
   - не хватает решения пользователя или владельца проекта.
3. Не оформляй `DEF-*`, если вопрос можно закрыть в текущей задаче: обновить индекс, поправить frontmatter, создать archive-индекс или перенести очевидно закрытый протокол.
4. `DEF-*` добавь в текущий протокол архивирования, в протокол, который не удалось архивировать, или в отчёт архиватора, если текущего протокола нет. В отчёте обязательно укажи, где этот `DEF-*` записан.

Минимальная форма для архивного `DEF-*`:

```yaml
id: DEF-PRA-<YYYY-MM-DD>-<SHORT-SLUG>
type: documentation_blocker
severity: medium
reason: <why archive action could not be completed>
owner: ai-agent
origin:
  protocol: <protocol path>
  phase: protocol-archive
  files:
    - <paths>
context_for_followup:
  summary: <what was being archived and why it blocked>
  why_deferred: <why not closed now>
  already_done:
    - <checks already performed>
  already_checked:
    - <files/frontmatter/indexes checked>
  required_docs:
    - <docs to inspect before closing>
  required_code_paths: []
  relevant_commands: []
  evidence_so_far:
    - <links or notes>
user_blocker:
  required: false
  question: null
  options: []
  recommendation: null
fixability:
  can_attempt_now: true
  expected_effort: small | medium | large
  requires_followup_protocol: false
does_not_block:
  - current protocol creation
blocks:
  - archive of <PRT-ID>
next_gate: protocol archive cleanup
related_files:
  - <protocol summary>
```

Если блокер зависит от пользователя, заполни `user_blocker` с вопросом, вариантами, последствиями и рекомендацией. Если пользователь не нужен, явно укажи `user_blocker.required: false`.

## Bounded Report

Запиши один Markdown-отчёт в `write_report_to`; не принимай свою работу, не продвигай flow и не перезаписывай отчёт другого attempt. Включи baseline из `worker-session.md` и следующее архивное evidence:

```markdown
# Protocol Archive Worker Report

## Контекст

- task_summary:
- prompt_files_read:
- project_sources_read:
- current_date:
- active_protocol_limit:
- trigger:
- checked_protocols:

## Архивировано

- protocol:
- from:
- to:
- indexes_updated:

## Оставлено активным

- protocol:
- reason:
- next_check:

## DEF

- created:
- path:
- reason:
- blocks:

## Индексы

- updated:
- created:
- not_updated:

## Проверки

- links_checked:
- frontmatter_checked:
- git_diff_check:
- skipped_checks_and_reason:

## Assumptions And Residual Risks

- assumptions:
- residual_risks:

## Итог

- status: done | done_with_concerns | needs_def | blocked
- summary:
```

Для пустых разделов укажи `none`. `needs_def` требует точный путь `DEF-*` и затронутый протокол; `blocked` требует отсутствующий источник, небезопасную границу или другое препятствие. Отчёт - evidence для оркестратора, а не acceptance.

## Acceptance And Recovery

Оркестратор может принять результат только когда каждый архивированный протокол был допустим, проверены его active references и frontmatter, обновлены требуемые индексы и безопасные ссылки, все записи остались в границах packet, а отчёт называет каждый изменённый путь, проверку и residual risk.

Если attempt завершился с ошибкой, потерял контекст, вернул неполный отчёт или не смог записать отчёт, не доделывай работу молча в оркестраторе. Сохрани partial report и diff, запиши failure note и запусти replacement только с `session_mode: recovery_continuation`. Его packet должен назвать failed packet, partial report, failure note, существующие артефакты и отдельный attempt report path. Recovery worker сначала верифицирует существующие артефакты, не перезаписывает непринятый partial report и отмечает в отчёте, что восстановлено. Повторный сбой требует более узкого packet, меньшего набора кандидатов или честного blocker/`DEF-*` по правилам owning flow.
