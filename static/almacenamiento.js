document.addEventListener('DOMContentLoaded', ()=>{

const cargarAlmacenamiento = async() => {
    try{
        const response = await fetch('/api/almacenamiento/');
        if(!response.ok){
            throw new Error('Error al obtener registros: ${response.statusText}')
        }
        const almacenamientos = await response.json();
        const tbody = document.getElementById('tabla-almacenamiento');
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
cargarAlmacenamiento()

})