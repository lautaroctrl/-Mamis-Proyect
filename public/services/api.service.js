(function exposeApiService(global) {
    const API_BASE_URL = '/api';
    let adminToken = null;

    const setAdminToken = (token) => {
        adminToken = token || null;
    };

    const getAdminToken = () => adminToken;

    const request = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (adminToken) {
            headers.Authorization = `Bearer ${adminToken}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (response.ok) {
            return response.json();
        }

        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `Error ${response.status}`);
    };

    const createOrder = (order) => request('/pedidos', {
        method: 'POST',
        body: JSON.stringify(order)
    });

    const getOrders = async (status = null) => {
        const endpoint = status ? `/pedidos?estado=${status}` : '/pedidos';
        const response = await request(endpoint);
        return response.data || [];
    };

    const getStats = async () => {
        const response = await request('/estadisticas');
        return response.data || {};
    };

    const updateOrderStatus = (id, status, notes = null) => request(`/pedidos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado: status, notas: notes })
    });

    const loginAdmin = async (password) => {
        const response = await request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });

        if (response.success && response.token) {
            setAdminToken(response.token);
        }

        return response;
    };

    const logoutAdmin = async () => {
        if (!adminToken) {
            return;
        }

        try {
            await request('/admin/logout', { method: 'POST' });
        } finally {
            setAdminToken(null);
        }
    };

    global.ApiService = {
        request,
        createOrder,
        getOrders,
        getStats,
        updateOrderStatus,
        loginAdmin,
        logoutAdmin,
        setAdminToken,
        getAdminToken
    };
})(window);
