"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/hooks/use-wallet";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfile } from "@/services/profile";
import { saveProfileAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user, disconnect } = useWallet();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [username, setUsername] = React.useState('');
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function fetchProfile() {
      if (user?.address) {
        setIsLoadingProfile(true);
        const profile = await getProfile(user.address);
        if (profile?.username) {
          setUsername(profile.username);
        }
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [user?.address]);

  const handleSaveProfile = async () => {
    if (!user?.address) return;
    setIsSaving(true);
    const result = await saveProfileAction(user.address, { username });
    setIsSaving(false);
    
    if (result.success) {
      toast({
        title: "Profile Saved",
        description: "Your username has been updated.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error || "Could not save your profile. Please try again.",
      });
    }
  };


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
            This username will be associated with your wallet address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingProfile ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="Satoshi" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input value={user.address} readOnly disabled />
          </div>
           <div className="space-y-2">
            <Label>Network</Label>
            <Input value={user.network} readOnly disabled />
          </div>
           <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
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
