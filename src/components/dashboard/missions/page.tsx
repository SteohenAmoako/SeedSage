"use client";

import type { Mission } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Radio, Award, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MissionsPage() {
    const { missions, claimBadge, isLoading } = useWallet();
    const { toast } = useToast();
    const [isClaiming, setIsClaiming] = useState(false);

    if (isLoading || !missions) {
        return (
             <div className="space-y-8">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-48 w-full" />
                <div className="grid gap-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    const completedMissions = missions.filter(m => m.completed).length;
    const totalMissions = missions.length;
    const progress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
    const allComplete = completedMissions === totalMissions && totalMissions > 0;

    const handleClaim = async () => {
        setIsClaiming(true);
        const result = await claimBadge();
        setIsClaiming(false);

        if(result.success) {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding Missions</h1>
        <p className="text-muted-foreground mt-2">
          Complete these tasks to learn about the Stacks ecosystem and claim your on-chain badge.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <div className="flex items-center gap-4 pt-2">
            <Progress value={progress} className="w-full" />
            <span className="text-lg font-bold text-muted-foreground">{completedMissions}/{totalMissions}</span>
          </div>
        </CardHeader>
        <CardContent>
             <Button className="w-full max-w-xs" disabled={!allComplete || isClaiming} onClick={handleClaim}>
                {isClaiming ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Award className="mr-2 h-4 w-4" />
                )}
                {isClaiming ? "Submitting..." : "Claim On-chain Badge"}
            </Button>
            {allComplete && <p className="text-xs text-muted-foreground mt-2">This will submit a transaction on the testnet.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {missions.map((mission) => (
          <MissionItem key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

function MissionItem({ mission }: { mission: Mission }) {
  return (
    <Card className={mission.completed ? 'bg-secondary/50' : ''}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
            <CardTitle>{mission.title}</CardTitle>
            <CardDescription>{mission.description}</CardDescription>
        </div>
        {mission.completed ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-6 w-6" />
            <span className="font-semibold">Completed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Radio className="h-6 w-6" />
            <span className="font-semibold">To-Do</span>
          </div>
        )}
      </Header>
      <CardContent>
        <div className="text-sm font-semibold text-primary">Reward: {mission.reward} Points</div>
      </CardContent>
    </Card>
  );
}
