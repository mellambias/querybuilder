import { describe, test, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Core Coverage Analysis Tests", () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  describe("Functions Available Through QueryBuilder Proxy", () => {
    test("verificar funciones básicas están disponibles", { only: false }, async () => {
      // Estas deberían estar disponibles
      assert.equal(typeof qb.select, "function");
      assert.equal(typeof qb.from, "function"); 
      assert.equal(typeof qb.where, "function");
      assert.equal(typeof qb.gt, "function");
      assert.equal(typeof qb.lt, "function");
      assert.equal(typeof qb.eq, "function");
    });

    test("verificar funciones de agregación están disponibles", { only: false }, async () => {
      assert.equal(typeof qb.count, "function");
      assert.equal(typeof qb.sum, "function");
      assert.equal(typeof qb.max, "function");
      assert.equal(typeof qb.min, "function");
      assert.equal(typeof qb.avg, "function");
    });

    test("verificar funciones de string están disponibles", { only: false }, async () => {
      assert.equal(typeof qb.upper, "function");
      assert.equal(typeof qb.lower, "function");
    });

    test("verificar operadores lógicos están disponibles", { only: false }, async () => {
      assert.equal(typeof qb.and, "function");
      assert.equal(typeof qb.or, "function");
      assert.equal(typeof qb.not, "function");
      assert.equal(typeof qb.like, "function");
      assert.equal(typeof qb.notLike, "function");
    });

    test("verificar predicados están disponibles", { only: false }, async () => {
      assert.equal(typeof qb.isNull, "function");
      assert.equal(typeof qb.isNotNull, "function");
      assert.equal(typeof qb.between, "function");
      assert.equal(typeof qb.notBetween, "function");
    });

    test("verificar joins están disponibles", { only: false }, async () => {
      assert.equal(typeof qb.join, "function");
      assert.equal(typeof qb.leftJoin, "function");
      assert.equal(typeof qb.rightJoin, "function");
      assert.equal(typeof qb.innerJoin, "function");
      assert.equal(typeof qb.crossJoin, "function");
      assert.equal(typeof qb.naturalJoin, "function");
      assert.equal(typeof qb.fullJoin, "function");
    });
  });

  describe("Functions NOT Available Through QueryBuilder Proxy", () => {
    test("verificar funciones Core que NO están en proxy", { only: false }, async () => {
      // Estas funciones del Core NO están disponibles directamente
      assert.equal(typeof qb.getAccount, "undefined");
      assert.equal(typeof qb.substr, "undefined");
      assert.equal(typeof qb.setSavePoint, "undefined");
      assert.equal(typeof qb.rollback, "undefined");
      assert.equal(typeof qb.commit, "undefined");
      assert.equal(typeof qb.startTransaction, "undefined");
      assert.equal(typeof qb.fetch, "undefined");
      assert.equal(typeof qb.currentDate, "undefined");
    });
  });

  describe("Basic Query Building Tests", () => {
    test("query simple con WHERE", { only: false }, async () => {
      const result = await qb
        .select("*")
        .from("USUARIOS")
        .where(qb.eq("ACTIVO", 1))
        .toString();

      assert.ok(result.includes("SELECT *"));
      assert.ok(result.includes("FROM USUARIOS"));
      assert.ok(result.includes("WHERE ACTIVO = 1"));
      qb.dropQuery();
    });

    test("query con múltiples predicados", { only: false }, async () => {
      const result = await qb
        .select(["ID", "NOMBRE"])
        .from("EMPLEADOS")
        .where(qb.and(
          qb.gt("SALARIO", 3000),
          qb.eq("DEPARTAMENTO", "VENTAS")
        ))
        .toString();

      assert.ok(result.includes("SELECT ID, NOMBRE"));
      assert.ok(result.includes("FROM EMPLEADOS"));
      assert.ok(result.includes("WHERE"));
      assert.ok(result.includes("AND"));
      qb.dropQuery();
    });

    test("query con JOIN", { only: false }, async () => {
      const result = await qb
        .select("E.NOMBRE, D.NOMBRE")
        .from("EMPLEADOS", "E")
        .innerJoin("DEPARTAMENTOS", "D")
        .on(qb.eq("E.DEPT_ID", "D.ID"))
        .toString();

      assert.ok(result.includes("INNER JOIN"));
      assert.ok(result.includes("ON"));
      qb.dropQuery();
    });

    test("query con subconsulta", { only: false }, async () => {
      const subquery = qb.select("AVG(SALARIO)").from("EMPLEADOS");
      const result = await qb
        .select("*")
        .from("EMPLEADOS")
        .where(qb.gt("SALARIO", subquery))
        .toString();

      assert.ok(result.includes("SELECT *"));
      assert.ok(result.includes("WHERE SALARIO >"));
      assert.ok(result.includes("SELECT AVG(SALARIO)"));
      qb.dropQuery();
    });
  });

  describe("Error Conditions", () => {
    test("SELECT sin FROM debe generar error", { only: false }, async () => {
      await assert.rejects(
        async () => {
          await qb.select("*").toString();
        },
        /No es posible usar 'SELECT', falta el comando 'from'/
      );
      qb.dropQuery();
    });

    test("WHERE sin SELECT debe generar error", { only: false }, async () => {
      await assert.rejects(
        async () => {
          await qb.where(qb.eq("ID", 1)).toString();
        },
        /falta un comando/
      );
      qb.dropQuery();
    });

    test("JOIN sin FROM debe generar error", { only: false }, async () => {
      await assert.rejects(
        async () => {
          await qb.innerJoin("TABLA").toString();
        },
        /falta un comando/
      );
      qb.dropQuery();
    });
  });

  describe("Data Modification Operations", () => {
    test("INSERT básico", { only: false }, async () => {
      const result = await qb
        .insertInto("CLIENTES", ["NOMBRE", "EMAIL"])
        .values(["Juan Pérez", "juan@email.com"])
        .toString();

      assert.ok(result.includes("INSERT INTO CLIENTES"));
      assert.ok(result.includes("(NOMBRE, EMAIL)"));
      assert.ok(result.includes("VALUES"));
      assert.ok(result.includes("'Juan Pérez'"));
      qb.dropQuery();
    });

    test("UPDATE básico", { only: false }, async () => {
      const result = await qb
        .update("PRODUCTOS", {
          PRECIO: 199.99,
          NOMBRE: "Producto Actualizado"
        })
        .where(qb.eq("ID", 1))
        .toString();

      assert.ok(result.includes("UPDATE PRODUCTOS"));
      assert.ok(result.includes("SET"));
      assert.ok(result.includes("PRECIO = 199.99"));
      assert.ok(result.includes("WHERE ID = 1"));
      qb.dropQuery();
    });

    test("DELETE básico", { only: false }, async () => {
      const result = await qb
        .delete("CLIENTES")
        .where(qb.eq("ACTIVO", 0))
        .toString();

      assert.ok(result.includes("DELETE FROM CLIENTES"));
      assert.ok(result.includes("WHERE ACTIVO = 0"));
      qb.dropQuery();
    });
  });

  describe("DDL Operations", () => {
    test("CREATE TABLE básico", { only: false }, async () => {
      const result = await qb
        .createTable("PRODUCTOS", {
          cols: [
            { name: "ID", type: "INT" },
            { name: "NOMBRE", type: "VARCHAR(100)" }
          ]
        })
        .toString();

      assert.ok(result.includes("CREATE TABLE PRODUCTOS"));
      assert.ok(result.includes("ID INT"));
      assert.ok(result.includes("NOMBRE VARCHAR(100)"));
      qb.dropQuery();
    });

    test("DROP TABLE", { only: false }, async () => {
      const result = await qb
        .dropTable("TEMPORAL")
        .toString();

      assert.ok(result.includes("DROP TABLE TEMPORAL"));
      qb.dropQuery();
    });

    test("CREATE DATABASE", { only: false }, async () => {
      const result = await qb
        .createDatabase("TESTDB")
        .toString();

      assert.ok(result.includes("CREATE DATABASE TESTDB"));
      qb.dropQuery();
    });
  });

  describe("Aggregate Functions", () => {
    test("funciones de agregación en SELECT", { only: false }, async () => {
      const result = await qb
        .select([
          qb.count("*"),
          qb.sum("PRECIO"),
          qb.avg("EDAD")
        ])
        .from("DATOS")
        .toString();

      assert.ok(result.includes("COUNT(*)"));
      assert.ok(result.includes("SUM(PRECIO)"));
      assert.ok(result.includes("AVG(EDAD)"));
      qb.dropQuery();
    });
  });

  describe("Complex Scenarios", () => {
    test("query compleja con múltiples JOINs", { only: false }, async () => {
      const result = await qb
        .select(["C.NOMBRE", "P.NOMBRE", "O.FECHA"])
        .from("CLIENTES", "C")
        .innerJoin("ORDENES", "O")
        .on(qb.eq("C.ID", "O.CLIENTE_ID"))
        .leftJoin("PRODUCTOS", "P")
        .on(qb.eq("P.ID", "O.PRODUCTO_ID"))
        .where(qb.gt("O.FECHA", "2024-01-01"))
        .toString();

      assert.ok(result.includes("INNER JOIN"));
      assert.ok(result.includes("LEFT OUTER JOIN"));
      assert.ok(result.includes("WHERE"));
      qb.dropQuery();
    });

    test("subconsulta en WHERE con EXISTS", { only: false }, async () => {
      const subquery = qb
        .select("1")
        .from("ORDENES")
        .where(qb.eq("CLIENTE_ID", "C.ID"));

      const result = await qb
        .select("*")
        .from("CLIENTES", "C")
        .where(qb.exists(subquery))
        .toString();

      assert.ok(result.includes("WHERE EXISTS"));
      assert.ok(result.includes("SELECT 1"));
      qb.dropQuery();
    });
  });

  describe("Performance and Edge Cases", () => {
    test("manejar QueryBuilder con estado vacío", { only: false }, async () => {
      // Un QB sin ningún comando debería manejar toString() correctamente
      await assert.rejects(
        async () => {
          await qb.toString();
        }
      );
    });

    test("dropQuery limpia el estado", { only: false }, async () => {
      // Configurar un query
      qb.select("*").from("TEST");
      
      // Verificar que hay contenido
      assert.ok(qb.language.q.length > 0);
      
      // Limpiar
      qb.dropQuery();
      
      // Verificar que está limpio
      assert.equal(qb.language.q.length, 0);
    });
  });
});
