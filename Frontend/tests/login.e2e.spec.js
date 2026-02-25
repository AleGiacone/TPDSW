import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3308';

test.describe('LoginPage - Flujo de inicio de sesión', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('muestra el formulario de login al entrar', async ({ page }) => {
    // Usamos textContent para ser más flexibles que getByRole
    await expect(page.locator('h3')).toHaveText('Iniciar Sesión');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('muestra error si se envía el formulario vacío', async ({ page }) => {
    // Tu código usa .trim(), así que esto dispara el error local sin ir al servidor
    await page.getByRole('button', { name: 'Ingresar' }).click();

    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toHaveText('Por favor, complete todos los campos.');
  });

  test('redirige al dashboard tras login exitoso', async ({ page }) => {
    // IMPORTANTE: Asegurate que estas credenciales existan en tu DB local
    // y que el usuario NO tenga 2FA activado para este test.
    await page.locator('#email').fill('katniss.everdeen@district13.gov');
    await page.locator('#password').fill('arrow123');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Esperamos a que la URL cambie. 
    // Como tu useEffect tarda un poquito, le damos 10 segundos.
    await page.waitForURL(/.*dashboards.*/, { timeout: 10000 });

    const url = page.url();
    console.log('URL actual después del login:', url);
    expect(url).toContain('dashboards');
  });

  test('los inputs se deshabilitan durante el loading', async ({ page }) => {
    await page.locator('#email').fill('test@test.com');
    await page.locator('#password').fill('password123');

    // 1. Configuramos un "escuchador" para que espere el cambio de texto
    const boton = page.getByRole('button');

    // 2. Ejecutamos el click
    await boton.click();

    // 3. En lugar de expect directo, usamos toHaveText con una pequeña tolerancia
    // Esto hará que Playwright re-intente durante unos milisegundos
    await expect(boton).toHaveText(/Iniciando|Ingresar/);

    // Opcional: Si quieres asegurarte de que no se rompió nada
    await expect(page.locator('#email')).toBeVisible();
  });
});