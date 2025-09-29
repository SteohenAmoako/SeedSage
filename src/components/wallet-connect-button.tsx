"use client";

import { Button } from "./ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function WalletConnectButton() {
    const { connect, isConnecting, isConnected } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (isConnected && !isConnecting) {
            router.push('/dashboard');
        }
    }, [isConnected, isConnecting, router]);

    if (isConnected) {
        return (
            <Button onClick={() => router.push('/dashboard')} size="lg" className="font-bold">
                Go to Dashboard
            </Button>
        )
    }

    return (
        <Button onClick={connect} disabled={isConnecting} size="lg" className="font-bold">
            {isConnecting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
    )
}
