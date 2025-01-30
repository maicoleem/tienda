document.addEventListener('DOMContentLoaded', () => {

    const filtroBodega = document.getElementById('filtro-bodega');
    const tbody = document.getElementById('tabla-almacenamiento');
    const itemCountDiv = document.getElementById('item-count')
    const columnFilters = Array.from(document.querySelectorAll('.column-filters input'))

    let almacenamientosData = [];
    let currentSortColumn = null;
    let sortDirection = 'asc';
    let allBodegas = new Set()

    const cargarAlmacenamiento = async() => {
        try{
            const response = await fetch('/api/almacenamiento/');
            if(!response.ok){
                throw new Error(`Error al obtener registros: ${response.statusText}`)
            }
            almacenamientosData = await response.json();
           
            almacenamientosData.forEach(almacenamiento =>{
                allBodegas.add(almacenamiento.bodega)
                
            })
            actualizarFiltroBodega();
            renderTable(almacenamientosData)
            updateItemCount(almacenamientosData);
        } catch (error){
            console.error(error)
            alert('Hubo un problema al cargar los almacenamientos. Consulte la consola para más detalles.')
        }
    }
    
    const actualizarFiltroBodega = () =>{
        allBodegas.forEach(bodega => {
            const option = document.createElement('option');
            option.value = bodega;
            option.textContent = bodega;
            filtroBodega.appendChild(option);
        });
    }

    const renderTable = (data) => {
        tbody.innerHTML = '';
        data.forEach(almacenamiento =>{
             const fila = document.createElement('tr');
                fila.innerHTML=`
                    <td>${almacenamiento.bodega}</td>
                    <td>${almacenamiento.referencia}</td>
                    <td>${almacenamiento.nombre}</td>
                    <td>${almacenamiento.tipo}</td>
                    <td>${almacenamiento.cantidad}</td>
                    <td>${almacenamiento.precio_compra.toFixed(2)}</td>
                    <td>${almacenamiento.precio_venta.toFixed(2)}</td>
                `;
            fila.dataset.id = almacenamiento.id
            tbody.appendChild(fila);
        });
    }
   
   const updateItemCount = (data) => {
      const bodegaValue = filtroBodega.value.toLowerCase()
      let filteredItems;
      if(bodegaValue === ''){
         filteredItems = data;
      }else{
          filteredItems = data.filter(item => item.bodega.toLowerCase() === bodegaValue)
      }
    itemCountDiv.textContent = `Número de items: ${filteredItems.length}`;
    };

    function filtrarTablaAlmacen() {
        const filtroBodegaValue = filtroBodega.value.toLowerCase();
        const columnFiltersValues = columnFilters.reduce((acc, input) =>{
            acc[input.dataset.column] = input.value.toLowerCase();
            return acc;
        }, {});
        const filteredData = almacenamientosData.filter(almacenamiento => {
             const bodegaMatch = filtroBodegaValue === '' || almacenamiento.bodega.toLowerCase().includes(filtroBodegaValue);
            const columnMatch = Object.keys(columnFiltersValues).every(column =>{
                if(!columnFiltersValues[column]){
                  return true;
                }
                const value = String(almacenamiento[column]).toLowerCase()
                 return value.includes(columnFiltersValues[column])
            });
              return bodegaMatch && columnMatch;
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

        const sortedData = [...almacenamientosData].sort((a, b) => {
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
        updateSortIndicators();
    }
   
    function updateSortIndicators() {
        const thElements = document.querySelectorAll('.almacen-table thead th');
        thElements.forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (th.dataset.column === currentSortColumn) {
                th.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }
     
    document.querySelectorAll('.almacen-table thead th').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.column))
    });
   columnFilters.forEach(input => {
     input.addEventListener('input', filtrarTablaAlmacen)
    })
    filtroBodega.addEventListener('change', filtrarTablaAlmacen);
    cargarAlmacenamiento()
});