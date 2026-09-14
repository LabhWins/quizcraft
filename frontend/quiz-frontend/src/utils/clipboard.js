/**
 * Safe clipboard copy utility.
 * Supports modern Clipboard API with fallback to execCommand for non-HTTPS/LAN environments.
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // Modern navigator.clipboard API (requires secure context HTTPS or localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, falling back to execCommand', err);
    }
  }

  // Fallback for HTTP, LAN IP access, or older browsers
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy to clipboard failed:', err);
    return false;
  }
}
