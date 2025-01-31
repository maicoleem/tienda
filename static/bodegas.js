const apiUrl = '/api/bodegas/';
let selectedBodegaId = null;
let bodegasData = [];
let currentSortColumn = null;
let sortDirection = 'asc';
document.addEventListener('DOMContentLoaded', () => {
    fetchBodegas();

    document.getElementById('crearBtn').addEventListener('click', () => {
        resetForm();
        toggleButtons(true, false, false);
    });

    document.getElementById('guardarBtn').addEventListener('click', () => {
        const nuevaBodega = getFormData();
        if (validateForm(nuevaBodega)) {
            crearBodega(nuevaBodega);
            resetForm();
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('actualizarBtn').addEventListener('click', () => {
        const bodegaActualizada = getFormData();
        if (validateForm(bodegaActualizada)) {
            actualizarBodega(selectedBodegaId, bodegaActualizada);
        } else {
            alert('Por favor, complete todos los campos.');
        }
    });

    document.getElementById('eliminarBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar esta bodega?')) {
            eliminarBodega(selectedBodegaId);
            resetForm();
        }
    });
   const columnFilters = Array.from(document.querySelectorAll('.column-filters input'));
   columnFilters.forEach(input => {
        input.addEventListener('input', filterBodegas)
    })
      document.querySelectorAll('.bodega-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    })
});

function fetchBodegas() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            bodegasData = data;
            renderBodegaList(bodegasData)
            updateItemCount(bodegasData);
        });
}

function renderBodegaList(bodegas) {
    const bodegaList = document.getElementById('bodegaList');
    bodegaList.innerHTML = '';
    bodegas.forEach(bodega => {
        const li = document.createElement('tr');
         li.innerHTML = `
            <td>${bodega.codigo}</td>
            <td>${bodega.nombre}</td>
        `;
        li.dataset.id = bodega.id;
        li.addEventListener('click', () => selectBodega(bodega));
        bodegaList.appendChild(li);
    });
}
 const updateItemCount = (data) => {
        const itemCountDiv = document.getElementById('item-count')
        itemCountDiv.textContent = `Número de items: ${data.length}`;
    };
function selectBodega(bodega) {
    selectedBodegaId = bodega.id;
    document.getElementById('codigo').value = bodega.codigo;
    document.getElementById('nombre').value = bodega.nombre;
    document.getElementById('descripcion').value = bodega.descripcion;
    toggleButtons(false, true, true);
}

function crearBodega(bodega) {
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodega),
    }).then(() => fetchBodegas());
}

function actualizarBodega(id, bodega) {
    fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodega),
    }).then(() => fetchBodegas());
}

function eliminarBodega(id) {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' }).then(() => fetchBodegas());
}

function getFormData() {
    return {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value
    };
}

function resetForm() {
    document.getElementById('codigo').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    selectedBodegaId = null;
}

function toggleButtons(guardar, actualizar, eliminar) {
    document.getElementById('guardarBtn').disabled = !guardar;
    document.getElementById('actualizarBtn').disabled = !actualizar;
    document.getElementById('eliminarBtn').disabled = !eliminar;
}
function filterBodegas() {
    const columnFiltersValues = Array.from(document.querySelectorAll('.column-filters input')).reduce((acc, input) => {
       acc[input.dataset.column] = input.value.toLowerCase();
       return acc;
   }, {});
   const filteredData = bodegasData.filter(bodega => {
       return Object.keys(columnFiltersValues).every(column => {
           if(!columnFiltersValues[column]){
               return true;
            }
             const value = String(bodega[column]).toLowerCase();
             return value.includes(columnFiltersValues[column]);
       });
   });
   renderBodegaList(filteredData);
   updateItemCount(filteredData)
}
 function sortTable(column) {
        if (currentSortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
             currentSortColumn = column;
            sortDirection = 'asc';
        }
         const sortedData = [...bodegasData].sort((a, b) => {
             const aValue = a[column];
            const bValue = b[column];

           if (typeof aValue === 'number' && typeof bValue === 'number') {
                 return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
             }
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        renderBodegaList(sortedData);
       updateSortIndicators();
    }
  function updateSortIndicators() {
        const thElements = document.querySelectorAll('.bodega-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                 th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
   }
function validateForm(bodega) {
    return bodega.codigo && bodega.nombre && bodega.descripcion;
}