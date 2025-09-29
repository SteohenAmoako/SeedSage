"use client";

import { BalanceCard } from "@/components/dashboard/balance-card";
import { MissionsCard } from "@/components/dashboard/missions-card";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { SeedEducationWizard } from "@/components/seed-education-wizard";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, transactions, missions, isLoading } = useWallet();

  return (
    <>
      <SeedEducationWizard />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {isLoading || !user ? (
            <>
              <Skeleton className="h-[180px] w-full" />
              <Skeleton className="h-[350px] w-full" />
            </>
          ) : (
            <>
              <BalanceCard user={user} />
              <MissionsCard missions={missions} />
            </>
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading || !transactions ? (
            <Skeleton className="h-[546px] w-full" />
          ) : (
            <TransactionsList transactions={transactions} />
          )}
        </div>
      </div>
    </>
  );
}
