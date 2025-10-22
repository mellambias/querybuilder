import { describe, test, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Advanced Features and Edge Cases", () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });


  describe("String Functions", () => {
    test("substr - extraer subcadena con inicio y longitud", { only: false }, async () => {
      assert.equal(
        qb.substr("NOMBRE_ARTISTA", 1, 5, "INICIAL"),
        "SUBSTRING(NOMBRE_ARTISTA FROM 1 FOR 5) AS INICIAL"
      );
      qb.dropQuery();
    });

    test("substr - extraer subcadena solo con inicio", { only: false }, async () => {
      assert.equal(
        qb.substr("NOMBRE_ARTISTA", 3, "SUFIJO"),
        "SUBSTRING(NOMBRE_ARTISTA FROM 3) AS SUFIJO"
      );
      qb.dropQuery();
    });

    test("substr - sin alias", { only: false }, async () => {
      assert.equal(
        qb.substr("TITULO", 1, 10),
        "SUBSTRING(TITULO FROM 1 FOR 10)"
      );
      qb.dropQuery();
    });
  });

  describe("Date Functions", () => {
    test("funciones de fecha actuales", { only: false }, async () => {
      assert.equal(qb.currentDate(), "CURRENT_DATE");
      assert.equal(qb.currentTime(), "CURRENT_TIME");
      assert.equal(qb.currentTimestamp(), "CURRENT_TIMESTAMP");
      assert.equal(qb.localTime(), "LOCALTIME");
      assert.equal(qb.localTimestamp(), "LOCALTIMESTAMP");
    });
  });

  describe("CASE Expressions", () => {
    test("CASE con columna específica", { only: false }, async () => {
      const result = qb.case(
        "STATUS",
        [
          ["ESTADO = 'A'", "'ACTIVO'"],
          ["ESTADO = 'I'", "'INACTIVO'"]
        ],
        "'DESCONOCIDO'"
      );

      assert.equal(
        result.expresion,
        `CASE
WHEN ESTADO = 'A' THEN 'ACTIVO'
WHEN ESTADO = 'I' THEN 'INACTIVO'
ELSE 'DESCONOCIDO'
END AS STATUS`
      );
    });

    test("CASE sin columna específica", { only: false }, async () => {
      const result = qb.case(
        [
          ["PRECIO > 100", "'CARO'"],
          ["PRECIO > 50", "'MEDIO'"]
        ],
        "'BARATO'"
      );

      assert.equal(
        result.expresion,
        `CASE
WHEN PRECIO > 100 THEN 'CARO'
WHEN PRECIO > 50 THEN 'MEDIO'
ELSE 'BARATO'
END`
      );
    });
  });

  describe("Set Operations", () => {
    test("UNION de dos consultas", { only: false }, async () => {
      const result = await qb
        .union([
          qb.select("NOMBRE").from("ARTISTAS"),
          qb.select("TITULO").from("ALBUMS")
        ])
        .toString();

      assert.equal(
        result,
        `SELECT NOMBRE
FROM ARTISTAS
UNION
SELECT TITULO
FROM ALBUMS;`
      );
      qb.dropQuery();
    });

    test("UNION ALL de múltiples consultas", { only: false }, async () => {
      const result = await qb
        .union([
          qb.select("ID").from("TABLA1"),
          qb.select("ID").from("TABLA2"),
          qb.select("ID").from("TABLA3")
        ], { all: true })
        .toString();

      assert.equal(
        result,
        `SELECT ID
FROM TABLA1
UNION ALL
SELECT ID
FROM TABLA2
UNION ALL
SELECT ID
FROM TABLA3;`
      );
      qb.dropQuery();
    });

    test("INTERSECT de consultas", { only: false }, async () => {
      const result = await qb
        .intersect([
          qb.select("CLIENTE_ID").from("VENTAS_2023"),
          qb.select("CLIENTE_ID").from("VENTAS_2024")
        ])
        .toString();

      assert.equal(
        result,
        `SELECT CLIENTE_ID
FROM VENTAS_2023
INTERSECT
SELECT CLIENTE_ID
FROM VENTAS_2024;`
      );
      qb.dropQuery();
    });

    test("EXCEPT de consultas", { only: false }, async () => {
      const result = await qb
        .except([
          qb.select("PRODUCTO_ID").from("INVENTARIO"),
          qb.select("PRODUCTO_ID").from("VENTAS")
        ])
        .toString();

      assert.equal(
        result,
        `SELECT PRODUCTO_ID
FROM INVENTARIO
EXCEPT
SELECT PRODUCTO_ID
FROM VENTAS;`
      );
      qb.dropQuery();
    });
  });

  describe("Advanced Transactions", () => {
    test("crear y limpiar savepoint", { only: false }, async () => {
      assert.equal(qb.language.setSavePoint("punto1"), "SAVEPOINT punto1");
      assert.equal(qb.language.clearSavePoint("punto1"), "RELEASE SAVEPOINT punto1");
    });

    test("rollback con savepoint", { only: false }, async () => {
      assert.equal(qb.language.rollback("punto1"), "ROLLBACK TO SAVEPOINT punto1");
    });

    test("rollback sin savepoint", { only: false }, async () => {
      assert.equal(qb.language.rollback(), "ROLLBACK");
    });

    test("commit", { only: false }, async () => {
      assert.equal(qb.language.commit(), "COMMIT");
    });

    test("startTransaction", { only: false }, async () => {
      const result = qb.language.startTransaction({
        access: "READ WRITE",
        isolation: "SERIALIZABLE"
      });
      assert.ok(result.includes("START TRANSACTION"));
      assert.ok(result.includes("READ WRITE"));
      assert.ok(result.includes("SERIALIZABLE"));
    });
  });

  describe("Account Management", () => {
    test("getAccount con string simple", { only: false }, async () => {
      const result = qb.getAccount("usuario1");
      assert.equal(result, "'usuario1'@'%'");
    });

    test("getAccount con host específico", { only: false }, async () => {
      const result = qb.getAccount("admin", "localhost");
      assert.equal(result, "'admin'@'localhost'");
    });

    test("getAccount con objeto usuario", { only: false }, async () => {
      const result = qb.getAccount({ user: "developer", host: "192.168.1.100" });
      assert.equal(result, "'developer'@'192.168.1.100'");
    });
  });

  describe("Complex WHERE and ON clauses", () => {
    test("WHERE con QueryBuilder", { only: false }, async () => {
      const result = await qb
        .select("*")
        .from("PRODUCTOS")
        .where(qb.gt("PRECIO", 100))
        .toString();

      assert.equal(
        result,
        `SELECT *
FROM PRODUCTOS
WHERE PRECIO > 100;`
      );
      qb.dropQuery();
    });

    test("ON con predicado string", { only: false }, async () => {
      const result = qb.on("A.ID = B.ID");
      assert.equal(result, "ON A.ID = B.ID");
    });

    test("ON con QueryBuilder", { only: false }, async () => {
      const result = await qb
        .select("*")
        .from("TABLA_A")
        .join("TABLA_B")
        .on(qb.eq("TABLA_A.ID", "TABLA_B.ID"))
        .toString();

      assert.equal(
        result,
        `SELECT *
FROM TABLA_A
JOIN TABLA_B
ON TABLA_A.ID = TABLA_B.ID;`
      );
      qb.dropQuery();
    });
  });

  describe("Error Handling", () => {
    test("createCursor requiere nombre válido", { only: false }, async () => {
      assert.throws(
        () => {
          qb.createCursor(undefined, "SELECT * FROM TABLA");
        },
        /Es necesario un nombre valido para el cursor/
      );
    });

    test("getStatement con función inexistente", { only: false }, async () => {
      assert.throws(
        () => {
          qb.getStatement("TEST", {
            orden: ["invalid"],
            invalid: "not a function"
          }, { invalid: "value" });
        },
        /tiene que ser una funcion/
      );
    });
  });

  describe("Multi-table operations with aliases", () => {
    test("FROM con múltiples tablas y aliases", { only: false }, async () => {
      const result = qb.from(
        ["CLIENTES", "ORDENES", "PRODUCTOS"],
        ["C", "O", "P"]
      );
      assert.equal(result, "FROM CLIENTES AS C, ORDENES AS O, PRODUCTOS AS P");
    });

    test("FROM con tabla y alias único", { only: false }, async () => {
      const result = qb.from(["EMPLEADOS"], ["E"]);
      assert.equal(result, "FROM EMPLEADOS E");
    });

    test("FROM con string y alias", { only: false }, async () => {
      const result = qb.from("DEPARTAMENTOS", "DEPT");
      assert.equal(result, "FROM DEPARTAMENTOS DEPT");
    });
  });

  describe("Cursor Operations", () => {
    test("abrir cursor", { only: false }, async () => {
      assert.equal(qb.openCursor("mi_cursor"), "OPEN mi_cursor");
    });

    test("cerrar cursor", { only: false }, async () => {
      assert.equal(qb.closeCursor("mi_cursor"), "CLOSE mi_cursor");
    });

    test("fetch básico", { only: false }, async () => {
      const result = qb.fetch("cursor1", ":variable1");
      assert.equal(result, "FETCH cursor1\nINTO :variable1");
    });

    test("fetch con múltiples variables", { only: false }, async () => {
      const result = qb.fetch("cursor1", ["var1", "var2", "var3"]);
      assert.equal(result, "FETCH cursor1\nINTO :var1, :var2, :var3");
    });

    test("crear cursor básico", { only: false }, async () => {
      const result = qb.createCursor(
        "productos_cursor",
        "SELECT * FROM PRODUCTOS WHERE PRECIO > 100"
      );
      assert.ok(result.includes("DECLARE"));
      assert.ok(result.includes("productos_cursor"));
      assert.ok(result.includes("CURSOR"));
    });
  });

  describe("Function aggregates with aliases", () => {
    test("funciones agregadas con alias", { only: false }, async () => {
      assert.equal(qb.count("*", "TOTAL"), "COUNT(*) AS TOTAL");
      assert.equal(qb.sum("PRECIO", "SUMA_PRECIOS"), "SUM(PRECIO) AS SUMA_PRECIOS");
      assert.equal(qb.max("FECHA", "FECHA_MAX"), "MAX(FECHA) AS FECHA_MAX");
      assert.equal(qb.min("SALARIO", "SALARIO_MIN"), "MIN(SALARIO) AS SALARIO_MIN");
      assert.equal(qb.avg("EDAD"), "AVG(EDAD)");
    });

    test("funciones de cadena", { only: false }, async () => {
      assert.equal(qb.upper("NOMBRE", "NOMBRE_MAYUS"), "UPPER(NOMBRE) AS NOMBRE_MAYUS");
      assert.equal(qb.lower("APELLIDO"), "LOWER(APELLIDO)");
    });
  });

  describe("WHERE cursor operations", () => {
    test("WHERE con cursor actual", { only: false }, async () => {
      const result = qb.whereCursor("mi_cursor");
      assert.equal(result, "WHERE CURRENT OF mi_cursor");
    });
  });

  describe("USING clause", () => {
    test("USING con array de columnas", { only: false }, async () => {
      const result = qb.using(["ID", "CODIGO", "TIPO"]);
      assert.equal(result, "USING (ID, CODIGO, TIPO)");
    });

    test("USING con columna única", { only: false }, async () => {
      const result = qb.using("ID");
      assert.equal(result, "USING (ID)");
    });
  });
});
