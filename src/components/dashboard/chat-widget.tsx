"use client";

import * as React from 'react';
import { Bot, Send, Loader2, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { getChatResponseAction } from '@/app/actions';
import { mockUser, mockTransactions } from '@/lib/mock-data';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    // Determine intent (simple keyword matching for demo)
    let intent_type: 'ask_question' | 'explain_tx' = 'ask_question';
    if (input.toLowerCase().includes('explain') && input.toLowerCase().includes('transaction')) {
      intent_type = 'explain_tx';
    }
    
    const lastTx = mockTransactions[0];
    const context = {
        address: mockUser.address,
        network: mockUser.network,
        balance_before: mockUser.balance.stx.balance,
        balance_after: mockUser.balance.stx.balance - (lastTx.amount + lastTx.fee), // Simplified
        txid: lastTx.txid,
        from: lastTx.from,
        to: lastTx.to,
        amount: lastTx.amount,
        fee: lastTx.fee,
        memo: lastTx.memo,
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
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
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
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.meta?.risk_level && (
                              <div className="mt-2">
                                <Badge variant={msg.meta.risk_level === 'Low' ? 'default' : 'destructive'} className="bg-accent">{msg.meta.risk_level}</Badge>
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
          <SheetFooter className="p-4 bg-background border-t">
            <form onSubmit={handleSubmit} className="w-full relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask SeedSage..."
                className="pr-12"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
