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
        lista.innerHTML = '';
        productos.forEach(producto => {
            const item = document.createElement('li');
            item.textContent = `${producto.nombre} (${producto.referencia}) - ${producto.tipo}`;
            item.dataset.referencia = producto.referencia;
            lista.appendChild(item);

            item.addEventListener('click', () => {
                productoAlmacenado = producto
                document.getElementById('referencia').value = producto.referencia;
                document.getElementById('nombre').value = producto.nombre;
                document.getElementById('stock').value = producto.cantidad;
                document.getElementById('precio-compra').value = producto.precio_compra;
            });
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

    btnRegistrar.addEventListener('click', async () =>{

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

        }).catch(error => console.error('Error al registrar salida de inventario:', error));

    })

    // Listeners para búsqueda
    document.getElementById('producto-busqueda').addEventListener('input', (e) => {
        buscarProductos(e.target.value);
    });

    obtenerNuevaFactura();

})