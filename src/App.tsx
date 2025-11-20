import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientDailyEntryPage from './routes/PatientDailyEntryPage';
import PatientTrackerPage from './routes/PatientTrackerPage';
import ClinicianTrackerPage from './routes/ClinicianTrackerPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/patient/daily" replace />} />
          <Route path="patient/daily" element={<PatientDailyEntryPage />} />
          <Route path="patient/tracker" element={<PatientTrackerPage />} />
          <Route path="clinician/tracker/:patientId" element={<ClinicianTrackerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
