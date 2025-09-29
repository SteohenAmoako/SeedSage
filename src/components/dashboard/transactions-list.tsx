"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { StacksTransaction } from "@/lib/types";
import { TransactionExplainer } from '@/components/transaction-explainer';
import { ArrowDownLeft, ArrowUpRight, FileText, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<string, JSX.Element> = {
  token_transfer: <ArrowUpRight className="h-4 w-4 text-red-500" />,
  contract_call: <FileText className="h-4 w-4 text-blue-500" />,
};

const typeLabels: Record<string, string> = {
  token_transfer: 'Token Transfer',
  contract_call: 'Contract Call'
}

export function TransactionsList({ transactions }: { transactions: StacksTransaction[] }) {
  const [selectedTx, setSelectedTx] = React.useState<StacksTransaction | null>(null);

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
          {transactions.length > 0 ? (
            <ul className="space-y-4">
              {transactions.map(tx => (
                <li key={tx.tx_id} onClick={() => setSelectedTx(tx)} className="cursor-pointer group">
                  <div className="flex items-center gap-4 p-2 rounded-lg group-hover:bg-accent/50 transition-colors">
                    <div className="p-2 bg-secondary rounded-full">
                      {tx.tx_type === 'token_transfer' && tx.token_transfer.recipient_address !== tx.sender_address ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : tx.tx_type === 'token_transfer' && tx.token_transfer.recipient_address === tx.sender_address ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      ) : (
                        typeIcons[tx.tx_type]
                      )}
                    </div>
                    <div className="flex-1 grid gap-1">
                      <div className="font-semibold">{typeLabels[tx.tx_type]}</div>
                      <p className="text-sm text-muted-foreground font-mono text-xs">
                        {tx.tx_type === 'token_transfer' ? `To: ${tx.token_transfer.recipient_address.substring(0, 10)}...` : `Contract: ${tx.contract_call.contract_id.split('.')[1].substring(0, 10)}...`}
                      </p>
                    </div>
                    <div className="text-right grid gap-1">
                      <div className="font-semibold">
                        {tx.tx_type === 'token_transfer' ?
                          `${tx.token_transfer.recipient_address !== tx.sender_address ? '-' : '+'} ${(parseFloat(tx.token_transfer.amount) / 1_000_000).toLocaleString()} STX` :
                          '0 STX'
                        }
                      </div>
                      <p className="text-sm text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(tx.burn_block_time * 1000), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-sm text-muted-foreground text-center py-8'>No transactions found for this address on the testnet.</p>
          )}

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
