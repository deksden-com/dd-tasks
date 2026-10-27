---
file: '.memory-bank/dd-flow/go.md'
description: 'Bounded dispatcher for an explicitly selected task or runtime continuation.'
purpose: 'Continue trusted runtime directives without reconstructing lifecycle from protocol summaries or creating a flow from task discussion.'
version: '1.0.0'
date: '2026-10-07'
status: 'ACTIVE'
c4_level: 'prompt'
parent: '.memory-bank/dd-flow/index.md'
related_files:
  - .memory-bank/dd-flow/prime.md
  - .memory-bank/dd-flow/vnext/start.md
  - .memory-bank/dd-flow/common/runtime-contract.md
  - .memory-bank/dd-flow/common/lifecycle-guards.md
  - .memory-bank/dd-flow/common/style.md
tags: [dd-flow, dispatch, continuation, grounding, spc-014]
---

# Go: следующий безопасный шаг

`/go` продолжает явно выбранную работу. Это dispatcher, не новая Stage,
не новый scheduler и не разрешение создать протокол из любого запроса.
RUN/Stage/Work/Session принадлежат CLI; protocol summary и Markdown indexes
служат долговечной памятью, а не управляющим состоянием runtime.

## Выбор входа

Различай три случая. Не выбирай RUN, протокол, home или workspace по дате
файла, последнему commit, списку папок или случайно доступному CLI.

1. **Явная новая формализация.** Если пользователь просит «оформи протокол»,
   «создай протокол», «заведи протокол» или эквивалент, используй
   `vnext/start.md`. Новый путь SPECIFY-first: bootstrap создаёт RUN и
   root Work, а не предварительный PRT. `stage start` — первая практическая
   команда; не выполняй перед ней Git, status, регистрацию Session, чтение
   skills или дополнительное исследование. Используй exact standalone command
   и prepared raw-intake path Controller/adapter, включая supplied non-default
   `DD_FLOW_HOME`. Не дописывай решение, план или требования в intake; не
   передавай intake через pipe. Возвращённый `worker_prompt_markdown` становится
   полной задачей. Не запускай `protocol.md` как новый ordinary entry.
2. **Выбранная runtime continuation.** Если Controller или текущий retained
   packet связывает конкретные RUN, project/runtime scope и exact directive,
   исполни только эту directive при наличии её admission и user authority.
   Successor `stage start` и `work start` остаются первой технической командой
   своего worker Turn. Не реконструируй их через help или старый checklist.
   `same_session` продолжает coordinator; `new_session` передаёт работу
   Controller и завершает текущий Turn. Worker/reviewer Session policy отдельно
   от coordinator stage policy; агент не выбирает её по удобству.
3. **Нет выбранного runtime.** Обычная задача, обсуждение, «давай», «продолжай»
   или вызов `/go` сами по себе не являются новой формализацией. Продолжай
   разрешённую пользователем обычную работу без создания RUN/PRT либо используй
   `prime.md` для read-only загрузки контекста. Если пользователь хочет именно
   flow continuation, но selector неоднозначен, попроси выбрать RUN/протокол.
   При отсутствии задачи верни orientation summary. Не регистрируй Session
   ради priming и не создавай runtime artifacts или ручной trace.

Явно выбранный исторический протокол не становится новым vNext RUN автоматически.
Его continuation требует supported reader и pinned engine этого runtime.
Не меняй исторические bytes, engine binding или storage ради «совместимости».
Unknown/missing binding требует диагностики, не файлового lifecycle fallback.

## Продолжение и границы

Trusted lifecycle receipt определяет текущий outcome и следующий action.
Если receipt отсутствует, сначала восстанови exact selected request через
поддерживаемый scoped diagnostic/recovery. Не создавай другую operation или
RUN для обхода unknown outcome. Если точного runtime scope нет, не открывай
ambient default home и не угадывай global executable.

Материальный вопрос пользователя использует typed pause/answer той же Stage.
Engine/harness/environment failure использует typed block/unblock, не HITL.
Failed checks и unresolved findings исправляются distinct bounded repair Work
по возвращённой directive. Coordinator не запускает start_command управляемого
child Work сам и не скрывает изменения в своём workspace вместо repair Work.

Semantic completion не доказывает physical settlement. Pending cleanup, unknown
child outcome или потерянная observation не дают права повторить productive
dispatch, остановить чужой process либо объявить PASS. Переиспользование check
receipts требует совпадающих inputs/environment/artifact identities и завершённой
физической execution, а не только прежнего зелёного summary.

Relevant DEF, project policy, coverage и verification оцениваются в bounded
stage packet. Не обходи блокирующий DEF; не дублируй stage planning перед
bootstrap. Writer действует только в assigned workspace и allowed paths;
bootstrap готовности другого checkout не переносится на этот workspace.

`/go` не расширяет полномочия пользователя. Publication, push/merge,
production, destructive migration, paid/mass calls, сообщения и изменение
секретов/прав проходят свои project-policy и explicit authorization gates.
Read-only review или диагностика не разрешают реализацию исправления.
Недоступный обязательный runtime блокирует flow continuation, но не запрещает
обычное read-only исследование. Не подменяй его ручными Stage/Work transitions.

## Доклад

Используй язык текущего пользовательского запроса, если не выбран другой;
JSON keys и code identifiers сохраняют исходное написание. Доложи кратко:

- `prompt: go.md` и фактически выполненный entrypoint;
- выбранный RUN/протокол или `protocol: not_created`;
- actual `current_stage`, completed outcome и точный `next_action`;
- runtime/project/workspace scope без credential values;
- relevant blockers, DEF и необходимое user decision;
- выполненное действие и границу проверенного evidence.

Не записывай выдуманные transitions в summary, dashboard или JSON. Если
runtime не создавался, явно укажи `runtime_state: not_created`. Новые
`flow`/`init`/`upgrade` commands не объявляются доступными до их cutover;
этот dispatcher не активирует будущую SPC-014 архитектуру.
