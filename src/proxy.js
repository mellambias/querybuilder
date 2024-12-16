function createFluentProxy(instance) {
	let queue = Promise.resolve(); // La cola inicial es una promesa resuelta
	let errorHandler = null; // Manejador de errores global

	return new Proxy(instance, {
		get(target, prop, receiver) {
			if (prop === "catch") {
				// Permite registrar un manejador de errores
				return (handler) => {
					errorHandler = handler;
					return receiver; // Para encadenar
				};
			}
			const original = Reflect.get(target, prop, receiver);

			if (typeof original === "function") {
				return (...args) => {
					// Si el método es una función, lo manejamos
					if (original.constructor.name === "AsyncFunction") {
						// Si es asíncrono, lo añadimos a la cola
						queue = queue.then(() =>
							original.apply(target, args).catch((error) => {
								if (errorHandler) {
									errorHandler(error);
								} else {
									throw error;
								}
							}),
						);
						return receiver;
					}
					// Si es síncrono, lo ejecutamos inmediatamente después de la cola
					queue = queue.then(() => {
						try {
							return original.apply(target, args);
						} catch (error) {
							if (errorHandler) {
								errorHandler(error);
							} else {
								throw error;
							}
						}
					});
					return receiver; // Para mantener el encadenamiento
				};
			}

			// Si no es una función, simplemente devolvemos la propiedad
			return original;
		},
	});
}
