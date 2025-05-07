import { useRouter } from 'next/router';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-4xl">🌿</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Page Not Found
          </h2>
          <div className="mt-4 text-center">
            <p className="text-gray-600 font-medium">
              The page you're looking for doesn't exist.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Let's get you back to the plant tracker.
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={() => router.push('/')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
} 