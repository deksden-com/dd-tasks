# Protocol Implement: продолжение существующего протокола

Этот top-level prompt запускается, когда пользователь хочет взять уже созданный, но не закрытый `PRT-*` и продолжить его specification/plan/code/merge цикл в текущей или новой сессии.

Flow origin policy: `project_local`.

`protocol-implement.md` не создаёт новый протокол и не переписывает исходную задачу как свежий scope. Он читает существующий `PRT-*`, его `PSET-*` при наличии, runtime state and related context, затем выбирает следующий безопасный stage.

## Когда использовать

Используй этот prompt, если пользователь говорит:

- "начни/продолжи реализацию PRT-XXX";
- "возьми готовый протокол PRT-XXX";
- "запусти code/plan по PRT-XXX";
- "реализуй следующий протокол из set";
- новая параллельная сессия должна работать по member protocol из `PSET-*`.

Не используй этот prompt для "оформи протокол", "создай протокол", "сделай протокол по обсуждению". Такие команды запускают `protocol.md`.

## Что прочитать сначала

Прочитай:

- `.memory-bank/dd-flow/common/style.md`
- `.memory-bank/dd-flow/common/trace.md`
- `.memory-bank/dd-flow/common/runtime-cli.md`
- `.memory-bank/dd-flow/common/lifecycle-guards.md`
- `.memory-bank/dd-flow/common/flow-runs.md`
- `.memory-bank/dd-flow/common/git-ops.md`
- `.memory-bank/dd-flow/common/memorybank.md`
- `.memory-bank/dd-flow/common/flow-flags.md`
- `.memory-bank/dd-flow/index.md`
- `.memory-bank/protocol/index.md`, если есть
- сам `.memory-bank/protocol/<PRT-ID>.md`
- `.memory-bank/protocol/_set/PSET-*.md`, если `protocol_set` указан во frontmatter
- все `source_user_input`, `related_epics`, `related_features`, `related_specs`, `related_adrs`, `related_scenarios` from protocol frontmatter
- `.memory-bank/mbb/coding-standards-guide.md`
- `.memory-bank/mbb/code-contracts-guide.md`
- project coding standards sources, если они есть в `spec/engineering`, README/CONTRIBUTING или project policy.

После чтения `common/runtime-cli.md` выполни CLI preflight, если `dd-flow` доступен:

```bash
dd-flow status --project-root "<project-root>" --json
dd-flow protocol blockers "<PRT-ID>" --project-root "<project-root>" --json
dd-flow protocol implement "<PRT-ID>" --project-root "<project-root>" --json
```

Если `protocol implement` вернул blocker, terminal state, active claim/session, runtime mismatch or missing registration, не обходи это молча.

Если любой CLI runtime command вернул operation-level compatibility refusal (`missing_engine`, `compatibility_preflight_failed`, `engine.compatibility.verdict: incompatible` for normal writes), не продолжай stage transition, run update, plan update, lane/merge action или dashboard refresh ручными правками. Разрешённые пути: установить compatible engine, выполнить explicit `mb-upgrade` contour (`--compatibility-mode mb-upgrade` only when реально мигрируем проект) или остановиться с blocker/DEF.

## Guardrails

1. Убедись, что `PRT-ID` явно выбран пользователем или однозначно следует из текущего runtime/сообщения.
2. Если `PRT-*` markdown отсутствует, остановись: это не protocol-implement, нужен `protocol.md` или исправление ссылки.
3. Если protocol lifecycle terminal (`MERGED`, `CLOSED`, runtime `closed`, `cancelled`), не запускай реализацию.
4. Если `blocked_by_protocols` содержит unresolved blockers, остановись с `blocked: protocol_blocked_by_dependencies`, кроме случая явного `--force --reason` and user/operator rationale.
5. Если другой active session/claim уже держит этот protocol, остановись или запроси осознанный override.
6. Если runtime state missing, зарегистрируй protocol через CLI before mutating stages:

   ```bash
   dd-flow protocol register "<PRT-ID>" --project-root "<project-root>" --json
   ```

7. Если runtime/filesystem stage evidence расходятся, используй `dd-flow protocol sync-from-run` only when concrete RUN evidence proves the target state. Иначе fail closed.
8. Если protocol belongs to `PSET-*`, покажи remaining set status and startable protocols.

## Stage Routing

Выбери следующий prompt по фактическому state:

- `registered`, `priming`, `specify`, `waiting_for_user`: продолжай `specify` по `common/specification.md`;
- `plan`: запускай или продолжай `plan.md`, если specification complete;
- `implementation`, `readiness`: запускай `code.md`;
- `ready_for_merge`, `queued_for_merge`, `integration`: запускай `merge.md`;
- `blocked`: назови blocker and next safe action;
- `closed`, `cancelled`: не продолжай protocol-implement.

Не прыгай в `code.md`, если `Code Guard` из `common/lifecycle-guards.md` не доказан. Для compact/degraded route причина должна быть записана в protocol summary or stage report.

## Coding Standards Context

Перед `code.md` explicitly identify coding standards and code contract sources:

- project-specific `.memory-bank/spec/engineering/coding-standards.md`, если есть;
- project README/CONTRIBUTING/developer guide, если применимо;
- `.memory-bank/mbb/coding-standards-guide.md`;
- `.memory-bank/mbb/code-contracts-guide.md`;
- protocol `related_specs` / `related_files`, если они задают public contract or standards.

Передай эти sources в code-flow handoff. Readiness затем должна проверить фактический diff against these standards, including module size, responsibility boundaries, cross-links and public contract propagation.

## Protocol Set Output

Если protocol has `protocol_set`, финальный доклад protocol-implement должен содержать compact set board:

- `ready`;
- `blocked`;
- `running/claimed`;
- `done/closed/merged`;
- какие member protocols можно стартовать параллельно;
- какие blocked and by whom.

Используй:

```bash
dd-flow protocol ready --project-root "<project-root>" --json
```

если CLI доступен.

## Merge Continuation Contract

Если выбранный protocol находится в `ready_for_merge`, `queued_for_merge` или `integration`, не выполняй source integration из `protocol-implement.md` напрямую. Передай управление `merge.md` and preserve CLI-controlled merge semantics:

- queued/claimed protocol fields `queue_item`, `protocol`, `claim` are primary;
- legacy `job` is only a compatibility alias;
- waiting for a busy merge lane uses `dd-flow merge-queue wait-next --acquire-lock true`, which composes over FIFO `lane lock wait-acquire --lane merge`;
- manual `git merge`, push/tag/release or queue completion requires registered merge role, claimed protocol and owned merge lane lock.

## Выход

Финальный доклад должен содержать:

- `prompt: protocol-implement.md`;
- `protocol: <PRT-ID>`;
- `protocol_set: <PSET path | none>`;
- `current_stage`;
- `recommended_next_prompt`;
- blockers and active sessions;
- coding standards sources;
- related context read from frontmatter;
- next safe action: `specify`, `plan.md`, `code.md`, `merge.md`, `blocked`, or `waiting_for_user`.
