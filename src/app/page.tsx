import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Bot, Zap, BookOpen } from "lucide-react";
import { Logo } from "@/components/icons";
import { WalletConnectButton } from "@/components/wallet-connect-button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">SeedSage</h1>
        </div>
        <WalletConnectButton />
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight text-foreground">
              Welcome to Stacks with Confidence
            </h1>
            <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              SeedSage is your friendly AI assistant for a smooth and secure start in the Stacks ecosystem. Understand transactions, master security, and explore with ease.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <WalletConnectButton />
            </div>
          </div>
        </section>

        <section className="bg-secondary py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold font-headline text-center mb-12">Why SeedSage?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Seed Phrase Education"
                description="Learn the fundamentals of crypto security from day one. We guide you without ever seeing your secrets."
              />
              <FeatureCard
                icon={<Bot className="h-8 w-8" />}
                title="AI Transaction Explainer"
                description="No more confusing transaction hashes. Get simple, human-readable summaries of your on-chain activity."
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="Onboarding Missions"
                description="Engaging tasks to familiarize you with the Stacks ecosystem, from sending tokens to exploring dApps."
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="On-Chain Badges"
                description="Complete your onboarding and mint a special badge on the Stacks testnet to mark your achievement."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:_px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SeedSage. Made for the Stacks hackathon — testnet only.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="text-center bg-card">
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="mt-4 font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
