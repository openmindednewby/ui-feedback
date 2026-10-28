import { copyText } from './copyText';

const VALUE = '4bf92f3577b34da6a3ce929d0e0e4736';

function setClipboard(value: unknown): void {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

function setExecCommand(impl: () => boolean): jest.Mock {
  const mock = jest.fn(impl);
  Object.defineProperty(document, 'execCommand', { value: mock, configurable: true, writable: true });
  return mock;
}

describe('copyText', () => {
  const originalClipboard = navigator.clipboard;

  afterEach(() => {
    setClipboard(originalClipboard);
    Reflect.deleteProperty(document, 'execCommand');
  });

  it('with the async clipboard available, writes the value and returns true', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    const result = await copyText(VALUE);

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith(VALUE);
  });

  it('with no async clipboard (plain http), falls back to execCommand and returns true', async () => {
    setClipboard(undefined);
    const exec = setExecCommand(() => true);

    const result = await copyText(VALUE);

    expect(result).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('with a rejected async write, falls back to execCommand', async () => {
    setClipboard({ writeText: jest.fn().mockRejectedValue(new Error('NotAllowedError')) });
    const exec = setExecCommand(() => true);

    const result = await copyText(VALUE);

    expect(result).toBe(true);
    expect(exec).toHaveBeenCalled();
  });

  it('with every path failing, returns false', async () => {
    setClipboard(undefined);
    setExecCommand(() => false);

    const result = await copyText(VALUE);

    expect(result).toBe(false);
  });

  it('with execCommand throwing, returns false and removes the textarea', async () => {
    setClipboard(undefined);
    setExecCommand(() => {
      throw new Error('nope');
    });
    const before = document.body.childElementCount;

    const result = await copyText(VALUE);

    expect(result).toBe(false);
    expect(document.body.childElementCount).toBe(before);
  });

  it('with an injected writer, uses it instead of the DOM paths', async () => {
    const writer = jest.fn().mockResolvedValue(undefined);
    const exec = setExecCommand(() => true);

    const result = await copyText(VALUE, writer);

    expect(result).toBe(true);
    expect(writer).toHaveBeenCalledWith(VALUE);
    expect(exec).not.toHaveBeenCalled();
  });

  it('with an empty value, returns false without writing', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    const result = await copyText('');

    expect(result).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
