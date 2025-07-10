import React from "react";
import Sidebar from "../Sidebar";
import { useSidebar } from "@/context/SidebarContext";

export default function AppLayout({ children }) {
  const { showSidebar } = useSidebar();

  return (
    <div className="flex h-screen w-screen overflow-hidden relative">
      {showSidebar && (
        <div className="w-[292px] min-w-[292px] h-full transition-all duration-300">
          <Sidebar />
        </div>
      )}

      <main
        className={`transition-all duration-300 h-full overflow-y-auto flex-1`}
        style={{
          marginLeft: showSidebar ? undefined : "0px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
