# Transactions - Gestión de Transacciones

Las transacciones garantizan que un conjunto de operaciones de base de datos se ejecuten como una unidad atómica, manteniendo la consistencia e integridad de los datos.

## Conceptos Básicos

Una transacción es un grupo de operaciones SQL que se ejecutan como una unidad. Todas las operaciones deben completarse exitosamente, o ninguna de ellas se aplicará (principio ACID).

### Propiedades ACID

- **Atomicidad**: Todas las operaciones se completan o ninguna
- **Consistencia**: Los datos mantienen su integridad
- **Aislamiento**: Las transacciones no interfieren entre sí
- **Durabilidad**: Los cambios confirmados son permanentes

## startTransaction()

Inicia una nueva transacción.

### Sintaxis

```javascript
await queryBuilder.startTransaction(options)
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `options` | `Object` | Opciones de la transacción |

### Ejemplos

```javascript
// Transacción básica
await qb.startTransaction();

// Con nivel de aislamiento específico
await qb.startTransaction({
  isolationLevel: 'READ COMMITTED'
});

// Con timeout
await qb.startTransaction({
  timeout: 30000 // 30 segundos
});
```

## commit()

Confirma y aplica todos los cambios de la transacción.

### Sintaxis

```javascript
await queryBuilder.commit()
```

### Ejemplo

```javascript
try {
  await qb.startTransaction();
  
  await qb.insert('usuarios', {
    nombre: 'Juan Pérez',
    email: 'juan@example.com'
  }).execute();
  
  await qb.insert('perfiles', {
    usuario_id: qb.lastInsertId(),
    biografia: 'Desarrollador Full Stack'
  }).execute();
  
  await qb.commit(); // Confirmar cambios
  
} catch (error) {
  await qb.rollback();
  throw error;
}
```

## rollback()

Deshace todos los cambios realizados en la transacción.

### Sintaxis

```javascript
await queryBuilder.rollback()
```

### Ejemplo

```javascript
try {
  await qb.startTransaction();
  
  // Operaciones que pueden fallar
  await qb.update('productos', { stock: qb.raw('stock - ?', [cantidad]) })
    .where('id = ?', [productoId])
    .execute();
  
  if (stockResultante < 0) {
    throw new Error('Stock insuficiente');
  }
  
  await qb.commit();
  
} catch (error) {
  await qb.rollback(); // Deshacer cambios
  throw error;
}
```

## savepoint()

Crea un punto de guardado dentro de una transacción.

### Sintaxis

```javascript
await queryBuilder.savepoint(name)
```

### Ejemplo

```javascript
await qb.startTransaction();

try {
  // Primera operación
  await qb.insert('pedidos', pedidoData).execute();
  
  // Crear savepoint
  await qb.savepoint('despues_pedido');
  
  // Operación que puede fallar
  await qb.update('inventario', { cantidad: qb.raw('cantidad - ?', [cantidad]) })
    .where('producto_id = ?', [productoId])
    .execute();
  
  await qb.commit();
  
} catch (error) {
  // Volver al savepoint en lugar de rollback completo
  await qb.rollbackTo('despues_pedido');
  
  // Manejar el error o continuar con operaciones alternativas
  await qb.commit();
}
```

## rollbackTo()

Deshace cambios hasta un savepoint específico.

### Sintaxis

```javascript
await queryBuilder.rollbackTo(savepointName)
```

## Niveles de Aislamiento

### setIsolationLevel()

Establece el nivel de aislamiento para la transacción.

```javascript
// Niveles disponibles
const niveles = [
  'READ UNCOMMITTED',  // Permite lecturas sucias
  'READ COMMITTED',    // Evita lecturas sucias
  'REPEATABLE READ',   // Evita lecturas no repetibles
  'SERIALIZABLE'       // Máximo aislamiento
];

// Establecer nivel
await qb.setIsolationLevel('REPEATABLE READ');
await qb.startTransaction();
```

### Ejemplo con Diferentes Niveles

```javascript
// Para operaciones críticas de inventario
async function procesarPedidoCritico(pedido) {
  await qb.setIsolationLevel('SERIALIZABLE');
  await qb.startTransaction();
  
  try {
    // Verificar stock con bloqueo
    const producto = await qb
      .select(['stock'])
      .from('productos')
      .where('id = ?', [pedido.producto_id])
      .forUpdate() // SELECT ... FOR UPDATE
      .execute();
    
    if (producto[0].stock < pedido.cantidad) {
      throw new Error('Stock insuficiente');
    }
    
    // Actualizar stock
    await qb
      .update('productos', { 
        stock: qb.raw('stock - ?', [pedido.cantidad]) 
      })
      .where('id = ?', [pedido.producto_id])
      .execute();
    
    // Crear pedido
    await qb
      .insert('pedidos', pedido)
      .execute();
    
    await qb.commit();
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}
```

## Transacciones Anidadas

QueryBuilder soporta transacciones anidadas usando savepoints automáticamente.

```javascript
async function operacionCompleja() {
  await qb.startTransaction(); // Transacción principal
  
  try {
    await operacionA();
    await operacionB(); // Puede tener su propia "transacción"
    await operacionC();
    
    await qb.commit();
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}

async function operacionB() {
  const savepoint = await qb.savepoint('operacion_b');
  
  try {
    await qb.insert('tabla_b', datos).execute();
    await qb.update('tabla_relacionada', cambios).execute();
    
  } catch (error) {
    await qb.rollbackTo('operacion_b');
    // Manejar error específico de operacionB
    throw error;
  }
}
```

## Bloqueos (Locks)

### forUpdate()

Aplica un bloqueo exclusivo para actualización.

```javascript
// Bloquear registros para actualización
const usuario = await qb
  .select(['saldo'])
  .from('usuarios')
  .where('id = ?', [userId])
  .forUpdate()
  .execute();

// Ahora podemos actualizar de forma segura
await qb
  .update('usuarios', { 
    saldo: qb.raw('saldo - ?', [monto]) 
  })
  .where('id = ?', [userId])
  .execute();
```

### forShare()

Aplica un bloqueo compartido para lectura.

```javascript
// Bloqueo compartido - permite otras lecturas pero no escrituras
const productos = await qb
  .select(['nombre', 'precio', 'stock'])
  .from('productos')
  .where('categoria_id = ?', [categoriaId])
  .forShare()
  .execute();
```

### lockInShareMode()

Alternativa para bloqueo compartido (MySQL).

```javascript
const datos = await qb
  .select(['*'])
  .from('configuracion')
  .where('activo = ?', [1])
  .lockInShareMode()
  .execute();
```

## Patrones de Transacciones Comunes

### Transferencia Bancaria

```javascript
async function transferirDinero(fromAccountId, toAccountId, monto) {
  await qb.startTransaction();
  
  try {
    // Verificar saldo con bloqueo
    const fromAccount = await qb
      .select(['saldo'])
      .from('cuentas')
      .where('id = ?', [fromAccountId])
      .forUpdate()
      .execute();
    
    if (fromAccount[0].saldo < monto) {
      throw new Error('Saldo insuficiente');
    }
    
    // Debitar cuenta origen
    await qb
      .update('cuentas', { 
        saldo: qb.raw('saldo - ?', [monto]) 
      })
      .where('id = ?', [fromAccountId])
      .execute();
    
    // Acreditar cuenta destino
    await qb
      .update('cuentas', { 
        saldo: qb.raw('saldo + ?', [monto]) 
      })
      .where('id = ?', [toAccountId])
      .execute();
    
    // Registrar transacción
    await qb
      .insert('transacciones', {
        cuenta_origen: fromAccountId,
        cuenta_destino: toAccountId,
        monto: monto,
        tipo: 'transferencia',
        fecha: new Date()
      })
      .execute();
    
    await qb.commit();
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}
```

### Proceso de Pedido Completo

```javascript
async function procesarPedidoCompleto(pedidoData, items) {
  await qb.startTransaction();
  
  try {
    // 1. Crear pedido
    const pedidoId = await qb
      .insert('pedidos', {
        usuario_id: pedidoData.usuario_id,
        fecha: new Date(),
        estado: 'procesando',
        total: 0
      })
      .execute();
    
    let totalPedido = 0;
    
    // 2. Procesar cada item
    for (const item of items) {
      const savepoint = await qb.savepoint(`item_${item.producto_id}`);
      
      try {
        // Verificar stock
        const producto = await qb
          .select(['stock', 'precio'])
          .from('productos')
          .where('id = ?', [item.producto_id])
          .forUpdate()
          .execute();
        
        if (producto[0].stock < item.cantidad) {
          throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
        }
        
        // Actualizar stock
        await qb
          .update('productos', { 
            stock: qb.raw('stock - ?', [item.cantidad]) 
          })
          .where('id = ?', [item.producto_id])
          .execute();
        
        // Agregar item al pedido
        const subtotal = producto[0].precio * item.cantidad;
        await qb
          .insert('pedido_items', {
            pedido_id: pedidoId,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: producto[0].precio,
            subtotal: subtotal
          })
          .execute();
        
        totalPedido += subtotal;
        
      } catch (error) {
        await qb.rollbackTo(`item_${item.producto_id}`);
        throw error;
      }
    }
    
    // 3. Actualizar total del pedido
    await qb
      .update('pedidos', { 
        total: totalPedido,
        estado: 'confirmado' 
      })
      .where('id = ?', [pedidoId])
      .execute();
    
    // 4. Crear factura
    await qb
      .insert('facturas', {
        pedido_id: pedidoId,
        numero_factura: await generarNumeroFactura(),
        total: totalPedido,
        fecha_emision: new Date()
      })
      .execute();
    
    await qb.commit();
    return pedidoId;
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}
```

### Batch Processing con Savepoints

```javascript
async function procesarLoteMasivo(registros, tamañoLote = 100) {
  await qb.startTransaction();
  
  try {
    let procesados = 0;
    
    for (let i = 0; i < registros.length; i += tamañoLote) {
      const lote = registros.slice(i, i + tamañoLote);
      const savepointName = `lote_${Math.floor(i / tamañoLote)}`;
      
      await qb.savepoint(savepointName);
      
      try {
        // Procesar lote
        for (const registro of lote) {
          await procesarRegistroIndividual(registro);
          procesados++;
        }
        
        // Log de progreso
        console.log(`Procesados ${procesados} de ${registros.length} registros`);
        
      } catch (error) {
        console.error(`Error en lote ${savepointName}:`, error);
        await qb.rollbackTo(savepointName);
        
        // Procesar registros del lote individualmente
        for (const registro of lote) {
          try {
            await procesarRegistroIndividual(registro);
            procesados++;
          } catch (registroError) {
            console.error(`Error en registro ${registro.id}:`, registroError);
          }
        }
      }
    }
    
    await qb.commit();
    return procesados;
    
  } catch (error) {
    await qb.rollback();
    throw error;
  }
}
```

## Manejo de Deadlocks

```javascript
async function operacionConReintento(operacion, maxReintentos = 3) {
  let intentos = 0;
  
  while (intentos < maxReintentos) {
    try {
      await qb.startTransaction();
      await operacion();
      await qb.commit();
      return; // Éxito
      
    } catch (error) {
      await qb.rollback();
      
      if (error.code === 'ER_LOCK_DEADLOCK' && intentos < maxReintentos - 1) {
        intentos++;
        const delay = Math.random() * 1000 * Math.pow(2, intentos); // Backoff exponencial
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
}

// Uso
await operacionConReintento(async () => {
  await qb.update('tabla1', datos1).where('id = ?', [id1]).execute();
  await qb.update('tabla2', datos2).where('id = ?', [id2]).execute();
});
```

## Monitoreo y Debugging

### Estado de Transacciones

```javascript
// Verificar si hay una transacción activa
if (qb.inTransaction()) {
  console.log('Hay una transacción activa');
}

// Obtener información de la transacción
const info = qb.getTransactionInfo();
console.log('Nivel de aislamiento:', info.isolationLevel);
console.log('Savepoints activos:', info.savepoints);
```

### Logging de Transacciones

```javascript
class TransactionLogger {
  constructor(queryBuilder) {
    this.qb = queryBuilder;
    this.transactionLog = [];
  }
  
  async startTransaction(options = {}) {
    const transactionId = Date.now().toString();
    this.transactionLog.push({
      id: transactionId,
      action: 'START',
      timestamp: new Date(),
      options
    });
    
    return await this.qb.startTransaction(options);
  }
  
  async commit() {
    this.transactionLog.push({
      action: 'COMMIT',
      timestamp: new Date()
    });
    
    return await this.qb.commit();
  }
  
  async rollback() {
    this.transactionLog.push({
      action: 'ROLLBACK',
      timestamp: new Date()
    });
    
    return await this.qb.rollback();
  }
  
  getLog() {
    return this.transactionLog;
  }
}
```