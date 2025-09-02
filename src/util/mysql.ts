import mysql, { QueryResult } from "mysql2/promise";
import { z } from "zod";

export const QuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export const connectionConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "",
};

let connection: mysql.Connection | null = null;

export async function initializeConnection() {
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.error("Connected to MySQL database");
  } catch (error) {
    console.error("Failed to connect to MySQL:", error);
    throw error;
  }
}

export async function executeQuery({ query }: { query: string }) {
  if (!connection) {
    await initializeConnection();
  }

  const [results] = await connection!.execute(query);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}

export function getConnection() {
  return connection;
}
