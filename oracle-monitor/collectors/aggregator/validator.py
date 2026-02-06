import jsonschema
import json
import os

# Load schema once at module import
SCHEMA_PATH = os.path.join(
    os.path.dirname(__file__), 
    '../../schema/oracle_state.schema.json'
)

# Resolve relative path to absolute to avoid issues
SCHEMA_PATH = os.path.abspath(SCHEMA_PATH)

try:
    with open(SCHEMA_PATH, 'r') as f:
        SCHEMA = json.load(f)
except FileNotFoundError:
    print(f"WARNING: Schema file not found at {SCHEMA_PATH}")
    SCHEMA = {}

def validate_state(state):
    """Validate state against Oracle schema"""
    if not SCHEMA:
        print("Schema not loaded, skipping validation.")
        return False
        
    try:
        jsonschema.validate(instance=state, schema=SCHEMA)
        return True
    except jsonschema.ValidationError as e:
        print(f"❌ Validation failed: {e.message}")
        print(f"   Path: {' -> '.join(str(p) for p in e.path)}")
        return False
