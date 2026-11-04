import json
import unittest
from unittest.mock import patch

from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.kpi_churn_analysis_node import (
    KPIChurnAnalysisNode
)


VALID_KPI_RESULT = {
    "probability": 68,
    "analysis": (
        "Client KPI profile indicates moderate-to-high churn risk due to "
        "weak satisfaction and deteriorating performance patterns."
    ),
    "red_flags": [
        "Declining satisfaction indicator",
        "Weak KPI trend consistency"
    ],
    "bottlenecks": [
        "Low operational momentum",
        "Unstable program progression"
    ],
    "historical_insights": [
        "Matched KPI profiles often preceded churn when satisfaction weakened",
        "Historical peers with similar KPI patterns had elevated risk"
    ]
}


class TestKPIChurnAnalysisNode(unittest.TestCase):

    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_valid_kpi_analysis_stores_results(
        self,
        MockGroqProvider
    ):
        """
        Valid KPI input and valid model JSON output
        should populate all KPI churn fields.
        """

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(VALID_KPI_RESULT),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 110,
                "completion_tokens": 90,
                "total_tokens": 200
            },
            "finish_reason": "stop"
        }

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.client_id = "182135"
        context.client_name = "Yardworx Land Management"

        context.current_kpis = {
            "nps": 4,
            "engagement_score": 52,
            "retention_score": 48
        }

        context.kpi_interpretation = {
            "summary":
                "KPIs suggest weakening engagement and satisfaction."
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary":
                    "Historical KPI case with weak retention signals.",
                "similarity": 0.91
            },
            {
                "client_id": "2002",
                "client_name": "Client Y",
                "summary":
                    "Historical KPI case with falling engagement scores.",
                "similarity": 0.86
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        result = service.process(context)

        self.assertEqual(result.kpi_probability, 68)

        self.assertEqual(
            result.kpi_analysis,
            VALID_KPI_RESULT["analysis"]
        )

        self.assertEqual(
            result.kpi_red_flags,
            VALID_KPI_RESULT["red_flags"]
        )

        self.assertEqual(
            result.kpi_bottlenecks,
            VALID_KPI_RESULT["bottlenecks"]
        )

        self.assertEqual(
            result.kpi_historical_insights,
            VALID_KPI_RESULT["historical_insights"]
        )

        self.assertEqual(
            result.llm_usage["kpi_prompt_tokens"],
            110
        )

        self.assertEqual(
            result.llm_usage["kpi_completion_tokens"],
            90
        )

        self.assertEqual(
            result.llm_usage["kpi_total_tokens"],
            200
        )

        self.assertEqual(
            result.metadata["kpi_analysis_model"],
            "test-groq-model"
        )

        self.assertTrue(
            result.metadata["kpi_analysis_completed"]
        )

        mock_provider.generate_response.assert_called_once()

    def test_missing_current_kpis_raises_value_error(self):

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {}

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Current KPIs are required before KPI churn analysis."
        )

    def test_missing_kpi_interpretation_raises_value_error(self):

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {}

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "KPI interpretation is required before KPI churn analysis."
        )

    def test_missing_kpi_matches_raises_value_error(self):

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = []

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "KPI matches are required before KPI churn analysis."
        )
    
    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_invalid_json_response_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Service should fail when model content is not valid JSON.
        """

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": "not a valid json response",
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 60,
                "completion_tokens": 30,
                "total_tokens": 90
            },
            "finish_reason": "stop"
        }

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertIn(
            "Failed to parse KPI churn analysis JSON",
            str(error.exception)
        )


    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_missing_required_keys_in_llm_output_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Service should fail when required JSON keys are missing.
        """

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps({
                "probability": 55,
                "analysis": "Some KPI analysis"
            }),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 60,
                "completion_tokens": 30,
                "total_tokens": 90
            },
            "finish_reason": "stop"
        }

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertIn(
            "KPI churn analysis missing keys",
            str(error.exception)
        )


    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_non_integer_probability_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Service should fail when KPI probability is not an integer.
        """

        invalid_result = {
            "probability": "68",
            "analysis": "Some KPI analysis",
            "red_flags": [
                "flag"
            ],
            "bottlenecks": [
                "bottleneck"
            ],
            "historical_insights": [
                "insight"
            ]
        }

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(invalid_result),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 60,
                "completion_tokens": 30,
                "total_tokens": 90
            },
            "finish_reason": "stop"
        }

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "KPI churn probability must be an integer."
        )

    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_probability_out_of_range_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Service should fail when KPI probability is outside 0 to 100.
        """

        invalid_result = {
            "probability": 140,
            "analysis": "Some KPI analysis",
            "red_flags": [
                "flag"
            ],
            "bottlenecks": [
                "bottleneck"
            ],
            "historical_insights": [
                "insight"
            ]
        }

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(invalid_result),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 60,
                "completion_tokens": 30,
                "total_tokens": 90
            },
            "finish_reason": "stop"
        }

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4
        }

        context.kpi_interpretation = {
            "summary": "Some KPI interpretation"
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "KPI churn probability must be between 0 and 100."
        )


    @patch(
        "src.services.kpi_churn_analysis_service.GroqProvider"
    )
    def test_generate_response_exception_is_propagated(
        self,
        MockGroqProvider
    ):
        """
        Any provider exception should propagate upward.
        """

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.side_effect = RuntimeError(
            "Groq API unavailable"
        )

        service = KPIChurnAnalysisNode()

        context = WorkflowContext()

        context.current_kpis = {
            "nps": 4,
            "engagement_score": 52,
            "retention_score": 48
        }

        context.kpi_interpretation = {
            "summary": "KPIs suggest weakening engagement."
        }

        context.kpi_matches = [
            {
                "client_id": "2001",
                "client_name": "Client X",
                "summary": "Historical KPI summary",
                "similarity": 0.91
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(RuntimeError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Groq API unavailable"
        )

        mock_provider.generate_response.assert_called_once()


if __name__ == "__main__":
    unittest.main()