# Фаза f: compatibility alias для priming

`f.md` — совместимый alias `.memory-bank/dd-flow/prime.md`.
Выполни `prime.md` полностью: его required reading, ограничения, язык ответа
и output contract действуют без изменений. Единственное отличие в докладе:
`prompt: f.md -> prime.md`.

Не добавляй собственный preflight или дополнительные обязательные чтения.
Как и `prime.md`, этот вход read-only: Не регистрируй
Session, проект, RUN или Work; не создавай runtime artifacts или ручной trace.
Верни `runtime_state: not_created`. Доступность CLI не является gate priming.
Не запускай task intake или реализацию из одного лишь вызова alias.
Следующее действие выбирается пользователем по правилам `prime.md`.
