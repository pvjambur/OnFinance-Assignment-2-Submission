from typing import Dict, Any, List
from kubernetes import client, config
from collectors.base.collector import Collector
import os

class K8sCollector(Collector):
    def __init__(self):
        try:
            # Try loading in-cluster config first, then local kubeconfig
            config.load_incluster_config()
        except config.ConfigException:
            try:
                config.load_kube_config()
            except Exception:
                print("Warning: Could not load Kubernetes config. K8s collector will return empty data.")
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
        self.namespace = "oracle-monitor"

    def collect(self) -> List[Dict[str, Any]]:
        workload_state = []
        try:
            deployments = self.apps_v1.list_namespaced_deployment(self.namespace)
            
            for dep in deployments.items:
                dep_name = dep.metadata.name
                
                # Find pods for this deployment
                label_selector = ",".join([f"{k}={v}" for k, v in dep.spec.selector.match_labels.items()])
                pods = self.v1.list_namespaced_pod(self.namespace, label_selector=label_selector)
                
                pod_list = []
                for pod in pods.items:
                    # Calculate basic CPU/Mem usage (mocked here as metrics API needs metrics-server)
                    # In a real scenario, we'd query the metrics API or Prometheus
                    pod_data = {
                        "pod_id": pod.metadata.name,
                        "status": pod.status.phase,
                        "memory": 0, # Placeholder
                        "cpu": 0,    # Placeholder
                        "restarts": sum(cs.restart_count for cs in pod.status.container_statuses) if pod.status.container_statuses else 0,
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                    pod_list.append(pod_data)
                
                workload_state.append({
                    "deployment_name": dep_name,
                    "max_pods": dep.spec.replicas or 1,
                    "live": {
                        "active_pods": len(pod_list),
                        "updated_at": "2024-01-01T00:00:00Z", # Placeholder
                        "image": dep.spec.template.spec.containers[0].image,
                        "rolled_out_at": "2024-01-01T00:00:00Z" # Placeholder
                    },
                    "pods": pod_list
                })
                
        except Exception as e:
            print(f"Error collecting K8s data: {e}")
            # Return empty list on error to prevent crash
            return []

        return workload_state
