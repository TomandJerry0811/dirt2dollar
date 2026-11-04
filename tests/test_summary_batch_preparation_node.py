
from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.summary_batch_preparation_node import (
    SummaryBatchPreparationNode,
)


def test_tc150_batches_valid_client_updates():
    updates = [
        {
            "created_at": f"2026-11-{i:02d}T10:00:00",
            "creator_name": f"Test User {i}",
            "body": f"Update {i}: " + ("A" * 2200),
        }
        for i in range(1, 13)
    ]

    context = WorkflowContext(
        client_id="TEST150",
        client_updates=updates,
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    assert result.summary_batches
    assert len(result.summary_batches) == 3

    assert sum(
        batch["update_count"]
        for batch in result.summary_batches
    ) == 12

    assert all(
        batch["text"]
        for batch in result.summary_batches
    )

    assert [
        batch["batch_index"]
        for batch in result.summary_batches
    ] == [1, 2, 3]

    assert all(
        batch["batch_count"] == 3
        for batch in result.summary_batches
    )


def test_tc151_verifies_batch_metadata():
    updates = [
        {
            "created_at": f"2026-11-{i:02d}T10:00:00",
            "creator_name": f"Test User {i}",
            "body": f"Update {i}: " + ("A" * 2200),
        }
        for i in range(1, 13)
    ]

    context = WorkflowContext(
        client_id="TEST151",
        client_updates=updates,
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    batches = result.summary_batches

    assert len(batches) == 3

    for index, batch in enumerate(batches, start=1):
        assert batch["batch_index"] == index
        assert batch["batch_count"] == 3
        assert batch["update_count"] == 4
        
import pytest


def test_tc152_raises_value_error_when_client_updates_are_empty():
    context = WorkflowContext(
        client_id="TEST152",
        client_updates=[],
    )

    node = SummaryBatchPreparationNode()

    with pytest.raises(
        ValueError,
        match="^No client updates available\\.$"
    ):
        node.execute(context)
        
        
def test_tc153_formats_update_with_date_creator_and_body():
    update = {
        "created_at": "2026-11-04T10:30:00",
        "creator_name": "Test User",
        "body": "Client campaign performance improved.",
    }

    node = SummaryBatchPreparationNode()
    formatted = node.format_update(update)

    assert "2026-11-04T10:30:00" in formatted
    assert "Test User" in formatted
    assert "Client campaign performance improved." in formatted
    
def test_tc154_keeps_each_update_inside_one_batch():
    from src.core.constants import SUMMARY_BATCH_SIZE

    first_body = "A" * (SUMMARY_BATCH_SIZE - 1000)
    second_body = "B" * 2000

    updates = [
        {
            "created_at": "2026-11-04T10:00:00",
            "creator_name": "User One",
            "body": first_body,
        },
        {
            "created_at": "2026-11-04T11:00:00",
            "creator_name": "User Two",
            "body": second_body,
        },
    ]

    context = WorkflowContext(
        client_id="TEST154",
        client_updates=updates,
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    assert len(result.summary_batches) == 2

    first_batch = result.summary_batches[0]["text"]
    second_batch = result.summary_batches[1]["text"]

    assert first_body in first_batch
    assert second_body in second_batch

    assert second_body not in first_batch
    assert first_body not in second_batch

    assert result.summary_batches[0]["update_count"] == 1
    assert result.summary_batches[1]["update_count"] == 1
    

def test_tc155_combines_small_updates_into_one_batch():
    updates = [
        {
            "created_at": "2026-11-04T10:00:00",
            "creator_name": "User One",
            "body": "Campaign performance improved.",
        },
        {
            "created_at": "2026-11-04T11:00:00",
            "creator_name": "User Two",
            "body": "Lead generation increased.",
        },
    ]

    context = WorkflowContext(
        client_id="TEST155",
        client_updates=updates,
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    assert len(result.summary_batches) == 1

    batch = result.summary_batches[0]

    assert batch["update_count"] == 2
    assert "Campaign performance improved." in batch["text"]
    assert "Lead generation increased." in batch["text"]
    

def test_tc156_keeps_single_oversized_update_intact():
    from src.core.constants import SUMMARY_BATCH_SIZE

    large_body = "L" * (SUMMARY_BATCH_SIZE + 1000)

    update = {
        "created_at": "2026-11-04T10:00:00",
        "creator_name": "Large Update User",
        "body": large_body,
    }

    context = WorkflowContext(
        client_id="TEST156",
        client_updates=[update],
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    assert len(result.summary_batches) == 1

    batch = result.summary_batches[0]

    assert batch["update_count"] == 1
    assert large_body in batch["text"]
    assert batch["text"].count(large_body) == 1
    
def test_tc157_every_generated_batch_contains_non_empty_text():
    updates = [
        {
            "created_at": f"2026-11-{i:02d}T10:00:00",
            "creator_name": f"User {i}",
            "body": f"Client update number {i}.",
        }
        for i in range(1, 6)
    ]

    context = WorkflowContext(
        client_id="TEST157",
        client_updates=updates,
    )

    node = SummaryBatchPreparationNode()
    result = node.process(context)

    assert result.summary_batches

    for batch in result.summary_batches:
        assert isinstance(batch["text"], str)
        assert batch["text"].strip() != ""