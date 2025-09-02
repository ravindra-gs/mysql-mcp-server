export const MYSQL_HOST = process.env.MYSQL_HOST || "localhost";
export const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || "3306");
export const MYSQL_USER = process.env.MYSQL_USER || "root";
export const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "";
export const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "";
export const MYSQL_BASIC_WRITE_PROTECTION = process.env.MYSQL_BASIC_WRITE_PROTECTION === "false";