"use client";

import { ThemeProvider } from "next-themes";
import { WalletProvider } from "./wallet-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <WalletProvider>
                {children}
            </WalletProvider>
        </ThemeProvider>
    )
}
