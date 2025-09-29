import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Bot, Zap, BookOpen, Shield, Layers } from "lucide-react";
import { Logo } from "@/components/icons";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between animate-fade-in-down">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">SeedSage</h1>
        </Link>
        <div className="flex items-center gap-4">
          <WalletConnectButton />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
             <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary mb-4">
              Unlock the Bitcoin Economy with Stacks
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight text-foreground">
              Your First Step into Stacks, Made Simple.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              SeedSage is your friendly AI assistant for a smooth and secure start in the Stacks ecosystem. Understand transactions, master security, and explore the decentralized web with confidence.
            </p>
            <div className="mt-8 flex justify-center">
              <WalletConnectButton />
            </div>
          </div>
        </section>

        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">A Smarter Way to Get Started</h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">SeedSage is more than just a wallet. It's an interactive learning experience designed for safety and clarity.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Security-First Onboarding"
                description="Learn the fundamentals of seed phrases and wallet security in a guided wizard before you even connect."
                delay={100}
              />
              <FeatureCard
                icon={<Bot className="h-8 w-8" />}
                title="AI-Powered Clarity"
                description="Get simple, human-readable summaries of your on-chain activity and ask questions to our context-aware AI assistant."
                delay={200}
              />
              <FeatureCard
                icon={<Zap className="h-8 w-8" />}
                title="Learn by Doing"
                description="Complete gamified missions to familiarize yourself with Stacks, from sending tokens to interacting with smart contracts."
                delay={300}
              />
              <FeatureCard
                icon={<Layers className="h-8 w-8" />}
                title="Built on Stacks"
                description="Directly interact with the Stacks blockchain, from fetching live data to claiming an on-chain NFT badge."
                delay={400}
              />
               <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Curated Education"
                description="Access a hand-picked list of high-quality resources to continue your learning journey in the ecosystem."
                delay={500}
              />
              <FeatureCard
                icon={<CheckCircle className="h-8 w-8" />}
                title="Hackathon Ready"
                description="Built to showcase how AI can accelerate dApp development on Stacks, fulfilling the Vibe Coding vision."
                delay={600}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SeedSage. Built for the Stacks Vibe Coding Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) {
  return (
    <Card 
      className="text-center bg-card shadow-sm hover:shadow-lg transition-shadow duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader>
        <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit">
          {icon}
        </div>
        <CardTitle className="mt-4 font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
