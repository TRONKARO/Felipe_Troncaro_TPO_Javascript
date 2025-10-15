// Obtener elementos del DOM
const checkboxes = document.querySelectorAll('input[name="producto"]');
const btnLimpiar = document.getElementById('limpiar-btn');

// Función para formatear números como moneda
function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-AR');
}

// Función para obtener los productos seleccionados
function obtenerProductosSeleccionados() {
    const productos = [];
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            const nombre = checkbox.value;
            const precio = parseInt(checkbox.dataset.precio);
            const promocion = checkbox.dataset.promocion;
            const cantidadInput = checkbox.closest('.producto-item').querySelector('.cantidad');
            const cantidad = parseInt(cantidadInput.value) || 1;

            productos.push({
                nombre,
                precio,
                cantidad,
                promocion
            });
        }
    });
    return productos;
}

// Función para calcular el descuento según promociones
function calcularPromociones(productos) {
    let subtotal = 0;
    let descuento = 0;
    let promoAplicada = 'Sin promoción';

    // Calcular subtotal
    productos.forEach(p => {
        subtotal += p.precio * p.cantidad;
    });

    // Separar productos por tipo de promoción
    const productos2x1 = productos.filter(p => p.promocion === '2x1');
    const productos3x2 = productos.filter(p => p.promocion === '3x2');

    // Aplicar promoción 2x1
    if (productos2x1.length >= 2) {
        let descuento2x1 = 0;
        let cantidadTotal2x1 = 0;

        productos2x1.forEach(p => {
            cantidadTotal2x1 += p.cantidad;
        });

        // Por cada 2 productos del mismo tipo, el más barato es gratis
        let pares2x1 = Math.floor(cantidadTotal2x1 / 2);

        // Encontrar el producto más barato en esta promoción
        let masBarato2x1 = Math.min(...productos2x1.map(p => p.precio));
        descuento2x1 = pares2x1 * masBarato2x1;

        descuento += descuento2x1;
        promoAplicada = '2x1 - Lleva 2, Paga 1';
    }

    // Aplicar promoción 3x2
    if (productos3x2.length >= 2) {
        let descuento3x2 = 0;
        let cantidadTotal3x2 = 0;

        productos3x2.forEach(p => {
            cantidadTotal3x2 += p.cantidad;
        });

        // Por cada 3 productos, el más barato es gratis
        let trios3x2 = Math.floor(cantidadTotal3x2 / 3);

        // Encontrar el producto más barato en esta promoción
        let masBarato3x2 = Math.min(...productos3x2.map(p => p.precio));
        descuento3x2 = trios3x2 * masBarato3x2;

        if (descuento3x2 > descuento) {
            descuento = descuento3x2;
            promoAplicada = '3x2 - Compra 3 y Paga 2';
        }
    }

    // Aplicar descuento por compra mayor ($100.000+)
    if (subtotal > 100000) {
        let descuentoPorMonto = Math.floor(subtotal * 0.1);
        if (descuentoPorMonto > descuento) {
            descuento = descuentoPorMonto;
            promoAplicada = '10% por compra mayor a $100.000';
        }
    }

    const totalFinal = Math.max(0, subtotal - descuento);

    return {
        subtotal,
        descuento,
        totalFinal,
        promoAplicada
    };
}

// Función para actualizar la interfaz
function actualizarCarrito() {
    const productos = obtenerProductosSeleccionados();
    const carritoDetalle = document.getElementById('carrito-detalle');

    if (productos.length === 0) {
        carritoDetalle.innerHTML = '<p class="vacio">Selecciona productos para ver el cálculo</p>';
        document.getElementById('subtotal').textContent = '$0';
        document.getElementById('descuento').textContent = '-$0';
        document.getElementById('total-final').textContent = '$0';
        document.getElementById('promo-texto').textContent = 'Sin promoción';
        document.getElementById('ahorro-texto').style.display = 'none';
        return;
    }

    // Mostrar productos en el carrito
    let html = '';
    productos.forEach(p => {
        const subtotalProducto = p.precio * p.cantidad;
        html += `
            <div class="carrito-item">
                <div>
                    <span class="item-nombre">${p.nombre}</span>
                    <span style="color: #999; font-size: 14px;"> x${p.cantidad}</span>
                </div>
                <span class="item-precio">${formatearMoneda(subtotalProducto)}</span>
            </div>
        `;
    });

    carritoDetalle.innerHTML = html;

    // Calcular promociones
    const resultado = calcularPromociones(productos);

    // Actualizar totales
    document.getElementById('subtotal').textContent = formatearMoneda(resultado.subtotal);
    document.getElementById('descuento').textContent = `-${formatearMoneda(resultado.descuento)}`;
    document.getElementById('total-final').textContent = formatearMoneda(resultado.totalFinal);
    document.getElementById('promo-texto').textContent = `✓ ${resultado.promoAplicada}`;

    // Mostrar ahorro
    if (resultado.descuento > 0) {
        document.getElementById('ahorro-monto').textContent = formatearMoneda(resultado.descuento);
        document.getElementById('ahorro-texto').style.display = 'block';
    } else {
        document.getElementById('ahorro-texto').style.display = 'none';
    }
}

// Función para mostrar/ocultar cantidad según checkbox
function toggleCantidad(checkbox) {
    const cantidadInput = checkbox.closest('.producto-item').querySelector('.cantidad');
    if (checkbox.checked) {
        cantidadInput.style.display = 'block';
    } else {
        cantidadInput.style.display = 'none';
    }
}

// Función para limpiar selección
function limpiarSeleccion() {
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        toggleCantidad(checkbox);
    });
    actualizarCarrito();
}

// Event listeners para checkboxes
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        toggleCantidad(this);
        actualizarCarrito();
    });
});

// Event listeners para cantidades
document.querySelectorAll('.cantidad').forEach(input => {
    input.addEventListener('change', actualizarCarrito);
    input.addEventListener('input', actualizarCarrito);
});

// Event listener para botón limpiar
btnLimpiar.addEventListener('click', limpiarSeleccion);

// Inicializar
actualizarCarrito();
