//botones
const btnCrearProveedor = document.getElementById('crear')
const btnActualizarProveedor = document.getElementById('actualizar')
const btnEliminarProveedor = document.getElementById('eliminar')
const btnGuardarProveedor = document.getElementById('guardar')

//formulario
const formProveedor = document.getElementById('form_proveedor');

//listas
const listaProveedores= document.getElementById('tabla-proveedores');

//filtros
const filtroNombreProveedores = document.getElementById('filtro_nombre');

//Datos seleccionados
let proveedorSeleccionado = null

//apiURL
const apiURL = '/api/proveedores/';

//cargar proveedores
function cargarProveedores(){
    fetch(apiURL)
    .then(response => response.json())
    .then(proveedores =>{
        listaProveedores.innerHTML = '';
        proveedores.forEach(proveedor =>{
            const li = document.createElement('tr');
            li.innerHTML =`
            <td>${proveedor.nombre}</td>
            <td>${proveedor.contacto}</td>
            <td>${proveedor.telefono}</td>
            `
            li.dataset.id = proveedor.id;
            li.addEventListener('click', () => seleccionarProveedor(proveedor));
            listaProveedores.appendChild(li);
        });
    });
}
//seleccionar proveedor
function seleccionarProveedor(proveedor){
    proveedorSeleccionado = proveedor;
    formProveedor.nombre.value = proveedor.nombre;
    formProveedor.contacto.value = proveedor.contacto;
    formProveedor.telefono.value = proveedor.telefono;

    btnActualizarProveedor.disabled = false;
    btnEliminarProveedor.disabled = false;
    btnGuardarProveedor.disabled = true;
}
// Crear proveedor
btnCrearProveedor.addEventListener('click', () =>{
    btnActualizarProveedor.disabled = true;
    btnEliminarProveedor.disabled = true;
    btnGuardarProveedor.disabled = false;
    limpiarFormulario()
});

//guardar proveedor
btnGuardarProveedor.addEventListener('click', () => {
    const nombre = formProveedor.nombre.value;
    const contacto = formProveedor.contacto.value;
    const telefono = formProveedor.telefono.value;
    fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, contacto, telefono}),
    })
        .then(response => {
            if (response.ok) {
                alert('Proveedor creado con éxito');
                cargarProveedores()
                limpiarFormulario()
            } else {
                alert('Error al crear proveedor');
            }
        }).catch(error => console.error('Error al crear proveedor:', error));
});
// Actualizar proveedor
btnActualizarProveedor.addEventListener('click', () => {
    if (!proveedorSeleccionado) return;
    const proveedorActualizado = {
        nombre: formProveedor.nombre.value,
        contacto: formProveedor.contacto.value,
        telefono: formProveedor.telefono.value,
    };
    fetch(`/api/proveedores/${clienteSeleccionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proveedorActualizado),
    }).then(() => cargarProveedores());
});
// Eliminar proveedor
btnEliminarProveedor.addEventListener('click', () => {
    if (!proveedorSeleccionado) return;

    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
        fetch(`/api/proveedores/${proveedorSeleccionado.id}`, {
            method: 'DELETE',
        }).then(() => cargarProveedores());
    }
});
// Filtros en la lista
function filtrarListaProveedores() {
    const nombreFiltro = filtroNombreProveedores.value.toLowerCase();

    Array.from(listaProveedores.children).forEach(li => {
        const [nombre] = li.textContent.split(' - ');
        li.style.display =
            nombre.toLowerCase().includes(nombreFiltro)
                ? ''
                : 'none';
    });
}
//limpiar formulario
function limpiarFormulario(){
    formProveedor.nombre.value = '';
    formProveedor.contacto.value = '';
    formProveedor.telefono.value = '';
}

filtroNombreProveedores.addEventListener('input', filtrarListaProveedores)

//inicialización
cargarProveedores();