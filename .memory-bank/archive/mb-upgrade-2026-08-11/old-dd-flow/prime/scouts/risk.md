# Prime Scout: Risk

## Цель

Проверить, нет ли риска, который должен повысить глубину процесса независимо от размера правки.

## Проверь

- данные, миграции, backfill, удаление или потеря данных;
- приватность, секреты, учетные данные, пользовательские токены;
- безопасность, доступы, права, роли;
- деньги, биллинг, лимиты, платные внешние вызовы;
- публикации, отправка сообщений, email, Telegram, соцсети, irreversible side effects;
- внешние провайдеры и нестабильные API;
- concurrency, идемпотентность, повторная обработка, race conditions;
- наблюдаемость: логи, метрики, возможность расследовать ошибку.

## Ответь

- Есть ли риск, который делает маленькую правку немаленькой по последствиям?
- Нужно ли повышать планирование до `full_plan` или сначала запускать вспомогательный research?
- Нужно ли требовать сценарий, proof bundle, verification passport или rollout evidence?
- Нужен ли ADR, spec или operational rule?
- Есть ли блокирующий вопрос к пользователю?

## Рекомендации для flow profile

Подскажи:

- `impact.risk`: `low`, `medium`, `high` или `research_required`;
- `route.planning`: повышать ли до `full_plan`;
- `research.needed`: нужен ли `codebase`, `web` или `mixed` research до выбора маршрута;
- `verification.plan`: какие проверки должны стать обязательными;
- `evidence.level`: нужен ли `verification_passport` или `rollout_evidence`;
- `route.delivery`: нужен ли beta/production/rollback контур;
- `documentation.impact` и `documentation.targets`: нужны ли `spec/`, `adr/` или `spec/operations` updates.
