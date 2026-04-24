export const Card = ({
  children,
  className = "",
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-xl shadow-sm 
        hover:shadow-md transition-shadow duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};