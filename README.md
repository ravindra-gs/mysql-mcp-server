# MySQL MCP Server

A Model Context Protocol (MCP) server that provides a single interface to execute MySQL queries against a database

## Installation

- Clone this repository
- Copy `.env.example` to `.env` and update values.
- Install dependencies:

   ```bash
   npm install
   ```

- Build the project:

   ```bash
   npm run build
   ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_HOST` | `localhost` | MySQL server host |
| `MYSQL_PORT` | `3306` | MySQL server port |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | `` | MySQL password |
| `MYSQL_DATABASE` | `` | MySQL database name |
| `MYSQL_BASIC_WRITE_PROTECTION` | `true` | Enable basic write protection (read-only mode) |

### 2. Run the MCP Server

```bash
./build/index.js
```

The server will start and listen for MCP requests on stdio.

**Example queries:**

Write queries are only rejected in the write protection mode.

- ✅ `SELECT * FROM users LIMIT 10`
- ✅ `INSERT INTO products (name, price) VALUES ('Widget', 19.99)`
- ❌ `UPDATE users SET status = 'active' WHERE id = 1`
- ❌ `DELETE FROM temp_table WHERE created_at < NOW() - INTERVAL 1 DAY`

## Start the server

- Default (stdio): npm run build && ./build/index.js
- HTTP transport: npm run build && ./build/index.js --http
