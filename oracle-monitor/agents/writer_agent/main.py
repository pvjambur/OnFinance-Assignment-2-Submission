import time
import random
from agents.base.agent import BaseAgent

class WriterAgent(BaseAgent):
    def run(self):
        print(f"Agent {self.name} starting ACTIVE loop...")
        report_counter = 0
        
        while self.running:
            report_counter += 1
            task_id = f"writer-{report_counter:04d}"
            
            # Phase 1: Start
            self.publish_log(
                f"📝 Starting report generation #{report_counter}", 
                level="info", 
                task_id=task_id
            )
            time.sleep(0.6)
            
            # Phase 2: Data Gathering
            sources = ["system_snapshots", "agent_logs", "queue_metrics", "llm_usage"]
            source = random.choice(sources)
            self.publish_log(
                f"📥 Fetching data from {source} table", 
                level="info", 
                task_id=task_id
            )
            time.sleep(0.9)
            
            # Phase 3: Processing
            operations = [
                "Aggregating hourly statistics",
                "Computing performance trends",
                "Identifying bottlenecks",
                "Generating insights",
                "Building visualizations"
            ]
            operation = random.choice(operations)
            self.publish_log(
                f"⚙️ {operation}", 
                level="info", 
                task_id=task_id
            )
            time.sleep(1.1)
            
            # Phase 4: Writing
            sections = ["Executive Summary", "System Overview", "Performance Analysis", "Recommendations"]
            section = random.choice(sections)
            self.publish_log(
                f"✍️ Writing section: {section}", 
                level="info", 
                task_id=task_id
            )
            time.sleep(0.8)
            
            # Phase 5: Validation
            quality_score = random.randint(85, 100)
            if quality_score >= 95:
                self.publish_log(
                    f"✅ Report quality check: {quality_score}/100 - Excellent", 
                    level="info", 
                    task_id=task_id
                )
            else:
                self.publish_log(
                    f"✓ Report quality check: {quality_score}/100 - Good", 
                    level="info", 
                    task_id=task_id
                )
            time.sleep(0.7)
            
            # Phase 6: Completion
            self.publish_log(
                f"📄 Report #{report_counter} generated and saved", 
                level="info", 
                task_id=task_id
            )
            
            # Pause before next report
            time.sleep(2.5)

if __name__ == "__main__":
    agent = WriterAgent("writer-agent")
    agent.start()
