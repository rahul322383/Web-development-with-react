export const Button = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
    outline:
      "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};