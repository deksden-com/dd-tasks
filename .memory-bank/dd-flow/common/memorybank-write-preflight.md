# Memory Bank write preflight

Этот блок читают memory-flow prompt-ы перед любым действием, которое может читать или писать Банк памяти, `<run-home>`, `.tasks`, `DEF-*`, dashboard-и или evidence.

## Цель

Проверить права доступа до смысловой работы, чтобы агент не создал частичные документы и не упёрся в `EACCES` после миграции, аудита или инициализации.

Типичный обнаруживаемый кейс: `.memory-bank/index.md` или другой active-файл принадлежит `root`/другому пользователю и не writable для текущего агента.

## Обязательная команда

Если доступен `dd-flow` CLI, используй canonical runtime gate:

```bash
dd-flow memory permissions preflight --root . --memory-bank .memory-bank --tasks .tasks --flow <flow> --mode <mode> --json
```

Если flow будет писать run artifacts, дополнительно проверь или зафиксируй CLI-provided `<run-home>` under:

```text
~/.dd-flow/projects/<PRJ-ID-slug>/runs/<RUN-ID-slug>/
```

Нельзя молча fallback-иться в project `.tasks`, если `<run-home>` не writable. Остановись, деградируй явно или запиши blocker согласно текущему gate.

Human mode допустим только для ручного отчёта пользователю:

```bash
dd-flow memory permissions preflight --root . --memory-bank .memory-bank --tasks .tasks --flow <flow> --mode <mode>
```

Не используй `mb-lint` вместо этого preflight. `mb-lint` проверяет структуру и ссылки, а write preflight проверяет возможность безопасно читать/писать файлы прямо сейчас.

Preflight не выполняет широкое рекурсивное сканирование Memory Bank как
условие старта. Проверяй только известные stage/runtime targets и exact
read/stat или create/write/rename/delete probes, которые нужны текущей
операции. Полная проверка `mb-lint` выполняется после записи по changed-file
delta или как отдельный финальный gate.

## Flow и mode

`flow`:

- `mb-init`;
- `mb-upgrade`;
- `mb-audit`;
- `mb-fix`;
- `mb-upgrade-review`;
- `custom`.

`mode`:

- `read` - только read-only анализ, без создания `.tasks` и без записи report/DEF/dashboard;
- `write` - active Memory Bank или `.tasks` будут создаваться/изменяться;
- `report_only` - active Memory Bank не меняется, но будут писаться `<run-home>`, `.tasks`, reports, DEF, dashboard или evidence;
- `repair` - будущий режим для явных repair flows; privileged команды всё равно не выполняются автоматически.

Рекомендуемые пары:

- `mb-init`: `write`;
- `mb-upgrade`: `write`;
- `mb-audit` до выбора аспектов: `read`;
- `mb-audit` перед созданием `<run-home>`, `.tasks`, reports, `DEF-*` или dashboard: `report_only`;
- `mb-upgrade-review`: `report_only`, если ревью пишет только отчёт/DEF/dashboard.

## Exit codes

- `0`: assessment completed, blockers нет, flow может продолжать работу;
- `1`: assessment completed, найдены permission blockers, flow должен остановиться до ручного исправления;
- `2`: runtime/configuration error или unable to assess; flow должен остановиться, потому что gate не доказан.

JSON mode должен быть машинно-чистым: валидный JSON на stdout для completed assessment, structured error на stderr для runtime/config errors.

## Что делать при blocker

Если preflight вернул `exit_code: 1` или `ok: false`:

1. Не создавай и не меняй active Memory Bank files.
2. Не создавай persistent `.tasks` как часть диагностики, если именно `.tasks` не writable или режим ещё read-only.
3. Покажи пользователю краткий отчёт на `target_language`.
4. Перечисли affected paths, reason, owner/group/mode или Windows ACL/read-only hints, если они есть в JSON.
5. Дай remediation commands из JSON как команды для пользователя, но не запускай их сам.
6. Скажи, какую команду preflight повторить после исправления.

Запрещено автоматически выполнять:

- `sudo chown`;
- `chmod`;
- `chflags`;
- `chattr`;
- `takeown`;
- `icacls`;
- любые другие privileged ownership/ACL repair commands.

## Manual fallback

Если `dd-flow` CLI недоступен, сделай ручной fallback и явно пометь его как degraded:

- определи ОС: `uname -a`/`sw_vers` на macOS/Linux или `ver`/PowerShell на Windows;
- проверь существование project root и Memory Bank root;
- для write/report modes проверь возможность создать и удалить временный probe-файл в целевой папке;
- для существующих файлов, которые будут изменяться, проверь read/write access;
- на POSIX собери `ls -ld`/`stat` для failing paths;
- на Windows собери read-only attribute/ACL сведения через PowerShell, если доступно.

Fallback не должен создавать persistent `.tasks`, если diagnosis ещё не доказал, что `.tasks` writable. Если durable evidence невозможен из-за прав, дай final-response-only report и попроси пользователя исправить права.

## Отчёт в итоговых артефактах

Даже если preflight прошёл, итоговый отчёт flow должен указать:

- точную команду;
- mode;
- exit code;
- краткий status;
- где лежит JSON report, если он был сохранён;
- были ли warnings.

Если preflight был degraded/manual, укажи причину и границы доверия.
