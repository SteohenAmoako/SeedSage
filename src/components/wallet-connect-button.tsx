
"use client";

import { Button } from "./ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function WalletConnectButton() {
    const { connect, isConnecting, isConnected } = useWallet();
    const router = useRouter();

    const handleConnect = () => {
        connect(() => {
            router.push('/dashboard');
        });
    }

    useEffect(() => {
        if(isConnected) {
            router.push('/dashboard');
        }
    }, [isConnected, router]);


    return (
        <Button onClick={handleConnect} disabled={isConnecting} size="lg" className="font-bold">
            {isConnecting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
    )
}
