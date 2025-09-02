import mysql from "mysql2/promise";
import { z } from "zod";
import {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_BASIC_WRITE_PROTECTION,
} from "../config/mysql.config.js";
import { isReadOnlyQuery } from "./mysql.helper.js";

export const QuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

export const connectionConfig = {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
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

  if (MYSQL_BASIC_WRITE_PROTECTION && !isReadOnlyQuery(query)) {
    throw new Error("Only read-only queries are allowed.");
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
