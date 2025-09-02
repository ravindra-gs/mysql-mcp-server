#!/usr/bin/env node

import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { QuerySchema, executeQuery } from "./util/mysql.js";

dotenv.config();

const server = new McpServer({
  name: "mysql-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  "mysql_query",
  "Execute a MySQL query and return the results",
  QuerySchema.shape,
  executeQuery
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MySQL MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
