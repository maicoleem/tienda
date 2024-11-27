const listaClientes = document.getElementById('clientes-lista');
const btnCrear = document.getElementById('btn-crear');
const btnGuardar = document.getElementById('btn-guardar');
const btnActualizar = document.getElementById('btn-actualizar');
const btnEliminar = document.getElementById('btn-eliminar');
const formCliente = document.getElementById('form-cliente');

// Filtros
const filtroNombre = document.getElementById('filtro-nombre');
const filtroCorreo = document.getElementById('filtro-correo');
const filtroTelefono = document.getElementById('filtro-telefono');

// Datos seleccionados
let clienteSeleccionado = null;

//apiURL
const apiURL =  '/api/clientes/';

// Cargar clientes
function cargarClientes() {
    fetch(apiURL)
        .then(response => response.json())
        .then(clientes => {
            listaClientes.innerHTML = '';
            clientes.forEach(cliente => {
                const li = document.createElement('li');
                li.textContent = `${cliente.nombre} - ${cliente.correo} - ${cliente.telefono}`;
                li.dataset.id = cliente.id;
                li.addEventListener('click', () => seleccionarCliente(cliente));
                listaClientes.appendChild(li);
            });
        });
}

// Seleccionar cliente
function seleccionarCliente(cliente) {
    clienteSeleccionado = cliente;
    formCliente.nombre.value = cliente.nombre;
    formCliente.correo.value = cliente.correo;
    formCliente.telefono.value = cliente.telefono;

    btnActualizar.disabled = false;
    btnEliminar.disabled = false;
    btnGuardar.disabled = true;
}

// Crear cliente
btnCrear.addEventListener('click', () =>{
    btnGuardar.disabled = false;
    btnActualizar.disabled = true;
    btnEliminar.disabled = true;
    limpiarFormulario()
});

btnGuardar.addEventListener('click', () => {
    const nombre = formCliente.nombre.value;
    const correo = formCliente.correo.value;
    const telefono = formCliente.telefono.value;
    fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, telefono}),
    })
        .then(response => {
            if (response.ok) {
                alert('Cliente creado con éxito');
                limpiarFormulario()
                cargarClientes()
            } else {
                alert('Error al crear cliente');
            }
        }).catch(error => console.error('Error al crear cliente:', error));
});

// Actualizar cliente
btnActualizar.addEventListener('click', () => {
    if (!clienteSeleccionado) return;
    const clienteActualizado = {
        nombre: formCliente.nombre.value,
        correo: formCliente.correo.value,
        telefono: formCliente.telefono.value,
    };

    fetch(`/api/clientes/${clienteSeleccionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteActualizado),
    }).then(() => cargarClientes());
});

// Eliminar cliente
btnEliminar.addEventListener('click', () => {
    if (!clienteSeleccionado) return;

    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        fetch(`/api/clientes/${clienteSeleccionado.id}`, {
            method: 'DELETE',
        }).then(() => cargarClientes());
    }
});

// Filtros en la lista
function filtrarLista() {
    const nombreFiltro = filtroNombre.value.toLowerCase();
    const correoFiltro = filtroCorreo.value.toLowerCase();
    const telefonoFiltro = filtroTelefono.value.toLowerCase();

    Array.from(listaClientes.children).forEach(li => {
        const [nombre, correo, telefono] = li.textContent.split(' - ');
        li.style.display =
            nombre.toLowerCase().includes(nombreFiltro) &&
            correo.toLowerCase().includes(correoFiltro) &&
            telefono.toLowerCase().includes(telefonoFiltro)
                ? ''
                : 'none';
    });
}

//limpiar formulario
function limpiarFormulario(){
    formCliente.nombre.value = '';
    formCliente.correo.value = '';
    formCliente.telefono.value = '';
}

filtroNombre.addEventListener('input', filtrarLista);
filtroCorreo.addEventListener('input', filtrarLista);
filtroTelefono.addEventListener('input', filtrarLista);

// Inicialización
cargarClientes();
