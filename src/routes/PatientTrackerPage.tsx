import { useState, useEffect, useCallback } from 'react';
import { getDailySummaryRange, getPatientConfig, getDailyEntryBundle, getCycleRange } from '../lib/api/dailyEntry';
import type { DailySummary, PatientConfig, CycleDaySummary } from '../types/db';
import { subDays, differenceInCalendarDays } from 'date-fns';

// Dev patient ID from seed data
const DEV_PATIENT_ID = '11111111-1111-1111-1111-111111111111';

type LensType = 'daily' | 'cycle' | 'combined';

export default function PatientTrackerPage() {
  const [patientConfig, setPatientConfig] = useState<PatientConfig | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeLens, setActiveLens] = useState<LensType>('daily');
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [cycleData, setCycleData] = useState<CycleDaySummary[]>([]);
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

  // Fetch cycle data for cycle and combined lenses
  const fetchCycleData = useCallback(async () => {
    if (!fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCycleRange(DEV_PATIENT_ID, fromDate, toDate);
      setCycleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cycle data');
      console.error('Error fetching cycle data:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  // Fetch data based on active lens
  useEffect(() => {
    if (fromDate && toDate) {
      if (activeLens === 'daily') {
        fetchSummaries();
      } else {
        // Cycle and Combined lenses both use cycle data
        fetchCycleData();
      }
    }
  }, [fromDate, toDate, activeLens, fetchSummaries, fetchCycleData]);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleCloseOverlay = () => {
    setSelectedDate(null);
    // Refresh appropriate data based on active lens
    if (activeLens === 'daily') {
      fetchSummaries();
    } else {
      fetchCycleData();
    }
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

        {/* Lens Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveLens('daily')}
            className={`px-4 py-2 rounded font-medium ${
              activeLens === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Daily Lens
          </button>
          <button
            onClick={() => setActiveLens('cycle')}
            className={`px-4 py-2 rounded font-medium ${
              activeLens === 'cycle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cycle Lens
          </button>
          <button
            onClick={() => setActiveLens('combined')}
            className={`px-4 py-2 rounded font-medium ${
              activeLens === 'combined'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Combined Lens
          </button>
        </div>
      </div>

      {/* Render appropriate lens view */}
      {activeLens === 'daily' && (
        <DailyLensView summaries={summaries} onDayClick={handleDayClick} />
      )}
      {activeLens === 'cycle' && (
        <CycleLensView cycleData={cycleData} onDayClick={handleDayClick} />
      )}
      {activeLens === 'combined' && (
        <CombinedLensView cycleData={cycleData} onDayClick={handleDayClick} />
      )}

      {/* Daily Entry Overlay */}
      {selectedDate && (
        <DailyEntryOverlay date={selectedDate} onClose={handleCloseOverlay} />
      )}
    </div>
  );
}

// Daily Lens View Component
function DailyLensView({
  summaries,
  onDayClick,
}: {
  summaries: DailySummary[];
  onDayClick: (date: string) => void;
}) {
  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data found for selected date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary) => (
        <div
          key={summary.date}
          onClick={() => onDayClick(summary.date)}
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
  );
}

// Cycle Lens View Component
function CycleLensView({
  cycleData,
  onDayClick,
}: {
  cycleData: CycleDaySummary[];
  onDayClick: (date: string) => void;
}) {
  if (cycleData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No cycle data found for selected date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Cycle Lens: View organized by cycle day</p>
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Cycle Day</th>
              <th className="px-4 py-2 text-left">Bleeding</th>
              <th className="px-4 py-2 text-left">Physical Symptoms</th>
              <th className="px-4 py-2 text-left">Emotional Symptoms</th>
              <th className="px-4 py-2 text-left">Energy</th>
              <th className="px-4 py-2 text-left">Adherence</th>
            </tr>
          </thead>
          <tbody>
            {cycleData.map((day) => (
              <tr
                key={day.date}
                onClick={() => onDayClick(day.date)}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-2">{day.date}</td>
                <td className="px-4 py-2">{day.cycle_day || '-'}</td>
                <td className="px-4 py-2">
                  {day.bleeding_quantity ? (
                    <span className="text-xs">
                      {day.bleeding_quantity} {day.blood_color && `(${day.blood_color})`}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-2">
                  {day.physical_symptom_keys && day.physical_symptom_keys.length > 0 ? (
                    <span className="text-xs">{day.physical_symptom_keys.length} symptoms</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-2">
                  {day.emotional_symptom_keys && day.emotional_symptom_keys.length > 0 ? (
                    <span className="text-xs">{day.emotional_symptom_keys.length} symptoms</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="text-xs">
                    {day.energy_physical !== undefined && `P:${day.energy_physical}`}
                    {day.energy_mental !== undefined && ` M:${day.energy_mental}`}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-xs">
                    {day.formulation_adherence_percent}% / {day.treatment_adherence_percent}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Combined Lens View Component
function CombinedLensView({
  cycleData,
  onDayClick,
}: {
  cycleData: CycleDaySummary[];
  onDayClick: (date: string) => void;
}) {
  if (cycleData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data found for selected date range.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-4">
        Combined Lens: Energy trends, adherence patterns, and symptom correlations
      </p>

      {/* Simple trend visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Energy Trend */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Energy Trend</h3>
          <div className="space-y-2">
            {cycleData.map((day) => (
              <div
                key={day.date}
                onClick={() => onDayClick(day.date)}
                className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
              >
                <span className="text-xs w-24">{day.date}</span>
                <div className="flex-1 flex gap-1">
                  {day.energy_physical !== undefined && (
                    <div
                      className="bg-purple-400"
                      style={{ width: `${day.energy_physical * 10}%`, height: '20px' }}
                      title={`Physical: ${day.energy_physical}`}
                    />
                  )}
                  {day.energy_mental !== undefined && (
                    <div
                      className="bg-blue-400"
                      style={{ width: `${day.energy_mental * 10}%`, height: '20px' }}
                      title={`Mental: ${day.energy_mental}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adherence Pattern */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Adherence Pattern</h3>
          <div className="space-y-2">
            {cycleData.map((day) => (
              <div
                key={day.date}
                onClick={() => onDayClick(day.date)}
                className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
              >
                <span className="text-xs w-24">{day.date}</span>
                <div className="flex-1">
                  <div
                    className={`h-5 rounded ${
                      day.formulation_adherence_percent >= 80
                        ? 'bg-green-400'
                        : day.formulation_adherence_percent >= 50
                        ? 'bg-yellow-400'
                        : 'bg-red-400'
                    }`}
                    style={{ width: `${day.formulation_adherence_percent}%` }}
                  />
                </div>
                <span className="text-xs">{day.formulation_adherence_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
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
