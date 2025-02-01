document.addEventListener('DOMContentLoaded', () =>{

    const inputValorServicio = document.getElementById('valor-servicio');
    const inputValorAlquiler = document.getElementById('valor-alquiler');
    const inputCajaServicio = document.getElementById('pago-caja-servicios');
    const inputBancoServicio = document.getElementById('pago-banco-servicios');
    const inputCreditoServicio = document.getElementById('pago-credito-servicios');
    const inputCajaAlquiler = document.getElementById('pago-caja-alquiler');
    const inputBancoAlquiler = document.getElementById('pago-banco-alquiler');
    const inputCreditoAlquiler = document.getElementById('pago-credito-alquiler');
    const inputIVAAlquiler = document.getElementById('valor-iva-alquiler');
    const inputIVAServicio = document.getElementById('valor-iva-servicio');
    const inputTotalServicio = document.getElementById('total-servicio');
    const inputTotalAlquiler = document.getElementById('total-alquiler');
    const btnServicio = document.getElementById('guardar-servicios-btn');
    const btnAlquiler = document.getElementById('guardar-alquiler-btn');
    const efectivoDisponible = document.getElementById('efectivo');
    const bancoDisponible = document.getElementById('banco');
    const checkBoxAlquiler = document.getElementById('credito-checkbox-alquiler');
    const checkBoxServicio = document.getElementById('credito-checkbox-servicios');
    const selectIVAServicio = document.getElementById('iva-servicio');
    const selectIVAAlquiler = document.getElementById('iva-alquiler');

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

    //calcular deuda
    function calcularDeuda() {
        // Convertir los valores de los inputs a números usando parseFloat
        const valorAlquiler = parseFloat(inputValorAlquiler.value) || 0;
        const bancoAlquiler = parseFloat(inputBancoAlquiler.value) || 0;
        const cajaAlquiler = parseFloat(inputCajaAlquiler.value) || 0;
        const ivaAlquiler = parseFloat(inputIVAAlquiler.value) || 0;

        // Calcular la deuda
        const creditoAlquiler = valorAlquiler - bancoAlquiler - cajaAlquiler + ivaAlquiler;


        // Asignar el resultado al input correspondiente
        inputCreditoAlquiler.value = creditoAlquiler.toFixed(2); // Formato a dos decimales

        inputTotalAlquiler.value = creditoAlquiler.toFixed(2)

        // Convertir los valores de los inputs a números usando parseFloat
        const valorServicio = parseFloat(inputValorServicio.value) || 0;
        const bancoServicio = parseFloat(inputBancoServicio.value) || 0;
        const cajaServicio = parseFloat(inputCajaServicio.value) || 0;
        const ivaServicio = parseFloat(inputIVAServicio.value) || 0;

        // Calcular la deuda
        const creditoServicio = valorServicio - bancoServicio - cajaServicio +ivaServicio;

        // Asignar el resultado al input correspondiente
        inputCreditoServicio.value = creditoServicio.toFixed(2); // Formato a dos decimales

        inputTotalServicio.value = creditoServicio.toFixed(2)
    }

    // Validar formulario servicios
    const validarFormularioServicio = () => {
        const campos = [
            { id: 'valor-servicio', nombre: 'Valor' },
            { id: 'facutra-servicios', nombre: 'Factura' },
            { id: 'nombre-servicios', nombre: 'Servicio' },
            { id: 'pago-banco-servicios', nombre: 'Banco' },
            { id: 'pago-caja-servicios', nombre: 'Efectivo' },
            { id: 'pago-credito-servicios', nombre: 'Credito' }
        ];

        let formularioValido = true;
        let mensajeError = '';

        campos.forEach(campo => {
            const input = document.getElementById(campo.id);
            if (!input.value.trim()) {
                formularioValido = false;
                mensajeError += `- ${campo.nombre}\n`;
            }
        });

        if (!formularioValido) {
            alert(`Por favor complete los siguientes campos:\n${mensajeError}`);
        }

        disponibleBanco = bancoDisponible.value;
        disponibleEfectivo = efectivoDisponible.value;

        if(disponibleBanco < inputBancoServicio.value){
            formularioValido = false
            alert(`No tiene saldo disponible en banco`);
        }
        if(disponibleEfectivo < inputCajaServicio.value){
            formularioValido = false
            alert(`No tiene saldo disponible en caja`);
        }

        pagoTotal = parseFloat(inputBancoServicio.value) + parseFloat(inputCajaServicio.value)
        if(pagoTotal > parseFloat(inputTotalServicio.value)){
            formularioValido = false
            alert(`Ingreso una cantidad superior al valor de la factura`);
        }

        const habilitado = checkBoxServicio.checked;
        if(parseFloat(inputCreditoServicio.value)>0){
            if(!habilitado){
                alert('Si el pago es a credito habilitar')
                formularioValido = false
            }
        }

        return formularioValido;
    };
    //Validar formulario alquiler
    const validarFormularioAlquiler = () => {
        const campos = [
            { id: 'valor-alquiler', nombre: 'Valor' },
            { id: 'facutra-alquiler', nombre: 'Factura' },
            { id: 'nombre-alquiler', nombre: 'Alquiler' },
            { id: 'pago-banco-alquiler', nombre: 'Banco' },
            { id: 'pago-caja-alquiler', nombre: 'Efectivo' },
            { id: 'pago-credito-alquiler', nombre: 'Credito' }
        ];

        let formularioValido = true;
        let mensajeError = '';

        campos.forEach(campo => {
            const input = document.getElementById(campo.id);
            if (!input.value.trim()) {
                formularioValido = false;
                mensajeError += `- ${campo.nombre}\n`;
            }
        });

        if (!formularioValido) {
            alert(`Por favor complete los siguientes campos:\n${mensajeError}`);
        }

        disponibleBanco = bancoDisponible.value;
        disponibleEfectivo = efectivoDisponible.value;

        if(disponibleBanco < inputBancoAlquiler.value){
            formularioValido = false
            alert(`No tiene saldo disponible en banco`);
        }
        if(disponibleEfectivo < inputCajaAlquiler.value){
            formularioValido = false
            alert(`No tiene saldo disponible en caja`);
        }

        pagoTotal = parseFloat(inputBancoAlquiler.value) + parseFloat(inputCajaAlquiler.value)
        if(pagoTotal > parseFloat(inputTotalAlquiler.value)){
             formularioValido = false
             alert(`Ingreso una cantidad superior al valor de la factura`);
         }

        const habilitado = checkBoxAlquiler.checked;
        if(parseFloat(inputCreditoAlquiler.value)>0){
            if(!habilitado){
                 alert('Si el pago es a credito habilitar')
                formularioValido = false
            }
         }
         return formularioValido;
    };

    // Guardar pago servicio
    const guardaServicio = async (e) => {
        e.preventDefault(); // Evita el envío del formulario tradicional
        if (validarFormularioServicio()) {
            const datos = {
                banco : parseFloat(inputBancoServicio.value),
                caja: parseFloat(inputCajaServicio.value),
                valor: parseFloat(inputTotalServicio.value),
                credito: parseFloat(inputCreditoServicio.value),
                iva: parseFloat(inputIVAServicio.value),
                factura: document.getElementById('facutra-servicios').value,
                observaciones: document.getElementById('nombre-servicios').value
            };
            const response = await fetch('/api/pago-servicio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                alert('Pago de servicio guardado exitosamente');
            } else {
                alert('Hubo un error al guardar el registro. Inténtelo nuevamente.');
            }
        }
    };
    // Guardar pago alquiler
    const guardaAlquiler = async (e) => {
        e.preventDefault(); // Evita el envío del formulario tradicional
        if (validarFormularioAlquiler()) {
            const datos = {
                banco : parseFloat(inputBancoAlquiler.value),
                caja: parseFloat(inputCajaAlquiler.value),
                valor: parseFloat(inputTotalAlquiler.value),
                credito: parseFloat(inputCreditoAlquiler.value),
                iva: parseFloat(inputIVAAlquiler.value),
                factura: document.getElementById('facutra-alquiler').value,
                observaciones: document.getElementById('nombre-alquiler').value
            };
            const response = await fetch('/api/pago-alquiler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                alert('Pago de alquiler guardado exitosamente');
            } else {
                 alert('Hubo un error al guardar el registro. Inténtelo nuevamente.');
            }
        }
    };

    function calcularIVA(event){
        const yesOrNot = event.target;
        const selectedValue = yesOrNot.value;
          if(yesOrNot === selectIVAServicio){
                if (selectedValue === 'NO') {
                    inputIVAServicio.value = 0
                    inputTotalServicio.value = inputValorServicio.value
                } else if (selectedValue === 'SI') {
                    const valor = parseFloat(inputValorServicio.value) * 0.19
                    inputIVAServicio.value = valor.toFixed(2)
                    inputTotalServicio.value = valor + parseFloat(inputValorServicio.value)
                }
          }else{
                if (selectedValue === 'NO') {
                    inputIVAAlquiler.value = 0
                    inputTotalAlquiler.value = inputValorAlquiler.value
                } else if (selectedValue === 'SI') {
                    const valor = parseFloat(inputValorAlquiler.value) * 0.19
                    inputIVAAlquiler.value = valor.toFixed(2)
                    inputTotalAlquiler.value = valor + parseFloat(inputValorAlquiler.value)
                }
          }
    }

    selectIVAAlquiler.addEventListener('change', calcularIVA);
    selectIVAServicio.addEventListener('change', calcularIVA);

    inputValorAlquiler.addEventListener('input', calcularDeuda);
    inputBancoAlquiler.addEventListener('input', calcularDeuda);
    inputCajaAlquiler.addEventListener('input', calcularDeuda);
    inputValorServicio.addEventListener('input', calcularDeuda);
    inputBancoServicio.addEventListener('input', calcularDeuda);
    inputCajaServicio.addEventListener('input', calcularDeuda);

    btnAlquiler.addEventListener('click', guardaAlquiler);
    btnServicio.addEventListener('click', guardaServicio);

    cargarDisponible();

});