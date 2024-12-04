document.addEventListener('DOMContentLoaded', ()=>{

const filtroBodega = document.getElementById('filtro-bodega');
const filtroProducto = document.getElementById('filtro-producto');
const tbody = document.getElementById('tabla-almacenamiento');

const cargarAlmacenamiento = async() => {
    try{
        const response = await fetch('/api/almacenamiento/');
        if(!response.ok){
            throw new Error('Error al obtener registros: ${response.statusText}')
        }
        const almacenamientos = await response.json();
        tbody.innerHTML = '';
        almacenamientos.forEach(almacenamiento =>{
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
            //fila.addEventListener('click', () => nameFunction(almacenamiento));
            tbody.appendChild(fila)
        });
    } catch (error){
        console.error(error)
        alert('Hubo un problema al cargar los almacenamientos. Consulte la consola para más detalles.')
    }
}

function filtrarTablaAlmacen() {
    const filtrarBodega = filtroBodega.value.toLowerCase();
    const filtrarProducto = filtroProducto.value.toLowerCase();

    Array.from(tbody.children).forEach(li => {
          // Separar el contenido por líneas
          const lineas = li.textContent.split('\n').map(linea => linea.trim());
          const bodega = lineas[1];
          const producto = lineas[3];
          li.style.display =
              (bodega.toLowerCase().includes(filtrarBodega) &&
               producto.toLowerCase().includes(filtrarProducto))
                  ? ''
                  : 'none';
  
          console.log(bodega, producto);
    });
}


filtroBodega.addEventListener('input', filtrarTablaAlmacen)
filtroProducto.addEventListener('input', filtrarTablaAlmacen)
cargarAlmacenamiento()

})