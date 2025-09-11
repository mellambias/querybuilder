import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Data Modification", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test(
    "Insertar datos en una tabla sin especificar las columnas",
    { only: false },
    async () => {
      const result = await qb
        .insert("INVENTARIO_CD", [
          "Patsy Cline: 12 Greatest Hits",
          "Country",
          "MCA Records",
          32,
        ])
        .toString();

      assert.equal(
        result,
        `INSERT INTO INVENTARIO_CD
VALUES
( 'Patsy Cline: 12 Greatest Hits', 'Country', 'MCA Records', 32 );`,
      );
    },
  );

  test(
    "Insertar datos en una tabla especificando columnas",
    { only: false },
    async () => {
      const sql = `INSERT INTO INVENTARIO_CD\n( NOMBRE_CD, EDITOR, EN_EXISTENCIA )
VALUES
( 'Fundamental', 'Capitol Records', 34 );`;

      const result = await qb
        .insert(
          "INVENTARIO_CD",
          ["Fundamental", "Capitol Records", 34],
          ["NOMBRE_CD", "EDITOR", "EN_EXISTENCIA"],
        )
        .toString();

      assert.equal(result, sql);
    },
  );

  test(
    "Insertar datos en una tabla usando SELECT",
    { only: false },
    async () => {
      const sql = `INSERT INTO INVENTARIO_CD_2
SELECT NOMBRE_CD, EN_EXISTENCIA
FROM INVENTARIO_CD;`;

      const result = await qb
        .insert(
          "INVENTARIO_CD_2",
          qb.select(["NOMBRE_CD", "EN_EXISTENCIA"]).from("INVENTARIO_CD"),
        )
        .toString();

      assert.equal(result, sql);
    },
  );

  test("Insertar varias filas de datos", { only: false }, async () => {
    const result = qb.insert("INVENTARIO_CD", [
      [827, "Private Music"],
      [828, "Reprise Records"],
      [829, "Asylum Records"],
      [830, "Windham Hill Records"],
    ]);

    assert.equal(
      await result.toString(),
      `INSERT INTO INVENTARIO_CD
VALUES
(827, 'Private Music'),
(828, 'Reprise Records'),
(829, 'Asylum Records'),
(830, 'Windham Hill Records');`,
    );
  });

  test("Actualizar el valor de una columna", { only: false }, async () => {
    const result = qb.update("INVENTARIO_CD", { EN_EXISTENCIA: 27 });
    assert.equal(
      await result.toString(),
      `UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27;`,
    );
  });

  test(
    "Actualizar el valor de varias columnas",
    { only: false },
    async () => {
      const result = qb.update("INVENTARIO_CD", {
        EN_EXISTENCIA: "27",
        CANTIDAD: 10,
      });
      assert.equal(
        await result.toString(),
        `UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = '27',
CANTIDAD = 10;`,
      );
    },
  );

  test(
    "Actualizar el valor de una columna solo de algunas filas usando where",
    { only: false },
    async () => {
      const result = qb
        .update("INVENTARIO_CD", { EN_EXISTENCIA: 27 })
        .where(qb.eq("NOMBRE_CD", "Out of Africa"));

      assert.equal(
        await result.toString(),
        `UPDATE INVENTARIO_CD
SET EN_EXISTENCIA = 27
WHERE NOMBRE_CD = 'Out of Africa';`,
      );
    },
  );

  test(
    "Actualizar el valor de una columna usando como valor el select",
    { only: false },
    async () => {
      const sql = `UPDATE INVENTARIO_CD_2
SET EN_EXISTENCIA_2 =
( SELECT AVG(EN_EXISTENCIA)
FROM INVENTARIO_CD )
WHERE NOMBRE_CD_2 = 'Orlando';`;

      const result = await qb
        .update("INVENTARIO_CD_2", {
          EN_EXISTENCIA_2: qb
            .select(qb.avg("EN_EXISTENCIA"))
            .from("INVENTARIO_CD"),
        })
        .where(qb.eq("NOMBRE_CD_2", "Orlando"))
        .toString();

      assert.equal(result, sql);
    },
  );

  test(
    "Eliminar filas de una tabla con DELETE FROM",
    { only: false },
    async () => {
      const result = qb.delete("INVENTARIO_CD");
      assert.equal(await result.toString(), "DELETE FROM INVENTARIO_CD;");
    },
  );

  test(
    "Eliminar algunas filas de una tabla con DELETE y where",
    { only: false },
    async () => {
      const result = qb
        .delete("INVENTARIO_CD")
        .where(qb.eq("TIPO_MUSICA", "Country"));
      assert.equal(
        await result.toString(),
        `DELETE FROM INVENTARIO_CD
WHERE TIPO_MUSICA = 'Country';`,
      );
    },
  );

  test(
    "eliminar datos usando una sub consulta",
    { only: false },
    async () => {
      const result = await qb
        .delete("TIPOS_TITULO")
        .where(
          qb.in(
            "TITULO_CD",
            qb
              .select("TITLE")
              .from("INVENTARIO_TITULOS")
              .where(qb.eq("TITLE_ID", 108)),
          ),
        )
        .toString();

      assert.equal(
        result,
        `DELETE FROM TIPOS_TITULO
WHERE TITULO_CD IN ( SELECT TITLE
FROM INVENTARIO_TITULOS
WHERE TITLE_ID = 108 );`,
      );
    },
  );
});
