---
file: '.memory-bank/mbb/principles.md'
description: 'Canonical MBB principles for SSOT, atomic concepts, C4 structure, duo files, metadata, and agent-friendly documentation.'
purpose: 'Use these principles when creating, refactoring, reviewing, or synchronizing Memory Bank documentation.'
version: '0.4.0'
date: '2026-06-18'
status: 'ACTIVE'
c4_level: 'standard'
parent: '.memory-bank/mbb/index.md'
architecture: 'Canonical MBB Standards'
children:
  - c4-model.md
  - spec-layer-guide.md
  - duo-files-guide.md
  - frontmatter-standards.md
  - ai-runtime-prompt-architecture.md
tags: [mbb, principles, tier-system, organization, c4, sdlc]
history:
  - version: '0.1.0'
    date: '2026-05-12'
    changes: 'Initial canonical principles.'
  - version: '0.2.0'
    date: '2026-05-12'
    changes: 'Added product/system/engineering/operations separation and code-to-doc traceability principles.'
  - version: '0.3.0'
    date: '2026-05-25'
    changes: 'Added compact stub and content-density rules to prevent template bloat.'
  - version: '0.4.0'
    date: '2026-06-18'
    changes: 'Added minimal necessary architecture principle for avoiding unused entities, fields, statuses, UI elements, prompt blocks and documents.'
---

# Принципы организации Memory Bank

## Основополагающие принципы

### 1. Single Source of Truth (SSOT)

**Каждая концепция документирована в единственном месте.**

✅ **Правильно:**
```
memory-bank/spec/system/runtime/state-store.md
→ Единственный источник информации о state store
```

❌ **Неправильно:**
```
docs/state-management.md + docs/runtime.md (дублирование информации о state store)
```

**Преимущества SSOT:**
- Исключает противоречия в документации
- Упрощает поддержание актуальности
- Улучшает поиск информации агентами

### 2. Atomic Concepts (Атомарность концепций)

**Один файл = одна концепция.**

**Принцип декомпозиции:**
- Tier 1: ≤250 строк - остается цельным
- Tier 2: 250-800 строк - саммари + 1-2 детализации
- Tier 3: >800 строк - обязательная декомпозиция

**Пример атомарной декомпозиции:**
```
observability.md (1646 строк) →

spec/system/runtime/observability/
├── observability.md              # 200 строк - саммари + ссылки
├── observability-architecture.md # 400 строк - архитектура
├── observability-services.md     # 400 строк - сервисы и API
├── observability-monitoring.md   # 300 строк - метрики
└── observability-debugging.md    # 296 строк - debugging features
```

### 3. C4 Model Structure
Организация документации следует C4: System → Container → Component → Code. При этом каталоги именуются по смыслу (без букв L1/L2). Для логических группировок, не являющихся подсистемами, используем нотацию `()`.

#### L1 — System Level
```
spec/
├── product/
├── system/
├── engineering/
└── operations/
```

#### L2 — Container Level
```
docs/
├── architecture/
│   ├── api/
│   ├── runtime/
│   └── workers/
└── (packages)/
```

- Директории без скобок описывают контейнер с собственным контрактом и границами.
- Директории в скобках обозначают логические группы (meta-группы). Они не добавляют новый контейнер, а всего лишь группируют документы (например, shared packages). Индексы внутри таких директорий обязаны явно говорить, что это группировка, и ссылаться на соответствующие контейнеры.

Каждый контейнер содержит `index.md` (навигация), при необходимости `contract.md`, `architecture.md` и ссылки на составляющие компоненты.

#### L3 — Component Level
```
spec/system/<subsystem>/
├── state-management/
├── navigation/
├── validation/
├── observability/
└── event-flow/
```

L3 индекс описывает компонент, его контракт, связи и ссылки на детали (duo pattern). Для логических кластеров на L3 допускается подкаталог `(archive)/`, `(legacy)/` и т.п. — подчёркивает, что это не самостоятельный компонент, а grouping.

### 4. Duo Files Pattern

**Саммари + детальные файлы для сложных концепций.**

**Структура duo файла:**
```
component/
├── index.md                 # Навигация (если много файлов)
├── component.md            # Саммари с аннотированными ссылками
├── component-architecture.md # Архитектурные детали
├── component-implementation.md # Детали реализации
└── component-examples.md    # Примеры использования
```

**Правила саммари файла:**
- 150-250 строк максимум
- Основные концепции и тезисы
- Аннотированные ссылки на детальные файлы
- Не повторяет детали, а ссылается на них

**Пример аннотированной ссылки:**
```markdown
## Архитектура

State store реализует централизованное управление состоянием workflow.

**Детализация:**
- [State Architecture](state-architecture.md): архитектура с atomic операциями и distributed locking
- [State Implementation](state-implementation.md): StateCoreService и LockManagerService реализация
- [State API](state-api.md): Публичные методы и их использование
```

**Иерархичность:** детальный файл имеет право выступать саммари для под-концепции. Если внутри подробной статьи появляются самостоятельные темы, создавайте для них новый duo-слой: текущий файл становится их кратким обзором, а детали уносятся в дочерние документы. Это обеспечивает бесконечно вложенную, но предсказуемую структуру без дублирования.

### 5. Information Hierarchy (Иерархия информации)

**Градуальное раскрытие сложности.**

#### Уровень 1: Quick Start
- Product overview
- System architecture diagram
- Key concepts glossary

#### Уровень 2: Working Knowledge
- Subsystem contracts
- API documentation
- Common patterns

#### Уровень 3: Deep Dive
- Component internals
- Implementation details
- Performance considerations

#### Уровень 4: Maintenance
- Troubleshooting guides
- Monitoring and alerting
- Operational procedures

### 6. Audience & Automation Metadata
- Указывайте `target_audience` (например, `[developers, ai-agents]`) для каждого документа.
- Материалы, пригодные для автоматизации или машинного потребления, помечайте `automation_ready: true`.
- Для логических группировок используйте каталоги в скобках (`(packages)/`, `(archive)/`) и описывайте их роль в индексе.

### 7. Content Quality Standards

#### Стиль написания
- **Активный залог:** "State store updates task status" vs "Task status is updated"
- **Конкретность:** "The lease expires in 30 seconds" vs "Lock expires after timeout"
- **Примеры:** Каждая абстрактная концепция иллюстрируется примером

#### Структура текста
- **Заголовки:** Четкие, отражающие содержание секции
- **Списки:** Предпочтительнее сплошного текста
- **Диаграммы:** Для сложных взаимосвязей
- **Код:** Актуальные примеры с комментариями

#### Актуальность
- **Версионирование:** Каждый файл имеет версию в frontmatter
- **История изменений:** 3-5 последних обновлений в history
- **Статус:** ACTIVE/DRAFT/DEPRECATED в frontmatter

#### Плотность знания и compact stubs

Memory Bank не должен симулировать зрелую документацию пустыми шаблонами.

Правило:
- если по каноническому разделу есть подтверждённые проектные факты, создай или обнови полноценный документ по шаблону;
- если каноническое место нужно обозначить, но подтверждённых данных мало или нет, создай короткий compact stub вместо развёрнутого шаблона;
- если раздел не нужен даже как место будущего знания, не создавай отдельный файл: отметь это в индексе, `structure.md` или отчёте процесса;
- не заполняй optional-блоки фразами вроде "not confirmed", "not applicable", "none found" только ради формы;
- не создавай delivery docs, guides, ADR, scenarios, UI automation или design-system документы, если они не несут отдельного проектного знания, решения, сценария, контракта или пользовательской пользы.

Compact stub фиксирует только:
- что за каноническая полка здесь находится;
- что именно пока не подтверждено;
- где лежит полный шаблон или guide;
- какие события должны раскрыть stub в полноценный документ.

Рекомендуемый frontmatter для stub:

```yaml
status: ACTIVE
content_state: compact_stub
canonical_template: .memory-bank/mbb/templates/ui-screen.md
activation_triggers:
  - confirmed screen contract
  - stable automation selectors
  - browser scenario evidence
```

`status: ACTIVE` означает, что stub является текущим каноническим местом для этого знания. `content_state: compact_stub` означает, что документ намеренно краткий и не обязан содержать все секции полного шаблона.

### 8. Architectural approaches must be explicit

Если проект использует выраженные архитектурные подходы, которые влияют на grounding, planning, code organization, UI automation или client strategy, Memory Bank обязан фиксировать их явно.

Типовые примеры:
- layers + vertical slices / feature areas;
- typed client SDK как обязательная граница между сервером и CLI/TUI/GUI;
- screen-level GUI contracts;
- design-system contracts;
- POM mapping и `data-testid` registry.

Правило:
- такие подходы не должны оставаться неформальным знанием команды;
- если подход влияет на структуру проекта, ownership, delivery, acceptance или automation, он должен быть описан в Memory Bank как отдельный архитектурный документ или набор связанных документов;
- при изменении этих подходов соответствующие разделы Memory Bank должны обновляться вместе с кодом.

### 9. Memory Bank is part of SDLC

Memory Bank - это не папка с заметками, а рабочий контур разработки.

Для значимых изменений должна сохраняться цепочка:
```
idea / discussion -> ADR -> SPEC -> implementation -> evidence -> Memory Bank sync
```

Правило:
- решения фиксируются в ADR;
- implementation-ready план фиксируется в SPEC;
- фактический след реализации и remediation хранится в protocol layer, а приемка ссылается на паспорта проверки в evidence layer;
- активные docs обновляются после реализации, а не "когда-нибудь потом";
- Memory Bank не заменяет код, README или issue tracker, а связывает их через контекст, инварианты и навигацию.

### 10. Code and docs stay linked

Код является источником точного поведения. Банк памяти является источником смысла, границ, решений и доказательств.

Публичные и важные границы кода должны ссылаться на документацию через JSDoc/docstrings там, где это помогает будущему изменению:

- entrypoint пакета;
- клиентский SDK;
- operation handler;
- доменная политика;
- state machine;
- UI contract;
- scenario runner.

Практическая цепочка:

```text
code boundary -> JSDoc/docstring -> SPEC/ADR/feature/scenario -> tests/evidence
```

Не нужно документировать каждый helper. Нужно документировать те места, где потеря связи с Memory Bank приведет к архитектурному дрейфу.

### 11. Minimal necessary architecture

Memory Bank должен защищать проект от архитектурного расползания.

Новая сущность, поле, статус, UI-элемент, схема, prompt-блок, worker, queue или документ допустимы только если у них есть:

- текущий потребитель;
- понятная ответственность;
- место в lifecycle;
- проверка;
- причина, почему без них текущая задача решается хуже.

Не добавляй элементы "на всякий случай", "за компанию" или потому что файл уже открыт. Optional поле в схеме, пустой UI-блок, future status или prompt section без текущего consumer всё равно являются архитектурным долгом.

Усложнение исправляется как дефект. Если review показывает, что решение можно сделать проще без потери требуемой функциональности, безопасности, проверяемости и сопровождаемости, это не вкусовая рекомендация, а `needs_fixes`/bug текущего scope. Оставлять overbuilt-решение допустимо только с явной причиной: упрощение ломает подтверждённый consumer, gate, compatibility или уже принятое архитектурное решение.

При review смотри сверху вниз:

- система остаётся целостной и концептуально логичной;
- C4-границы не смещаются случайно;
- ответственность кода не разъезжается;
- большие модули не пухнут за счёт чужой ответственности;
- новое знание попадает в правильный слой Memory Bank, а не дублируется в нескольких местах.

### 12. Operations are part of delivery

Локальный зеленый тест не равен приемке системы.

Для проектов с beta/prod, внешними интеграциями, пользовательским интерфейсом, auth или данными нужно явно различать:

- feature branch readiness;
- интеграцию в `develop`;
- beta acceptance;
- production approval;
- rollout evidence;
- rollback readiness.

Операционные правила живут в `spec/operations/`, а конкретная волна фиксирует примененные gates в `protocol/`.

## Применение принципов

### При создании новой документации

1. **Определить уровень C4:** L1/L2/L3?
2. **Выбрать местоположение:** Какая подсистема/компонент?
3. **Проверить SSOT:** Не дублируется ли концепция?
4. **Оценить размер:** Нужна ли декомпозиция?
5. **Создать связи:** Кросс-ссылки с кодом и смежными концепциями

### При рефакторинге существующей документации

1. **Audit размера:** >800 строк → декомпозиция
2. **Проверка дублирования:** Консолидировать дубликаты
3. **Обновление ссылок:** Актуализировать кросс-ссылки
4. **Архивация устаревшего:** Перенести неактуальное в archive/
5. **Валидация качества:** Соответствие style guide

### Антипаттерны (чего избегать)

❌ **Монолитные файлы:** >1000 строк без декомпозиции
❌ **Дублирование:** Одна концепция в нескольких местах
❌ **Orphan файлы:** Документы без ссылок из индексов
❌ **Устаревшая информация:** Документы с неактуальными версиями
❌ **Broken links:** Ссылки на несуществующие файлы
❌ **Неконсистентный frontmatter:** Отсутствие обязательных полей

## Валидация принципов

### Автоматические проверки
- Размер файлов (<800 строк)
- Наличие frontmatter полей
- Работоспособность кросс-ссылок
- Отсутствие orphan файлов

### Manual review процесс
- Соответствие C4 структуре
- Качество аннотированных ссылок
- Актуальность версий
- Консистентность стиля

### Метрики качества
- **Coverage:** % концепций с документацией
- **Freshness:** Средний возраст документов
- **Consistency:** % файлов с корректным frontmatter
- **Accessibility:** Время поиска информации агентами

---

**Эти принципы обеспечивают высокое качество, поддерживаемость и эффективность Memory Bank как для человеков, так и для ИИ-агентов.**
