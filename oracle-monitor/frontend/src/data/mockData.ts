import type { Agent, Workload, Queue, LLMModel, Alert, LogEntry } from '@/types';

// Mock data for demonstration
export const mockAgents: Agent[] = [
  {
    name: 'CodeAnalyzer',
    description: 'Analyzes code for security vulnerabilities',
    max_parallel_invocations: 5,
    deployment_name: 'analyzer-prod',
    models: ['gpt-4o', 'claude-3'],
    activity: {
      active_task_ids: [
        { id: 'task-001-abc-def', started_on: '2024-01-15T10:30:00Z', status: 'running' },
        { id: 'task-002-ghi-jkl', started_on: '2024-01-15T10:31:00Z', status: 'waiting' },
      ],
      updated_at: '2024-01-15T10:32:00Z',
    },
  },
  {
    name: 'DataProcessor',
    description: 'Processes and transforms data pipelines',
    max_parallel_invocations: 10,
    deployment_name: 'processor-prod',
    models: ['gpt-4o-mini'],
    activity: {
      active_task_ids: [
        { id: 'task-003-mno-pqr', started_on: '2024-01-15T10:25:00Z', status: 'running' },
      ],
      updated_at: '2024-01-15T10:32:00Z',
    },
  },
  {
    name: 'ContentWriter',
    description: 'Generates and optimizes content',
    max_parallel_invocations: 3,
    deployment_name: 'writer-prod',
    models: ['claude-3-opus'],
    activity: {
      active_task_ids: [],
      updated_at: '2024-01-15T10:30:00Z',
    },
  },
  {
    name: 'ImageAnalyzer',
    description: 'Analyzes and processes images',
    max_parallel_invocations: 8,
    deployment_name: 'vision-prod',
    models: ['gpt-4o', 'gemini-pro'],
    activity: {
      active_task_ids: [
        { id: 'task-004-stu-vwx', started_on: '2024-01-15T10:28:00Z', status: 'running' },
        { id: 'task-005-yza-bcd', started_on: '2024-01-15T10:29:00Z', status: 'running' },
        { id: 'task-006-efg-hij', started_on: '2024-01-15T10:30:00Z', status: 'waiting' },
      ],
      updated_at: '2024-01-15T10:32:00Z',
    },
  },
  {
    name: 'QueryOptimizer',
    description: 'Optimizes database queries',
    max_parallel_invocations: 4,
    deployment_name: 'optimizer-prod',
    models: ['gpt-4o'],
    activity: {
      active_task_ids: [],
      updated_at: '2024-01-15T10:20:00Z',
    },
  },
  {
    name: 'SecurityScanner',
    description: 'Scans for security threats',
    max_parallel_invocations: 6,
    deployment_name: 'scanner-prod',
    models: ['claude-3-sonnet'],
    activity: {
      active_task_ids: [
        { id: 'task-007-klm-nop', started_on: '2024-01-15T10:31:00Z', status: 'running' },
      ],
      updated_at: '2024-01-15T10:32:00Z',
    },
  },
];

export const mockWorkload: Workload[] = [
  {
    deployment_name: 'analyzer-prod',
    max_pods: 5,
    live: {
      active_pods: 3,
      updated_at: '2024-01-15T10:32:00Z',
      image: 'analyzer:v1.2.3',
      rolled_out_at: '2024-01-15T08:00:00Z',
    },
    pod_max_ram: '2Gi',
    pod_max_cpu: '1000m',
    pods: [
      { pod_id: 'analyzer-prod-abc-123', cpu: 450, memory: 890, network_in: 100, network_out: 50, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'analyzer-prod-def-456', cpu: 620, memory: 1100, network_in: 150, network_out: 75, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 1 },
      { pod_id: 'analyzer-prod-ghi-789', cpu: 380, memory: 720, network_in: 80, network_out: 40, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
    ],
  },
  {
    deployment_name: 'processor-prod',
    max_pods: 8,
    live: {
      active_pods: 4,
      updated_at: '2024-01-15T10:32:00Z',
      image: 'processor:v2.0.1',
      rolled_out_at: '2024-01-15T06:00:00Z',
    },
    pod_max_ram: '4Gi',
    pod_max_cpu: '2000m',
    pods: [
      { pod_id: 'processor-prod-jkl-012', cpu: 780, memory: 1500, network_in: 200, network_out: 100, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'processor-prod-mno-345', cpu: 520, memory: 1200, network_in: 180, network_out: 90, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 2 },
      { pod_id: 'processor-prod-pqr-678', cpu: 900, memory: 1800, network_in: 250, network_out: 125, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'processor-prod-stu-901', cpu: 150, memory: 600, network_in: 50, network_out: 25, status: 'Pending', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
    ],
  },
  {
    deployment_name: 'writer-prod',
    max_pods: 3,
    live: {
      active_pods: 2,
      updated_at: '2024-01-15T10:32:00Z',
      image: 'writer:v1.5.0',
      rolled_out_at: '2024-01-15T04:00:00Z',
    },
    pod_max_ram: '2Gi',
    pod_max_cpu: '500m',
    pods: [
      { pod_id: 'writer-prod-vwx-234', cpu: 280, memory: 650, network_in: 60, network_out: 30, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'writer-prod-yza-567', cpu: 320, memory: 700, network_in: 70, network_out: 35, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 1 },
    ],
  },
  {
    deployment_name: 'vision-prod',
    max_pods: 6,
    live: {
      active_pods: 3,
      updated_at: '2024-01-15T10:32:00Z',
      image: 'vision:v3.1.2',
      rolled_out_at: '2024-01-15T02:00:00Z',
    },
    pod_max_ram: '8Gi',
    pod_max_cpu: '4000m',
    pods: [
      { pod_id: 'vision-prod-bcd-890', cpu: 1800, memory: 3500, network_in: 400, network_out: 200, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'vision-prod-efg-123', cpu: 2100, memory: 4200, network_in: 450, network_out: 225, status: 'Running', updated_at: '2024-01-15T10:32:00Z', restarts: 0 },
      { pod_id: 'vision-prod-hij-456', cpu: 1600, memory: 3100, network_in: 350, network_out: 175, status: 'Failed', updated_at: '2024-01-15T10:32:00Z', restarts: 5 },
    ],
  },
];

export const mockQueues: Queue[] = [
  {
    name: 'task-queue',
    updated_at: '2024-01-15T10:32:00Z',
    tasks: [
      {
        id: 'queue-task-001-abcdef123456',
        invoked_by: 'api-gateway',
        priority: { level: 'critical', waiting_since_mins: 2 },
        prompt: 'Analyze security vulnerabilities in the authentication module',
        args: { module: 'auth' },
        submitted_at: '2024-01-15T10:30:00Z',
      },
      {
        id: 'queue-task-002-ghijkl789012',
        invoked_by: 'scheduler',
        priority: { level: 'high', waiting_since_mins: 5 },
        prompt: 'Process batch data transformation for user analytics',
        args: { batch_size: 1000 },
        submitted_at: '2024-01-15T10:27:00Z',
      },
      {
        id: 'queue-task-003-mnopqr345678',
        invoked_by: 'user-service',
        priority: { level: 'normal', waiting_since_mins: 8 },
        prompt: 'Generate weekly report summary for dashboard metrics',
        args: { report_type: 'weekly' },
        submitted_at: '2024-01-15T10:24:00Z',
      },
      {
        id: 'queue-task-004-stuvwx901234',
        invoked_by: 'content-service',
        priority: { level: 'normal', waiting_since_mins: 12 },
        prompt: 'Optimize content delivery for mobile devices',
        args: { platform: 'mobile' },
        submitted_at: '2024-01-15T10:20:00Z',
      },
      {
        id: 'queue-task-005-yzabcd567890',
        invoked_by: 'ml-pipeline',
        priority: { level: 'low', waiting_since_mins: 15 },
        prompt: 'Retrain recommendation model with latest data',
        args: { model_version: 'v3' },
        submitted_at: '2024-01-15T10:17:00Z',
      },
    ],
  },
  {
    name: 'output-queue',
    updated_at: '2024-01-15T10:32:00Z',
    tasks: [
      {
        id: 'output-task-001-defghi123456',
        invoked_by: 'CodeAnalyzer',
        priority: { level: 'normal', waiting_since_mins: 1 },
        prompt: 'Completed security analysis for auth module',
        args: { result: 'success' },
        submitted_at: '2024-01-15T10:31:00Z',
      },
    ],
  },
  {
    name: 'dead-letter-queue',
    updated_at: '2024-01-15T10:32:00Z',
    tasks: [
      {
        id: 'dlq-task-001-jklmno789012',
        invoked_by: 'scheduler',
        priority: { level: 'high', waiting_since_mins: 45 },
        prompt: 'Failed: Connection timeout to external API',
        args: { error: 'ETIMEDOUT', retries: 3 },
        submitted_at: '2024-01-15T09:47:00Z',
      },
      {
        id: 'dlq-task-002-pqrstu345678',
        invoked_by: 'ml-pipeline',
        priority: { level: 'critical', waiting_since_mins: 120 },
        prompt: 'Failed: Out of memory during model inference',
        args: { error: 'OOM', retries: 3 },
        submitted_at: '2024-01-15T08:32:00Z',
      },
    ],
  },
];

export const mockLLMModels: LLMModel[] = [
  { 
    model: 'gpt-4o', 
    provider: 'openai', 
    tpm: 45000, 
    rpm: 120, 
    tpm_max: 100000, 
    rpm_max: 500,
    credits: 2500,
    payment_type: 'prepaid',
    input_context: 128000,
    output_context: 4096,
    cost_per_1k_input: 0.005,
    cost_per_1k_output: 0.015,
  },
  { 
    model: 'gpt-4o-mini', 
    provider: 'openai', 
    tpm: 78000, 
    rpm: 250, 
    tpm_max: 150000, 
    rpm_max: 1000,
    credits: 5000,
    payment_type: 'prepaid',
    input_context: 128000,
    output_context: 16384,
    cost_per_1k_input: 0.00015,
    cost_per_1k_output: 0.0006,
  },
  { 
    model: 'claude-3-opus', 
    provider: 'anthropic', 
    tpm: 32000, 
    rpm: 80, 
    tpm_max: 80000, 
    rpm_max: 400,
    credits: 1500,
    payment_type: 'prepaid',
    input_context: 200000,
    output_context: 4096,
    cost_per_1k_input: 0.015,
    cost_per_1k_output: 0.075,
  },
  { 
    model: 'claude-3-sonnet', 
    provider: 'anthropic', 
    tpm: 55000, 
    rpm: 150, 
    tpm_max: 100000, 
    rpm_max: 500,
    credits: 3000,
    payment_type: 'prepaid',
    input_context: 200000,
    output_context: 4096,
    cost_per_1k_input: 0.003,
    cost_per_1k_output: 0.015,
  },
  { 
    model: 'gemini-pro', 
    provider: 'google', 
    tpm: 28000, 
    rpm: 95, 
    tpm_max: 60000, 
    rpm_max: 300,
    payment_type: 'free',
    input_context: 32000,
    output_context: 8192,
    cost_per_1k_input: 0,
    cost_per_1k_output: 0,
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    level: 'error',
    message: 'Pod vision-prod-hij-456 entered Failed state after 5 restarts',
    timestamp: '2024-01-15T10:30:00Z',
    source: 'kubernetes',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    level: 'warning',
    message: 'Dead letter queue has 2 unprocessed tasks for over 1 hour',
    timestamp: '2024-01-15T10:25:00Z',
    source: 'queue-monitor',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    level: 'warning',
    message: 'LLM rate limit at 90% for claude-3-opus',
    timestamp: '2024-01-15T10:20:00Z',
    source: 'litellm',
    acknowledged: true,
  },
  {
    id: 'alert-004',
    level: 'info',
    message: 'Scheduled maintenance window in 2 hours',
    timestamp: '2024-01-15T10:00:00Z',
    source: 'scheduler',
    acknowledged: true,
  },
];

export const mockLogs: LogEntry[] = [
  { id: 'log-001', timestamp: '2024-01-15T10:32:15Z', level: 'info', message: '[analyzer-prod] Task task-001-abc-def started processing', source: 'CodeAnalyzer' },
  { id: 'log-002', timestamp: '2024-01-15T10:32:10Z', level: 'info', message: '[processor-prod] Batch processing 1000 records', source: 'DataProcessor' },
  { id: 'log-003', timestamp: '2024-01-15T10:32:05Z', level: 'warning', message: '[vision-prod] High memory usage detected: 4.2GB / 8GB', source: 'ImageAnalyzer' },
  { id: 'log-004', timestamp: '2024-01-15T10:32:00Z', level: 'error', message: '[vision-prod] Pod vision-prod-hij-456 OOMKilled', source: 'kubernetes' },
  { id: 'log-005', timestamp: '2024-01-15T10:31:55Z', level: 'info', message: '[scanner-prod] Security scan initiated for auth module', source: 'SecurityScanner' },
  { id: 'log-006', timestamp: '2024-01-15T10:31:50Z', level: 'debug', message: '[litellm] Token usage: 45000/100000 TPM for gpt-4o', source: 'litellm' },
  { id: 'log-007', timestamp: '2024-01-15T10:31:45Z', level: 'info', message: '[analyzer-prod] Successfully analyzed 15 files', source: 'CodeAnalyzer' },
  { id: 'log-008', timestamp: '2024-01-15T10:31:40Z', level: 'warning', message: '[queue] Task queue-task-003 waiting for 8 minutes', source: 'queue-monitor' },
  { id: 'log-009', timestamp: '2024-01-15T10:31:35Z', level: 'info', message: '[processor-prod] Pod processor-prod-stu-901 scaling up', source: 'kubernetes' },
  { id: 'log-010', timestamp: '2024-01-15T10:31:30Z', level: 'debug', message: '[writer-prod] Content generation completed in 2.3s', source: 'ContentWriter' },
];

// Token usage history for charts
export const mockTokenHistory = [
  { time: '10:00', openai: 42000, anthropic: 28000, google: 15000 },
  { time: '10:05', openai: 48000, anthropic: 32000, google: 18000 },
  { time: '10:10', openai: 52000, anthropic: 35000, google: 22000 },
  { time: '10:15', openai: 45000, anthropic: 30000, google: 25000 },
  { time: '10:20', openai: 58000, anthropic: 38000, google: 20000 },
  { time: '10:25', openai: 62000, anthropic: 42000, google: 28000 },
  { time: '10:30', openai: 55000, anthropic: 40000, google: 25000 },
];
