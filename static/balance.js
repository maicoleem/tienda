document.addEventListener('DOMContentLoaded', cargarBalance);

// Función para cargar los datos del balance general
async function cargarBalance() {
    const response = await fetch('/api/balance');
    const balance = await response.json();

    // Mostrar el resumen del balance
    document.getElementById('total-activos').textContent = balance.resumen.activos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('total-pasivos').textContent = balance.resumen.pasivos.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
    document.getElementById('total-patrimonio').textContent = balance.resumen.patrimonio.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });

    // Mostrar el detalle de las cuentas
    const tbody = document.getElementById('tabla-detalle-cuentas');
    tbody.innerHTML = ''; // Limpiar la tabla
    balance.detalles.forEach(cuenta => {
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
