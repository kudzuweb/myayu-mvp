import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getDailySummaryRange, getPatientConfig, getCycleRange } from '../lib/api/dailyEntry';
import type { DailySummary, PatientConfig, CycleDaySummary } from '../types/db';
import { subDays } from 'date-fns';
import { DailyLensView, CycleLensView, CombinedLensView } from '../components/tracker/LensViews';
import { DailyEntryOverlay } from '../components/tracker/DailyEntryOverlay';

type LensType = 'daily' | 'cycle' | 'combined';

export default function ClinicianTrackerPage() {
  const { patientId } = useParams<{ patientId: string }>();
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
    if (!patientId) return;

    const fetchConfig = async () => {
      try {
        const config = await getPatientConfig(patientId);
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
  }, [patientId]);

  // Fetch summaries when date range or config changes
  const fetchSummaries = useCallback(async () => {
    if (!patientId || !fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getDailySummaryRange(patientId, fromDate, toDate);
      setSummaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summaries');
      console.error('Error fetching summaries:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, fromDate, toDate]);

  // Fetch cycle data for cycle and combined lenses
  const fetchCycleData = useCallback(async () => {
    if (!patientId || !fromDate || !toDate) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getCycleRange(patientId, fromDate, toDate);
      setCycleData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cycle data');
      console.error('Error fetching cycle data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, fromDate, toDate]);

  // Determine which data type we need (cycle/combined use same data)
  const needsCycleData = activeLens === 'cycle' || activeLens === 'combined';

  // Fetch data based on active lens - only refetch when data type changes
  useEffect(() => {
    if (fromDate && toDate) {
      if (needsCycleData) {
        fetchCycleData();
      } else {
        fetchSummaries();
      }
    }
  }, [fromDate, toDate, needsCycleData, fetchSummaries, fetchCycleData]);

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

  // Show loading indicator if loading and no data for current lens
  const hasNoData = needsCycleData ? !cycleData.length : !summaries.length;
  if (loading && hasNoData) {
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

  if (!patientId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">No patient ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Patient Tracker</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            👁️ Read-Only
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Patient ID: {patientId}</p>

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

      {/* Daily Entry Overlay (Read-Only) */}
      {selectedDate && (
        <DailyEntryOverlay
          patientId={patientId}
          date={selectedDate}
          onClose={handleCloseOverlay}
          readOnly={true}
        />
      )}
    </div>
  );
}
