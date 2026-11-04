from src.domain.entities.workflow_context import WorkflowContext


def _truncate_text(
    value,
    max_chars: int
) -> str:
    """
    Convert a value to text and limit its size.
    """

    if value is None:
        return ""

    text = str(value).strip()

    if len(text) <= max_chars:
        return text

    return (
        text[:max_chars].rstrip()
        + "\n[内容 truncated]"
    )


def build_summary_churn_analysis_prompt(
    context: WorkflowContext
) -> str:
    """
    Build the prompt for summary/update-based churn analysis.

    The prompt uses:
    - The current client summary.
    - Up to five similar historical summaries.

    Large text fields are truncated to stay within
    Groq's tokens-per-minute limit.
    """

    current_summary = (
        context.updated_summary
        or context.final_client_summary
        or context.summary
        or context.formatted_update_history
        or "No current summary available."
    )

    current_summary = _truncate_text(
        current_summary,
        max_chars=3500
    )

    historical_matches = []

    for index, match in enumerate(
        (context.summary_matches or [])[:5],
        start=1
    ):
        historical_summary = _truncate_text(
            match.get(
                "summary",
                "N/A"
            ),
            max_chars=1400
        )

        historical_matches.append(
            f"""
Historical Match {index}
Client ID: {match.get('client_id', 'N/A')}
Client Name: {match.get('client_name', 'N/A')}
Similarity: {match.get('similarity', 'N/A')}
Summary:
{historical_summary}
""".strip()
        )

    historical_matches_block = (
        "\n\n".join(historical_matches)
        if historical_matches
        else "No historical matches available."
    )

    return f"""
You are an expert churn-risk analyst.

Analyze churn risk for the current client using only:
1. The current client summary/update information.
2. The retrieved similar historical client summaries.

Your tasks:
- Compare the current client with historical clients.
- Identify red flags.
- Identify operational bottlenecks.
- Extract useful historical insights.
- Estimate churn probability from 0 to 100.
- Provide a concise business analysis.

Rules:
- Use only the information provided.
- Do not invent facts.
- Return one valid JSON object only.
- Do not return Markdown.
- Do not return code fences.
- Do not include explanations outside the JSON object.
- The probability must be an integer between 0 and 100.
- Keep every array item short and actionable.

Current Client:
Client ID: {context.client_id or 'N/A'}
Client Name: {context.client_name or 'N/A'}

Current Summary:
{current_summary}

Historical Similar Clients:
{historical_matches_block}

Return exactly this JSON structure:
{{
  "probability": 0,
  "analysis": "string",
  "red_flags": ["string"],
  "bottlenecks": ["string"],
  "historical_insights": ["string"]
}}
""".strip()