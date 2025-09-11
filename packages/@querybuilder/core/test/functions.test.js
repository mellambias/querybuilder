import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("SQL Functions", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  describe("SET Functions", async () => {
    test("COUNT", { only: false }, async () => {
      assert.equal(await qb.count("*").toString(), "COUNT(*);");
      assert.equal(await qb.count("PRECIO").toString(), "COUNT(PRECIO);");
      assert.equal(
        await qb.count("PRECIO", "DINERO").toString(),
        "COUNT(PRECIO) AS DINERO;",
      );
    });

    test("SELECT con COUNT", { only: false }, async () => {
      const result = await qb
        .select(qb.count("PRECIO", "DINERO"))
        .from("LISTA_CD")
        .toString();

      assert.equal(result, "SELECT COUNT(PRECIO) AS DINERO\nFROM LISTA_CD;");
    });

    test("MAX y MIN", { only: false }, async () => {
      assert.equal(await qb.max("PRECIO").toString(), "MAX(PRECIO);");
      assert.equal(
        await qb.max("PRECIO", "DINERO").toString(),
        "MAX(PRECIO) AS DINERO;",
      );
      assert.equal(await qb.min("PRECIO").toString(), "MIN(PRECIO);");
      assert.equal(
        await qb.min("PRECIO", "DINERO").toString(),
        "MIN(PRECIO) AS DINERO;",
      );
    });

    test("SUM", { only: false }, async () => {
      assert.equal(await qb.sum("PRECIO").toString(), "SUM(PRECIO);");
      assert.equal(
        await qb.sum("PRECIO", "DINERO").toString(),
        "SUM(PRECIO) AS DINERO;",
      );
    });

    test("AVG", { only: false }, async () => {
      assert.equal(await qb.avg("PRECIO").toString(), "AVG(PRECIO);");
      assert.equal(
        await qb.avg("PRECIO", "DINERO").toString(),
        "AVG(PRECIO) AS DINERO;",
      );
    });
  });

  describe("VALUE Functions", async () => {
    describe("funciones de valor de cadena", { only: false }, async () => {
      test("substring", async () => {
        assert.equal(
          await qb.substr("DESCRIPCION", 3).toString(),
          "SUBSTRING(DESCRIPCION FROM 3);",
        );
        assert.equal(
          await qb.substr("DESCRIPCION", 3, 10).toString(),
          "SUBSTRING(DESCRIPCION FROM 3 FOR 10);",
        );
        assert.equal(
          await qb.substr("DESCRIPCION", 3, "ABREVIADO").toString(),
          "SUBSTRING(DESCRIPCION FROM 3) AS ABREVIADO;",
        );
      });

      test("UPPER y LOWER", async () => {
        assert.equal(await qb.upper("DISCO").toString(), "UPPER(DISCO);");
        assert.equal(
          await qb.upper("DISCO", "DISCO_EN_MAYUSCULA").toString(),
          "UPPER(DISCO) AS DISCO_EN_MAYUSCULA;",
        );
        assert.equal(await qb.lower("DISCO").toString(), "LOWER(DISCO);");
        assert.equal(
          await qb.lower("DISCO", "DISCO_EN_MAYUSCULA").toString(),
          "LOWER(DISCO) AS DISCO_EN_MAYUSCULA;",
        );
      });
    });

    describe("funciones de tiempo", { only: false }, async () => {
      test("Current", async () => {
        assert.equal(await qb.currentDate().toString(), "CURRENT_DATE;");
        assert.equal(await qb.currentTime().toString(), "CURRENT_TIME;");
        assert.equal(
          await qb.currentTimestamp().toString(),
          "CURRENT_TIMESTAMP;",
        );
      });

      test("local time", async () => {
        assert.equal(await qb.localTime().toString(), "LOCALTIME;");
        assert.equal(await qb.localTimestamp().toString(), "LOCALTIMESTAMP;");
      });
    });
  });
});
