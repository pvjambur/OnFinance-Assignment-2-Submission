from abc import ABC, abstractmethod
from typing import Any, Dict

class Collector(ABC):
    """Abstract base class for all data collectors."""

    @abstractmethod
    def collect(self) -> Dict[str, Any]:
        """
        Collect data from the specific source.
        Returns a dictionary representing the collected state.
        """
        pass
