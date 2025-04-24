#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { MCPRequestSchema } from './types.js';
import { html, json, txt, markdown } from './api.js';

const server = new Server(
  {
    name: 'fetch-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'fetch_html',
        description: 'Fetch a website and return the content as HTML',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the website to fetch',
            },
            headers: {
              type: 'object',
              description: 'Optional headers to include in the request',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'fetch_markdown',
        description: 'Fetch a website and return the content as Markdown',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the website to fetch',
            },
            headers: {
              type: 'object',
              description: 'Optional headers to include in the request',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'fetch_txt',
        description:
          'Fetch a website, return the content as plain text (no HTML)',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the website to fetch',
            },
            headers: {
              type: 'object',
              description: 'Optional headers to include in the request',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'fetch_json',
        description: 'Fetch a JSON file from a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the JSON to fetch',
            },
            headers: {
              type: 'object',
              description: 'Optional headers to include in the request',
            },
          },
          required: ['url'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const validatedArgs = MCPRequestSchema.parse(args);

  switch (name) {
    case 'fetch_html': {
      return await html(validatedArgs);
    }
    case 'fetch_json': {
      return await json(validatedArgs);
    }
    case 'fetch_txt': {
      return await txt(validatedArgs);
    }
    case 'fetch_markdown': {
      return await markdown(validatedArgs);
    }
    default:
      throw new Error(`Tool not found: ${name}`);
  }
});

const transport = new StdioServerTransport();
try {
  await server.connect(transport);
} catch (error) {
  console.error('Fatal error starting MCP server:', String(error));
  process.exit(1);
}
