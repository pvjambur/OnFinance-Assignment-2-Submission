import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am Oracle. I can analyze the live system snapshot for you. Ask me anything about agents, queues, or errors.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        const response = await api.queryChatbot(userMsg);

        setLoading(false);
        if (response) {
            setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the Oracle API. Please check your backend connection." }]);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Bot size={18} className="text-primary" />
                            </div>
                            <h3 className="font-semibold text-sm">Oracle Assistant</h3>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X size={16} />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn(
                                    "flex gap-3 text-sm",
                                    msg.role === 'user' ? "justify-end" : "justify-start"
                                )}>
                                    {msg.role === 'assistant' && (
                                        <div className="h-6 w-6 mt-0.5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Bot size={12} className="text-primary" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "rounded-lg px-3 py-2 max-w-[85%]",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="h-6 w-6 mt-0.5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Bot size={12} className="text-primary" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-3 py-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-3 border-t border-border bg-card">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about system health..."
                                className="flex-1 text-sm h-9"
                            />
                            <Button type="submit" size="icon" className="h-9 w-9" disabled={loading}>
                                <Send size={14} />
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </Button>
        </div>
    );
};

export default ChatWidget;
