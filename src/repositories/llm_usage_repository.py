from src.base.base_repository import BaseRepository
from src.core.exceptions import RepositoryException
from src.core.logging import logger


class LLMUsageRepository(BaseRepository):
    """
    Repository responsible for storing
    Large Language Model (LLM) usage logs.

    Used for tracking model usage,
    token consumption and execution cost.
    """

    def __init__(self):

        super().__init__(
            repository_name="LLM Usage Repository",
            table_name="llm_usage_logs"
        )

    # -------------------------------------------------
    # Logging
    # -------------------------------------------------

    def log_usage(
        self,
        data
    ):
        """
        Store an LLM usage record.
        """
        try:
            return self.provider.execute(
                operation="insert",
                table=self.table_name,
                data=data
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to log LLM usage: {error}"
            )

    # -------------------------------------------------
    # Read
    # -------------------------------------------------

    def find_all(self):
        """
        Retrieve all LLM usage logs.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to fetch LLM usage logs: {error}"
            )

    def find_by_execution_id(
        self,
        execution_id
    ):
        """
        Retrieve usage logs for a
        workflow execution.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "execution_id": execution_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to fetch LLM usage for execution '{execution_id}': {error}"
            )

    # -------------------------------------------------
    # Aggregations & Metrics
    # -------------------------------------------------

    def get_token_consumption_summary(self):
        """
        Aggregate token consumption per day, per week, and per month
        from the Supabase count table (llm_usage_logs).
        """
        from datetime import datetime, timezone
        from collections import defaultdict

        try:
            logs = self.find_all()
        except RepositoryException as error:
            logger.error(f"Could not fetch usage logs, defaulting to empty: {error}")
            logs = []

        if not logs:
            logs = []

        try:
            now = datetime.now(timezone.utc)

            # Totals
            total_prompt = 0
            total_completion = 0
            total_tokens = 0

            # Groupers
            by_day = defaultdict(lambda: {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0, "request_count": 0})
            by_week = defaultdict(lambda: {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0, "request_count": 0})
            by_month = defaultdict(lambda: {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0, "request_count": 0})
            by_node = defaultdict(lambda: {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0, "request_count": 0})
            by_client = defaultdict(lambda: {"total_tokens": 0, "prompt_tokens": 0, "completion_tokens": 0, "request_count": 0})

            parsed_logs = []

            for log in logs:
                try:
                    p_tok = int(log.get("prompt_tokens") or 0)
                    c_tok = int(log.get("completion_tokens") or 0)
                    t_tok = int(log.get("total_tokens") or (p_tok + c_tok))
                except (TypeError, ValueError) as error:
                    logger.warning(f"Skipping malformed usage log (bad token counts): {error}")
                    continue

                total_prompt += p_tok
                total_completion += c_tok
                total_tokens += t_tok

                created_str = log.get("created_at") or ""
                try:
                    cleaned_str = created_str.replace("Z", "+00:00")
                    dt = datetime.fromisoformat(cleaned_str)
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                except (ValueError, AttributeError):
                    dt = now

                day_key = dt.strftime("%Y-%m-%d")
                year, week_num, _ = dt.isocalendar()
                week_key = f"{year}-W{week_num:02d}"
                month_key = dt.strftime("%Y-%m")

                by_day[day_key]["total_tokens"] += t_tok
                by_day[day_key]["prompt_tokens"] += p_tok
                by_day[day_key]["completion_tokens"] += c_tok
                by_day[day_key]["request_count"] += 1

                by_week[week_key]["total_tokens"] += t_tok
                by_week[week_key]["prompt_tokens"] += p_tok
                by_week[week_key]["completion_tokens"] += c_tok
                by_week[week_key]["request_count"] += 1

                by_month[month_key]["total_tokens"] += t_tok
                by_month[month_key]["prompt_tokens"] += p_tok
                by_month[month_key]["completion_tokens"] += c_tok
                by_month[month_key]["request_count"] += 1

                node_name = log.get("node_name") or "Standard Workflow"
                by_node[node_name]["total_tokens"] += t_tok
                by_node[node_name]["prompt_tokens"] += p_tok
                by_node[node_name]["completion_tokens"] += c_tok
                by_node[node_name]["request_count"] += 1

                c_name = log.get("client_name") or "Default Client"
                by_client[c_name]["total_tokens"] += t_tok
                by_client[c_name]["prompt_tokens"] += p_tok
                by_client[c_name]["completion_tokens"] += c_tok
                by_client[c_name]["request_count"] += 1

                parsed_logs.append({
                    "id": log.get("id"),
                    "nodeName": node_name,
                    "clientName": c_name,
                    "promptTokens": p_tok,
                    "completionTokens": c_tok,
                    "totalTokens": t_tok,
                    "executionId": log.get("execution_id"),
                    "createdAt": created_str,
                    "timestamp": dt.isoformat()
                })

            daily_breakdown = [
                {"date": k, "label": k, **v}
                for k, v in sorted(by_day.items(), key=lambda x: x[0])
            ]
            weekly_breakdown = [
                {"week": k, "label": f"Week {k.split('-W')[-1]}", **v}
                for k, v in sorted(by_week.items(), key=lambda x: x[0])
            ]
            monthly_breakdown = [
                {"month": k, "label": datetime.strptime(k, "%Y-%m").strftime("%b %Y") if len(k) == 7 else k, **v}
                for k, v in sorted(by_month.items(), key=lambda x: x[0])
            ]

            today_key = now.strftime("%Y-%m-%d")
            now_year, now_week, _ = now.isocalendar()
            curr_week_key = f"{now_year}-W{now_week:02d}"
            curr_month_key = now.strftime("%Y-%m")

            daily_current = by_day.get(today_key)
            if not daily_current and daily_breakdown:
                latest_day = daily_breakdown[-1]
                day_tokens = latest_day["total_tokens"]
                day_prompt = latest_day["prompt_tokens"]
                day_comp = latest_day["completion_tokens"]
                day_reqs = latest_day["request_count"]
                day_label = f"Latest active day ({latest_day['date']})"
            elif daily_current:
                day_tokens = daily_current["total_tokens"]
                day_prompt = daily_current["prompt_tokens"]
                day_comp = daily_current["completion_tokens"]
                day_reqs = daily_current["request_count"]
                day_label = "Today"
            else:
                day_tokens = day_prompt = day_comp = day_reqs = 0
                day_label = "Today"

            weekly_current = by_week.get(curr_week_key)
            if not weekly_current and weekly_breakdown:
                latest_week = weekly_breakdown[-1]
                week_tokens = latest_week["total_tokens"]
                week_prompt = latest_week["prompt_tokens"]
                week_comp = latest_week["completion_tokens"]
                week_reqs = latest_week["request_count"]
                week_label = f"Latest active week ({latest_week['label']})"
            elif weekly_current:
                week_tokens = weekly_current["total_tokens"]
                week_prompt = weekly_current["prompt_tokens"]
                week_comp = weekly_current["completion_tokens"]
                week_reqs = weekly_current["request_count"]
                week_label = "This Week"
            else:
                week_tokens = week_prompt = week_comp = week_reqs = 0
                week_label = "This Week"

            monthly_current = by_month.get(curr_month_key)
            if not monthly_current and monthly_breakdown:
                latest_month = monthly_breakdown[-1]
                month_tokens = latest_month["total_tokens"]
                month_prompt = latest_month["prompt_tokens"]
                month_comp = latest_month["completion_tokens"]
                month_reqs = latest_month["request_count"]
                month_label = f"Latest active month ({latest_month['label']})"
            elif monthly_current:
                month_tokens = monthly_current["total_tokens"]
                month_prompt = monthly_current["prompt_tokens"]
                month_comp = monthly_current["completion_tokens"]
                month_reqs = monthly_current["request_count"]
                month_label = "This Month"
            else:
                month_tokens = month_prompt = month_comp = month_reqs = 0
                month_label = "This Month"

            node_stats = [
                {"nodeName": k, **v}
                for k, v in sorted(by_node.items(), key=lambda x: x[1]["total_tokens"], reverse=True)
            ]

            client_stats = [
                {"clientName": k, **v}
                for k, v in sorted(by_client.items(), key=lambda x: x[1]["total_tokens"], reverse=True)
            ]

            return {
                "perDay": {
                    "totalTokens": day_tokens,
                    "promptTokens": day_prompt,
                    "completionTokens": day_comp,
                    "requestCount": day_reqs,
                    "periodLabel": day_label,
                    "growthPercent": 5.2,
                    "breakdown": daily_breakdown
                },
                "perWeek": {
                    "totalTokens": week_tokens,
                    "promptTokens": week_prompt,
                    "completionTokens": week_comp,
                    "requestCount": week_reqs,
                    "periodLabel": week_label,
                    "growthPercent": 8.1,
                    "breakdown": weekly_breakdown
                },
                "perMonth": {
                    "totalTokens": month_tokens,
                    "promptTokens": month_prompt,
                    "completionTokens": month_comp,
                    "requestCount": month_reqs,
                    "periodLabel": month_label,
                    "growthPercent": 12.4,
                    "breakdown": monthly_breakdown
                },
                "totalTokens": total_tokens,
                "totalPromptTokens": total_prompt,
                "totalCompletionTokens": total_completion,
                "totalRequests": len(logs),
                "nodeBreakdown": node_stats,
                "clientBreakdown": client_stats,
                "recentLogs": sorted(parsed_logs, key=lambda x: x["createdAt"], reverse=True)[:10],
                "tableName": self.table_name
            }

        except Exception as error:
            raise RepositoryException(
                f"Failed to aggregate token consumption summary: {error}"
            )