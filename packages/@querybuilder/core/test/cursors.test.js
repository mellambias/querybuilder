import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";
import Cursor from "../cursor.js";

describe("Cursors", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("declarar un cursor", { only: false }, async () => {
    const options = {
      changes: "ASENSITIVE",
      cursor: "SCROLL",
      hold: true,
      return: false,
      orderBy: "COLUMN",
      readOnly: false,
      update: ["COL1", "COL2"],
    };

    const result = await qb.createCursor(
      "name",
      qb.select("*").from("TABLA"),
      options,
    );

    assert.equal(
      result,
      `DECLARE name ASENSITIVE SCROLL WITH HOLD WITHOUT RETURN CURSOR FOR SELECT *
FROM TABLA ORDER BY COLUMN FOR UPDATE OF COL1, COL2;`,
    );
  });

  test(
    "instrucción de cursor básica con deplazamiento",
    { only: false },
    async () => {
      const result = await qb.createCursor(
        "CD_1",
        qb.select("*").from("INVENTARIO_CD"),
        {
          orderBy: "DISCO_COMPACTO",
          cursor: "scroll",
          readOnly: true,
        },
      );

      assert.equal(
        result,
        `DECLARE CD_1 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;`,
      );
    },
  );

  test("un cursor actualizable", { only: false }, async () => {
    const result = await qb.createCursor(
      "CD_4",
      qb.select("*").from("INVENTARIO_CD"),
      {
        update: "DISCO_COMPACTO",
      },
    );

    assert.equal(
      result,
      `DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE OF DISCO_COMPACTO;`,
    );
  });

  test("Recuperar datos de un cursor", { only: false }, async () => {
    const cursor = await qb.createCursor(
      "CD_2",
      qb.select("*").from("INVENTARIO_CD"),
      {
        cursor: "scroll",
        orderBy: "DISCO_COMPACTO",
        readOnly: true,
      },
    );
    assert.ok(cursor instanceof Cursor);
    assert.equal(
      cursor,
      `DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;`,
    );

    assert.equal(cursor.status, "declared");
    // Se abre el cursor utilizando el queryBuilder
    const openCursor = await qb.openCursor("CD_2");
    assert.equal(
      openCursor.toString(),
      `DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;
OPEN CD_2;`,
    );
    assert.ok(openCursor.name);
    assert.ok(cursor.name);
    assert.equal(openCursor.name, cursor.name);
    assert.equal(cursor.status, "opened");

    // Lanzamos una peticion
    let query = cursor.fetchNext(["una", "dos"]);
    assert.equal(query, "FETCH NEXT FROM CD_2\nINTO :una, :dos");
    assert.ok(cursor.options.cursor);
    query = cursor.fetchAbsolute(5, ["una", "dos"]);
    assert.equal(query, "FETCH ABSOLUTE 5 FROM CD_2\nINTO :una, :dos");

    // Se cierra el cursor utilizando el queryBuilder
    await qb.closeCursor("CD_2");

    assert.equal(cursor.status, "closed");
    assert.equal(
      cursor.toString(),
      `DECLARE CD_2 SCROLL CURSOR FOR SELECT *
FROM INVENTARIO_CD ORDER BY DISCO_COMPACTO FOR READ ONLY;
OPEN CD_2;
FETCH NEXT FROM CD_2
INTO :una, :dos;
FETCH ABSOLUTE 5 FROM CD_2
INTO :una, :dos;
CLOSE CD_2;`,
    );
  });

  test("Actualizar datos usando el cursor", { only: false }, async () => {
    //declara el cursor para actualizar
    const cursor = await qb.createCursor(
      "CD_4",
      qb.select("*").from("INVENTARIO_CD"),
      { update: true },
    );

    assert.equal(
      cursor.toString(),
      `DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;`,
    );

    // abre el cursor creado
    cursor.open();
    assert.equal(cursor.name, "CD_4");
    assert.equal(cursor.status, "opened");

    // recupera datos del cursor y los pasa a variables host
    const fetch = cursor.fetch(["CD", "Categoria", "Precio", "A_la_mano"]);
    assert.equal(
      fetch,
      `FETCH CD_4
INTO :CD, :Categoria, :Precio, :A_la_mano`,
    );

    // Actualiza los datos de la tabla usando variables de host obtenidas del cursor
    const result = await qb
      .update("INVENTARIO_CD", { A_LA_MANO: ":A_la_mano * 2" })
      .whereCursor("CD_4")
      .closeCursor("CD_4");

    assert.equal(
      result.toString(),
      `DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD, :Categoria, :Precio, :A_la_mano;
UPDATE INVENTARIO_CD
SET A_LA_MANO = :A_la_mano * 2
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
    );
  });

  test(
    "DELETE POSICIONADO usando comandos de cursor",
    { only: false },
    async () => {
      // Crea un cursor
      const cursor = await qb.createCursor(
        "CD_4",
        qb.select("*").from("INVENTARIO_CD"),
        {
          update: true,
        },
      );
      // abre el cursor
      cursor.open();
      // Desplaza el cursor
      const fila = cursor.fetch(["CD"]);
      // añade un comando al cursor
      await cursor.add(qb.delete("INVENTARIO_CD").whereCursor("CD_4"));
      // cierra el cursor
      cursor.close();

      assert.ok(fila);

      assert.equal(
        cursor.toString(),
        `DECLARE CD_4 CURSOR FOR SELECT *
FROM INVENTARIO_CD FOR UPDATE;
OPEN CD_4;
FETCH CD_4
INTO :CD;
DELETE FROM INVENTARIO_CD
WHERE CURRENT OF CD_4;
CLOSE CD_4;`,
      );
    },
  );
});
