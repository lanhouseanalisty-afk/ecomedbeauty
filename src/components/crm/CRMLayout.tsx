import { Outlet } from "react-router-dom";
import { CRMSidebar } from "./CRMSidebar";
import { CRMHeader } from "./CRMHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

export function CRMLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <CRMSidebar />
        <div className="flex flex-1 flex-col">
          <CRMHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
