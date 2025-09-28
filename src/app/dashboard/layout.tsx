import type { Metadata } from 'next';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { ChatWidget } from '@/components/dashboard/chat-widget';

export const metadata: Metadata = {
  title: 'Dashboard | SeedSage',
  description: 'Your SeedSage Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-secondary/50">
      <DashboardSidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}
