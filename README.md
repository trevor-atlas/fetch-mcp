# Fetch MCP Server

![fetch mcp logo](logo.jpg)

This MCP server provides functionality to fetch web content in various formats, including HTML, JSON, plain text, and Markdown.

## Components

### Tools

- **fetch_html**
  - Fetch a website and return the content as HTML
  - Input:
    - `url` (string, required): URL of the website to fetch
    - `headers` (object, optional): Custom headers to include in the request
  - Returns the raw HTML content of the webpage

- **fetch_json**
  - Fetch a JSON file from a URL
  - Input:
    - `url` (string, required): URL of the JSON to fetch
    - `headers` (object, optional): Custom headers to include in the request
  - Returns the parsed JSON content

- **fetch_txt**
  - Fetch a website and return the content as plain text (no HTML)
  - Input:
    - `url` (string, required): URL of the website to fetch
    - `headers` (object, optional): Custom headers to include in the request
  - Returns the text content of the webpage with HTML tags, scripts, and styles removed

- **fetch_markdown**
  - Fetch a website and return the content as Markdown
  - Input:
    - `url` (string, required): URL of the website to fetch
    - `headers` (object, optional): Custom headers to include in the request
  - Returns the content of the webpage converted to Markdown format

### Resources

This server does not provide any persistent resources. It's designed to fetch and transform web content on demand.

## Getting started

1. Clone the repository
2. Install dependencies: `bun install`
3. Build the server: `bun run build`
4. This will output a standalone executable at ./build/fetch-mcp

You can copy the executable wherever you desire and invoke it

### Usage

To use the server, you can run it directly:

```bash
bun run start
```

This will start the Fetch MCP Server running on stdio.

### Usage with Claude Desktop App, Cursor, Windsurf etc

To integrate this server with a desktop app, add the following to your app's server configuration:

```json
{
  "mcpServers": {
    "fetch": {
      "command": "{ABSOLUTE PATH TO FILE HERE}/fetch-mcp",
    }
  }
}
```

## Features

- Fetches web content using modern fetch API
- Supports custom headers for requests
- Provides content in multiple formats: HTML, JSON, plain text, and Markdown
- Uses JSDOM for HTML parsing and text extraction
- Uses Turndown for HTML to Markdown conversion

## Development

- Run `bun run dev` to start the TypeScript compiler in watch mode
- Use `bun test` to run the test suite

## License

This project is licensed under the MIT License.
