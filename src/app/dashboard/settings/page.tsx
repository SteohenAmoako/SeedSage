import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { mockUser } from "@/lib/mock-data";

export default function SettingsPage() {
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
          </div>
          <div className="space-y-2">
            <Label>Wallet Address</Label>
            <Input value={mockUser.address} readOnly disabled />
          </div>
           <div className="space-y-2">
            <Label>Network</Label>
            <Input value={mockUser.network} readOnly disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application. (Functionality not implemented)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                <div className="flex gap-4">
                    <Button variant="outline">Light</Button>
                    <Button variant="outline">Dark</Button>
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
            <Button variant="destructive">Disconnect Wallet</Button>
            <p className="text-sm text-muted-foreground">
                This will disconnect your wallet from SeedSage. You can always connect again later.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}
