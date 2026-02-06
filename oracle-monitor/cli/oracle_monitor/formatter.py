import json
from rich.console import Console
from rich.syntax import Syntax

console = Console()

def print_json(data):
    """Print data as pretty JSON."""
    json_str = json.dumps(data, indent=2)
    syntax = Syntax(json_str, "json", theme="monokai", word_wrap=True)
    console.print(syntax)

def print_diff(diff_data):
    """Print diff as pretty JSON (or colored text)."""
    # For now, just dumping the diff object as JSON
    print_json(diff_data)
