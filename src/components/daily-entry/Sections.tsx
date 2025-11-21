// Daily Entry Section Components
import { useState, useCallback } from 'react';
import type { DailyEntryBundle } from '../../types/db';
import {
  upsertSleepBlock,
  upsertEarlyMorning,
  addFoodEvent,
  deleteFoodEvent,
  upsertFluidTotals,
} from '../../lib/api/dailyEntry';

// Reusable section wrapper
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

// No data message
function NoData({ message }: { message: string }) {
  return <p className="text-gray-500 text-sm italic">{message}</p>;
}

// ============================================================================
// DAILY TRACKING SECTIONS
// ============================================================================

export function SleepSection({ data, editable }: { data: DailyEntryBundle; editable?: boolean }) {
  const sleepBlock = data.sleepBlocks[0]; // Typically one per day

  // Helper to extract date and time from ISO string
  const toDate = (isoString: string | undefined) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(11, 16); // HH:MM
  };

  // Local state for editable mode - store date/time separately
  const [formData, setFormData] = useState({
    fell_asleep_date: toDate(sleepBlock?.fell_asleep_at),
    fell_asleep_time: toTime(sleepBlock?.fell_asleep_at),
    woke_up_date: toDate(sleepBlock?.woke_up_at),
    woke_up_time: toTime(sleepBlock?.woke_up_at),
    got_up_date: toDate(sleepBlock?.got_up_at),
    got_up_time: toTime(sleepBlock?.got_up_at),
    quality: sleepBlock?.quality || '',
    feeling_on_waking: sleepBlock?.feeling_on_waking || '',
    details: sleepBlock?.details || '',
  });

  // Helper to combine date and time into ISO string
  const combineDateTime = (date: string, time: string) => {
    if (!date || !time) return undefined;
    return new Date(`${date}T${time}`).toISOString();
  };

  const handleSave = useCallback(async () => {
    try {
      await upsertSleepBlock({
        id: sleepBlock?.id,
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        fell_asleep_at: combineDateTime(formData.fell_asleep_date, formData.fell_asleep_time),
        woke_up_at: combineDateTime(formData.woke_up_date, formData.woke_up_time),
        got_up_at: combineDateTime(formData.got_up_date, formData.got_up_time),
        quality: formData.quality || undefined,
        feeling_on_waking: formData.feeling_on_waking || undefined,
        details: formData.details || undefined,
      });
    } catch (error) {
      console.error('Failed to save sleep data:', error);
    }
  }, [formData, sleepBlock?.id, data.dailyEntry.id, data.dailyEntry.patient_id]);

  if (!editable && !sleepBlock) {
    return <Section title="Sleep"><NoData message="No sleep data logged" /></Section>;
  }

  return (
    <Section title="Sleep">
      {editable ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Fell asleep</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.fell_asleep_date}
                onChange={(e) => setFormData({ ...formData, fell_asleep_date: e.target.value })}
                onBlur={handleSave}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <input
                type="time"
                value={formData.fell_asleep_time}
                onChange={(e) => setFormData({ ...formData, fell_asleep_time: e.target.value })}
                onBlur={handleSave}
                className="w-32 px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Woke up</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.woke_up_date}
                onChange={(e) => setFormData({ ...formData, woke_up_date: e.target.value })}
                onBlur={handleSave}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <input
                type="time"
                value={formData.woke_up_time}
                onChange={(e) => setFormData({ ...formData, woke_up_time: e.target.value })}
                onBlur={handleSave}
                className="w-32 px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Got up</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={formData.got_up_date}
                onChange={(e) => setFormData({ ...formData, got_up_date: e.target.value })}
                onBlur={handleSave}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <input
                type="time"
                value={formData.got_up_time}
                onChange={(e) => setFormData({ ...formData, got_up_time: e.target.value })}
                onBlur={handleSave}
                className="w-32 px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quality</label>
            <select
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              onBlur={handleSave}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="">Select...</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Feeling on waking</label>
            <input
              type="text"
              value={formData.feeling_on_waking}
              onChange={(e) => setFormData({ ...formData, feeling_on_waking: e.target.value })}
              onBlur={handleSave}
              placeholder="e.g., Rested, Groggy, Refreshed"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details (optional)</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              onBlur={handleSave}
              placeholder="Any additional notes about sleep..."
              rows={3}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {sleepBlock?.fell_asleep_at && (
            <div>
              <span className="font-medium">Fell asleep:</span>{' '}
              {new Date(sleepBlock.fell_asleep_at).toLocaleTimeString()}
            </div>
          )}
          {sleepBlock?.woke_up_at && (
            <div>
              <span className="font-medium">Woke up:</span>{' '}
              {new Date(sleepBlock.woke_up_at).toLocaleTimeString()}
            </div>
          )}
          {sleepBlock?.got_up_at && (
            <div>
              <span className="font-medium">Got up:</span>{' '}
              {new Date(sleepBlock.got_up_at).toLocaleTimeString()}
            </div>
          )}
          {sleepBlock?.quality && (
            <div>
              <span className="font-medium">Quality:</span> {sleepBlock.quality}
            </div>
          )}
          {sleepBlock?.feeling_on_waking && (
            <div>
              <span className="font-medium">Feeling on waking:</span> {sleepBlock.feeling_on_waking}
            </div>
          )}
          {sleepBlock?.details && (
            <div className="mt-2 pt-2 border-t">
              <span className="font-medium">Details:</span>
              <p className="text-gray-700 mt-1">{sleepBlock.details}</p>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function EarlyMorningSection({ data, editable }: { data: DailyEntryBundle; editable?: boolean }) {
  const earlyMorning = data.earlyMorning;

  // Helper to extract time from ISO string
  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(11, 16); // HH:MM
  };

  const [formData, setFormData] = useState({
    hygiene_routine: earlyMorning?.hygiene_routine || '',
    first_drink: earlyMorning?.first_drink || '',
    first_drink_time: toTime(earlyMorning?.first_drink_time),
  });

  const handleSave = useCallback(async () => {
    try {
      // Combine today's date with the time for first_drink_time
      const first_drink_timestamp = formData.first_drink_time
        ? new Date(`${data.dailyEntry.date}T${formData.first_drink_time}`).toISOString()
        : undefined;

      await upsertEarlyMorning({
        id: earlyMorning?.id,
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        hygiene_routine: formData.hygiene_routine || undefined,
        first_drink: formData.first_drink || undefined,
        first_drink_time: first_drink_timestamp,
      });
    } catch (error) {
      console.error('Failed to save early morning data:', error);
    }
  }, [formData, earlyMorning?.id, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date]);

  if (!editable && !earlyMorning) {
    return <Section title="Early Morning"><NoData message="No early morning data" /></Section>;
  }

  return (
    <Section title="Early Morning">
      {editable ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Hygiene routine</label>
            <input
              type="text"
              value={formData.hygiene_routine}
              onChange={(e) => setFormData({ ...formData, hygiene_routine: e.target.value })}
              onBlur={handleSave}
              placeholder="e.g., Shower, skincare"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First drink</label>
            <input
              type="text"
              value={formData.first_drink}
              onChange={(e) => setFormData({ ...formData, first_drink: e.target.value })}
              onBlur={handleSave}
              placeholder="e.g., Warm lemon water"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">First drink time</label>
            <input
              type="time"
              value={formData.first_drink_time}
              onChange={(e) => setFormData({ ...formData, first_drink_time: e.target.value })}
              onBlur={handleSave}
              className="w-32 px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {earlyMorning?.hygiene_routine && (
            <div>
              <span className="font-medium">Hygiene routine:</span> {earlyMorning.hygiene_routine}
            </div>
          )}
          {earlyMorning?.first_drink && (
            <div>
              <span className="font-medium">First drink:</span> {earlyMorning.first_drink}
              {earlyMorning.first_drink_time && (
                <span className="text-gray-600">
                  {' '}at {new Date(earlyMorning.first_drink_time).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function FoodFluidSection({ data, editable }: { data: DailyEntryBundle; editable?: boolean }) {
  const foodEvents = data.foodEvents;
  const fluidTotals = data.fluidTotals;

  // Helper to extract time from ISO string
  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().slice(11, 16); // HH:MM
  };

  const [fluidData, setFluidData] = useState({
    total_water_oz: fluidTotals?.total_water_oz?.toString() || '',
    total_caffeine_oz: fluidTotals?.total_caffeine_oz?.toString() || '',
    total_other_oz: fluidTotals?.total_other_oz?.toString() || '',
  });

  const [newFood, setNewFood] = useState({
    meal_type: 'breakfast' as const,
    time: '',
    description: '',
  });

  const handleSaveFluids = useCallback(async () => {
    try {
      await upsertFluidTotals({
        id: fluidTotals?.id,
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        total_water_oz: fluidData.total_water_oz ? parseFloat(fluidData.total_water_oz) : undefined,
        total_caffeine_oz: fluidData.total_caffeine_oz ? parseFloat(fluidData.total_caffeine_oz) : undefined,
        total_other_oz: fluidData.total_other_oz ? parseFloat(fluidData.total_other_oz) : undefined,
      });
    } catch (error) {
      console.error('Failed to save fluid totals:', error);
    }
  }, [fluidData, fluidTotals?.id, data.dailyEntry.id, data.dailyEntry.patient_id]);

  const handleAddFood = useCallback(async () => {
    if (!newFood.description) return;

    try {
      const timestamp = newFood.time
        ? new Date(`${data.dailyEntry.date}T${newFood.time}`).toISOString()
        : undefined;

      await addFoodEvent({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        meal_type: newFood.meal_type,
        time: timestamp,
        description: newFood.description,
      });

      // Reset form
      setNewFood({ meal_type: 'breakfast', time: '', description: '' });

      // Reload page to show new event
      window.location.reload();
    } catch (error) {
      console.error('Failed to add food event:', error);
    }
  }, [newFood, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date]);

  const handleDeleteFood = useCallback(async (id: string) => {
    try {
      await deleteFoodEvent(id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete food event:', error);
    }
  }, []);

  return (
    <Section title="Food & Fluids">
      {editable ? (
        <div className="space-y-4">
          {/* Food Events */}
          <div>
            <h4 className="font-medium text-sm mb-2">Meals & Snacks:</h4>
            {foodEvents.length > 0 && (
              <div className="space-y-2 mb-3">
                {foodEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-start text-sm pl-3 border-l-2 border-blue-200 py-1">
                    <div>
                      <div className="font-medium capitalize">{event.meal_type || 'Meal'}</div>
                      {event.time && (
                        <div className="text-gray-600 text-xs">
                          {new Date(event.time).toLocaleTimeString()}
                        </div>
                      )}
                      {event.description && (
                        <div className="text-gray-700">{event.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteFood(event.id)}
                      className="text-red-600 hover:text-red-800 text-xs ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new food event */}
            <div className="border rounded p-3 bg-gray-50 space-y-2">
              <div className="flex gap-2">
                <select
                  value={newFood.meal_type}
                  onChange={(e) => setNewFood({ ...newFood, meal_type: e.target.value as any })}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="time"
                  value={newFood.time}
                  onChange={(e) => setNewFood({ ...newFood, time: e.target.value })}
                  className="w-32 px-2 py-1 border rounded text-sm"
                />
              </div>
              <input
                type="text"
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                placeholder="What did you eat?"
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={handleAddFood}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + Add Food
              </button>
            </div>
          </div>

          {/* Fluid Totals */}
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">Fluid Totals (oz):</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Water</label>
                <input
                  type="number"
                  value={fluidData.total_water_oz}
                  onChange={(e) => setFluidData({ ...fluidData, total_water_oz: e.target.value })}
                  onBlur={handleSaveFluids}
                  placeholder="0"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Caffeine</label>
                <input
                  type="number"
                  value={fluidData.total_caffeine_oz}
                  onChange={(e) => setFluidData({ ...fluidData, total_caffeine_oz: e.target.value })}
                  onBlur={handleSaveFluids}
                  placeholder="0"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Other</label>
                <input
                  type="number"
                  value={fluidData.total_other_oz}
                  onChange={(e) => setFluidData({ ...fluidData, total_other_oz: e.target.value })}
                  onBlur={handleSaveFluids}
                  placeholder="0"
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Food Events */}
          {foodEvents.length > 0 ? (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Meals & Snacks:</h4>
              <div className="space-y-2">
                {foodEvents.map((event) => (
                  <div key={event.id} className="text-sm pl-3 border-l-2 border-blue-200">
                    <div className="font-medium capitalize">{event.meal_type || 'Meal'}</div>
                    {event.time && (
                      <div className="text-gray-600 text-xs">
                        {new Date(event.time).toLocaleTimeString()}
                      </div>
                    )}
                    {event.description && (
                      <div className="text-gray-700">{event.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <NoData message="No food logged" />
          )}

          {/* Fluid Totals */}
          {fluidTotals && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Fluid Totals:</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {fluidTotals.total_water_oz !== null && (
                  <div>
                    <span className="text-gray-600">Water:</span>
                    <span className="font-medium ml-1">{fluidTotals.total_water_oz} oz</span>
                  </div>
                )}
                {fluidTotals.total_caffeine_oz !== null && (
                  <div>
                    <span className="text-gray-600">Caffeine:</span>
                    <span className="font-medium ml-1">{fluidTotals.total_caffeine_oz} oz</span>
                  </div>
                )}
                {fluidTotals.total_other_oz !== null && (
                  <div>
                    <span className="text-gray-600">Other:</span>
                    <span className="font-medium ml-1">{fluidTotals.total_other_oz} oz</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
}

export function BowelSection({ data }: { data: DailyEntryBundle }) {
  const movements = data.bowelMovements;

  if (movements.length === 0) {
    return <Section title="Bowel Movements"><NoData message="No bowel movements logged" /></Section>;
  }

  return (
    <Section title="Bowel Movements">
      <div className="space-y-2">
        {movements.map((movement) => (
          <div key={movement.id} className="text-sm pl-3 border-l-2 border-green-200">
            {movement.time && (
              <div className="text-gray-600 text-xs">
                {new Date(movement.time).toLocaleTimeString()}
              </div>
            )}
            {movement.details && (
              <div className="text-gray-700">{movement.details}</div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ExerciseSection({ data }: { data: DailyEntryBundle }) {
  const exercises = data.exerciseEvents;

  if (exercises.length === 0) {
    return <Section title="Exercise / Movement"><NoData message="No exercise logged" /></Section>;
  }

  return (
    <Section title="Exercise / Movement">
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="text-sm pl-3 border-l-2 border-purple-200">
            <div className="font-medium">{exercise.exercise_type || 'Exercise'}</div>
            {exercise.start_time && (
              <div className="text-gray-600 text-xs">
                {new Date(exercise.start_time).toLocaleTimeString()}
                {exercise.duration_minutes && <span> • {exercise.duration_minutes} min</span>}
              </div>
            )}
            {(exercise.felt_physical || exercise.felt_mental || exercise.felt_emotional) && (
              <div className="mt-1 text-xs text-gray-600">
                {exercise.felt_physical && <span>Physical: {exercise.felt_physical}/10 </span>}
                {exercise.felt_mental && <span>Mental: {exercise.felt_mental}/10 </span>}
                {exercise.felt_emotional && <span>Emotional: {exercise.felt_emotional}/10</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function EnergySection({ data }: { data: DailyEntryBundle }) {
  const entry = data.dailyEntry;

  return (
    <Section title="Energy & Mood">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {entry.energy_physical !== null && (
          <div>
            <span className="text-gray-600">Physical:</span>
            <span className="font-medium ml-2">{entry.energy_physical}/10</span>
          </div>
        )}
        {entry.energy_mental !== null && (
          <div>
            <span className="text-gray-600">Mental:</span>
            <span className="font-medium ml-2">{entry.energy_mental}/10</span>
          </div>
        )}
        {entry.energy_emotional !== null && (
          <div>
            <span className="text-gray-600">Emotional:</span>
            <span className="font-medium ml-2">{entry.energy_emotional}/10</span>
          </div>
        )}
        {entry.energy_drive !== null && (
          <div>
            <span className="text-gray-600">Drive:</span>
            <span className="font-medium ml-2">{entry.energy_drive}/10</span>
          </div>
        )}
        {entry.overall_mood !== null && (
          <div className="col-span-2">
            <span className="text-gray-600">Overall Mood:</span>
            <span className="font-medium ml-2">{entry.overall_mood}/10</span>
          </div>
        )}
      </div>
      {entry.reflection && (
        <div className="mt-3 pt-3 border-t">
          <span className="font-medium text-sm">Reflection:</span>
          <p className="text-gray-700 text-sm mt-1">{entry.reflection}</p>
        </div>
      )}
    </Section>
  );
}

export function VitalsSection({ data }: { data: DailyEntryBundle }) {
  const vitals = data.vitalReadings;

  if (vitals.length === 0) {
    return <Section title="Vitals"><NoData message="No vitals logged" /></Section>;
  }

  return (
    <Section title="Vitals">
      <div className="space-y-2">
        {vitals.map((vital) => (
          <div key={vital.id} className="text-sm flex justify-between">
            <span className="font-medium capitalize">
              {vital.type.replace(/_/g, ' ')}:
            </span>
            <span>
              {vital.value}
              {vital.aux_value && `/${vital.aux_value}`}
              {vital.unit && ` ${vital.unit}`}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function MedicationsSection({ data }: { data: DailyEntryBundle }) {
  const meds = data.medicationIntakes;

  if (meds.length === 0) {
    return <Section title="Medications (Non-Plan)"><NoData message="No medications logged" /></Section>;
  }

  return (
    <Section title="Medications (Non-Plan)">
      <div className="space-y-2">
        {meds.map((med) => (
          <div key={med.id} className="text-sm pl-3 border-l-2 border-red-200">
            <div className="font-medium">{med.name || 'Medication'}</div>
            {med.dose && <div className="text-gray-600">Dose: {med.dose}</div>}
            {med.time && (
              <div className="text-gray-600 text-xs">
                {new Date(med.time).toLocaleTimeString()}
              </div>
            )}
            {med.notes && <div className="text-gray-700 text-xs mt-1">{med.notes}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

export function SymptomsSection({ data }: { data: DailyEntryBundle }) {
  const symptoms = data.symptomLogs;

  if (symptoms.length === 0) {
    return <Section title="Symptoms"><NoData message="No symptoms logged" /></Section>;
  }

  return (
    <Section title="Symptoms">
      <div className="space-y-2">
        {symptoms.map((symptom) => (
          <div key={symptom.id} className="text-sm pl-3 border-l-2 border-yellow-200">
            <div className="flex justify-between">
              <span className="font-medium">{symptom.label || 'Symptom'}</span>
              {symptom.severity !== null && (
                <span className="text-gray-600">Severity: {symptom.severity}/10</span>
              )}
            </div>
            {symptom.time && (
              <div className="text-gray-600 text-xs">
                {new Date(symptom.time).toLocaleTimeString()}
              </div>
            )}
            {symptom.notes && <div className="text-gray-700 text-xs mt-1">{symptom.notes}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============================================================================
// CYCLE TRACKING SECTION
// ============================================================================

export function CycleSection({ data }: { data: DailyEntryBundle }) {
  const cycleLog = data.cycleLog;
  const comments = data.cycleComments;

  if (!cycleLog) {
    return <Section title="Cycle Tracking"><NoData message="No cycle data logged" /></Section>;
  }

  return (
    <Section title="Cycle Tracking">
      <div className="space-y-4">
        {/* Cycle Day */}
        {cycleLog.cycle_day && (
          <div className="text-sm">
            <span className="font-medium">Cycle Day:</span> {cycleLog.cycle_day}
          </div>
        )}

        {/* Physical Symptoms */}
        {cycleLog.physical_symptom_keys && cycleLog.physical_symptom_keys.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Physical Symptoms:</h4>
            <div className="flex flex-wrap gap-2">
              {cycleLog.physical_symptom_keys.map((key) => (
                <span key={key} className="px-2 py-1 bg-blue-100 rounded text-xs">
                  {key.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Symptoms */}
        {cycleLog.emotional_symptom_keys && cycleLog.emotional_symptom_keys.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Emotional Symptoms:</h4>
            <div className="flex flex-wrap gap-2">
              {cycleLog.emotional_symptom_keys.map((key) => (
                <span key={key} className="px-2 py-1 bg-purple-100 rounded text-xs">
                  {key.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bleeding Info */}
        {(cycleLog.bleeding_quantity || cycleLog.blood_color) && (
          <div className="text-sm space-y-1">
            <h4 className="font-medium">Bleeding:</h4>
            {cycleLog.bleeding_quantity && (
              <div><span className="text-gray-600">Quantity:</span> {cycleLog.bleeding_quantity}</div>
            )}
            {cycleLog.blood_color && (
              <div><span className="text-gray-600">Color:</span> {cycleLog.blood_color}</div>
            )}
            {cycleLog.clots && <div className="text-gray-600">Clots present</div>}
            {cycleLog.mucus && <div className="text-gray-600">Mucus present</div>}
          </div>
        )}

        {/* Comments */}
        {comments.length > 0 && (
          <div className="pt-3 border-t">
            <h4 className="font-medium text-sm mb-2">Comments:</h4>
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded">
                  <div className="font-medium text-xs text-gray-600">
                    {comment.author_type === 'patient' ? 'You' : 'Clinician'}
                  </div>
                  <div className="text-gray-700">{comment.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ============================================================================
// FORMULATIONS & TREATMENTS SECTION
// ============================================================================

export function RegimenSection({ data }: { data: DailyEntryBundle }) {
  const formulations = data.regimenFormulations;
  const formulationIntakes = data.formulationIntakes;
  const treatments = data.regimenTreatments;
  const treatmentCompletions = data.treatmentCompletions;
  const regimenNotes = data.regimenNotes;

  return (
    <Section title="Formulations & Treatments">
      {/* Formulations */}
      {formulations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Formulations:</h4>
          <div className="space-y-3">
            {formulations.map((formulation) => {
              const intake = formulationIntakes.find(
                (i) => i.regimen_formulation_id === formulation.id
              );
              return (
                <div key={formulation.id} className="border-l-2 border-teal-300 pl-3">
                  <div className="font-medium text-sm">{formulation.name}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {formulation.when_label && <div>When: {formulation.when_label}</div>}
                    {formulation.dose && <div>Dose: {formulation.dose}</div>}
                    {formulation.with_text && <div>With: {formulation.with_text}</div>}
                  </div>
                  {intake && (
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        intake.status === 'taken' ? 'bg-green-100 text-green-800' :
                        intake.status === 'skipped' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {intake.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Treatments */}
      {treatments.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">Treatments:</h4>
          <div className="space-y-3">
            {treatments.map((treatment) => {
              const completion = treatmentCompletions.find(
                (c) => c.regimen_treatment_id === treatment.id
              );
              return (
                <div key={treatment.id} className="border-l-2 border-indigo-300 pl-3">
                  <div className="font-medium text-sm">{treatment.name}</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {treatment.when_label && <div>When: {treatment.when_label}</div>}
                    {treatment.body_region && <div>Region: {treatment.body_region}</div>}
                  </div>
                  {completion && (
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        completion.status === 'completed' ? 'bg-green-100 text-green-800' :
                        completion.status === 'skipped' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {completion.status}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {regimenNotes && (
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Notes:</h4>
          {regimenNotes.note && (
            <div className="text-sm mb-2">
              <span className="font-medium text-gray-600">Your note:</span>
              <p className="text-gray-700 mt-1">{regimenNotes.note}</p>
            </div>
          )}
          {regimenNotes.reply && (
            <div className="text-sm bg-blue-50 p-2 rounded">
              <span className="font-medium text-gray-600">
                Reply from {regimenNotes.reply_from}:
              </span>
              <p className="text-gray-700 mt-1">{regimenNotes.reply}</p>
            </div>
          )}
        </div>
      )}

      {formulations.length === 0 && treatments.length === 0 && (
        <NoData message="No formulations or treatments configured" />
      )}
    </Section>
  );
}
