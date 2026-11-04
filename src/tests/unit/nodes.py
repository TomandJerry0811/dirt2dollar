from src.base.base_node import BaseNode


class DummyNode(BaseNode):
    """
    Dummy implementation of BaseNode
    used only for testing.
    """

    def __init__(self):

        super().__init__(
            node_name="Dummy Node",
            node_type="TEST"
        )

    def execute(self):

        self.initialize()

        print("Executing Dummy Node...")

        self.complete()

        return "Success"


if __name__ == "__main__":

    node = DummyNode()

    result = node.execute()

    print("\nExecution Result")
    print("----------------")
    print(result)

    print("\nExecution Summary")
    print("-----------------")
    print(node.get_execution_summary())