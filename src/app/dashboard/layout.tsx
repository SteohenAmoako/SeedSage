"use client";

import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { ChatWidget } from '@/components/dashboard/chat-widget';
import { useWallet } from '@/hooks/use-wallet';
import { WalletConnectButton } from '@/components/wallet-connect-button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, isLoading } = useWallet();

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-secondary/50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-secondary/50 p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              To access your SeedSage dashboard, please connect your Stacks wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

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
