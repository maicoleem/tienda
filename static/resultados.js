document.addEventListener('DOMContentLoaded', cargarResultados);

// Función para cargar los datos del estado de resultados
async function cargarResultados() {
    const response = await fetch('/api/resultados');
    const estadoResultados = await response.json();

    // Mostrar el resumen
    document.getElementById('total-ingresos').textContent = estadoResultados.resumen.ingresos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('total-costos').textContent = estadoResultados.resumen.costos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('total-gastos').textContent = estadoResultados.resumen.gastos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

    // Mostrar el detalle de las cuentas
    const tbody = document.getElementById('tabla-detalle-cuentas');
    tbody.innerHTML = ''; // Limpiar la tabla
    estadoResultados.detalles.forEach(cuenta => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${cuenta.codigo}</td>
            <td>${cuenta.nombre}</td>
            <td>${cuenta.total_debitos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
            <td>${cuenta.total_creditos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
            <td>${cuenta.saldo.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
        `;
        tbody.appendChild(fila);
    });
}
