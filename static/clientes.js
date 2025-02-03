document.addEventListener('DOMContentLoaded', () => {
    const listaClientes = document.getElementById('clientes-lista');
    const btnCrear = document.getElementById('btn-crear');
    const btnGuardar = document.getElementById('btn-guardar');
    const btnActualizar = document.getElementById('btn-actualizar');
    const btnEliminar = document.getElementById('btn-eliminar');
    const formCliente = document.getElementById('form-cliente');
    const itemCountDiv = document.getElementById('item-count')
    // Filtros
     const columnFilters = Array.from(document.querySelectorAll('.column-filters input'));
    // Datos seleccionados
    let clienteSeleccionado = null;
    let clientesData = []
    let currentSortColumn = null;
    let sortDirection = 'asc';
    //apiURL
    const apiURL = '/api/clientes/';

    // Cargar clientes
    function cargarClientes() {
        fetch(apiURL)
            .then(response => response.json())
            .then(clientes => {
               clientesData = clientes;
              renderTable(clientesData)
              updateItemCount(clientesData)
            });
    }
     const renderTable = (data) => {
         listaClientes.innerHTML = '';
         data.forEach(cliente => {
             const li = document.createElement('tr');
             li.innerHTML = `
                  <td>${cliente.nombre}</td>
                  <td>${cliente.correo}</td>
                   <td>${cliente.telefono}</td>
                 `;
             li.dataset.id = cliente.id;
             li.addEventListener('click', () => seleccionarCliente(cliente));
            listaClientes.appendChild(li);
         });
    }
      const updateItemCount = (data) => {
        itemCountDiv.textContent = `Número de items: ${data.length}`;
    };
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
    btnCrear.addEventListener('click', () => {
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
            body: JSON.stringify({ nombre, correo, telefono }),
        })
            .then(response => {
                if (response.ok) {
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
        const columnFiltersValues = columnFilters.reduce((acc, input) => {
            acc[input.dataset.column] = input.value.toLowerCase();
            return acc;
        }, {});
        const filteredData = clientesData.filter(cliente => {
            return Object.keys(columnFiltersValues).every(column => {
                if(!columnFiltersValues[column]){
                  return true;
                }
                const value = String(cliente[column]).toLowerCase();
                return value.includes(columnFiltersValues[column])
            });
         });
          renderTable(filteredData);
          updateItemCount(filteredData)
    }
     function sortTable(column) {
        if (currentSortColumn === column) {
             sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = column;
            sortDirection = 'asc';
        }
        const sortedData = [...clientesData].sort((a, b) => {
            const aValue = a[column];
            const bValue = b[column];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
            }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
             return 0;
        });
        renderTable(sortedData)
       updateSortIndicators();
    }
      function updateSortIndicators() {
        const thElements = document.querySelectorAll('.cliente-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }
    //limpiar formulario
    function limpiarFormulario() {
        formCliente.nombre.value = '';
        formCliente.correo.value = '';
        formCliente.telefono.value = '';
    }
     columnFilters.forEach(input => {
         input.addEventListener('input', filtrarLista)
    })
    document.querySelectorAll('.cliente-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    })
    // Inicialización
    cargarClientes();
});