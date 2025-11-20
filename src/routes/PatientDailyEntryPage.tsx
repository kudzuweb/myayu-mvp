import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function PatientDailyEntryPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Connectivity check - verify Supabase connection without requiring tables
    const checkConnection = async () => {
      try {
        // Use auth session check - doesn't require any tables to exist
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connected successfully:', data);
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Unexpected error checking Supabase connection:', err);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Daily Entry</h1>
        {/* Dev-only connection status indicator */}
        <div className="text-sm">
          Connection status:{' '}
          <span
            className={
              connectionStatus === 'connected'
                ? 'text-green-600'
                : connectionStatus === 'error'
                ? 'text-red-600'
                : 'text-yellow-600'
            }
          >
            {connectionStatus === 'connected'
              ? '✓ Connected'
              : connectionStatus === 'error'
              ? '✗ Error (check console)'
              : '⋯ Checking...'}
          </span>
        </div>
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
