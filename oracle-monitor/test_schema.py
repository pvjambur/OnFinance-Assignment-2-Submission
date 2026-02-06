from collectors.aggregator.validator import validate_state
import sys

# Redirect output to file to avoid encoding issues
with open("test_result.log", "w", encoding="utf-8") as log:
    def log_print(msg):
        print(msg)
        log.write(msg + "\n")

    # Valid state
    valid = {
        "id": "test-123",
        "agents": [],
        "workload": [],
        "queues": [],
        "litellm": []
    }

    # Invalid state (missing required field)
    invalid = {
        "id": "test-456",
        "agents": []
        # Missing workload, queues, litellm
    }

    log_print("Testing valid state:")
    result_valid = validate_state(valid)
    log_print(f"Valid state result: {result_valid}")

    log_print("\nTesting invalid state:")
    result_invalid = validate_state(invalid)
    log_print(f"Invalid state result: {result_invalid}")

    if result_valid and not result_invalid:
        log_print("\nVerification SUCCESS: Schema validation works as expected.")
    else:
        log_print("\nVerification FAILED: Unexpected validation results.")
