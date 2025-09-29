import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from '@/components/app-providers';
import { PT_Sans, Source_Code_Pro } from "next/font/google"
import { cn } from '@/lib/utils';

const fontSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

const fontMono = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: 'SeedSage - Your AI Onboarding Assistant for Stacks',
  description: 'SeedSage is your friendly AI assistant for a smooth and secure start in the Stacks ecosystem. Understand transactions, master security, and explore the decentralized web with confidence.',
  openGraph: {
    title: 'SeedSage - Your AI Onboarding Assistant for Stacks',
    description: 'The first step into the Stacks ecosystem, made simple and secure. Learn, explore, and unlock the Bitcoin economy with your AI-powered guide.',
    url: 'https://seedsage.app', // Replace with your actual domain
    siteName: 'SeedSage',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1600', // A relevant, high-quality image
        width: 1600,
        height: 900,
        alt: 'SeedSage social sharing banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeedSage - Your AI Onboarding Assistant for Stacks',
    description: 'The first step into the Stacks ecosystem, made simple and secure. Learn, explore, and unlock the Bitcoin economy with your AI-powered guide.',
    images: ['https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1600'], // A relevant, high-quality image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
