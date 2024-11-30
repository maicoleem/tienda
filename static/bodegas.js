const apiUrl = '/api/bodegas/';
let selectedBodegaId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchBodegas();

    document.getElementById('crearBtn').addEventListener('click', () => {
        resetForm();
        toggleButtons(true, false, false);
    });

    document.getElementById('guardarBtn').addEventListener('click', () => {
        const nuevaBodega = getFormData();
        if (validateForm(nuevaBodega)) {
            crearBodega(nuevaBodega);
            resetForm();
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('actualizarBtn').addEventListener('click', () => {
        const bodegaActualizada = getFormData();
        if (validateForm(bodegaActualizada)) {
            actualizarBodega(selectedBodegaId, bodegaActualizada);
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('eliminarBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar esta bodega?')) {
            eliminarBodega(selectedBodegaId);
            resetForm();
        }
    });

    document.getElementById('filterCodigo').addEventListener('input', filterBodegas);
    document.getElementById('filterNombre').addEventListener('input', filterBodegas);
});

function fetchBodegas() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => renderBodegaList(data));
}

function renderBodegaList(bodegas) {
    const bodegaList = document.getElementById('bodegaList');
    bodegaList.innerHTML = '';
    bodegas.forEach(bodega => {
        const li = document.createElement('li');
        li.textContent = `${bodega.codigo} - ${bodega.nombre}`;
        li.dataset.id = bodega.id;
        li.addEventListener('click', () => selectBodega(bodega));
        bodegaList.appendChild(li);
    });
}

function selectBodega(bodega) {
    selectedBodegaId = bodega.id;
    document.getElementById('codigo').value = bodega.codigo;
    document.getElementById('nombre').value = bodega.nombre;
    document.getElementById('descripcion').value = bodega.descripcion;
    toggleButtons(false, true, true);
}

function crearBodega(bodega) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodega),
    }).then(() => fetchBodegas());
}

function actualizarBodega(id, bodega) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodega),
    }).then(() => fetchBodegas());
}

function eliminarBodega(id) {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' }).then(() => fetchBodegas());
}

function getFormData() {
    return {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value
    };
}

function resetForm() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    selectedBodegaId = null;
}

function toggleButtons(guardar, actualizar, eliminar) {
    document.getElementById('guardarBtn').disabled = !guardar;
    document.getElementById('actualizarBtn').disabled = !actualizar;
    document.getElementById('eliminarBtn').disabled = !eliminar;
}

function filterBodegas() {
    const filterCodigo = document.getElementById('filterCodigo').value.toLowerCase();
    const filterNombre = document.getElementById('filterNombre').value.toLowerCase();
    const bodegas = document.querySelectorAll('#bodegaList li');

    bodegas.forEach(bodega => {
        const [codigo, nombre] = bodega.textContent.toLowerCase().split(' - ');
        const visible = codigo.includes(filterCodigo) && nombre.includes(filterNombre);
        bodega.style.display = visible ? '' : 'none';
    });
}

function validateForm(bodega) {
    return bodega.codigo && bodega.nombre && bodega.descripcion;
}
