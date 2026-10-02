"""
Custom exception handler for consistent error response format.

All API errors return: {"error": "message"}
Never returns stack traces to the client.
"""

from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler to return errors in a
    consistent JSON shape: {"error": "Human-readable message"}
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Flatten DRF's default error structure into a single message
        if isinstance(response.data, dict):
            # Handle {"detail": "..."} format (auth errors, 404, etc.)
            if "detail" in response.data:
                response.data = {"error": str(response.data["detail"])}
            else:
                # Handle {"field": ["error1", "error2"]} validation errors
                errors = []
                for field, messages in response.data.items():
                    if isinstance(messages, list):
                        for msg in messages:
                            errors.append(f"{field}: {msg}")
                    else:
                        errors.append(f"{field}: {messages}")
                response.data = {"error": "; ".join(errors)}
        elif isinstance(response.data, list):
            response.data = {"error": "; ".join(str(e) for e in response.data)}

    return response
