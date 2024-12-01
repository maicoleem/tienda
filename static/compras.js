document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const checkboxNuevoProducto = document.getElementById('nuevo-producto-checkbox');
    const campoReferencia = document.getElementById('referencia');
    const campoNombre = document.getElementById('nombre');
    const campoTipo = document.getElementById('tipo');
    const botonGuardar = document.getElementById('guardar-registro-btn');
    const botonValidarReferencia = document.getElementById('validar-referencia-btn');

    // Habilitar/deshabilitar campos al cambiar el estado del checkbox
    checkboxNuevoProducto.addEventListener('change', () => {
        const habilitado = checkboxNuevoProducto.checked;

        campoReferencia.disabled = !habilitado;
        campoNombre.disabled = !habilitado;
        campoTipo.disabled = !habilitado;

        if (habilitado) {
            // Limpiar los campos si se habilitan
            campoReferencia.value = '';
            campoNombre.value = '';
            campoTipo.value = '';
        }

        // Bloquear el botón de guardar mientras no se valide la referencia
        botonGuardar.disabled = true;
    });

    // Validar referencia al hacer clic en el botón "Validar"
    botonValidarReferencia.addEventListener('click', async () => {
        const referencia = campoReferencia.value.trim();

        if (!referencia) {
            alert('Por favor ingrese una referencia para validar.');
            return;
        }
        try {
            const response = await fetch(`/api/validar-referencia?referencia=${encodeURIComponent(referencia)}`);
            const resultado = await response.json();

            if (resultado.existe) {
                alert(resultado.mensaje);
                botonGuardar.disabled = true; // Deshabilitar el botón guardar si la referencia ya existe
            } else {
                alert(resultado.mensaje);
                botonGuardar.disabled = false; // Habilitar el botón guardar si la referencia es válida
            }
        } catch (error) {
            console.error('Error al validar la referencia:', error);
            alert('Hubo un problema al validar la referencia. Inténtelo nuevamente.');
        }
    });

    // Función para buscar productos
    const buscarProductos = async (termino) => {
        const response = await fetch(`/api/productos?q=${encodeURIComponent(termino)}`);
        const productos = await response.json();
        const lista = document.getElementById('producto-lista');
        lista.innerHTML = '';
        productos.forEach(producto => {
            const item = document.createElement('li');
            item.textContent = `${producto.nombre} (${producto.referencia}) - ${producto.tipo}`;
            item.dataset.referencia = producto.referencia;
            lista.appendChild(item);

            item.addEventListener('click', () => {
                document.getElementById('referencia').value = producto.referencia;
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('tipo').value = producto.tipo;
            });
        });
    };

    // Función para buscar bodegas
    const buscarBodegas = async (termino) => {
        const response = await fetch(`/api/bodegas?q=${encodeURIComponent(termino)}`);
        const bodegas = await response.json();
        const lista = document.getElementById('bodega-lista');
        lista.innerHTML = '';
        bodegas.forEach(bodega => {
            const item = document.createElement('li');
            item.textContent = `${bodega.nombre} (${bodega.codigo})`;
            item.dataset.codigo = bodega.codigo;
            lista.appendChild(item);

            item.addEventListener('click', () => {
                document.getElementById('bodega').value = bodega.codigo;
            });
        });
    };
    const cargarProductosIniciales = async () => {
        const response = await fetch('/api/productos-iniciales');
        const productos = await response.json();
        const lista = document.getElementById('producto-lista');
        lista.innerHTML = '';
        productos.forEach(producto => {
            const item = document.createElement('li');
            item.textContent = `${producto.nombre} (${producto.referencia}) - ${producto.tipo}`;
            item.dataset.referencia = producto.referencia;
            lista.appendChild(item);

            item.addEventListener('click', () => {
                document.getElementById('referencia').value = producto.referencia;
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('tipo').value = producto.tipo;
            });
        });
    };

    const cargarBodegasIniciales = async () => {
        const response = await fetch('/api/bodegas-iniciales');
        const bodegas = await response.json();
        const lista = document.getElementById('bodega-lista');
        lista.innerHTML = '';
        bodegas.forEach(bodega => {
            const item = document.createElement('li');
            item.textContent = `${bodega.nombre} (${bodega.codigo})`;
            item.dataset.codigo = bodega.codigo;
            lista.appendChild(item);

            item.addEventListener('click', () => {
                document.getElementById('bodega').value = bodega.codigo;
            });
        });
    };

     // Función para llenar una lista desplegable
     const cargarOpciones = async (url, selectId) => {
        const response = await fetch(url);
        const datos = await response.json();
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">Seleccione...</option>`;
        datos.forEach(item => {
            const option = document.createElement('option');
            option.value = item.nombre;
            option.textContent = item.nombre;
            select.appendChild(option);
        });
    };

    // Listeners para búsqueda dinámica en listas desplegables
    const configurarBusquedaSelect = (selectId) => {
        const select = document.getElementById(selectId);
        select.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase();
            Array.from(select.options).forEach(option => {
                const texto = option.textContent.toLowerCase();
                option.style.display = texto.includes(termino) ? '' : 'none';
            });
        });
    };
     // Función para establecer la fecha y hora actual
     const establecerFechaActual = () => {
        const campoFecha = document.getElementById('fecha');
        const ahora = new Date();
        const fechaISO = ahora.toISOString().slice(0, 16); // Formato "YYYY-MM-DDTHH:MM"
        campoFecha.value = fechaISO;
    };

     // Validar formulario
     const validarFormulario = () => {
        const campos = [
            { id: 'fecha', nombre: 'Fecha' },
            { id: 'empleado', nombre: 'Empleado' },
            { id: 'proveedor', nombre: 'Proveedor' },
            { id: 'cliente', nombre: 'Cliente' },
            { id: 'movimiento', nombre: 'Movimiento' },
            { id: 'referencia', nombre: 'Referencia del Producto' },
            { id: 'nombre', nombre: 'Nombre del Producto' },
            { id: 'tipo', nombre: 'Tipo de Producto' },
            { id: 'bodega', nombre: 'Bodega' },
            { id: 'cantidad', nombre: 'Cantidad' },
            { id: 'precio-compra', nombre: 'Precio de Compra' },
            { id: 'precio-venta', nombre: 'Precio de Venta' },
            { id: 'ganancia', nombre: 'Ganancia' }
        ];

        let formularioValido = true;
        let mensajeError = '';

        campos.forEach(campo => {
            const input = document.getElementById(campo.id);
            if (!input.value.trim()) {
                formularioValido = false;
                mensajeError += `- ${campo.nombre}\n`;
            }
        });

        if (!formularioValido) {
            alert(`Por favor complete los siguientes campos:\n${mensajeError}`);
        }

        return formularioValido;
    };
    // Guardar registro
    const guardarRegistro = async (e) => {
        e.preventDefault(); // Evita el envío del formulario tradicional
        if (validarFormulario()) {
            const datos = {
                fecha: document.getElementById('fecha').value,
                empleado: document.getElementById('empleado').value,
                proveedor: document.getElementById('proveedor').value,
                cliente: document.getElementById('cliente').value,
                movimiento: document.getElementById('movimiento').value,
                referencia: document.getElementById('referencia').value,
                nombre: document.getElementById('nombre').value,
                tipo: document.getElementById('tipo').value,
                bodega: document.getElementById('bodega').value,
                cantidad: document.getElementById('cantidad').value,
                precio_compra: document.getElementById('precio-compra').value,
                precio_venta: document.getElementById('precio-venta').value,
                ganancia: document.getElementById('ganancia').value,
                observaciones: document.getElementById('observaciones').value
            };

            const response = await fetch('/api/libro-registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                alert('Registro guardado exitosamente');
                document.getElementById('registro-form').reset();
                establecerFechaActual(); // Restaura la fecha actual
            } else {
                alert('Hubo un error al guardar el registro. Inténtelo nuevamente.');
            }
        }
    };

    const cargarRegistros = async () => {
        try {
            const response = await fetch('/api/libro-registro');
            if (!response.ok) {
                throw new Error(`Error al obtener registros: ${response.statusText}`);
            }
            const registros = await response.json();
            const tbody = document.getElementById('historial-lista');
            tbody.innerHTML = ''; // Limpia la tabla antes de llenarla

            registros.forEach(registro => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${registro.fecha}</td>
                    <td>${registro.empleado || '-'}</td>
                    <td>${registro.proveedor || '-'}</td>
                    <td>${registro.cliente || '-'}</td>
                    <td>${registro.movimiento}</td>
                    <td>${registro.referencia}</td>
                    <td>${registro.nombre}</td>
                    <td>${registro.tipo}</td>
                    <td>${registro.bodega}</td>
                    <td>${registro.cantidad}</td>
                    <td>${registro.precio_compra.toFixed(2)}</td>
                    <td>${registro.precio_venta.toFixed(2)}</td>
                    <td>${registro.ganancia.toFixed(2)}</td>
                    <td>${registro.observaciones || '-'}</td>
                `;
                tbody.appendChild(fila);
            });
        } catch (error) {
            console.error(error);
            alert('Hubo un problema al cargar los registros. Consulte la consola para más detalles.');
        }
    };

    // Cargar registros al cargar la página
    cargarRegistros();

    // Configurar evento de guardar
    document.getElementById('guardar-registro-btn').addEventListener('click', guardarRegistro);


    // Establecer fecha actual al cargar la página
    establecerFechaActual();

    // Cargar datos iniciales
    cargarOpciones('/api/empleados', 'empleado');
    cargarOpciones('/api/proveedores', 'proveedor');
    cargarOpciones('/api/clientes', 'cliente');

    // Configurar búsqueda en las listas desplegables
    configurarBusquedaSelect('empleado');
    configurarBusquedaSelect('proveedor');
    configurarBusquedaSelect('cliente');

    // Cargar datos iniciales
    cargarProductosIniciales();
    cargarBodegasIniciales();

    // Listeners para búsqueda
    document.getElementById('producto-busqueda').addEventListener('input', (e) => {
        buscarProductos(e.target.value);
    });

    document.getElementById('bodega-busqueda').addEventListener('input', (e) => {
        buscarBodegas(e.target.value);
    });
});
