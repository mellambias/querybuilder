import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Transactions", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("set transaction", { only: false }, async () => {
    const result = await qb.setTransaction({
      access: "read only",
      isolation: "READ UNCOMMITTED",
      diagnostic: 5,
    });

    assert.equal(
      (await result.toString()).trimEnd(),
      `SET TRANSACTION READ ONLY,
ISOLATION LEVEL READ UNCOMMITTED,
DIAGNOSTICS SIZE 5;`,
    );
  });

  test("set transaction READ WRITE", { only: false }, async () => {
    const result = await qb.setTransaction({
      access: "read WRITE",
      isolation: "serializable",
      diagnostic: 8,
    });

    assert.equal(
      (await result.toString()).trimEnd(),
      `SET TRANSACTION READ WRITE,
ISOLATION LEVEL SERIALIZABLE,
DIAGNOSTICS SIZE 8;`,
    );
  });

  test("aplicar restricciones diferidas", { only: false }, async () => {
    const result = await qb
      .setConstraints(["RESTRICCION_1", "RESTRICCION_2"], "deferred")
      .toString();

    assert.equal(
      result,
      "SET CONSTRAINTS RESTRICCION_1, RESTRICCION_2 DEFERRED;",
    );
  });
});
