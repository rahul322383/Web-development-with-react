import { createContext, useContext, useState, useEffect } from "react";

// create context
const ThemeContext = createContext();

// provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // optional: persist theme in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme; // apply to body
  }, [theme]);

  // toggle function
  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// custom hook (clean use)
export const useTheme = () => useContext(ThemeContext);