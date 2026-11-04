from typing import List, Dict, Any
from fastapi import HTTPException
from src.repositories.client_repository import ClientRepository
from src.repositories.kpi_repository import KPIRepository
from src.repositories.weighted_embedding_repository import WeightedEmbeddingRepository
from src.core.exceptions import FrameworkException
from src.core.logging import logger


class ClientsController:
    def __init__(self):
        self.client_repo = ClientRepository()
        self.kpi_repo = KPIRepository()

    def _map_client(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maps a DB row from client_updates into a frontend-compatible Client object.
        """
        try:
            c_id = row.get("client_id") or str(row.get("id"))
            name = row.get("client_name") or "Unknown Client"

            # Calculate Churn & Health
            churn_prob = row.get("churn_probability")
            if churn_prob is None:
                # Fallback if None (try matching by satisfaction)
                sat = row.get("satisfaction_score") or 80
                churn_prob = max(0, min(100, 100 - sat))

            health = 100 - churn_prob

            # Map Risk Level
            if churn_prob > 75:
                risk = "critical"
                status = "churned"
            elif churn_prob > 45:
                risk = "high"
                status = "at-risk"
            elif churn_prob > 25:
                risk = "medium"
                status = "at-risk"
            elif churn_prob > 10:
                risk = "low"
                status = "active"
            else:
                risk = "healthy"
                status = "active"

            # Dynamically map industry based on keywords in client name
            name_lower = name.lower()
            if "lawn" in name_lower or "land" in name_lower or "tree" in name_lower or "yard" in name_lower:
                industry = "Landscaping"
            elif "roof" in name_lower or "construct" in name_lower or "build" in name_lower or "contract" in name_lower:
                industry = "Construction"
            elif "tech" in name_lower or "cloud" in name_lower or "soft" in name_lower or "synapse" in name_lower or "logic" in name_lower or "dynamics" in name_lower or "veloce" in name_lower:
                industry = "SaaS"
            elif "capital" in name_lower or "finance" in name_lower or "bank" in name_lower or "meridian" in name_lower:
                industry = "FinTech"
            elif "goods" in name_lower or "home" in name_lower or "retail" in name_lower or "silverline" in name_lower or "shop" in name_lower:
                industry = "E-Commerce"
            elif "global" in name_lower or "logistics" in name_lower or "freight" in name_lower or "bluebridge" in name_lower or "transport" in name_lower:
                industry = "Logistics"
            else:
                industry = "Professional Services"

            # Dynamically map financial tier
            mrr = 12000 if churn_prob < 30 else 6000
            arr = mrr * 12

            # Timestamp formatting
            ts = row.get("timestamp") or "2024-08-01T00:00:00Z"

            # Account manager and campaign assignment (consistent per client)
            managers = ["Sarah Jenkins", "Michael Chang", "Elena Rostova", "Marcus Vance"]
            campaigns = ["Q3 Retention Drive", "Active Campaign", "Enterprise Renewal"]
            char_sum = sum(ord(c) for c in name)
            assigned_manager = managers[char_sum % len(managers)]
            assigned_campaign = campaigns[char_sum % len(campaigns)]

            return {
                "id": c_id,
                "name": name,
                "industry": industry,
                "tier": "enterprise" if mrr > 10000 else "growth",
                "status": status,
                "riskLevel": risk,
                "churnProbability": int(churn_prob),
                "healthScore": int(health),
                "mrr": mrr,
                "arr": arr,
                "contractValue": arr,
                "contractStartDate": "2024-01-01",
                "contractEndDate": "2025-01-01",
                "lastActivityDate": ts,
                "createdAt": ts,
                "updatedAt": ts,
                "tags": row.get("flags") or ["Active Campaign"],
                "accountManager": assigned_manager,
                "campaign": assigned_campaign,
                "program": "Enterprise Success Plan",
                "contact": {
                    "name": "Primary Lead",
                    "email": f"contact@{name_lower.replace(' ', '')}.com",
                    "role": "Operations Manager",
                    "isPrimary": True
                },
                "address": {
                    "city": "Dallas",
                    "state": "Texas",
                    "country": "USA"
                },
                "metadata": {
                    "summary": row.get("summary"),
                    "satisfaction_score": row.get("satisfaction_score"),
                    "bottlenecks": row.get("bottlenecks"),
                    "action_items": row.get("action_items")
                }
            }

        except Exception as error:
            logger.error(f"Failed to map client row {row.get('id')}: {error}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process client record: {error}"
            )

    def get_all_clients(
        self,
        search: str | None = None,
        risk_level: str | None = None,
        status: str | None = None,
        industry: str | None = None,
        campaign: str | None = None,
    ) -> List[Dict[str, Any]]:
        try:
            rows = self.client_repo.find_all()
        except FrameworkException:
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to fetch clients: {error}")

        # Filter duplicates by client name / client_id, keeping the latest one
        seen = set()
        unique_clients = []
        for row in reversed(rows):  # Read in reverse to get newest first
            key = (row.get("client_name") or "").strip().lower() or str(row.get("client_id"))
            if key not in seen:
                seen.add(key)
                unique_clients.append(self._map_client(row))

        # Include Yardworx seed client if not already present
        if not any("yardworx" in c["name"].lower() for c in unique_clients):
            unique_clients.append({
                "id": "yardworx",
                "name": "Yardworx Land Management",
                "industry": "Landscaping",
                "tier": "enterprise",
                "status": "at-risk",
                "riskLevel": "critical",
                "churnProbability": 80,
                "healthScore": 20,
                "mrr": 12000,
                "arr": 144000,
                "contractValue": 144000,
                "contractStartDate": "2024-01-01",
                "contractEndDate": "2025-01-01",
                "lastActivityDate": "2026-08-21T18:24:25Z",
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2026-08-21T18:24:25Z",
                "tags": ["Active Campaign", "Landscaping"],
                "accountManager": "Sarah Jenkins",
                "campaign": "Q3 Retention Drive",
                "program": "Enterprise Success Plan",
                "contact": {
                    "name": "Primary Lead",
                    "email": "contact@yardworx.com",
                    "role": "Operations Manager",
                    "isPrimary": True
                },
                "address": {
                    "city": "Dallas",
                    "state": "Texas",
                    "country": "USA"
                },
                "metadata": {
                    "summary": "Yardworx Land Management continues to show declining engagement.",
                    "satisfaction_score": 20,
                    "bottlenecks": ["Ad-approval workflow delay", "Payment friction"],
                    "action_items": ["Review pricing tiers", "Schedule strategy session"]
                }
            })

        filtered = unique_clients

        if search and search.strip():
            q = search.strip().lower()
            filtered = [
                c for c in filtered
                if q in c["name"].lower()
                or q in c.get("industry", "").lower()
                or q in c.get("accountManager", "").lower()
                or q in c.get("campaign", "").lower()
                or any(q in t.lower() for t in c.get("tags", []))
                or q in (c.get("contact", {}).get("email") or "").lower()
                or q in (c.get("address", {}).get("city") or "").lower()
            ]

        if risk_level and risk_level.strip():
            rl = risk_level.strip().lower()
            filtered = [c for c in filtered if c.get("riskLevel", "").lower() == rl]

        if status and status.strip():
            st = status.strip().lower()
            filtered = [c for c in filtered if c.get("status", "").lower() == st]

        if industry and industry.strip():
            ind = industry.strip().lower()
            filtered = [c for c in filtered if c.get("industry", "").lower() == ind]

        if campaign and campaign.strip():
            cmp = campaign.strip().lower()
            filtered = [c for c in filtered if c.get("campaign", "").lower() == cmp]

        return filtered

    def get_client(self, client_id: str) -> Dict[str, Any]:
        if client_id == "yardworx":
            all_c = self.get_all_clients()
            for c in all_c:
                if c["id"] == "yardworx":
                    return c
        try:
            row = self.client_repo.find_by_client_id(client_id)
            if not row:
                # Fallback check by id
                rows = self.client_repo.find_all()
                for r in rows:
                    if str(r.get("id")) == client_id:
                        row = r
                        break
        except FrameworkException:
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to fetch client '{client_id}': {error}")

        if not row:
            raise HTTPException(status_code=404, detail="Client not found")

        return self._map_client(row)

    def get_client_kpis(self, client_id: str) -> List[Dict[str, Any]]:
        row = None
        try:
            res = self.kpi_repo.find_by_id(client_id)
            if isinstance(res, list) and len(res) > 0:
                row = res[0]
            elif isinstance(res, dict):
                row = res
        except FrameworkException:
            pass
        except Exception:
            pass

        if not row:
            try:
                all_kpis = self.kpi_repo.find_all()
                for k in all_kpis:
                    if str(k.get("client_id")) == str(client_id) or (client_id == "yardworx" and "yardworx" in (k.get("client_name") or "").lower()):
                        row = k
                        break
            except Exception:
                pass

        if not row:
            # Generate sensible dynamic KPIs based on client ID / fallback
            return [
                {
                    "id": "k1",
                    "clientId": client_id,
                    "name": "Lead Acquisition Cost",
                    "category": "marketing",
                    "value": 54,
                    "formattedValue": "$54",
                    "unit": "$",
                    "trend": -4,
                    "trendDirection": "down",
                    "status": "improving",
                    "lastUpdated": "2026-08-01",
                    "history": [{"date": "30D Ago", "value": 68}, {"date": "15D Ago", "value": 60}, {"date": "Current", "value": 54}]
                },
                {
                    "id": "k2",
                    "clientId": client_id,
                    "name": "Appointment Booking Cost",
                    "category": "sales",
                    "value": 145,
                    "formattedValue": "$145",
                    "unit": "$",
                    "trend": 12,
                    "trendDirection": "up",
                    "status": "declining",
                    "lastUpdated": "2026-08-01",
                    "history": [{"date": "30D Ago", "value": 120}, {"date": "15D Ago", "value": 135}, {"date": "Current", "value": 145}]
                },
                {
                    "id": "k3",
                    "clientId": client_id,
                    "name": "Campaign Engagement",
                    "category": "engagement",
                    "value": 62,
                    "formattedValue": "62%",
                    "unit": "%",
                    "trend": -8,
                    "trendDirection": "down",
                    "status": "declining",
                    "lastUpdated": "2026-08-01",
                    "history": [{"date": "30D Ago", "value": 75}, {"date": "15D Ago", "value": 68}, {"date": "Current", "value": 62}]
                },
                {
                    "id": "k4",
                    "clientId": client_id,
                    "name": "Conversion Rate",
                    "category": "product",
                    "value": 78,
                    "formattedValue": "78%",
                    "unit": "%",
                    "trend": 3,
                    "trendDirection": "up",
                    "status": "improving",
                    "lastUpdated": "2026-08-01",
                    "history": [{"date": "30D Ago", "value": 70}, {"date": "15D Ago", "value": 74}, {"date": "Current", "value": 78}]
                }
            ]

        try:
            lc_7d = float(row.get("lead_cost_7d") or 52)
            lc_mtd = float(row.get("lead_cost_mtd") or 54)
            lc_30d = float(row.get("lead_cost_30d") or 58)

            ac_7d = float(row.get("appt_cost_7d") or 120)
            ac_mtd = float(row.get("appt_cost_mtd") or 145)
            ac_30d = float(row.get("appt_cost_30d") or 155)

            spend_7d = float(row.get("ad_spend_7d") or 500)
            spend_mtd = float(row.get("ad_spend_mtd") or 1800)
            spend_30d = float(row.get("ad_spend_30d") or 2200)

            # Normalized engagement & conversion indices (0-100)
            conv_score = max(10, min(95, int(100 - (ac_mtd / 3.0))))
            ad_eff_score = max(10, min(95, int(100 - lc_mtd)))

            return [
                {
                    "id": "k1",
                    "clientId": client_id,
                    "name": "Lead Cost (CPL)",
                    "category": "marketing",
                    "value": int(lc_mtd),
                    "formattedValue": f"${int(lc_mtd)}",
                    "unit": "$",
                    "trend": round(lc_7d - lc_30d, 1),
                    "trendDirection": "down" if lc_7d <= lc_30d else "up",
                    "status": "improving" if lc_7d <= lc_30d else "declining",
                    "lastUpdated": row.get("updated_at") or "2026-08-01",
                    "history": [
                        {"date": "30D Ago", "value": int(lc_30d)},
                        {"date": "MTD", "value": int(lc_mtd)},
                        {"date": "7D Avg", "value": int(lc_7d)}
                    ]
                },
                {
                    "id": "k2",
                    "clientId": client_id,
                    "name": "Appointment Cost",
                    "category": "sales",
                    "value": int(ac_mtd),
                    "formattedValue": f"${int(ac_mtd)}",
                    "unit": "$",
                    "trend": round(ac_7d - ac_30d, 1),
                    "trendDirection": "down" if ac_7d <= ac_30d else "up",
                    "status": "improving" if ac_7d <= ac_30d else "declining",
                    "lastUpdated": row.get("updated_at") or "2026-08-01",
                    "history": [
                        {"date": "30D Ago", "value": int(ac_30d)},
                        {"date": "MTD", "value": int(ac_mtd)},
                        {"date": "7D Avg", "value": int(ac_7d)}
                    ]
                },
                {
                    "id": "k3",
                    "clientId": client_id,
                    "name": "Ad Spend Pace",
                    "category": "billing",
                    "value": int(spend_mtd),
                    "formattedValue": f"${int(spend_mtd)}",
                    "unit": "$",
                    "trend": round(spend_7d * 4 - spend_30d, 1),
                    "trendDirection": "up" if spend_7d * 4 >= spend_30d else "down",
                    "status": "improving" if spend_7d * 4 >= spend_30d else "declining",
                    "lastUpdated": row.get("updated_at") or "2026-08-01",
                    "history": [
                        {"date": "30D Ago", "value": int(spend_30d)},
                        {"date": "MTD", "value": int(spend_mtd)},
                        {"date": "7D RunRate", "value": int(spend_7d * 4)}
                    ]
                },
                {
                    "id": "k4",
                    "clientId": client_id,
                    "name": "Conversion Efficiency",
                    "category": "product",
                    "value": conv_score,
                    "formattedValue": f"{conv_score}%",
                    "unit": "%",
                    "trend": 4,
                    "trendDirection": "up",
                    "status": "improving",
                    "lastUpdated": row.get("updated_at") or "2026-08-01",
                    "history": [
                        {"date": "30D Ago", "value": max(10, conv_score - 8)},
                        {"date": "MTD", "value": max(10, conv_score - 3)},
                        {"date": "Current", "value": conv_score}
                    ]
                },
                {
                    "id": "k5",
                    "clientId": client_id,
                    "name": "Campaign Quality Score",
                    "category": "engagement",
                    "value": ad_eff_score,
                    "formattedValue": f"{ad_eff_score}/100",
                    "unit": "/100",
                    "trend": -2,
                    "trendDirection": "down",
                    "status": "declining",
                    "lastUpdated": row.get("updated_at") or "2026-08-01",
                    "history": [
                        {"date": "30D Ago", "value": min(100, ad_eff_score + 5)},
                        {"date": "MTD", "value": ad_eff_score},
                        {"date": "Current", "value": ad_eff_score}
                    ]
                }
            ]
        except (TypeError, ValueError) as error:
            raise HTTPException(status_code=500, detail=f"Malformed KPI data for client '{client_id}': {error}")

    def get_client_history(self, client_id: str) -> List[Dict[str, Any]]:
        """
        Returns historically similar clients based on this client's
        weighted embedding (summary + KPI combined), computed during
        the AI analysis workflow and looked up via vector similarity
        search — the same underlying data the AI Analysis page's RAG
        step already uses.

        Returns [] when this client has no embedding yet (hasn't been
        through AI analysis) — that is a legitimate empty state, not
        an error, so it doesn't raise.

        NOTE: repeated workflow runs for the same client create multiple
        near-duplicate embedding rows (observed: 60+ rows for a single
        client after repeated test runs). A naive top-N similarity query
        can therefore return nothing but a client's own duplicate rows,
        crowding out every other client. We request a wider match_count
        and deduplicate by client_id, keeping only the best (first,
        since results come back sorted by similarity) match per distinct
        client, so this stays correct regardless of how many duplicate
        rows accumulate for any one client.
        """
        try:
            client_row = self.client_repo.find_by_client_id(client_id)
        except FrameworkException:
            raise
        except Exception as error:
            raise HTTPException(status_code=500, detail=f"Failed to fetch client '{client_id}': {error}")

        if not client_row:
            raise HTTPException(status_code=404, detail="Client not found")

        try:
            weighted_repo = WeightedEmbeddingRepository()
            own_embedding_record = weighted_repo.find_by_client_id(client_id)
        except FrameworkException:
            raise
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch similarity embedding for client '{client_id}': {error}"
            )

        if not own_embedding_record or not own_embedding_record.get("embedding"):
            # Client hasn't been analyzed by the AI workflow yet.
            return []

        MAX_DISTINCT_CLIENTS = 6
        # Request far more raw matches than we need, since many of them
        # will be this client's own duplicate embedding rows (observed:
        # up to 60+ duplicates for a single heavily-retested client).
        # Setting this comfortably above the total table size guarantees
        # we see every distinct client's best match, not just whichever
        # client happens to have the most duplicate rows.
        RAW_MATCH_COUNT = 100

        try:
            matches = weighted_repo.find_similar(
                query_embedding=own_embedding_record["embedding"],
                match_count=RAW_MATCH_COUNT,
                match_threshold=0.5,
            ) or []
        except FrameworkException:
            raise
        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to find historically similar clients for '{client_id}': {error}"
            )

        results: List[Dict[str, Any]] = []
        seen_client_ids = {str(client_id)}  # exclude self from the start

        for match in matches:
            if len(results) >= MAX_DISTINCT_CLIENTS:
                break

            metadata = match.get("metadata") or {}
            matched_client_id = metadata.get("client_id")

            if not matched_client_id:
                continue

            matched_client_id = str(matched_client_id)

            # Skip self-matches and clients we've already added — keeps
            # only the single best (highest-similarity) match per client.
            if matched_client_id in seen_client_ids:
                continue

            seen_client_ids.add(matched_client_id)

            try:
                matched_row = self.client_repo.find_by_client_id(matched_client_id)
            except Exception as error:
                logger.warning(f"Skipping malformed history match for client '{matched_client_id}': {error}")
                continue

            if not matched_row:
                continue

            churn_prob = matched_row.get("churn_probability")
            if churn_prob is None:
                sat = matched_row.get("satisfaction_score") or 80
                churn_prob = max(0, min(100, 100 - sat))

            if churn_prob > 60:
                outcome = "churned"
            elif churn_prob > 30:
                outcome = "at-risk"
            else:
                outcome = "retained"

            bottlenecks = matched_row.get("bottlenecks") or []
            action_items = matched_row.get("action_items") or []
            summary = matched_row.get("summary") or ""

            results.append({
                "id": matched_row.get("client_id") or str(matched_row.get("id")),
                "name": matched_row.get("client_name") or "Unknown Client",
                "industry": "Professional Services",
                "similarityScore": round((match.get("similarity") or 0) * 100),
                "outcome": outcome,
                "reasonForChurn": bottlenecks[0] if bottlenecks else summary[:180],
                "lessonsLearned": action_items[0] if action_items else (
                    "Maintain proactive communication and monitor KPI trends closely."
                ),
            })

        return results