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
            <td>${socio.identificacion}</td>
            <td>${socio.telefono}</td>
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
    document.getElementById('identificacion-socio').value = socio.identificacion;
    document.getElementById('telefono-socio').value = socio.telefono;

    document.getElementById('crear-socio').disabled = true;
    document.getElementById('actualizar-socio').disabled = false;
    document.getElementById('eliminar-socio').disabled = false;
}

// Crear socio
document.getElementById('crear-socio').addEventListener('click', async () => {
    const datos = {
        nombre: document.getElementById('nombre-socio').value,
        identificacion: document.getElementById('identificacion-socio').value,
        telefono: document.getElementById('telefono-socio').value
    };
    await fetch('/api/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    cargarSocios();
});

// Registrar aporte
document.getElementById('registrar-aporte').addEventListener('click', async () => {
    const datos = {
        referencia: document.getElementById('referencia-aporte').value,
        nombre: document.getElementById('nombre-aporte').value,
        valor: parseFloat(document.getElementById('valor-aporte').value),
        observaciones: document.getElementById('observaciones-aporte').value,
        codigo: '3115' // Código contable de aportes
    };
    await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });
    alert('Aporte registrado exitosamente');
});
