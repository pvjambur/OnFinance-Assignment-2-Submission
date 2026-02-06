import type { Agent } from '@/types';
import { AgentCard } from './AgentCard';

interface AgentListProps {
  agents: Agent[];
}

export function AgentList({ agents }: AgentListProps) {
  if (!agents?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-deep">No agents available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.name} agent={agent} />
      ))}
    </div>
  );
}
