from typing import Any, Dict, List, Optional
from datetime import datetime, timezone

from src.providers.llm.groq_provider import GroqProvider
from src.repositories.client_repository import ClientRepository
from src.repositories.kpi_repository import KPIRepository
from src.core.exceptions import ServiceException
from src.core.logging import logger


class AgentService:
    """
    AI Agent orchestration service.

    The agent answers questions using existing application data.
    It does NOT execute the churn-analysis workflow.
    """

    def __init__(self):
        self.client_repo = ClientRepository()
        self.kpi_repo = KPIRepository()
        self.groq_provider = GroqProvider()

    def chat(self, message: str) -> Dict[str, Any]:
        if not message or not message.strip():
            raise ServiceException("Agent message cannot be empty.")

        user_message = message.strip()

        try:
            intent = self._detect_intent(user_message)

            data = self._get_data_for_intent(
                intent=intent,
                message=user_message
            )

            answer = self._generate_answer(
                message=user_message,
                intent=intent,
                data=data
            )

            return {
                "success": True,
                "message": answer,
                "intent": intent,
                "data": data,
            }

        except ServiceException:
            raise
        except Exception as error:
            logger.error(
                f"AI Agent failed: {error}",
                exc_info=True
            )
            raise ServiceException(
                f"AI Agent failed to process the request: {error}"
            )

    # ============================================================
    # Intent Detection
    # ============================================================

    def _detect_intent(self, message: str) -> str:
        text = message.lower()

        if any(
            phrase in text
            for phrase in [
                "high risk",
                "highest churn",
                "highest risk",
                "at risk",
                "risk clients",
                "risky clients",
            ]
        ):
            return "HIGH_RISK_CLIENTS"

        if any(
            phrase in text
            for phrase in [
                "kpi trend",
                "kpi trends",
                "kpi",
                "performance trend",
                "performance trends",
            ]
        ):
            return "KPI_TREND"

        if any(
            phrase in text
            for phrase in [
                "executive summary",
                "portfolio summary",
                "overall summary",
                "summarize",
                "summary",
            ]
        ):
            return "EXECUTIVE_SUMMARY"

        if any(
            phrase in text
            for phrase in [
                "ebr",
                "executive business review",
                "business review",
            ]
        ):
            return "EBR_CLIENTS"

        if any(
            phrase in text
            for phrase in [
                "workflow failure",
                "workflow failures",
                "failed workflow",
                "failed workflows",
                "workflow error",
                "workflow errors",
            ]
        ):
            return "WORKFLOW_FAILURES"

        if any(
            phrase in text
            for phrase in [
                "client",
                "customer",
                "why is",
                "why does",
            ]
        ):
            return "CLIENT_QUERY"

        return "GENERAL"

    # ============================================================
    # Data Retrieval
    # ============================================================

    def _get_data_for_intent(
        self,
        intent: str,
        message: str
    ) -> Dict[str, Any]:

        if intent == "HIGH_RISK_CLIENTS":
            return self._get_high_risk_clients()

        if intent == "KPI_TREND":
            return self._get_kpi_data(message)

        if intent == "EXECUTIVE_SUMMARY":
            return self._get_executive_data()

        if intent == "EBR_CLIENTS":
            return self._get_ebr_clients()

        if intent == "WORKFLOW_FAILURES":
            return self._get_workflow_failures()

        if intent == "CLIENT_QUERY":
            return self._get_client_context(message)

        return self._get_general_context()

    # ============================================================
    # High Risk Clients
    # ============================================================

    def _get_high_risk_clients(self) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []

        clients = []

        for row in rows:
            churn = row.get("churn_probability")

            if churn is None:
                satisfaction = row.get("satisfaction_score") or 80
                churn = max(0, min(100, 100 - satisfaction))

            try:
                churn = float(churn)
            except (TypeError, ValueError):
                continue

            if churn >= 45:
                clients.append({
                    "client_id": row.get("client_id") or row.get("id"),
                    "client_name": row.get("client_name"),
                    "churn_probability": round(churn, 2),
                    "health_score": round(100 - churn, 2),
                    "summary": row.get("summary"),
                    "bottlenecks": row.get("bottlenecks") or [],
                    "action_items": row.get("action_items") or [],
                })

        clients.sort(
            key=lambda client: client["churn_probability"],
            reverse=True
        )

        return {
            "count": len(clients),
            "clients": clients,
        }

    # ============================================================
    # KPI Data
    # ============================================================

    def _get_kpi_data(self, message: str) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []

        # Try to identify a client mentioned in the question.
        message_lower = message.lower()

        matching_client = None

        for row in rows:
            name = (row.get("client_name") or "").strip()

            if name and name.lower() in message_lower:
                matching_client = row
                break

        if matching_client:
            client_id = (
                matching_client.get("client_id")
                or matching_client.get("id")
            )

            kpis = self.kpi_repo.find_by_id(client_id) or []

            return {
                "client": {
                    "client_id": client_id,
                    "client_name": matching_client.get("client_name"),
                    "churn_probability": matching_client.get(
                        "churn_probability"
                    ),
                    "health_score": (
                        100 - matching_client.get("churn_probability")
                        if matching_client.get("churn_probability") is not None
                        else None
                    ),
                },
                "kpis": kpis,
            }

        # If no specific client was mentioned, return available KPI rows.
        all_kpis: List[Dict[str, Any]] = []

        for row in rows:
            client_id = (
                row.get("client_id")
                or row.get("id")
            )

            if not client_id:
                continue

            try:
                kpis = self.kpi_repo.find_by_id(client_id) or []

                all_kpis.append({
                    "client_id": client_id,
                    "client_name": row.get("client_name"),
                    "kpis": kpis,
                })
            except Exception as error:
                logger.warning(
                    f"Could not fetch KPI data for {client_id}: {error}"
                )

        return {
            "clients": all_kpis
        }

    # ============================================================
    # Executive Summary
    # ============================================================

    def _get_executive_data(self) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []

        total = len(rows)
        high_risk = 0
        medium_risk = 0
        healthy = 0

        churn_values = []

        for row in rows:
            churn = row.get("churn_probability")

            if churn is None:
                satisfaction = row.get("satisfaction_score") or 80
                churn = max(0, min(100, 100 - satisfaction))

            try:
                churn = float(churn)
            except (TypeError, ValueError):
                continue

            churn_values.append(churn)

            if churn >= 45:
                high_risk += 1
            elif churn >= 25:
                medium_risk += 1
            else:
                healthy += 1

        average_churn = (
            round(sum(churn_values) / len(churn_values), 2)
            if churn_values
            else 0
        )

        return {
            "total_clients": total,
            "high_risk_clients": high_risk,
            "medium_risk_clients": medium_risk,
            "healthy_clients": healthy,
            "average_churn_probability": average_churn,
        }

    # ============================================================
    # EBR Clients
    # ============================================================

    def _get_ebr_clients(self) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []

        ebr_clients = []

        for row in rows:
            churn = row.get("churn_probability")

            if churn is None:
                satisfaction = row.get("satisfaction_score") or 80
                churn = max(0, min(100, 100 - satisfaction))

            try:
                churn = float(churn)
            except (TypeError, ValueError):
                continue

            bottlenecks = row.get("bottlenecks") or []
            action_items = row.get("action_items") or []

            # EBR candidates are high-risk clients
            # or clients with explicit action items/bottlenecks.
            if churn >= 45 or bottlenecks or action_items:
                ebr_clients.append({
                    "client_id": row.get("client_id") or row.get("id"),
                    "client_name": row.get("client_name"),
                    "churn_probability": round(churn, 2),
                    "bottlenecks": bottlenecks,
                    "action_items": action_items,
                    "summary": row.get("summary"),
                })

        ebr_clients.sort(
            key=lambda client: client["churn_probability"],
            reverse=True
        )

        return {
            "count": len(ebr_clients),
            "clients": ebr_clients,
        }

    # ============================================================
    # Workflow Failures
    # ============================================================

    def _get_workflow_failures(self) -> Dict[str, Any]:
        """
        Workflow execution data will be connected through the
        existing workflow repository/controller layer.

        For now we return an explicit unavailable state rather
        than inventing workflow failures.
        """

        return {
            "available": False,
            "message": (
                "Workflow execution data is not connected to the "
                "Agent service yet."
            ),
            "failures": [],
        }

    # ============================================================
    # Client Context
    # ============================================================

    def _get_client_context(self, message: str) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []
        message_lower = message.lower()

        matches = []

        for row in rows:
            name = (row.get("client_name") or "").strip()

            if name and name.lower() in message_lower:
                matches.append({
                    "client_id": row.get("client_id") or row.get("id"),
                    "client_name": name,
                    "churn_probability": row.get(
                        "churn_probability"
                    ),
                    "satisfaction_score": row.get(
                        "satisfaction_score"
                    ),
                    "summary": row.get("summary"),
                    "bottlenecks": row.get("bottlenecks") or [],
                    "action_items": row.get("action_items") or [],
                })

        return {
            "matches": matches
        }

    # ============================================================
    # General Context
    # ============================================================

    def _get_general_context(self) -> Dict[str, Any]:
        rows = self.client_repo.find_all() or []

        return {
            "available_clients": [
                {
                    "client_id": row.get("client_id") or row.get("id"),
                    "client_name": row.get("client_name"),
                    "churn_probability": row.get(
                        "churn_probability"
                    ),
                }
                for row in rows
            ]
        }

    # ============================================================
    # LLM Response
    # ============================================================

    def _generate_answer(
        self,
        message: str,
        intent: str,
        data: Dict[str, Any]
    ) -> str:

        system_prompt = """
You are the AI Assistant for a Customer Churn Predictor application.

Your job is to answer questions about clients, churn risk, KPI performance,
executive summaries, EBR priorities, and workflows.

Rules:
1. Use ONLY the data provided to you.
2. Never invent client names, numbers, KPI values, or workflow events.
3. If information is unavailable, clearly say that it is unavailable.
4. Be concise and business-focused.
5. When listing clients, include the relevant churn/risk information.
6. Explain trends in simple business language.
7. Do not claim that you executed a workflow unless the provided data says so.
"""

        prompt = f"""
User question:
{message}

Detected intent:
{intent}

Application data:
{data}

Answer the user's question directly.
"""

        response = self.groq_provider.generate_response(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=700,
        )

        content = (response.get("content") or "").strip()

        if not content:
            raise ServiceException(
                "AI Agent received an empty response from the LLM."
            )

        return content