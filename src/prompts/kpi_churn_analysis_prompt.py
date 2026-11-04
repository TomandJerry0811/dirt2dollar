from src.domain.entities.workflow_context import WorkflowContext


def build_kpi_churn_analysis_prompt(
    context: WorkflowContext
) -> str:
    """
    Build the prompt for KPI-based churn analysis.

    The model will analyze:
    - current KPI snapshot
    - KPI interpretation
    - top 5 similar historical KPI matches

    The model must return strict JSON only.
    """

    historical_matches = []

    for index, match in enumerate(context.kpi_matches, start=1):
        historical_matches.append(
            f"""
Historical KPI Match {index}
Client ID: {match.get('client_id', 'N/A')}
Client Name: {match.get('client_name', 'N/A')}
Similarity: {match.get('similarity', 'N/A')}
KPI Summary:
{match.get('summary', 'N/A')}
""".strip()
        )

    historical_matches_block = (
        "\n\n".join(historical_matches)
        if historical_matches
        else "No historical KPI matches available."
    )

    return f"""
You are an expert churn-risk analyst specializing in KPI interpretation.

Analyze churn risk for the current client using ONLY:
1. The current KPI snapshot
2. The KPI interpretation
3. The retrieved top similar historical KPI records

Your job:
- Compare the current KPI situation with historical KPI cases
- Identify KPI red flags
- Identify KPI bottlenecks
- Extract KPI-based historical insights
- Estimate churn probability as an integer from 0 to 100
- Provide a concise KPI analysis

Important rules:
- Use only the provided information
- Do not invent facts
- Return STRICT JSON only
- Do not return markdown
- Do not return code fences
- Do not return any explanation outside JSON

Current Client
Client ID: {context.client_id or 'N/A'}
Client Name: {context.client_name or 'N/A'}

Current KPI Snapshot
{context.kpi_dataset.get("current_kpis", {})}

Current KPI Interpretation
{context.kpi_interpretation or {}}

Historical Similar KPI Clients
{historical_matches_block}

Return JSON with exactly this structure:
{{
  "probability": 0,
  "analysis": "string",
  "red_flags": ["string"],
  "bottlenecks": ["string"],
  "historical_insights": ["string"]
}}

Additional rules:
- probability must be an integer between 0 and 100
- analysis must be a concise KPI-focused business explanation
- red_flags must contain short KPI risk observations
- bottlenecks must contain short KPI-related constraints/issues
- historical_insights must compare current KPI patterns with historical KPI patterns
""".strip()