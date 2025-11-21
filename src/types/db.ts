// Database types for MyAyu MVP
// These mirror the Supabase tables with fields we actually use

// ============================================================================
// IDENTITY & CONFIG
// ============================================================================

export interface Profile {
  id: string;
  role: 'patient' | 'clinician';
  full_name: string;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  timezone: string;
  created_at: string;
}

export interface PractitionerProfile {
  id: string;
  credentials?: string;
  specialties?: string[];
  created_at: string;
}

export interface PatientConfig {
  patient_id: string;
  tracking_window_days: number;
  edit_window_days: number;
  cycle_tracking_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DAILY ENTRY
// ============================================================================

export interface DailyEntry {
  id: string;
  patient_id: string;
  date: string; // Date as ISO string
  energy_physical?: number;
  energy_mental?: number;
  energy_emotional?: number;
  energy_drive?: number;
  overall_mood?: number;
  reflection?: string;
  cycle_day?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SLEEP & EARLY AM
// ============================================================================

export interface SleepBlock {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  fell_asleep_at?: string;
  woke_up_at?: string;
  got_up_at?: string;
  quality?: string;
  details?: string;
  feeling_on_waking?: string;
  created_at: string;
  updated_at: string;
}

export interface EarlyMorningEntry {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  hygiene_routine?: string;
  first_drink?: string;
  first_drink_time?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FOOD & FLUIDS
// ============================================================================

export interface SavedFood {
  id: string;
  patient_id: string;
  label: string;
  notes?: string;
  created_at: string;
}

export interface FoodEvent {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  time?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  description?: string;
  saved_food_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyFluidTotals {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  total_water_oz?: number;
  total_caffeine_oz?: number;
  total_other_oz?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BOWEL MOVEMENTS
// ============================================================================

export interface BowelMovement {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  time?: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// EXERCISE / MOVEMENT
// ============================================================================

export interface SavedExercise {
  id: string;
  patient_id: string;
  label: string;
  notes?: string;
  created_at: string;
}

export interface ExerciseEvent {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  start_time?: string;
  duration_minutes?: number;
  exercise_type?: string;
  saved_exercise_id?: string;
  felt_physical?: number;
  felt_mental?: number;
  felt_emotional?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VITALS
// ============================================================================

export interface VitalReading {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  type: 'blood_glucose' | 'blood_pressure' | 'early_am_temp' | 'pm_temp' | 'weight';
  value: number;
  aux_value?: number; // e.g., diastolic BP
  unit?: string;
  measured_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NON-PLAN MEDICATIONS
// ============================================================================

export interface SavedMed {
  id: string;
  patient_id: string;
  label: string;
  notes?: string;
  created_at: string;
}

export interface MedicationIntake {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  time?: string;
  name?: string;
  saved_med_id?: string;
  dose?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// GENERAL SYMPTOMS
// ============================================================================

export interface SavedSymptom {
  id: string;
  patient_id: string;
  label: string;
  category: 'general' | 'cycle_physical' | 'cycle_emotional';
  created_at: string;
}

export interface SymptomLog {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  time?: string;
  label?: string;
  saved_symptom_id?: string;
  severity?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CYCLE TRACKER
// ============================================================================

export interface CycleLog {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  cycle_day?: number;
  physical_symptom_keys?: string[];
  emotional_symptom_keys?: string[];
  bleeding_quantity?: string;
  blood_color?: string;
  blood_volume?: string;
  clots?: boolean;
  mucus?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CycleComment {
  id: string;
  cycle_log_id: string;
  author_type: 'patient' | 'clinician';
  author_id: string;
  text: string;
  created_at: string;
}

// ============================================================================
// FORMULATIONS & TREATMENTS
// ============================================================================

export interface RegimenFormulation {
  id: string;
  patient_id: string;
  name: string;
  when_label?: string;
  dose?: string;
  with_text?: string;
  start_date?: string;
  stop_date?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface RegimenFormulationIntake {
  id: string;
  regimen_formulation_id: string;
  daily_entry_id: string;
  patient_id: string;
  status?: 'taken' | 'skipped' | 'partial';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RegimenTreatment {
  id: string;
  patient_id: string;
  name: string;
  when_label?: string;
  body_region?: string;
  instructions?: string;
  start_date?: string;
  stop_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RegimenTreatmentCompletion {
  id: string;
  regimen_treatment_id: string;
  daily_entry_id: string;
  patient_id: string;
  status?: 'completed' | 'skipped' | 'partial';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RegimenNote {
  id: string;
  daily_entry_id: string;
  patient_id: string;
  note?: string;
  reply?: string;
  reply_from?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BUNDLE TYPE (for getDailyEntryBundle)
// ============================================================================

export interface DailyEntryBundle {
  dailyEntry: DailyEntry;
  sleepBlocks: SleepBlock[];
  earlyMorning?: EarlyMorningEntry;
  fluidTotals?: DailyFluidTotals;
  foodEvents: FoodEvent[];
  bowelMovements: BowelMovement[];
  exerciseEvents: ExerciseEvent[];
  vitalReadings: VitalReading[];
  medicationIntakes: MedicationIntake[];
  symptomLogs: SymptomLog[];
  cycleLog?: CycleLog;
  cycleComments: CycleComment[];
  regimenFormulations: RegimenFormulation[];
  formulationIntakes: RegimenFormulationIntake[];
  regimenTreatments: RegimenTreatment[];
  treatmentCompletions: RegimenTreatmentCompletion[];
  regimenNotes?: RegimenNote;
  // Saved items for dropdowns
  savedFoods: SavedFood[];
  savedExercises: SavedExercise[];
  savedMeds: SavedMed[];
  savedSymptoms: SavedSymptom[];
}

// ============================================================================
// TRACKER SUMMARY
// ============================================================================

export interface DailySummary {
  date: string;
  energy_physical?: number;
  energy_mental?: number;
  energy_emotional?: number;
  energy_drive?: number;
  overall_mood?: number;
  food_count: number;
  bowel_movement_count: number;
  exercise_minutes: number;
  formulation_adherence_percent: number;
  treatment_adherence_percent: number;
  has_cycle_log: boolean;
}

export interface CycleDaySummary {
  date: string;
  cycle_day?: number;
  // Cycle-specific data
  physical_symptom_keys?: string[];
  emotional_symptom_keys?: string[];
  bleeding_quantity?: string;
  blood_color?: string;
  blood_volume?: string;
  clots?: boolean;
  mucus?: boolean;
  // Energy data for overlays
  energy_physical?: number;
  energy_mental?: number;
  energy_emotional?: number;
  energy_drive?: number;
  overall_mood?: number;
  // Adherence for overlays
  formulation_adherence_percent: number;
  treatment_adherence_percent: number;
}
