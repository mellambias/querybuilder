import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Select Queries", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test(
    "SELECT todas las filas distintas y todas las columnas ",
    { only: false },
    async () => {
      const result = qb.select("*", { unique: true }).from("MUSICA");
      assert.equal(
        await result.toString(),
        "SELECT DISTINCT *\nFROM MUSICA;",
      );
    },
  );

  test(
    "SELECT todas las filas distintas y algunas columnas",
    { only: false },
    async () => {
      const result = await qb
        .select(
          [{ col: "DISCOS", as: "ID_DISCO" }, "PRECIO", { col: "CANTIDAD" }],
          {
            unique: true,
          },
        )
        .from("MUSICA")
        .toString();
      assert.equal(
        result,
        "SELECT DISTINCT DISCOS AS ID_DISCO, PRECIO, CANTIDAD\nFROM MUSICA;",
      );
    },
  );

  test("Filtrado de datos con WHERE", { only: false }, async () => {
    const result = await qb
      .select(["TITULO_CD", "DERECHOSDEAUTOR", "EN_EXISTENCIA"])
      .from("INVENTARIO_DISCO_COMPACTO")
      .where(
        qb.and(
          qb.gt("DERECHOSDEAUTOR", 1989),
          qb.lt("DERECHOSDEAUTOR", 2000),
        ),
      )
      .toString();

    assert.equal(
      result,
      `SELECT TITULO_CD, DERECHOSDEAUTOR, EN_EXISTENCIA
FROM INVENTARIO_DISCO_COMPACTO
WHERE (DERECHOSDEAUTOR > 1989
AND DERECHOSDEAUTOR < 2000);`,
    );
  });

  test(
    "agrupar filas cuyos valores de columna son iguales",
    { only: false },
    async () => {
      const result = await qb
        .select([
          "CATEGORIA",
          "PRECIO",
          { col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
        ])
        .from("EXISTENCIA_DISCO_COMPACTO")
        .groupBy(["CATEGORIA", "PRECIO"])
        .toString();

      assert.equal(
        result,
        `SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO;`,
      );
    },
  );

  test("GROUP BY ROLLUP", { only: false }, async () => {
    const result = qb
      .select([
        "CATEGORIA",
        "PRECIO",
        { col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
      ])
      .from("EXISTENCIA_DISCO_COMPACTO")
      .groupBy({ rollup: ["CATEGORIA", "PRECIO"] });
    assert.equal(
      await result.toString(),
      `SELECT CATEGORIA, PRECIO, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY ROLLUP (CATEGORIA, PRECIO);`,
    );
  });

  test("HAVING", { only: false }, async () => {
    const result = qb
      .select([
        "PRECIO",
        "CATEGORIA",
        { col: "SUM(A_LA_MANO)", as: "TOTAL_A_LA_MANO" },
      ])
      .from("EXISTENCIA_DISCO_COMPACTO")
      .groupBy(["CATEGORIA", "PRECIO"])
      .having("SUM(A_LA_MANO) > 10");

    assert.equal(
      await result.toString(),
      `SELECT PRECIO, CATEGORIA, SUM(A_LA_MANO) AS TOTAL_A_LA_MANO
FROM EXISTENCIA_DISCO_COMPACTO
GROUP BY CATEGORIA, PRECIO
HAVING SUM(A_LA_MANO) > 10;`,
    );
  });

  test("ORDER BY", { only: false }, async () => {
    const result = qb
      .select("*")
      .from("EXISTENCIA_DISCO_COMPACTO")
      .where("PRECIO < 16.00")
      .orderBy(["PRECIO", { col: "A_LA_MANO", order: "desc" }]);

    assert.equal(
      await result.toString(),
      `SELECT *
FROM EXISTENCIA_DISCO_COMPACTO
WHERE PRECIO < 16.00
ORDER BY PRECIO, A_LA_MANO DESC;`,
    );
  });
});
