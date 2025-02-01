document.addEventListener('DOMContentLoaded', () =>{

    const factura = document.getElementById('factura');
    const btnRegistrar = document.getElementById('registrar');
    const amountPerdida = document.getElementById('cantidad');
    let productoAlmacenado = null;

    // Función para buscar productos
    const buscarProductos = async (termino) => {
        const response = await fetch(`/api/almacenamiento?q=${encodeURIComponent(termino)}`);
        const productos = await response.json();
        const lista = document.getElementById('producto-lista');
         lista.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos resultados
         productos.forEach(producto => {
             const fila = document.createElement('tr');
            fila.innerHTML = `
                 <td>${producto.referencia}</td>
                <td>${producto.nombre}</td>
                <td>${producto.tipo}</td>
                 <td>${producto.cantidad}</td>
                `;
             fila.dataset.referencia = producto.referencia;
           fila.addEventListener('click', () => {
                productoAlmacenado = producto
                document.getElementById('referencia').value = producto.referencia;
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('stock').value = producto.cantidad;
                document.getElementById('precio-compra').value = producto.precio_compra;
            });
            lista.appendChild(fila);
        });
    };

    const obtenerNuevaFactura = async () => {
        try {
            // Obtener el valor del prefijo ingresado en un input
            const prefijo = "OBSOLETO";

            if (!prefijo) {
                alert("Por favor, ingrese un prefijo para buscar.");
                return;
            }

            // Hacer la solicitud al backend con el prefijo como parámetro
            const response = await fetch(`/api/factura-max?prefijo=${encodeURIComponent(prefijo)}`);
            const datos = await response.json();

            if (response.ok) {
                // Mostrar el nuevo valor en el input de factura-nueva
                factura.value = datos.nueva_factura;
            } else {
                console.error("Error:", datos.error);
                alert(`Error: ${datos.error}`);
            }
        } catch (error) {
            console.error("Error al obtener la nueva factura:", error);
            alert("Hubo un problema al obtener la nueva factura. Consulte la consola para más detalles.");
        }
    };

    btnRegistrar.addEventListener('click', async (e) =>{
           e.preventDefault()
        const data = {
            id: productoAlmacenado.id,
            referencia: productoAlmacenado.referencia,
            cantidad_perdida: amountPerdida.value,
            precio_compra: productoAlmacenado.precio_compra,
            factura: factura.value
        };
        await fetch('/api/almacenamiento/producto-perdida',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(()=>{
            alert("Registro guardado")
        }).catch(error => console.error('Error al registrar salida de inventario:', error));

    })

    // Listeners para búsqueda
    document.getElementById('producto-busqueda').addEventListener('input', (e) => {
        buscarProductos(e.target.value);
    });

    obtenerNuevaFactura();

})