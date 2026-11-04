import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowUp, LoaderCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/utils';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AgentResponse {
  success?: boolean;
  message?: string;
  detail?: string;
}

const WELCOME_PROMPTS = [
  'Which clients have the highest churn risk?',
  "Summarize last month's performance",
  'Show me workflow failures from today',
];

export function FloatingAIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<AIMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, [open]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, loading, error]);

  const sendMessage = async (question?: string) => {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    const userMessage: AIMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      // The frontend web server should proxy /api requests to FastAPI.
      const response = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data: AgentResponse = await response
        .json()
        .catch(() => ({} as AgentResponse));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            `Request failed with status ${response.status}`,
        );
      }

      if (data.success === false) {
        throw new Error(
          data.message || 'The AI Agent could not answer this question.',
        );
      }

      if (typeof data.message !== 'string' || !data.message.trim()) {
        throw new Error('The server returned an empty AI response.');
      }

      const assistantMessage: AIMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      console.error('AI Agent request failed:', err);
      setError(
        err instanceof TypeError
          ? 'Unable to reach the AI Agent. Check your connection and try again.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0, 0, 1] }}
            className={cn(
              // Larger responsive popup, while remaining anchored bottom-right.
              'fixed bottom-[84px] right-3 sm:right-6 z-50',
              'w-[min(92vw,40rem)] max-h-[calc(100dvh-7rem)]',
              'flex flex-col section-card overflow-hidden',
              'shadow-xl',
            )}
            style={{
              boxShadow:
                '0 20px 60px -10px rgb(0 0 0 / 0.15), 0 8px 20px -8px rgb(0 0 0 / 0.1)',
            }}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Customer Churn Predictor AI
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight mt-1">
                    {loading ? 'Thinking...' : 'Ask me anything'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat messages */}
            <div
              className="min-h-0 h-[min(32rem,55vh)] overflow-y-auto overscroll-contain px-4 py-4 bg-secondary/30"
              aria-live="polite"
              aria-label="AI conversation"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col items-center justify-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      Ask Customer Churn Predictor AI
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get insights about your clients and workflows.
                    </p>
                  </div>

                  <div className="w-full space-y-2">
                    {WELCOME_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={loading}
                        onClick={() => void sendMessage(prompt)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-lg text-sm font-medium',
                          'text-muted-foreground hover:text-foreground',
                          'bg-card border border-border hover:border-primary/30 hover:bg-primary/5',
                          'transition-all duration-150 disabled:opacity-50',
                        )}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-2.5',
                        message.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}

                      <div
                        className={cn(
                          'max-w-[92%] min-w-0 rounded-xl px-4 py-3 text-sm leading-relaxed',
                          message.role === 'user'
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-card border border-border text-foreground rounded-tl-none',
                        )}
                      >
                        {message.role === 'assistant' ? (
                          <div
                            className={cn(
                              'min-w-0 break-words',
                              '[&_p]:mb-3 [&_p:last-child]:mb-0',
                              '[&_strong]:font-semibold',
                              '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
                              '[&_li]:my-1.5',
                              // Keep wide Markdown tables readable and horizontally scrollable.
                              '[&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-xs [&_table]:border-collapse',
                              '[&_thead]:bg-secondary/70',
                              '[&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-left [&_th]:whitespace-nowrap',
                              '[&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
                              '[&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border',
                              '[&_code]:break-words',
                              '[&_a]:text-primary [&_a]:underline',
                            )}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Analyzing your data...</span>
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="ml-9 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                      {error}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 px-4 py-4 border-t border-border bg-card"
            >
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg bg-secondary border border-border px-3 h-11',
                  'focus-within:border-primary/50 focus-within:ring-[3px] focus-within:ring-primary/10',
                  'transition-all duration-150',
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask anything..."
                  aria-label="Ask AI assistant"
                  disabled={loading}
                  className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
                    'transition-all duration-150',
                    input.trim() && !loading
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground/60 text-center mt-3">
                AI is for guidance only. Verify decisions independently.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Ask Customer Churn Predictor AI"
        title="Ask Customer Churn Predictor AI"
        whileTap={{ scale: 0.93 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -60, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 60, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 60, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -60, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

export default FloatingAIAssistant;
