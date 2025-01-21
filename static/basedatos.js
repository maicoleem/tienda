
document.addEventListener('DOMContentLoaded', () =>{
    let nueva_factura = null;
    document.getElementById('upload-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById('excel-file');
        if (!fileInput.files[0]) {
            alert('Por favor selecciona un archivo');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
    
        try {
            const response = await fetch('/basedatos/api/cargar_excel_temp', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const error = await response.json();
                alert(`Error al cargar archivo: ${error.message}`);
                return;
            }
    
            const { rows, socio, proveedor } = await response.json();
            let aporteTotal = 0;
    
            // Registrar aporte social
            rows.forEach(row => {
                aporteTotal += row.cantidad * row.precio_compra;
            });
    
            await fetch('/api/aportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identificacion: socio.id,
                    nombre: socio.nombre,
                    efectivo: aporteTotal,
                    banco: 0,
                    observaciones: 'Aporte por carga de productos',
                    factura: String(nueva_factura),
                    codigo: '3115'
                }),
            });
    
            // Registrar productos
            // Registrar productos
            for (const row of rows) {
                // Calcular ganancias y efectivo
                const ganancia = row.precio_venta - row.precio_compra; // Precio venta - Precio compra
                const efectivo = row.cantidad * row.precio_compra; // Cantidad * Precio compra

                await fetch('/api/libro-registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fecha: new Date().toISOString(),
                        empleado: 'excel',
                        proveedor: proveedor.nombre,
                        cliente: '',
                        movimiento: 'Entrada',
                        referencia: row.referencia,
                        nombre: row.nombre,
                        tipo: row.tipo,
                        bodega: row.bodega,
                        cantidad: row.cantidad,
                        precio_compra: row.precio_compra,
                        precio_venta: row.precio_venta,
                        ganancia: ganancia, // Enviar la ganancia calculada
                        observaciones: 'Carga masiva desde Excel',
                        banco: 0,
                        efectivo: efectivo, // Enviar el valor calculado para efectivo
                        iva: 0,
                        factura: 'EXCEL',
                        credito: 0
                    }),
                });
            }

    
            alert(`Productos y aportes registrados correctamente. Aporte total: $${aporteTotal}`);
        } catch (error) {
            console.error('Error en el proceso:', error);
            alert('Ocurrió un error al procesar los datos.');
        }
    });

    const obtenerNuevaFactura = async () => {
        try {
            // Obtener el valor del prefijo ingresado en un input
            const prefijo = "APORTE";
    
            if (!prefijo) {
                alert("Por favor, ingrese un prefijo para buscar.");
                return;
            }
    
            // Hacer la solicitud al backend con el prefijo como parámetro
            const response = await fetch(`/api/factura-max?prefijo=${encodeURIComponent(prefijo)}`);
            const datos = await response.json();
    
            if (response.ok) {
                // Mostrar el nuevo valor en el input de factura-nueva
                nueva_factura = datos.nueva_factura;
            } else {
                console.error("Error:", datos.error);
                alert(`Error: ${datos.error}`);
            }
        } catch (error) {
            console.error("Error al obtener la nueva factura:", error);
            alert("Hubo un problema al obtener la nueva factura. Consulte la consola para más detalles.");
        }
    };

    obtenerNuevaFactura();

})

