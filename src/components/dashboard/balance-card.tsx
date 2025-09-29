"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import type { User } from "@/lib/types";

export function BalanceCard({ user }: { user: User }) {
  const stxBalance = user.balance?.stx?.balance ? parseFloat(user.balance.stx.balance) / 1_000_000 : 0;
  
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
        <div className="text-4xl font-bold">{stxBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} STX</div>
        {stxBalance === 0 && (
          <div className="mt-4">
             <p className="text-sm text-muted-foreground mt-2">
              Your wallet is empty. You can get some free testnet STX from a public faucet to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
