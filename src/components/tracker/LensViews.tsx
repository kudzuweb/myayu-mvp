import type { DailySummary, CycleDaySummary } from '../../types/db';

// Daily Lens View Component
export function DailyLensView({
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
export function CycleLensView({
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
export function CombinedLensView({
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
                <div className="flex-1 space-y-1">
                  {day.energy_physical !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs w-8">P:</span>
                      <div
                        className="bg-purple-400 rounded"
                        style={{ width: `${day.energy_physical * 10}%`, height: '16px' }}
                        title={`Physical: ${day.energy_physical}`}
                      />
                      <span className="text-xs">{day.energy_physical}</span>
                    </div>
                  )}
                  {day.energy_mental !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs w-8">M:</span>
                      <div
                        className="bg-blue-400 rounded"
                        style={{ width: `${day.energy_mental * 10}%`, height: '16px' }}
                        title={`Mental: ${day.energy_mental}`}
                      />
                      <span className="text-xs">{day.energy_mental}</span>
                    </div>
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
