document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/productos')
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tabla-productos');
            data.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.id}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.precio}</td>
                    <td>${producto.stock}</td>
                    <td>${producto.bodega_id}</td>
                    <td>
                        <button onclick="editarProducto(${producto.id})">Editar</button>
                        <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        });
});

function editarProducto(id) {
    // Implementar lógica para editar
}

function eliminarProducto(id) {
    // Implementar lógica para eliminar
}
