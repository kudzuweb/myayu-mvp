import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PatientDailyEntryPage from './routes/PatientDailyEntryPage';
import PatientTrackerPage from './routes/PatientTrackerPage';
import ClinicianTrackerPage from './routes/ClinicianTrackerPage';
import ClinicianDailyEntryPage from './routes/ClinicianDailyEntryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/patient/daily" replace />} />
          <Route path="patient/daily" element={<PatientDailyEntryPage />} />
          <Route path="patient/tracker" element={<PatientTrackerPage />} />
          <Route path="clinician/tracker/:patientId" element={<ClinicianTrackerPage />} />
          <Route path="clinician/daily/:patientId/:date?" element={<ClinicianDailyEntryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
