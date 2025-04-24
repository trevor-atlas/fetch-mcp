import { html, json, txt, markdown } from './api';
import { mock, describe, expect, it } from 'bun:test';
import type { MCPRequest } from './types';

const request: MCPRequest = {
  url: 'https://example.com',
  headers: { 'Custom-Header': 'Value' },
};

const mockHtml = `
  <html>
    <head>
      <title>Test Page</title>
      <script>console.log('This should be removed');</script>
      <style>body { color: red; }</style>
    </head>
    <body>
      <h1>Hello World</h1>
      <p>This is a test paragraph.</p>
    </body>
  </html>
`;

describe('html', () => {
  it('should return the raw HTML content', async () => {
    mock.module('ky', () => ({
      default: {
        get: () =>
          Promise.resolve(
            new Response(mockHtml, {
              status: 200,
              headers: { 'Content-Type': 'text/html' },
            }),
          ),
      },
    }));
    const result = await html(request);
    expect(result).toEqual({
      content: [{ type: 'text', text: mockHtml }],
      isError: false,
    });
  });

  it('should handle errors', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.reject(new Error('Network error')),
      },
    }));

    const result = await html(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: Network error',
        },
      ],
      isError: true,
    });
  });
});

describe('json', () => {
  it('should parse and return JSON content', async () => {
    const mockJson = { key: 'value' };
    mock.module('ky', () => ({
      default: {
        get: () =>
          Promise.resolve(
            new Response(JSON.stringify(mockJson), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          ),
      },
    }));

    const result = await json(request);
    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify(mockJson) }],
      isError: false,
    });
  });

  it('should handle errors', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.reject(new Error('Invalid JSON')),
      },
    }));

    const result = await json(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: Invalid JSON',
        },
      ],
      isError: true,
    });
  });
});

describe('txt', () => {
  it('should return plain text content without HTML tags, scripts, and styles', async () => {
    mock.module('ky', () => ({
      default: {
        get: () =>
          Promise.resolve(
            new Response(mockHtml, {
              status: 200,
              headers: { 'Content-Type': 'text/html' },
            }),
          ),
      },
    }));
    const mockTextContent = 'Hello World This is a test paragraph.';
    mock.module('jsdom', () => ({
      JSDOM: mock().mockImplementationOnce(() => ({
        window: {
          document: {
            body: {
              textContent: mockTextContent,
            },
            getElementsByTagName: mock().mockReturnValue([]),
          },
        },
      })),
    }));

    const result = await txt(request);
    expect(result).toEqual({
      content: [{ type: 'text', text: mockTextContent }],
      isError: false,
    });
  });

  it('should handle errors', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.reject(new Error('Parsing error')),
      },
    }));

    const result = await txt(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: Parsing error',
        },
      ],
      isError: true,
    });
  });
});

describe('markdown', () => {
  it('should convert HTML to markdown', async () => {
    mock.module('ky', () => ({
      default: {
        get: () =>
          Promise.resolve(
            new Response(mockHtml, {
              status: 200,
              headers: { 'Content-Type': 'text/html' },
            }),
          ),
      },
    }));

    const mockMarkdown = '# Hello World\n\nThis is a test paragraph.';
    mock.module('turndown', () => ({
      default: class Default {
        turndown = () => mockMarkdown;
      },
    }));

    const result = await markdown(request);
    expect(result).toEqual({
      content: [{ type: 'text', text: mockMarkdown }],
      isError: false,
    });
  });

  it('should handle errors', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.reject(new Error('Conversion error')),
      },
    }));

    const result = await markdown(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: Conversion error',
        },
      ],
      isError: true,
    });
  });
});

describe('error handling', () => {
  it('should handle non-OK responses', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.resolve(new Response('Not Found', { status: 404 })),
      },
    }));

    const result = await html(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: HTTP error: 404',
        },
      ],
      isError: true,
    });
  });

  it('should handle unknown errors', async () => {
    mock.module('ky', () => ({
      default: {
        get: () => Promise.reject('Unknown error'),
      },
    }));

    const result = await html(request);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: 'Failed to fetch https://example.com: Unknown error',
        },
      ],
      isError: true,
    });
  });
});
