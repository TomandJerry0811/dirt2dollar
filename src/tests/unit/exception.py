from src.core.exceptions import (
    ValidationException
)

try:

    raise ValidationException(
        "Test Validation Error"
    )

except ValidationException as e:

    print(
        f"Caught: {e}"
    )