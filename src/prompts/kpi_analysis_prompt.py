from typing import Any, Dict, List, Optional
import json


# --------------------------------------------------------------------------
# System Prompt
# --------------------------------------------------------------------------

KPI_ANALYSIS_SYSTEM_PROMPT = """
You are an expert business KPI analyst specializing in customer health and
churn prediction.

Analyze the provided KPI metrics and detected business patterns.

Return ONLY valid JSON.

Do not include markdown.
Do not include explanations.
Do not wrap the response inside ```.

Return this exact JSON structure:

{
    "overall_health": "",
    "business_summary": "",
    "positive_signals": [],
    "risk_factors": [],
    "recommendations": []
}
""".strip()


# --------------------------------------------------------------------------
# User Prompt Builder
# --------------------------------------------------------------------------

def build_kpi_analysis_prompt(
    client_name: Optional[str],
    current_kpis: Dict[str, Any],
    matched_patterns: List[Dict[str, Any]],
    overall_severity: str
) -> str:
    """
    Build prompt for KPI analysis.
    """

    pattern_summary = []

    for pattern in matched_patterns:
        pattern_summary.append(
            {
                "pattern": pattern.get("pattern_key"),
                "category": pattern.get("category"),
                "severity": pattern.get("severity"),
                "interpretation": pattern.get("interpretation")
            }
        )

    return f"""
Client Name:
{client_name}

Overall Severity:
{overall_severity}

Current KPI Values:
{json.dumps(current_kpis, indent=2)}

Detected Business Patterns:
{json.dumps(pattern_summary, indent=2)}

Analyze the client's KPI performance and return ONLY valid JSON.

The JSON must follow exactly this schema:

{{
    "overall_health": "Healthy | Moderate Risk | High Risk | Critical",
    "business_summary": "2-3 sentence summary.",
    "positive_signals": [
        "signal 1",
        "signal 2"
    ],
    "risk_factors": [
        "risk 1",
        "risk 2"
    ],
    "recommendations": [
        "recommendation 1",
        "recommendation 2",
        "recommendation 3"
    ]
}}

Do not return markdown.
Do not return explanations.
Return only JSON.
""".strip()