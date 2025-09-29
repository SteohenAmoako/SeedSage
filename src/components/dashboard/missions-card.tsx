"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Award, Loader2 } from "lucide-react";
import type { Mission } from "@/lib/types";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";

export function MissionsCard({ missions }: { missions: Mission[] }) {
  const { claimBadge, isConnected } = useWallet();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  if (!isConnected || !missions) {
      return null;
  }

  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const progress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
  const allComplete = completedMissions === totalMissions && totalMissions > 0;

  const handleClaim = async () => {
    setIsClaiming(true);
    const result = await claimBadge();
    setIsClaiming(false);

    if (result.success) {
      toast({
        title: "Badge Claimed!",
        description: (
            <p>
                Transaction submitted. You can view it on the{' '}
                <a 
                    href={`https://explorer.hiro.so/txid/${result.txId}?chain=testnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                >
                    explorer
                </a>.
            </p>
        )
      });
    } else {
      toast({
        variant: 'destructive',
        title: "Claim Failed",
        description: result.error || "Could not submit transaction.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Onboarding Missions
                </CardTitle>
                <CardDescription>Complete tasks to learn and earn rewards.</CardDescription>
            </div>
            <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard/missions">View All</Link>
            </Button>
        </div>
        <div className="flex items-center gap-4 pt-2">
          <Progress value={progress} className="w-full" />
          <span className="text-sm font-medium text-muted-foreground">{completedMissions}/{totalMissions}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.slice(0, 3).map(mission => (
          <div key={mission.id} className="flex items-start gap-3">
            <Checkbox id={`mission-card-${mission.id}`} checked={mission.completed} className="mt-1" disabled />
            <div className="grid gap-0.5">
              <label htmlFor={`mission-card-${mission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {mission.title}
              </label>
            </div>
          </div>
        ))}
         {allComplete && (
            <Button className="w-full mt-4" disabled={isClaiming} onClick={handleClaim}>
            {isClaiming ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Award className="mr-2 h-4 w-4" />
            )}
            {isClaiming ? 'Submitting...' : 'Claim On-chain Badge'}
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
