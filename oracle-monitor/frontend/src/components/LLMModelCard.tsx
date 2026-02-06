import { Zap, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LLMModel } from '@/types';

interface LLMModelCardProps {
  model: LLMModel;
}

export function LLMModelCard({ model }: LLMModelCardProps) {
  const tpmPercent = (model.tpm / model.tpm_max) * 100;
  const rpmPercent = (model.rpm / model.rpm_max) * 100;

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'bg-primary';
    if (percent >= 70) return 'bg-secondary';
    return 'bg-accent';
  };

  const getUsageTextColor = (percent: number) => {
    if (percent >= 90) return 'text-primary';
    if (percent >= 70) return 'text-secondary';
    return 'text-accent';
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'anthropic':
        return 'bg-lavender/10 text-lavender border-lavender/20';
      case 'google':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      default:
        return 'bg-muted/10 text-muted border-muted/20';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 border border-border hover:border-border-strong transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground mb-1">{model.model}</h3>
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
              getProviderColor(model.provider)
            )}
          >
            {model.provider}
          </span>
        </div>
        {model.payment_type && (
          <span
            className={cn(
              "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
              model.payment_type === 'free'
                ? 'bg-accent/10 text-accent'
                : 'bg-lavender/10 text-lavender'
            )}
          >
            {model.payment_type}
          </span>
        )}
      </div>

      {/* TPM Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-deep flex items-center gap-1">
            <Zap size={12} />
            Tokens/min
          </span>
          <span className={cn("text-xs font-bold", getUsageTextColor(tpmPercent))}>
            {(model.tpm / 1000).toFixed(1)}K / {(model.tpm_max / 1000).toFixed(0)}K
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getUsageColor(tpmPercent))}
            style={{ width: `${Math.min(tpmPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* RPM Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-deep flex items-center gap-1">
            <Activity size={12} />
            Requests/min
          </span>
          <span className={cn("text-xs font-bold", getUsageTextColor(rpmPercent))}>
            {model.rpm} / {model.rpm_max}
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", getUsageColor(rpmPercent))}
            style={{ width: `${Math.min(rpmPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Cost Info */}
      {model.cost_per_1k_input !== undefined && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-1 mb-2">
            <DollarSign size={12} className="text-secondary" />
            <span className="text-xs font-bold text-foreground">Pricing</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background rounded-lg p-2">
              <div className="text-[10px] text-muted-deep">Input</div>
              <div className="text-xs font-bold text-foreground">
                ${model.cost_per_1k_input?.toFixed(4)}/1K
              </div>
            </div>
            <div className="bg-background rounded-lg p-2">
              <div className="text-[10px] text-muted-deep">Output</div>
              <div className="text-xs font-bold text-foreground">
                ${model.cost_per_1k_output?.toFixed(4)}/1K
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Window */}
      {model.input_context && (
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-deep">
          <span>Context: {(model.input_context / 1000).toFixed(0)}K tokens</span>
          {model.credits !== undefined && (
            <span className="text-secondary font-bold">{model.credits} credits left</span>
          )}
        </div>
      )}
    </div>
  );
}
