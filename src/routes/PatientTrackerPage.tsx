import { useState, useEffect, useCallback } from 'react';
import { getDailySummaryRange, getPatientConfig, getDailyEntryBundle } from '../lib/api/dailyEntry';
import type { DailySummary, PatientConfig } from '../types/db';
import { subDays, differenceInCalendarDays } from 'date-fns';

// Dev patient ID from seed data
const DEV_PATIENT_ID = '11111111-1111-1111-1111-111111111111';

export default function PatientTrackerPage() {
  const [patientConfig, setPatientConfig] = useState<PatientConfig | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch patient config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getPatientConfig(DEV_PATIENT_ID);
        setPatientConfig(config);

        // Set default fromDate based on tracking_window_days
        const today = new Date();
        const defaultFrom = subDays(today, config.tracking_window_days);
        setFromDate(defaultFrom.toISOString().split('T')[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
        setLoading(false);
        console.error('Error fetching patient config:', err);
      }
    };

    fetchConfig();
  }, []);

  // Fetch summaries when date range or config changes
  const fetchSummaries = useCallback(async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDailySummaryRange(DEV_PATIENT_ID, fromDate, toDate);
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summaries');
      console.error('Error fetching summaries:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchSummaries();
    }
  }, [fetchSummaries, fromDate, toDate]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseOverlay = () => {
    setSelectedDate(null);
    fetchSummaries(); // Refresh summaries when overlay closes
  };

  if (loading && !summaries.length) {
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Patient Tracker</h1>

        {/* Date Range Selector */}
        <div className="flex gap-4 items-center mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border rounded"
            />
          </div>
          {patientConfig && (
            <div className="text-sm text-gray-600 mt-6">
              Default range: {patientConfig.tracking_window_days} days
            </div>
          )}
        </div>

        {/* Lens Tabs (Daily only for PR9) */}
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium">
            Daily Lens
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded text-gray-500" disabled>
            Cycle Lens (PR10)
          </button>
          <button className="px-4 py-2 bg-gray-200 rounded text-gray-500" disabled>
            Combined Lens (PR10)
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      {summaries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No data found for selected date range.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group by week (simple approach - just show all days) */}
          {summaries.map((summary) => (
            <div
              key={summary.date}
              onClick={() => handleDayClick(summary.date)}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{summary.date}</h3>
                  <p className="text-sm text-gray-600">
                    {(() => {
                      // Parse date as local to avoid timezone display issues
                      const [year, month, day] = summary.date.split('-').map(Number);
                      const localDate = new Date(year, month - 1, day);
                      return localDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details →
                </button>
              </div>

              {/* Summary Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Energy Summary */}
                <div className="bg-purple-50 rounded p-2">
                  <div className="text-xs text-gray-600 mb-1">Energy</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {summary.energy_physical !== undefined && (
                      <div>P: {summary.energy_physical}/10</div>
                    )}
                    {summary.energy_mental !== undefined && (
                      <div>M: {summary.energy_mental}/10</div>
                    )}
                    {summary.energy_emotional !== undefined && (
                      <div>E: {summary.energy_emotional}/10</div>
                    )}
                    {summary.energy_drive !== undefined && (
                      <div>D: {summary.energy_drive}/10</div>
                    )}
                  </div>
                </div>

                {/* Activity Counts */}
                <div className="bg-green-50 rounded p-2">
                  <div className="text-xs text-gray-600 mb-1">Activity</div>
                  <div className="text-xs space-y-1">
                    <div>🍽️ {summary.food_count} meals</div>
                    <div>💪 {summary.exercise_minutes} min</div>
                    <div>🚽 {summary.bowel_movement_count} BMs</div>
                  </div>
                </div>

                {/* Adherence */}
                <div className="bg-blue-50 rounded p-2">
                  <div className="text-xs text-gray-600 mb-1">Adherence</div>
                  <div className="text-xs space-y-1">
                    <div>💊 {summary.formulation_adherence_percent}%</div>
                    <div>🩺 {summary.treatment_adherence_percent}%</div>
                  </div>
                </div>

                {/* Cycle */}
                <div className="bg-pink-50 rounded p-2">
                  <div className="text-xs text-gray-600 mb-1">Cycle</div>
                  <div className="text-xs">
                    {summary.has_cycle_log ? '✓ Logged' : '○ No log'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily Entry Overlay */}
      {selectedDate && (
        <DailyEntryOverlay date={selectedDate} onClose={handleCloseOverlay} />
      )}
    </div>
  );
}

// Overlay component for daily entry drill-in
function DailyEntryOverlay({ date, onClose }: { date: string; onClose: () => void }) {
  const [bundle, setBundle] = useState<any>(null);
  const [patientConfig, setPatientConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditable = patientConfig
    ? differenceInCalendarDays(new Date(), new Date(date)) <= patientConfig.edit_window_days
    : false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bundleData, configData] = await Promise.all([
        getDailyEntryBundle(DEV_PATIENT_ID, date),
        getPatientConfig(DEV_PATIENT_ID),
      ]);
      setBundle(bundleData);
      setPatientConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching overlay data:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold">Daily Entry - {date}</h2>
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : bundle ? (
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Daily entry content integrated. All sections from PatientDailyEntryPage will be displayed here.
              For now showing placeholder - full integration requires importing all section components.
            </p>
            <div className="space-y-4 text-sm">
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">Energy Levels</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {bundle.dailyEntry.energy_physical !== undefined && (
                    <div>Physical: {bundle.dailyEntry.energy_physical}/10</div>
                  )}
                  {bundle.dailyEntry.energy_mental !== undefined && (
                    <div>Mental: {bundle.dailyEntry.energy_mental}/10</div>
                  )}
                  {bundle.dailyEntry.energy_emotional !== undefined && (
                    <div>Emotional: {bundle.dailyEntry.energy_emotional}/10</div>
                  )}
                  {bundle.dailyEntry.energy_drive !== undefined && (
                    <div>Drive: {bundle.dailyEntry.energy_drive}/10</div>
                  )}
                </div>
              </div>
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">Activity Summary</h3>
                <ul className="text-xs space-y-1">
                  <li>Foods: {bundle.foodEvents.length}</li>
                  <li>Bowel Movements: {bundle.bowelMovements.length}</li>
                  <li>Exercise Events: {bundle.exerciseEvents.length}</li>
                  <li>Vital Readings: {bundle.vitalReadings.length}</li>
                  <li>Medications: {bundle.medicationIntakes.length}</li>
                  <li>Symptoms: {bundle.symptomLogs.length}</li>
                </ul>
              </div>
              {bundle.cycleLog && (
                <div className="border rounded p-3">
                  <h3 className="font-semibold mb-2">Cycle Tracking</h3>
                  <p className="text-xs">Cycle log present for this date</p>
                </div>
              )}
              <div className="border rounded p-3">
                <h3 className="font-semibold mb-2">Regimen</h3>
                <ul className="text-xs space-y-1">
                  <li>Formulations: {bundle.regimenFormulations.length}</li>
                  <li>Treatments: {bundle.regimenTreatments.length}</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
