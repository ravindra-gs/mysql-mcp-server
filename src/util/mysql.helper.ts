// List of SQL keywords that can write to the database
const WRITE_KEYWORDS = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "REPLACE",
  "CREATE",
  "DROP",
  "ALTER",
  "TRUNCATE",
  "RENAME",
  "GRANT",
  "REVOKE",
  "LOCK",
  "UNLOCK",
  "SET",
  "CALL",
  "MERGE",
  "HANDLER",
  "LOAD",
  "CHANGE",
  "START",
  "STOP",
  "RESET",
  "PURGE",
  "BACKUP",
  "RESTORE",
  "KILL",
  "ANALYZE",
  "OPTIMIZE",
  "FLUSH"
];

/**
 * Checks if the query contains any write-operation keywords.
 * Returns true if the query is read-only (safe), false otherwise.
 */
export function isReadOnlyQuery(query: string): boolean {
  // Remove SQL comments and convert to uppercase for easier keyword matching
  const normalized = query.replace(/--.*|\/\*.*?\*\//gs, "").toUpperCase();

  // List of regex patterns for allowed read-only queries
  const allowedPatterns = [
    /^\s*SELECT\b/,                 // Matches any query starting with SELECT (read data)
    /^\s*SHOW\b/,                   // Matches any query starting with SHOW (show metadata/info)
    /^\s*DESCRIBE\b/,               // Matches any query starting with DESCRIBE (table structure)
    /^\s*EXPLAIN\b/,                // Matches any query starting with EXPLAIN (query plan)
    /^\s*USE\b/,                    // Matches any query starting with USE (change database)
    /^\s*HELP\b/,                   // Matches any query starting with HELP (MySQL help)
    /^\s*STATUS\b/,                 // Matches any query starting with STATUS (server status)
  ];

  // Check if the query matches any allowed read-only pattern
  if (allowedPatterns.some((pat) => pat.test(normalized))) {
    // For each write keyword, check if it appears in the query
    for (const keyword of WRITE_KEYWORDS) {
      // Create a regex to match the keyword as a whole word, case-insensitive
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      // If a write keyword is found, the query is not read-only
      if (regex.test(normalized)) {
        return false;
      }
    }
    // No write keywords found, query is read-only
    return true;
  }
  // Query does not match any allowed read-only pattern
  return false;
}
