import { mockMissions } from '@/lib/mock-data';
import type { Mission } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Radio, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function MissionsPage() {
    const completedMissions = mockMissions.filter(m => m.completed).length;
    const totalMissions = mockMissions.length;
    const progress = (completedMissions / totalMissions) * 100;
    const allComplete = completedMissions === totalMissions;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding Missions</h1>
        <p className="text-muted-foreground mt-2">
          Complete these tasks to learn about the Stacks ecosystem, earn rewards, and claim your on-chain badge.
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
             <Button className="w-full max-w-xs" disabled={!allComplete}>
                <Award className="mr-2 h-4 w-4" />
                Claim On-chain Badge
            </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {mockMissions.map((mission) => (
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
      </CardHeader>
      <CardContent>
        <div className="text-sm font-semibold text-primary">Reward: {mission.reward} Points</div>
      </CardContent>
    </Card>
  );
}
