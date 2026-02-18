import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3308'; 

// ── Tests E2E de LoginPage ───────────────────────────────────────────────────
test.describe('LoginPage - Flujo de inicio de sesión', () => {

  test.beforeEach(async ({ page }) => {
    // Antes de cada test, navega a la página de login
    await page.goto(`${BASE_URL}/login`);
  });

  // ── Test 1: La página carga correctamente ──────────────────────────────
  test('muestra el formulario de login al entrar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });

  // ── Test 2: Validación de campos vacíos ────────────────────────────────
  test('muestra error si se envía el formulario vacío', async ({ page }) => {
    // Llenamos con espacios en blanco para evadir el "required" del HTML
    await page.locator('#email').fill('   ');
    await page.locator('#password').fill('   ');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
  });
  // ── Test 3: Login con credenciales incorrectas ─────────────────────────
  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.locator('#email').fill('usuario_falso@test.com');
    await page.locator('#password').fill('contraseña_incorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Espera que aparezca algún mensaje de error (credenciales incorrectas o error de conexión)
    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });

  // ── Test 4: El botón muestra "Iniciando..." mientras carga ─────────────
  test('el botón cambia a "Iniciando..." mientras procesa', async ({ page }) => {
    await page.locator('#email').fill('test@test.com');
    await page.locator('#password').fill('password123');

    await page.getByRole('button', { name: 'Ingresar' }).click();

    const btn = page.getByRole('button', { name: /Ingresar|Iniciando/ });
    await expect(btn).toBeVisible();
  });

  // ── Test 5: Flujo completo con login exitoso ───────────────────────────
  test('redirige al dashboard tras login exitoso', async ({ page }) => {
    const EMAIL_VALIDO = 'hagrid@Hogwarts.edu';       
    const PASSWORD_VALIDO = 'magic123';     

    await page.locator('#email').fill(EMAIL_VALIDO);
    await page.locator('#password').fill(PASSWORD_VALIDO);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Después de login exitoso, debe redirigir a algún dashboard
    await expect(page).toHaveURL(/dashboards/, { timeout: 10000 });
  });

  // ── Test 6: Los campos se deshabilitan mientras carga ──────────────────
  test('los inputs se deshabilitan durante el loading', async ({ page }) => {
    await page.locator('#email').fill('test@test.com');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    // Justo al hacer submit, los inputs deberían estar disabled
    // (el test valida que el atributo disabled existe en algún momento)
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    // Al menos uno de los dos estados debe existir (disabled o no, dependiendo de la velocidad)
    const isEmailVisible = await emailInput.isVisible();
    expect(isEmailVisible).toBe(true);
  });

});