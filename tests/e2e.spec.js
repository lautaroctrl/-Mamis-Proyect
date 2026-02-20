const { test, expect } = require('@playwright/test');

// Nota: asegúrate de tener un servidor sirviendo el proyecto en http://localhost:8000
// Puedes usar: python -m http.server 8000  (o npx http-server -p 8000)

const BASE_URL = 'http://localhost:8000/index.html';

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Flujo básico de pedidos', () => {
  test('Agregar producto y verificar carrito', async ({ page }) => {
    // Expandir la categoría Simples
    await page.click('text=Simples');
    // Esperar que aparezcan los productos
    const productosCount = await page.locator('.productos-categoria .producto').count();
    expect(productosCount).toBeGreaterThan(0);

    // Agregar el primer producto
    await page.click('.productos-categoria .producto button');

    // Verificar que el carrito tenga un item
    await expect(page.locator('#lista-carrito .item-carrito')).toHaveCount(1);

    // Aumentar cantidad
    await page.click('#lista-carrito .controles-cantidad button:has-text("+")');
    await expect(page.locator('#lista-carrito .cantidad')).toHaveText('2');

    // Reducir cantidad
    await page.click('#lista-carrito .controles-cantidad button:has-text("-")');
    await expect(page.locator('#lista-carrito .cantidad')).toHaveText('1');

    // Eliminar con emoji
    await page.click('#lista-carrito .btn-eliminar');
    await expect(page.locator('#lista-carrito .item-carrito')).toHaveCount(0);
  });

  test('Enviar pedido incluye aclaración en mensaje de WhatsApp', async ({ page }) => {
    await page.addInitScript(() => {
      window.__lastOpenedUrl = '';
      window.open = (url) => {
        window.__lastOpenedUrl = url;
        return null;
      };
    });

    await page.reload();

    await page.click('text=Simples');
    await page.click('.productos-categoria .producto button');

    await page.selectOption('#tipo', 'Retiro');
    await page.fill('#nombre', 'Lautaro');
    await page.selectOption('#horario', '10:30');
    await page.selectOption('#pago', 'Efectivo');
    await page.fill('#telefono', '3425000000');
    await page.fill('#aclaracion', 'sin cebolla');

    await page.click('button[type="submit"]');

    const url = await page.evaluate(() => window.__lastOpenedUrl);
    expect(url).toContain('wa.me');
    expect(decodeURIComponent(url)).toContain('📝 Aclaración: sin cebolla');
  });

  test('Horario solo acepta opciones válidas del selector', async ({ page }) => {
    const valorInicial = await page.locator('#horario').inputValue();
    expect(valorInicial).toBe('');

    const validezInicial = await page.locator('#horario').evaluate(el => el.checkValidity());
    expect(validezInicial).toBeFalsy();

    await page.selectOption('#horario', '18:30');
    const validezConValor = await page.locator('#horario').evaluate(el => el.checkValidity());
    expect(validezConValor).toBeTruthy();

    await page.locator('#horario').evaluate(el => {
      el.value = '09:00';
    });

    const valorTrasInvalido = await page.locator('#horario').inputValue();
    expect(valorTrasInvalido).toBe('');
  });

  test('Admin se bloquea temporalmente tras múltiples intentos fallidos', async ({ page }) => {
    await page.click('#btn-admin');

    const mensajes = [];
    page.on('dialog', async dialog => {
      mensajes.push(dialog.message());
      await dialog.accept();
    });

    for (let intento = 0; intento < 5; intento++) {
      await page.fill('#admin-password', `invalida-${intento}`);
      await page.click('#admin-login');
    }

    await expect.poll(() => mensajes.length).toBeGreaterThanOrEqual(5);
    expect(mensajes[4]).toContain('Demasiados intentos fallidos');

    await page.fill('#admin-password', 'admin');
    await page.click('#admin-login');

    await expect.poll(() => mensajes[mensajes.length - 1]).toContain('Acceso bloqueado temporalmente');
    await expect(page.locator('#admin-content')).toBeHidden();
  });
});
