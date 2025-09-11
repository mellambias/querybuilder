import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Subqueries", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("subconsultas con varios resultados", { only: false }, async () => {
    const result = await qb
      .select("*")
      .from("EXISTENCIA_CD")
      .where(
        qb.in(
          "TITULO_CD",
          qb
            .select("TITULO")
            .from("ARTISTAS_CD")
            .where(qb.eq("NOMBRE_ARTISTA", "Joni Mitchell")),
        ),
      )
      .toString();

    assert.equal(
      result,
      `SELECT *
FROM EXISTENCIA_CD
WHERE TITULO_CD IN ( SELECT TITULO
FROM ARTISTAS_CD
WHERE NOMBRE_ARTISTA = 'Joni Mitchell' );`,
    );
  });

  test("sub consultas anidadas", { only: false }, async () => {
    const result = await qb
      .select(["NOMBRE_DISCO", "CANTIDAD_EXISTENCIA"])
      .from("INVENTARIO_DISCO")
      .where(
        qb.in(
          "ID_ARTISTA",
          qb
            .select("ID_ARTISTA")
            .from("ARTISTAS_DISCO")
            .where(
              qb.in(
                "ID_TIPO_DISCO",
                qb
                  .select("ID_TIPO_DISCO")
                  .from("TIPOS_DISCO")
                  .where(qb.eq("NOMBRE_TIPO_DISCO", "Blues")),
              ),
            ),
        ),
      )
      .toString();

    assert.equal(
      result,
      `SELECT NOMBRE_DISCO, CANTIDAD_EXISTENCIA
FROM INVENTARIO_DISCO
WHERE ID_ARTISTA IN ( SELECT ID_ARTISTA
FROM ARTISTAS_DISCO
WHERE ID_TIPO_DISCO IN ( SELECT ID_TIPO_DISCO
FROM TIPOS_DISCO
WHERE NOMBRE_TIPO_DISCO = 'Blues' ) );`,
    );
  });
});
