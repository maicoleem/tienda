document.addEventListener('DOMContentLoaded', () => {
    let nueva_factura = null;
    const uploadForm = document.getElementById('upload-form');
    const downloadOdsBtn = document.getElementById('download-ods');
    const downloadSqlBtn = document.getElementById('download-sql');
    const sqlFileInput = document.getElementById('sql-file');
    const uploadSqlBtn = document.getElementById('upload-sql-btn');
    const odsFileInput = document.getElementById('ods-file');
    const uploadOdsBtn = document.getElementById('upload-ods-btn');
    const clearDbBtn = document.getElementById('clear-db')

    // Función para manejar errores en las respuestas
    const handleResponseError = async (response, message = 'Ocurrió un error') => {
        if (!response.ok) {
            const error = await response.json();
            alert(`${message}: ${error.message}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    };

    // Cargar Excel
    uploadForm.addEventListener('submit', async (event) => {
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
            await handleResponseError(response, 'Error al cargar archivo');
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


    // Descargar ODS
    downloadOdsBtn.addEventListener('click', async () => {
      try {
          const response = await fetch('/basedatos/api/download_ods');
          await handleResponseError(response, 'Error al descargar el archivo ODS');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'erp_data.ods';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error('Error al descargar el archivo ODS:', error);
          alert('Ocurrió un error al descargar el archivo ODS.');
      }
  });
    // Descargar SQL
    downloadSqlBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/basedatos/api/download_sql');
            await handleResponseError(response, 'Error al descargar el archivo SQL');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'backup.sql';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar el archivo SQL:', error);
            alert('Ocurrió un error al descargar el archivo SQL.');
        }
    });
    // Subir SQL
    uploadSqlBtn.addEventListener('click', async () => {
        if (!sqlFileInput.files[0]) {
            alert('Por favor selecciona un archivo SQL');
            return;
        }
        const formData = new FormData();
        formData.append('file', sqlFileInput.files[0]);

        try {
            const response = await fetch('/basedatos/api/upload_sql', {
                method: 'POST',
                body: formData,
            });
            await handleResponseError(response, 'Error al subir el archivo SQL');
            alert('Base de datos restaurada con éxito.');

        } catch (error) {
            console.error('Error al subir el archivo SQL:', error);
            alert('Ocurrió un error al subir el archivo SQL.');
        }
    });
     // Subir ODS
     uploadOdsBtn.addEventListener('click', async () => {
        if (!odsFileInput.files[0]) {
            alert('Por favor selecciona un archivo ODS');
            return;
        }
        const formData = new FormData();
        formData.append('file', odsFileInput.files[0]);

        try {
            const response = await fetch('/basedatos/api/upload_ods', {
                method: 'POST',
                body: formData,
            });
            await handleResponseError(response, 'Error al subir el archivo ODS');
            alert('Base de datos restaurada con éxito.');

        } catch (error) {
            console.error('Error al subir el archivo ODS:', error);
            alert('Ocurrió un error al subir el archivo ODS.');
        }
    });

      // Limpiar base de datos
      clearDbBtn.addEventListener('click', async () => {
        try {
          const response = await fetch('/basedatos/api/clear_db', {
            method: 'POST'
          });
          await handleResponseError(response, 'Error al limpiar la base de datos');
          alert('Base de datos limpiada con éxito');
        } catch (error) {
          console.error('Error al limpiar la base de datos:', error);
          alert('Ocurrió un error al limpiar la base de datos.');
        }
      });
});