#!/usr/bin/env node
import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { QuerySchema, executeQuery } from "./util/mysql.js";
dotenv.config();
const server = new McpServer({
    name: "mysql-mcp",
    version: "1.0.0",
    capabilities: {
        tools: {},
    },
});
server.tool("mysql_query", "Execute a MySQL query and return the results", QuerySchema.shape, executeQuery);
async function runStdioTransport() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MySQL MCP server running on stdio");
}
async function runHttpTransport() {
    const app = express();
    app.use(express.json());
    const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3000;
    const transports = {};
    const mcpPostHandler = async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        try {
            let transport;
            if (sessionId && transports[sessionId]) {
                transport = transports[sessionId];
            }
            else if (!sessionId && isInitializeRequest(req.body)) {
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (sessionId) => {
                        console.log(`Session initialized with ID: ${sessionId}`);
                        transports[sessionId] = transport;
                    }
                });
                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid]) {
                        console.log(`Transport closed for session ${sid}`);
                        delete transports[sid];
                    }
                };
                await server.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return;
            }
            else {
                res.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                return;
            }
            await transport.handleRequest(req, res, req.body);
        }
        catch (error) {
            console.error('Error handling MCP request:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32603,
                        message: 'Internal server error',
                    },
                    id: null,
                });
            }
        }
    };
    const mcpGetHandler = async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    };
    const mcpDeleteHandler = async (req, res) => {
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send('Invalid or missing session ID');
            return;
        }
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    };
    app.post('/mcp', mcpPostHandler);
    app.get('/mcp', mcpGetHandler);
    app.delete('/mcp', mcpDeleteHandler);
    app.listen(port, () => {
        console.error(`MySQL MCP server running on HTTP port ${port}`);
    });
    process.on('SIGINT', async () => {
        console.log('Shutting down server...');
        for (const sessionId in transports) {
            try {
                await transports[sessionId].close();
                delete transports[sessionId];
            }
            catch (error) {
                console.error(`Error closing transport for session ${sessionId}:`, error);
            }
        }
        process.exit(0);
    });
}
async function main() {
    const transportType = process.argv.includes('--http') ? 'http' : 'stdio';
    if (transportType === 'http') {
        await runHttpTransport();
    }
    else {
        await runStdioTransport();
    }
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
