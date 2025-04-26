
import React from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 bg-gradient-to-b from-background to-background/90">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
