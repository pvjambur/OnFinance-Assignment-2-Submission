from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from supabase import create_client, Client
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import io
import json
from api.config import settings

router = APIRouter()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

@router.get("/progress-report")
async def generate_progress_report():
    """Generate a comprehensive PDF progress report of the Oracle Monitor system"""
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#FF6B6B'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4ECDC4'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph("Oracle Monitor System", title_style))
    story.append(Paragraph("Progress & Health Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Fetch latest snapshot
    snapshot_response = supabase.table("system_snapshots").select("*").order("timestamp", desc=True).limit(1).execute()
    
    if snapshot_response.data:
        snapshot = snapshot_response.data[0].get("state", {})
        
        # Executive Summary
        story.append(Paragraph("Executive Summary", heading_style))
        
        agent_count = len(snapshot.get("agents", []))
        total_tasks = sum(len(agent.get("activity", {}).get("active_task_ids", [])) for agent in snapshot.get("agents", []))
        queue_count = len(snapshot.get("queues", []))
        total_queued = sum(len(queue.get("tasks", [])) for queue in snapshot.get("queues", []))
        
        summary_data = [
            ["Metric", "Value"],
            ["Active Agents", str(agent_count)],
            ["Active Tasks", str(total_tasks)],
            ["Message Queues", str(queue_count)],
            ["Queued Tasks", str(total_queued)],
            ["LLM Models", str(len(snapshot.get("litellm", [])))],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4ECDC4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.2*inch))
        
        # Agent Details
        story.append(Paragraph("Agent Observatory", heading_style))
        for agent in snapshot.get("agents", []):
            agent_name = agent.get("name", "Unknown")
            agent_desc = agent.get("description", "No description")
            active_tasks = len(agent.get("activity", {}).get("active_task_ids", []))
            
            story.append(Paragraph(f"<b>{agent_name}</b>", styles['Normal']))
            story.append(Paragraph(f"{agent_desc}", styles['Normal']))
            story.append(Paragraph(f"Active Tasks: {active_tasks}", styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        story.append(PageBreak())
        
        # Workload Analysis
        story.append(Paragraph("Infrastructure Workload", heading_style))
        workload_data = [["Deployment", "Active Pods", "Max Pods", "Status"]]
        
        for workload in snapshot.get("workload", []):
            deployment = workload.get("deployment_name", "Unknown")
            active = workload.get("live", {}).get("active_pods", 0)
            max_pods = workload.get("max_pods", 0)
            status = "Healthy" if active > 0 else "Inactive"
            workload_data.append([deployment, str(active), str(max_pods), status])
        
        workload_table = Table(workload_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        workload_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF6B6B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(workload_table)
        story.append(Spacer(1, 0.2*inch))
    
    # Fetch recent logs
    logs_response = supabase.table("agent_logs").select("*").order("timestamp", desc=True).limit(50).execute()
    
    if logs_response.data:
        story.append(PageBreak())
        story.append(Paragraph("Recent Activity Logs", heading_style))
        
        log_data = [["Time", "Level", "Source", "Message"]]
        for log in logs_response.data[:20]:  # Top 20 logs
            timestamp = datetime.fromisoformat(log.get("timestamp", "")).strftime("%H:%M:%S")
            level = log.get("level", "info").upper()
            source = log.get("source", "unknown")
            message = log.get("message", "")[:60] + "..." if len(log.get("message", "")) > 60 else log.get("message", "")
            log_data.append([timestamp, level, source, message])
        
        log_table = Table(log_data, colWidths=[1*inch, 0.8*inch, 1.5*inch, 3.2*inch])
        log_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#95E1D3')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
        ]))
        story.append(log_table)
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=oracle_monitor_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"}
    )
