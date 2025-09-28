import { BalanceCard } from "@/components/dashboard/balance-card";
import { MissionsCard } from "@/components/dashboard/missions-card";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { SeedEducationWizard } from "@/components/seed-education-wizard";
import { mockUser, mockTransactions, mockMissions } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <SeedEducationWizard />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <BalanceCard user={mockUser} />
          <MissionsCard missions={mockMissions} />
        </div>
        <div className="lg:col-span-2">
          <TransactionsList transactions={mockTransactions} />
        </div>
      </div>
    </>
  );
}
