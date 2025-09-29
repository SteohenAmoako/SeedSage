"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, disconnect } = useWallet();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="Satoshi" defaultValue="Satoshi" />
             <p className="text-xs text-muted-foreground">Profile data is not saved in this demo.</p>
          </div>
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input value={user.address} readOnly disabled />
          </div>
           <div className="space-y-2">
            <Label>Network</Label>
            <Input value={user.network} readOnly disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                <div className="flex gap-4">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                </div>
            </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Manage your wallet and application data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="destructive" onClick={disconnect}>Disconnect Wallet</Button>
            <p className="text-sm text-muted-foreground">
                This will disconnect your wallet from SeedSage. You can always connect again later.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}
