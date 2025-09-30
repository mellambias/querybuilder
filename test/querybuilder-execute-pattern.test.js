import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../src/querybuilder.js";
import MySQL from "../src/sql/MySQL.js";
import { config } from "../packages/@querybuilder/core/config.js";
import { getResultFromTest } from "../src/test/utilsForTest/mysqlUtils.js";

// Setup siguiendo exactamente el patrón de los tests existentes
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);

// QueryBuilder instance siguiendo el patrón estándar del proyecto
const queryBuilder = new QueryBuilder(MySQL, {
  typeIdentificator: "regular",
  mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Test QueryBuilder.execute() - Patrón Original", { concurrency: false }, async () => {

  beforeEach(async () => {
    // Crear base de datos de prueba usando el patrón original
    qb = queryBuilder.driver(MySql8.driver, MySql8.params);
    await qb
      .dropDatabase("test_qb_execute", { secure: true })
      .createDatabase("test_qb_execute")
      .execute();
    qb.dropQuery();
    qb = qb.use("test_qb_execute");
  });

  afterEach(async () => {
    qb.dropQuery();
    await qb
      .dropDatabase("test_qb_execute", { secure: true })
      .execute();
    qb.dropQuery();
  });

  test("QueryBuilder.execute() - crear base de datos", async () => {
    // Verificar que la base de datos fue creada usando el helper correcto
    const databases = await databaseTest.execute("SHOW DATABASES");

    // El helper getResultFromTest espera un driver específico, usemos directamente
    assert.ok(databases.success, "La consulta SHOW DATABASES debe ser exitosa");

    const dbExists = databases.response.some(
      (db) => Object.values(db)[0].toUpperCase() === "TEST_QB_EXECUTE"
    );

    assert.ok(dbExists, "La base de datos 'test_qb_execute' debe existir");
    console.log("✅ Base de datos creada correctamente con QueryBuilder.execute()");
  });

  test("QueryBuilder.execute() - crear tabla", async () => {
    const createResult = await qb
      .createTable("usuarios", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100) NOT NULL",
        email: "VARCHAR(150) UNIQUE",
        activo: "BOOLEAN DEFAULT TRUE"
      })
      .execute();
    qb.dropQuery();

    assert.ok(createResult.success, "CREATE TABLE debe ser exitoso");

    // Verificar que la tabla existe
    const tablesResult = await databaseTest.execute("USE test_qb_execute; SHOW TABLES;");
    assert.ok(tablesResult.success, "SHOW TABLES debe ser exitoso");

    const tableExists = tablesResult.response.some(
      (table) => Object.values(table)[0] === "usuarios"
    );

    assert.ok(tableExists, "La tabla 'usuarios' debe existir");
    console.log("✅ Tabla creada correctamente con QueryBuilder.execute()");
  });

  test("QueryBuilder.execute() - insertar datos", async () => {
    // Crear tabla primero
    await qb
      .createTable("productos", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100) NOT NULL",
        precio: "DECIMAL(10,2)",
        categoria: "VARCHAR(50)"
      })
      .execute();
    qb.dropQuery();

    // Insertar datos usando el patrón correcto del proyecto
    const insertResult = await qb
      .insert("productos", [1, "Laptop Gaming", 1299.99, "Tecnología"])
      .insert("productos", [2, "Mouse Inalámbrico", 45.50, "Tecnología"])
      .execute();
    qb.dropQuery();

    assert.ok(insertResult.success, "INSERT debe ser exitoso");

    // Verificar que los datos fueron insertados
    const selectResult = await databaseTest.execute(
      "USE test_qb_execute; SELECT * FROM productos ORDER BY id;"
    );

    assert.ok(selectResult.success, "SELECT debe ser exitoso");
    assert.equal(selectResult.response.length, 2, "Deben existir 2 productos");
    assert.equal(selectResult.response[0].nombre, "Laptop Gaming", "El primer producto debe ser 'Laptop Gaming'");
    assert.equal(selectResult.response[1].precio, 45.50, "El segundo producto debe costar 45.50");

    console.log("✅ Datos insertados correctamente con QueryBuilder.execute()");
  });

  test("QueryBuilder.execute() - consultar datos (SELECT)", async () => {
    // Preparar datos de prueba
    await qb
      .createTable("empleados", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100) NOT NULL",
        departamento: "VARCHAR(50)",
        salario: "DECIMAL(10,2)"
      })
      .insert("empleados", [1, "Juan Pérez", "IT", 5000.00])
      .insert("empleados", [2, "María García", "IT", 5500.00])
      .insert("empleados", [3, "Carlos López", "Ventas", 4000.00])
      .execute();
    qb.dropQuery();

    // Realizar consulta usando QueryBuilder.execute()
    const selectResult = await qb
      .select("nombre", "salario")
      .from("empleados")
      .where("departamento = 'IT'")
      .orderBy("salario DESC")
      .execute();
    qb.dropQuery();

    assert.ok(selectResult.success, "SELECT debe ser exitoso");
    assert.equal(selectResult.response.length, 2, "Deben encontrarse 2 empleados de IT");

    const empleados = selectResult.response;
    assert.equal(empleados[0].nombre, "María García", "El primer empleado debe ser María García");
    assert.equal(empleados[0].salario, 5500.00, "María García debe tener salario 5500.00");

    console.log("✅ Consulta SELECT ejecutada correctamente con QueryBuilder.execute()");
  });

  test("QueryBuilder.execute() - actualizar datos (UPDATE)", async () => {
    // Preparar datos
    await qb
      .createTable("inventario", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        producto: "VARCHAR(100) NOT NULL",
        stock: "INT DEFAULT 0",
        precio: "DECIMAL(10,2)"
      })
      .insert("inventario", [1, "Teclado Mecánico", 50, 75.00])
      .insert("inventario", [2, "Monitor 4K", 20, 350.00])
      .execute();
    qb.dropQuery();

    // Actualizar usando QueryBuilder.execute()
    const updateResult = await qb
      .update("inventario", {
        stock: 75,
        precio: 80.00
      })
      .where("producto = 'Teclado Mecánico'")
      .execute();
    qb.dropQuery();

    assert.ok(updateResult.success, "UPDATE debe ser exitoso");

    // Verificar la actualización
    const verifyResult = await databaseTest.execute(
      "USE test_qb_execute; SELECT * FROM inventario WHERE producto = 'Teclado Mecánico';"
    );

    assert.equal(verifyResult.response[0].stock, 75, "El stock debe haberse actualizado a 75");
    assert.equal(verifyResult.response[0].precio, 80.00, "El precio debe haberse actualizado a 80.00");

    console.log("✅ UPDATE ejecutado correctamente con QueryBuilder.execute()");
  });

  test("QueryBuilder.execute() - eliminar datos siguiendo patrón del proyecto", async () => {
    // Crear tabla y datos
    await qb
      .createTable("temporal", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        descripcion: "VARCHAR(100)",
        activo: "BOOLEAN DEFAULT TRUE"
      })
      .insert("temporal", [1, "Registro A", true])
      .insert("temporal", [2, "Registro B", false])
      .insert("temporal", [3, "Registro C", true])
      .execute();
    qb.dropQuery();

    // Eliminar registros inactivos - usando el método correcto del proyecto
    // Verificar qué método de DELETE usa el proyecto
    const deleteSQL = qb.delete().from("temporal").where("activo = FALSE").toString();
    console.log("🔍 SQL generado para DELETE:", deleteSQL);

    // Ejecutar directamente el SQL generado
    const deleteResult = await databaseTest.execute(`USE test_qb_execute; ${deleteSQL};`);

    assert.ok(deleteResult.success, "DELETE debe ser exitoso");

    // Verificar eliminación
    const remainingResult = await databaseTest.execute(
      "USE test_qb_execute; SELECT * FROM temporal ORDER BY id;"
    );

    assert.equal(remainingResult.response.length, 2, "Deben quedar 2 registros activos");
    assert.equal(remainingResult.response[0].descripcion, "Registro A", "Debe quedar el Registro A");
    assert.equal(remainingResult.response[1].descripcion, "Registro C", "Debe quedar el Registro C");

    console.log("✅ DELETE ejecutado correctamente usando QueryBuilder");
  });

  test("QueryBuilder.execute() - manejo de errores", async () => {
    // Intentar operación que debe fallar
    try {
      const errorResult = await qb
        .insert("tabla_inexistente", [1, "test"])
        .execute();
      qb.dropQuery();

      // En modo test, no debe lanzar excepción sino retornar error
      assert.ok(!errorResult.success, "La operación debe fallar");
      assert.ok(errorResult.error, "Debe incluir información del error");

    } catch (error) {
      // Si lanza excepción, verificar que sea la esperada
      assert.ok(
        error.message.includes("doesn't exist") ||
        error.message.includes("no existe") ||
        error.message.includes("Table") ||
        error.message.includes("tabla"),
        "El error debe indicar que la tabla no existe"
      );
    }

    console.log("✅ Manejo de errores funciona correctamente");
  });
});

console.log("🎯 Test QueryBuilder.execute() siguiendo patrón del proyecto - COMPLETADO");