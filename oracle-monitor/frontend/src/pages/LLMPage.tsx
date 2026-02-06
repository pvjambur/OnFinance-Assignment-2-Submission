import { Zap, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { StatCard } from '@/components/StatCard';
import { LLMUsageChart } from '@/components/LLMUsageChart';
import { LLMModelCard } from '@/components/LLMModelCard';
import { mockLLMModels, mockTokenHistory } from '@/data/mockData';

const LLMPage = () => {
  // Calculate aggregate stats
  const totalTokens = mockLLMModels.reduce((sum, m) => sum + m.tpm, 0);
  const totalCredits = mockLLMModels.reduce((sum, m) => sum + (m.credits || 0), 0);
  
  // Estimate daily cost based on average token usage
  const estimatedDailyCost = mockLLMModels.reduce((sum, m) => {
    const inputCost = (m.cost_per_1k_input || 0) * (m.tpm / 1000) * 60 * 24 * 0.3; // 30% input
    const outputCost = (m.cost_per_1k_output || 0) * (m.tpm / 1000) * 60 * 24 * 0.7; // 70% output
    return sum + inputCost + outputCost;
  }, 0);

  // Calculate throttled requests (models at >80% RPM)
  const throttledModels = mockLLMModels.filter(m => (m.rpm / m.rpm_max) > 0.8).length;

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
              Cost and rate limit monitoring for {mockLLMModels.length} models
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
        <LLMUsageChart data={mockTokenHistory} />
      </div>

      {/* Model Cards Grid */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground mb-1">Model Status</h2>
        <p className="text-xs text-muted-deep">Real-time usage per model</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockLLMModels.map((model) => (
          <LLMModelCard key={model.model} model={model} />
        ))}
      </div>
    </MainLayout>
  );
};

export default LLMPage;
