import QueryBuilder from "./packages/@querybuilder/core/querybuilder.js";
import Core from "./packages/@querybuilder/core/core.js";

const qb = new QueryBuilder(Core);

console.log("=== Simple SELECT test ===");
const simpleQuery = await qb
  .select("TITLE") 
  .from("INVENTARIO_TITULOS")
  .where(qb.eq("TITLE_ID", 108))
  .toString();

console.log("Simple query:", simpleQuery);

console.log("\n=== IN with subconsulta test ===");
const inQuery = await qb
  .in(
    "TITULO_CD",
    qb
      .select("TITLE")
      .from("INVENTARIO_TITULOS") 
      .where(qb.eq("TITLE_ID", 108))
  )
  .toString();

console.log("IN query:", inQuery);

console.log("\n=== DELETE step by step ===");
const deleteStep1 = qb.delete("TIPOS_TITULO");
console.log("After delete:", await deleteStep1.toString());

const whereCondition = qb.in(
  "TITULO_CD", 
  qb
    .select("TITLE")
    .from("INVENTARIO_TITULOS")
    .where(qb.eq("TITLE_ID", 108))
);
console.log("Where condition:", await whereCondition.toString());

const deleteStep2 = deleteStep1.where(whereCondition);
console.log("After adding where:", await deleteStep2.toString());

