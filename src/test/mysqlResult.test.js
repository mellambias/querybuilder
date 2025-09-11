import { test, suite } from "node:test";
import assert from "node:assert/strict";
import MysqlResult from "../results/MysqlResult.js";

suite("MysqlResult Class Tests", () => {
    test("should correctly initialize with query and response", () => {
        const query = "SELECT * FROM table";
        const response = [[], []]; // Empty result and fields
        const result = new MysqlResult(query, response);
        
        assert.equal(result.query, query);
    });

    test("should correctly identify ResultSetHeader", () => {
        const result = new MysqlResult("SELECT * FROM table");
        
        const validHeader = {
            fieldCount: 0,
            affectedRows: 0,
            info: "",
            serverStatus: 2,
            warningStatus: 0
        };
        
        const invalidHeader = {
            fieldCount: 0,
            info: ""
        };
        
        assert.equal(result.isResultSetHeader(validHeader), true);
        assert.equal(result.isResultSetHeader(invalidHeader), false);
        assert.equal(result.isResultSetHeader(null), false);
    });

    test("should correctly parse fields", () => {
        const result = new MysqlResult("SELECT * FROM table");
        
        const fields = [
            { name: "id" },
            { name: "name" },
            { name: "email" }
        ];
        
        const parsedFields = result.parseFields(fields);
        assert.deepEqual(parsedFields, ["id", "name", "email"]);
        
        // Test with undefined fields
        const fieldsWithUndefined = [
            { name: "id" },
            undefined,
            { name: "email" }
        ];
        
        const parsedFieldsWithUndefined = result.parseFields(fieldsWithUndefined);
        assert.deepEqual(parsedFieldsWithUndefined, ["id", "email"]);
    });

    test("should handle ResultSetHeader in queryResult setter", () => {
        const query = "INSERT INTO table VALUES (1, 'test')";
        const result = new MysqlResult(query);
        
        const headerResponse = [{
            fieldCount: 0,
            affectedRows: 1,
            info: "",
            serverStatus: 2,
            warningStatus: 0
        }, null];
        
        result.queryResult = headerResponse;
        
        assert.equal(result.affectedRows, 1);
        assert.equal(result.serverStatus, 2);
        assert.equal(result.warningStatus, 0);
        assert.equal(result._queryResult, null);
    });

    test("should handle regular result in queryResult setter", () => {
        const query = "SELECT * FROM table";
        const result = new MysqlResult(query);
        
        const rows = [
            { id: 1, name: "test" },
            { id: 2, name: "test2" }
        ];
        
        const fields = [
            { name: "id" },
            { name: "name" }
        ];
        
        result.queryResult = [rows, fields];
        
        assert.deepEqual(result.rows, rows);
        assert.equal(result.rowCount, 2);
        assert.deepEqual(result.columns, ["id", "name"]);
        assert.equal(result.fieldCount, 2);
    });
});
