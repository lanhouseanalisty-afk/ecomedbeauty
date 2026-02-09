ALTER TABLE tickets ADD COLUMN parent_id UUID REFERENCES tickets(id);
