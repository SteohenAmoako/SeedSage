"use client";

import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Shield, Book, Loader2 } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { mockUser } from '@/lib/mock-data';
import { explainTransactionAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { ExplainTransactionOutput } from '@/ai/flows/explain-stacks-transactions';

export function TransactionExplainer({ transaction, open, onOpenChange }: { transaction: Transaction | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const { toast } = useToast();
  const [explanation, setExplanation] = React.useState<ExplainTransactionOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExplain = async () => {
    if (!transaction) return;
    setIsLoading(true);
    setExplanation(null);

    const input = {
      address: mockUser.address,
      network: mockUser.network,
      balance_before: mockUser.balance.stx.balance,
      balance_after: mockUser.balance.stx.balance - (transaction.amount + transaction.fee), // Simplified
      txid: transaction.txid,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      fee: transaction.fee,
      memo: transaction.memo || '',
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
    if (!open) {
      setExplanation(null);
      setIsLoading(false);
    }
  }, [open]);

  if (!transaction) return null;

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
            <InfoRow label="Transaction ID" value={transaction.txid} />
            <InfoRow label="From" value={transaction.from} />
            <InfoRow label="To" value={transaction.to} />
            <InfoRow label="Amount" value={`${transaction.amount.toLocaleString()} STX`} />
            <InfoRow label="Fee" value={`${transaction.fee.toLocaleString()} STX`} />
            <InfoRow label="Timestamp" value={new Date(transaction.timestamp).toLocaleString()} />
            {transaction.memo && <InfoRow label="Memo" value={transaction.memo} />}
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
                <Bot className="mr-2 h-4 w-4" /> Explain with AI
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
