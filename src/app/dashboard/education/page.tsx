import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Shield, Wallet, Layers } from "lucide-react";
import Link from "next/link";

const educationResources = [
  {
    title: "Understanding Seed Phrases",
    description: "The master key to your crypto. Learn why it's so important and how to keep it safe.",
    icon: Shield,
    link: "https://www.coinbase.com/learn/crypto-basics/what-is-a-seed-phrase"
  },
  {
    title: "What is Stacks?",
    description: "Discover how Stacks brings smart contracts and decentralized applications to Bitcoin.",
    icon: Layers,
    link: "https://docs.stacks.co/understand-stacks/overview"
  },
  {
    title: "Choosing a Stacks Wallet",
    description: "Explore the different wallet options available in the Stacks ecosystem.",
    icon: Wallet,
    link: "https://stacks.org/wallet"
  },
  {
    title: "Intro to Decentralized Apps (dApps)",
    description: "Learn what dApps are and how they differ from traditional web applications.",
    icon: BookOpen,
    link: "https://ethereum.org/en/dapps/"
  }
];


export default function EducationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Education Hub</h1>
        <p className="text-muted-foreground mt-2">
          Expand your knowledge about Stacks, crypto security, and the decentralized web.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {educationResources.map(resource => (
          <Card key={resource.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <resource.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription className="pt-1">{resource.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                Learn More &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
