import { useState, useEffect, useCallback } from 'react';
import { getDailyEntryBundle, getPatientConfig } from '../../lib/api/dailyEntry';
import { differenceInCalendarDays } from 'date-fns';

export function DailyEntryOverlay({
  patientId,
  date,
  onClose,
  readOnly = false,
}: {
  patientId: string;
  date: string;
  onClose: () => void;
  readOnly?: boolean;
}) {
  const [bundle, setBundle] = useState<any>(null);
  const [patientConfig, setPatientConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEditable = !readOnly && patientConfig
    ? differenceInCalendarDays(new Date(), new Date(date)) <= patientConfig.edit_window_days
    : false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bundleData, configData] = await Promise.all([
        getDailyEntryBundle(patientId, date),
        getPatientConfig(patientId),
      ]);
      setBundle(bundleData);
      setPatientConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching overlay data:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId, date]);

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
                {readOnly ? (
                  <span className="text-blue-600 font-medium">👁️ Read-Only (Clinician View)</span>
                ) : isEditable ? (
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
