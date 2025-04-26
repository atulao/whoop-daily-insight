
import React from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-whoop-gradient">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="whoop-attribution">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
