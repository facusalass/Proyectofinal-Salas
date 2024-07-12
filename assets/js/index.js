document.addEventListener('DOMContentLoaded', function() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let total = parseInt(localStorage.getItem('total')) || 0;
    let productos = [];

    async function cargarProductos() {
        try {
            const response = await fetch('../productos.json'); 
            productos = await response.json();
        } catch (error) {
            console.error('Error al cargar los productos:', error);
        }
    }

    function agregarAlCarrito(productoNombre) {
        const productoEncontrado = productos.find(producto => producto.nombre.toLowerCase() === productoNombre.toLowerCase());
    
        if (productoEncontrado) {
            const cantidadEnCarrito = carrito.filter(item => item.nombre === productoEncontrado.nombre).length;
    
            if (cantidadEnCarrito >= 5) {
                Swal.fire({
                    title: 'Limite alcanzado',
                   html: `<p class="limite">Llegaste al limite de unidades por producto (5)</p>`
                   ,
                    icon: 'info',
                    confirmButtonText: 'Aceptar'
                });
                return; 
            }
        
            carrito.push(productoEncontrado);
            total += productoEncontrado.precio;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            localStorage.setItem('total', total);
    
            mostrarTotal();
            if (window.location.pathname.includes('compras.html')) {
                mostrarCarrito();
            }
        } else {
            console.error(`El producto "${productoNombre}" no se encontró en la lista.`);
        }
    }

    function mostrarTotal() {
        const totalElement = document.getElementById('total');
        if (totalElement) {
            totalElement.textContent = `TOTAL: $${total}`;
        }
    }

    function mostrarCarrito() {
        const conteoProductos = {};
        carrito.forEach(producto => {
            if (conteoProductos[producto.nombre]) {
                conteoProductos[producto.nombre]++;
            } else {
                conteoProductos[producto.nombre] = 1;
            }
        });

        let productosHTML = '';
        for (const [nombre, cantidad] of Object.entries(conteoProductos)) {
            productosHTML += `
                <div class="producto-item">
                    <h3 class="producto-nombre">${nombre} <span class="producto-cantidad">(x${cantidad})</span></h3>
                </div>
            `;
        }

        const productosContainer = document.querySelector('.productos');
        if (productosContainer) {
            productosContainer.innerHTML = `<div class="items">${productosHTML}</div>`;
        }

        mostrarTotal();
    }

    function mostrarMensajeTarjeta() {
        if (carrito.length === 0) {
            Swal.fire({
                title: 'Carrito vacío',
                html: '<p class="carrito-vacio">Por favor, agregue al menos un producto al carrito antes de comprar.</p>',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false
            });
            return;
        }

        elegirMetodoEntrega();
    }

    function elegirMetodoEntrega() {
        Swal.fire({
            title: 'Método de entrega',
            html: `
                <p class="envio">El envío a domicilio tiene un costo fijo de $5000.</p>
                <p class="envio">El retiro en sucursal de correo cuesta $2000.</p>
            `,
            input: 'select',
            inputOptions: {
                'domicilio': 'Envío a domicilio ($5000)',
                'sucursal': 'Retiro en sucursal ($2000)'
            },
            inputPlaceholder: 'Selecciona un método de entrega',
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe elegir un método de entrega';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const metodoEntrega = result.value;
                let costoEnvio = 0;

                if (metodoEntrega === 'domicilio') {
                    costoEnvio = 5000;
                    pedirDireccion(costoEnvio);
                } else if (metodoEntrega === 'sucursal') {
                    costoEnvio = 2000;
                    elegirCorreoSucursal();
                }
            }
        });
    }

    function pedirDireccion(costoEnvio) {
        Swal.fire({
            title: 'Ingrese su dirección de envío',
            input: 'text',
            inputPlaceholder: 'Ingrese su dirección aquí',
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe ingresar una dirección';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                total += costoEnvio;
                elegirTarjeta();
            }
        });
    }

    function elegirCorreoSucursal() {
        Swal.fire({
            title: 'Seleccione el correo para retirar el pedido',
            input: 'select',
            inputOptions: {
                'andreani': 'Andreani',
                'oca': 'OCA',
                'argentino': 'Correo Argentino'
            },
            inputPlaceholder: 'Selecciona un correo',
            confirmButtonText: 'Aceptar',
            showCancelButton: true,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe elegir un correo para retirar';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                total += 2000; 
                elegirTarjeta();
            }
        });
    }

    function elegirTarjeta() {
        Swal.fire({
            title: 'Elegí una tarjeta',
            html: `
                <p class="tarjetas">La tarjeta Naranja cuenta con hasta 6 cuotas sin intereses.
                <br>
                A partir de 9 cuotas se le agrega un interés del 2%
                </p>
                <p class="tarjetas">La tarjeta Visa cuenta con hasta 3 cuotas sin intereses.
                <br>
                A partir de 6 cuotas se le agrega un interés del 1%
                </p>
            `,
            input: 'select',
            inputOptions: {
                'naranja': 'Tarjeta Naranja',
                'visa': 'Tarjeta Visa'
            },
            inputPlaceholder: 'Selecciona una tarjeta',
            confirmButtonText: 'Elegir',
            showCancelButton: true,
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'Debes elegir alguna tarjeta';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const elegirTarjeta = result.value;
                elegirCuotas(elegirTarjeta);
            }
        });
    }

    function elegirCuotas(tarjetaElegida) {
        Swal.fire({
            title: 'Elegí la cantidad de cuotas',
            input: 'select',
            inputOptions: {
                '1': '1 cuota',
                '3': '3 cuotas',
                '6': '6 cuotas',
                '9': '9 cuotas',
                '12': '12 cuotas'
            },
            inputPlaceholder: 'Selecciona',
            confirmButtonText: 'Elegir',
            showCancelButton: false,
            allowOutsideClick: false,
            inputValidator: (value) => {
                return new Promise((alerta) => {
                    if (value !== '') {
                        alerta();
                    } else {
                        alerta('Debes elegir una cantidad de cuotas para continuar.');
                    }
                });
            }
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                const cuotas = parseInt(resultado.value);
                if (!isNaN(cuotas)) {
                    tarjetaCuotas(tarjetaElegida, cuotas);
                }
            }
        });
    }

    function tarjetaCuotas(tarjeta, cuotas) {
        let interesCalculado = 0;
        let tarjetaSeleccionada;

        if (tarjeta === "naranja") {
            tarjetaSeleccionada = { nombre: 'Naranja', cuotasSinInteres: 6, interes: 0.02 };
        } else if (tarjeta === "visa") {
            tarjetaSeleccionada = { nombre: 'Visa', cuotasSinInteres: 3, interes: 0.01 };
        }

        if (tarjetaSeleccionada) {
            interesCalculado = calcularInteres(total, cuotas, tarjetaSeleccionada);
            const totalConInteres = total + interesCalculado;

            const mensaje = `
                <div class="alert alert-success">
                    El MONTO TOTAL A PAGAR ES $${totalConInteres} PESOS EN ${cuotas} CUOTA/S
                </div>
            `;

            Swal.fire({
                title: 'Resumen de la compra',
                html: mensaje,
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false
            }).then(() => {
                reiniciarCarrito();
            });
        }
    }

    function calcularInteres(total, cuotas, tarjeta) {
        let interes = 0;
        if (cuotas <= tarjeta.cuotasSinInteres) {
            interes = 0;
        } else {
            interes = total * tarjeta.interes;
        }
        return interes;
    }

    function reiniciarCarrito() {
        localStorage.removeItem('carrito');
        localStorage.removeItem('total');

        carrito = [];
        total = 0;

        mostrarTotal();
        mostrarCarrito();
    }

    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', function() {
            mostrarMensajeTarjeta();
        });
    }

    if (window.location.pathname.includes('compras.html')) {
        mostrarCarrito();
    }

    document.querySelectorAll('.agregar').forEach(function(boton) {
        boton.addEventListener('click', function() {
            const productoNombre = this.getAttribute('data-producto');
            agregarAlCarrito(productoNombre);
        });
    });

    cargarProductos();
});



// Ocultar el logo cuando se abre el navbar
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const logoPao = document.querySelector('.logopao');
    const navbarContent = document.querySelector('.navbar-collapse'); 
  
    navbarToggler.addEventListener('click', function() {
      if (navbarContent.classList.contains('ver')) {
        logoPao.style.visibility = 'visible'; 
      } else {
        logoPao.style.visibility = 'hidden'; 
      }
    });

    navbarContent.addEventListener('hidden.bs.collapse', function() {
      logoPao.style.visibility = 'visible';
    });
  });