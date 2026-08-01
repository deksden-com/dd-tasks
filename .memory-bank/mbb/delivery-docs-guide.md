---
file: '.memory-bank/mbb/delivery-docs-guide.md'
description: 'MBB guide: how to use epic, feature, spec, protocol, and scenario documents without duplication.'
purpose: 'Read when creating or updating delivery-oriented documentation so epic/feature/spec/protocol/scenario roles stay clear and useful.'
version: '0.5.0'
date: '2026-06-30'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
tags: [mbb, delivery, epic, feature, spec, protocol, scenario, traceability]
related_files:
  - .memory-bank/mbb/glossary.md
  - .memory-bank/mbb/spec-layer-guide.md
  - .memory-bank/mbb/user-guides-layer.md
  - .memory-bank/mbb/ui-layer-guide.md
  - .memory-bank/mbb/scenario-runner-guide.md
  - .memory-bank/mbb/named-deferrals-guide.md
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Initial delivery document separation guide.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Clarified actor-oriented epics, vertical feature slices, user docs impact, UI impact, and scenario runner links.'
  - version: '0.3.0'
    date: '2026-05-12'
    changes: 'Added feature-group semantics, scenario placement policy, protocol-as-integrator rule, ADR separation, and named deferral closure guidance.'
  - version: '0.4.0'
    date: '2026-05-12'
    changes: 'Усилены правила протокола как временного интегратора, добавлены нормативная спецификация-компаньон и пакетный граф реализации.'
  - version: '0.5.0'
    date: '2026-06-30'
    changes: 'Clarified canonical plans/epics layout, protocol sets, evidence semantics, and semantic split between epic, feature, spec, ADR, scenario, protocol and evidence.'
---

# Delivery Docs Guide

Этот guide фиксирует, как в Memory Bank разводить delivery-oriented документы, чтобы они помогали разработке и не дублировали друг друга.

Краткий словарь терминов живет в [MBB Glossary](glossary.md). Этот guide раскрывает практические правила применения.

## Canonical delivery layout

Для новых проектов эпики и фичи живут в `plans/epics/`:

```text
memory-bank/plans/epics/
└── EP-XXX-<slug>/
    ├── index.md
    └── features/
        └── FT-XXX-YY-<slug>.md
```

Top-level `memory-bank/epics/` является legacy/project-local совместимостью. Не используй его как новый default без явного решения проекта.

## 1. Epic

`Epic` — это область доставляемой ценности, которая делится на фичи и явно называет, кто этой ценностью пользуется.

Канонический новый путь: `memory-bank/plans/epics/EP-XXX-<slug>/index.md`.

Используй epic для:
- описания области ценности;
- указания акторов, которым эта ценность нужна;
- разбиения работы на фичи;
- связи фич со сценариями и пользовательскими путями;
- отслеживания прогресса на верхнем уровне;
- связи закрытия фич с доказательствами.

Не используй epic для:
- подробных implementation plans;
- API-level design;
- длинных execution logs;
- детальной технической аргументации по каждому шагу.

Хороший epic отвечает:

- кто получает пользу;
- какая пользовательская или системная способность появляется;
- какие фичи входят;
- какие акторы участвуют в проверке;
- какие сценарии подтверждают, что ценность реально доставлена.

Если в проекте много акторов, полезно иметь отдельный документ уровня планов или спецификаций, где описаны роли, права и основные сценарные акторы. Epic тогда ссылается на этот документ, а не повторяет всю модель ролей.

### Epic и область фичи

В крупных проектах может появиться дополнительный словарь: `feature_group`, "область фичи" или "область возможности".

Это не замена эпика.

Эпик отвечает:

- какую связанную область ценности доставляем;
- каким акторам она нужна;
- какие фичи входят;
- как прогресс закрывается доказательствами.

Область фичи отвечает:

- как стабильно назвать повторяющуюся продуктовую или системную область;
- как связать фичи, сценарии, матрицы проверки и спеки, если они пересекают несколько эпиков;
- как не потерять словарь после закрытия конкретного эпика.

Пример:

```text
эпик: Операторская панель управления
области фич: роли и доступ, диагностика, рабочие пространства
фича: оператор приглашает сотрудника и видит изменение доступа
```

Область фичи полезна, когда одна и та же способность участвует в нескольких эпиках. В маленьком проекте ее можно не вводить.

## 2. Feature

`Feature` — это минимальная поставка ценности, которую можно проверить.

Канонический новый путь: `memory-bank/plans/epics/EP-XXX-<slug>/features/FT-XXX-YY-<slug>.md`.

Используй feature для:
- пользовательского или системного результата;
- акторов, которые используют или проверяют результат;
- scope / non-goals;
- affected areas;
- grounding links;
- acceptance intent;
- связи с вертикальным срезом реализации;
- влияния на интерфейс и пользовательскую документацию;
- high-level implementation plan;
- evidence and closure state.

Не используй feature для:
- полного technical design;
- длинного протокола реализации;
- хранения всех промежуточных решений.

### Feature as vertical slice

Фичу удобно описывать вертикально: от пользовательского или системного результата к слоям, которые должны измениться.

Типовой вертикальный срез:

```text
контракт операции
-> доменная логика / прикладной сценарий
-> данные / миграции / seed
-> клиентский набор методов
-> командная строка
-> текстовый или графический интерфейс
-> тесты и сценарии
-> пользовательская документация
```

Не каждая фича проходит через все слои. Но документ фичи должен явно сказать, какие слои затронуты, а какие не применяются.

Код при этом не обязан раскладываться "одна папка на FT". Долгоживущая структура кода обычно группируется по устойчивым областям изменения и владения. Фича проходит через эти области вертикально, а не создаёт свою временную архитектуру.

### User docs impact

Для пользовательской фичи нужно указать, что происходит с `guides/`:

- `N/A`, если фича внутренняя;
- обновить учебник, если меняется первый ключевой путь;
- добавить или обновить практическую инструкцию, если появляется новая задача;
- обновить справочник, если меняются роли, статусы, команды или маршруты;
- добавить объяснение, если появляется новая модель, которую пользователю нужно понять.

Подробные правила описаны в [User Guides Layer](user-guides-layer.md).

### UI impact

Если фича меняет интерфейс, она должна указать:

- какие `screen_id` затронуты;
- какие экранные спецификации меняются;
- меняется ли дизайн-система или `DESIGN.md`;
- какие стабильные идентификаторы нужны для автоматизации;
- какие сценарии подтверждают интерфейсный результат.

Подробные правила описаны в [UI Layer Guide](ui-layer-guide.md).

## 3. Spec

`Spec` — это grounded implementation design.

Используй spec для:
- architecture/design decisions for implementation;
- migration plan;
- regression gates;
- risks and rollout;
- implementation grounding on current codebase.

Spec отвечает на вопрос:
- “Как именно это реализуем в текущем проекте?”

Спецификации живут в нормативном слое `spec/`. Рекомендуемый верхний разрез описан в [Spec Layer Guide](spec-layer-guide.md):

- `spec/product/` - продуктовый смысл, акторы, доменная терминология;
- `spec/system/` - устройство системы, подсистемы, контракты, C4;
- `spec/engineering/` - стандарты кода, тестов, агентной разработки;
- `spec/operations/` - git flow, релизы, rollout, rollback.

Фича может ссылаться на несколько спецификаций, но не должна копировать их содержание.

## 3a. ADR

`ADR` — это запись архитектурного решения.

Используй ADR для:

- решений с реальными альтернативами;
- изменения границ подсистем, пакетов или репозиториев;
- выбора клиентской архитектуры, data model, deployment model или rollout policy;
- решений, которые команда иначе будет переоткрывать заново.

ADR отвечает на вопрос:
- "Почему выбран этот путь и какие альтернативы отвергли?"

Чем ADR не является:

- не является фичей;
- не является технической спецификацией реализации;
- не является протоколом выполнения;
- не является местом для статуса работ.

Spec может ссылаться на ADR и описывать уже выбранную норму. Protocol может породить ADR, но не должен заменять его.

## 4. Protocol

`Protocol` — это интегрирующий документ реализации волны работ.

Используй protocol для:
- cross-epic или cross-layer implementation waves;
- миграций и рефакторингов, которые не укладываются в одну фичу;
- планирования задач исполнителей и проверяющих;
- remediation cycles;
- links to runs, evidence, and key decisions;
- фиксации того, что реально происходило и чем это подтверждено.

Protocol отвечает на вопрос:
- “Как ведём и закрываем эту волну работ, и что нужно разнести по постоянным источникам правды?”

Protocol является исполнимым SDLC-документом. Он должен быть достаточно узким, чтобы реально пройти `specify -> plan -> code/readiness -> merge`, и не должен становиться зонтичной спецификацией.

На этапе реализации protocol может временно держать план, task packets, verifier packets, отчеты, промежуточные решения, именованные отложения, evidence и closure state.

### Протокол и нормативная спецификация-компаньон

Для большой волны протокол (protocol) не должен быть единственным местом проектного решения. Если работа меняет устройство системы, границы продукта и платформы, контракты, данные, релизный порядок или пользовательскую модель, рядом должна появиться нормативная спецификация-компаньон (normative design companion).

Логика разделения такая:

- протокол (protocol) ведет выполнение: пакеты работ, исполнителей, проверки, отклонения, доказательства и закрытие;
- спецификация (specification) фиксирует устойчивую норму: как система должна быть устроена после завершения волны;
- запись архитектурного решения (architecture decision record, ADR) объясняет, почему выбран именно этот путь;
- сценарии (scenarios) показывают, как поведение воспроизводимо доказывается.

Это правило нужно, чтобы следующий агент не читал старый протокол как вечную архитектурную истину. Протокол остается историей выполнения и закрытия, а долговечное знание поднимается в свой слой.

Нормативная спецификация-компаньон особенно нужна, если волна:

- вводит новый контракт между подсистемами;
- принимает платформенный слой в продуктовом проекте;
- меняет клиентский набор методов (client SDK) или управляемые интерфейсы;
- меняет модель данных, миграции, релиз или эксплуатационные ворота;
- порождает несколько сценариев приемки и доказательных артефактов.

Чем она не является:

- не является пересказом протокола;
- не хранит журнал выполнения;
- не заменяет ADR, если были реальные альтернативы;
- не должна копировать код вместо описания границ, инвариантов и связей.

### Пакетный граф реализации

Для крупной волны протокол должен описывать пакетный граф реализации (implementation packet graph): какие пакеты идут последовательно, какие можно делать параллельно, где находятся барьеры и кто проверяет результат.

Рекомендуемые элементы:

- `Prime` - операционный предварительный контроль (operational preflight): ветка, рабочее дерево, базовый commit, открытые и закрытые ворота;
- `P0` - контрактный или архитектурный барьер, если без него нельзя безопасно распараллеливать работу;
- `P1..Pn` - пакеты реализации с владельцем и границами записи;
- пакеты проверки (verifier packets), которые не смешиваются с реализацией;
- локальные, стендовые и релизные ворота приемки (acceptance gates).

Польза графа не в формальной нумерации. Он нужен, чтобы агент не начал править зависимый слой раньше контракта, не смешал несколько владельцев в одном файле и не закрыл волну без независимой проверки.

После закрытия долговечное знание должно быть поднято:

- причины выбора -> `adr/`;
- устройство системы -> `spec/system/`;
- инженерные правила -> `spec/engineering/`;
- rollout/deploy правила -> `spec/operations/`;
- проверяемые пути -> `scenarios/`;
- интерфейсные контракты -> `ui/`;
- пользовательские инструкции -> `guides/`.

Чем protocol не является:

- не является вечным владельцем архитектурной истины;
- не является заменой ADR;
- не является местом для сырых логов;
- не является вторым feature doc.

### Runtime vs curated protocol layer

В зрелом Memory Bank могут быть два связанных, но разных protocol слоя:

- runtime-published protocol summaries
  - `memory-bank/protocol/runs/*.md`
  - публикуются системой автоматически из runtime state
  - дают краткий curated trace по shaping / mini / acceptance / beta verification
- hand-authored delivery protocols
  - `memory-bank/protocol/[EP-XXX]/[FT-XXX-YY]/YYYY-MM-DD-[slug].md`
  - ведутся человеком/flow как curated implementation or remediation narrative

Правило:
- raw runtime state и полные workspace logs остаются в project runtime storage;
- в Memory Bank публикуются curated-протоколы и паспорта проверки;
- `.tasks/` остаётся локальной рабочей зоной агента и по умолчанию не коммитится;
- если из `.tasks/` нужно сохранить результат, оформи его как `protocol/<PRT-ID>/`, паспорт проверки в `evidence/` или профильный документ вместо ссылки на `.tasks/...`.

Активный документ не должен зависеть от `.tasks/...`, если `.tasks/` игнорируется Git. Такая ссылка полезна только внутри локального рабочего отчёта; в коммитнутом Memory Bank она превращается в битую или невоспроизводимую ссылку.

### Protocol sets

Если согласованный объем слишком велик для одного исполнимого протокола, используй protocol set:

```text
memory-bank/protocol/_set/PSET-XXX-<slug>.md
```

Protocol set координирует несколько member protocols, но не заменяет их. Каждый `PRT-*` остается исполнимым документом со своим scope, gates, evidence and closure.

Минимальные правила:

- protocol set хранит decomposition rationale, member list, shared source intake and set-level acceptance;
- member protocols указывают `protocol_set` and `blocked_by_protocols` in frontmatter;
- member protocols считаются parallelizable by default;
- ordering задается только через `blocked_by_protocols`, если нет отдельного проектного решения;
- final report каждого member protocol показывает, какие downstream protocols ready, blocked, running or done.

## 5. Scenario

`Scenario` — это исполняемый platform/use-case verification contract.

Используй scenario для:
- canonical end-to-end или lifecycle verification;
- проверки platform capability в подготовленной среде;
- фиксации preconditions, phases, expected evidence и pass criteria;
- связи архитектурных решений с реальными reproducible rehearsal runs.

Scenario отвечает на вопрос:
- “Как именно доказываем, что система/flow/capability реально работает в целевом use case?”

Scenario **не** заменяет unit/integration/e2e tests:
- тесты проверяют код и контракты;
- scenario проверяет платформу или lifecycle block как operational flow с evidence.

Если сценарии требуют seed-данных, фикстур, фаз, нескольких акторов, артефактов и очистки, проекту нужен отдельный исполнитель сценариев. Переносимая спецификация такого исполнителя описана в [Scenario Runner Guide](scenario-runner-guide.md).

### Где хранить сценарии и evidence

По умолчанию сценарии живут в отдельном каноническом каталоге:

```text
memory-bank/scenarios/SCN-XXX-<slug>.md
memory-bank/scenarios/XE-XXX-<slug>.md
```

Даже если сценарий появился из конкретной фичи, он часто переживает эту фичу:

- становится регрессионной проверкой;
- закрывает несколько фич;
- участвует в beta acceptance;
- проверяет сквозной пользовательский путь;
- используется в релизном verdict.

Фича должна ссылаться на сценарии и evidence, а не владеть единственной копией сценария.

Допустимое упрощение для маленького проекта: хранить сценарии рядом с фичами до появления отдельного сценарного слоя. Как только сценарий становится переиспользуемым или cross-feature, его нужно вынести в `scenarios/`.

Evidence можно хранить в `evidence/`, рядом с protocol конкретной волны или рядом со scenario run. В любом случае scenario doc хранит curated contract и expected evidence, а не сырые логи.

Если evidence родилось как рабочий файл в `.tasks/`, verifier report или runtime run directory, при закрытии этапа его нужно оформить как паспорт проверки. Хорошая форма для протокола:

```text
memory-bank/protocol/PRT-XXX-<slug>/
├── index.md
├── summary.md
└── evidence/
    ├── VP-<proof-id>.md
    └── artifacts.md
```

`evidence/VP-<proof-id>.md` должен объяснять, что доказано, на каком commit и окружении, каким сценарием, где лежит proof bundle или runtime-артефакты и какие границы у доказательства. Приемочный вердикт в протоколе или матрице ссылается на этот паспорт.

## 6. Evidence

`Evidence` — это доказательство проверки или gate с явным scope and limits.

Evidence должно отвечать:

- что проверялось;
- на каком commit, окружении или stage;
- какой сценарий, тест, команда, report или proof bundle использован;
- какой verdict получен;
- что это доказательство не покрывает.

Evidence может храниться в `evidence/`, рядом с протоколом конкретной волны или рядом со scenario run. Сырые runtime logs и `.tasks` файлы не становятся durable evidence автоматически; их нужно оформить как verification passport или curated trace.

## 7. Practical separation rule

Если документ отвечает на вопрос:
- “Почему выбран такой архитектурный путь?” -> `ADR`
- “Зачем и что доставляем?” -> `feature`
- “Как реализуем?” -> `spec`
- “Как ведём и закрываем волну работ?” -> `protocol`
- “Как воспроизводимо проверяем платформу / lifecycle block / canonical use case?” -> `scenario`
- “Какая область ценности, для каких акторов, делится на связанные features?” -> `epic`
- “Что именно доказано, где, каким запуском и с какими ограничениями?” -> `evidence`

## 8. Minimal traceability rule

Для delivery docs нужно поддерживать как минимум такую цепочку:

`epic -> feature -> spec/ADR -> implementation boundary -> tests/scenarios -> evidence -> closure state`

Для multi-protocol work нужно поддерживать цепочку:

`PSET -> member protocols -> blocked_by_protocols -> run evidence -> set status`

Если хотя бы одно из этих звеньев не связано, deliverable knowledge становится неполным.

Для platform verification нужно поддерживать как минимум такую цепочку:

`ADR / capability -> scenario -> evidence -> verdict / follow-up`

Если scenario не связан с capability или evidence, платформа теряет проверяемость.

Для operational delivery дополнительно нужна цепочка:

`feature/protocol -> merge to develop -> beta deploy -> scenario evidence -> release verdict -> production approval`

Если работа закрывается с известными разрывами, используй именованные отложения `DEF-*` по [Named Deferrals Guide](named-deferrals-guide.md). Не закрывай работу формулировкой "готово, кроме..." без владельца, причины и следующего gate.

## 9. Writing guidance

### Good feature docs
- short and outcome-oriented
- clear acceptance intent
- clear non-goals
- obvious links to spec and evidence

### Bad feature docs
- превращаются в mini-PRD
- дублируют spec word-for-word
- содержат execution logs вместо delivery framing
- не показывают, как будет подтверждён результат

### Good scenario docs
- описывают проверяемый use case, а не внутреннюю реализацию раннера;
- фиксируют preconditions и expected evidence;
- содержат phases, которые можно реально исполнить;
- связывают scenario с capability/lifecycle block, который он валидирует.

### Bad scenario docs
- являются просто пересказом test file;
- не описывают evidence;
- завязаны на случайные локальные предположения;
- не объясняют, что именно считается pass/fail.

### Good epic docs
- short framing
- feature map
- evidence-based progress

### Bad epic docs
- roadmap theatre
- KPI theatre
- long prose with no traceability to real features

## 10. Template guidance rule

Короткие рекомендации по заполнению допустимо держать прямо в шаблонах через blockquote notes.

Используй inline notes в шаблоне, когда:
- нужно быстро предотвратить типичную ошибку заполнения;
- guidance относится к конкретной секции.

Используй отдельный guide, когда:
- нужно объяснить различия между типами документов;
- guidance относится ко всему lifecycle;
- есть риск распухания шаблонов от методологии.
