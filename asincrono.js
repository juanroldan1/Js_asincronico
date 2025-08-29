const boton_aleatorio = document.getElementById("btnAleatorio");
const loader = document.getElementById("loader");
const mostrarActual = document.getElementById("mostrarActual");
const idcoctel = document.getElementById("cocktailId");
const nombrecoctel = document.getElementById("cocktailNombre");
const catcoctel = document.getElementById("cocktailCategoria");
const tipococtel = document.getElementById("cocktailTipo");
const imagencoctel = document.getElementById("cocktailImagen");
const listaIngredientes = document.getElementById("listaIngredientes");
const instrucciones = document.getElementById("cocktailInstrucciones");

boton_aleatorio.addEventListener("click", function() {
    loader.classList.remove("oculto");
    mostrarActual.classList.add("oculto");

    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo encontrar un cóctel");
        }
        return response.json();
    })
    .then(data => {
        const coctel = data.drinks[0];
        console.log(coctel);

        // 3. Ocultar el loader y mostrar los resultados
        loader.classList.add("oculto");
        mostrarActual.classList.remove("oculto");

        idcoctel.textContent = coctel.idDrink;
        nombrecoctel.textContent = coctel.strDrink;
        catcoctel.textContent = coctel.strCategory;
        tipococtel.textContent = coctel.strAlcoholic;
        imagencoctel.src = coctel.strDrinkThumb;

        for (let i = 1; i <= 15; i++) {
            // Construye los nombres de las propiedades dinámicamente
            const ingrediente = coctel[`strIngredient${i}`];
            const medida = coctel[`strMeasure${i}`];

            // Si el ingrediente existe y no es nulo, lo añade a la lista
        if (ingrediente && ingrediente.trim() !== '') {
            const li = document.createElement('li');
            li.textContent = `${medida ? medida + ' ' : ''}${ingrediente}`;
            listaIngredientes.appendChild(li);
        }
        }

        instrucciones.textContent = coctel.strInstructionsES;
    })
    .catch(error => {
        // 4. Capturar y manejar errores de la red
        console.error("Hubo un problema con la solicitud fetch:", error);
        loader.classList.add("oculto");
    });
});



