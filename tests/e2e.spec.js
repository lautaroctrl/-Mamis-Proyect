const { test, expect } = require('@playwright/test');

// Nota: asegúrate de tener un servidor sirviendo el proyecto en http://localhost:8000
// Puedes usar: python -m http.server 8000  (o npx http-server -p 8000)

test.describe('Flujo básico de pedidos', () => {
  test('Agregar producto y verificar carrito', async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');

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
});
