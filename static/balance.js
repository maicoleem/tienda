document.addEventListener('DOMContentLoaded', cargarBalance);
let balanceData = {};
// Función para cargar los datos del balance general
async function cargarBalance() {
    fetch('/api/balance')
        .then(response => response.json())
        .then(data => {
           balanceData = data;
            const { cuentas, totales } = data;
             renderBalance(cuentas, totales);
        })
        .catch(error => console.error('Error fetching balance general:', error));
}
function renderBalance(cuentas, totales) {
    // Populate the sections
    const activosList = document.getElementById('lista-activos');
    const pasivosList = document.getElementById('lista-pasivos');
    const patrimonioList = document.getElementById('lista-patrimonio');
    activosList.innerHTML = '';
    pasivosList.innerHTML = '';
    patrimonioList.innerHTML = '';
     cuentas.forEach(cuenta => {
         const li = document.createElement('tr');
         li.innerHTML = `
           <td>${cuenta.cuenta}</td>
            <td>${cuenta.total_debe}</td>
            <td>${cuenta.total_haber}</td>
             <td>${cuenta.saldo_neto}</td>
           `;
            if (cuenta.codigo_cuenta.startsWith('1')) {
                 activosList.appendChild(li);
            } else if (cuenta.codigo_cuenta.startsWith('2')) {
                pasivosList.appendChild(li);
            } else if (cuenta.codigo_cuenta.startsWith('3')) {
                patrimonioList.appendChild(li);
           }
     });
     // Add totals
     document.getElementById('title-activos').innerHTML = `Activos <p class='total'>${totales.total_activo}</p>`;
     document.getElementById('title-pasivos').innerHTML = `Pasivos  <p class='total'>${totales.total_pasivo}</p>`;
     document.getElementById('title-patrimonio').innerHTML = `Patrimonio  <p class='total'>${totales.total_patrimonio}</p>`;
    // Update patrimonio formula and status
    updatePatrimonioStatus(totales);
}
// Function to update patrimonio formula and balance status
function updatePatrimonioStatus(totales) {
   const formula = document.getElementById('formula-patrimonio');
   const patrimonioCalculado = (totales.total_activo - totales.total_pasivo).toFixed(2);
   const diferencia = (parseFloat(patrimonioCalculado) - parseFloat(totales.total_patrimonio)).toFixed(2);
   let statusText = `Balance general con diferencia de ${diferencia}`;
  if (parseFloat(diferencia) === 0) {
      statusText =  `Patrimonio (${totales.total_patrimonio}) = Activo (${totales.total_activo}) - Pasivo (${totales.total_pasivo}) Balance general con diferencia de 0`
       formula.classList.add('balance-status-ok');
        formula.classList.remove('balance-status-error')
    }else {
        statusText = `Patrimonio (${totales.total_patrimonio}) = Activo (${totales.total_activo}) - Pasivo (${totales.total_pasivo}) <span class='balance-status-error'>Balance general con diferencia de ${diferencia}</span>`;
        formula.classList.add('balance-status-error')
        formula.classList.remove('balance-status-ok')
    }
     formula.innerHTML =  statusText;
}