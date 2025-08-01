#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  ListToolsRequest,
} from "@modelcontextprotocol/sdk/types.js";
import mysql from "mysql2/promise";
import { z } from "zod";

const QuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

const connectionConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "",
};

let connection: mysql.Connection | null = null;

async function initializeConnection() {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.error("Connected to MySQL database");
  } catch (error) {
    console.error("Failed to connect to MySQL:", error);
    throw error;
  }
}

const server = new Server(
  {
    name: "mysql-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async (_request: ListToolsRequest) => {
  return {
    tools: [
      {
        name: "mysql_query",
        description: "Execute a MySQL query and return the results",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The SQL query to execute",
            },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  if (request.params.name === "mysql_query") {
    try {
      const { query } = QuerySchema.parse(request.params.arguments);
      
      if (!connection) {
        await initializeConnection();
      }

      const [results] = await connection!.execute(query);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing query: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MySQL MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});