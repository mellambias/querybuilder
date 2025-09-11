/**
 * Test Suite Index for QueryBuilder Core
 * 
 * This file imports and runs all test modules for the core QueryBuilder functionality.
 * Each test module focuses on a specific area of functionality for better organization
 * and maintainability.
 */

// Import all test modules
import "./database-operations.test.js";
import "./table-operations.test.js";
import "./constraints-datatypes.test.js";
import "./views.test.js";
import "./security-permissions.test.js";
import "./select-queries.test.js";
import "./data-modification.test.js";
import "./predicates-where.test.js";
import "./functions.test.js";
import "./joins.test.js";
import "./subqueries.test.js";
import "./cursors.test.js";
import "./transactions.test.js";

/**
 * Test Organization:
 * 
 * 1. database-operations.test.js     - CREATE/DROP DATABASE, CREATE TYPE
 * 2. table-operations.test.js        - CREATE/ALTER/DROP TABLE operations
 * 3. constraints-datatypes.test.js   - Column/table constraints, domains, assertions
 * 4. views.test.js                   - CREATE/DROP VIEW operations
 * 5. security-permissions.test.js    - Roles, GRANT/REVOKE permissions
 * 6. select-queries.test.js          - SELECT statements, GROUP BY, ORDER BY
 * 7. data-modification.test.js       - INSERT/UPDATE/DELETE operations
 * 8. predicates-where.test.js        - WHERE predicates and logical operations
 * 9. functions.test.js               - SET and VALUE functions (COUNT, SUM, etc.)
 * 10. joins.test.js                  - All types of JOIN operations
 * 11. subqueries.test.js             - Nested queries and subqueries
 * 12. cursors.test.js                - Cursor operations and management
 * 13. transactions.test.js           - Transaction management and constraints
 * 
 * Usage:
 * Run with: node --test test/
 * Or individually: node --test test/database-operations.test.js
 */
