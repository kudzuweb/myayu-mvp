import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';

// Dev patient ID from seed data
const DEV_PATIENT_ID = '11111111-1111-1111-1111-111111111111';

export default function Layout() {
  const [role, setRole] = useState<'patient' | 'clinician'>('patient');
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">MyAyu MVP</h1>
              </div>
              <div className="flex space-x-4">
                {role === 'patient' ? (
                  <>
                    <Link
                      to="/patient/daily"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive('/patient/daily')
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Daily Entry
                    </Link>
                    <Link
                      to="/patient/tracker"
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive('/patient/tracker')
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Tracker
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/clinician/tracker/${DEV_PATIENT_ID}`}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname.startsWith('/clinician/tracker')
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Patient Tracker
                    </Link>
                    <Link
                      to={`/clinician/daily/${DEV_PATIENT_ID}`}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        location.pathname.startsWith('/clinician/daily')
                          ? 'text-blue-700 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Daily Entry
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRole('patient')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    role === 'patient'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Patient
                </button>
                <button
                  onClick={() => setRole('clinician')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    role === 'clinician'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Clinician
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
