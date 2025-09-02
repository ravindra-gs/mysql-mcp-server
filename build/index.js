#!/usr/bin/env node
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QuerySchema, executeQuery } from "./util/mysql.js";
import { runStdioTransport } from "./mcp/stdio-transport.js";
import { runHttpTransport } from "./mcp/http-transport.js";
dotenv.config();
function createServer() {
    const server = new McpServer({
        name: "mysql-mcp",
        version: "1.0.0",
        capabilities: {
            tools: {},
        },
    });
    server.tool("mysql_query", "Execute a MySQL query and return the results", QuerySchema.shape, executeQuery);
    return server;
}
async function main() {
    const server = createServer();
    const transportType = process.argv.includes('--http') ? 'http' : 'stdio';
    if (transportType === 'http') {
        await runHttpTransport(server);
    }
    else {
        await runStdioTransport(server);
    }
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
