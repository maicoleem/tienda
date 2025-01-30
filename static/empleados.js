document.addEventListener('DOMContentLoaded', () => {
    //botones
    const btnCrearEmpleado = document.getElementById('crear-empleado');
    const btnActualizarEmpleado = document.getElementById('actualizar-empleado');
    const btnEliminarEmpleado = document.getElementById('eliminar-empleado');
    const btnGuardarEmpleado = document.getElementById('guardar-empleado');

    //formulario
    const formEmpleados = document.getElementById('formulario-empleado');

    //listas
    const listaEmpleados = document.getElementById('tabla-empleados');
    const itemCountDiv = document.getElementById('item-count')
    //filtros
   const columnFilters = Array.from(document.querySelectorAll('.column-filters input'));
    //Datos seleccionados
    let empleadoSeleccionado = null;
    let empleadosData = [];
    let currentSortColumn = null;
    let sortDirection = 'asc';
    //apiURL
    const apiURL = '/api/empleados/';

    //cargar empleados
    function cargarEmpleados() {
        fetch(apiURL)
            .then(response => response.json())
            .then(empleados => {
                 empleadosData = empleados;
                 renderTable(empleadosData)
                updateItemCount(empleadosData)
            });
    }
   const renderTable = (data) => {
        listaEmpleados.innerHTML = '';
       data.forEach(empleado => {
           const li = document.createElement('tr');
            li.innerHTML = `
            <td>${empleado.nombre}</td>
            <td>${empleado.cargo}</td>
            <td>${empleado.salario}</td>
            `
            li.dataset.id = empleado.id;
            li.addEventListener('click', () => seleccionarEmpleado(empleado));
            listaEmpleados.appendChild(li);
        });
   }
      const updateItemCount = (data) => {
        itemCountDiv.textContent = `Número de items: ${data.length}`;
    };
    //seleccionar empleado
    function seleccionarEmpleado(empleado) {
        empleadoSeleccionado = empleado;
        formEmpleados.nombre.value = empleado.nombre;
        formEmpleados.cargo.value = empleado.cargo;
        formEmpleados.salario.value = empleado.salario;
        btnActualizarEmpleado.disabled = false;
        btnEliminarEmpleado.disabled = false;
        btnGuardarEmpleado.disabled = true;
    }
    // Crear empleado
    btnCrearEmpleado.addEventListener('click', () => {
        btnActualizarEmpleado.disabled = true;
        btnEliminarEmpleado.disabled = true;
        btnGuardarEmpleado.disabled = false;
        limpiarFormulario()
    });
    //limpiar formulario
    function limpiarFormulario() {
        formEmpleados.nombre.value = '';
        formEmpleados.cargo.value = '';
          formEmpleados.salario.value = 0;
    }
    //guardar empleado
    btnGuardarEmpleado.addEventListener('click', () => {
        const cargo = formEmpleados.cargo.value;
        const nombre = formEmpleados.nombre.value;
        const salario = formEmpleados.salario.value
        fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, cargo, salario }),
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
             salario: formEmpleados.salario.value,
        };
        fetch(`/api/empleados/${empleadoSeleccionado.id}`, {
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
         const columnFiltersValues = columnFilters.reduce((acc, input) => {
            acc[input.dataset.column] = input.value.toLowerCase();
            return acc;
        }, {});
        const filteredData = empleadosData.filter(empleado => {
            return Object.keys(columnFiltersValues).every(column => {
                if(!columnFiltersValues[column]){
                  return true
                }
                const value = String(empleado[column]).toLowerCase();
                 return value.includes(columnFiltersValues[column])
            });
        });
        renderTable(filteredData)
       updateItemCount(filteredData)
    }
    function sortTable(column) {
        if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            sortDirection = 'asc';
        }
        const sortedData = [...empleadosData].sort((a, b) => {
             const aValue = a[column];
            const bValue = b[column];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                 return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        renderTable(sortedData);
       updateSortIndicators()
    }
    function updateSortIndicators() {
        const thElements = document.querySelectorAll('.empleado-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    columnFilters.forEach(input => {
        input.addEventListener('input', filtrarListaEmpleados)
    })
    document.querySelectorAll('.empleado-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    })
    //inicialización
    cargarEmpleados();
});