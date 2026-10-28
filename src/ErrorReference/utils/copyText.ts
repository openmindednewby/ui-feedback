const OFFSCREEN_POSITION = '-9999px';

type ClipboardWriter = (text: string) => void | Promise<void>;

function hasDom(): boolean {
  return typeof document !== 'undefined' && document.body !== null;
}

function copyViaExecCommand(value: string): boolean {
  if (!hasDom()) return false;
  const area = document.createElement('textarea');
  area.value = value;
  area.readOnly = true;
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = OFFSCREEN_POSITION;
  area.style.left = OFFSCREEN_POSITION;
  area.style.opacity = '0';
  document.body.appendChild(area);
  try {
    area.select();
    area.setSelectionRange(0, value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

function hasAsyncClipboard(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';
}

async function tryWrite(write: () => void | Promise<void>): Promise<boolean> {
  try {
    await write();
    return true;
  } catch {
    return false;
  }
}

/** Copy `value`; true only when a write landed (injected writer, async clipboard, then execCommand). */
export async function copyText(value: string, writer?: ClipboardWriter): Promise<boolean> {
  if (value === '') return false;
  if (writer !== undefined && (await tryWrite(() => writer(value)))) return true;
  if (hasAsyncClipboard() && (await tryWrite(() => navigator.clipboard.writeText(value)))) return true;
  return copyViaExecCommand(value);
}
