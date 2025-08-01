# MySQL MCP Server

A Model Context Protocol (MCP) server that provides a single interface to execute MySQL queries against a database running in Docker.

## Features

- **Single Query Interface**: Execute any MySQL query through the `mysql_query` tool
- **Docker Environment Support**: Configured via environment variables
- **Error Handling**: Comprehensive error handling for database operations
- **Input Validation**: Uses Zod schema validation for query input
- **Auto-connection**: Lazy database connection initialization

## Installation

1. Clone this repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

## Configuration

The server connects to your MySQL database using environment variables. You can set these via:

1. **Environment file (.env)** - Recommended for development
2. **Environment variables** - For production/deployment

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MYSQL_HOST` | `localhost` | MySQL server host |
| `MYSQL_PORT` | `3306` | MySQL server port |
| `MYSQL_USER` | `root` | MySQL username |
| `MYSQL_PASSWORD` | `` | MySQL password |
| `MYSQL_DATABASE` | `` | MySQL database name |

## Usage

### 1. Set Up Configuration

**Option A: Using .env file (Recommended)**

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your database credentials:
   ```bash
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_user
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=your_database
   ```

**Option B: Using environment variables**

```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=your_user
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=your_database
```

### 2. Run the MCP Server

```bash
./build/index.js
```

The server will start and listen for MCP requests on stdio.

### 3. Available Tools

#### `mysql_query`

Execute a MySQL query and return the results.

**Parameters:**

- `query` (string, required): The SQL query to execute

**Example queries:**

- `SELECT * FROM users LIMIT 10`
- `INSERT INTO products (name, price) VALUES ('Widget', 19.99)`
- `UPDATE users SET status = 'active' WHERE id = 1`
- `DELETE FROM temp_table WHERE created_at < NOW() - INTERVAL 1 DAY`

## Docker Compose Integration

If your MySQL database is running in Docker Compose, make sure to:

1. Expose the MySQL port in your `docker-compose.yml`:

   ```yaml
   services:
     mysql:
       image: mysql:8.0
       ports:
         - "3306:3306"
       environment:
         MYSQL_ROOT_PASSWORD: your_password
         MYSQL_DATABASE: your_database
   ```

2. Use `localhost` as the host when running the MCP server outside of Docker, or use the service name if running inside the same Docker network.

## Security Considerations

- **Environment Variables**: Store sensitive credentials in environment variables, not in code
- **Query Validation**: All queries are validated for basic structure before execution
- **Error Handling**: Database errors are caught and returned safely without exposing internal details
- **Connection Management**: Database connections are managed automatically

## Error Handling

The server provides comprehensive error handling:

- **Connection Errors**: Failed database connections are logged and reported
- **Query Errors**: Invalid SQL queries return descriptive error messages
- **Validation Errors**: Input validation failures are caught and reported
- **Runtime Errors**: Unexpected errors are handled gracefully

## Development

### Build

```bash
npm run build
```

### Project Structure

```
├── src/
│   └── index.ts          # Main MCP server implementation
├── build/                # Compiled JavaScript output
├── .env.example          # Example environment configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## License

ISC
