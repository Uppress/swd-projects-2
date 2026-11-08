CREATE TABLE projects (
  id          serial PRIMARY KEY,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  description text NOT NULL DEFAULT '',
  color       text NOT NULL DEFAULT '#6366f1',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id          serial PRIMARY KEY,
  project_id  integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 140),
  status      text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  priority    text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date    date,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_project_idx ON tasks(project_id);

INSERT INTO projects (name, description, color) VALUES
  ('Website Redesign', 'Refresh the company marketing site', '#0ea5e9'),
  ('Mobile App MVP', 'First release of the customer app', '#22c55e');

INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES
  (1, 'Audit current pages', 'done', 'medium', CURRENT_DATE - 2),
  (1, 'Design new homepage', 'doing', 'high', CURRENT_DATE + 2),
  (2, 'Set up authentication', 'todo', 'high', CURRENT_DATE + 5);