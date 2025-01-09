document.addEventListener("DOMContentLoaded", () => {
    // Fetch data from API
    fetch('/api/resultados')
        .then(response => response.json())
        .then(data => {
            // Render tables
            renderTable('tabla-ingresos', data.ingresos, data.total_ingresos);
            renderTable('tabla-costos', data.costos, data.total_costos);
            renderTable('tabla-gastos', data.gastos, data.total_gastos);

            // Render summary
            document.getElementById('utilidad-operacional').textContent = data.utilidad_operacional.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
            document.getElementById('utilidad-neta').textContent = data.utilidad_neta.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function renderTable(tableId, accounts, total) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const totalCell = document.getElementById(`total-${tableId.split('-')[1]}`);

    accounts.forEach(account => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${account.cuenta}</td>
            <td>${account.total_debe.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
            <td>${account.total_haber.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
            <td>${account.saldo_neto.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</td>
        `;

        tbody.appendChild(row);
    });

    totalCell.textContent = total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}
