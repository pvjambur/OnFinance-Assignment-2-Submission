# Oracle Monitor Architecture

## Components

1. **Collectors**: Python scripts extracting data from K8s, LiteLLM, Kafka, and Agents.
2. **Aggregator**: Combines data into a unified JSON snapshot.
3. **Supabase**: Stores snapshots as a time-series record.
4. **CLI**: Queries Supabase for snapshots and diffs.

## Data Flow

`Collectors` -> `Aggregator` -> `Supabase` <- `CLI`

## Schema

See `schema/oracle_state.schema.json` for the definitive state definition.
