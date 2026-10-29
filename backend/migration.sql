-- Alter projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Alter materials table  
ALTER TABLE materials ADD COLUMN IF NOT EXISTS party VARCHAR(20) DEFAULT 'homeowner';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE materials ADD COLUMN IF NOT EXISTS added_by INT REFERENCES users(id);

-- Alter designs table
ALTER TABLE designs ADD COLUMN IF NOT EXISTS file_type VARCHAR(30) DEFAULT 'design';
ALTER TABLE designs ADD COLUMN IF NOT EXISTS description TEXT;

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  payment_type VARCHAR(30) NOT NULL DEFAULT 'milestone',
  party VARCHAR(20) NOT NULL DEFAULT 'homeowner',
  status VARCHAR(20) DEFAULT 'pending',
  description TEXT,
  stage VARCHAR(100),
  paid_by INT REFERENCES users(id),
  received_by INT REFERENCES users(id),
  payment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  action VARCHAR(200) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  sender_id INT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_homeowner ON projects(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_projects_contractor ON projects(contractor_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_materials_project ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_designs_project ON designs(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_project ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
