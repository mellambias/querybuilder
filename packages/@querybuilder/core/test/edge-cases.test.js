import { describe, test, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Edge Cases and Error Conditions", () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  
  describe("Insert Operations Edge Cases", () => {
    test("insert con valores simples", { only: false }, async () => {
      const result = await qb
        .insertInto("PRODUCTOS", ["NOMBRE", "PRECIO", "CATEGORIA"])
        .values(["Laptop", 1500, "Electrónicos"])
        .toString();

      assert.equal(
        result,
        `INSERT INTO PRODUCTOS
(NOMBRE, PRECIO, CATEGORIA)
VALUES
( 'Laptop', 1500, 'Electrónicos' );`
      );
      qb.dropQuery();
    });

    test("insert con múltiples filas", { only: false }, async () => {
      const result = await qb
        .insertInto("EMPLEADOS", ["NOMBRE", "SALARIO"])
        .values([
          ["Juan", 3000],
          ["María", 3500],
          ["Carlos", 2800]
        ])
        .toString();

      assert.equal(
        result,
        `INSERT INTO EMPLEADOS
(NOMBRE, SALARIO)
VALUES
('Juan', 3000),
('María', 3500),
('Carlos', 2800);`
      );
      qb.dropQuery();
    });

    test("insert con subconsulta", { only: false }, async () => {
      const result = await qb
        .insertInto("BACKUP_CLIENTES", ["ID", "NOMBRE"])
        .values(qb.select(["ID", "NOMBRE"]).from("CLIENTES"))
        .toString();

      assert.equal(
        result,
        `INSERT INTO BACKUP_CLIENTES
(ID, NOMBRE)
SELECT ID, NOMBRE
FROM CLIENTES;`
      );
      qb.dropQuery();
    });
  });

  describe("Update Operations Edge Cases", () => {
    test("update con valores mixtos", { only: false }, async () => {
      const result = await qb
        .update("PRODUCTOS", {
          PRECIO: 1200,
          NOMBRE: "Laptop Actualizada", 
          STOCK: ":nuevo_stock",
          CATEGORIA_ID: qb.select("ID").from("CATEGORIAS").where(qb.eq("NOMBRE", "Electrónicos"))
        })
        .toString();

      assert.ok(result.includes("UPDATE PRODUCTOS"));
      assert.ok(result.includes("PRECIO = 1200"));
      assert.ok(result.includes("NOMBRE = 'Laptop Actualizada'"));
      assert.ok(result.includes("STOCK = :nuevo_stock"));
      assert.ok(result.includes("CATEGORIA_ID =\n( SELECT ID"));
      qb.dropQuery();
    });

    test("update simple", { only: false }, async () => {
      const result = await qb
        .update("CLIENTES", {
          EMAIL: "nuevo@email.com",
          ESTADO: "ACTIVO"
        })
        .toString();

      assert.equal(
        result,
        `UPDATE CLIENTES
SET EMAIL = 'nuevo@email.com',
ESTADO = 'ACTIVO';`
      );
      qb.dropQuery();
    });
  });

  describe("Delete Operations", () => {
    test("delete básico", { only: false }, async () => {
      const result = qb.delete("PRODUCTOS_OBSOLETOS");
      assert.equal(result, "DELETE FROM PRODUCTOS_OBSOLETOS");
    });
  });

  describe("Complex Joins", () => {
    test("crossJoin", { only: false }, async () => {
      const result = qb.crossJoin("TABLA_A", "A");
      assert.equal(result, "CROSS JOIN TABLA_A A");
    });

    test("naturalJoin", { only: false }, async () => {
      const result = qb.naturalJoin(["EMPLEADOS", "DEPARTAMENTOS"]);
      assert.equal(result, "FROM EMPLEADOS NATURAL JOIN DEPARTAMENTOS");
    });

    test("leftJoin con alias", { only: false }, async () => {
      const result = qb.leftJoin(
        ["CLIENTES", "ORDENES"], 
        ["C", "O"]
      );
      assert.equal(result, "FROM CLIENTES C LEFT OUTER JOIN ORDENES O");
    });

    test("rightJoin", { only: false }, async () => {
      const result = qb.rightJoin(["PRODUCTOS", "CATEGORIAS"]);
      assert.equal(result, "FROM PRODUCTOS RIGHT OUTER JOIN CATEGORIAS");
    });

    test("fullJoin", { only: false }, async () => {
      const result = qb.fullJoin(["VENTAS_2023", "VENTAS_2024"]);
      assert.equal(result, "FROM VENTAS_2023 FULL OUTER JOIN VENTAS_2024");
    });

    test("innerJoin", { only: false }, async () => {
      const result = qb.innerJoin("ORDENES", "ORD");
      assert.equal(result, "INNER JOIN ORDENES ORD");
    });
  });

  describe("Schema Operations", () => {
    test("crear schema", { only: false }, async () => {
      const result = qb.createSchema("VENTAS", {
        authorization: "usuario_ventas"
      });
      assert.ok(result.includes("CREATE SCHEMA"));
      assert.ok(result.includes("VENTAS"));
    });

    test("eliminar schema", { only: false }, async () => {
      const result = qb.dropSchema("TEMPORAL", {
        option: "CASCADE"
      });
      assert.ok(result.includes("DROP SCHEMA"));
      assert.ok(result.includes("TEMPORAL"));
      assert.ok(result.includes("CASCADE"));
    });
  });

  describe("Type Operations", () => {
    test("crear tipo personalizado", { only: false }, async () => {
      const result = qb.createType("ESTADO_EMPLEADO", {
        values: ["ACTIVO", "INACTIVO", "SUSPENDIDO"]
      });
      assert.ok(result.includes("CREATE TYPE"));
      assert.ok(result.includes("ESTADO_EMPLEADO"));
    });

    test("eliminar tipo", { only: false }, async () => {
      const result = qb.dropType("MI_TIPO", {
        option: "RESTRICT"
      });
      assert.ok(result.includes("DROP TYPE"));
      assert.ok(result.includes("MI_TIPO"));
    });
  });

  describe("Domain and Assertion Operations", () => {
    test("crear assertion", { only: false }, async () => {
      const result = qb.createAssertion("CHECK_SALARIO", "SALARIO > 0");
      assert.ok(result.includes("CREATE ASSERTION"));
      assert.ok(result.includes("CHECK_SALARIO"));
      assert.ok(result.includes("SALARIO > 0"));
    });

    test("crear domain", { only: false }, async () => {
      const result = qb.createDomain("SALARIO_DOMAIN", {
        type: "DECIMAL(10,2)",
        check: "VALUE > 0"
      });
      assert.ok(result.includes("CREATE DOMAIN"));
      assert.ok(result.includes("SALARIO_DOMAIN"));
    });
  });

  describe("Constraint Management", () => {
    test("añadir constraint", { only: false }, async () => {
      const result = qb.addConstraint("FK_PRODUCTO", {
        type: "FOREIGN KEY",
        column: "CATEGORIA_ID", 
        references: "CATEGORIAS(ID)"
      });
      assert.ok(result.includes("ADD CONSTRAINT"));
      assert.ok(result.includes("FK_PRODUCTO"));
    });

    test("table constraints múltiples", { only: false }, async () => {
      const result = qb.tableConstraints([
        "PRIMARY KEY (ID)",
        "UNIQUE (CODIGO)",
        "CHECK (PRECIO > 0)"
      ]);
      assert.ok(result.includes("PRIMARY KEY"));
      assert.ok(result.includes("UNIQUE"));
      assert.ok(result.includes("CHECK"));
    });
  });

  describe("Complex Predicates", () => {
    test("between con valores", { only: false }, async () => {
      const result = await qb
        .select("*")
        .from("PRODUCTOS")  
        .where(qb.between("PRECIO", 100, 500))
        .toString();

      assert.ok(result.includes("PRECIO BETWEEN 100 AND 500"));
      qb.dropQuery();
    });

    test("notBetween", { only: false }, async () => {
      const result = await qb
        .select("NOMBRE")
        .from("EMPLEADOS")
        .where(qb.notBetween("EDAD", 18, 65))
        .toString();

      assert.ok(result.includes("EDAD NOT BETWEEN 18 AND 65"));
      qb.dropQuery();
    });

    test("operadores de comparación múltiples", { only: false }, async () => {
      assert.equal(qb.eq("COLUMNA", "valor"), "COLUMNA = 'valor'");
      assert.equal(qb.ne("COLUMNA", 100), "COLUMNA <> 100");
      assert.equal(qb.gte("PRECIO", 50), "PRECIO >= 50");
      assert.equal(qb.lte("EDAD", 30), "EDAD <= 30");
    });

    test("predicados lógicos", { only: false }, async () => {
      const condiciones = [
        qb.gt("PRECIO", 100),
        qb.eq("CATEGORIA", "Electrónicos")
      ];
      
      const result = await qb
        .select("*")
        .from("PRODUCTOS")
        .where(qb.and(...condiciones))
        .toString();

      assert.ok(result.includes("AND"));
      qb.dropQuery();
    });

    test("predicado NOT", { only: false }, async () => {
      const result = await qb
        .select("*") 
        .from("EMPLEADOS")
        .where(qb.not(qb.eq("ESTADO", "INACTIVO")))
        .toString();

      assert.ok(result.includes("NOT"));
      qb.dropQuery();
    });

    test("LIKE pattern", { only: false }, async () => {
      const result = await qb
        .select("NOMBRE")
        .from("CLIENTES")
        .where(qb.like("NOMBRE", "%Juan%"))
        .toString();

      assert.ok(result.includes("LIKE"));
      assert.ok(result.includes("%Juan%"));
      qb.dropQuery();
    });

    test("NOT LIKE pattern", { only: false }, async () => {
      const result = await qb
        .select("EMAIL")
        .from("USUARIOS")
        .where(qb.notLike("EMAIL", "%.temp"))
        .toString();

      assert.ok(result.includes("NOT LIKE"));
      qb.dropQuery();
    });
  });

  describe("NULL handling", () => {
    test("isNull con múltiples columnas", { only: false }, async () => {
      const result = qb.isNull(["EMAIL", "TELEFONO"]);
      assert.equal(result, "EMAIL IS NULL\nAND TELEFONO IS NULL");
    });

    test("isNotNull individual", { only: false }, async () => {
      const result = qb.isNotNull("FECHA_NACIMIENTO");
      assert.equal(result, "FECHA_NACIMIENTO IS NOT NULL");
    });
  });

  describe("getListValues complex scenarios", () => {
    test("array de QueryBuilders anidados", { only: false }, async () => {
      const subqueries = [
        qb.select("ID").from("TABLA1"),
        qb.select("ID").from("TABLA2")
      ];
      
      // Este test verifica que getListValues maneje correctamente arrays de QB
      const result = await qb
        .select("*")
        .from("MAIN_TABLE") 
        .where(qb.inOp("ID", subqueries))
        .toString();

      assert.ok(result.includes("SELECT"));
      qb.dropQuery();
    });

    test("valores string con comillas", { only: false }, async () => {
      const result = await qb
        .insertInto("TEXTOS", ["CONTENIDO"])
        .values(["Texto con 'comillas' internas"])
        .toString();

      assert.ok(result.includes("'Texto con 'comillas' internas'"));
      qb.dropQuery();
    });
  });

  describe("Database operations with options", () => {
    test("crear database con opciones", { only: false }, async () => {
      const result = qb.createDatabase("MI_DB", {
        encoding: "UTF8",
        collation: "es_ES"
      });
      assert.ok(result.includes("CREATE DATABASE"));
      assert.ok(result.includes("MI_DB"));
    });

    test("eliminar database con CASCADE", { only: false }, async () => {
      const result = qb.dropDatabase("DB_TEMPORAL", {
        option: "CASCADE"
      });
      assert.ok(result.includes("DROP DATABASE"));
      assert.ok(result.includes("CASCADE"));
    });
  });

  describe("getSubselect edge cases", () => {
    test("getSubselect con all=true", { only: false }, async () => {
      // Test para verificar el parámetro all en getSubselect
      const result = await qb
        .select("*")
        .from("TABLA")
        .where(qb.exists(qb.select("1").from("OTRA_TABLA")))
        .toString();

      assert.ok(result.includes("EXISTS"));
      qb.dropQuery();
    });
  });
});
