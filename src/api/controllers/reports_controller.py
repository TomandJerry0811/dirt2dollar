from typing import List, Dict, Any
from fastapi import HTTPException
from src.api.controllers.clients_controller import ClientsController
from src.core.exceptions import FrameworkException


class ReportsController:
    def __init__(self):
        self.clients_controller = ClientsController()

    def get_reports(self) -> List[Dict[str, Any]]:
        try:
            clients = self.clients_controller.get_all_clients()
            reports = []
            for index, c in enumerate(clients):
                reports.append({
                    "id": f"rep-{index}",
                    "name": f"AI Churn Audit - {c['name']}",
                    "type": "churn",
                    "clientId": c["id"],
                    "clientName": c["name"],
                    "status": "completed",
                    "format": "pdf",
                    "generatedBy": "System Scheduler",
                    "createdAt": c["lastActivityDate"],
                    "updatedAt": c["lastActivityDate"],
                    "sections": ["Overview", "KPI Performance", "AI Risk Analysis", "Recommendations"],
                    "version": 1
                })
            return reports
        except (HTTPException, FrameworkException):
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to fetch reports: {error}")

    def get_report(self, report_id: str) -> Dict[str, Any]:
        reports = self.get_reports()
        for r in reports:
            if r["id"] == report_id:
                return r
        raise HTTPException(status_code=404, detail="Report not found")

    def generate_report(self, config: Dict[str, Any]) -> Dict[str, Any]:
        client_id = config.get("clientId")
        if not client_id:
            raise HTTPException(status_code=400, detail="Client ID is required")

        try:
            client = self.clients_controller.get_client(client_id)
            report_type = config.get("reportType") or "churn"

            return {
                "id": f"rep-{int(hash(client_id) % 10000)}",
                "name": f"{report_type.capitalize()} Report - {client['name']}",
                "type": report_type,
                "clientId": client_id,
                "clientName": client["name"],
                "status": "completed",
                "format": config.get("format") or "pdf",
                "generatedBy": "Current User",
                "createdAt": "2026-08-21T18:24:25Z",
                "updatedAt": "2026-08-21T18:24:25Z",
                "sections": config.get("sections") or ["Overview", "Details"],
                "version": 1
            }
        except (HTTPException, FrameworkException):
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to generate report: {error}")

    def get_report_content(self, report_id: str) -> str:
        try:
            report = self.get_report(report_id)
            client = self.clients_controller.get_client(report["clientId"])

            return f"""==================================================
CUSTOMER CHURN PREDICTOR AUDIT REPORT
==================================================
Report ID: {report_id}
Client Name: {client['name']}
Client ID: {client['id']}
Generated At: {report['createdAt']}
Status: COMPLETED
--------------------------------------------------

1. EXECUTIVE OVERVIEW
---------------------
Health Score: {client['healthScore']}/100
Churn Probability: {client['churnProbability']}%
Risk Assessment: {client['riskLevel'].upper()}

2. AI ANALYSIS SUMMARY
----------------------
{client['metadata']['summary']}

3. IDENTIFIED BOTTLENECKS
-------------------------
{chr(10).join([f"- {b}" for b in client['metadata']['bottlenecks']]) if client['metadata']['bottlenecks'] else "- No critical bottlenecks detected."}

4. ACTION RECOMMENDATIONS
-------------------------
{chr(10).join([f"- {r}" for r in client['metadata']['action_items']]) if client['metadata']['action_items'] else "- No pending recommendations."}

==================================================
Report Generated Automatically by Customer Churn Predictor
==================================================
"""
        except (HTTPException, FrameworkException):
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to build report content: {error}")