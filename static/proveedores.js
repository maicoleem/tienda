document.addEventListener('DOMContentLoaded', () => {
    //botones
    const btnCrearProveedor = document.getElementById('crear')
    const btnActualizarProveedor = document.getElementById('actualizar')
    const btnEliminarProveedor = document.getElementById('eliminar')
    const btnGuardarProveedor = document.getElementById('guardar')

    //formulario
    const formProveedor = document.getElementById('form_proveedor');

    //listas
    const listaProveedores = document.getElementById('tabla-proveedores');
    const itemCountDiv = document.getElementById('item-count')

    //filtros
    const columnFilters = Array.from(document.querySelectorAll('.column-filters input'));

    //Datos seleccionados
    let proveedorSeleccionado = null

    //apiURL
    const apiURL = '/api/proveedores/';
    let proveedoresData = []
    let currentSortColumn = null;
    let sortDirection = 'asc';
    //cargar proveedores
    function cargarProveedores() {
        fetch(apiURL)
            .then(response => response.json())
            .then(proveedores => {
                proveedoresData = proveedores
               renderTable(proveedoresData)
               updateItemCount(proveedoresData);
            });
    }
    const renderTable = (data) => {
         listaProveedores.innerHTML = '';
         data.forEach(proveedor => {
            const li = document.createElement('tr');
            li.innerHTML = `
            <td>${proveedor.nombre}</td>
            <td>${proveedor.contacto}</td>
            <td>${proveedor.detalle}</td>
            `
            li.dataset.id = proveedor.id;
            li.addEventListener('click', () => seleccionarProveedor(proveedor));
             listaProveedores.appendChild(li);
         });
    }
     const updateItemCount = (data) => {
        itemCountDiv.textContent = `Número de items: ${data.length}`;
    };
    //seleccionar proveedor
    function seleccionarProveedor(proveedor) {
        proveedorSeleccionado = proveedor;
        formProveedor.nombre.value = proveedor.nombre;
        formProveedor.contacto.value = proveedor.contacto;
        formProveedor.detalle.value = proveedor.detalle;

        btnActualizarProveedor.disabled = false;
        btnEliminarProveedor.disabled = false;
        btnGuardarProveedor.disabled = true;
    }
    // Crear proveedor
    btnCrearProveedor.addEventListener('click', () => {
        btnActualizarProveedor.disabled = true;
        btnEliminarProveedor.disabled = true;
        btnGuardarProveedor.disabled = false;
        limpiarFormulario()
    });

    //guardar proveedor
    btnGuardarProveedor.addEventListener('click', () => {
        const nombre = formProveedor.nombre.value;
        const contacto = formProveedor.contacto.value;
        const detalle = formProveedor.detalle.value;
        fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, contacto, detalle }),
        })
            .then(response => {
                if (response.ok) {
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
            detalle: formProveedor.detalle.value,
        };
        fetch(`/api/proveedores/${proveedorSeleccionado.id}`, {
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
    function filtrarTablaProveedores() {
        const columnFiltersValues = columnFilters.reduce((acc, input) => {
            acc[input.dataset.column] = input.value.toLowerCase();
            return acc;
        }, {});
        const filteredData = proveedoresData.filter(proveedor => {
            return Object.keys(columnFiltersValues).every(column => {
                 if(!columnFiltersValues[column]){
                    return true;
                }
               const value = String(proveedor[column]).toLowerCase();
                return value.includes(columnFiltersValues[column]);
             })
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
        const sortedData = [...proveedoresData].sort((a, b) => {
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
        updateSortIndicators()
    }
     function updateSortIndicators() {
        const thElements = document.querySelectorAll('.proveedor-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }
    //limpiar formulario
    function limpiarFormulario() {
        formProveedor.nombre.value = '';
        formProveedor.contacto.value = '';
        formProveedor.detalle.value = '';
    }

    columnFilters.forEach(input => {
        input.addEventListener('input', filtrarTablaProveedores)
    })
    document.querySelectorAll('.proveedor-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    })
    //inicialización
    cargarProveedores();
});