import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Database Operations", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("Comando para crear una base de datos", { only: false }, async () => {
    const result = await qb.createDatabase("testing").toString();
    assert.equal(result, "CREATE DATABASE testing;");
  });

  test(
    "Falla cuando se crea una base de datos con un nombre reservado",
    { only: false },
    async () => {
      try {
        await qb.createDatabase("DAY").toString();
      } catch (error) {
        assert.equal(error, "Error: DAY no es un identificador valido");
      }
    },
  );

  test("Comando para eliminar una base de datos", { only: false }, async () => {
    const result = await qb.dropDatabase("testing").toString();
    assert.equal(result, "DROP DATABASE testing;");
  });

  test("Crear un tipo definido por el usuario", { only: false }, async () => {
    const result = await qb
      .use("testing")
      .createType("SALARIO", { as: "NUMERIC(8,2)", final: false })
      .toString();
    assert.equal(
      result,
      "USE testing;\nCREATE TYPE SALARIO AS NUMERIC(8,2) NOT FINAL;",
    );
  });
});
