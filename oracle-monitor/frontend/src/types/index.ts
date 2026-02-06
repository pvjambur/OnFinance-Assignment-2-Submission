export interface SystemSnapshot {
  id: string;
  timestamp: string;
  agents: Agent[];
  workload: Workload[];
  queues: Queue[];
  litellm: LLMModel[];
}

export interface Agent {
  name: string;
  description: string;
  max_parallel_invocations: number;
  deployment_name: string;
  models: string[];
  activity: {
    active_task_ids: Task[];
    updated_at: string;
  };
}

export interface Task {
  id: string;
  started_on: string;
  status: 'running' | 'waiting' | 'completed' | 'failed';
}

export interface Workload {
  deployment_name: string;
  max_pods: number;
  live: {
    active_pods: number;
    updated_at: string;
    image: string;
    rolled_out_at: string;
  };
  pod_max_ram: string;
  pod_max_cpu: string;
  pods: Pod[];
}

export interface Pod {
  pod_id: string;
  cpu: number;
  memory: number;
  network_in: number;
  network_out: number;
  status: 'Running' | 'Pending' | 'Failed' | 'Succeeded' | 'Unknown';
  updated_at: string;
  restarts?: number;
}

export interface Queue {
  name: string;
  tasks: QueueTask[];
  updated_at: string;
}

export interface QueueTask {
  id: string;
  invoked_by: string;
  priority: {
    level: 'low' | 'normal' | 'high' | 'critical';
    blocked_task?: string;
    waiting_since_mins?: number;
  };
  prompt: string;
  args: Record<string, unknown>;
  submitted_at: string;
}

export interface LLMModel {
  model: string;
  provider: string;
  tpm: number;
  rpm: number;
  tpm_max: number;
  rpm_max: number;
  credits?: number;
  payment_type?: 'prepaid' | 'postpaid' | 'free';
  input_context?: number;
  output_context?: number;
  cost_per_1k_input?: number;
  cost_per_1k_output?: number;
}

export interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  source: string;
  acknowledged: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export interface ChatResponse {
  reply: string;
  context_used: boolean;
}
