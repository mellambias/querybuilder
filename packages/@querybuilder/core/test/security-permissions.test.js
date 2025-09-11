import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import QueryBuilder from "../querybuilder.js";
import Core from "../core.js";

describe("Security and Permissions", async () => {
  let qb;
  beforeEach(async () => {
    qb = new QueryBuilder(Core, {
      typeIdentificator: "regular",
    });
  });

  test("crear un ROL de usuario", { only: false }, async () => {
    const result = await qb
      .createRoles("CLIENTES", { admin: "CURRENT_USER" })
      .toString();
    assert.equal(result, "CREATE ROLE CLIENTES WITH ADMIN CURRENT_USER;");
  });

  test("elimina un ROL de usuario", { only: false }, async () => {
    const result = await qb.dropRoles(["CLIENTES", "ADMIN"]).toString();
    assert.equal(result, "DROP ROLE CLIENTES;\nDROP ROLE ADMIN;");
  });

  test("autorizar privilegios", { only: false }, async () => {
    const result = await qb
      .grant(
        ["SELECT", "UPDATE(TITULO_CD)", "INSERT"],
        "INVENTARIO_CD",
        ["VENTAS", "CONTABILIDAD"],
        {
          withGrant: true,
          grantBy: "current_user",
        },
      )
      .toString();
    assert.equal(
      result,
      `GRANT SELECT, UPDATE(TITULO_CD), INSERT
ON TABLE INVENTARIO_CD
TO VENTAS, CONTABILIDAD
WITH GRANT OPTION
GRANTED BY CURRENT_USER;`,
    );
  });

  test("revocar privilegios", { only: false }, async () => {
    const result = await qb
      .revoke(
        ["SELECT", "UPDATE", "INSERT"],
        "INVENTARIO_CD",
        ["VENTAS", "CONTABILIDAD"],
        { cascade: true },
      )
      .toString();
    assert.equal(
      result,
      `REVOKE SELECT, UPDATE, INSERT
ON TABLE INVENTARIO_CD
FROM VENTAS, CONTABILIDAD
CASCADE;`,
    );
  });

  test(
    "asignar rol a un identificador de usuario",
    { only: false },
    async () => {
      const result = await qb
        .grantRoles("ADMINISTRADORES", "LindaN")
        .toString();
      assert.equal(result, "GRANT ADMINISTRADORES TO LindaN;");
    },
  );

  test(
    "conceder múltiples roles a múltiples identificadores de usuario",
    { only: false },
    async () => {
      const result = await qb
        .grantRoles(
          ["ADMINISTRADORES", "CONTABILIDAD"],
          ["LindaN", "MARKETING"],
          { admin: true },
        )
        .toString();
      assert.equal(
        result,
        "GRANT ADMINISTRADORES, CONTABILIDAD TO LindaN, MARKETING WITH ADMIN OPTION;",
      );
    },
  );

  test("revocar un rol", { only: false }, async () => {
    const result = await qb
      .revokeRoles("ADMINISTRADORES", "LindaN", {})
      .toString();
    assert.equal(result, "REVOKE ADMINISTRADORES FROM LindaN CASCADE;");
  });

  test(
    "revocar varios roles a varios identificadores",
    { only: false },
    async () => {
      const result = await qb
        .revokeRoles(
          ["ADMINISTRADORES", "CONTABILIDAD"],
          ["LindaN", "MARKETING"],
          { adminOption: true, grantBy: "current_user" },
        )
        .toString();
      assert.equal(
        result,
        `REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM LindaN GRANTED BY CURRENT_USER CASCADE;
REVOKE ADMIN OPTION FOR ADMINISTRADORES, CONTABILIDAD FROM MARKETING GRANTED BY CURRENT_USER CASCADE;`,
      );
    },
  );
});
