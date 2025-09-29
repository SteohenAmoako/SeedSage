"use client";

import { Button } from "./ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Loader2 } from "lucide-react";

export function WalletConnectButton() {
    const { connect, isConnecting } = useWallet();

    return (
        <Button onClick={connect} disabled={isConnecting} size="lg" className="font-bold">
            {isConnecting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
    )
}
