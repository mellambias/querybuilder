import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Constraints and Data Types", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  describe("Restricciones de columna", { only: false }, async () => {
    test("Aplicación de not null", async () => {
      const tabla = {
        ID_ARTISTA: { type: "INT", values: ["not null"] },
      };
      const result = await qb
        .createTable("ARTISTAS", { cols: tabla })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL );",
      );
    });

    test("Aplicación de UNIQUE", async () => {
      const tabla = {
        ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
      };
      const result = await qb
        .createTable("ARTISTAS", { cols: tabla })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL UNIQUE );",
      );
    });

    test("Aplicacion de PRIMARY KEY", async () => {
      const tabla = {
        ID_ARTISTA: { type: "INT", values: ["primary key"] },
      };
      const result = await qb
        .createTable("ARTISTAS", { cols: tabla })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT PRIMARY KEY );",
      );
    });

    test("Aplicacion de FOREIGN KEY", async () => {
      const tabla = {
        ID_ARTISTA: {
          type: "INT",
          values: ["not null"],
          foreingKey: {
            table: "CD_ARTISTA",
            cols: "CD_ARTISTA_ID",
            match: "full",
          },
        },
      };
      const result = await qb
        .createTable("ARTISTAS", { cols: tabla })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH FULL );",
      );
    });

    test("Restriccion de CHECK", async () => {
      const TITULOS_CD = {
        ID_DISCO_COMPACTO: "INT",
        TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
        EN_EXISTENCIA: {
          type: "INT",
          values: ["NOT NULL"],
          check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30",
        },
      };
      const result = await qb
        .createTable("TITULOS_CD", {
          cols: TITULOS_CD,
        })
        .toString();
      assert.equal(
        result,
        `CREATE TABLE TITULOS_CD
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30 ) );`,
      );
    });
  });

  describe("Restriccion de Tabla", async () => {
    test("Aplicacion de UNIQUE y NOT NULL", { only: false }, async () => {
      const tabla = {
        ID_ARTISTA: { type: "INT", values: ["not null", "unique"] },
        NOMBRE_ARTISTA: { type: "VARCHAR(60)", values: ["not null", "unique"] },
      };
      const result = await qb
        .createTable("ARTISTAS", {
          cols: tabla,
          constraints: [
            {
              name: "unicos",
              type: "unique",
              cols: ["ID_ARTISTA", "NOMBRE_ARTISTA"],
            },
            {
              name: "not_null",
              type: "not null",
              cols: ["ID_ARTISTA"],
            },
          ],
        })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT NOT NULL UNIQUE,\n NOMBRE_ARTISTA VARCHAR(60) NOT NULL UNIQUE,\n CONSTRAINT unicos UNIQUE (ID_ARTISTA, NOMBRE_ARTISTA),\n CONSTRAINT not_null NOT NULL (ID_ARTISTA) );",
      );
    });

    test("Aplicacion de PRIMARY KEY", { only: false }, async () => {
      const tabla = {
        ID_ARTISTA: "INT",
        NOMBRE_ARTISTA: {
          type: "VARCHAR(60)",
          values: ["not null"],
        },
      };
      const result = await qb
        .createTable("ARTISTAS", {
          cols: tabla,
          constraints: [
            {
              name: "PK_ID",
              type: "primary key",
              cols: ["ID_ARTISTA", "NOMBRE_ARTISTA"],
            },
          ],
        })
        .toString();
      assert.equal(
        result,
        "CREATE TABLE ARTISTAS\n( ID_ARTISTA INT,\n NOMBRE_ARTISTA VARCHAR(60) NOT NULL,\n CONSTRAINT PK_ID PRIMARY KEY (ID_ARTISTA, NOMBRE_ARTISTA) );",
      );
    });

    test("Aplicacion de constraing FOREIGN KEY", { only: false }, async () => {
      const tabla = {
        ID_ARTISTA: {
          type: "INT",
          values: ["not null"],
        },
      };
      const result = await qb
        .createTable("ARTISTAS", {
          cols: tabla,
          constraints: [
            {
              name: "FK_CD_ARTISTA",
              type: "foreign key",
              cols: ["ID_ARTISTA"],
              foreignKey: {
                table: "CD_ARTISTA",
                cols: ["CD_ARTISTA_ID"],
                match: "partial",
              },
            },
          ],
        })
        .toString();
      assert.equal(
        result,
        `CREATE TABLE ARTISTAS
( ID_ARTISTA INT NOT NULL,
 CONSTRAINT FK_CD_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES CD_ARTISTA (CD_ARTISTA_ID) MATCH PARTIAL );`,
      );
    });

    test(
      "Aplicacion de FOREIGN KEY ON UPDATE Y ON DELETE",
      { only: false },
      async () => {
        const tabla = {
          ID_ARTISTA: {
            type: "INT",
            values: ["not null"],
          },
        };
        const result = await qb
          .createTable("ARTISTAS", {
            cols: tabla,
            constraints: [
              {
                name: "FK_CD_ARTISTA",
                type: "foreign key",
                cols: ["ID_ARTISTA"],
                foreignKey: {
                  table: "CD_ARTISTA",
                  cols: ["CD_ARTISTA_ID"],
                  actions: {
                    onUpdate: "cascade",
                    onDelete: "set null",
                  },
                },
              },
            ],
          })
          .toString();
        assert.equal(
          result,
          `CREATE TABLE ARTISTAS
( ID_ARTISTA INT NOT NULL,
 CONSTRAINT FK_CD_ARTISTA FOREIGN KEY (ID_ARTISTA) REFERENCES CD_ARTISTA (CD_ARTISTA_ID) ON UPDATE CASCADE ON DELETE SET NULL );`,
        );
      },
    );

    test("Restriccion de CHECK con constraing", { only: false }, async () => {
      const TITULOS_CD = {
        ID_DISCO_COMPACTO: "INT",
        TITULO_CD: { type: "VARCHAR(60)", values: ["NOT NULL"] },
        EN_EXISTENCIA: { type: "INT", values: ["NOT NULL"] },
      };
      const result = await qb
        .createTable("TITULOS_CD", {
          cols: TITULOS_CD,
          constraints: [
            {
              name: "CK_EN_EXISTENCIA",
              check: "EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30",
            },
          ],
        })
        .toString();
      assert.equal(
        result,
        `CREATE TABLE TITULOS_CD
( ID_DISCO_COMPACTO INT,
 TITULO_CD VARCHAR(60) NOT NULL,
 EN_EXISTENCIA INT NOT NULL,
 CONSTRAINT CK_EN_EXISTENCIA CHECK ( EN_EXISTENCIA > 0 AND EN_EXISTENCIA < 30 ) );`,
      );
    });

    test("Crear un DOMINIO", { only: false }, async () => {
      const result = await qb
        .createDomain("CANTIDAD_EN_EXISTENCIA", {
          as: "INT",
          default: 0,
          constraint: {
            name: "CK_CANTIDAD_EN_EXISTENCIA",
            check: "VALUE BETWEEN 0 AND 30",
          },
        })
        .toString();
      assert.equal(
        result,
        `CREATE DOMAIN CANTIDAD_EN_EXISTENCIA
AS INT
DEFAULT 0
CONSTRAINT CK_CANTIDAD_EN_EXISTENCIA CHECK ( VALUE BETWEEN 0 AND 30 );`,
      );
    });
  });

  describe("Opciones poco o nada soportadas", { only: false }, async () => {
    test("CREATE ASSERTION", async () => {
      const result = await qb
        .createAssertion(
          "LIMITE_EN_EXISTENCIA",
          "( SELECT SUM (EN_EXISTENCIA) FROM TITULOS_CD ) < 5000",
        )
        .toString();
      assert.equal(
        result,
        "CREATE ASSERTION LIMITE_EN_EXISTENCIA CHECK ( ( SELECT SUM (EN_EXISTENCIA) FROM TITULOS_CD ) < 5000 );",
      );
    });
  });
});
