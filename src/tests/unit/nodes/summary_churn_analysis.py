import json
import unittest
from unittest.mock import patch

from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.summary_churn_analysis_node import (
    SummaryChurnAnalysisNode
)


VALID_SUMMARY_RESULT = {
    "probability": 72,
    "analysis": (
        "Client shows elevated churn risk due to reduced engagement, "
        "payment friction, and patterns similar to prior at-risk clients."
    ),
    "red_flags": [
        "Reduced recent engagement",
        "Signs of payment friction"
    ],
    "bottlenecks": [
        "Weak follow-up cadence",
        "Low response momentum"
    ],
    "historical_insights": [
        "Similar historical clients showed churn after prolonged engagement decline",
        "Payment friction was a recurring precursor in matched historical cases"
    ]
}


class TestSummaryChurnAnalysisService(unittest.TestCase):

    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
    )
    def test_valid_summary_analysis_stores_results(
        self,
        MockGroqProvider
    ):
        """
        Valid summary input and valid model JSON output
        should populate all summary churn fields.
        """

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(VALID_SUMMARY_RESULT),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 100,
                "completion_tokens": 80,
                "total_tokens": 180
            },
            "finish_reason": "stop"
        }

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()
        context.client_id = "182135"
        context.client_name = "Yardworx Land Management"

        context.updated_summary = (
            "Client engagement has declined and delayed "
            "payments have appeared."
        )

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": (
                    "Historical client with declining engagement."
                ),
                "similarity": 0.89
            },
            {
                "client_id": "1002",
                "client_name": "Client B",
                "summary": (
                    "Historical client with payment issues."
                ),
                "similarity": 0.84
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        result = service.process(context)

        print("\n========== MOCK SUMMARY CHURN REPORT ==========")
        print(f"Client ID           : {context.client_id}")
        print(f"Client Name         : {context.client_name}")
        print(f"Probability         : {result.summary_probability}%")
        print(f"Analysis            : {result.summary_analysis}")

        print("\nRed Flags:")
        for flag in result.summary_red_flags:
            print(f"  • {flag}")

        print("\nBottlenecks:")
        for item in result.summary_bottlenecks:
            print(f"  • {item}")

        print("\nHistorical Insights:")
        for item in result.summary_historical_insights:
            print(f"  • {item}")

        print("==============================================\n")

        self.assertEqual(result.summary_probability, 72)

        self.assertEqual(
            result.summary_analysis,
            VALID_SUMMARY_RESULT["analysis"]
        )

        self.assertEqual(
            result.summary_red_flags,
            VALID_SUMMARY_RESULT["red_flags"]
        )

        self.assertEqual(
            result.summary_bottlenecks,
            VALID_SUMMARY_RESULT["bottlenecks"]
        )

        self.assertEqual(
            result.summary_historical_insights,
            VALID_SUMMARY_RESULT["historical_insights"]
        )

        self.assertEqual(
            result.llm_usage["summary_prompt_tokens"],
            100
        )

        self.assertEqual(
            result.llm_usage["summary_completion_tokens"],
            80
        )

        self.assertEqual(
            result.llm_usage["summary_total_tokens"],
            180
        )

        self.assertEqual(
            result.metadata["summary_analysis_model"],
            "test-groq-model"
        )

        self.assertTrue(
            result.metadata["summary_analysis_completed"]
        )

        mock_provider.generate_response.assert_called_once()

    def test_missing_summary_text_raises_value_error(self):
        """
        Service should fail when no current summary/update text exists.
        """

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
                "similarity": 0.88
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Current summary/update text is required before summary churn analysis."
        )

    def test_missing_summary_matches_raises_value_error(self):
        """
        Service should fail when historical summary matches are missing.
        """

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()

        context.updated_summary = (
            "Current client summary text"
        )

        context.summary_matches = []

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Summary matches are required before summary churn analysis."
        )
    
    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
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
            "content": "this is not valid json",
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 50,
                "completion_tokens": 20,
                "total_tokens": 70
            },
            "finish_reason": "stop"
        }

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()
        context.updated_summary = "Current client summary text"

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
                "similarity": 0.88
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertIn(
            "Failed to parse summary churn analysis JSON",
            str(error.exception)
        )

    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
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
                "probability": 65,
                "analysis": "Some analysis"
            }),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 40,
                "completion_tokens": 30,
                "total_tokens": 70
            },
            "finish_reason": "stop"
        }

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()
        context.updated_summary = "Current client summary text"

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
                "similarity": 0.88
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertIn(
            "Summary churn analysis missing keys",
            str(error.exception)
        )

    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
    )
    def test_non_integer_probability_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Service should fail when probability is not an integer.
        """

        invalid_result = {
            "probability": "72",
            "analysis": "Some analysis",
            "red_flags": ["flag"],
            "bottlenecks": ["bottleneck"],
            "historical_insights": ["insight"]
        }

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(invalid_result),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 40,
                "completion_tokens": 30,
                "total_tokens": 70
            },
            "finish_reason": "stop"
        }

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()
        context.updated_summary = "Current client summary text"

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
                "similarity": 0.88
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Summary churn probability must be an integer."
        )
    
    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
    )
    def test_probability_out_of_range_raises_value_error(
        self,
        MockGroqProvider
    ):
        """
        Probability must lie between 0 and 100.
        """

        invalid_result = {
            "probability": 150,
            "analysis": "Some analysis",
            "red_flags": [
                "Flag 1"
            ],
            "bottlenecks": [
                "Bottleneck 1"
            ],
            "historical_insights": [
                "Historical insight"
            ]
        }

        mock_provider = MockGroqProvider.return_value

        mock_provider.generate_response.return_value = {
            "content": json.dumps(invalid_result),
            "model": "test-groq-model",
            "usage": {
                "prompt_tokens": 40,
                "completion_tokens": 25,
                "total_tokens": 65
            },
            "finish_reason": "stop"
        }

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()

        context.updated_summary = (
            "Client engagement has significantly reduced over the last month."
        )

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
                "similarity": 0.89
            }
        ]

        context.llm_usage = {}
        context.metadata = {}

        with self.assertRaises(ValueError) as error:
            service.process(context)

        self.assertEqual(
            str(error.exception),
            "Summary churn probability must be between 0 and 100."
        )

    @patch(
        "src.services.summary_churn_analysis_service.GroqProvider"
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

        service = SummaryChurnAnalysisNode()

        context = WorkflowContext()

        context.updated_summary = (
            "Client engagement has significantly reduced."
        )

        context.summary_matches = [
            {
                "client_id": "1001",
                "client_name": "Client A",
                "summary": "Historical summary",
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