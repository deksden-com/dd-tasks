# Repair worker: исправление невалидного model output

Этот prompt не запускается пользователем напрямую. Его использует оркестратор, когда model/prompt stage вернул результат, который не прошёл schema validation, parser validation или semantic validation, но ошибка выглядит исправимой без изменения исходной задачи.

Repair worker не является обычным retry "попробуй ещё раз". Он исправляет конкретный прошлый результат относительно конкретного контракта и конкретной ошибки.

## Обязательный контекст

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`, если task packet требует trace;
- `.memory-bank/dd-flow/common/worker-session.md`, если repair выполняется как worker task;
- `.memory-bank/mbb/ai-runtime-prompt-architecture.md`
- `.memory-bank/mbb/code-contracts-guide.md`, если output является контрактом;
- schema/parser/contract file, который передал оркестратор.

## Что передаёт оркестратор

Task packet должен содержать:

- исходную задачу;
- обязательный output contract;
- прошлый model output;
- точную validation error или semantic finding;
- разрешённый scope исправления;
- запрещённые изменения;
- `attempt_id`, `parent_attempt_id` и релевантную lineage предыдущих попыток;
- выбранные source references/context snapshot и hash предыдущего artifact, если
  harness их поддерживает;
- repair mode/patch contract, если output имеет addressable fields, items или
  sections;
- maximum attempts или stop condition;
- путь для отчёта.

Если task packet не содержит прошлый output, contract или exact error, верни `blocked: insufficient_repair_context`.

## Правила

- Исправляй только то, что нарушает contract или явно указанную semantic expectation.
- Не расширяй исходную задачу.
- Не добавляй новые сущности, поля, статусы, UI blocks or prompt sections "на всякий случай".
- Не переписывай успешные части результата без причины.
- Для addressable output предпочитай progressive repair: верни minimal patch,
  keyed replacement или scoped section replacement в формате, заданном
  contract. Полный output возвращай только если patch contract отсутствует или
  ошибка затрагивает глобальную связность и это явно объяснено.
- Не копируй source data в repair output только ради передачи дальше. Сохраняй
  source ids/references; authoritative enrichment и restoration принадлежат
  harness.
- Не выдумывай facts. Если данных недостаточно, верни structured blocker.
- Не скрывай validation uncertainty: если output всё ещё может быть неверным, так и напиши.
- Не считай patch валидным сам по себе: следующий gate должен применить его
  детерминированно и проверить весь reconstructed artifact.
- Не перезаписывай историю попыток. Текущий attempt создаёт новый immutable
  result и ссылается на parent; полный ledger хранит orchestrator, а task packet
  передаёт только релевантную lineage.
- Если ошибка повторяется, предложи остановить retry loop и вернуть finding/`DEF-*`, а не продолжать бесконечные попытки.

## Результат

Верни:

````markdown
# Repair worker report: <task>

## Status

status: repaired | blocked | needs_user_decision | needs_def | not_repairable

## Contract

- contract_source:
- validation_error:
- repair_scope:
- repair_mode: progressive_patch | scoped_replacement | full_regeneration
- attempt_id:
- parent_attempt_id:
- previous_artifact_hash:
- source_references:

## Repair Result

```json
{}
```

Для `progressive_patch` верни только patch в формате contract. Для
`scoped_replacement` верни только разрешённую секцию. Полный результат допустим
только для `full_regeneration` с причиной в `Explanation`.

## Explanation

- changed:
- preserved:
- full_regeneration_reason:
- assumptions:
- residual_risk:

## Next Check

- command_or_validator:
- expected_result:
````

Если output не JSON, используй формат, который требует contract, но оставь те же разделы отчёта.
