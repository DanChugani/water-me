import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plant } from '../types/plant';
import { formatEmailToName } from '../utils/format';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

function formatDate(date: Date | null) {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWater, setPendingWater] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }
    
    if (status === 'authenticated') {
      fetchPlant();
    }
  }, [status, session, router]);

  const fetchPlant = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/plant');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch plant data');
      }
      
      const data = await res.json();
      setPlant({
        name: 'Office Plants',
        lastWatered: data.lastWatered ? new Date(data.lastWatered) : null,
        isWatered: data.isWatered,
        lastUpdatedBy: data.lastUpdatedBy,
        wateringHistory: (data.wateringHistory || []).map((e: Record<string, unknown>) => ({
          date: new Date(e.date as string),
          user: e.user as string,
          note: e.note as string,
        })),
      });
    } catch (error) {
      console.error('Error fetching plant data:', error);
      setError('Could not load plant data.');
    } finally {
      setLoading(false);
    }
  };

  const updatePlant = async (update: Partial<Plant> & { note?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        ...plant,
        ...update,
        lastUpdatedBy: session?.user?.email || '',
        note: update.note || '',
      };
      
      const res = await fetch('/api/plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error('Failed to update plant');
      const data = await res.json();
      
      const updatedPlant = {
        name: 'Office Plants',
        lastWatered: data.lastWatered ? new Date(data.lastWatered) : null,
        isWatered: data.isWatered,
        lastUpdatedBy: data.lastUpdatedBy,
        wateringHistory: (data.wateringHistory || []).map((e: Record<string, unknown>) => ({
          date: new Date(e.date as string),
          user: e.user as string,
          note: e.note as string,
        })),
      };
      setPlant(updatedPlant);
      toast.success('Plant watered!');
    } catch (err) {
      console.error('Error updating plant:', err);
      setError('Could not update plant.');
      toast.error('Failed to water plant. Please try again.');
    } finally {
      setLoading(false);
      setPendingWater(false);
      setNote('');
    }
  };

  // Helper to determine status and color
  const getWaterStatus = () => {
    if (!plant?.lastWatered) {
      return { label: 'Needs Water', color: 'red' };
    }
    const days = Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 4) return { label: 'Watered', color: 'emerald' };
    if (days < 7) return { label: 'Check Plants', color: 'yellow' };
    return { label: 'Needs Water', color: 'red' };
  };
  const waterStatus = getWaterStatus();

  if (status === 'loading' || loading || !plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleWater = () => {
    if (!plant.isWatered && waterStatus.color !== 'emerald') {
      setShowConfirm(true);
    }
  };

  const confirmWater = () => {
    setShowConfirm(false);
    setPendingWater(true);
    updatePlant({
      lastWatered: new Date(),
      isWatered: true,
      note,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <ConfirmModal
        open={showConfirm}
        title="Confirm Watering"
        message={
          <div>
            <div>Are you sure you want to water the plant? You will be unable to undo this action.</div>
            <textarea
              className="mt-4 w-full rounded-lg border border-gray-200 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows={2}
              placeholder="Add a note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={200}
              aria-label="Watering note"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
        }
        confirmText={pendingWater ? 'Watering...' : 'Yes, Water Plant'}
        cancelText="Cancel"
        onConfirm={confirmWater}
        onCancel={() => { setShowConfirm(false); setNote(''); }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                IDENTOS Plant Tracker 🌿
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {formatEmailToName(session?.user?.email || '')}
              </p>
            </div>
            <button
              onClick={() => signOut({ 
                callbackUrl: '/auth/signin',
                redirect: true
              })}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md hover:from-emerald-600 hover:to-blue-600 hover:scale-105 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Plant Status Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{plant.name}</h2>
            <div className="flex items-center">
              <span
                key={waterStatus.label + waterStatus.color}
                className={`flex items-center px-4 py-1 rounded-full font-semibold text-base shadow-sm border transition-colors duration-300 transition-transform animate-status-badge
                  ${waterStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : waterStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : 'bg-red-100 text-red-700 border-red-200'}
                `}
                aria-live="polite"
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full mr-2 shadow-sm border
                    ${waterStatus.color === 'emerald' ? 'bg-emerald-500 border-emerald-600'
                      : waterStatus.color === 'yellow' ? 'bg-yellow-400 border-yellow-500'
                      : 'bg-red-500 border-red-600'}
                  `}
                ></span>
                {waterStatus.label}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center text-gray-600">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last watered on: {formatDate(plant.lastWatered)}</span>
            </div>
            {plant.lastUpdatedBy && (
              <div className="flex items-center text-gray-600 mt-2">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>by {formatEmailToName(plant.lastUpdatedBy)}</span>
              </div>
            )}
            {plant.wateringHistory && plant.wateringHistory.length > 0 && plant.wateringHistory[0].note && (
              <div className="flex items-center text-gray-500 mt-2">
                <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="italic">&quot;{plant.wateringHistory[0].note}&quot;</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWater}
              disabled={plant.isWatered || waterStatus.color === 'emerald'}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                plant.isWatered || waterStatus.color === 'emerald'
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600'
              }`}
            >
              {waterStatus.color === 'emerald' ? 'Already Watered' : 'Water Plant'}
            </button>
          </div>
          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>

        {/* Watering History */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Watering History
          </h3>
          {plant.wateringHistory.length === 0 ? (
            <div className="text-gray-500">No watering history yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {plant.wateringHistory.map((event, idx) => (
                <li key={event.date.toISOString() + event.user + idx} className="py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-400"></span>
                    <span className="text-gray-700 font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="text-gray-600 ml-5">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>by {formatEmailToName(event.user)}</span>
                    </div>
                    {event.note && (
                      <div className="flex items-start mt-1 bg-gray-50 p-2 rounded-lg">
                        <svg className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="text-gray-600">&quot;{event.note}&quot;</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
