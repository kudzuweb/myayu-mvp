-- MyAyu MVP - Initial Schema Migration
-- Creates all tables for the vertical slice (daily entries, tracking, cycle, regimen)

-- ============================================================================
-- 1. IDENTITY & CONFIG
-- ============================================================================

-- Main profiles table (patient + clinician)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('patient', 'clinician')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient-specific profile data
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Practitioner-specific profile data
CREATE TABLE practitioner_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  credentials TEXT,
  specialties TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient configuration settings
CREATE TABLE patient_configs (
  patient_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tracking_window_days INTEGER NOT NULL DEFAULT 30,
  edit_window_days INTEGER NOT NULL DEFAULT 7,
  cycle_tracking_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. DAILY ENTRY (anchor row per date)
-- ============================================================================

CREATE TABLE daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_physical INTEGER CHECK (energy_physical >= 0 AND energy_physical <= 10),
  energy_mental INTEGER CHECK (energy_mental >= 0 AND energy_mental <= 10),
  energy_emotional INTEGER CHECK (energy_emotional >= 0 AND energy_emotional <= 10),
  energy_drive INTEGER CHECK (energy_drive >= 0 AND energy_drive <= 10),
  overall_mood INTEGER CHECK (overall_mood >= 0 AND overall_mood <= 10),
  reflection TEXT,
  cycle_day INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(patient_id, date)
);

CREATE INDEX idx_daily_entries_patient_date ON daily_entries(patient_id, date);

-- ============================================================================
-- 3. SLEEP & EARLY AM
-- ============================================================================

CREATE TABLE sleep_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fell_asleep_at TIMESTAMPTZ,
  woke_up_at TIMESTAMPTZ,
  got_up_at TIMESTAMPTZ,
  quality TEXT,
  details TEXT,
  feeling_on_waking TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sleep_blocks_patient_entry ON sleep_blocks(patient_id, daily_entry_id);

CREATE TABLE early_morning_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hygiene_routine TEXT,
  first_drink TEXT,
  first_drink_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_early_morning_entries_patient_entry ON early_morning_entries(patient_id, daily_entry_id);

-- ============================================================================
-- 4. FOOD & FLUIDS
-- ============================================================================

CREATE TABLE saved_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_foods_patient ON saved_foods(patient_id);

CREATE TABLE food_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time TIMESTAMPTZ,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  description TEXT,
  saved_food_id UUID REFERENCES saved_foods(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_food_events_patient_entry ON food_events(patient_id, daily_entry_id);

CREATE TABLE daily_fluid_totals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_water_oz NUMERIC,
  total_caffeine_oz NUMERIC,
  total_other_oz NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_fluid_totals_patient_entry ON daily_fluid_totals(patient_id, daily_entry_id);

-- ============================================================================
-- 5. BOWEL MOVEMENTS
-- ============================================================================

CREATE TABLE bowel_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time TIMESTAMPTZ,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bowel_movements_patient_entry ON bowel_movements(patient_id, daily_entry_id);

-- ============================================================================
-- 6. EXERCISE / MOVEMENT
-- ============================================================================

CREATE TABLE saved_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_exercises_patient ON saved_exercises(patient_id);

CREATE TABLE exercise_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  exercise_type TEXT,
  saved_exercise_id UUID REFERENCES saved_exercises(id) ON DELETE SET NULL,
  felt_physical INTEGER CHECK (felt_physical >= 0 AND felt_physical <= 10),
  felt_mental INTEGER CHECK (felt_mental >= 0 AND felt_mental <= 10),
  felt_emotional INTEGER CHECK (felt_emotional >= 0 AND felt_emotional <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercise_events_patient_entry ON exercise_events(patient_id, daily_entry_id);

-- ============================================================================
-- 7. VITALS
-- ============================================================================

CREATE TABLE vital_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('blood_glucose', 'blood_pressure', 'early_am_temp', 'pm_temp', 'weight')),
  value NUMERIC NOT NULL,
  aux_value NUMERIC, -- e.g., diastolic BP
  unit TEXT,
  measured_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vital_readings_patient_entry ON vital_readings(patient_id, daily_entry_id);

-- ============================================================================
-- 8. NON-PLAN MEDICATIONS
-- ============================================================================

CREATE TABLE saved_meds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_meds_patient ON saved_meds(patient_id);

CREATE TABLE medication_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time TIMESTAMPTZ,
  name TEXT,
  saved_med_id UUID REFERENCES saved_meds(id) ON DELETE SET NULL,
  dose TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medication_intakes_patient_entry ON medication_intakes(patient_id, daily_entry_id);

-- ============================================================================
-- 9. GENERAL SYMPTOMS (daily tracking)
-- ============================================================================

CREATE TABLE saved_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'cycle_physical', 'cycle_emotional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_symptoms_patient ON saved_symptoms(patient_id);

CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  time TIMESTAMPTZ,
  label TEXT,
  saved_symptom_id UUID REFERENCES saved_symptoms(id) ON DELETE SET NULL,
  severity INTEGER CHECK (severity >= 0 AND severity <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptom_logs_patient_entry ON symptom_logs(patient_id, daily_entry_id);

-- ============================================================================
-- 10. CYCLE TRACKER
-- ============================================================================

CREATE TABLE cycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cycle_day INTEGER,
  physical_symptom_keys TEXT[],
  emotional_symptom_keys TEXT[],
  bleeding_quantity TEXT,
  blood_color TEXT,
  blood_volume TEXT,
  clots BOOLEAN,
  mucus BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cycle_logs_patient_entry ON cycle_logs(patient_id, daily_entry_id);

CREATE TABLE cycle_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_log_id UUID NOT NULL REFERENCES cycle_logs(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('patient', 'clinician')),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cycle_comments_log ON cycle_comments(cycle_log_id);

-- ============================================================================
-- 11. FORMULATIONS & TREATMENTS (regimen + adherence)
-- ============================================================================

CREATE TABLE regimen_formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  when_label TEXT,
  dose TEXT,
  with_text TEXT,
  start_date DATE,
  stop_date DATE,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regimen_formulations_patient ON regimen_formulations(patient_id);

CREATE TABLE regimen_formulation_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regimen_formulation_id UUID NOT NULL REFERENCES regimen_formulations(id) ON DELETE CASCADE,
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('taken', 'skipped', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regimen_formulation_intakes_patient_entry ON regimen_formulation_intakes(patient_id, daily_entry_id);

CREATE TABLE regimen_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  when_label TEXT,
  body_region TEXT,
  instructions TEXT,
  start_date DATE,
  stop_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regimen_treatments_patient ON regimen_treatments(patient_id);

CREATE TABLE regimen_treatment_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regimen_treatment_id UUID NOT NULL REFERENCES regimen_treatments(id) ON DELETE CASCADE,
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('completed', 'skipped', 'partial')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regimen_treatment_completions_patient_entry ON regimen_treatment_completions(patient_id, daily_entry_id);

CREATE TABLE regimen_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT,
  reply TEXT,
  reply_from TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regimen_notes_patient_entry ON regimen_notes(patient_id, daily_entry_id);
