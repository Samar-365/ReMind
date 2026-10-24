import os
import shutil
import sqlite3
import tempfile
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.sanitizer import scrub_secrets

class BrowserTab(BaseModel):
    title: str
    url: str
    selected: bool = True

class BrowserCollector:
    def __init__(self):
        # In-memory store for tabs received via webhook/extension or manual entry
        self._manual_tabs: List[BrowserTab] = []

    def _get_browser_history_paths(self) -> List[str]:
        """Finds standard history SQLite databases across Chrome, Edge, and Brave on Windows."""
        local_app_data = os.getenv("LOCALAPPDATA")
        if not local_app_data:
            return []

        candidates = [
            os.path.join(local_app_data, r"Google\Chrome\User Data\Default\History"),
            os.path.join(local_app_data, r"Microsoft\Edge\User Data\Default\History"),
            os.path.join(local_app_data, r"BraveSoftware\Brave-Browser\User Data\Default\History"),
        ]
        return [p for p in candidates if os.path.exists(p)]

    def _auto_detect_recent_tabs(self, limit: int = 15) -> List[BrowserTab]:
        """
        Automatically extracts the user's most recent research URLs and tab titles
        from local browser history by copying the SQLite database safely to a tempfile.
        """
        detected_tabs = []
        paths = self._get_browser_history_paths()

        for db_path in paths:
            tmp_fd, tmp_path = tempfile.mkstemp()
            os.close(tmp_fd)
            try:
                # Copy file because the active browser process holds a lock on the original
                shutil.copyfile(db_path, tmp_path)
                conn = sqlite3.connect(tmp_path)
                cur = conn.cursor()

                # Query most recently visited URLs
                cur.execute(
                    """
                    SELECT title, url FROM urls 
                    WHERE url NOT LIKE 'chrome://%' 
                      AND url NOT LIKE 'edge://%' 
                      AND url NOT LIKE 'about:%' 
                      AND url NOT LIKE 'http://localhost:%' 
                      AND url NOT LIKE 'http://127.0.0.1:%'
                    ORDER BY last_visit_time DESC 
                    LIMIT ?
                    """,
                    (limit,)
                )

                for row in cur.fetchall():
                    title = row[0] or "Documentation Reference"
                    url = row[1] or ""

                    # Filter out internal/empty URLs
                    if not url or url.startswith("chrome-extension://"):
                        continue

                    clean_url = scrub_secrets(url)
                    clean_title = scrub_secrets(title)

                    # Deduplicate by URL
                    if not any(t.url == clean_url for t in detected_tabs):
                        detected_tabs.append(BrowserTab(title=clean_title, url=clean_url, selected=True))

                conn.close()
            except Exception:
                pass
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass

        return detected_tabs[:limit]

    def update_tabs(self, tabs: List[BrowserTab]):
        scrubbed_tabs = []
        for tab in tabs:
            clean_url = scrub_secrets(str(tab.url))
            clean_title = scrub_secrets(tab.title)
            scrubbed_tabs.append(BrowserTab(title=clean_title, url=clean_url, selected=tab.selected))
        self._manual_tabs = scrubbed_tabs

    def get_tabs(self) -> List[BrowserTab]:
        return self._manual_tabs

    def collect(self) -> Dict[str, Any]:
        """
        Combines auto-detected active browser research tabs with any manually registered tabs.
        Zero user effort required.
        """
        auto_tabs = self._auto_detect_recent_tabs(limit=10)
        combined = []
        seen_urls = set()

        # Prioritize manual entries, then add auto-detected tabs
        for tab in self._manual_tabs + auto_tabs:
            if tab.url not in seen_urls:
                seen_urls.add(tab.url)
                combined.append(tab)

        return {
            "available": len(combined) > 0,
            "total_tabs": len(combined),
            "tabs": [tab.model_dump() for tab in combined if tab.selected]
        }

browser_collector = BrowserCollector()
