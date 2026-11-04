import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Search, AlertTriangle, CheckCircle2, 
  TrendingDown, Layers, Settings, User, Calendar, 
  Zap, Briefcase, Clock, ChevronRight, Loader2
} from 'lucide-react';
import { ClientService } from '@/services/client.service';
import { getApiErrorMessage } from '@/utils/errors';
import type { ClientAnalysisResponse } from '@/types';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'react-router-dom';

export function AIAnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('query') || 'Give me churn analysis for Yardworx Land Management';
  const runParam = searchParams.get('run') === 'true';

  const [query, setQuery] = React.useState(queryParam);
  const [loading, setLoading] = React.useState(false);
  const [showProcessingMessage, setShowProcessingMessage] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [result, setResult] = React.useState<ClientAnalysisResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (runParam && queryParam) {
      // Clear search params after triggering so refreshing doesn't loop
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('run');
      setSearchParams(newParams);

      const trigger = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
          const data = await ClientService.runAnalysis(queryParam);
          setResult(data);
        } catch (err) {
          setError(getApiErrorMessage(err));
        } finally {
          setLoading(false);
        }
      };
      trigger();
    }
  }, [runParam, queryParam]);

  const pipelineSteps = [
    "Extracting client profile using Groq...",
    "Querying Google Sheets and Supabase...",
    "Computing RAG Vector Embeddings...",
    "Retrieving similar historical accounts...",
    "Analyzing churn factors with Llama-3...",
    "Generating actionable recommendations..."
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;
    if (loading) {
      setStep(0);
      setShowProcessingMessage(false);
      interval = setInterval(() => {
        setStep((prev) => {
          if (prev < pipelineSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 3500);
      timer = setTimeout(() => {
        setShowProcessingMessage(true);
      }, 12000); // 12 seconds
    }
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [loading]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await ClientService.runAnalysis(query);
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12 px-4 md:px-6">
      {/* Page Header */}
      <div>
        <h1 className="text-heading-2 font-bold tracking-tight text-foreground">AI Intelligence Hub</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Perform real-time RAG-powered churn analysis and trigger automated retention recommendations.
        </p>
      </div>

      {/* Input Query Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-card p-6 bg-card/60 backdrop-blur-md border"
      >
        <form onSubmit={handleRun} className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              className="w-full bg-secondary/40 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary rounded-xl py-3 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition"
              placeholder="e.g. Give me churn analysis for Yardworx Land Management"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            variant="primary" 
            className="rounded-xl px-8" 
            isLoading={loading}
            leftIcon={<Brain className="h-4 w-4" />}
          >
            Analyze Risk
          </Button>
        </form>
      </motion.div>

      {/* Pipeline execution loader */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="section-card p-8 border border-primary/20 bg-primary/5 flex flex-col items-center justify-center min-h-[300px]"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">RAG Pipeline Active</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {showProcessingMessage ? "AI workflow is processing (fetching Google Sheets, computing vector similarity search, and running Groq LLM reasoning)..." : "Orchestrating backend agent nodes..."}
            </p>
            
            {/* Step list indicator */}
            <div className="w-full max-w-md space-y-3">
              {pipelineSteps.map((text, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    idx === step ? 'bg-primary animate-ping' : idx < step ? 'bg-success' : 'bg-border'
                  }`} />
                  <span className={`text-xs font-medium transition-colors duration-300 ${
                    idx === step ? 'text-foreground font-bold' : idx < step ? 'text-muted-foreground/80' : 'text-muted-foreground/40'
                  }`}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error View */}
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="section-card p-6 border-danger/20 bg-danger/5 flex items-start gap-4"
        >
          <AlertTriangle className="h-6 w-6 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-danger">Analysis Failed</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results View */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Panel: Client Profile details */}
              <div className="section-card p-6 lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {result.client?.campaign_status || "Active Campaign"}
                    </span>
                    <h2 className="text-2xl font-bold text-foreground mt-2">{result.client?.name || "Unknown Client"}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Client ID</span>
                    <p className="text-sm font-mono font-bold">{result.client?.id || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1">Program Type</span>
                    <span className="text-sm font-bold text-foreground">{result.client?.program_type || "Standard"}</span>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1">Duration</span>
                    <span className="text-sm font-bold text-foreground">{result.client?.program_duration || "12 Months"}</span>
                  </div>
                  <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                    <span className="text-xs text-muted-foreground block mb-1">Stage</span>
                    <span className="text-sm font-bold text-foreground">{result.client?.program_stage || "Onboarding"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" /> AI Risk Summary
                  </h3>
                  <div className="bg-secondary/10 p-5 rounded-xl border border-border/40">
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {result.summary?.text || "No summary text generated."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel: Churn Score Gauge */}
              <div className="section-card p-6 flex flex-col items-center justify-center text-center space-y-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Churn Risk Gauge</h3>
                
                {/* Radial Indicator */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-muted/20"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="68"
                      className={`${
                        (result.churn?.probability || 0) > 70 ? 'stroke-danger' : 
                        (result.churn?.probability || 0) > 40 ? 'stroke-warning' : 'stroke-success'
                      }`}
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 68}
                      initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - (result.churn?.probability || 0) / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-foreground">{Math.round(result.churn?.probability || 0)}%</span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Probability</span>
                  </div>
                </div>

                <div className="w-full">
                  <div className="bg-secondary/30 rounded-xl px-4 py-2.5 flex items-center justify-between border">
                    <span className="text-xs text-muted-foreground">Risk Level</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      result.churn?.risk_level === 'critical' ? 'text-danger' :
                      result.churn?.risk_level === 'high' ? 'text-danger' :
                      result.churn?.risk_level === 'medium' ? 'text-warning' : 'text-success'
                    }`}>{result.churn?.risk_level || "low"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Red Flags & Action Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Red Flags */}
              <div className="section-card p-6 border-danger/10 bg-danger/5">
                <h3 className="text-sm font-bold text-danger flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-4 w-4" /> Detected Flags & Bottlenecks
                </h3>
                <ul className="space-y-2.5">
                  {result.churn?.red_flags?.map((flag, idx) => (
                    <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                  {result.churn?.bottlenecks?.map((bot, idx) => (
                    <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                      <span>{bot}</span>
                    </li>
                  ))}
                  {(!result.churn?.red_flags?.length && !result.churn?.bottlenecks?.length) && (
                    <span className="text-xs text-muted-foreground italic">No critical anomalies flag.</span>
                  )}
                </ul>
              </div>

              {/* Action recommendations */}
              <div className="section-card p-6 border-success/10 bg-success/5">
                <h3 className="text-sm font-bold text-success flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4" /> Automated Action Playbook
                </h3>
                <ul className="space-y-2.5">
                  {result.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                  {!result.recommendations?.length && (
                    <span className="text-xs text-muted-foreground italic">No immediate action required.</span>
                  )}
                </ul>
              </div>

            </div>

            {/* Historical Similarity search matches */}
            <div className="section-card p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> RAG Similarity Context
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.historical_context?.historical_matches?.map((match, idx) => (
                  <div key={idx} className="bg-secondary/20 p-4 rounded-xl border border-border/50 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{match.client_name || "Similar Account"}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Outcome: <span className="font-bold text-primary uppercase">{match.outcome || "retained"}</span></p>
                    </div>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                      {Math.round(match.similarity_score * 100 || 85)}% Match
                    </span>
                  </div>
                ))}
                {!result.historical_context?.historical_matches?.length && (
                  <span className="text-xs text-muted-foreground italic">No historical matches indexed.</span>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default AIAnalysisPage;