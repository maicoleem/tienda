document.addEventListener('DOMContentLoaded', cargarSocios);

// Cargar socios en la tabla
async function cargarSocios() {
    const response = await fetch('/api/socios');
    const socios = await response.json();
    const tabla = document.getElementById('tabla-socios');
    tabla.innerHTML = ''; // Limpiar la tabla

    socios.forEach(socio => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${socio.nombre}</td>
            <td>${socio.id}</td>
            <td>${socio.contacto}</td>
        `;
        fila.dataset.id = socio.id;
        fila.addEventListener('click', () => seleccionarSocio(socio, fila));
        tabla.appendChild(fila);
    });
}

// Seleccionar socio
function seleccionarSocio(socio, fila) {
    const filas = document.querySelectorAll('#tabla-socios tr');
    filas.forEach(f => f.classList.remove('seleccionado'));
    fila.classList.add('seleccionado');

    document.getElementById('nombre-socio').value = socio.nombre;
    document.getElementById('identificacion-socio').value = socio.id;
    document.getElementById('telefono-socio').value = socio.contacto;

    document.getElementById('crear-socio').disabled = true;
    document.getElementById('actualizar-socio').disabled = false;
    document.getElementById('eliminar-socio').disabled = false;

    document.getElementById('nombre').value = socio.nombre;
}

// Crear socio
document.getElementById('crear-socio').addEventListener('click', async () => {
    const datos = {
        nombre: document.getElementById('nombre-socio').value,
        id: document.getElementById('identificacion-socio').value,
        contacto: document.getElementById('telefono-socio').value
    };
    await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    cargarSocios();
});

// Registrar aporte DINERO
document.getElementById('registrar-dinero').addEventListener('click', async () => {
    const datos = {
        identificacion: document.getElementById('identificacion-socio').value,
        nombre: document.getElementById('nombre').value,
        efectivo: parseFloat(document.getElementById('efectivo').value),
        banco: parseFloat(document.getElementById('banco').value),
        observaciones: document.getElementById('observaciones-dinero').value,
        factura: document.getElementById('factura').value,
        codigo: '3115' // Código contable de aportes
    };
    await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    }).then(()=>{
        limpiarFormularioDinero();
        buscarRegistros()
    }).catch(error => console.error('Error al registrar aporte:', error));
});

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

const buscarFacturas = async () => {
    try {
        // Obtener el valor del input con id "factura"
        const cadena = "APORTE";

        // Realizar la solicitud GET con la cadena como parámetro
        const response = await fetch(`/api/contable/buscar-facturas?cadena=${encodeURIComponent(cadena)}`);
        const datos = await response.json();

        if (response.ok) {
            console.log("Facturas encontradas:", datos);
            // Mostrar los resultados en la interfaz
            mostrarFacturasEnTabla(datos);
        } else {
            console.error("Error:", datos.error);
            alert(`Error: ${datos.error}`);
        }
    } catch (error) {
        console.error("Error al buscar facturas:", error);
        alert("Hubo un problema al buscar las facturas. Consulte la consola para más detalles.");
    }
};

const buscarRegistros = async () => {
    try {
        // Obtener el valor del input con id "factura"
        const cadena = "APORTE";

        // Realizar la solicitud GET con la cadena como parámetro
        const response = await fetch(`/api/libro_registro/facturas-registro?cadena=${encodeURIComponent(cadena)}`);
        const datos = await response.json();

        if (response.ok) {
            console.log("Facturas encontradas:", datos);
            // Mostrar los resultados en la interfaz
            mostrarFacturasEnTabla(datos);
        } else {
            console.error("Error:", datos.error);
            alert(`Error: ${datos.error}`);
        }
    } catch (error) {
        console.error("Error al buscar facturas:", error);
        alert("Hubo un problema al buscar las facturas. Consulte la consola para más detalles.");
    }
};

// Función para mostrar las facturas en una tabla HTML
const mostrarFacturasEnTabla = (facturas) => {
    const tbody = document.getElementById("tabla-aportes");
    tbody.innerHTML = ""; // Vaciar la tabla

    if (facturas.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7'>No se encontraron facturas</td></tr>";
        return;
    }

    // Agregar filas con los resultados
    facturas.forEach((factura) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${new Date(factura.fecha).toLocaleDateString()}</td>
            <td>${factura.factura}</td>
            <td>${factura.referencia}</td>
            <td>${factura.nombre}</td>
            <td>${factura.precio_compra}</td>
            <td>${factura.precio_venta}</td>
        `;
        tbody.appendChild(fila);
    });


};

const obtenerNuevaFactura = async () => {
    try {
        // Obtener el valor del prefijo ingresado en un input
        const prefijo = "APORTE";

        if (!prefijo) {
            alert("Por favor, ingrese un prefijo para buscar.");
            return;
        }

        // Hacer la solicitud al backend con el prefijo como parámetro
        const response = await fetch(`/api/factura-max?prefijo=${encodeURIComponent(prefijo)}`);
        const datos = await response.json();

        if (response.ok) {
            // Mostrar el nuevo valor en el input de factura-nueva
            document.getElementById("factura").value = datos.nueva_factura;
        } else {
            console.error("Error:", datos.error);
            alert(`Error: ${datos.error}`);
        }
    } catch (error) {
        console.error("Error al obtener la nueva factura:", error);
        alert("Hubo un problema al obtener la nueva factura. Consulte la consola para más detalles.");
    }
};

function limpiarFormularioDinero(){
    const formulario = document.getElementById('formulario-aportes')
    formulario.reset();
}

// Establecer fecha actual al cargar la página
establecerFechaActual();

//obtener factura nueva
obtenerNuevaFactura();

//registros
buscarRegistros()