import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Views", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("crear una vista de una sola tabla", { only: false }, async () => {
    const query = `SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO`;
    const result = await qb
      .createView("DISCOS_COMPACTOS_EN_EXISTENCIA", {
        cols: ["DISCO_COMPACTO", "DERECHOSDEAUTOR", "EN_EXISTENCIA"],
        as: query,
        check: true,
      })
      .toString();
    assert.equal(
      result,
      `CREATE VIEW DISCOS_COMPACTOS_EN_EXISTENCIA
( DISCO_COMPACTO, DERECHOSDEAUTOR, EN_EXISTENCIA )
AS SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO
WITH CHECK OPTION;`,
    );
  });

  test("eliminar una vista", { only: false }, async () => {
    assert.equal(
      await qb.dropView("DISCOS_COMPACTOS_EN_EXISTENCIA").toString(),
      "DROP VIEW DISCOS_COMPACTOS_EN_EXISTENCIA;",
    );
  });
});
