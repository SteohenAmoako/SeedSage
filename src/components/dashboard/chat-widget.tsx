"use client";

import * as React from 'react';
import { Bot, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { getChatResponseAction } from '@/app/actions';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useWallet } from '@/hooks/use-wallet';

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Welcome to SeedSage! I'm here to help you with Stacks. How can I assist you today? Try asking 'How do I send tokens?' or 'Explain my last transaction'.",
  },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { user, transactions } = useWallet();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user || !user.balance || !transactions) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    // Determine intent (simple keyword matching for demo)
    let intent_type: 'ask_question' | 'explain_tx' = 'ask_question';
    if (input.toLowerCase().includes('explain') && (input.toLowerCase().includes('transaction') || input.toLowerCase().includes('tx'))) {
      intent_type = 'explain_tx';
    }
    
    const lastTx = transactions[0];
    const balanceBefore = parseFloat(user.balance.stx.balance);
    const balanceAfter = balanceBefore - ( (lastTx?.tx_type === 'token_transfer' ? parseFloat(lastTx.token_transfer.amount) : 0) + parseFloat(lastTx.fee_rate) );

    const context = {
        address: user.address,
        network: user.network,
        balance_before: balanceBefore / 1_000_000,
        balance_after: balanceAfter / 1_000_000,
        txid: lastTx.tx_id,
        from: lastTx.sender_address,
        to: lastTx.tx_type === 'token_transfer' ? lastTx.token_transfer.recipient_address : 'N/A',
        amount: lastTx.tx_type === 'token_transfer' ? parseFloat(lastTx.token_transfer.amount) / 1_000_000 : 0,
        fee: parseFloat(lastTx.fee_rate) / 1_000_000,
        memo: lastTx.tx_type === 'token_transfer' ? lastTx.token_transfer.memo : '',
        intent_type,
        message: input,
    };

    const result = await getChatResponseAction(context);
    setIsLoading(false);

    if(result.success && result.data) {
        const newAssistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: result.data.human,
            meta: result.data.meta,
        };
        setMessages(prev => [...prev, newAssistantMessage]);
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Could not get response from AI assistant.',
        });
        setMessages(prev => prev.slice(0, -1)); // remove user message on error
    }
  };

  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
             viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages, isOpen]);
  
  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">Open Chat</span>
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>SeedSage AI Assistant</SheetTitle>
            <SheetDescription>
              Ask me anything about Stacks, wallets, and transactions.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
             <div className="space-y-4 py-4">
                {messages.map(msg => (
                    <div key={msg.id} className={cn("flex items-start gap-3", msg.role === 'user' && 'justify-end')}>
                        {msg.role === 'assistant' && (
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback><Bot size={16} /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("rounded-lg p-3 max-w-[80%] text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                            <div className="prose prose-sm text-foreground" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />

                            {msg.meta?.risk_level && (
                              <div className="mt-2">
                                <Badge 
                                  variant={msg.meta.risk_level === 'Low' ? 'default' : 'destructive'} 
                                  className={cn(
                                    "font-semibold",
                                    msg.meta.risk_level === 'Low' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                    msg.meta.risk_level === 'Medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                                    msg.meta.risk_level === 'High' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                  )}
                                >
                                  {msg.meta.risk_level}
                                </Badge>
                              </div>
                            )}
                        </div>
                         {msg.role === 'user' && (
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src="https://picsum.photos/seed/user-avatar/32/32" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border">
                           <AvatarFallback><Bot size={16} /></AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 bg-secondary">
                           <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>
          <div className="p-4 bg-background border-t">
            <form onSubmit={handleSubmit} className="w-full relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask SeedSage..."
                className="pr-12"
                disabled={isLoading || !user}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim() || !user}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
