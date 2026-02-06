import { useState, useMemo, useEffect } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AgentList } from '@/components/AgentList';
import { FilterBar } from '@/components/FilterBar';
import { AgentDetailModal } from '@/components/AgentDetailModal';
import { api } from '@/services/api';
import type { Agent } from '@/types';

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Fetch data on mount and subscribe to updates
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await api.getLatestSnapshot();
      if (snapshot && snapshot.agents) {
        setAgents(snapshot.agents);
      }
      setLoading(false);
    };

    fetchData();

    const subscription = api.subscribeToSnapshots((snapshot) => {
      if (snapshot && snapshot.agents) {
        setAgents(snapshot.agents);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Get unique models from all agents
  const uniqueModels = useMemo(() => {
    const models = new Set<string>();
    agents.forEach(agent => agent.models.forEach(m => models.add(m)));
    return Array.from(models);
  }, [agents]);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'idle', label: 'Idle' },
  ];

  const modelOptions = [
    { value: 'all', label: 'All Models' },
    ...uniqueModels.map(m => ({ value: m, label: m }))
  ];

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      // Search filter
      if (searchValue) {
        const search = searchValue.toLowerCase();
        const matchesName = agent.name.toLowerCase().includes(search);
        const matchesDescription = agent.description.toLowerCase().includes(search);
        if (!matchesName && !matchesDescription) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const isActive = agent.activity.active_task_ids.length > 0;
        if (statusFilter === 'active' && !isActive) return false;
        if (statusFilter === 'idle' && isActive) return false;
      }

      // Model filter
      if (modelFilter !== 'all') {
        if (!agent.models.includes(modelFilter)) return false;
      }

      return true;
    });
  }, [agents, searchValue, statusFilter, modelFilter]);

  const activeCount = agents.filter(a => a.activity.active_task_ids.length > 0).length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Cpu size={20} className="text-lavender" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Agent Observatory
            </h1>
            <p className="text-sm text-muted-deep">
              {agents.length} agents configured • {activeCount} currently active
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          modelFilter={modelFilter}
          onModelFilterChange={setModelFilter}
          statusOptions={statusOptions}
          modelOptions={modelOptions}
        />
      </div>

      {/* Results Info */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-deep">
          Showing {filteredAgents.length} of {agents.length} agents
        </span>
        {(searchValue || statusFilter !== 'all' || modelFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchValue('');
              setStatusFilter('all');
              setModelFilter('all');
            }}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Agent Grid */}
      <div onClick={(e) => {
        const target = e.target as HTMLElement;
        const card = target.closest('[data-agent-card]');
        if (card) {
          const agentName = card.getAttribute('data-agent-card');
          const agent = agents.find(a => a.name === agentName);
          if (agent) setSelectedAgent(agent);
        }
      }}>
        <AgentList agents={filteredAgents} />
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
      />
    </MainLayout>
  );
};

export default AgentsPage;
