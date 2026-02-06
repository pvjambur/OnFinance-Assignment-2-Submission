import json
import jsonschema
from typing import Dict, Any
import os

class Validator:
    def __init__(self, schema_path: str):
        self.schema_path = schema_path
        self.schema = self._load_schema()

    def _load_schema(self) -> Dict[str, Any]:
        if not os.path.exists(self.schema_path):
            raise FileNotFoundError(f"Schema not found at {self.schema_path}")
        
        with open(self.schema_path, 'r') as f:
            return json.load(f)

    def validate(self, data: Dict[str, Any]) -> bool:
        try:
            jsonschema.validate(instance=data, schema=self.schema)
            return True
        except jsonschema.exceptions.ValidationError as e:
            print(f"Validation Error: {e.message}")
            return False
