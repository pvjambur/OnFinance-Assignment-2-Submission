# Oracle Monitor

Oracle Monitor is a unified observability system for multi-agent systems. It aggregates state from Kubernetes, queues, LLM providers, and agents into a single JSON snapshot, enabling "God Mode" debugging.

## Prerequisites

To run this system locally, you need the following installed:

### 1. Core Runtime (Essential)
- **Docker Desktop** (or Docker Engine + Compose): For running the database, message queue, and API.
- **Python 3.11+**: For running the collectors, CLI, and example agents.

### 2. Infrastructure Tools
- **Kubernetes (Minikube)**: We use Minikube to simulate the production agent environment locally.
    - [Install Minikube](https://minikube.sigs.k8s.io/docs/start/)
- **kubectl**: CLI tool to interact with Kubernetes.
    - [Install kubectl](https://kubernetes.io/docs/tasks/tools/)

### 3. Database (Choose One)
- **Supabase Cloud Account**: Simplest option. Create a free project at [supabase.com](https://supabase.com).
- **OR Supabase CLI**: For running self-hosted Supabase locally.
    - [Install CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase` or Windows equivalent).

### 4. Optional but Recommended
- **Redpanda CLI (`rpk`)**: Useful for inspecting the Kafka queue manually, though `docker-compose` runs the server for you.
- **k9s**: Excellent TUI for viewing Kubernetes pods.

## What is Stored?

The system stores data in **Supabase (PostgreSQL)**.

1.  **`system_snapshots` Table**:
    - Stores the JSON "God Mode" snapshot every 10 seconds.
    - Contains: combined state of all Agents, K8s Pods, Kafka Queues, and LiteLLM usage.
    - Useful for: Time-travel debugging ("Show me the system state 5 minutes ago").

2.  **`agent_traces` Table** (if enabled):
    - Detailed logs of individual agent actions.

3.  **`alerts` Table**:
    - System anomalies detected by the aggregator.

## "Claude Code" Integration

You asked about "Claude Code". You do **not** need to install Claude Code to run this system.

"Claude Code" refers to the AI Agent (like the one you are talking to right now, or the `claude` CLI tool) that **uses** Oracle Monitor.

**How it works:**
1.  You run `oracle-monitor` outputting JSON.
2.  You paste that JSON to the AI (or the AI runs the CLI directly).
3.  The AI analyzes the JSON to find bugs across your stack (K8s + Python + LLM).

## Quick Start

1.  **Setup Infrastructure**:
    ```bash
    ./scripts/setup_local_k8s.sh
    ```
2.  **Install Python Deps**:
    ```bash
    make setup
    ```
3.  **Run Collectors**:
    ```bash
    ./scripts/deploy_collectors.sh
    ```
4.  **Use CLI**:
    ```bash
    oracle-monitor latest
    ```
