# subselect

Para actualizar el valor de un campo con el resultado de una búsqueda en otra colección en MongoDB, puedes utilizar una combinación de operaciones de agregación y actualización. Aquí tienes un ejemplo en JavaScript:

Supongamos que tienes dos colecciones: students y grades. Quieres actualizar el campo averageGrade en la colección students con el valor del campo grade de la colección grades.

Primero, crea las colecciones students y grades con los siguientes documentos:

```js
db.students.insertMany([
   { "_id": 1, "student": "Skye", "averageGrade": null },
   { "_id": 2, "student": "Elizabeth", "averageGrade": null }
]);
db.grades.insertMany([
   { "studentId": 1, "grade": 85 },
   { "studentId": 2, "grade": 90 }
]);
```

Luego, utiliza una operación de agregación para realizar la búsqueda en la colección grades y actualizar la colección students:

```js
db.students.aggregate([
   {
      $lookup: {
         from: "grades",
         localField: "_id",
         foreignField: "studentId",
         as: "gradeInfo"
      }
   },
   {
      $unwind:{path: "$gradeInfo"}
   },
   {
      $set: {
         averageGrade: "$gradeInfo.grade"
      }
   },
   {
      $merge: {
         into: "students",
         whenMatched: "merge",
         whenNotMatched: "discard"
      }
   }
]);
```

En este ejemplo:

La operación '$lookup' realiza una búsqueda en la colección 'grades' y combina los documentos que coinciden con el campo '_id' de students y 'tudentId' de grades.
La operación '$unwind' descompone el array 'gradeInfo' para que cada documento tenga un solo objeto 'gradeInfo'.
La operación '$set' actualiza el campo 'averageGrade' con el valor del campo 'grade' de 'gradeInfo'.
La operación '$merge' actualiza los documentos en la colección 'students' con los nuevos valores de 'averageGrade'.
Este proceso actualizará el campo 'averageGrade' en la colección 'students' con los valores correspondientes de la colección 'grades'.

```sql
UPDATE DISCOS_COMPACTOS
SET ID_DISQUERA =
( SELECT ID_DISQUERA
FROM DISQUERAS_CD
WHERE NOMBRE_DISCOGRAFICA = 'DRG Records' )
WHERE ID_DISCO_COMPACTO = 116;
```

```js
db.DISCOS_COMPACTOS.updateOne(
  { ID_DISCO_COMPACTO: 116 },
  [
    {
      $set: {
        ID_DISQUERA: {
          $let: {
            vars: {
              disquera: {
                $arrayElemAt: [
                  {
                    $lookup: {
                      from: "DISQUERAS_CD",
                      pipeline: [
                        {
                          $match: { NOMBRE_DISCOGRAFICA: "DRG Records" }  // Filtro para obtener la disquera correcta
                        },
                        {
                          $project: { ID_DISQUERA: 1 }  // Proyectar solo el campo necesario
                        }
                      ],
                      as: "disquera_info"
                    }
                  },
                  0 // Asegura que se accede al primer (y único) elemento del array
                ]
              }
            },
            in: "$$disquera.ID_DISQUERA"  // Extrae el campo ID_DISQUERA del resultado de $lookup
          }
        }
      }
    }
  ]
);
```

```json
{
  "update":"DISCOS_COMPACTOS",
  "updates":[
    {
      "q":{
        "ID_DISCO_COMPACTO":{"$eq":116}
        },
      "u":[
        {
          "$set":{ "ID_DISQUERA": {
            "$let":{
              "vars":{
                "result":
                {"$arrayElemAt":[
                  {"$lookup":{"from":"DISQUERAS_CD","pipeline":[{"$match":{"NOMBRE_DISCOGRAFICA":{"$eq":"DRG Records"}}},{"$project":{"_id":0,"ID_DISQUERA":1}}],"as":"result"}},0]}},"in":"$$result.ID_DISQUERA"}}}}]}]}

```

```js
{
aggregate: "DISCOS_COMPACTOS",
pipeline:[
  {
    $lookup:{
      from:"DISQUERAS_CD",
      pipeline:[
        { $match:{"NOMBRE_DISCOGRAFICA":{$eq:"DRG Records"}}},
        {$project:{"_id":0,"ID_DISQUERA":1}}
        ],
        as:"result"
        }
  },
  {
    $project:{"_id":0,"ID_DISQUERA":1}
  }
]
}
```
