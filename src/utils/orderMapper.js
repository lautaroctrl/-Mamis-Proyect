const parseProducts = (products) => {
    if (Array.isArray(products)) {
        return products;
    }

    try {
        return JSON.parse(products || '[]');
    } catch {
        return [];
    }
};

const getOrderReference = (order) => {
    if (order.tipo === 'Envío') {
        return order.direccion || null;
    }

    return order.nombre || null;
};

const mapOrderForClient = (order) => {
    const mapped = {
        ...order,
        productos: parseProducts(order.productos),
        referencia: getOrderReference(order)
    };

    delete mapped.estado;
    return mapped;
};

module.exports = {
    parseProducts,
    getOrderReference,
    mapOrderForClient
};
