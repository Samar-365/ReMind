from typing import List, Dict, Any
from pydantic import BaseModel, HttpUrl
from app.core.sanitizer import scrub_secrets

class BrowserTab(BaseModel):
    title: str
    url: str
    selected: bool = True

class BrowserCollector:
    def __init__(self):
        # In-memory store for tabs received via webhook/extension
        self._tabs: List[BrowserTab] = []

    def update_tabs(self, tabs: List[BrowserTab]):
        # Scrub title and URL to avoid capturing embedded token params
        scrubbed_tabs = []
        for tab in tabs:
            clean_url = scrub_secrets(str(tab.url))
            clean_title = scrub_secrets(tab.title)
            scrubbed_tabs.append(BrowserTab(title=clean_title, url=clean_url, selected=tab.selected))
        self._tabs = scrubbed_tabs

    def get_tabs(self) -> List[BrowserTab]:
        return self._tabs

    def clear(self):
        self._tabs = []

    def collect(self) -> Dict[str, Any]:
        return {
            "available": len(self._tabs) > 0,
            "total_tabs": len(self._tabs),
            "tabs": [tab.model_dump() for tab in self._tabs if tab.selected]
        }

browser_collector = BrowserCollector()
