//botones
const btnCrearEmpleado = document.getElementById('crear-empleado');
const btnActualizarEmpleado = document.getElementById('actualizar-empleado');
const btnEliminarEmpleado = document.getElementById('eliminar-empleado');
const btnGuardarEmpleado = document.getElementById('guardar-empleado');

//formulario
const formEmpleados = document.getElementById('formulario-empleado');

//listas
const listaEmpleados = document.getElementById('tabla-empleados');

//filtros
const filtroNombreEmpleados = document.getElementById('filtro-nombre-empleado');

//Datos seleccionados
let empleadoSeleccionado = null;

//apiURL
const apiURL = '/api/empleados/';

//cargar empleados
function cargarEmpleados(){
    fetch(apiURL)
    .then(response => response.json())
    .then(empleados =>{
        empleados.forEach(empleado =>{
            //const li = document.createElement('li');
            //li.textContent = `${empleado.nombre} - ${empleado.cargo}`;
            const li = document.createElement('tr');
            li.innerHTML =`
            <td>${empleado.nombre}</td>
            <td>${empleado.cargo}</td>
            `
            li.dataset.id = empleado.id;
            li.addEventListener('click', () => seleccionarEmpleado(empleado));
            listaEmpleados.appendChild(li)
        });
    });
}
//seleccionar empleado
function seleccionarEmpleado(empleado){
    empleadoSeleccionado = empleado;
    formEmpleados.nombre.value = empleado.nombre;
    formEmpleados.cargo.value = empleado.cargo;
    
    btnActualizarEmpleado.disabled = false;
    btnEliminarEmpleado.disabled = false;
    btnGuardarEmpleado.disabled = true;
}
// Crear empleado
btnCrearEmpleado.addEventListener('click', () =>{
    btnActualizarEmpleado.disabled = true;
    btnEliminarEmpleado.disabled = true;
    btnGuardarEmpleado.disabled = false;
    //limpiarFormulario()
});
//limpiar formulario
function limpiarFormulario(){
    formEmpleados.nombre.value = '';
    formEmpleados.cargo.value = '';
}
//guardar empleado
btnGuardarEmpleado.addEventListener('click', () => {
    
    const cargo = formEmpleados.cargo.value;
    const nombre = formEmpleados.nombre.value;
    fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, cargo}),
    })
        .then(response => {
            if (response.ok) {
                alert('Empleado creado con éxito');
                limpiarFormulario()
                cargarEmpleados()
            } else {
                alert('Error al crear empleado');
            }
        }).catch(error => console.error('Error al crear empleado:', error));
});
// Actualizar empleado
btnActualizarEmpleado.addEventListener('click', () => {
    if (!empleadoSeleccionado) return;
    const empleadoActualizado = {
        nombre: formEmpleados.nombre.value,
        cargo: formEmpleados.cargo.value,
    };
    fetch(`/api/empleados/${clienteSeleccionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empleadoActualizado),
    }).then(() => cargarEmpleados());
});
// Eliminar empleado
btnEliminarEmpleado.addEventListener('click', () => {
    if (!empleadoSeleccionado) return;

    if (confirm('¿Estás seguro de eliminar este empleado?')) {
        fetch(`/api/empleados/${empleadoSeleccionado.id}`, {
            method: 'DELETE',
        }).then(() => cargarEmpleados());
    }
});
// Filtros en la lista
function filtrarListaEmpleados() {
    const nombreFiltro = filtroNombreEmpleados.value.toLowerCase();
    Array.from(listaEmpleados.children).forEach(li => {
        const [nombre] = li.textContent.split(' - ');
        li.style.display =
            nombre.toLowerCase().includes(nombreFiltro)
                ? ''
                : 'none';
    });
}

filtroNombreEmpleados.addEventListener('input', filtrarListaEmpleados)

//inicialización
cargarEmpleados();
