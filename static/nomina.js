ocument.addEventListener("DOMContentLoaded", () => {
    const listaEmpleados = document.getElementById("lista-empleados");
    const calculoSalario = document.getElementById("calculo-salario");
    const formNomina = document.getElementById("form-nomina");
    const nombreEmpleadoInput = document.getElementById("nombre-empleado");

    // Cargar empleados al inicio
    fetch('/empleados')
        .then(response => response.json())
        .then(data => {
            data.slice(0, 5).forEach(empleado => {
                const li = document.createElement("li");
                li.textContent = `${empleado.nombre} - ${empleado.cargo}`;
                li.dataset.id = empleado.id;
                li.dataset.nombre = empleado.nombre;
                listaEmpleados.appendChild(li);
            });
        });

    // Evento para seleccionar empleado
    listaEmpleados.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            nombreEmpleadoInput.value = e.target.dataset.nombre;
            calculoSalario.style.display = "block";
        }
    });

    // Enviar formulario
    formNomina.addEventListener("submit", (e) => {
        e.preventDefault();

        const empleadoId = listaEmpleados.querySelector("li[data-nombre='" + nombreEmpleadoInput.value + "']").dataset.id;
        const formData = new FormData(formNomina);

        fetch(`/calcular/${empleadoId}`, {
            method: "POST",
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { "Content-Type": "application/json" },
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message || "Pago realizado con éxito");
            });
    });
});
