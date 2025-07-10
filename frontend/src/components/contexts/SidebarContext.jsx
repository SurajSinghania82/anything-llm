import React, { createContext, useContext, useState } from "react";

// Create context
const SidebarContext = createContext(null);

// Provider component
export const SidebarProvider = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(true);

  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const openSidebar = () => setShowSidebar(true);
  const closeSidebar = () => setShowSidebar(false);

  return (
    <SidebarContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        toggleSidebar,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Custom hook
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
