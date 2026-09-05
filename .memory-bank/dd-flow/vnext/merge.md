---
file: '.memory-bank/dd-flow/vnext/merge.md'
description: 'Каноническая методика vNext MERGE.'
purpose: 'Использовать через полный пакет dd-flow stage start --stage merge.'
version: '1.4.0'
date: '2026-09-05'
status: 'ACTIVE'
history:
  - version: '1.4.0'
    date: '2026-09-05'
    changes: 'Aligned source-repair and environment-retry evidence with the executable MERGE gate.'
  - version: '1.3.0'
    date: '2026-09-04'
    changes: 'Defined frozen full integration gate and checks-before-commit ordering.'
  - version: '1.2.0'
    date: '2026-08-31'
    changes: 'Clarified that the configured generated dashboard is runtime projection rather than product Git dirt.'
  - version: '1.1.0'
    date: '2026-08-31'
    changes: 'Defined the implemented vNext MERGE lifecycle.'
---

# MERGE

Цель стадии — интегрировать замороженный результат CODE/CODE-REVIEW в
настроенную ветку проекта и доказать корректность интегрированного дерева.

1. Первым отдельным вызовом выполнить точную команду `stage start`.
2. Доверять сведениям об очереди, блокировке, source commit, target baseline,
   рабочих каталогах и effective merge gate из возвращённого пакета.
3. Выполнить точную команду `merge apply`; не составлять Git-команду вручную.
4. При конфликтах разрешить именно их в integration workspace и не повторять
   `merge apply`.
5. Записать компактный смысловой `merge-result@1` по данной форме.
6. Выполнить точную команду `stage finish` и дождаться прогресса.
7. При падении проверки прочитать только возвращённые receipt/logs и
   классифицировать причину. Продуктовый дефект исходной функциональности
   исправляется точной командой source repair: она создаёт CODE → независимое
   CODE-REVIEW → replacement MERGE. Не исправлять продукт в integration
   workspace и не повторять этот MRG. Восстановление среды без изменения
   продукта остаётся в текущем MERGE: выполнить возвращённую команду повтора
   упавшей проверки и затем повторить finish. Повтор использует новый receipt
   той же проверки; старый failed receipt не затирается и не требует фиктивной
   правки исходников.

`merge apply` переносит source в integration workspace **без коммита**. Перед
созданием integration commit CLI выполняет замороженный при постановке в очередь
полный gate: обязательные проверки проекта и все доступные проверки принятого
CODE (work, code, readiness и merge) уже на объединённом дереве. Если какая-либо
проверка не проходит, коммит не создаётся: агент читает только возвращённые
receipts и выбирает один из двух маршрутов выше. CLI не классифицирует смысл
ошибки по тексту и не считает восстановление среды доказательством успеха:
требуется новый успешный receipt на неизменённом integration tree.
Состав gate хранится в `07-merge/merge-gate.json`; он не пересчитывается по
изменённым файлам и не меняется между повторами.

`same_session` и `server` различаются только способом запуска Session. Очередь,
Work, Git-операция, проверки, квитанции и отчёт одинаковы. Тишина не является
зависанием: нельзя повторять мутацию до явной ошибки или terminal result.

Сгенерированный путь Markdown-dashboard из project config является технической
проекцией runtime и не считается изменением продукта при Git preflight или
commit. Любое другое tracked/untracked изменение integration workspace
по-прежнему блокирует старт либо входит в явный integration-fix commit.

Профиль RUN заранее и неизменно задаёт `merge_mode`, локальную delivery
strategy и cleanup policy. Агент их не выбирает. Первая поддерживаемая delivery
strategy — `local`: CLI подтверждает, что configured target branch указывает на
принятый integration commit. Source сохраняется при `retain`; удаление допустимо
только при явном `delete_after_success` после зелёной merge verification epoch.
