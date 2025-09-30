import { test, suite, afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import QueryBuilder from "../src/querybuilder.js";
import MySQL from "../src/sql/MySQL.js";
import { config } from "../packages/@querybuilder/core/config.js";
import { getResultFromTest } from "../src/test/utilsForTest/mysqlUtils.js";

// Setup usando el mismo patrón que los tests existentes
const MySql8 = config.databases.MySql8;
const Driver = MySql8.driver;
const databaseTest = new Driver(MySql8.params);

// QueryBuilder instance siguiendo el patrón estándar del proyecto
const queryBuilder = new QueryBuilder(MySQL, {
  typeIdentificator: "regular",
  mode: "test",
});
let qb = queryBuilder.driver(MySql8.driver, MySql8.params);

suite("Pruebas de integración QueryBuilder.execute()", { concurrency: false }, async () => {

  beforeEach(async () => {
    // Asegurar que tenemos una base de datos limpia para cada test
    await qb
      .dropDatabase("qb_integration_test", { secure: true })
      .createDatabase("qb_integration_test")
      .execute();
    qb.dropQuery();
    qb = qb.use("qb_integration_test");
  });

  afterEach(async () => {
    qb.dropQuery();
    // Limpiar después de cada test
    await qb
      .dropDatabase("qb_integration_test", { secure: true })
      .execute();
    qb.dropQuery();
  });

  test("Crear base de datos usando QueryBuilder.execute()", async () => {
    // Verificar que la base de datos fue creada
    const databases = await getResultFromTest(databaseTest, "SHOW DATABASES");
    const dbExists = databases.some(
      (db) => Object.values(db)[0].toUpperCase() === "QB_INTEGRATION_TEST"
    );

    assert.ok(dbExists, "La base de datos 'qb_integration_test' debería existir");
  });

  test("Crear tabla usando QueryBuilder.execute()", async () => {
    const result = await qb
      .createTable("usuarios", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100) NOT NULL",
        email: "VARCHAR(150) UNIQUE",
        edad: "INT DEFAULT 0",
        fecha_creacion: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
      })
      .execute();
    qb.dropQuery();

    // Verificar que la tabla fue creada
    const tables = await getResultFromTest(
      databaseTest,
      "USE qb_integration_test",
      "SHOW TABLES"
    );

    const tableExists = tables.some(
      (table) => Object.values(table)[0] === "usuarios"
    );

    assert.ok(tableExists, "La tabla 'usuarios' debería existir");
    assert.ok(result.success, "La operación debería ser exitosa");
  });

  test("Insertar datos usando QueryBuilder.execute()", async () => {
    // Primero crear la tabla
    await qb
      .createTable("productos", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(100) NOT NULL",
        precio: "DECIMAL(10,2)",
        categoria: "VARCHAR(50)"
      })
      .execute();
    qb.dropQuery();

    // Insertar datos usando QueryBuilder
    const insertResult = await qb
      .insert("productos", [1, "Laptop", 999.99, "Electrónicos"])
      .insert("productos", [2, "Mouse", 25.50, "Electrónicos"])
      .insert("productos", [3, "Escritorio", 199.00, "Muebles"])
      .execute();
    qb.dropQuery();

    // Verificar que los datos fueron insertados
    const data = await getResultFromTest(
      databaseTest,
      "USE qb_integration_test",
      "SELECT * FROM productos ORDER BY id"
    );

    assert.ok(insertResult.success, "La inserción debería ser exitosa");
    assert.equal(data.length, 3, "Deberían existir 3 productos");
    assert.equal(data[0].nombre, "Laptop", "El primer producto debería ser 'Laptop'");
    assert.equal(data[1].precio, 25.50, "El segundo producto debería costar 25.50");
    assert.equal(data[2].categoria, "Muebles", "El tercer producto debería ser de categoría 'Muebles'");
  });

  test("Consultar datos usando QueryBuilder.execute()", async () => {
    // Crear tabla e insertar datos de prueba
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
      .insert("empleados", [4, "Ana Martín", "IT", 4800.00])
      .execute();
    qb.dropQuery();

    // Consultar usando QueryBuilder
    const selectResult = await qb
      .select("nombre", "salario")
      .from("empleados")
      .where("departamento = 'IT'")
      .orderBy("salario DESC")
      .execute();
    qb.dropQuery();

    assert.ok(selectResult.success, "La consulta debería ser exitosa");
    assert.equal(selectResult.response.length, 3, "Deberían encontrarse 3 empleados de IT");

    const empleados = selectResult.response;
    assert.equal(empleados[0].nombre, "María García", "El primer empleado debería ser María García (mayor salario)");
    assert.equal(empleados[0].salario, 5500.00, "María García debería tener el salario más alto");
    assert.equal(empleados[2].salario, 4800.00, "Ana Martín debería tener el salario más bajo del grupo");
  });

  test("Actualizar datos usando QueryBuilder.execute()", async () => {
    // Crear tabla e insertar datos
    await qb
      .createTable("inventario", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        producto: "VARCHAR(100) NOT NULL",
        stock: "INT DEFAULT 0",
        precio: "DECIMAL(10,2)"
      })
      .insert("inventario", [1, "Teclado", 50, 75.00])
      .insert("inventario", [2, "Monitor", 20, 250.00])
      .insert("inventario", [3, "Mouse", 100, 30.00])
      .execute();
    qb.dropQuery();

    // Actualizar usando QueryBuilder
    const updateResult = await qb
      .update("inventario", {
        stock: 75,
        precio: 80.00
      })
      .where("producto = 'Teclado'")
      .execute();
    qb.dropQuery();

    // Verificar la actualización
    const updatedData = await getResultFromTest(
      databaseTest,
      "USE qb_integration_test",
      "SELECT * FROM inventario WHERE producto = 'Teclado'"
    );

    assert.ok(updateResult.success, "La actualización debería ser exitosa");
    assert.equal(updatedData[0].stock, 75, "El stock debería haberse actualizado a 75");
    assert.equal(updatedData[0].precio, 80.00, "El precio debería haberse actualizado a 80.00");
  });

  test("Eliminar datos usando QueryBuilder.execute()", async () => {
    // Crear tabla e insertar datos
    await qb
      .createTable("temp_data", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        descripcion: "VARCHAR(100)",
        activo: "BOOLEAN DEFAULT TRUE"
      })
      .insert("temp_data", [1, "Registro A", true])
      .insert("temp_data", [2, "Registro B", false])
      .insert("temp_data", [3, "Registro C", true])
      .insert("temp_data", [4, "Registro D", false])
      .execute();
    qb.dropQuery();

    // Eliminar usando QueryBuilder
    const deleteResult = await qb
      .deleteFrom("temp_data")
      .where("activo = FALSE")
      .execute();
    qb.dropQuery();

    // Verificar la eliminación
    const remainingData = await getResultFromTest(
      databaseTest,
      "USE qb_integration_test",
      "SELECT * FROM temp_data ORDER BY id"
    );

    assert.ok(deleteResult.success, "La eliminación debería ser exitosa");
    assert.equal(remainingData.length, 2, "Deberían quedar solo 2 registros activos");
    assert.equal(remainingData[0].descripcion, "Registro A", "Debería quedar el Registro A");
    assert.equal(remainingData[1].descripcion, "Registro C", "Debería quedar el Registro C");
  });

  test("Operaciones complejas con subconsultas usando QueryBuilder.execute()", async () => {
    // Crear tablas relacionadas
    await qb
      .createTable("categorias", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        nombre: "VARCHAR(50) NOT NULL"
      })
      .createTable("articulos", {
        id: "INT AUTO_INCREMENT PRIMARY KEY",
        titulo: "VARCHAR(100) NOT NULL",
        categoria_id: "INT",
        precio: "DECIMAL(10,2)",
        "FOREIGN KEY (categoria_id)": "REFERENCES categorias(id)"
      })
      .execute();
    qb.dropQuery();

    // Insertar datos
    await qb
      .insert("categorias", [1, "Tecnología"])
      .insert("categorias", [2, "Hogar"])
      .insert("articulos", [1, "Smartphone", 1, 699.99])
      .insert("articulos", [2, "Tablet", 1, 399.99])
      .insert("articulos", [3, "Lámpara", 2, 89.99])
      .insert("articulos", [4, "Sofá", 2, 1299.99])
      .execute();
    qb.dropQuery();

    // Consulta compleja con subconsulta usando QueryBuilder
    const complexResult = await qb
      .select("a.titulo", "a.precio", "c.nombre AS categoria")
      .from("articulos a")
      .join("categorias c", "a.categoria_id = c.id")
      .where(qb.raw("a.precio > (SELECT AVG(precio) FROM articulos)"))
      .orderBy("a.precio DESC")
      .execute();
    qb.dropQuery();

    assert.ok(complexResult.success, "La consulta compleja debería ser exitosa");
    assert.equal(complexResult.response.length, 2, "Deberían encontrarse 2 artículos con precio superior al promedio");

    const articulos = complexResult.response;
    assert.equal(articulos[0].titulo, "Sofá", "El primer artículo debería ser el Sofá (más caro)");
    assert.equal(articulos[1].titulo, "Smartphone", "El segundo artículo debería ser el Smartphone");
  });

  test("Verificar manejo de errores con QueryBuilder.execute()", async () => {
    // Intentar insertar en una tabla que no existe
    try {
      const errorResult = await qb
        .insert("tabla_inexistente", [1, "test"])
        .execute();
      qb.dropQuery();

      // En modo test, no debería lanzar excepción sino retornar error en la respuesta
      assert.ok(!errorResult.success, "La operación debería fallar");
      assert.ok(errorResult.error, "Debería incluir información del error");
    } catch (error) {
      // Si se lanza excepción, verificar que sea la esperada
      assert.ok(error.message.includes("doesn't exist") || error.message.includes("no existe"),
        "El error debería indicar que la tabla no existe");
    }
  });
});

console.log("✅ Test de integración QueryBuilder.execute() completado");