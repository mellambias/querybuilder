import { test, after, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { Types } from "../utils/utils.js";

test("String a comnado mysql", () => {
	assert.equal("TINYINT".toDataType("mysql"), "TINYINT");
});
test("String a comando postgres", () => {
	assert.equal("INT".toDataType("postgres"), "integer");
});
test("valida si un String es un identificador 'regular' de SQL valido", () => {
	Types.identificador.set("regular");
	assert.equal("coleccion_id".validSqlId(), "coleccion_id");
});
test("valida si un String es un identificador 'delimitado' de SQL valido", () => {
	Types.identificador.set("delimitado");
	assert.equal('"coleccion_id"'.validSqlId(), '"coleccion_id"');
});
test("Una palabra corresponde a un comando SQL reservado", () => {
	assert.equal("DAY".isReserved(), true);
	assert.equal("coleccion.name".isReserved(), false);
});
