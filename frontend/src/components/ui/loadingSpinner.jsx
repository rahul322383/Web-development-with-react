// Loading Component
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
        <div className="absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{text}</p>
    </div>
  </div>
);

export default LoadingSpinner;