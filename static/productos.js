const apiUrl = '/api/productos/';
let selectedProductoId = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    document.getElementById('crearBtn').addEventListener('click', () => {
        limpiarFormulario();
        toggleBotones(true, false, false);
    });

    document.getElementById('guardarBtn').addEventListener('click', () => {
        const producto = obtenerDatosFormulario();
        if (validarFormulario(producto)) {
            if (selectedProductoId) {
                actualizarProducto(selectedProductoId, producto);
            } else {
                crearProducto(producto);
            }
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('actualizarBtn').addEventListener('click', () => {
        const producto = obtenerDatosFormulario();
        if (validarFormulario(producto)) {
            actualizarProducto(selectedProductoId, producto);
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('eliminarBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            eliminarProducto(selectedProductoId);
        }
    });

    document.getElementById('filterReferencia').addEventListener('input', filtrarProductos);
    document.getElementById('filterNombre').addEventListener('input', filtrarProductos);
});

// Funciones principales
function cargarProductos() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => mostrarProductos(data))
        .catch(error => console.error('Error al cargar productos:', error));
}

function mostrarProductos(productos) {
    const productosList = document.getElementById('productosList');
    productosList.innerHTML = '';
    productos.forEach(producto => {
        const li = document.createElement('li');
        li.textContent = `${producto.referencia} - ${producto.nombre} (${producto.tipo})`;
        li.addEventListener('click', () => seleccionarProducto(producto));
        productosList.appendChild(li);
    });
}

function crearProducto(producto) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    })
        .then(() => {
            cargarProductos();
            limpiarFormulario();
            alert('Producto creado exitosamente.');
        })
        .catch(error => console.error('Error al crear producto:', error));
}

function actualizarProducto(id, producto) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(producto)
    })
        .then(() => {
            cargarProductos();
            limpiarFormulario();
            alert('Producto actualizado exitosamente.');
        })
        .catch(error => console.error('Error al actualizar producto:', error));
}

function eliminarProducto(id) {
    fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            cargarProductos();
            limpiarFormulario();
            alert('Producto eliminado exitosamente.');
        })
        .catch(error => console.error('Error al eliminar producto:', error));
}

// Funciones auxiliares
function seleccionarProducto(producto) {
    selectedProductoId = producto.id;
    document.getElementById('referencia').value = producto.referencia;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('tipo').value = producto.tipo;
    toggleBotones(false, true, true);
}

function limpiarFormulario() {
    selectedProductoId = null;
    document.getElementById('referencia').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('tipo').value = '';
}

function obtenerDatosFormulario() {
    return {
        referencia: document.getElementById('referencia').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        tipo: document.getElementById('tipo').value.trim()
    };
}

function validarFormulario(producto) {
    return producto.referencia && producto.nombre && producto.tipo;
}

function toggleBotones(guardar, actualizar, eliminar) {
    document.getElementById('guardarBtn').disabled = !guardar;
    document.getElementById('actualizarBtn').disabled = !actualizar;
    document.getElementById('eliminarBtn').disabled = !eliminar;
}

function filtrarProductos() {
    const filtroReferencia = document.getElementById('filterReferencia').value.toLowerCase();
    const filtroNombre = document.getElementById('filterNombre').value.toLowerCase();
    const productos = document.querySelectorAll('#productosList li');

    productos.forEach(producto => {
        const [referencia, nombre] = producto.textContent.toLowerCase().split(' - ');
        if (referencia.includes(filtroReferencia) && nombre.includes(filtroNombre)) {
            producto.style.display = '';
        } else {
            producto.style.display = 'none';
        }
    });
}

