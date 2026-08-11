# Аспект: жизненный цикл памяти

## Цель

Проверить, что активная память, архив, устаревшие документы, свежесть индексов и named deferrals управляются явно, а не накапливаются случайно.

## Нормативная база

- `.memory-bank/mbb/aspects/11-memory-lifecycle.md`
- `.memory-bank/mbb/memory-bank-structure.md`
- `.memory-bank/mbb/principles.md`
- `.memory-bank/mbb/named-deferrals-guide.md`

## Что читать в проекте

- `.memory-bank/index.md`, `.memory-bank/structure.md`;
- `archive/`, локальные индексы и устаревшие документы;
- `.memory-bank/defs/`, если есть;
- последние протоколы и evidence promotion summaries.

## Что проверять

- активные документы не ссылаются на архив как на текущую истину;
- устаревшие документы имеют replacement или archive reason;
- закрытые протоколы подняли долговечные выводы в правильные слои;
- `DEF-*` discoverable из канонического места и не спрятаны только в runtime artifacts;
- stale knowledge имеет owner, review trigger or explicit non-blocking rationale.

## Какие `DEF-*` создавать

Группа: `MEMORY`.

Создавай `DEF-*`, если активный агент не может понять, какой документ является текущей истиной, или если известный gap потерял discoverable owner/gate.
