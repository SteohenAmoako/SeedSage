"use client";

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Shield, Book, Loader2 } from "lucide-react";
import type { StacksTransaction } from "@/lib/types";
import { explainTransactionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { ExplainTransactionOutput } from '@/ai/flows/explain-stacks-transactions';
import { useWallet } from '@/hooks/use-wallet';

export function TransactionExplainer({ transaction, open, onOpenChange }: { transaction: StacksTransaction | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const { toast } = useToast();
  const { user } = useWallet();
  const [explanation, setExplanation] = React.useState<ExplainTransactionOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExplain = async () => {
    if (!transaction || !user) return;
    setIsLoading(true);
    setExplanation(null);

    const balanceBefore = parseFloat(user.balance.stx.balance);
    const amount = transaction.tx_type === 'token_transfer' ? parseFloat(transaction.token_transfer.amount) : 0;
    const fee = parseFloat(transaction.fee_rate);
    const balanceAfter = balanceBefore - (amount + fee);

    const input = {
      address: user.address,
      network: user.network,
      balance_before: balanceBefore / 1_000_000,
      balance_after: balanceAfter / 1_000_000,
      txid: transaction.tx_id,
      from: transaction.sender_address,
      to: transaction.tx_type === 'token_transfer' ? transaction.token_transfer.recipient_address : 'N/A',
      amount: amount / 1_000_000,
      fee: fee / 1_000_000,
      memo: transaction.tx_type === 'token_transfer' ? transaction.token_transfer.memo.replace('u', '') : '',
    };

    const result = await explainTransactionAction(input);
    setIsLoading(false);
    if (result.success && result.data) {
      setExplanation(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not get AI explanation.',
      });
    }
  };
  
  React.useEffect(() => {
    if (open && transaction && !explanation && !isLoading) {
      handleExplain();
    }
    if (!open) {
      setExplanation(null);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction]);

  if (!transaction) return null;
  
  const amount = transaction.tx_type === 'token_transfer' ? parseFloat(transaction.token_transfer.amount) / 1_000_000 : 0;
  const fee = parseFloat(transaction.fee_rate) / 1_000_000;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <ScrollArea className="h-full pr-6 -mr-6">
          <SheetHeader className="pr-6">
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              Review the details of this transaction.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4 pr-6">
            <InfoRow label="Transaction ID" value={transaction.tx_id} />
            <InfoRow label="From" value={transaction.sender_address} />
            {transaction.tx_type === 'token_transfer' && <InfoRow label="To" value={transaction.token_transfer.recipient_address} />}
            {transaction.tx_type === 'contract_call' && <InfoRow label="Contract" value={transaction.contract_call.contract_id} />}
            <InfoRow label="Amount" value={`${amount.toLocaleString()} STX`} />
            <InfoRow label="Fee" value={`${fee.toLocaleString()} STX`} />
            <InfoRow label="Timestamp" value={new Date(transaction.burn_block_time * 1000).toLocaleString()} />
            {transaction.tx_type === 'token_transfer' && transaction.token_transfer.memo && <InfoRow label="Memo" value={transaction.token_transfer.memo.replace('u', '')} />}
          </div>

          <Separator className="my-4" />

          {explanation && (
            <div className="space-y-6 pr-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><Bot className="w-5 h-5 text-primary" /> AI Explanation</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{explanation.human}</p>
              </div>

              {explanation.meta?.risk_level && (
                 <div>
                   <h4 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Risk Level</h4>
                   <Badge variant={explanation.meta.risk_level === 'Low' ? 'default' : 'destructive'} className="mt-2 bg-accent">{explanation.meta.risk_level}</Badge>
                 </div>
              )}
             
              {explanation.meta?.recommended_actions?.length > 0 && (
                 <div>
                   <h4 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4" /> Recommended Actions</h4>
                   <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
                     {explanation.meta.recommended_actions.map((action, i) => <li key={i}>{action}</li>)}
                   </ul>
                 </div>
              )}
              
              {explanation.meta?.references?.length > 0 && (
                 <div>
                   <h4 className="font-semibold flex items-center gap-2"><Book className="w-4 h-4" /> References</h4>
                   <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                     {explanation.meta.references.map((ref, i) => <li key={i}><a href={ref} target="_blank" rel="noopener noreferrer" className="text-primary underline">{ref}</a></li>)}
                   </ul>
                 </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-4">SeedSage is thinking...</p>
            </div>
          )}

          {!explanation && !isLoading && (
            <div className="pr-6">
              <Button onClick={handleExplain} className="w-full">
                <Bot className="mr-2 h-4 w-4" /> Get AI Explanation
              </Button>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="col-span-2 text-sm font-mono break-all">{value}</p>
    </div>
  )
}
