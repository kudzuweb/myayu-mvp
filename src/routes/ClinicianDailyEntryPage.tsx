import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDailyEntryBundle, getPatientConfig } from '../lib/api/dailyEntry';

export default function ClinicianDailyEntryPage() {
  const { patientId, date: routeDate } = useParams<{ patientId: string; date?: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>(
    routeDate || new Date().toISOString().split('T')[0]
  );
  const [bundle, setBundle] = useState<any>(null);
  const [patientConfig, setPatientConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);
    try {
      const [bundleData, configData] = await Promise.all([
        getDailyEntryBundle(patientId, selectedDate),
        getPatientConfig(patientId),
      ]);
      setBundle(bundleData);
      setPatientConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching daily entry data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    // Update URL to reflect selected date
    if (patientId) {
      navigate(`/clinician/daily/${patientId}/${newDate}`, { replace: true });
    }
  };

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
          <h1 className="text-3xl font-bold">Daily Entry</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            👁️ Read-Only
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">Patient ID: {patientId}</p>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-4 py-2 border rounded-lg text-lg"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      ) : bundle ? (
        <div className="space-y-6">
          {/* Date Header */}
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold">{selectedDate}</h2>
            <p className="text-sm text-gray-600">
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);
                return localDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              })()}
            </p>
          </div>

          {/* Energy Levels */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">Energy Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bundle.dailyEntry.energy_physical !== undefined && (
                <div className="bg-purple-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Physical</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {bundle.dailyEntry.energy_physical}/10
                  </div>
                </div>
              )}
              {bundle.dailyEntry.energy_mental !== undefined && (
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Mental</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {bundle.dailyEntry.energy_mental}/10
                  </div>
                </div>
              )}
              {bundle.dailyEntry.energy_emotional !== undefined && (
                <div className="bg-pink-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Emotional</div>
                  <div className="text-2xl font-bold text-pink-700">
                    {bundle.dailyEntry.energy_emotional}/10
                  </div>
                </div>
              )}
              {bundle.dailyEntry.energy_drive !== undefined && (
                <div className="bg-green-50 rounded p-3">
                  <div className="text-xs text-gray-600 mb-1">Drive</div>
                  <div className="text-2xl font-bold text-green-700">
                    {bundle.dailyEntry.energy_drive}/10
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Foods:</span>{' '}
                <span className="font-medium">{bundle.foodEvents.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Bowel Movements:</span>{' '}
                <span className="font-medium">{bundle.bowelMovements.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Exercise Events:</span>{' '}
                <span className="font-medium">{bundle.exerciseEvents.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Vital Readings:</span>{' '}
                <span className="font-medium">{bundle.vitalReadings.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Medications:</span>{' '}
                <span className="font-medium">{bundle.medicationIntakes.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Symptoms:</span>{' '}
                <span className="font-medium">{bundle.symptomLogs.length}</span>
              </div>
            </div>
          </div>

          {/* Cycle Tracking */}
          {bundle.cycleLog && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-lg">Cycle Tracking</h3>
              <p className="text-sm text-gray-600">Cycle log present for this date</p>
            </div>
          )}

          {/* Regimen */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-lg">Regimen</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Formulations:</span>{' '}
                <span className="font-medium">{bundle.regimenFormulations.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Treatments:</span>{' '}
                <span className="font-medium">{bundle.regimenTreatments.length}</span>
              </div>
            </div>
          </div>

          {/* Note about full details */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>
              This view shows a summary of the daily entry. Full section details (food logs, exercise details, etc.)
              can be integrated by importing all section components from PatientDailyEntryPage.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
