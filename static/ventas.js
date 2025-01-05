document.addEventListener('DOMContentLoaded', () => {

    // Referencias a elementos del DOM
    const botonAgregar = document.getElementById('agregar-registro-btn');
    const tablaRegistros = document.getElementById('registro-lista');
    const botonEliminar = document.getElementById('eliminar-registro-btn');
    const botonCancelar = document.getElementById('cancelar-registros-btn');
    const botonGuardar = document.getElementById('guardar-registros-btn');
    const inputSubtotal = document.getElementById('subtotal');
    const inputTotal = document.getElementById('total');
    const inputAcredita = document.getElementById('acredita');
    const checkBoxIva = document.getElementById('iva-checkbox');
    const checkBoxAcredito = document.getElementById('acredito-checkbox');
    const ivaVenta = document.getElementById('iva-venta');
    const inputBanco = document.getElementById('banco');
    const inputEfectivo = document.getElementById('efectivo');

    const botones = {
        guardar: document.getElementById('guardar-registros-btn'),
        eliminar: document.getElementById('eliminar-registro-btn'),
        cotizar: document.getElementById('cotizar-registros-btn'),
        cancelar: document.getElementById('cancelar-registros-btn'),
    };

    // Función para buscar almacenamiento
    const buscarAlmacenamiento = async (termino) => {
        const response = await fetch(`/api/almacenamiento?q=${encodeURIComponent(termino)}`);
        const bodegas = await response.json();
        const lista = document.getElementById('almacenamiento-lista');
        lista.innerHTML = '';
        bodegas.forEach(almacenamiento => {
            const item = document.createElement('li');
            item.textContent = `${almacenamiento.nombre} (${almacenamiento.precio_venta}) (${almacenamiento.cantidad}) `;
            item.dataset.id = almacenamiento.id;
            lista.appendChild(item);
            item.addEventListener('click', () => {
                document.getElementById('referencia').value = almacenamiento.referencia;
                document.getElementById('nombre').value = almacenamiento.nombre;
                document.getElementById('tipo').value = almacenamiento.tipo;
                document.getElementById('cantidad-disponible').value = almacenamiento.cantidad;
                document.getElementById('bodega').value = almacenamiento.bodega;
                document.getElementById('precio-compra').value = almacenamiento.precio_compra;
                document.getElementById('precio-venta').value = almacenamiento.precio_venta;
                document.getElementById('ganancia').value = almacenamiento.id;               
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
     // Validar formulario antes de agregar
     const validarFormulario = () => {
        const campos = [
            { id: 'fecha', nombre: 'Fecha' },
            { id: 'empleado', nombre: 'Empleado' },
            { id: 'cliente', nombre: 'Cliente' },
            { id: 'movimiento', nombre: 'Movimiento' },
            { id: 'referencia', nombre: 'Referencia del Producto' },
            { id: 'nombre', nombre: 'Nombre del Producto' },
            { id: 'tipo', nombre: 'Tipo' },
            { id: 'bodega', nombre: 'Bodega' },
            { id: 'cantidad', nombre: 'Cantidad Venta' },
            { id: 'precio-venta', nombre: 'Precio de Venta' },
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
    // Agregar registro a la tabla
    const agregarRegistro = () => {
            if (!validarFormulario()) return;
    
            // Obtener los valores del formulario
            const registro = {
                fecha: document.getElementById('fecha').value,
                empleado: document.getElementById('empleado').value,
                cliente: document.getElementById('cliente').value,
                proveedor: document.getElementById('proveedor').value,
                movimiento: document.getElementById('movimiento').value,
                referencia: document.getElementById('referencia').value,
                nombre: document.getElementById('nombre').value,
                tipo: document.getElementById('tipo').value,
                bodega: document.getElementById('bodega').value,
                cantidad: document.getElementById('cantidad').value,
                precioCompra: document.getElementById('precio-compra').value,
                precioVenta: document.getElementById('precio-venta').value,
                ganancia: document.getElementById('ganancia').value,
                observaciones: document.getElementById('observaciones').value
            };
    
            // Crear fila en la tabla
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${registro.fecha}</td>
                <td>${registro.empleado}</td>
                <td>${registro.proveedor}</td>
                <td>${registro.cliente}</td>
                <td>${registro.movimiento}</td>
                <td>${registro.referencia}</td>
                <td>${registro.nombre}</td>
                <td>${registro.tipo}</td>
                <td>${registro.bodega}</td>
                <td>${registro.cantidad}</td>
                <td>${registro.precio_compra}</td>
                <td>${registro.precioVenta}</td>
                <td>${registro.ganancia}</td> <!-- Ganancia calculada después -->
                <td>${registro.observaciones}</td>
            `;
            // Asignar evento para eliminar fila al hacer clic en ella
        fila.addEventListener('click', () => {
            fila.classList.toggle('seleccionado');
        });
    
            // Agregar la fila a la tabla
            tablaRegistros.appendChild(fila);
    
            // Habilitar botones
            Object.values(botones).forEach(boton => (boton.disabled = false));
    
            // Limpiar formulario
            document.getElementById('registro-form').reset();
            
            calcularTotal();
    };

    // Eliminar elemento seleccionado
    const eliminarSeleccionado = () => {
        const seleccionado = document.querySelector('.seleccionado');
        if (seleccionado) {
            tablaRegistros.removeChild(seleccionado);
            calcularTotal();
            // Si ya no hay filas, deshabilitar botones
            if (!tablaRegistros.children.length) {
                Object.values(botones).forEach(boton => (boton.disabled = true));
                botonEliminar.disabled = true;
                botonCancelar.disabled = true;
            }
        } else {
            alert('Por favor seleccione un registro para eliminar.');
        }
    };
        // Cancelar todos los registros (vaciar tabla)
    const cancelarRegistros = () => {
        tablaRegistros.innerHTML = ''; // Vaciar tabla
        calcularTotal();
        // Deshabilitar botones
        Object.values(botones).forEach(boton => (boton.disabled = true));
    };
    
    // Función para recopilar los datos de la tabla
    const obtenerRegistrosTabla = () => {
        const filas = Array.from(tablaRegistros.children);
        const registros = filas.map(fila => {
            const columnas = fila.children;
            return {
                fecha: columnas[0].textContent,
                empleado: columnas[1].textContent,
                proveedor: columnas[2].textContent,
                cliente: columnas[3].textContent,
                movimiento: columnas[4].textContent,
                referencia: columnas[5].textContent,
                nombre: columnas[6].textContent,
                tipo: columnas[7].textContent,
                bodega: columnas[8].textContent,
                cantidad: columnas[9].textContent,
                precio_compra: columnas[10].textContent,
                precio_venta: columnas[11].textContent,
                ganancia: columnas[12].textContent,
                observaciones: columnas[13].textContent || ""
            };
        });
        return registros;
    };

    // Función para realizar la venta
    const realizarVenta = async () => {
        const registros = obtenerRegistrosTabla();

        if (registros.length === 0) {
            alert("No hay registros para realizar la venta.");
            return;
        }
        const habilitado = checkBoxAcredito.checked;
        if(!habilitado){
            alert("Para hacer venta a credito habilitarla.");
            return;
        }
        costoMercancia = calcularCostoMercancia;
        if(costoMercancia <= 0){
            alert("Error al calcular el costo de la mercancua.");
            return;
        }
        try {
            
            const contable ={
                banco: inputBanco.value,
                efectivo: inputEfectivo.value,
                iva: ivaVenta.value,
                acredita: inputAcredita.value,
                subtotal: inputSubtotal.value,
                total: inputTotal.value,
                costo_mercancia: costoMercancia
            };
        
            const playload = {
                registros,
                contable
            };

            const response = await fetch('/api/realizar-venta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playload)
            });

            const resultado = await response.json();

            if (response.ok) {
                alert(resultado.mensaje);
                tablaRegistros.innerHTML = ''; // Vaciar la tabla tras éxito
                botonGuardar.disabled = true;
            } else {
                alert(`Error: ${resultado.error}`);
            }
        } catch (error) {
            console.error('Error al realizar la venta:', error);
            alert('Hubo un problema al realizar la venta. Consulte la consola para más detalles.');
        }
    };

    //Calcular el total
    const calcularTotal = () => {
        const registros = obtenerRegistrosTabla();
         // Calcular el total de venta
        const total = registros.reduce((acumulador, registro) => {
            // Convertir 'cantidad' y 'precio_venta' a números
            const cantidad = parseFloat(registro.cantidad) || 0;
            const precioVenta = parseFloat(registro.precio_venta) || 0;

            // Sumar al acumulador el producto de cantidad y precio_venta
            return acumulador + (cantidad * precioVenta);
        }, 0); // Iniciar el acumulador en 0
        inputSubtotal.value = total;
        inputAcredita.value = total;
        inputTotal.value = total;
        return total;
    };
    //Calcular el total
    const calcularCostoMercancia = () => {
        const registros = obtenerRegistrosTabla();
         // Calcular el total de venta
        const total = registros.reduce((acumulador, registro) => {
            // Convertir 'cantidad' y 'precio_venta' a números
            const cantidad = parseFloat(registro.cantidad) || 0;
            const precioVenta = parseFloat(registro.precio_compra) || 0;

            // Sumar al acumulador el producto de cantidad y precio_venta
            return acumulador + (cantidad * precioVenta);
        }, 0); // Iniciar el acumulador en 0
        inputSubtotal.value = total;
        inputAcredita.value = total;
        inputTotal.value = total;
        return total;
    };


    // Función para establecer la fecha y hora actual
    const establecerFechaActual = () => {
        const campoFecha = document.getElementById('fecha');
        const ahora = new Date();
        const fechaISO = ahora.toISOString().slice(0, 16); // Formato "YYYY-MM-DDTHH:MM"
        campoFecha.value = fechaISO;
    };
    
    //acredita
    function calcularAcredita(){
        pagoTotal = parseFloat(inputBanco.value) +
        parseFloat(inputEfectivo.value);
        inputAcredita.value =  parseFloat(inputTotal.value) - pagoTotal;
    }

    // Evento para el botón de realizar venta
    botonGuardar.addEventListener('click', realizarVenta);

    // Habilitar/deshabilitar campos al cambiar el estado del checkbox
    checkBoxIva.addEventListener('change', () => {
        const habilitado = checkBoxIva.checked;
        if (habilitado) {
            // Limpiar los campos si se habilitan
            ivaVenta.value = parseFloat(inputSubtotal.value) * 0.19;
            inputTotal.value = parseFloat(inputSubtotal.value) + parseFloat(ivaVenta.value);
            inputAcredita.value = parseFloat(inputSubtotal.value) + parseFloat(ivaVenta.value);
        }else{
            ivaVenta.value = 0;
            inputTotal.value = parseFloat(inputSubtotal.value);
            inputAcredita.value = parseFloat(inputSubtotal.value);
        }
    });

    //input banco y efectivo
    inputBanco.addEventListener('input', calcularAcredita);
    inputEfectivo.addEventListener('input', calcularAcredita);

    // Evento para agregar registros
    botonAgregar.addEventListener('click', (e) => {
            e.preventDefault(); // Evita el envío del formulario
            agregarRegistro();
    });
    botonEliminar.addEventListener('click', eliminarSeleccionado);
    botonCancelar.addEventListener('click', cancelarRegistros);

    // Cargar datos iniciales
    cargarOpciones('/api/empleados', 'empleado');
    cargarOpciones('/api/proveedores', 'proveedor');
    cargarOpciones('/api/clientes', 'cliente');

    // Configurar búsqueda en las listas desplegables
    configurarBusquedaSelect('empleado');
    configurarBusquedaSelect('proveedor');
    configurarBusquedaSelect('cliente');

    // Establecer fecha actual al cargar la página
    establecerFechaActual();

    document.getElementById('almacenamiento-busqueda').addEventListener('input', (e) => {
        buscarAlmacenamiento(e.target.value)
    })
});