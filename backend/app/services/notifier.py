import logging
import platform
import subprocess

logger = logging.getLogger(__name__)

def send_desktop_notification(title: str, message: str):
    """
    Sends native desktop notification on Windows via PowerShell toast,
    falling back to plyer or silent logger.
    """
    system = platform.system()
    if system == "Windows":
        try:
            # Modern PowerShell Windows 10/11 Toast Notification
            ps_script = f"""
            [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
            $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
            $textNodes = $template.GetElementsByTagName("text")
            $textNodes.Item(0).AppendChild($template.CreateTextNode("{title}")) > $null
            $textNodes.Item(1).AppendChild($template.CreateTextNode("{message}")) > $null
            $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
            $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Tomorrow-Me Handoff")
            $notifier.Show($toast)
            """
            subprocess.run(
                ["powershell", "-NoProfile", "-Command", ps_script],
                creationflags=subprocess.CREATE_NO_WINDOW if hasattr(subprocess, "CREATE_NO_WINDOW") else 0,
                timeout=5,
                capture_output=True
            )
            logger.info(f"Windows desktop toast notification sent: {title}")
            return
        except Exception as e:
            logger.debug(f"PowerShell toast failed: {e}")

    # Fallback to plyer for Linux/macOS
    try:
        from plyer import notification
        notification.notify(
            title=title,
            message=message,
            app_name="Tomorrow-Me Handoff",
            timeout=8,
        )
        logger.info(f"Plyer desktop notification delivered: {title}")
    except Exception as e:
        logger.warning(f"Native desktop notification could not be dispatched: {str(e)}")
