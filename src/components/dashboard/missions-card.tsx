import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Award } from "lucide-react";
import type { Mission } from "@/lib/types";

export function MissionsCard({ missions }: { missions: Mission[] }) {
  const completedMissions = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const progress = (completedMissions / totalMissions) * 100;
  const allComplete = completedMissions === totalMissions;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Onboarding Missions
        </CardTitle>
        <CardDescription>Complete tasks to learn and earn rewards.</CardDescription>
        <div className="flex items-center gap-4 pt-2">
          <Progress value={progress} className="w-full" />
          <span className="text-sm font-medium text-muted-foreground">{completedMissions}/{totalMissions}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map(mission => (
          <div key={mission.id} className="flex items-start gap-3">
            <Checkbox id={`mission-${mission.id}`} checked={mission.completed} className="mt-1" />
            <div className="grid gap-0.5">
              <label htmlFor={`mission-${mission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {mission.title}
              </label>
              <p className="text-sm text-muted-foreground">{mission.description}</p>
            </div>
          </div>
        ))}
        <Button className="w-full mt-4" disabled={!allComplete}>
          <Award className="mr-2 h-4 w-4" />
          Claim On-chain Badge
        </Button>
      </CardContent>
    </Card>
  );
}
