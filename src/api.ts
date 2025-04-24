import { JSDOM } from 'jsdom';
import Turndown from 'turndown';
import { MCPRequestSchema, type MCPRequest } from './types.js';
import ky from 'ky';

async function _fetch(request: MCPRequest): Promise<Response> {
  try {
    const { url, headers } = MCPRequestSchema.parse(request);
    const response = await ky.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Error(`Failed to fetch ${request.url}: ${e.message}`);
    }
    throw new Error(`Failed to fetch ${request.url}: Unknown error`);
  }
}

export async function html(requestPayload: MCPRequest) {
  try {
    const response = await _fetch(requestPayload);
    const html = await response.text();
    return { content: [{ type: 'text', text: html }], isError: false };
  } catch (error) {
    return {
      content: [{ type: 'text', text: (error as Error).message }],
      isError: true,
    };
  }
}

export async function json(requestPayload: MCPRequest) {
  try {
    const response = await _fetch(requestPayload);
    const json = await response.json();
    return {
      content: [{ type: 'text', text: JSON.stringify(json) }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: (error as Error).message }],
      isError: true,
    };
  }
}

export async function txt(requestPayload: MCPRequest) {
  try {
    const response = await _fetch(requestPayload);
    const html = await response.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const scripts = document.getElementsByTagName('script');
    const styles = document.getElementsByTagName('style');
    for (const script of scripts) {
      script.remove();
    }
    for (const style of styles) {
      style.remove();
    }

    const text = document.body.textContent || '';
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    return {
      content: [{ type: 'text', text: normalizedText }],
      isError: false,
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: (error as Error).message }],
      isError: true,
    };
  }
}

export async function markdown(requestPayload: MCPRequest) {
  try {
    const response = await _fetch(requestPayload);
    const html = await response.text();
    const td = new Turndown();
    const markdown = td.turndown(html);
    return { content: [{ type: 'text', text: markdown }], isError: false };
  } catch (error) {
    return {
      content: [{ type: 'text', text: (error as Error).message }],
      isError: true,
    };
  }
}
