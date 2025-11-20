-- MyAyu MVP - Development Seed Data
-- Creates 1 patient + 1 clinician + 14 days of sample tracking data

-- ============================================================================
-- 1. CREATE PROFILES
-- ============================================================================

-- Patient profile
INSERT INTO profiles (id, role, full_name, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'patient', 'Jane Smith', NOW());

INSERT INTO patient_profiles (id, timezone, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'America/Los_Angeles', NOW());

INSERT INTO patient_configs (patient_id, tracking_window_days, edit_window_days, cycle_tracking_enabled)
VALUES
  ('11111111-1111-1111-1111-111111111111', 30, 7, TRUE);

-- Clinician profile
INSERT INTO profiles (id, role, full_name, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'clinician', 'Dr. Sarah Johnson', NOW());

INSERT INTO practitioner_profiles (id, credentials, specialties, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'ND, LAc', ARRAY['Functional Medicine', 'Women''s Health'], NOW());

-- ============================================================================
-- 2. CREATE REGIMEN (formulations & treatments)
-- ============================================================================

-- Formulation 1
INSERT INTO regimen_formulations (id, patient_id, name, when_label, dose, with_text, start_date, instructions)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Herbal Formula A', 'with breakfast', '2 capsules', 'water', CURRENT_DATE - INTERVAL '30 days', 'Take with food to avoid stomach upset');

-- Formulation 2
INSERT INTO regimen_formulations (id, patient_id, name, when_label, dose, with_text, start_date, instructions)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Herbal Formula B', 'before bed', '1 capsule', 'warm water', CURRENT_DATE - INTERVAL '30 days', 'Take 30 minutes before sleep');

-- Treatment 1
INSERT INTO regimen_treatments (id, patient_id, name, when_label, body_region, instructions, start_date)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Castor Oil Pack', 'evening', 'lower abdomen', 'Apply for 45 minutes, 3-4 times per week', CURRENT_DATE - INTERVAL '30 days');

-- ============================================================================
-- 3. CREATE SAVED ITEMS (foods, exercises, meds, symptoms)
-- ============================================================================

-- Saved foods
INSERT INTO saved_foods (id, patient_id, label, notes)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Green smoothie', 'Spinach, banana, almond milk, chia seeds'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Oatmeal with berries', 'Steel-cut oats, blueberries, walnuts'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Quinoa bowl', 'Quinoa, roasted veggies, tahini dressing');

-- Saved exercises
INSERT INTO saved_exercises (id, patient_id, label, notes)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Yoga', '30-45 min gentle flow'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Walking', 'Outdoor walk in neighborhood'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Strength training', 'Bodyweight exercises');

-- Saved meds
INSERT INTO saved_meds (id, patient_id, label, notes)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Vitamin D', '2000 IU'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Magnesium', '400mg');

-- Saved symptoms
INSERT INTO saved_symptoms (id, patient_id, label, category)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Headache', 'general'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Fatigue', 'general'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Bloating', 'cycle_physical'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Cramps', 'cycle_physical'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Breast tenderness', 'cycle_physical'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Anxious', 'cycle_emotional'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Irritable', 'cycle_emotional'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Sad', 'cycle_emotional');

-- ============================================================================
-- 4. CREATE 14 DAYS OF DAILY ENTRIES & ASSOCIATED DATA
-- ============================================================================

DO $$
DECLARE
  v_date DATE;
  v_daily_entry_id UUID;
  v_cycle_day INTEGER := 15;
  v_day_offset INTEGER;
  v_formulation_id_1 UUID;
  v_formulation_id_2 UUID;
  v_treatment_id UUID;
BEGIN
  -- Get formulation and treatment IDs for adherence tracking
  SELECT id INTO v_formulation_id_1 FROM regimen_formulations WHERE patient_id = '11111111-1111-1111-1111-111111111111' AND name = 'Herbal Formula A';
  SELECT id INTO v_formulation_id_2 FROM regimen_formulations WHERE patient_id = '11111111-1111-1111-1111-111111111111' AND name = 'Herbal Formula B';
  SELECT id INTO v_treatment_id FROM regimen_treatments WHERE patient_id = '11111111-1111-1111-1111-111111111111' AND name = 'Castor Oil Pack';

  -- Create 14 days of entries (going backwards from today)
  FOR v_day_offset IN 0..13 LOOP
    v_date := CURRENT_DATE - v_day_offset;
    v_cycle_day := 15 + v_day_offset; -- Simple increment for demo

    -- Create daily entry
    INSERT INTO daily_entries (id, patient_id, date, energy_physical, energy_mental, energy_emotional, energy_drive, overall_mood, reflection, cycle_day)
    VALUES (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      v_date,
      6 + (v_day_offset % 3), -- Vary between 6-8
      7 + (v_day_offset % 2), -- Vary between 7-8
      6 + ((v_day_offset + 1) % 3), -- Vary between 6-8
      7,
      7 + (v_day_offset % 2), -- Vary between 7-8
      CASE
        WHEN v_day_offset = 0 THEN 'Feeling good today, energy levels steady'
        WHEN v_day_offset = 3 THEN 'Slept well, woke up refreshed'
        WHEN v_day_offset = 7 THEN 'A bit tired today but mood is good'
        ELSE NULL
      END,
      v_cycle_day
    )
    RETURNING id INTO v_daily_entry_id;

    -- Sleep data
    INSERT INTO sleep_blocks (daily_entry_id, patient_id, fell_asleep_at, woke_up_at, got_up_at, quality, feeling_on_waking)
    VALUES (
      v_daily_entry_id,
      '11111111-1111-1111-1111-111111111111',
      v_date - INTERVAL '1 day' + INTERVAL '22 hours' + INTERVAL '30 minutes',
      v_date + INTERVAL '6 hours' + INTERVAL '15 minutes',
      v_date + INTERVAL '6 hours' + INTERVAL '45 minutes',
      CASE WHEN v_day_offset % 3 = 0 THEN 'Good' WHEN v_day_offset % 3 = 1 THEN 'Fair' ELSE 'Excellent' END,
      CASE WHEN v_day_offset % 2 = 0 THEN 'Rested' ELSE 'A bit groggy' END
    );

    -- Early morning
    INSERT INTO early_morning_entries (daily_entry_id, patient_id, hygiene_routine, first_drink, first_drink_time)
    VALUES (
      v_daily_entry_id,
      '11111111-1111-1111-1111-111111111111',
      'Shower, skincare',
      'Warm lemon water',
      v_date + INTERVAL '7 hours'
    );

    -- Food events (breakfast, lunch, dinner, 1-2 snacks)
    INSERT INTO food_events (daily_entry_id, patient_id, time, meal_type, description)
    VALUES
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '8 hours', 'breakfast', 'Oatmeal with berries and walnuts'),
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '12 hours 30 minutes', 'lunch', 'Quinoa bowl with roasted vegetables'),
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '15 hours', 'snack', 'Apple with almond butter'),
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '18 hours 30 minutes', 'dinner', 'Baked salmon, sweet potato, steamed broccoli');

    -- Fluid totals
    INSERT INTO daily_fluid_totals (daily_entry_id, patient_id, total_water_oz, total_caffeine_oz, total_other_oz)
    VALUES (
      v_daily_entry_id,
      '11111111-1111-1111-1111-111111111111',
      64 + (v_day_offset % 16), -- Vary between 64-80oz
      8,
      0
    );

    -- Bowel movement (most days)
    IF v_day_offset % 3 != 2 THEN
      INSERT INTO bowel_movements (daily_entry_id, patient_id, time, details)
      VALUES (
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        v_date + INTERVAL '9 hours',
        'Normal consistency, no issues'
      );
    END IF;

    -- Exercise (every other day)
    IF v_day_offset % 2 = 0 THEN
      INSERT INTO exercise_events (daily_entry_id, patient_id, start_time, duration_minutes, exercise_type, felt_physical, felt_mental, felt_emotional)
      VALUES (
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        v_date + INTERVAL '17 hours',
        CASE WHEN v_day_offset % 4 = 0 THEN 45 ELSE 30 END,
        CASE WHEN v_day_offset % 4 = 0 THEN 'Yoga' ELSE 'Walking' END,
        7,
        8,
        7
      );
    END IF;

    -- Vitals (weight every few days, temp daily)
    IF v_day_offset % 3 = 0 THEN
      INSERT INTO vital_readings (daily_entry_id, patient_id, type, value, unit, measured_at)
      VALUES (
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        'weight',
        142 + (v_day_offset % 3),
        'lbs',
        v_date + INTERVAL '7 hours'
      );
    END IF;

    INSERT INTO vital_readings (daily_entry_id, patient_id, type, value, unit, measured_at)
    VALUES (
      v_daily_entry_id,
      '11111111-1111-1111-1111-111111111111',
      'early_am_temp',
      97.8 + (v_day_offset % 10) * 0.1,
      'F',
      v_date + INTERVAL '7 hours'
    );

    -- Medication intakes
    INSERT INTO medication_intakes (daily_entry_id, patient_id, time, name, dose, notes)
    VALUES
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '8 hours', 'Vitamin D', '2000 IU', 'With breakfast'),
      (v_daily_entry_id, '11111111-1111-1111-1111-111111111111', v_date + INTERVAL '21 hours', 'Magnesium', '400mg', 'Before bed');

    -- Symptom logs (occasional)
    IF v_day_offset % 4 = 0 THEN
      INSERT INTO symptom_logs (daily_entry_id, patient_id, time, label, severity, notes)
      VALUES (
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        v_date + INTERVAL '14 hours',
        'Headache',
        3,
        'Mild, resolved after lunch'
      );
    END IF;

    -- Cycle log
    INSERT INTO cycle_logs (daily_entry_id, patient_id, cycle_day, physical_symptom_keys, emotional_symptom_keys, bleeding_quantity, blood_color, clots, mucus)
    VALUES (
      v_daily_entry_id,
      '11111111-1111-1111-1111-111111111111',
      v_cycle_day,
      CASE
        WHEN v_cycle_day BETWEEN 15 AND 20 THEN ARRAY['bloating', 'breast_tenderness']
        WHEN v_cycle_day BETWEEN 21 AND 28 THEN ARRAY['cramps']
        ELSE ARRAY[]::TEXT[]
      END,
      CASE
        WHEN v_cycle_day BETWEEN 15 AND 20 THEN ARRAY['irritable']
        ELSE ARRAY[]::TEXT[]
      END,
      CASE WHEN v_cycle_day BETWEEN 1 AND 5 THEN 'Medium' ELSE NULL END,
      CASE WHEN v_cycle_day BETWEEN 1 AND 5 THEN 'Dark red' ELSE NULL END,
      CASE WHEN v_cycle_day BETWEEN 1 AND 5 THEN TRUE ELSE FALSE END,
      CASE WHEN v_cycle_day BETWEEN 12 AND 16 THEN TRUE ELSE FALSE END
    );

    -- Formulation adherence
    INSERT INTO regimen_formulation_intakes (regimen_formulation_id, daily_entry_id, patient_id, status, notes)
    VALUES
      (v_formulation_id_1, v_daily_entry_id, '11111111-1111-1111-1111-111111111111',
       CASE WHEN v_day_offset % 7 = 0 THEN 'skipped' ELSE 'taken' END, NULL),
      (v_formulation_id_2, v_daily_entry_id, '11111111-1111-1111-1111-111111111111', 'taken', NULL);

    -- Treatment adherence (3-4 times per week)
    IF v_day_offset % 2 = 0 AND v_day_offset % 7 != 1 THEN
      INSERT INTO regimen_treatment_completions (regimen_treatment_id, daily_entry_id, patient_id, status, notes)
      VALUES (
        v_treatment_id,
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        'completed',
        '45 minutes'
      );
    END IF;

    -- Regimen notes (occasional)
    IF v_day_offset % 5 = 0 THEN
      INSERT INTO regimen_notes (daily_entry_id, patient_id, note, reply, reply_from)
      VALUES (
        v_daily_entry_id,
        '11111111-1111-1111-1111-111111111111',
        'Protocol going well, noticing improved energy',
        CASE WHEN v_day_offset = 10 THEN 'Great progress! Continue as planned.' ELSE NULL END,
        CASE WHEN v_day_offset = 10 THEN 'Dr. Johnson' ELSE NULL END
      );
    END IF;

  END LOOP;
END $$;
