import sys
import os
import ctypes
from ctypes import wintypes
from typing import List, Dict, Any, Optional
import psutil
from app.core.sanitizer import scrub_secrets

IGNORED_TITLES = {
    "program manager",
    "windows input experience",
    "microsoft text input application",
    "nvidia geforce overlay",
    "settings",
    "nahimic",
    "realtek audio console",
    "msctfime ui",
    "default ime",
    "setup",
}

APP_CATEGORIES = {
    "code": "IDE / Editor",
    "antigravity": "IDE / Editor",
    "devenv": "IDE / Editor",
    "idea": "IDE / Editor",
    "pycharm": "IDE / Editor",
    "webstorm": "IDE / Editor",
    "sublime": "IDE / Editor",
    "notepad": "IDE / Editor",
    "cursor": "IDE / Editor",
    "chrome": "Browser",
    "msedge": "Browser",
    "brave": "Browser",
    "firefox": "Browser",
    "opera": "Browser",
    "windowsterminal": "Terminal",
    "powershell": "Terminal",
    "cmd": "Terminal",
    "wt": "Terminal",
    "bash": "Terminal",
    "slack": "Communication",
    "discord": "Communication",
    "teams": "Communication",
    "telegram": "Communication",
    "postman": "Developer Tool",
    "insomnia": "Developer Tool",
    "docker": "Developer Tool",
    "figma": "Design Tool",
    "explorer": "File Explorer",
    "spotify": "Media",
}

class WindowCollector:
    """
    Collects all visible active application windows currently open on the desktop
    during a developer handoff.
    """

    def _categorize(self, process_name: str) -> str:
        proc_lower = process_name.lower().replace(".exe", "")
        for key, cat in APP_CATEGORIES.items():
            if key in proc_lower:
                return cat
        return "Application"

    def _clean_app_name(self, process_name: str) -> str:
        name = process_name.replace(".exe", "")
        # Common cleanups
        mappings = {
            "windowsterminal": "Windows Terminal",
            "code": "Visual Studio Code",
            "chrome": "Google Chrome",
            "msedge": "Microsoft Edge",
            "explorer": "File Explorer",
        }
        return mappings.get(name.lower(), name)

    def collect(self) -> Dict[str, Any]:
        if sys.platform != "win32":
            return {"available": False, "window_count": 0, "windows": [], "error": "Non-Windows platform"}

        user32 = ctypes.windll.user32
        windows: List[Dict[str, Any]] = []
        seen_keys = set()

        # Desktop handle enumeration
        DESKTOPENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, wintypes.HWND, wintypes.LPARAM)

        def callback(hwnd, lparam):
            if not user32.IsWindowVisible(hwnd):
                return True

            length = user32.GetWindowTextLengthW(hwnd)
            if length <= 0:
                return True

            buff = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buff, length + 1)
            title = buff.value.strip()

            if not title or title.lower() in IGNORED_TITLES:
                return True

            pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            proc_id = pid.value

            proc_name = "Unknown"
            try:
                p = psutil.Process(proc_id)
                proc_name = p.name()
            except Exception:
                pass

            if proc_name.lower().replace(".exe", "") in IGNORED_TITLES:
                return True

            # Deduplicate by (proc_name, title)
            key = (proc_name.lower(), title.lower())
            if key in seen_keys:
                return True
            seen_keys.add(key)

            # Scrub secrets
            sanitized_title = scrub_secrets(title)

            windows.append({
                "pid": proc_id,
                "process_name": proc_name,
                "app_name": self._clean_app_name(proc_name),
                "category": self._categorize(proc_name),
                "title": sanitized_title,
            })
            return True

        # Open user interactive desktop 'default' in WinSta0
        hdesk = user32.OpenDesktopW("default", 0, False, 0x01FF)
        if hdesk:
            try:
                user32.EnumDesktopWindows(hdesk, DESKTOPENUMPROC(callback), 0)
            finally:
                user32.CloseDesktop(hdesk)
        else:
            # Fallback to standard EnumWindows
            user32.EnumWindows(DESKTOPENUMPROC(callback), 0)

        # Sort so IDEs and Browsers and Terminals are at the top
        order = {"IDE / Editor": 1, "Terminal": 2, "Browser": 3, "Developer Tool": 4, "File Explorer": 5}
        windows.sort(key=lambda w: (order.get(w["category"], 10), w["app_name"]))

        return {
            "available": True,
            "window_count": len(windows),
            "windows": windows,
        }

window_collector = WindowCollector()
