import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Join Operations", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("tabla de producto cartesiano", { only: false }, async () => {
    const result = await qb
      .select("*")
      .from(["INVENTARIO_CD", "INTERPRETES"])
      .toString();

    assert.equal(
      result,
      `SELECT *
FROM INVENTARIO_CD, INTERPRETES;`,
    );
  });

  test("Una tabla EQUI-JOIN", { only: false }, async () => {
    const result = await qb
      .select("*")
      .from(["INVENTARIO_CD", "INTERPRETES"])
      .where(
        qb.eq(
          qb.col("ID_INTER", "INVENTARIO_CD"),
          qb.col("ID_INTER", "INTERPRETES"),
        ),
      )
      .toString();
    assert.equal(
      result,
      `SELECT *
FROM INVENTARIO_CD, INTERPRETES
WHERE INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER;`,
    );
  });

  test(
    "limitar las columnas arrojadas y agregar otro predicado a la cláusula WHERE y así limitar las filas arrojadas",
    { only: false },
    async () => {
      const result = await qb
        .select([
          qb.col("NOMBRE_CD", "INVENTARIO_CD"),
          qb.col("NOMBRE_INTER", "INTERPRETES"),
          qb.col("EN_EXISTENCIA", "INVENTARIO_CD"),
        ])
        .from(["INVENTARIO_CD", "INTERPRETES"])
        .where(
          qb.and(
            qb.eq(
              qb.col("ID_INTER", "INVENTARIO_CD"),
              qb.col("ID_INTER", "INTERPRETES"),
            ),
            qb.lt(qb.col("EN_EXISTENCIA", "INVENTARIO_CD"), 15),
          ),
        )
        .toString();

      assert.equal(
        result,
        `SELECT INVENTARIO_CD.NOMBRE_CD, INTERPRETES.NOMBRE_INTER, INVENTARIO_CD.EN_EXISTENCIA
FROM INVENTARIO_CD, INTERPRETES
WHERE (INVENTARIO_CD.ID_INTER = INTERPRETES.ID_INTER
AND INVENTARIO_CD.EN_EXISTENCIA < 15);`,
      );
    },
  );

  test("Uso de alias para tablas", { only: false }, async () => {
    const result = await qb
      .select([
        qb.col("NOMBRE_CD", "c"),
        qb.col("NOMBRE_INTER", "p"),
        qb.col("EN_EXISTENCIA", "c"),
      ])
      .from(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
      .where(
        qb.and(
          qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
          qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
        ),
      )
      .toString();

    assert.equal(
      result,
      `SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD AS c, INTERPRETES AS p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
    );
  });

  test("CROSS JOIN", { only: false }, async () => {
    const result = await qb
      .select([
        qb.col("NOMBRE_CD", "c"),
        qb.col("NOMBRE_INTER", "p"),
        qb.col("EN_EXISTENCIA", "c"),
      ])
      .crossJoin(["INVENTARIO_CD", "INTERPRETES"], ["c", "p"])
      .where(
        qb.and(
          qb.eq(qb.col("ID_INTER", "c"), qb.col("ID_INTER", "p")),
          qb.lt(qb.col("EN_EXISTENCIA", "c"), 15),
        ),
      )
      .toString();

    assert.equal(
      result,
      `SELECT c.NOMBRE_CD, p.NOMBRE_INTER, c.EN_EXISTENCIA
FROM INVENTARIO_CD c CROSS JOIN INTERPRETES p
WHERE (c.ID_INTER = p.ID_INTER
AND c.EN_EXISTENCIA < 15);`,
    );
  });

  test("NATURAL JOIN", { only: false }, async () => {
    const result = await qb
      .select(["TITULO_CD", "TIPO_CD", qb.col("MENUDEO", "c")])
      .naturalJoin(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
      .where(qb.gt(qb.col("INVENTARIO", "s"), 15))
      .toString();

    assert.equal(
      result,
      `SELECT TITULO_CD, TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s NATURAL JOIN COSTOS_TITULO c
WHERE s.INVENTARIO > 15;`,
    );
  });

  test("Join de columna nombrada con using", { only: false }, async () => {
    const result = await qb
      .select(["TITULO_CD", qb.col("TIPO_CD", "s"), qb.col("MENUDEO", "c")])
      .join(["TITULOS_EN_EXISTENCIA", "COSTOS_TITULO"], ["s", "c"])
      .using("TITULO_CD")
      .where(qb.gt(qb.col("INVENTARIO", "s"), 15))
      .toString();

    assert.equal(
      result,
      `SELECT TITULO_CD, s.TIPO_CD, c.MENUDEO
FROM TITULOS_EN_EXISTENCIA s JOIN COSTOS_TITULO c
USING (TITULO_CD)
WHERE s.INVENTARIO > 15;`,
    );
  });

  test("INNER JOIN y la clausula ON", { only: false }, async () => {
    const result = await qb
      .select([qb.col("TITULO", "t"), qb.col("ARTISTA", "a")])
      .innerJoin(["TITULO_CDS", "ARTISTAS_TITULOS"], ["t", "ta"])
      .on(qb.eq(qb.col("ID_TITULO", "t"), qb.col("ID_TITULO", "ta")))
      .innerJoin("ARTISTAS_CD", "a")
      .on(qb.eq(qb.col("ID_ARTISTA", "ta"), qb.col("ID_ARTISTA", "a")))
      .where(qb.like(qb.col("TITULO", "t"), "%Blue%"))
      .toString();

    assert.equal(
      result,
      `SELECT t.TITULO, a.ARTISTA
FROM TITULO_CDS t INNER JOIN ARTISTAS_TITULOS ta
ON t.ID_TITULO = ta.ID_TITULO
INNER JOIN ARTISTAS_CD a
ON ta.ID_ARTISTA = a.ID_ARTISTA
WHERE t.TITULO LIKE ('%Blue%');`,
    );
  });

  test("LEFT OUTER JOIN", { only: false }, async () => {
    const result = await qb
      .select([
        qb.col("TITULO", "i"),
        qb.col("NOMBRE_TIPO", "t"),
        qb.col("EXISTENCIA", "i"),
      ])
      .leftJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
      .on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
      .toString();

    assert.equal(
      result,
      `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i LEFT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
    );
  });

  test("RIGHT OUTER JOIN", { only: false }, async () => {
    const result = await qb
      .select([
        qb.col("TITULO", "i"),
        qb.col("NOMBRE_TIPO", "t"),
        qb.col("EXISTENCIA", "i"),
      ])
      .rightJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
      .on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
      .toString();

    assert.equal(
      result,
      `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i RIGHT OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
    );
  });

  test("FULL OUTER JOIN", { only: false }, async () => {
    const result = await qb
      .select([
        qb.col("TITULO", "i"),
        qb.col("NOMBRE_TIPO", "t"),
        qb.col("EXISTENCIA", "i"),
      ])
      .fullJoin(["INFO_CD", "TIPO_CD"], ["i", "t"])
      .on(qb.eq(qb.col("ID_TIPO", "i"), qb.col("ID_TIPO", "t")))
      .toString();

    assert.equal(
      result,
      `SELECT i.TITULO, t.NOMBRE_TIPO, i.EXISTENCIA
FROM INFO_CD i FULL OUTER JOIN TIPO_CD t
ON i.ID_TIPO = t.ID_TIPO;`,
    );
  });

  test("UNION", { only: false }, async () => {
    const result = await qb
      .union(
        qb.select("TIPO_CD").from("CDS_CONTINUADOS"),
        qb.select("TIPO_CD").from("CDS_DESCONTINUADOS"),
      )
      .toString();

    assert.equal(
      result,
      `SELECT TIPO_CD
FROM CDS_CONTINUADOS
UNION
SELECT TIPO_CD
FROM CDS_DESCONTINUADOS;`,
    );
  });

  test("UNION ALL", { only: false }, async () => {
    const result = await qb
      .unionAll(
        qb.select("TIPO_CD").from("CDS_CONTINUADOS"),
        "SELECT TIPO_CD\nFROM CDS_DEVUELTOS",
        qb.select("TIPO_CD").from("CDS_DESCONTINUADOS"),
      )
      .toString();

    assert.equal(
      result,
      `SELECT TIPO_CD
FROM CDS_CONTINUADOS
UNION ALL
SELECT TIPO_CD
FROM CDS_DEVUELTOS
UNION ALL
SELECT TIPO_CD
FROM CDS_DESCONTINUADOS;`,
    );
  });
});
