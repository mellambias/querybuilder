import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Predicates and WHERE Clauses", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("operadores", { only: false }, async () => {
    assert.equal(
      await qb.eq("columna", "string").toString(),
      "columna = 'string';",
    );
    assert.equal(await qb.ne("columna", 4).toString(), "columna <> 4;");
    assert.equal(await qb.gt("columna", 4).toString(), "columna > 4;");
    assert.equal(await qb.gte("columna", 4).toString(), "columna >= 4;");
    assert.equal(await qb.lt("columna", 4).toString(), "columna < 4;");
    assert.equal(await qb.lte("columna", 4).toString(), "columna <= 4;");
  });

  test("logicos", { only: false }, async () => {
    const result = await qb
      .and(
        qb.or(qb.eq("columna", 1), qb.eq("columna", 2), qb.eq("columna", 3)),
        qb.gt("col", 25),
      )
      .or(qb.and(qb.gt("PEPE", 10), qb.lt("PEPE", 40)))
      .toString();

    assert.equal(
      result,
      `((columna = 1
OR columna = 2
OR columna = 3)
AND col > 25)
OR (PEPE > 10
AND PEPE < 40);`,
    );
  });

  test("predicado NOT", { only: false }, async () => {
    assert.equal(
      await qb.not(qb.eq("col", 24)).toString(),
      "NOT (col = 24);",
    );
    assert.equal(
      await qb.not(qb.or(qb.eq("col", 24), qb.gt("col", 10))).toString(),
      `NOT ((col = 24
OR col > 10));`,
    );
  });

  test("Un valor entre un mínimo y un máximo", { only: false }, async () => {
    assert.equal(
      await qb.between("CAMPO", 12, 15).toString(),
      "CAMPO BETWEEN 12 AND 15;",
    );
  });

  test("Valores que pueden ser Null o no Null", { only: false }, async () => {
    assert.equal(await qb.isNull("col").toString(), "col IS NULL;");
    assert.equal(
      await qb.isNull(["col1", "col2", "col3"]).toString(),
      "col1 IS NULL\nAND col2 IS NULL\nAND col3 IS NULL;",
    );
    assert.equal(
      await qb.isNotNull(["col1", "col2", "col3"]).toString(),
      "col1 IS NOT NULL\nAND col2 IS NOT NULL\nAND col3 IS NOT NULL;",
    );
    assert.equal(
      await qb
        .and(
          qb.isNotNull("LUGAR_DE_NACIMIENTO"),
          qb.gt("AÑO_NACIMIENTO", 1940),
        )
        .toString(),
      `(LUGAR_DE_NACIMIENTO IS NOT NULL
AND AÑO_NACIMIENTO > 1940);`,
    );
  });

  test(
    "Valor que coincide con una expresion usando comodines % y _",
    { only: false },
    async () => {
      assert.equal(
        await qb.like("ID_CD", "%01").toString(),
        "ID_CD LIKE ('%01');",
      );
    },
  );

  test("valor dentro de una lista", { only: false }, async () => {
    assert.equal(
      await qb.in("EN_EXISTENCIA", [12, 22, 32, 42, "bocata"]).toString(),
      "EN_EXISTENCIA IN ( 12, 22, 32, 42, 'bocata' );",
    );
    assert.equal(
      await qb
        .select(["TITULO", "ARTISTA"])
        .from("ARTISTAS_DISCO_COMPACTO")
        .where(
          qb.in(
            "TITULO",
            qb
              .select("NOMBRE_CD")
              .from("INVENTARIO_DISCO_COMPACTO")
              .where(qb.gt("EN_EXISTENCIA", 10)),
          ),
        )
        .toString(),
      `SELECT TITULO, ARTISTA
FROM ARTISTAS_DISCO_COMPACTO
WHERE TITULO IN ( SELECT NOMBRE_CD
FROM INVENTARIO_DISCO_COMPACTO
WHERE EN_EXISTENCIA > 10 );`,
    );
  });

  test("El valor existe en la subconsulta", { only: false }, async () => {
    assert.equal(
      await qb
        .select(["TITULO", "ARTISTA"])
        .from("ARTISTAS_DISCO_COMPACTO")
        .where(
          qb.exists(
            qb
              .select("NOMBRE_CD")
              .from("INVENTARIO_DISCO_COMPACTO")
              .where(qb.gt("EN_EXISTENCIA", 10)),
          ),
        )
        .toString(),
      `SELECT TITULO, ARTISTA
FROM ARTISTAS_DISCO_COMPACTO
WHERE EXISTS ( SELECT NOMBRE_CD
FROM INVENTARIO_DISCO_COMPACTO
WHERE EN_EXISTENCIA > 10 );`,
    );
  });

  test(
    "el valor coincide con algun valor en la sub consulta",
    { only: false },
    async () => {
      assert.equal(
        await qb
          .select(["TITULO", "REBAJA"])
          .from("REBAJA_CD")
          .where(
            qb.lt(
              "REBAJA",
              qb.any(
                qb
                  .select("MENUDEO")
                  .from("MENUDEO_CD")
                  .where(qb.gt("EN_EXISTENCIA", 9)),
              ),
            ),
          )
          .toString(),
        `SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < ANY ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
      );
    },
  );

  test(
    "coincide con mas de un valor en la sub consulta",
    { only: false },
    async () => {
      assert.equal(
        await qb
          .select(["TITULO", "REBAJA"])
          .from("REBAJA_CD")
          .where(
            qb.lt(
              "REBAJA",
              qb.some(
                qb
                  .select("MENUDEO")
                  .from("MENUDEO_CD")
                  .where(qb.gt("EN_EXISTENCIA", 9)),
              ),
            ),
          )
          .toString(),
        `SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < SOME ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
      );
    },
  );

  test(
    "coincide con todos los valores de la sub consulta",
    { only: false },
    async () => {
      assert.equal(
        await qb
          .select(["TITULO", "REBAJA"])
          .from("REBAJA_CD")
          .where(
            qb.lt(
              "REBAJA",
              qb.all(
                qb
                  .select("MENUDEO")
                  .from("MENUDEO_CD")
                  .where(qb.gt("EN_EXISTENCIA", 9)),
              ),
            ),
          )
          .toString(),
        `SELECT TITULO, REBAJA
FROM REBAJA_CD
WHERE REBAJA < ALL ( SELECT MENUDEO
FROM MENUDEO_CD
WHERE EN_EXISTENCIA > 9 );`,
      );
    },
  );
});
