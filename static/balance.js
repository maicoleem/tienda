document.addEventListener('DOMContentLoaded', cargarBalance);

// Función para cargar los datos del balance general
async function cargarBalance() {
    fetch('/api/balance')
    .then(response => response.json())
    .then(data => {
        const { cuentas, totales } = data;

        // Populate the sections
        const activosList = document.getElementById('lista-activos');
        const pasivosList = document.getElementById('lista-pasivos');
        const patrimonioList = document.getElementById('lista-patrimonio');

        cuentas.forEach(cuenta => {
            const li = document.createElement('li');
            li.textContent = `${cuenta.cuenta} (Debe: ${cuenta.total_debe}, Haber: ${cuenta.total_haber}, Neto: ${cuenta.saldo_neto})`;

            if (cuenta.codigo_cuenta.startsWith('1')) {
                activosList.appendChild(li);
            } else if (cuenta.codigo_cuenta.startsWith('2')) {
                pasivosList.appendChild(li);
            } else if (cuenta.codigo_cuenta.startsWith('3')) {
                patrimonioList.appendChild(li);
            }
        });

        // Add totals
        document.getElementById('total-activos').textContent = `Total Activos: ${totales.total_activo}`;
        document.getElementById('total-pasivos').textContent = `Total Pasivos: ${totales.total_pasivo}`;
        document.getElementById('total-patrimonio').textContent = `Total Patrimonio: ${totales.total_patrimonio}`;
    })
    .catch(error => console.error('Error fetching balance general:', error));
}
