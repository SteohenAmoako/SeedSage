"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Droplets, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
import { getFaucetStxAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";

export function BalanceCard({ user }: { user: User }) {
  const stxBalance = user.balance?.stx?.balance ? parseFloat(user.balance.stx.balance) / 1_000_000 : 0;
  const { toast } = useToast();
  const [isFunding, setIsFunding] = useState(false);
  const { refreshData } = useWallet();

  const handleGetFaucetStx = async () => {
    setIsFunding(true);
    const result = await getFaucetStxAction({ recipient: user.address });
    setIsFunding(false);

    if (result.success && result.data) {
      toast({
        title: "Funds on the way!",
        description: (
          <p>
            Transaction submitted. Your balance will update in a minute or two.
            <a
              href={`https://explorer.hiro.so/txid/${result.data.txId}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              View on Explorer
            </a>
          </p>
        ),
      });
      // Optionally trigger a refresh after a delay
      setTimeout(refreshData, 30 * 1000); // refresh after 30s
    } else {
      toast({
        variant: "destructive",
        title: "Funding Failed",
        description: result.error || "Could not request STX from the faucet.",
      });
    }
  };
  
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
            <Button onClick={handleGetFaucetStx} disabled={isFunding}>
              {isFunding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Droplets className="mr-2 h-4 w-4" />
              )}
              {isFunding ? 'Sending...' : 'Get Testnet STX'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Click to receive 5 free testnet STX to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
