const apiUrl = '/api/cuentas/';
let cuentaSeleccionadaId = null;
const tabla = document.getElementById('tabla');

// Cargar cuentas contables y mostrarlas en la tabla
async function cargarCuentas() {
        const response = await fetch(apiUrl);
        if(!response.ok){
        throw new Error('Error al obtener registros: ${response.statusText}')
        }
        const cuentas = await response.json();
        tabla.innerHTML = ''; // Limpia la tabla
        cuentas.forEach(cuenta => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${cuenta.codigo}</td>
                <td>${cuenta.nombre}</td>
                <td>${cuenta.tipo}</td>
                <td>${cuenta.descripcion}</td>
            `;
            fila.dataset.id = cuenta.id;
            fila.addEventListener('click', () => seleccionarCuenta(fila, cuenta));
            tabla.appendChild(fila);
        });
}

// Seleccionar una cuenta de la lista
function seleccionarCuenta(fila, cuenta) {
    const filas = document.querySelectorAll('#tabla_cuentas_contables tr');
    filas.forEach(f => f.classList.remove('seleccionado'));
    fila.classList.add('seleccionado');

    cuentaSeleccionadaId = cuenta.id;
    document.getElementById('codigo').value = cuenta.codigo;
    document.getElementById('nombre').value = cuenta.nombre;
    document.getElementById('tipo').value = cuenta.tipo;
    document.getElementById('descripcion').value = cuenta.descripcion || '';

    document.getElementById('guardar').disabled = false;
    document.getElementById('eliminar').disabled = false;
    document.getElementById('actualizar').disabled = false;
}

// Crear una nueva cuenta (habilita campos)
document.getElementById('crear').addEventListener('click', () => {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('guardar').disabled = false;
    document.getElementById('eliminar').disabled = true;
    document.getElementById('actualizar').disabled = true;

    cuentaSeleccionadaId = null; // Desvincular de cualquier selección previa
});

// Guardar una nueva cuenta o actualizar una existente
document.getElementById('guardar').addEventListener('click', async () => {
    const datos = {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        tipo: document.getElementById('tipo').value,
        descripcion: document.getElementById('descripcion').value,
    };

    if (cuentaSeleccionadaId) {
        // Actualizar cuenta
        const response = await fetch(`${apiUrl}/${cuentaSeleccionadaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (response.ok) {
            alert('Cuenta actualizada exitosamente');
        } else {
            alert('Error al actualizar la cuenta');
        }
    } else {
        // Crear cuenta
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos),
        });
        if (response.ok) {
            alert('Cuenta creada exitosamente');
        } else {
            alert('Error al crear la cuenta');
        }
    }
    cargarCuentas(); // Recargar la lista
    limpiarFormulario();
});

// Eliminar una cuenta
document.getElementById('eliminar').addEventListener('click', async () => {
    if (cuentaSeleccionadaId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
            const response = await fetch(`${apiUrl}/${cuentaSeleccionadaId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Cuenta eliminada exitosamente');
            } else {
                alert('Error al eliminar la cuenta');
            }
            cargarCuentas(); // Recargar la lista
            limpiarFormulario();
        }
    }
});

// Filtrar cuentas por nombre
document.getElementById('filtro_nombre').addEventListener('input', () => {
    const filtro = document.getElementById('filtro_nombre').value.toLowerCase();
    const filas = document.querySelectorAll('#tabla_cuentas_contables tr');
    filas.forEach(fila => {
        const nombre = fila.children[1].textContent.toLowerCase();
        fila.style.display = nombre.includes(filtro) ? '' : 'none';
    });
});

// Limpiar el formulario
function limpiarFormulario() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('tipo').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('guardar').disabled = true;
    document.getElementById('eliminar').disabled = true;
    document.getElementById('actualizar').disabled = true;
    cuentaSeleccionadaId = null;
}

cargarCuentas()

// Cargar cuentas al cargar la página
document.addEventListener('DOMContentLoaded', cargarCuentas);
