import { useState, useEffect } from 'react';
import { Zap, DollarSign, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { StatCard } from '@/components/StatCard';
import { LLMUsageChart } from '@/components/LLMUsageChart';
import { LLMModelCard } from '@/components/LLMModelCard';
import { api } from '@/services/api';
import type { LLMModel } from '@/types';

const LLMPage = () => {
  const [llmModels, setLlmModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);
  // Simulating history locally for the session since backend doesn't provide time-series yet
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await api.getLatestSnapshot();
      if (snapshot && snapshot.litellm) {
        setLlmModels(snapshot.litellm);
      }
      setLoading(false);
    };

    fetchData();

    const subscription = api.subscribeToSnapshots((snapshot) => {
      if (snapshot && snapshot.litellm) {
        setLlmModels(snapshot.litellm);

        // Add new data point to history
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newPoint: any = { time: timeLabel };
        snapshot.litellm.forEach(m => {
          newPoint[m.provider] = (newPoint[m.provider] || 0) + m.tpm;
        });

        setTokenHistory(prev => {
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 20) return newHistory.slice(-20); // Keep last 20 points
          return newHistory;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Calculate aggregate stats
  const totalTokens = llmModels.reduce((sum, m) => sum + m.tpm, 0);
  const totalCredits = llmModels.reduce((sum, m) => sum + (m.credits || 0), 0);

  // Estimate daily cost based on average token usage
  const estimatedDailyCost = llmModels.reduce((sum, m) => {
    const inputCost = (m.cost_per_1k_input || 0) * (m.tpm / 1000) * 60 * 24 * 0.3; // 30% input
    const outputCost = (m.cost_per_1k_output || 0) * (m.tpm / 1000) * 60 * 24 * 0.7; // 70% output
    return sum + inputCost + outputCost;
  }, 0);

  // Calculate throttled requests (models at >80% RPM)
  const throttledModels = llmModels.filter(m => (m.rpm / m.rpm_max) > 0.8).length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavender" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-lavender/10 rounded-lg border border-lavender/20">
            <Zap size={20} className="text-lavender" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              LLM Nexus
            </h1>
            <p className="text-sm text-muted-deep">
              Cost and rate limit monitoring for {llmModels.length} models
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Tokens/Min"
          value={`${(totalTokens / 1000).toFixed(0)}K`}
          icon={<Zap />}
          trend="up"
          color="lavender"
        />
        <StatCard
          label="Est. Daily Cost"
          value={`$${estimatedDailyCost.toFixed(2)}`}
          icon={<DollarSign />}
          trend="stable"
          color="amber"
        />
        <StatCard
          label="Throttled Models"
          value={throttledModels}
          icon={<AlertTriangle />}
          alert={throttledModels > 0}
          color="coral"
        />
        <StatCard
          label="Credits Remaining"
          value={totalCredits.toLocaleString()}
          icon={<TrendingUp />}
          trend="stable"
          color="mint"
        />
      </div>

      {/* Token Usage Chart */}
      <div className="mb-8">
        <LLMUsageChart data={tokenHistory.length > 0 ? tokenHistory : [{ time: 'Now', openai: 0, anthropic: 0, google: 0 }]} />
      </div>

      {/* Model Cards Grid */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">Model Status</h2>
        <p className="text-xs text-muted-deep">Real-time usage per model</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {llmModels.map((model) => (
          <LLMModelCard key={model.model} model={model} />
        ))}
      </div>
    </MainLayout>
  );
};

export default LLMPage;
