"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { List } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { TransactionExplainer } from '@/components/transaction-explainer';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  send: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  receive: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
  contract_call: <FileText className="h-4 w-4 text-blue-500" />,
};

const typeLabels = {
  send: 'Send',
  receive: 'Receive',
  contract_call: 'Contract Call'
}

export function TransactionsList({ transactions }: { transactions: Transaction[] }) {
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Click on a transaction to see details and get an AI explanation.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {transactions.map(tx => (
              <li key={tx.txid} onClick={() => setSelectedTx(tx)} className="cursor-pointer group">
                <div className="flex items-center gap-4 p-2 rounded-lg group-hover:bg-accent/50 transition-colors">
                  <div className="p-2 bg-secondary rounded-full">
                    {typeIcons[tx.type]}
                  </div>
                  <div className="flex-1 grid gap-1">
                    <div className="font-semibold">{typeLabels[tx.type]}</div>
                    <p className="text-sm text-muted-foreground font-mono text-xs">{tx.type === 'send' ? `To: ${tx.to.substring(0, 10)}...` : `From: ${tx.from.substring(0, 10)}...`}</p>
                  </div>
                  <div className="text-right grid gap-1">
                    <div className="font-semibold">{tx.type === 'send' ? '-' : '+'}{tx.amount.toLocaleString()} STX</div>
                    <p className="text-sm text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <TransactionExplainer
        transaction={selectedTx}
        open={!!selectedTx}
        onOpenChange={(isOpen) => !isOpen && setSelectedTx(null)}
      />
    </>
  );
}
