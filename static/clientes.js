const apiUrl = '/api/clientes';

// Función para listar clientes
function listarClientes() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(clientes => {
            const tabla = document.getElementById('tabla-clientes');
            tabla.innerHTML = ''; // Limpiar la tabla antes de llenarla
            clientes.forEach(cliente => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.nombre}</td>
                    <td>${cliente.correo}</td>
                    <td>${cliente.telefono}</td>
                    <td>
                        <button onclick="editarCliente(${cliente.id}, '${cliente.nombre}', '${cliente.correo}', '${cliente.telefono}')">Editar</button>
                        <button onclick="eliminarCliente(${cliente.id})">Eliminar</button>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => console.error('Error al listar clientes:', error));
}

// Función para crear un cliente
document.getElementById('crear-cliente-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('email').value;
    const telefono = document.getElementById('phone').value;

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, telefono}),
    })
        .then(response => {
            if (response.ok) {
                listarClientes();
                alert('Cliente creado con éxito');
                e.target.reset(); // Limpiar formulario
            } else {
                alert('Error al crear cliente');
            }
        })
        .catch(error => console.error('Error al crear cliente:', error));
});

// Función para editar un cliente
function editarCliente(id, nombreActual, correoActual, telefonoActual) {
    const nuevoNombre = prompt('Editar nombre:', nombreActual);
    const nuevoCorreo = prompt('Editar contacto:', correoActual);
    const nuevoTelefono = prompt('Editar contacto:', telefonoActual);

    if (nuevoNombre && nuevoCorreo && nuevoTelefono) {
        fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nuevoNombre, correo: nuevoCorreo, telefono: nuevoTelefono}),
        })
            .then(response => {
                if (response.ok) {
                    listarClientes();
                    alert('Cliente actualizado con éxito');
                } else {
                    alert('Error al actualizar cliente');
                }
            })
            .catch(error => console.error('Error al actualizar cliente:', error));
    }
}

// Función para eliminar un cliente
function eliminarCliente(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    listarClientes();
                    alert('Cliente eliminado con éxito');
                } else {
                    alert('Error al eliminar cliente');
                }
            })
            .catch(error => console.error('Error al eliminar cliente:', error));
    }
}

// Cargar la lista de clientes al cargar la página
document.addEventListener('DOMContentLoaded', listarClientes);
