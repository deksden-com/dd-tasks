CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

ALTER TABLE tasks
  ADD COLUMN priority task_priority NOT NULL DEFAULT 'medium';
