(function exposeAdminModule(global) {
    const formatOrderDate = (date) => new Date(date).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires'
    });

    const resolveOrderReference = (order) => {
        return order.referencia || (order.tipo === 'Envío' ? order.direccion : order.nombre) || 'N/A';
    };

    const renderAdminOrders = (orders, listElement) => {
        listElement.innerHTML = '';

        orders.forEach((order) => {
            const orderElement = document.createElement('div');
            orderElement.className = 'pedido-admin';
            orderElement.innerHTML = `
                <p><strong>ID:</strong> ${order.id}</p>
                <p><strong>Fecha:</strong> ${formatOrderDate(order.fecha)}</p>
                <p><strong>Teléfono:</strong> ${order.telefono}</p>
                <p><strong>Referencia:</strong> ${resolveOrderReference(order)}</p>
                <p><strong>Horario:</strong> ${order.horario || 'N/A'} (Argentina)</p>
                <p><strong>Total:</strong> $${order.total}</p>
            `;

            listElement.appendChild(orderElement);
        });
    };

    const initAdminModule = (deps) => {
        const {
            restoreAdminToken,
            hasAdminToken,
            loginAdmin,
            getOrders
        } = deps;

        const adminSection = document.getElementById('admin');
        const adminContent = document.getElementById('admin-content');
        const adminPasswordInput = document.getElementById('admin-password');
        const adminOrdersList = document.getElementById('lista-pedidos');
        const adminButton = document.getElementById('btn-admin');
        const adminLoginButton = document.getElementById('admin-login');
        const exportButton = document.getElementById('exportar-json');

        if (!adminSection || !adminContent || !adminPasswordInput || !adminOrdersList || !adminButton || !adminLoginButton || !exportButton) {
            return;
        }

        const loadAdminOrders = async () => {
            try {
                const orders = await getOrders();
                renderAdminOrders(orders, adminOrdersList);
            } catch (error) {
                console.error('Error al cargar pedidos:', error);
                alert('Error al cargar pedidos');
            }
        };

        adminButton.addEventListener('click', () => {
            adminSection.style.display = 'block';
            restoreAdminToken();

            if (!hasAdminToken()) {
                return;
            }

            adminContent.style.display = 'block';
            loadAdminOrders();
        });

        adminLoginButton.addEventListener('click', async () => {
            const password = adminPasswordInput.value;
            if (!password) {
                alert('Ingresa la contraseña');
                return;
            }

            try {
                const response = await loginAdmin(password);
                if (!response.success) {
                    alert('Contraseña incorrecta');
                    return;
                }

                adminContent.style.display = 'block';
                adminPasswordInput.value = '';
                loadAdminOrders();
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });

        exportButton.addEventListener('click', async () => {
            try {
                const orders = await getOrders();
                const dataStr = JSON.stringify(orders, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'pedidos.json';
                link.click();
            } catch (error) {
                alert(`Error al exportar: ${error.message}`);
            }
        });

    };

    global.AdminModule = {
        initAdminModule
    };
})(window);
