import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import type { User } from "@/lib/types";

export function BalanceCard({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Wallet className="w-5 h-5" />
          My Wallet
        </CardTitle>
        <CardDescription className="font-mono text-xs pt-2 break-all">{user.address}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{user.balance.stx.balance.toLocaleString()} STX</div>
        <p className="text-xs text-muted-foreground mt-1">
          ~ ${user.balance.stx.usd_balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        </p>
      </CardContent>
    </Card>
  );
}
