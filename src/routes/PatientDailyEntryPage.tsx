import { useState, useEffect, useCallback } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { getDailyEntryBundle, getPatientConfig } from '../lib/api/dailyEntry';
import type { DailyEntryBundle, PatientConfig } from '../types/db';
import {
  SleepSection,
  EarlyMorningSection,
  FoodFluidSection,
  BowelSection,
  ExerciseSection,
  EnergySection,
  VitalsSection,
  MedicationsSection,
  SymptomsSection,
  CycleSection,
  RegimenSection,
} from '../components/daily-entry/Sections';

// Dev patient ID from seed data
const DEV_PATIENT_ID = '11111111-1111-1111-1111-111111111111';

export default function PatientDailyEntryPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // Today as YYYY-MM-DD
  });
  const [bundle, setBundle] = useState<DailyEntryBundle | null>(null);
  const [patientConfig, setPatientConfig] = useState<PatientConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate if the selected date is editable
  const isEditable = patientConfig
    ? differenceInCalendarDays(new Date(), new Date(selectedDate)) <= patientConfig.edit_window_days
    : false;

  // Fetch patient config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getPatientConfig(DEV_PATIENT_ID);
        setPatientConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
        console.error('Error fetching patient config:', err);
      }
    };

    fetchConfig();
  }, []);

  // Fetch bundle function (can be called to refresh data)
  const fetchBundle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyEntryBundle(DEV_PATIENT_ID, selectedDate);
      setBundle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching bundle:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch bundle when date changes
  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  const handlePrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return null;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Date Controls */}
      <div className="mb-6 flex items-center justify-between sticky top-0 bg-gray-50 py-4 z-10">
        <div>
          <h1 className="text-3xl font-bold">Daily Entry</h1>
          {patientConfig && (
            <p className="text-sm mt-1">
              {isEditable ? (
                <span className="text-green-600 font-medium">✓ Editable</span>
              ) : (
                <span className="text-gray-500">
                  Read-only (outside {patientConfig.edit_window_days}-day edit window)
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevDay}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            ← Prev
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={handleNextDay}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="space-y-8">
        {/* Daily Tracking */}
        <section id="daily-tracking">
          <h2 className="text-2xl font-bold mb-4">Daily Tracking</h2>
          <div className="space-y-4">
            <SleepSection data={bundle} editable={isEditable} />
            <EarlyMorningSection data={bundle} editable={isEditable} />
            <FoodFluidSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
            <BowelSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
            <ExerciseSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
            <EnergySection data={bundle} editable={isEditable} />
            <VitalsSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
            <MedicationsSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
            <SymptomsSection data={bundle} editable={isEditable} onRefresh={fetchBundle} />
          </div>
        </section>

        {/* Cycle Tracking */}
        <section id="cycle-tracking">
          <h2 className="text-2xl font-bold mb-4">Cycle Tracking</h2>
          <div className="space-y-4">
            <CycleSection data={bundle} />
          </div>
        </section>

        {/* Formulations & Treatments */}
        <section id="formulations-treatments">
          <h2 className="text-2xl font-bold mb-4">Formulations & Treatments</h2>
          <div className="space-y-4">
            <RegimenSection data={bundle} />
          </div>
        </section>
      </div>
    </div>
  );
}
