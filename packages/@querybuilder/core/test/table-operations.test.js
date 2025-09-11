import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Table Operations", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("Crear una tabla", { only: false }, async () => {
    const result = await qb
      .use("testing")
      .createTable("table_test", { cols: { ID: "INT" } })
      .toString();
    assert.equal(result, "USE testing;\nCREATE TABLE table_test\n( ID INT );");
  });

  test("Crear una tabla temporal global", { only: false }, async () => {
    const result = await qb
      .use("testing")
      .createTable("table_test", {
        temporary: "global",
        onCommit: "delete",
        cols: { ID: "INT" },
      })
      .toString();

    assert.equal(
      result,
      "USE testing;\nCREATE GLOBAL TEMPORARY\nTABLE table_test\n( ID INT )\nON COMMIT DELETE ROWS;",
    );
  });

  test("Crear una tabla temporal local", { only: false }, async () => {
    const result = await qb
      .use("testing")
      .createTable("table_test", {
        temporary: "local",
        onCommit: "PRESERVE",
        cols: { ID: "INT" },
      })
      .toString();
    assert.equal(
      result,
      "USE testing;\nCREATE LOCAL TEMPORARY\nTABLE table_test\n( ID INT )\nON COMMIT PRESERVE ROWS;",
    );
  });

  test("Crear una tabla con varias columnas", { only: false }, async () => {
    const cols = {
      ID_ARTISTA: "INTEGER",
      NOMBRE_ARTISTA: { type: "CHARACTER(60)", default: "artista" },
      FDN_ARTISTA: "DATE",
      POSTER_EN_EXISTENCIA: "BOOLEAN",
    };
    const result = await qb
      .use("testing")
      .createTable("table_test", { cols })
      .toString();
    assert.equal(
      result,
      "USE testing;\nCREATE TABLE table_test\n( ID_ARTISTA INTEGER,\n NOMBRE_ARTISTA CHARACTER(60) DEFAULT 'artista',\n FDN_ARTISTA DATE,\n POSTER_EN_EXISTENCIA BOOLEAN );",
    );
  });

  test(
    "No puede Crear una tabla si una columna no es valida",
    { only: false },
    async () => {
      try {
        const cols = {
          DAY: "INTEGER",
          NOMBRE_ARTISTA: { type: "CHARACTER(60)" },
        };
        await qb.use("testing").createTable("table_test", { cols }).toString();
      } catch (error) {
        // El error viene con doble "Error:" prefijo
        assert.equal(error.toString(), "Error: Error: DAY no es un identificador valido");
      }
    },
  );

  test("Crea la base de datos inventario", { only: false }, async () => {
    const cols = {
      DISCOS_COMPACTOS: {
        ID_DISCO_COMPACTO: "INT",
        TITULO_CD: "VARCHAR(60)",
        ID_DISQUERA: "INT",
      },
      DISQUERAS_CD: {
        ID_DISQUERA: "INT",
        NOMBRE_COMPANYI: "VARCHAR(60)",
      },
      TIPOS_MUSICA: {
        ID_TIPO: "INT",
        NOMBRE_TIPO: "VARCHAR(20)",
      },
    };

    const result = await qb
      .createDatabase("INVENTARIO")
      .use("INVENTARIO")
      .createTable("DISCOS_COMPACTOS", { cols: cols.DISCOS_COMPACTOS })
      .createTable("DISQUERAS_CD", { cols: cols.DISQUERAS_CD })
      .createTable("TIPOS_MUSICA", { cols: cols.TIPOS_MUSICA })
      .toString();
  });

  describe("Alter TABLE", async () => {
    test("Añade una columna a la tabla", { only: false }, async () => {
      const result = await qb
        .use("INVENTARIO")
        .alterTable("DISCOS_COMPACTOS")
        .addColumn("CANTIDAD", "INT")
        .toString();

      assert.equal(
        result,
        "USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nADD COLUMN CANTIDAD INT;",
      );
    });

    test("Modifica una columna a la tabla", { only: false }, async () => {
      const result = await qb
        .use("INVENTARIO")
        .alterTable("DISCOS_COMPACTOS")
        .alterColumn("CANTIDAD")
        .setDefault("DESCONOCIDO")
        .alterColumn("CIUDAD")
        .dropDefault()
        .toString();

      assert.equal(
        result,
        `USE INVENTARIO;
ALTER TABLE DISCOS_COMPACTOS
ALTER COLUMN CANTIDAD SET DEFAULT 'DESCONOCIDO';
ALTER TABLE DISCOS_COMPACTOS
ALTER COLUMN CIUDAD DROP DEFAULT;`,
      );
    });

    test("Elimina una columna a la tabla", { only: false }, async () => {
      const result = await qb
        .use("INVENTARIO")
        .alterTable("DISCOS_COMPACTOS")
        .dropColumn("CANTIDAD", "CASCADE")
        .toString();

      assert.equal(
        result,
        "USE INVENTARIO;\nALTER TABLE DISCOS_COMPACTOS\nDROP COLUMN CANTIDAD CASCADE;",
      );
    });
  });

  test("Elimina una tabla", { only: false }, async () => {
    const result = await qb
      .use("INVENTARIO")
      .dropTable("DISCOS_COMPACTOS", "cascade")
      .toString();
    assert.equal(
      result,
      "USE INVENTARIO;\nDROP TABLE DISCOS_COMPACTOS CASCADE;",
    );
  });
});
