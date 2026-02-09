DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admission_processes' AND column_name = 'needs_vehicle') THEN
        ALTER TABLE admission_processes ADD COLUMN needs_vehicle BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
