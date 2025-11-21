// Daily Entry Section Components
import { useState, useCallback, useEffect } from 'react';
import type { DailyEntryBundle } from '../../types/db';
import {
  upsertSleepBlock,
  upsertEarlyMorning,
  addFoodEvent,
  deleteFoodEvent,
  upsertFluidTotals,
  addBowelMovement,
  deleteBowelMovement,
  updateDailyEntry,
  addExerciseEvent,
  deleteExerciseEvent,
  addVitalReading,
  deleteVitalReading,
  addMedicationIntake,
  deleteMedicationIntake,
  addSymptomLog,
  deleteSymptomLog,
  upsertCycleLog,
  getOrCreateCycleLog,
  getCycleSavedSymptoms,
  addCycleSymptom,
  addCycleComment,
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

  // Helper to extract date from ISO string (in local timezone)
  const toDate = (isoString: string | undefined) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to extract time from ISO string (in local timezone)
  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

  // Helper to extract time from ISO string (in local timezone)
  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

export function FoodFluidSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const foodEvents = data.foodEvents;
  const fluidTotals = data.fluidTotals;

  // Helper to extract time from ISO string (in local timezone)
  const toTime = (isoString: string | undefined) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

  // Helper to safely parse number, returns undefined for invalid input
  const parseNumber = (value: string): number | undefined => {
    if (!value || value.trim() === '') return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  };

  const handleSaveFluids = useCallback(async () => {
    try {
      await upsertFluidTotals({
        id: fluidTotals?.id,
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        total_water_oz: parseNumber(fluidData.total_water_oz),
        total_caffeine_oz: parseNumber(fluidData.total_caffeine_oz),
        total_other_oz: parseNumber(fluidData.total_other_oz),
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

      // Refresh data without losing unsaved changes
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add food event:', error);
    }
  }, [newFood, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date, onRefresh]);

  const handleDeleteFood = useCallback(async (id: string) => {
    try {
      await deleteFoodEvent(id);
      // Refresh data without losing unsaved changes
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete food event:', error);
    }
  }, [onRefresh]);

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

export function BowelSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const movements = data.bowelMovements;

  const [newMovement, setNewMovement] = useState({
    time: '',
    details: '',
  });

  const handleAddMovement = useCallback(async () => {
    if (!newMovement.details) return;

    try {
      const timestamp = newMovement.time
        ? new Date(`${data.dailyEntry.date}T${newMovement.time}`).toISOString()
        : undefined;

      await addBowelMovement({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        time: timestamp,
        details: newMovement.details,
      });

      setNewMovement({ time: '', details: '' });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add bowel movement:', error);
    }
  }, [newMovement, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date, onRefresh]);

  const handleDeleteMovement = useCallback(async (id: string) => {
    try {
      await deleteBowelMovement(id);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete bowel movement:', error);
    }
  }, [onRefresh]);

  return (
    <Section title="Bowel Movements">
      {editable ? (
        <div className="space-y-3">
          {movements.length > 0 && (
            <div className="space-y-2 mb-3">
              {movements.map((movement) => (
                <div key={movement.id} className="flex justify-between items-start text-sm pl-3 border-l-2 border-green-200 py-1">
                  <div>
                    {movement.time && (
                      <div className="text-gray-600 text-xs">
                        {new Date(movement.time).toLocaleTimeString()}
                      </div>
                    )}
                    {movement.details && (
                      <div className="text-gray-700">{movement.details}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteMovement(movement.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <input
              type="time"
              value={newMovement.time}
              onChange={(e) => setNewMovement({ ...newMovement, time: e.target.value })}
              className="w-32 px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              value={newMovement.details}
              onChange={(e) => setNewMovement({ ...newMovement, details: e.target.value })}
              placeholder="Details (e.g., Normal consistency)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleAddMovement}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              + Add
            </button>
          </div>
        </div>
      ) : (
        <>
          {movements.length === 0 ? (
            <NoData message="No bowel movements logged" />
          ) : (
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
          )}
        </>
      )}
    </Section>
  );
}

export function ExerciseSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const exercises = data.exerciseEvents;

  const [newExercise, setNewExercise] = useState({
    exercise_type: '',
    start_time: '',
    duration_minutes: '',
    felt_physical: '',
    felt_mental: '',
    felt_emotional: '',
  });

  const handleAddExercise = useCallback(async () => {
    if (!newExercise.exercise_type) return;

    try {
      const timestamp = newExercise.start_time
        ? new Date(`${data.dailyEntry.date}T${newExercise.start_time}`).toISOString()
        : undefined;

      await addExerciseEvent({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        exercise_type: newExercise.exercise_type,
        start_time: timestamp,
        duration_minutes: newExercise.duration_minutes ? parseInt(newExercise.duration_minutes) : undefined,
        felt_physical: newExercise.felt_physical ? parseInt(newExercise.felt_physical) : undefined,
        felt_mental: newExercise.felt_mental ? parseInt(newExercise.felt_mental) : undefined,
        felt_emotional: newExercise.felt_emotional ? parseInt(newExercise.felt_emotional) : undefined,
      });

      setNewExercise({
        exercise_type: '',
        start_time: '',
        duration_minutes: '',
        felt_physical: '',
        felt_mental: '',
        felt_emotional: '',
      });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  }, [newExercise, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date, onRefresh]);

  const handleDeleteExercise = useCallback(async (id: string) => {
    try {
      await deleteExerciseEvent(id);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    }
  }, [onRefresh]);

  return (
    <Section title="Exercise / Movement">
      {editable ? (
        <div className="space-y-3">
          {exercises.length > 0 && (
            <div className="space-y-2 mb-3">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="flex justify-between items-start text-sm pl-3 border-l-2 border-purple-200 py-1">
                  <div>
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
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <input
              type="text"
              value={newExercise.exercise_type}
              onChange={(e) => setNewExercise({ ...newExercise, exercise_type: e.target.value })}
              placeholder="Exercise type (e.g., Walking, Yoga)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={newExercise.start_time}
                onChange={(e) => setNewExercise({ ...newExercise, start_time: e.target.value })}
                placeholder="Start time"
                className="w-32 px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                value={newExercise.duration_minutes}
                onChange={(e) => setNewExercise({ ...newExercise, duration_minutes: e.target.value })}
                placeholder="Duration (min)"
                className="w-32 px-2 py-1 border rounded text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="0"
                max="10"
                value={newExercise.felt_physical}
                onChange={(e) => setNewExercise({ ...newExercise, felt_physical: e.target.value })}
                placeholder="Physical (0-10)"
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                min="0"
                max="10"
                value={newExercise.felt_mental}
                onChange={(e) => setNewExercise({ ...newExercise, felt_mental: e.target.value })}
                placeholder="Mental (0-10)"
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                min="0"
                max="10"
                value={newExercise.felt_emotional}
                onChange={(e) => setNewExercise({ ...newExercise, felt_emotional: e.target.value })}
                placeholder="Emotional (0-10)"
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <button
              onClick={handleAddExercise}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
            >
              + Add Exercise
            </button>
          </div>
        </div>
      ) : (
        <>
          {exercises.length === 0 ? (
            <NoData message="No exercise logged" />
          ) : (
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
          )}
        </>
      )}
    </Section>
  );
}

export function EnergySection({ data, editable }: { data: DailyEntryBundle; editable?: boolean }) {
  const entry = data.dailyEntry;

  const [formData, setFormData] = useState({
    energy_physical: entry.energy_physical ?? 5,
    energy_mental: entry.energy_mental ?? 5,
    energy_emotional: entry.energy_emotional ?? 5,
    energy_drive: entry.energy_drive ?? 5,
    overall_mood: entry.overall_mood ?? 5,
    reflection: entry.reflection || '',
  });

  const handleSave = useCallback(async () => {
    try {
      await updateDailyEntry({
        id: entry.id,
        energy_physical: formData.energy_physical,
        energy_mental: formData.energy_mental,
        energy_emotional: formData.energy_emotional,
        energy_drive: formData.energy_drive,
        overall_mood: formData.overall_mood,
        reflection: formData.reflection || undefined,
      });
    } catch (error) {
      console.error('Failed to save energy data:', error);
    }
  }, [formData, entry.id]);

  return (
    <Section title="Energy & Mood">
      {editable ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Physical Energy: {formData.energy_physical}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.energy_physical}
              onChange={(e) => setFormData({ ...formData, energy_physical: parseInt(e.target.value) })}
              onMouseUp={handleSave}
              onTouchEnd={handleSave}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mental Energy: {formData.energy_mental}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.energy_mental}
              onChange={(e) => setFormData({ ...formData, energy_mental: parseInt(e.target.value) })}
              onMouseUp={handleSave}
              onTouchEnd={handleSave}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Emotional Energy: {formData.energy_emotional}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.energy_emotional}
              onChange={(e) => setFormData({ ...formData, energy_emotional: parseInt(e.target.value) })}
              onMouseUp={handleSave}
              onTouchEnd={handleSave}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Drive: {formData.energy_drive}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.energy_drive}
              onChange={(e) => setFormData({ ...formData, energy_drive: parseInt(e.target.value) })}
              onMouseUp={handleSave}
              onTouchEnd={handleSave}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Overall Mood: {formData.overall_mood}/10
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.overall_mood}
              onChange={(e) => setFormData({ ...formData, overall_mood: parseInt(e.target.value) })}
              onMouseUp={handleSave}
              onTouchEnd={handleSave}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reflection (optional)</label>
            <textarea
              value={formData.reflection}
              onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
              onBlur={handleSave}
              placeholder="How are you feeling today? Any thoughts or observations..."
              rows={4}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </Section>
  );
}

export function VitalsSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const vitals = data.vitalReadings;

  const [newVital, setNewVital] = useState<{
    type: 'blood_pressure' | 'blood_glucose' | 'early_am_temp' | 'pm_temp' | 'weight';
    value: string;
    aux_value: string;
    unit: string;
  }>({
    type: 'blood_pressure',
    value: '',
    aux_value: '',
    unit: '',
  });

  const handleAddVital = useCallback(async () => {
    if (!newVital.value) return;

    try {
      await addVitalReading({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        type: newVital.type,
        value: parseFloat(newVital.value),
        aux_value: newVital.aux_value ? parseFloat(newVital.aux_value) : undefined,
        unit: newVital.unit || undefined,
      });

      setNewVital({ type: 'blood_pressure', value: '', aux_value: '', unit: '' });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add vital:', error);
    }
  }, [newVital, data.dailyEntry.id, data.dailyEntry.patient_id, onRefresh]);

  const handleDeleteVital = useCallback(async (id: string) => {
    try {
      await deleteVitalReading(id);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete vital:', error);
    }
  }, [onRefresh]);

  return (
    <Section title="Vitals">
      {editable ? (
        <div className="space-y-3">
          {vitals.length > 0 && (
            <div className="space-y-2 mb-3">
              {vitals.map((vital) => (
                <div key={vital.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium capitalize">
                      {vital.type.replace(/_/g, ' ')}:
                    </span>
                    <span className="ml-2">
                      {vital.value}
                      {vital.aux_value && `/${vital.aux_value}`}
                      {vital.unit && ` ${vital.unit}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteVital(vital.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <select
              value={newVital.type}
              onChange={(e) => setNewVital({ ...newVital, type: e.target.value as any })}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="blood_pressure">Blood Pressure</option>
              <option value="blood_glucose">Blood Glucose</option>
              <option value="early_am_temp">Early AM Temperature</option>
              <option value="pm_temp">PM Temperature</option>
              <option value="weight">Weight</option>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                value={newVital.value}
                onChange={(e) => setNewVital({ ...newVital, value: e.target.value })}
                placeholder="Value"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              {newVital.type === 'blood_pressure' && (
                <input
                  type="number"
                  value={newVital.aux_value}
                  onChange={(e) => setNewVital({ ...newVital, aux_value: e.target.value })}
                  placeholder="Diastolic"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              )}
              <input
                type="text"
                value={newVital.unit}
                onChange={(e) => setNewVital({ ...newVital, unit: e.target.value })}
                placeholder="Unit (e.g., mmHg, bpm)"
                className="w-32 px-2 py-1 border rounded text-sm"
              />
            </div>
            <button
              onClick={handleAddVital}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              + Add Vital
            </button>
          </div>
        </div>
      ) : (
        <>
          {vitals.length === 0 ? (
            <NoData message="No vitals logged" />
          ) : (
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
          )}
        </>
      )}
    </Section>
  );
}

export function MedicationsSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const meds = data.medicationIntakes;

  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    time: '',
    notes: '',
  });

  const handleAddMed = useCallback(async () => {
    if (!newMed.name) return;

    try {
      const timestamp = newMed.time
        ? new Date(`${data.dailyEntry.date}T${newMed.time}`).toISOString()
        : undefined;

      await addMedicationIntake({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        name: newMed.name,
        dose: newMed.dose || undefined,
        time: timestamp,
        notes: newMed.notes || undefined,
      });

      setNewMed({ name: '', dose: '', time: '', notes: '' });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add medication:', error);
    }
  }, [newMed, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date, onRefresh]);

  const handleDeleteMed = useCallback(async (id: string) => {
    try {
      await deleteMedicationIntake(id);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete medication:', error);
    }
  }, [onRefresh]);

  return (
    <Section title="Medications (Non-Plan)">
      {editable ? (
        <div className="space-y-3">
          {meds.length > 0 && (
            <div className="space-y-2 mb-3">
              {meds.map((med) => (
                <div key={med.id} className="flex justify-between items-start text-sm pl-3 border-l-2 border-red-200 py-1">
                  <div>
                    <div className="font-medium">{med.name || 'Medication'}</div>
                    {med.dose && <div className="text-gray-600 text-xs">Dose: {med.dose}</div>}
                    {med.time && (
                      <div className="text-gray-600 text-xs">
                        {new Date(med.time).toLocaleTimeString()}
                      </div>
                    )}
                    {med.notes && <div className="text-gray-700 text-xs mt-1">{med.notes}</div>}
                  </div>
                  <button
                    onClick={() => handleDeleteMed(med.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <input
              type="text"
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="Medication name"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newMed.dose}
                onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                placeholder="Dose (e.g., 10mg)"
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <input
                type="time"
                value={newMed.time}
                onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                className="w-32 px-2 py-1 border rounded text-sm"
              />
            </div>
            <input
              type="text"
              value={newMed.notes}
              onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleAddMed}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              + Add Medication
            </button>
          </div>
        </div>
      ) : (
        <>
          {meds.length === 0 ? (
            <NoData message="No medications logged" />
          ) : (
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
          )}
        </>
      )}
    </Section>
  );
}

export function SymptomsSection({
  data,
  editable,
  onRefresh
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void | Promise<void>;
}) {
  const symptoms = data.symptomLogs;

  const [newSymptom, setNewSymptom] = useState({
    label: '',
    severity: '',
    time: '',
    notes: '',
  });

  const handleAddSymptom = useCallback(async () => {
    if (!newSymptom.label) return;

    try {
      const timestamp = newSymptom.time
        ? new Date(`${data.dailyEntry.date}T${newSymptom.time}`).toISOString()
        : undefined;

      await addSymptomLog({
        daily_entry_id: data.dailyEntry.id,
        patient_id: data.dailyEntry.patient_id,
        label: newSymptom.label,
        severity: newSymptom.severity ? parseInt(newSymptom.severity) : undefined,
        time: timestamp,
        notes: newSymptom.notes || undefined,
      });

      setNewSymptom({ label: '', severity: '', time: '', notes: '' });
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to add symptom:', error);
    }
  }, [newSymptom, data.dailyEntry.id, data.dailyEntry.patient_id, data.dailyEntry.date, onRefresh]);

  const handleDeleteSymptom = useCallback(async (id: string) => {
    try {
      await deleteSymptomLog(id);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error('Failed to delete symptom:', error);
    }
  }, [onRefresh]);

  return (
    <Section title="Symptoms">
      {editable ? (
        <div className="space-y-3">
          {symptoms.length > 0 && (
            <div className="space-y-2 mb-3">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex justify-between items-start text-sm pl-3 border-l-2 border-yellow-200 py-1">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{symptom.label || 'Symptom'}</span>
                      {symptom.severity !== null && (
                        <span className="text-gray-600 text-xs">Severity: {symptom.severity}/10</span>
                      )}
                    </div>
                    {symptom.time && (
                      <div className="text-gray-600 text-xs">
                        {new Date(symptom.time).toLocaleTimeString()}
                      </div>
                    )}
                    {symptom.notes && <div className="text-gray-700 text-xs mt-1">{symptom.notes}</div>}
                  </div>
                  <button
                    onClick={() => handleDeleteSymptom(symptom.id)}
                    className="text-red-600 hover:text-red-800 text-xs ml-2"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <input
              type="text"
              value={newSymptom.label}
              onChange={(e) => setNewSymptom({ ...newSymptom, label: e.target.value })}
              placeholder="Symptom name (e.g., Headache, Nausea)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="10"
                value={newSymptom.severity}
                onChange={(e) => setNewSymptom({ ...newSymptom, severity: e.target.value })}
                placeholder="Severity (0-10)"
                className="w-32 px-2 py-1 border rounded text-sm"
              />
              <input
                type="time"
                value={newSymptom.time}
                onChange={(e) => setNewSymptom({ ...newSymptom, time: e.target.value })}
                className="w-32 px-2 py-1 border rounded text-sm"
              />
            </div>
            <input
              type="text"
              value={newSymptom.notes}
              onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
              placeholder="Notes (optional)"
              className="w-full px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={handleAddSymptom}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
            >
              + Add Symptom
            </button>
          </div>
        </div>
      ) : (
        <>
          {symptoms.length === 0 ? (
            <NoData message="No symptoms logged" />
          ) : (
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
          )}
        </>
      )}
    </Section>
  );
}

// ============================================================================
// CYCLE TRACKING SECTION
// ============================================================================

export function CycleSection({
  data,
  editable,
  onRefresh,
}: {
  data: DailyEntryBundle;
  editable?: boolean;
  onRefresh?: () => void;
}) {
  const cycleLog = data.cycleLog;
  const comments = data.cycleComments;

  // Helper to generate key from label
  const generateKey = (label: string) => {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  // Saved symptoms state
  const [savedPhysicalSymptoms, setSavedPhysicalSymptoms] = useState<any[]>([]);
  const [savedEmotionalSymptoms, setSavedEmotionalSymptoms] = useState<any[]>([]);

  // Form data state
  const [formData, setFormData] = useState({
    cycle_day: cycleLog?.cycle_day || '',
    physical_symptom_keys: cycleLog?.physical_symptom_keys || [],
    emotional_symptom_keys: cycleLog?.emotional_symptom_keys || [],
    bleeding_quantity: cycleLog?.bleeding_quantity || '',
    blood_color: cycleLog?.blood_color || '',
    blood_volume: cycleLog?.blood_volume || '',
    clots: cycleLog?.clots || false,
    mucus: cycleLog?.mucus || false,
  });

  // New symptom inputs
  const [newPhysicalSymptom, setNewPhysicalSymptom] = useState('');
  const [newEmotionalSymptom, setNewEmotionalSymptom] = useState('');

  // Load saved symptoms on mount
  useEffect(() => {
    if (editable) {
      const loadSymptoms = async () => {
        try {
          const physical = await getCycleSavedSymptoms(data.dailyEntry.patient_id, 'cycle_physical');
          const emotional = await getCycleSavedSymptoms(data.dailyEntry.patient_id, 'cycle_emotional');
          setSavedPhysicalSymptoms(physical);
          setSavedEmotionalSymptoms(emotional);
        } catch (error) {
          console.error('Failed to load saved symptoms:', error);
        }
      };
      loadSymptoms();
    }
  }, [editable, data.dailyEntry.patient_id]);

  // Autosave handler
  const handleSave = useCallback(async (updates?: Partial<typeof formData>) => {
    const dataToSave = updates || formData;
    try {
      if (!cycleLog) {
        // Create new cycle log
        const newLog = await getOrCreateCycleLog(data.dailyEntry.id, data.dailyEntry.patient_id);
        await upsertCycleLog({
          id: newLog.id,
          daily_entry_id: data.dailyEntry.id,
          patient_id: data.dailyEntry.patient_id,
          ...dataToSave,
          cycle_day: dataToSave.cycle_day ? parseInt(String(dataToSave.cycle_day)) : undefined,
          blood_volume: dataToSave.blood_volume ? String(dataToSave.blood_volume) : undefined,
        });
      } else {
        await upsertCycleLog({
          id: cycleLog.id,
          daily_entry_id: data.dailyEntry.id,
          patient_id: data.dailyEntry.patient_id,
          ...dataToSave,
          cycle_day: dataToSave.cycle_day ? parseInt(String(dataToSave.cycle_day)) : undefined,
          blood_volume: dataToSave.blood_volume ? String(dataToSave.blood_volume) : undefined,
        });
      }
      onRefresh?.();
    } catch (error) {
      console.error('Failed to save cycle log:', error);
    }
  }, [formData, cycleLog, data.dailyEntry.id, data.dailyEntry.patient_id, onRefresh]);

  // Toggle symptom checkbox
  const toggleSymptom = useCallback((key: string, category: 'physical' | 'emotional') => {
    const field = category === 'physical' ? 'physical_symptom_keys' : 'emotional_symptom_keys';
    const currentKeys = formData[field] || [];
    const newKeys = currentKeys.includes(key)
      ? currentKeys.filter((k: string) => k !== key)
      : [...currentKeys, key];

    const updated = { ...formData, [field]: newKeys };
    setFormData(updated);
    handleSave(updated);
  }, [formData, handleSave]);

  // Add new symptom
  const handleAddSymptom = useCallback(async (category: 'cycle_physical' | 'cycle_emotional') => {
    const label = category === 'cycle_physical' ? newPhysicalSymptom : newEmotionalSymptom;
    if (!label.trim()) return;

    try {
      const key = generateKey(label.trim());
      await addCycleSymptom({
        patient_id: data.dailyEntry.patient_id,
        category,
        label: label.trim(),
      });

      // Reload symptoms
      const symptoms = await getCycleSavedSymptoms(data.dailyEntry.patient_id, category);
      if (category === 'cycle_physical') {
        setSavedPhysicalSymptoms(symptoms);
        setNewPhysicalSymptom('');
      } else {
        setSavedEmotionalSymptoms(symptoms);
        setNewEmotionalSymptom('');
      }

      // Auto-select the new symptom
      toggleSymptom(key, category === 'cycle_physical' ? 'physical' : 'emotional');
    } catch (error) {
      console.error('Failed to add symptom:', error);
    }
  }, [newPhysicalSymptom, newEmotionalSymptom, data.dailyEntry.patient_id, toggleSymptom]);

  if (!editable && !cycleLog) {
    return <Section title="Cycle Tracking"><NoData message="No cycle data logged" /></Section>;
  }

  return (
    <Section title="Cycle Tracking">
      {editable ? (
        <div className="space-y-4">
          {/* Cycle Day Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Cycle Day</label>
            <input
              type="number"
              min="1"
              value={formData.cycle_day}
              onChange={(e) => setFormData({ ...formData, cycle_day: e.target.value })}
              onBlur={() => handleSave()}
              placeholder="Enter cycle day (1-40)"
              className="w-32 px-3 py-2 border rounded text-sm"
            />
          </div>

          {/* Physical Symptoms Checkboxes */}
          <div>
            <h4 className="font-medium text-sm mb-2">Physical Symptoms:</h4>
            <div className="space-y-2">
              {savedPhysicalSymptoms.map((symptom) => {
                const key = generateKey(symptom.label);
                return (
                  <label key={symptom.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.physical_symptom_keys.includes(key)}
                      onChange={() => toggleSymptom(key, 'physical')}
                      className="rounded"
                    />
                    <span>{symptom.label}</span>
                  </label>
                );
              })}
              {/* Add new physical symptom */}
              <div className="flex gap-2 mt-2 pt-2 border-t">
                <input
                  type="text"
                  value={newPhysicalSymptom}
                  onChange={(e) => setNewPhysicalSymptom(e.target.value)}
                  placeholder="Add new physical symptom"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom('cycle_physical')}
                />
                <button
                  onClick={() => handleAddSymptom('cycle_physical')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Emotional Symptoms Checkboxes */}
          <div>
            <h4 className="font-medium text-sm mb-2">Emotional Symptoms:</h4>
            <div className="space-y-2">
              {savedEmotionalSymptoms.map((symptom) => {
                const key = generateKey(symptom.label);
                return (
                  <label key={symptom.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.emotional_symptom_keys.includes(key)}
                      onChange={() => toggleSymptom(key, 'emotional')}
                      className="rounded"
                    />
                    <span>{symptom.label}</span>
                  </label>
                );
              })}
              {/* Add new emotional symptom */}
              <div className="flex gap-2 mt-2 pt-2 border-t">
                <input
                  type="text"
                  value={newEmotionalSymptom}
                  onChange={(e) => setNewEmotionalSymptom(e.target.value)}
                  placeholder="Add new emotional symptom"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymptom('cycle_emotional')}
                />
                <button
                  onClick={() => handleAddSymptom('cycle_emotional')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Bleeding Tracking */}
          <div className="pt-3 border-t">
            <h4 className="font-medium text-sm mb-3">Bleeding:</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <select
                  value={formData.bleeding_quantity}
                  onChange={(e) => setFormData({ ...formData, bleeding_quantity: e.target.value })}
                  onBlur={() => handleSave()}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="">None</option>
                  <option value="spotting">Spotting</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Color</label>
                <input
                  type="text"
                  value={formData.blood_color}
                  onChange={(e) => setFormData({ ...formData, blood_color: e.target.value })}
                  onBlur={() => handleSave()}
                  placeholder="e.g., bright red, dark brown"
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Volume (ml, optional)</label>
                <input
                  type="number"
                  value={formData.blood_volume}
                  onChange={(e) => setFormData({ ...formData, blood_volume: e.target.value })}
                  onBlur={() => handleSave()}
                  placeholder="Estimated volume"
                  className="w-32 px-3 py-2 border rounded text-sm"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.clots}
                    onChange={(e) => {
                      const updated = { ...formData, clots: e.target.checked };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="rounded"
                  />
                  <span>Clots present</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.mucus}
                    onChange={(e) => {
                      const updated = { ...formData, mucus: e.target.checked };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="rounded"
                  />
                  <span>Mucus present</span>
                </label>
              </div>
            </div>
          </div>

          {/* Comments (read-only for now) */}
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
      ) : (
        <>
          {cycleLog && (
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
          )}
        </>
      )}
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
