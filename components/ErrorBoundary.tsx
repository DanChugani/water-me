import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Something went wrong
              </h2>
              <div className="mt-4 text-center">
                <p className="text-gray-600 font-medium">
                  We apologize for the inconvenience.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please try refreshing the page or contact support if the problem persists.
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={() => window.location.reload()}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 