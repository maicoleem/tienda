const apiUrl = '/api/productos/';
let selectedProductoId = null;
let productosData = [];
let currentSortColumn = null;
let sortDirection = 'asc';
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
    const columnFilters = Array.from(document.querySelectorAll('.column-filters input'));
   columnFilters.forEach(input => {
        input.addEventListener('input', filtrarProductos)
    })
    document.querySelectorAll('.producto-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    })
});

// Funciones principales
function cargarProductos() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
           productosData = data;
           mostrarProductos(productosData)
           updateItemCount(productosData);
        })
        .catch(error => console.error('Error al cargar productos:', error));
}

function mostrarProductos(productos) {
    const productosList = document.getElementById('productosList');
    productosList.innerHTML = '';
    productos.forEach(producto => {
        const li = document.createElement('tr');
        li.innerHTML = `
            <td>${producto.referencia}</td>
            <td>${producto.nombre}</td>
            <td>${producto.tipo}</td>
        `;
        li.dataset.id = producto.id;
        li.addEventListener('click', () => seleccionarProducto(producto));
        productosList.appendChild(li);
    });
}
const updateItemCount = (data) => {
        const itemCountDiv = document.getElementById('item-count')
      itemCountDiv.textContent = `Número de items: ${data.length}`;
    };
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
       const columnFilters = Array.from(document.querySelectorAll('.column-filters input'))
        const columnFiltersValues = columnFilters.reduce((acc, input) => {
            acc[input.dataset.column] = input.value.toLowerCase();
            return acc;
        }, {});
        const filteredData = productosData.filter(producto => {
            return Object.keys(columnFiltersValues).every(column => {
               if(!columnFiltersValues[column]){
                   return true;
                }
                const value = String(producto[column]).toLowerCase();
                return value.includes(columnFiltersValues[column])
            });
        });
      mostrarProductos(filteredData)
      updateItemCount(filteredData)
}
function sortTable(column) {
         if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            sortDirection = 'asc';
        }
        const sortedData = [...productosData].sort((a, b) => {
           const aValue = a[column];
           const bValue = b[column];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                 return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }
             if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
         });
       mostrarProductos(sortedData);
       updateSortIndicators();
}
function updateSortIndicators() {
        const thElements = document.querySelectorAll('.producto-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
}