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
const btnAgregar = document.getElementById("btnAgregar");
const btnFavoritos = document.getElementById("btnFavoritos");
const seccionFavoritos = document.getElementById("seccionFavoritos");
const listaFavoritos = document.getElementById("listaFavoritos");

let coctelActual = null;

function obtenerFavoritos(){
    const favoritos = localStorage.getItem('cocktailFavoritos');
    return favoritos ? JSON.parse(favoritos):[];
}

function agregarFavoritos(coctel){
    const favoritos = obtenerFavoritos();
    const yaExtiste = favoritos.some(fav => fav.idDrink === coctel.idDrink);

    if(!yaExtiste){
        const favoritosCoctel = {
            idDrink: coctel.idDrink,
            strDrink: coctel.strDrink,
            strCategory: coctel.strCategory,
            strAlcoholic: coctel.strAlcoholic,
            strDrinkThumb: coctel.strDrinkThumb,
            strInstructionsES: coctel.strInstructionsES,
            ingredientes: extraerIngredientes(coctel)
        };
        favoritos.push(favoritosCoctel);
        guardarFavoritos(favoritos);

        btnAgregar.textContent = "coctel agregado con exito a favoritos";
        btnAgregar.style.backgroundColor="#27ae60";
        console.log("Coctel agregado a tus favoritos");
        return true;
    }
    else{
        alert("este coctel ya esta en la lista de favoritos");
        return false;
    }
}

function extraerIngredientes(coctel){
    const ingredientes = [];
    for(let i = 1; i <= 15; i++){
        const ingrediente = coctel[`strIngredients${i}`];
        const medida = coctel[`strMeasure${i}`];

        if (ingrediente && ingrediente.trim()!== ''){
            ingredientes.push({
                nombre: ingrediente,
                medida: medida||''
            });

        }
    }
    return ingredientes;
}
function eliminarDeFavoritos(idDrink){
const favoritos = obtenerFavoritos();
const favoritosFiltrados = favoritos.filter(fav => fav.idDrink !== idDrink);
guardarFavoritos(favoritosFiltrados);
mostrarFavoritos();
}

function mostrarFavoritos(){
    const favoritos = obtenerFavoritos();

    listaFavoritos.innerHTML='';
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<p class="sin-favoritos">No tienes favoritos aún</p>';
    }
else {
        favoritos.forEach(coctel => {
            const div = document.createElement('div');
            div.className = 'favorito-item';
            
            div.innerHTML = `
                <div class="favorito-info">
                    <h4>${coctel.strDrink}</h4>
                    <small>${coctel.strCategory} • ${coctel.fechaAgregado}</small>
                </div>
                <button class="btn-eliminar" data-id="${coctel.idDrink}">Eliminar</button>
            `;
            

            div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-eliminar')) {
                    mostrarCoctelDesdeFavoritos(coctel);
                }
            });
            
            listaFavoritos.appendChild(div);
        });
        

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se ejecute el click del div padre
                const idDrink = e.target.dataset.id;
                if (confirm('¿Estás seguro de eliminar este cóctel de favoritos?')) {
                    eliminarDeFavoritos(idDrink);
                }
            });
        });
    }
}
function mostrarCoctelDesdeFavoritos(coctel) {
    // Ocultar favoritos y mostrar el cóctel
    seccionFavoritos.classList.add('oculto');
    mostrarActual.classList.remove('oculto');
    
    // Llenar la información
    coctelActual = coctel;
    idcoctel.textContent = coctel.idDrink;
    nombrecoctel.textContent = coctel.strDrink;
    catcoctel.textContent = coctel.strCategory;
    tipococtel.textContent = coctel.strAlcoholic;
    imagencoctel.src = coctel.strDrinkThumb;
    instrucciones.textContent = coctel.strInstructionsES;
    
    // Limpiar y llenar ingredientes
    listaIngredientes.innerHTML = '';
    coctel.ingredientes.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = `${ing.medida} ${ing.nombre}`.trim();
        listaIngredientes.appendChild(li);
    });
    
    // Actualizar botón agregar
    actualizarBotonAgregar();
}

function actualizarBotonAgregar() {
    if (coctelActual && verificarSiEsFavorito(coctelActual.idDrink)) {
        btnAgregar.textContent = "✓ Ya en Favoritos";
        btnAgregar.style.backgroundColor = "#27ae60";
        btnAgregar.disabled = true;
    } else {
        btnAgregar.textContent = "Agregar a Favoritos";
        btnAgregar.style.backgroundColor = "#e74c3c";
        btnAgregar.disabled = false;
    }
}

// MODIFICAR EL EVENTO DEL BOTÓN ALEATORIO EXISTENTE
boton_aleatorio.addEventListener("click", function() {
    loader.classList.remove("oculto");
    mostrarActual.classList.add("oculto");
    seccionFavoritos.classList.add("oculto"); // Ocultar favoritos si están visibles

    fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then(response => {
        if (!response.ok) {
            throw new Error("No se pudo encontrar un cóctel");
        }
        return response.json();
    })
    .then(data => {
        const coctel = data.drinks[0];
        coctelActual = coctel; // Guardar el cóctel actual
        console.log(coctel);

        loader.classList.add("oculto");
        mostrarActual.classList.remove("oculto");

        idcoctel.textContent = coctel.idDrink;
        nombrecoctel.textContent = coctel.strDrink;
        catcoctel.textContent = coctel.strCategory;
        tipococtel.textContent = coctel.strAlcoholic;
        imagencoctel.src = coctel.strDrinkThumb;

        // Limpiar lista anterior
        listaIngredientes.innerHTML = '';
        
        for (let i = 1; i <= 15; i++) {
            const ingrediente = coctel[`strIngredient${i}`];
            const medida = coctel[`strMeasure${i}`];

            if (ingrediente && ingrediente.trim() !== '') {
                const li = document.createElement('li');
                li.textContent = `${medida ? medida + ' ' : ''}${ingrediente}`;
                listaIngredientes.appendChild(li);
            }
        }

        instrucciones.textContent = coctel.strInstructionsES;
        
        // Actualizar botón de agregar
        actualizarBotonAgregar();
    })
    .catch(error => {
        console.error("Hubo un problema con la solicitud fetch:", error);
        loader.classList.add("oculto");
    });
});

// EVENTOS PARA BOTONES DE FAVORITOS
btnAgregar.addEventListener('click', () => {
    if (coctelActual) {
        agregarAFavoritos(coctelActual);
        actualizarBotonAgregar();
    }
});

btnFavoritos.addEventListener('click', () => {
    // Alternar entre mostrar favoritos y ocultar
    if (seccionFavoritos.classList.contains('oculto')) {
        mostrarActual.classList.add('oculto');
        seccionFavoritos.classList.remove('oculto');
        mostrarFavoritos();
        btnFavoritos.textContent = 'Ocultar Favoritos';
    } else {
        seccionFavoritos.classList.add('oculto');
        btnFavoritos.textContent = 'Ver Favoritos';
    }
});

// INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    // Mostrar cantidad de favoritos en el botón
    const cantidadFavoritos = obtenerFavoritos().length;
    if (cantidadFavoritos > 0) {
        btnFavoritos.textContent = `Ver Favoritos (${cantidadFavoritos})`;
    }
});

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

        // Ocultar el loader y mostrar los resultados
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
        // Capturar y manejar errores de la red
        console.error("Hubo un problema con la solicitud fetch:", error);
        loader.classList.add("oculto");
    });
});



