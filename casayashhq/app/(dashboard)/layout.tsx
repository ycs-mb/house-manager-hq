import SessionProviderWrapper from "@/components/dashboard/SessionProviderWrapper";
import Sidebar from "@/components/dashboard/Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </SessionProviderWrapper>
  );
}
