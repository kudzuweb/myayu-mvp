export default function PatientDailyEntryPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Daily Entry</h1>
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
