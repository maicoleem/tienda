document.addEventListener('DOMContentLoaded', () => {
    
    const tablaEmpleados = document.getElementById("tabla-empleados");
    const formNomina = document.getElementById("form-nomina");
    const nombreEmpleadoInput = document.getElementById("nombre-empleado");
    const efectivoDisponible = document.getElementById('efectivo-disponible');
    const bancoDisponible = document.getElementById('banco-disponible');
    const caja = document.getElementById('efectivo');
    const pago = document.getElementById('pago');
    const banco = document.getElementById('banco');
    const btnPago = document.getElementById('btn-pago');
    const factura = document.getElementById('factura');
    let empleadoPago = null;

    // Función para obtener los totales de debe y haber por código de cuenta
    const obtenerTotalesPorCodigo = async (codigoCuenta) => {
        if (!codigoCuenta) {
            alert('Por favor, ingrese un código de cuenta.');
            return;
        }
        try {
            // Realizar la solicitud al backend
            const response = await fetch(`/api/debe-haber-cuenta?codigo_cuenta=${codigoCuenta}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            // Retornar los totales de debe y haber
            return {
                totalDebe: data.total_debe || 0,
                totalHaber: data.total_haber || 0
            };
        } catch (error) {
            console.error('Error al obtener los totales:', error);
            alert('Hubo un problema al obtener los datos. Consulte la consola para más detalles.');
        }
    }
    //Cargar disponible
    async function cargarDisponible() {
        const caja = '110505';
        const banco = '111005';
        const cajaCuenta = await obtenerTotalesPorCodigo(caja);
        totalCaja = cajaCuenta.totalDebe - cajaCuenta.totalHaber;
        if(cajaCuenta){
            efectivoDisponible.value = totalCaja;
        }
        
        const bancoCuenta = await obtenerTotalesPorCodigo(banco)
        totalBanco = bancoCuenta.totalDebe - bancoCuenta.totalHaber
        if(totalBanco){
            bancoDisponible.value = totalBanco;
        }
    }
    //cargar empleados
    function cargarEmpleados(){
        fetch('/api/nomina/empleados')
        .then(response => response.json())
        .then(empleados =>{
            empleados.forEach(empleado =>{
                const li = document.createElement('tr');
                li.innerHTML =`
                <td>${empleado.nombre}</td>
                <td>${empleado.cargo}</td>
                <td>${empleado.salario}</td>
                `
                li.dataset.id = empleado.id;
                li.addEventListener('click', () => seleccionarEmpleado(empleado));
                tablaEmpleados.appendChild(li)
            });
        });
    }
    //seleccionar empleado
    function seleccionarEmpleado(empleado){
        empleadoSeleccionado = empleado;
        empleadoPago = empleadoSeleccionado;
        formNomina.nombre.value = empleadoSeleccionado.nombre;
        formNomina.salario.value = empleadoSeleccionado.salario;
    }

    const guardarNomina = async () => {
        const valorBanco = parseFloat(banco.value);
        const valorCaja = parseFloat(caja.value);
        const disponibleBanco = parseFloat(bancoDisponible.value)
        const disponibleCaja = parseFloat(efectivoDisponible.value)
        const valorPago = parseFloat(pago.value);
        const totalCash = valorBanco + valorCaja;
        const zeroBanco = disponibleBanco - valorBanco;
        const zeroCaja= disponibleCaja - valorCaja;
        const zeroPago = valorPago -totalCash;
        const observaciones = 'pago nomina salario: '// + empleadoPago.salario
        if(zeroBanco>0 && zeroCaja >0 && zeroPago == 0 ){

            const data ={
               empleado_id: empleadoPago.id,
               empleado: empleadoPago.nombre,
               pago: valorPago,
               banco: valorBanco,
               caja: valorCaja,
               factura: factura.value,
               observaciones: observaciones
            };
            await fetch('/api/nomina/pago-nomina',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(()=>{
                alert('guardado')
            }).catch(error => console.error('Error al registrar pago de nomina:', error));
        }else{
            alert('Error en if')
        }
    }

    const buscarRegistros = async () => {
        try {
            // Obtener el valor del input con id "factura"
            const cadena = "NOMINA";
    
            // Realizar la solicitud GET con la cadena como parámetro
            const response = await fetch(`/api/libro_registro/facturas-registro?cadena=${encodeURIComponent(cadena)}`);
            const datos = await response.json();
    
            if (response.ok) {
                console.log("Facturas encontradas:", datos);
                // Mostrar los resultados en la interfaz
                mostrarFacturasEnTabla(datos);
            } else {
                console.error("Error:", datos.error);
                alert(`Error: ${datos.error}`);
            }
        } catch (error) {
            console.error("Error al buscar facturas:", error);
            alert("Hubo un problema al buscar las facturas. Consulte la consola para más detalles.");
        }
    };

    // Función para mostrar las facturas en una tabla HTML
    const mostrarFacturasEnTabla = (facturas) => {
        const tbody = document.getElementById("tabla-nomina");
        tbody.innerHTML = ""; // Vaciar la tabla

        if (facturas.length === 0) {
            tbody.innerHTML = "<tr><td colspan='7'>No se encontraron facturas</td></tr>";
            return;
        }

        // Agregar filas con los resultados
        facturas.forEach((factura) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${new Date(factura.fecha).toLocaleDateString()}</td>
                <td>${factura.factura}</td>
                <td>${factura.referencia}</td>
                <td>${factura.nombre}</td>
                <td>${factura.precio_compra}</td>
                <td>${factura.precio_venta}</td>
            `;
            tbody.appendChild(fila);
        });
    };

    const obtenerNuevaFactura = async () => {
        try {
            // Obtener el valor del prefijo ingresado en un input
            const prefijo = "NOMINA";
    
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
    cargarEmpleados();
    cargarDisponible();
    buscarRegistros();
    //obtener factura nueva
    obtenerNuevaFactura();

    btnPago.addEventListener('click', guardarNomina)

});
