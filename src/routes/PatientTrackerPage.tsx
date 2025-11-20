export default function PatientTrackerPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Patient Tracker</h1>
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Daily Lens</button>
          <button className="px-4 py-2 bg-gray-200 rounded">Cycle Lens</button>
          <button className="px-4 py-2 bg-gray-200 rounded">Combined Lens</button>
        </div>
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Tracker View</h2>
          <p className="text-gray-600">Tracker content will go here</p>
        </section>
      </div>
    </div>
  );
}
