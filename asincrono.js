// Variables del DOM
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

// Variable global para el cóctel actual
let coctelActual = null;

// FUNCIONES PARA MANEJAR LOCALSTORAGE - SEGÚN REQUERIMIENTO 3
function obtenerFavoritos() {
    const favoritos = localStorage.getItem('cocktailFavoritos');
    return favoritos ? JSON.parse(favoritos) : [];
}

function guardarFavoritos(favoritos) {
    localStorage.setItem('cocktailFavoritos', JSON.stringify(favoritos));
}

// REQUERIMIENTO 3: Guardar SOLO ID y NOMBRE
function agregarAFavoritos(coctel) {
    const favoritos = obtenerFavoritos();
    const yaExiste = favoritos.some(fav => fav.idDrink === coctel.idDrink);

    if (!yaExiste) {
        // CUMPLIENDO REQUERIMIENTO: Solo guardar ID y NOMBRE
        const favoritoCoctel = {
            idDrink: coctel.idDrink,
            strDrink: coctel.strDrink
            // NO guardamos más información según requerimiento
        };
        
        favoritos.push(favoritoCoctel);
        guardarFavoritos(favoritos);

        btnAgregar.textContent = "✓ Agregado a Favoritos";
        btnAgregar.style.backgroundColor = "#27ae60";
        btnAgregar.disabled = true;
        
        console.log("Cóctel agregado a favoritos (solo ID y nombre):", favoritoCoctel);
        
        // Actualizar contador en botón de favoritos
        actualizarContadorFavoritos();
        return true;
    } else {
        alert("Este cóctel ya está en tus favoritos");
        return false;
    }
}

function eliminarDeFavoritos(idDrink) {
    const favoritos = obtenerFavoritos();
    const favoritosFiltrados = favoritos.filter(fav => fav.idDrink !== idDrink);
    guardarFavoritos(favoritosFiltrados);
    mostrarFavoritos();
    actualizarContadorFavoritos();
    console.log("Cóctel eliminado de favoritos");
}

function verificarSiEsFavorito(idDrink) {
    const favoritos = obtenerFavoritos();
    return favoritos.some(fav => fav.idDrink === idDrink);
}

function mostrarFavoritos() {
    const favoritos = obtenerFavoritos();

    listaFavoritos.innerHTML = '';
    
    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = '<p class="sin-favoritos">No tienes favoritos aún</p>';
    } else {
        favoritos.forEach(coctel => {
            const div = document.createElement('div');
            div.className = 'favorito-item';
            
            // Solo mostramos ID y nombre (lo único que guardamos)
            div.innerHTML = `
                <div class="favorito-info">
                    <h4>${coctel.strDrink}</h4>
                    <small>ID: ${coctel.idDrink}</small>
                </div>
                <button class="btn-eliminar" data-id="${coctel.idDrink}">Eliminar</button>
            `;
            
            // REQUERIMIENTO 4: Al hacer clic, traer detalles completos del API
            div.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-eliminar')) {
                    buscarCoctelPorId(coctel.idDrink);
                }
            });
            
            listaFavoritos.appendChild(div);
        });
        
        // Agregar eventos a botones eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idDrink = e.target.dataset.id;
                if (confirm('¿Estás seguro de eliminar este cóctel de favoritos?')) {
                    eliminarDeFavoritos(idDrink);
                }
            });
        });
    }
}

// REQUERIMIENTO 4: Buscar cóctel por ID desde favoritos
async function buscarCoctelPorId(idDrink) {
    try {
        // Mostrar loader mientras se busca
        loader.classList.remove("oculto");
        seccionFavoritos.classList.add('oculto');
        mostrarActual.classList.add("oculto");
        btnFavoritos.textContent = 'Ver Favoritos';
        
        console.log("Buscando cóctel por ID:", idDrink);
        
        // USAR ASYNC/AWAIT como requiere el reto
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`);
        
        if (!response.ok) {
            throw new Error("No se pudo encontrar el cóctel");
        }
        
        const data = await response.json();
        
        if (data.drinks && data.drinks.length > 0) {
            const coctel = data.drinks[0];
            mostrarDetallesCoctel(coctel);
        } else {
            throw new Error("Cóctel no encontrado");
        }
        
    } catch (error) {
        console.error("Error al buscar cóctel por ID:", error);
        loader.classList.add("oculto");
        alert("Error al cargar el cóctel desde favoritos. Puede que haya sido eliminado de la API.");
        
        // Volver a mostrar favoritos
        seccionFavoritos.classList.remove('oculto');
        btnFavoritos.textContent = 'Ocultar Favoritos';
    }
}

// Función auxiliar para mostrar detalles del cóctel
function mostrarDetallesCoctel(coctel) {
    coctelActual = coctel;
    
    // Ocultar loader y mostrar detalles
    loader.classList.add("oculto");
    mostrarActual.classList.remove("oculto");

    // REQUERIMIENTO 2: Mostrar todos los datos requeridos
    idcoctel.textContent = coctel.idDrink;
    nombrecoctel.textContent = coctel.strDrink;
    catcoctel.textContent = coctel.strCategory;
    tipococtel.textContent = coctel.strAlcoholic;
    imagencoctel.src = coctel.strDrinkThumb;
    imagencoctel.alt = `Imagen de ${coctel.strDrink}`;

    // Limpiar y llenar ingredientes con cantidades
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

    // Instrucciones de preparación
    instrucciones.textContent = coctel.strInstructionsES || coctel.strInstructions || 'No hay instrucciones disponibles';
    
    // Actualizar botón de agregar a favoritos
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

function actualizarContadorFavoritos() {
    const cantidadFavoritos = obtenerFavoritos().length;
    if (cantidadFavoritos > 0) {
        btnFavoritos.textContent = `Ver Favoritos (${cantidadFavoritos})`;
    } else {
        btnFavoritos.textContent = 'Ver Favoritos';
    }
}

// REQUERIMIENTO 1: BÚSQUEDA ALEATORIA CON LOADER
boton_aleatorio.addEventListener("click", async function() {
    try {
        // Mostrar loader (indicador de progreso)
        loader.classList.remove("oculto");
        mostrarActual.classList.add("oculto");
        seccionFavoritos.classList.add("oculto");
        btnFavoritos.textContent = 'Ver Favoritos';

        console.log("Buscando cóctel aleatorio...");
        
        // USAR ASYNC/AWAIT como requiere el reto
        const response = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
        
        if (!response.ok) {
            throw new Error("No se pudo encontrar un cóctel");
        }
        
        const data = await response.json();
        const coctel = data.drinks[0];
        
        console.log("Cóctel aleatorio encontrado:", coctel);
        
        // Mostrar los datos del cóctel
        mostrarDetallesCoctel(coctel);
        
    } catch (error) {
        console.error("Error en búsqueda aleatoria:", error);
        loader.classList.add("oculto");
        alert("Error al cargar el cóctel. Por favor, intenta de nuevo.");
    }
});

// EVENTO - AGREGAR A FAVORITOS
btnAgregar.addEventListener('click', () => {
    if (coctelActual) {
        agregarAFavoritos(coctelActual);
    }
});

// EVENTO - VER/OCULTAR FAVORITOS
btnFavoritos.addEventListener('click', () => {
    if (seccionFavoritos.classList.contains('oculto')) {
        // Mostrar favoritos
        mostrarActual.classList.add('oculto');
        seccionFavoritos.classList.remove('oculto');
        mostrarFavoritos();
        btnFavoritos.textContent = 'Ocultar Favoritos';
    } else {
        // Ocultar favoritos
        seccionFavoritos.classList.add('oculto');
        actualizarContadorFavoritos();
    }
});

// MANEJO DE ERRORES DE IMAGEN
imagencoctel.addEventListener('error', function() {
    console.log("Error cargando imagen del cóctel");
    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="200"><rect width="100%" height="100%" fill="%23f8f9fa"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666" font-family="Arial">Sin imagen disponible</text></svg>';
});

// INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    // Actualizar contador de favoritos
    actualizarContadorFavoritos();
    
    // Ocultar sección de mostrar actual al inicio
    mostrarActual.classList.add('oculto');
    
    console.log("Aplicación Cocktail Random cargada - Cumpliendo todos los requerimientos del reto");
});


