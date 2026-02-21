// Configuración de la aplicación
// IMPORTANTE: Copia este archivo a config.js y modifica los valores

const CONFIG = {
    // Número de WhatsApp donde llegarán los pedidos (formato: código país + área + número)
    // Ejemplo: '543425907922' para Argentina
    whatsappNumber: '543425XXXXXX',
    
    // Hash SHA-256 de la contraseña del admin
    // Para generar el hash, abre la consola del navegador y ejecuta:
    // async function hashPassword(password) {
    //     const encoder = new TextEncoder();
    //     const data = encoder.encode(password);
    //     const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    //     const hashArray = Array.from(new Uint8Array(hashBuffer));
    //     return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    // }
    // hashPassword('tu_contraseña').then(console.log);
    adminPasswordHash: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    
    // Duración de la sesión de admin en milisegundos (default: 30 minutos)
    adminSessionDuration: 30 * 60 * 1000,
    
    // Duración del bloqueo tras intentos fallidos (default: 5 minutos)
    adminLockDuration: 5 * 60 * 1000,
    
    // Número máximo de intentos fallidos antes de bloquear (default: 5)
    adminMaxAttempts: 5
};

// No modificar esta línea - hace que CONFIG esté disponible globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
