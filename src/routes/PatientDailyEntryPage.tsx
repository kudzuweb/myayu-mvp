import { getDailyEntryBundle } from '../lib/api/dailyEntry';

// Dev patient ID from seed data
const DEV_PATIENT_ID = '11111111-1111-1111-1111-111111111111';

export default function PatientDailyEntryPage() {
  const handleTestBundle = async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('Fetching daily entry bundle for:', today);

    try {
      const bundle = await getDailyEntryBundle(DEV_PATIENT_ID, today);
      console.log('✅ Daily Entry Bundle:', bundle);
      console.log('- Daily Entry:', bundle.dailyEntry);
      console.log('- Sleep Blocks:', bundle.sleepBlocks.length);
      console.log('- Food Events:', bundle.foodEvents.length);
      console.log('- Bowel Movements:', bundle.bowelMovements.length);
      console.log('- Exercise Events:', bundle.exerciseEvents.length);
      console.log('- Vital Readings:', bundle.vitalReadings.length);
      console.log('- Medication Intakes:', bundle.medicationIntakes.length);
      console.log('- Symptom Logs:', bundle.symptomLogs.length);
      console.log('- Cycle Log:', bundle.cycleLog ? 'present' : 'none');
      console.log('- Regimen Formulations:', bundle.regimenFormulations.length);
      console.log('- Regimen Treatments:', bundle.regimenTreatments.length);
      alert('✅ Bundle fetched! Check console for details.');
    } catch (error) {
      console.error('❌ Error fetching bundle:', error);
      alert('❌ Error fetching bundle. Check console for details.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Daily Entry</h1>
        <button
          onClick={handleTestBundle}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          🐛 Test API (Check Console)
        </button>
      </div>
      <div className="space-y-6">
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Daily Tracking</h2>
          <p className="text-gray-600">Daily tracking content will go here</p>
        </section>
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Cycle Tracking</h2>
          <p className="text-gray-600">Cycle tracking content will go here</p>
        </section>
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Formulations & Treatments</h2>
          <p className="text-gray-600">Formulations & treatments content will go here</p>
        </section>
      </div>
    </div>
  );
}
