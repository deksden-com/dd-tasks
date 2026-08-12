# Prime Scout: Memory Bank

## Цель

Быстро понять, какие части Банка памяти связаны с пользовательской хотелкой.

## Прочитай

- `.memory-bank/index.md`
- `.memory-bank/structure.md`, если есть
- релевантные индексы `spec/`, `adr/`, `plans/`, `scenarios/`, `ui/`, `guides/`, `protocol/`, `evidence/`
- `.memory-bank/mbb/index.md`
- профильные MBB-документы, если зона очевидна

## Ответь

- Какие продуктовые фичи, эпики или возможности затронуты?
- Есть ли уже спецификация, ADR, UI-документ, сценарий или протокол?
- Нужно ли обновлять Банк памяти или достаточно не менять его?
- Есть ли противоречие между пользовательской хотелкой и текущими документами?
- Есть ли похожий принятый подход в Банке памяти?

## Рекомендации для flow profile

Подскажи:

- `documentation.impact`, `documentation.targets` и `documentation.reasons`: какие долговечные документы нужно обновить и почему;
- `route.planning`: нужно ли повышать до `full_plan`;
- `verification.plan.scenarios`: затронуты ли сценарии и являются ли они воротами приемки;
- `evidence.level`: нужен ли protocol record, proof bundle или verification passport.
