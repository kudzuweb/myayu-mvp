import { useState, useEffect } from 'react';
import { getDailyEntryBundle } from '../lib/api/dailyEntry';
import type { DailyEntryBundle } from '../types/db';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bundle when date changes
  useEffect(() => {
    const fetchBundle = async () => {
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
    };

    fetchBundle();
  }, [selectedDate]);

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
        <h1 className="text-3xl font-bold">Daily Entry</h1>
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
            <SleepSection data={bundle} />
            <EarlyMorningSection data={bundle} />
            <FoodFluidSection data={bundle} />
            <BowelSection data={bundle} />
            <ExerciseSection data={bundle} />
            <EnergySection data={bundle} />
            <VitalsSection data={bundle} />
            <MedicationsSection data={bundle} />
            <SymptomsSection data={bundle} />
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
