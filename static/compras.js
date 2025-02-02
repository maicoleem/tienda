document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const checkboxNuevoProducto = document.getElementById('nuevo-producto-checkbox');
    const campoReferencia = document.getElementById('referencia');
    const campoNombre = document.getElementById('nombre');
    const campoTipo = document.getElementById('tipo');
    const botonGuardar = document.getElementById('guardar-registro-btn');
    const botonValidarReferencia = document.getElementById('validar-referencia-btn');
    // Obtener los inputs
    const cantidadInput = document.getElementById('cantidad');
    const precioCompraInput = document.getElementById('precio-compra');
    const precioVentaInput = document.getElementById('precio-venta');
    const gananciaInput = document.getElementById('ganancia');
    const precioTotalInput = document.getElementById('precio-total');
    const bancoInput = document.getElementById('banco');
    const efectivoInput = document.getElementById('efectivo');
    const creditoInput = document.getElementById('credito');
    const valorIva = document.getElementById('valor-iva');
    const efectivoDisponible = document.getElementById('disponible-efectivo');
    const bancoDisponible = document.getElementById('disponible-banco');

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
        try{
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error al obtener registros: ${response.statusText}`);
            }
            const datos = await response.json();
            const select = document.getElementById(selectId);
            select.innerHTML = `<option value="">Seleccione...</option>`;
            datos.forEach(item => {
                const option = document.createElement('option');
                option.value = item.nombre;
                option.textContent = item.nombre;
                select.appendChild(option);
            });    
        }catch (error){
            console.error(error);
        }            
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
    
        // Crear un objeto Date con la hora local del navegador
        const ahora = new Date();
    
        // Configuración para el formato "MIE 01 ENE 24 13:30"
        const options = { 
            timeZone: 'America/Bogota', 
            weekday: 'short',    // Día de la semana (MIE, JUE, ...)
            day: '2-digit',      // Día con dos dígitos (01, 02, ...)
            month: 'short',      // Mes en formato corto (ENE, FEB, ...)
            year: '2-digit',     // Año con dos dígitos (24, 25, ...)
            hour: '2-digit',     // Hora con dos dígitos (13, 14, ...)
            minute: '2-digit',   // Minutos con dos dígitos (30, 45, ...)
            hour12: false        // Usar formato de 24 horas
        };
    
        // Formatear la fecha según la zona horaria de Bogotá
        const formatoBogota = new Intl.DateTimeFormat('es-CO', options).format(ahora);
    
        // Establecer la fecha en el input
        campoFecha.value = formatoBogota;
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
            { id: 'ganancia', nombre: 'Ganancia' },
            { id: 'banco', nombre: 'banco' },
            { id: 'efectivo', nombre: 'efectivo' },
            { id: 'credito', nombre: 'credito' },
            { id: 'iva', nombre: 'IVA' },
            { id: 'factura', nombre: 'Factura' }
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

        disponibleBanco = document.getElementById('disponible-banco').value;
        disponibleEfectivo = document.getElementById('disponible-efectivo').value;

        if(parseFloat(disponibleBanco) < parseFloat(bancoInput.value)){
            formularioValido = false
            alert(`No tiene saldo disponible en banco`);
        }
        if(parseFloat(disponibleEfectivo) < parseFloat(efectivoInput.value)){
            formularioValido = false
            alert(`No tiene saldo disponible en caja`);
        }

        pagoTotal = parseFloat(bancoInput.value) + parseFloat(efectivoInput.value)
        apagar = parseFloat(precioTotalInput.value) + parseFloat(valorIva.value)
        if(pagoTotal > apagar){
            formularioValido = false
            alert(`Ingreso una cantidad superior al valor de la factura`);
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
                precio_compra: parseFloat(document.getElementById('precio-compra').value),
                precio_venta: parseFloat(document.getElementById('precio-venta').value),
                ganancia: parseFloat(document.getElementById('ganancia').value),
                observaciones: document.getElementById('observaciones').value,
                banco: parseFloat(document.getElementById('banco').value),
                efectivo: parseFloat(document.getElementById('efectivo').value),
                iva: parseFloat(document.getElementById('valor-iva').value),
                factura : document.getElementById('factura').value,
                credito: parseFloat(creditoInput.value)
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
                    <td>${registro.factura || '-'}</td>
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
    // Función para calcular la ganancia y el total
    function calcularGanancia() {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precioCompra = parseFloat(precioCompraInput.value) || 0;
        const precioVenta = parseFloat(precioVentaInput.value) || 0;

        // Evitar división por 0 y verificar valores
        if (cantidad > 0) {
            const ganancia = (precioVenta - precioCompra) / cantidad;
            gananciaInput.value = ganancia.toFixed(2);
            precioTotalInput.value  = (cantidad * precioCompra)
        } else {
            gananciaInput.value = '0.00';
        }
    }
    //filtrat tabla compras
    function filtrarTablaCompras() {
        const filtros = {
            fecha: document.getElementById('filtro-fecha').value.toLowerCase(),
            factura: document.getElementById('filtro-factura').value.toLowerCase(),
            proveedor: document.getElementById('filtro-proveedor').value.toLowerCase(),
            cliente: document.getElementById('filtro-cliente').value.toLowerCase(),
            movimiento: document.getElementById('filtro-movimiento').value.toLowerCase(),
            referencia: document.getElementById('filtro-referencia').value.toLowerCase(),
            nombre: document.getElementById('filtro-nombre').value.toLowerCase(),
            tipo: document.getElementById('filtro-tipo').value.toLowerCase(),
            bodega: document.getElementById('filtro-bodega').value.toLowerCase(),
            cantidad: document.getElementById('filtro-cantidad').value.toLowerCase(),
            precio_compra: document.getElementById('filtro-precio-compra').value.toLowerCase(),
            precio_venta: document.getElementById('filtro-precio-venta').value.toLowerCase(),
            ganancia: document.getElementById('filtro-ganancia').value.toLowerCase(),
            observaciones: document.getElementById('filtro-Observaciones').value.toLowerCase(),
        };
    
        Array.from(document.getElementById('historial-lista').children).forEach(fila => {
            const celdas = Array.from(fila.getElementsByTagName('td')).map(celda => celda.textContent.toLowerCase());
            
            const coincide = Object.keys(filtros).every((key, index) => {
                return filtros[key] === '' || celdas[index].includes(filtros[key]);
            });
    
            fila.style.display = coincide ? '' : 'none';
        });
    }
    
    function calcularCredito(){
        const costoIVA = parseFloat(valorIva.value) || 0;
        creditoInput.value = parseFloat(precioTotalInput.value) + costoIVA - parseFloat(bancoInput.value) - parseFloat(efectivoInput.value)

        if(0 > creditoInput){
            alert('esta ingresando una cantidad superior a la de la factura')
        }
    }

    //Cargar disponible
    async function cargarDisponible() {
        const caja = '110505';
        const banco = '111005';
        const cajaCuenta = await obtenerTotalesPorCodigo(caja);
        totalCaja = cajaCuenta.totalDebe - cajaCuenta.totalHaber;
        if(cajaCuenta){
            efectivoDisponible.value = totalCaja;
        }
        
        const bancoCuenta = await obtenerTotalesPorCodigo(banco)
        totalBanco = bancoCuenta.totalDebe - bancoCuenta.totalHaber
        if(totalBanco){
            bancoDisponible.value = totalBanco;
        }
    }
    // Función para obtener los totales de debe y haber por código de cuenta
    const obtenerTotalesPorCodigo = async (codigoCuenta) => {
        if (!codigoCuenta) {
            alert('Por favor, ingrese un código de cuenta.');
            return;
        }
        try {
            // Realizar la solicitud al backend
            const response = await fetch(`/api/debe-haber-cuenta?codigo_cuenta=${codigoCuenta}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            // Retornar los totales de debe y haber
            return {
                totalDebe: data.total_debe || 0,
                totalHaber: data.total_haber || 0
            };
        } catch (error) {
            console.error('Error al obtener los totales:', error);
            alert('Hubo un problema al obtener los datos. Consulte la consola para más detalles.');
        }
    }

    cargarDisponible()

    // Cargar registros al cargar la página
    cargarRegistros();

    //filtros
     document.querySelectorAll('input[id^="filtro-"], select[id^="filtro-"]').forEach(filtro => {
        filtro.addEventListener('input', filtrarTablaCompras);
    });
    
    // Configurar evento de guardar
    document.getElementById('guardar-registro-btn').addEventListener('click', guardarRegistro);
    
    // Agregar eventos para actualizar la ganancia automáticamente
    cantidadInput.addEventListener('input', calcularGanancia);
    precioCompraInput.addEventListener('input', calcularGanancia);
    precioVentaInput.addEventListener('input', calcularGanancia);
    bancoInput.addEventListener('input', calcularCredito);
    efectivoInput.addEventListener('input', calcularCredito);

    // Establecer fecha actual al cargar la página
    establecerFechaActual();

    // Cargar datos iniciales
    cargarOpciones('/api/empleados', 'empleado');
    cargarOpciones('/api/proveedores', 'proveedor');
    cargarOpciones('/api/clientes/', 'cliente');

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

    document.getElementById('iva').addEventListener('click', function () {
        const selectedValue = this.value;
        console.log(selectedValue)
        if (selectedValue === 'NO') {
            valorIva.value = 0
            
        } else if (selectedValue === 'SI') {
            const valor = precioTotalInput.value * 0.19
            valorIva.value = valor
        }
    });

});