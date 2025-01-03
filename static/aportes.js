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
        nombre: document.getElementById('nombre-aporte').value,
        efectivo: parseFloat(document.getElementById('efectivo').value),
        banco: parseFloat(document.getElementById('banco').value),
        observaciones: document.getElementById('observaciones-dinero').value,
        codigo: '3115' // Código contable de aportes
    };
    await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    alert('Aporte registrado exitosamente');
});

// Función para establecer la fecha y hora actual
const establecerFechaActual = () => {
    const campoFecha = document.getElementById('fecha');
    const ahora = new Date();
    const fechaISO = ahora.toISOString().slice(0, 16); // Formato "YYYY-MM-DDTHH:MM"
    campoFecha.value = fechaISO;
};

// Establecer fecha actual al cargar la página
establecerFechaActual();