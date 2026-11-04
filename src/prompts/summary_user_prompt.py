SUMMARY_USER_PROMPT = """
Update the client summary using the existing summary and the latest batch of CRM updates.

The previous summary represents the client's historical state.

The CRM updates contain new information that must be merged into the historical summary.

Do NOT rewrite the summary from scratch.

Instead:

• Preserve important historical information.
• Add important new information.
• Remove duplicated information.
• Replace outdated information with newer facts.
• Ignore insignificant conversational details.
• Produce a single updated summary that will become the client's new historical summary.

========================
CLIENT DETAILS
========================

Client Name:
{client_name}

Client ID:
{client_id}

========================
CURRENT CLIENT SUMMARY
========================

{previous_summary}

========================
NEW CRM UPDATES
========================

{new_updates}
"""