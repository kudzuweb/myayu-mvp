// Daily Entry API - Data access layer for fetching and updating daily tracking data
import { supabase, handleSupabaseError } from '../supabaseClient';
import type {
  DailyEntry,
  DailyEntryBundle,
  SleepBlock,
  EarlyMorningEntry,
  FoodEvent,
  DailyFluidTotals,
  BowelMovement,
  ExerciseEvent,
  VitalReading,
  MedicationIntake,
  SymptomLog,
  CycleLog,
  CycleComment,
  RegimenFormulation,
  RegimenFormulationIntake,
  RegimenTreatment,
  RegimenTreatmentCompletion,
  RegimenNote,
  PatientConfig,
} from '../../types/db';

// ============================================================================
// PATIENT CONFIG
// ============================================================================

/**
 * Get patient configuration (edit window, tracking settings, etc.)
 */
export async function getPatientConfig(patientId: string): Promise<PatientConfig> {
  try {
    const { data, error } = await supabase
      .from('patient_configs')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      handleSupabaseError(error, 'getPatientConfig');
    }

    return data as PatientConfig;
  } catch (error) {
    handleSupabaseError(error, 'getPatientConfig');
  }
}

// ============================================================================
// DAILY ENTRY (anchor row)
// ============================================================================

/**
 * Get or create a daily entry for a specific patient and date
 * Returns the daily entry ID
 */
export async function getOrCreateDailyEntry(
  patientId: string,
  date: string // ISO date string YYYY-MM-DD
): Promise<DailyEntry> {
  try {
    // Try to fetch existing entry
    const { data: existing, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('patient_id', patientId)
      .eq('date', date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected
      handleSupabaseError(fetchError, 'getOrCreateDailyEntry - fetch');
    }

    if (existing) {
      return existing as DailyEntry;
    }

    // Create new entry
    const { data: newEntry, error: insertError } = await supabase
      .from('daily_entries')
      .insert({
        patient_id: patientId,
        date,
      })
      .select()
      .single();

    if (insertError) {
      handleSupabaseError(insertError, 'getOrCreateDailyEntry - insert');
    }

    return newEntry as DailyEntry;
  } catch (error) {
    handleSupabaseError(error, 'getOrCreateDailyEntry');
    throw error; // Never reached, but keeps TypeScript happy
  }
}

/**
 * Update daily entry fields (energy, mood, reflection, cycle_day)
 */
export async function updateDailyEntry(params: {
  id: string;
  energy_physical?: number;
  energy_mental?: number;
  energy_emotional?: number;
  energy_drive?: number;
  overall_mood?: number;
  reflection?: string;
  cycle_day?: number;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('daily_entries')
      .update({
        energy_physical: params.energy_physical,
        energy_mental: params.energy_mental,
        energy_emotional: params.energy_emotional,
        energy_drive: params.energy_drive,
        overall_mood: params.overall_mood,
        reflection: params.reflection,
        cycle_day: params.cycle_day,
      })
      .eq('id', params.id);

    if (error) {
      handleSupabaseError(error, 'updateDailyEntry');
    }
  } catch (error) {
    handleSupabaseError(error, 'updateDailyEntry');
  }
}

/**
 * Get complete daily entry bundle for a specific date
 * Fetches all associated logs, saved items, and regimen data
 */
export async function getDailyEntryBundle(
  patientId: string,
  date: string
): Promise<DailyEntryBundle> {
  try {
    // First, get or create the daily entry
    const dailyEntry = await getOrCreateDailyEntry(patientId, date);

    // Fetch all related data in parallel
    const [
      sleepBlocksRes,
      earlyMorningRes,
      fluidTotalsRes,
      foodEventsRes,
      bowelMovementsRes,
      exerciseEventsRes,
      vitalReadingsRes,
      medicationIntakesRes,
      symptomLogsRes,
      cycleLogRes,
      cycleCommentsRes,
      regimenFormulationsRes,
      formulationIntakesRes,
      regimenTreatmentsRes,
      treatmentCompletionsRes,
      regimenNotesRes,
      savedFoodsRes,
      savedExercisesRes,
      savedMedsRes,
      savedSymptomsRes,
    ] = await Promise.all([
      supabase.from('sleep_blocks').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('early_morning_entries').select('*').eq('daily_entry_id', dailyEntry.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('daily_fluid_totals').select('*').eq('daily_entry_id', dailyEntry.id).maybeSingle(),
      supabase.from('food_events').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('bowel_movements').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('exercise_events').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('vital_readings').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('medication_intakes').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('symptom_logs').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('cycle_logs').select('*').eq('daily_entry_id', dailyEntry.id).maybeSingle(),
      supabase.from('cycle_comments').select('*').eq('cycle_log_id', dailyEntry.id), // Will be filtered after cycle_log fetch
      supabase.from('regimen_formulations').select('*').eq('patient_id', patientId),
      supabase.from('regimen_formulation_intakes').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('regimen_treatments').select('*').eq('patient_id', patientId),
      supabase.from('regimen_treatment_completions').select('*').eq('daily_entry_id', dailyEntry.id),
      supabase.from('regimen_notes').select('*').eq('daily_entry_id', dailyEntry.id).maybeSingle(),
      supabase.from('saved_foods').select('*').eq('patient_id', patientId),
      supabase.from('saved_exercises').select('*').eq('patient_id', patientId),
      supabase.from('saved_meds').select('*').eq('patient_id', patientId),
      supabase.from('saved_symptoms').select('*').eq('patient_id', patientId),
    ]);

    // Check for errors
    if (sleepBlocksRes.error) handleSupabaseError(sleepBlocksRes.error, 'getDailyEntryBundle - sleep_blocks');
    if (earlyMorningRes.error) handleSupabaseError(earlyMorningRes.error, 'getDailyEntryBundle - early_morning');
    if (fluidTotalsRes.error) handleSupabaseError(fluidTotalsRes.error, 'getDailyEntryBundle - fluid_totals');
    if (foodEventsRes.error) handleSupabaseError(foodEventsRes.error, 'getDailyEntryBundle - food_events');
    if (bowelMovementsRes.error) handleSupabaseError(bowelMovementsRes.error, 'getDailyEntryBundle - bowel_movements');
    if (exerciseEventsRes.error) handleSupabaseError(exerciseEventsRes.error, 'getDailyEntryBundle - exercise_events');
    if (vitalReadingsRes.error) handleSupabaseError(vitalReadingsRes.error, 'getDailyEntryBundle - vital_readings');
    if (medicationIntakesRes.error) handleSupabaseError(medicationIntakesRes.error, 'getDailyEntryBundle - medication_intakes');
    if (symptomLogsRes.error) handleSupabaseError(symptomLogsRes.error, 'getDailyEntryBundle - symptom_logs');
    if (cycleLogRes.error) handleSupabaseError(cycleLogRes.error, 'getDailyEntryBundle - cycle_log');
    if (regimenFormulationsRes.error) handleSupabaseError(regimenFormulationsRes.error, 'getDailyEntryBundle - regimen_formulations');
    if (formulationIntakesRes.error) handleSupabaseError(formulationIntakesRes.error, 'getDailyEntryBundle - formulation_intakes');
    if (regimenTreatmentsRes.error) handleSupabaseError(regimenTreatmentsRes.error, 'getDailyEntryBundle - regimen_treatments');
    if (treatmentCompletionsRes.error) handleSupabaseError(treatmentCompletionsRes.error, 'getDailyEntryBundle - treatment_completions');
    if (regimenNotesRes.error) handleSupabaseError(regimenNotesRes.error, 'getDailyEntryBundle - regimen_notes');
    if (savedFoodsRes.error) handleSupabaseError(savedFoodsRes.error, 'getDailyEntryBundle - saved_foods');
    if (savedExercisesRes.error) handleSupabaseError(savedExercisesRes.error, 'getDailyEntryBundle - saved_exercises');
    if (savedMedsRes.error) handleSupabaseError(savedMedsRes.error, 'getDailyEntryBundle - saved_meds');
    if (savedSymptomsRes.error) handleSupabaseError(savedSymptomsRes.error, 'getDailyEntryBundle - saved_symptoms');

    // Fetch cycle comments if we have a cycle log
    let cycleCommentsData: CycleComment[] = [];
    if (cycleLogRes.data) {
      const { data, error } = await supabase
        .from('cycle_comments')
        .select('*')
        .eq('cycle_log_id', cycleLogRes.data.id);
      if (error) handleSupabaseError(error, 'getDailyEntryBundle - cycle_comments');
      cycleCommentsData = data || [];
    }

    return {
      dailyEntry,
      sleepBlocks: sleepBlocksRes.data || [],
      earlyMorning: earlyMorningRes.data || undefined,
      fluidTotals: fluidTotalsRes.data || undefined,
      foodEvents: foodEventsRes.data || [],
      bowelMovements: bowelMovementsRes.data || [],
      exerciseEvents: exerciseEventsRes.data || [],
      vitalReadings: vitalReadingsRes.data || [],
      medicationIntakes: medicationIntakesRes.data || [],
      symptomLogs: symptomLogsRes.data || [],
      cycleLog: cycleLogRes.data || undefined,
      cycleComments: cycleCommentsData,
      regimenFormulations: regimenFormulationsRes.data || [],
      formulationIntakes: formulationIntakesRes.data || [],
      regimenTreatments: regimenTreatmentsRes.data || [],
      treatmentCompletions: treatmentCompletionsRes.data || [],
      regimenNotes: regimenNotesRes.data || undefined,
      savedFoods: savedFoodsRes.data || [],
      savedExercises: savedExercisesRes.data || [],
      savedMeds: savedMedsRes.data || [],
      savedSymptoms: savedSymptomsRes.data || [],
    };
  } catch (error) {
    handleSupabaseError(error, 'getDailyEntryBundle');
    throw error;
  }
}

// ============================================================================
// SLEEP & EARLY AM
// ============================================================================

export async function upsertSleepBlock(
  data: Partial<SleepBlock> & { daily_entry_id: string; patient_id: string }
): Promise<SleepBlock> {
  try {
    const { data: result, error } = await supabase
      .from('sleep_blocks')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertSleepBlock');
    return result as SleepBlock;
  } catch (error) {
    handleSupabaseError(error, 'upsertSleepBlock');
    throw error;
  }
}

export async function upsertEarlyMorning(
  data: Partial<EarlyMorningEntry> & { daily_entry_id: string; patient_id: string }
): Promise<EarlyMorningEntry> {
  try {
    const { data: result, error } = await supabase
      .from('early_morning_entries')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertEarlyMorning');
    return result as EarlyMorningEntry;
  } catch (error) {
    handleSupabaseError(error, 'upsertEarlyMorning');
    throw error;
  }
}

// ============================================================================
// FOOD & FLUIDS
// ============================================================================

export async function addFoodEvent(
  data: Partial<FoodEvent> & { daily_entry_id: string; patient_id: string }
): Promise<FoodEvent> {
  try {
    const { data: result, error } = await supabase
      .from('food_events')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addFoodEvent');
    return result as FoodEvent;
  } catch (error) {
    handleSupabaseError(error, 'addFoodEvent');
    throw error;
  }
}

export async function deleteFoodEvent(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('food_events').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteFoodEvent');
  } catch (error) {
    handleSupabaseError(error, 'deleteFoodEvent');
    throw error;
  }
}

export async function upsertFluidTotals(
  data: Partial<DailyFluidTotals> & { daily_entry_id: string; patient_id: string }
): Promise<DailyFluidTotals> {
  try {
    const { data: result, error } = await supabase
      .from('daily_fluid_totals')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertFluidTotals');
    return result as DailyFluidTotals;
  } catch (error) {
    handleSupabaseError(error, 'upsertFluidTotals');
    throw error;
  }
}

// ============================================================================
// BOWEL MOVEMENTS
// ============================================================================

export async function addBowelMovement(
  data: Partial<BowelMovement> & { daily_entry_id: string; patient_id: string }
): Promise<BowelMovement> {
  try {
    const { data: result, error } = await supabase
      .from('bowel_movements')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addBowelMovement');
    return result as BowelMovement;
  } catch (error) {
    handleSupabaseError(error, 'addBowelMovement');
    throw error;
  }
}

export async function deleteBowelMovement(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('bowel_movements').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteBowelMovement');
  } catch (error) {
    handleSupabaseError(error, 'deleteBowelMovement');
    throw error;
  }
}

// ============================================================================
// EXERCISE / MOVEMENT
// ============================================================================

export async function addExerciseEvent(
  data: Partial<ExerciseEvent> & { daily_entry_id: string; patient_id: string }
): Promise<ExerciseEvent> {
  try {
    const { data: result, error } = await supabase
      .from('exercise_events')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addExerciseEvent');
    return result as ExerciseEvent;
  } catch (error) {
    handleSupabaseError(error, 'addExerciseEvent');
    throw error;
  }
}

export async function deleteExerciseEvent(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('exercise_events').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteExerciseEvent');
  } catch (error) {
    handleSupabaseError(error, 'deleteExerciseEvent');
    throw error;
  }
}

// ============================================================================
// VITALS
// ============================================================================

export async function addVitalReading(
  data: Partial<VitalReading> & { daily_entry_id: string; patient_id: string; type: string; value: number }
): Promise<VitalReading> {
  try {
    const { data: result, error } = await supabase
      .from('vital_readings')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addVitalReading');
    return result as VitalReading;
  } catch (error) {
    handleSupabaseError(error, 'addVitalReading');
    throw error;
  }
}

export async function deleteVitalReading(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('vital_readings').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteVitalReading');
  } catch (error) {
    handleSupabaseError(error, 'deleteVitalReading');
    throw error;
  }
}

// ============================================================================
// MEDICATIONS
// ============================================================================

export async function addMedicationIntake(
  data: Partial<MedicationIntake> & { daily_entry_id: string; patient_id: string }
): Promise<MedicationIntake> {
  try {
    const { data: result, error } = await supabase
      .from('medication_intakes')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addMedicationIntake');
    return result as MedicationIntake;
  } catch (error) {
    handleSupabaseError(error, 'addMedicationIntake');
    throw error;
  }
}

export async function deleteMedicationIntake(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('medication_intakes').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteMedicationIntake');
  } catch (error) {
    handleSupabaseError(error, 'deleteMedicationIntake');
    throw error;
  }
}

// ============================================================================
// SYMPTOMS
// ============================================================================

export async function addSymptomLog(
  data: Partial<SymptomLog> & { daily_entry_id: string; patient_id: string }
): Promise<SymptomLog> {
  try {
    const { data: result, error } = await supabase
      .from('symptom_logs')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addSymptomLog');
    return result as SymptomLog;
  } catch (error) {
    handleSupabaseError(error, 'addSymptomLog');
    throw error;
  }
}

export async function deleteSymptomLog(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('symptom_logs').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteSymptomLog');
  } catch (error) {
    handleSupabaseError(error, 'deleteSymptomLog');
    throw error;
  }
}

// ============================================================================
// CYCLE
// ============================================================================

export async function upsertCycleLog(
  data: Partial<CycleLog> & { daily_entry_id: string; patient_id: string }
): Promise<CycleLog> {
  try {
    const { data: result, error } = await supabase
      .from('cycle_logs')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertCycleLog');
    return result as CycleLog;
  } catch (error) {
    handleSupabaseError(error, 'upsertCycleLog');
    throw error;
  }
}

export async function addCycleComment(
  data: Partial<CycleComment> & { cycle_log_id: string; author_type: string; author_id: string; text: string }
): Promise<CycleComment> {
  try {
    const { data: result, error } = await supabase
      .from('cycle_comments')
      .insert(data)
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addCycleComment');
    return result as CycleComment;
  } catch (error) {
    handleSupabaseError(error, 'addCycleComment');
    throw error;
  }
}

/**
 * Get or create a cycle log for a daily entry
 */
export async function getOrCreateCycleLog(
  dailyEntryId: string,
  patientId: string
): Promise<CycleLog> {
  try {
    // Try to fetch existing cycle log
    const { data: existing, error: fetchError } = await supabase
      .from('cycle_logs')
      .select('*')
      .eq('daily_entry_id', dailyEntryId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      handleSupabaseError(fetchError, 'getOrCreateCycleLog - fetch');
    }

    if (existing) {
      return existing as CycleLog;
    }

    // Create new cycle log
    const { data: newLog, error: insertError } = await supabase
      .from('cycle_logs')
      .insert({
        daily_entry_id: dailyEntryId,
        patient_id: patientId,
      })
      .select()
      .single();

    if (insertError) {
      handleSupabaseError(insertError, 'getOrCreateCycleLog - insert');
    }

    return newLog as CycleLog;
  } catch (error) {
    handleSupabaseError(error, 'getOrCreateCycleLog');
    throw error;
  }
}

/**
 * Get saved symptoms for a patient, optionally filtered by category
 */
export async function getCycleSavedSymptoms(
  patientId: string,
  category?: 'cycle_physical' | 'cycle_emotional'
) {
  try {
    let query = supabase
      .from('saved_symptoms')
      .select('*')
      .eq('patient_id', patientId);

    if (category) {
      query = query.eq('category', category);
    } else {
      query = query.in('category', ['cycle_physical', 'cycle_emotional']);
    }

    const { data, error } = await query.order('label');

    if (error) handleSupabaseError(error, 'getCycleSavedSymptoms');
    return data || [];
  } catch (error) {
    handleSupabaseError(error, 'getCycleSavedSymptoms');
    throw error;
  }
}

/**
 * Add a new cycle symptom to saved_symptoms
 */
export async function addCycleSymptom(params: {
  patient_id: string;
  category: 'cycle_physical' | 'cycle_emotional';
  label: string;
}) {
  try {
    const { data, error } = await supabase
      .from('saved_symptoms')
      .insert({
        patient_id: params.patient_id,
        category: params.category,
        label: params.label,
      })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'addCycleSymptom');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'addCycleSymptom');
    throw error;
  }
}

// ============================================================================
// REGIMEN
// ============================================================================

export async function upsertFormulationIntake(
  data: Partial<RegimenFormulationIntake> & { regimen_formulation_id: string; daily_entry_id: string; patient_id: string }
): Promise<RegimenFormulationIntake> {
  try {
    const { data: result, error } = await supabase
      .from('regimen_formulation_intakes')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertFormulationIntake');
    return result as RegimenFormulationIntake;
  } catch (error) {
    handleSupabaseError(error, 'upsertFormulationIntake');
    throw error;
  }
}

export async function upsertTreatmentCompletion(
  data: Partial<RegimenTreatmentCompletion> & { regimen_treatment_id: string; daily_entry_id: string; patient_id: string }
): Promise<RegimenTreatmentCompletion> {
  try {
    const { data: result, error } = await supabase
      .from('regimen_treatment_completions')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertTreatmentCompletion');
    return result as RegimenTreatmentCompletion;
  } catch (error) {
    handleSupabaseError(error, 'upsertTreatmentCompletion');
    throw error;
  }
}

export async function upsertRegimenNote(
  data: Partial<RegimenNote> & { daily_entry_id: string; patient_id: string }
): Promise<RegimenNote> {
  try {
    const { data: result, error } = await supabase
      .from('regimen_notes')
      .upsert(data, { onConflict: 'id' })
      .select()
      .single();

    if (error) handleSupabaseError(error, 'upsertRegimenNote');
    return result as RegimenNote;
  } catch (error) {
    handleSupabaseError(error, 'upsertRegimenNote');
    throw error;
  }
}
