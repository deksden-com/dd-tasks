---
file: '.memory-bank/protocol/PRT-006-preview-access-policy/intake/user-input.md'
description: 'Дословный пользовательский ввод для PRT-006.'
purpose: 'Сохраняет provenance решений о public/private preview и open/closed registration.'
version: '0.1.0'
date: '2026-08-05'
status: 'ACTIVE'
c4_level: 'operations'
parent: '.memory-bank/protocol/PRT-006-preview-access-policy/index.md'
tags: [protocol, intake, preview, registration]
---

# INPUT-001

- timestamp: 2026-08-05
- source: user discussion in Codex task
- protocol: PRT-006-preview-access-policy
- related_run: RUN-304-preview-access-policy
- redaction: none_required

> а мы можем если нужно - отключить для каких то деплоев preview окружения этот режим "прятаться за прокси"? при необходимости? чтобы это было параметром деплоя - за проки или публично доступный.
>
> у нас же есть авторизация в приложении

> наверное открытая регистрация - это тоже должен быть параметр деплоя. для публичных деплоев она по умолчанию должна быть закрыта
>
> либо какое то еще ограничение регистрации - например, доменом пользователя.
>
> что думаешь?

> ну и в deploy ранбук надо добавлять опцию - превью у нас деплоится за прокси или открыто , да?

> пропиши протокол и пройди specify. продумай все еще раз хорошо.
>
> после этого остановись.
