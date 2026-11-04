
from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.repositories.campaign_stage_repository import (
    CampaignStageRepository
)
from src.core.exceptions import ValidationException, ServiceException, RepositoryException


class FinalChurnProbabilityNode(BaseService):
    """
    Calculates the final churn probability
    using the predefined business rules.

    Business Rules

    Case 1
    --------
    Summary >= 70 and KPI >= 70

        Final Probability = Average
        Risk = High

    Case 2
    --------
    Summary >= 70

        Summary dominates
        Final Probability = Summary Probability
        Risk = High

    Case 3
    --------
    Summary < 70 and KPI < 70

        Fetch campaign-stage weights

        Final Probability =
            Summary × Updates Weight +
            KPI × KPI Weight
    """

    def __init__(self):
        super().__init__(
            service_name="Final Churn Probability Service",
            service_type="BUSINESS"
        )

        self.campaign_stage_repository = (
            CampaignStageRepository()
        )

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(
        self,
        context: WorkflowContext
    ):
        if context.summary_probability is None:
            raise ValidationException(
                "Summary probability is required."
            )

        if context.kpi_probability is None:
            raise ValidationException(
                "KPI probability is required."
            )

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:

        try:
            summary = float(context.summary_probability)
            kpi = float(context.kpi_probability)
        except (TypeError, ValueError) as error:
            raise ServiceException(
                f"Summary/KPI probability is not numeric: {error}"
            )

        # ---------------------------------------------
        # Case 1
        # Both probabilities are High
        # ---------------------------------------------

        if summary >= 70 and kpi >= 70:
            context.final_probability = round(
                (
                    summary + kpi
                ) / 2,
                2
            )

            context.risk_level = "High"

        # ---------------------------------------------
        # Case 2
        # Summary dominates
        # ---------------------------------------------

        elif summary >= 70:
            context.final_probability = round(
                summary,
                2
            )

            context.risk_level = "High"

        # ---------------------------------------------
        # Case 3
        # Weighted Average
        # ---------------------------------------------

        else:
            current_kpis = context.current_kpis or {}

            campaign_stage = (
                current_kpis.get("program_stage")
                or current_kpis.get("campaign_stage")
            )

            if not campaign_stage:
                raise ValidationException(
                    "Campaign stage is required to fetch "
                    "campaign-stage weights."
                )

            try:
                response = (
                    self.campaign_stage_repository
                    .find_by_campaign_stage(
                        campaign_stage
                    )
                )
            except RepositoryException:
                raise
            except Exception as error:
                raise ServiceException(
                    f"Failed to fetch campaign-stage weights for '{campaign_stage}': {error}"
                )

            if not response:
                raise ServiceException(
                    f"No campaign weights found for "
                    f"{campaign_stage}"
                )

            # The repository already returns one dictionary row.
            weights = response

            try:
                update_weight = float(
                    weights["updates_weight"]
                )

                kpi_weight = float(
                    weights["kpi_weight"]
                )
            except (KeyError, TypeError, ValueError) as error:
                raise ServiceException(
                    f"Malformed campaign-stage weights for '{campaign_stage}': {error}"
                )

            context.final_probability = round(
                (
                    summary * update_weight
                )
                +
                (
                    kpi * kpi_weight
                ),
                1
            )

            # -----------------------------------------
            # Risk Level
            # -----------------------------------------

            if context.final_probability >= 70:
                context.risk_level = "High"

            elif context.final_probability >= 40:
                context.risk_level = "Medium"

            else:
                context.risk_level = "Low"

        # -------------------------------------------------
        # Merge Summary & KPI Analysis
        # -------------------------------------------------

        analysis = []

        if context.summary_analysis:
            analysis.append(
                f"Summary Analysis\n"
                f"-----------------\n"
                f"{context.summary_analysis}"
            )

        if context.kpi_analysis:
            analysis.append(
                f"KPI Analysis\n"
                f"-------------\n"
                f"{context.kpi_analysis}"
            )

        context.final_analysis = (
            "\n\n"
            "========================================"
            "\n\n"
        ).join(analysis)

        # -------------------------------------------------
        # Merge Red Flags
        # -------------------------------------------------

        context.final_red_flags = list(
            dict.fromkeys(
                (context.summary_red_flags or [])
                +
                (context.kpi_red_flags or [])
            )
        )

        # -------------------------------------------------
        # Merge Bottlenecks
        # -------------------------------------------------

        context.final_bottlenecks = list(
            dict.fromkeys(
                (context.summary_bottlenecks or [])
                +
                (context.kpi_bottlenecks or [])
            )
        )

        # -------------------------------------------------
        # Merge Historical Insights
        # -------------------------------------------------

        context.final_historical_insights = list(
            dict.fromkeys(
                (context.summary_historical_insights or [])
                +
                (context.kpi_historical_insights or [])
            )
        )

        return context
