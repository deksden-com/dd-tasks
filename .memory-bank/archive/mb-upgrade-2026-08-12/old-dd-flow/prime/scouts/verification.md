# Prime Scout: Verification

## Цель

Понять, какие проверки нужны для выбранной зоны изменения.

## Прочитай и проверь

- `package.json`, workspace scripts, task runner configs;
- тестовые папки и файлы рядом с зоной изменения;
- `.github/workflows/`, CI-конфиги, если есть;
- `.memory-bank/scenarios/`;
- `.memory-bank/spec/engineering/`;
- `.memory-bank/mbb/verification-matrix-guide.md`;
- `.memory-bank/mbb/scenario-docs-guide.md`.

## Ответь

- Какие минимальные проверки доказывают отсутствие поломки?
- Есть ли существующие сценарии, которые затронуты?
- Нужен ли мысленный сценарный прогон или исполнимый сценарий?
- Нужно ли сохранять proof bundle или verification passport?
- Какие проверки слишком дорогие для этой правки и почему их можно не включать?

## Рекомендации для flow profile

Подскажи:

- `verification.plan.lint`, `verification.plan.typecheck`, `verification.plan.unit`, `verification.plan.integration`, `verification.plan.build`: `skip`, `run` или `required`;
- `verification.plan.scenarios`: `none`, `review`, `update` или `acceptance_gate`;
- `verification.plan.manual`: нужна ли ручная проверка;
- `evidence.level`: `final_report`, `protocol_record`, `proof_bundle`, `verification_passport` или `rollout_evidence`;
- `route.ci`: нужен ли CI как gate.
