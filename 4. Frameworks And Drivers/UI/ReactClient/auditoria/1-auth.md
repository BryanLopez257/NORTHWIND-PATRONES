# Reporte de Auditoría de Paridad Técnica: Módulo de Autenticación
**Proyecto:** NorthWind Sales System  
**Rama Origen (Línea Base):** `main` (Blazor WebAssembly)  
**Rama Destino (Evaluada):** `React` (React Client 19 + Vite + TypeScript)  
**Fecha de Auditoría:** 21 de Octubre de 2026  
**Auditor:** Subagente 1 - Especialista en Auditoría de Autenticación  

---

## 1. Resumen Ejecutivo

El presente informe detalla la auditoría exhaustiva de paridad de interfaz, experiencia de usuario (UX), reglas de negocio y validación entre la implementación original de autenticación en **Blazor WebAssembly** y la nueva implementación en **React Client**.

### Diagnóstico General de Paridad
| Componente / Característica | % Paridad Estimada | Estado General | Hallazgo Principal |
| :--- | :---: | :---: | :--- |
| **Página / Componente de Login** | 78% | ⚠️ Desviaciones Menores/Medias | Labels e iconografía discordantes; textos de bienvenida y footer alterados respecto a la línea base. |
| **Página / Componente de Registro** | 58% | 🛑 Desviaciones Críticas | Omisión total de textos explicativos de ayuda (`form-text`); placeholders distintos; flujo de éxito alterado (redirección forzada en vez de confirmación en pantalla); validaciones Zod no replican el regex estricto de Blazor para correos y caracteres especiales. |
| **Flujo y Página de Logout** | 20% | 🛑 Brecha Crítica | **Inexistencia de `LogoutPage`**. Blazor cuenta con pantalla `/user/logout` con confirmación explícita ("Confirmar Salida" / "Volver") y redirección a `/`; React ejecuta logout directo desde el navbar redirigiendo a `/login`. |
| **Esquemas de Validación y Mensajes** | 65% | ⚠️ Desviaciones Altas | Mensajes de error no coinciden palabra por palabra con los recursos estáticos de C# (`UserRegistrationMessages`, `UserLoginMessages`). Falta prevención de emojis y control estricto de caracteres en email y contraseñas. |

---

## 2. Correspondencia de Archivos y Arquitectura

| Módulo Blazor (`main`) | Módulo React (`React`) | Rol Arquitectural |
| :--- | :--- | :--- |
| `Components/UserLoginComponent.razor` & `.cs` | `src/features/auth/pages/LoginPage.tsx` | Vista / Formulario de inicio de sesión |
| `Pages/UserLoginPage.razor` & `.cs` | `src/features/auth/pages/LoginPage.tsx` + `AppRouter.tsx` | Enrutamiento de Login (`/user/login`) |
| `Components/UserRegistrationComponent.razor` & `.cs` | `src/features/auth/pages/RegisterPage.tsx` | Vista / Formulario de registro de usuario |
| `Pages/UserRegistrationPage.razor` & `.cs` | `src/features/auth/pages/RegisterPage.tsx` + `AppRouter.tsx` | Enrutamiento de Registro (`/user/register`) |
| `Pages/LogoutPage.razor` & `.cs` | *(No implementado en React)* | Vista de confirmación de salida (`/user/logout`) |
| `Components/LoginDisplayComponent.razor` | `src/shared/layouts/MainLayout.tsx` (Navbar Header) | Indicador de sesión de usuario y botón de salida |
| `ViewModels/UserLogin/UserLoginViewModelValidator.cs`<br>`Entities/Validators/UserLogin/UserCredentialsDtoValidator.cs` | `src/features/auth/schemas.ts` (`loginSchema`) | Reglas de validación de inicio de sesión |
| `ViewModels/UserRegistration/UserRegistrationViewModelValidator.cs`<br>`Entities/Validators/UserRegistration/UserRegistrationDtoValidator.cs` | `src/features/auth/schemas.ts` (`registerSchema`) | Reglas de validación de registro |
| `Resources/UserLoginMessages.cs`<br>`Entities/Resources/UserLoginMessages.cs` | Mensajes hardcodeados en `schemas.ts` y vistas | Textos y mensajes del flujo de login |
| `Resources/UserRegistrationMessages.cs`<br>`Entities/Resources/UserRegistrationMessages.cs`<br>`Resources/CommonMessages.cs` | Mensajes hardcodeados en `schemas.ts` y vistas | Textos y mensajes del flujo de registro y comunes |
| `AuthenticationStateProviders/JWTAuthenticationStateProvider.cs` | `src/core/auth/useAuthStore.ts` & `tokenUtils.ts` | Gestión de estado reactivo de sesión y token JWT |

---

## 3. Auditoría Detallada por Dimensión

### 3.1. Dimensión 1: Etiquetas (Labels) e Iconografía de Campos

En Blazor, todas las etiquetas de formulario incorporan un icono temático en azul primario (`text-primary`), y las cadenas provienen centralizadas de `CommonMessages` y `UserRegistrationMessages`. En React se omitieron los iconos en los labels y se añadieron asteriscos o nombres modificados.

#### Tabla Comparativa: Login
| Campo | Blazor (`main`) | React (`React`) | Disparidad / Impacto |
| :--- | :--- | :--- | :--- |
| **Email** | `<i class="bi bi-envelope text-primary"></i> Correo` | `Correo Electrónico` | Modificó el texto (agregó "Electrónico") y omitió el icono `envelope`. |
| **Password** | `<i class="bi bi-key text-primary"></i> Contraseña` | `Contraseña` | Omitió el icono `key` en el label. |

#### Tabla Comparativa: Registro
| Campo | Blazor (`main`) | React (`React`) | Disparidad / Impacto |
| :--- | :--- | :--- | :--- |
| **Primer Nombre** | `<i class="bi bi-person text-primary"></i> Primer Nombre` | `Primer Nombre *` | Agregó asterisco `*`, omitió icono `person`. |
| **Segundo Nombre** | `<i class="bi bi-person text-primary"></i> Segundo Nombre (Opcional)` | `Segundo Nombre` | Omitió `(Opcional)` del label oficial y omitió el icono `person`. |
| **Primer Apellido** | `<i class="bi bi-person text-primary"></i> Primer Apellido` | `Primer Apellido *` | Agregó asterisco `*`, omitió icono `person`. |
| **Segundo Apellido** | `<i class="bi bi-person text-primary"></i> Segundo Apellido (Opcional)` | `Segundo Apellido` | Omitió `(Opcional)` del label oficial y omitió el icono `person`. |
| **Correo** | `<i class="bi bi-envelope text-primary"></i> Correo` | `Correo Electrónico Corporativo *` | Añadió terminología ajena ("Corporativo") y asterisco; omitió icono `envelope`. |
| **Contraseña** | `<i class="bi bi-key text-primary"></i> Contraseña` | `Contraseña *` | Agregó asterisco `*`, omitió icono `key`. |
| **Confirmación Contraseña** | `<i class="bi bi-shield-check text-primary"></i> Confirmar contraseña` | `Confirmar Contraseña *` | Capitalización ("Contraseña" vs "contraseña"), asterisco adicional, omitió icono `shield-check`. |

---

### 3.2. Dimensión 2: Placeholders y Atributos de Entrada

Blazor utiliza prefijos de ejemplo (`Ej. ...`) en los campos de texto del registro para guiar el formato esperado, y define atributos estándar HTML5 como `autocomplete` y `maxlength`.

#### Tabla Comparativa: Placeholders y Atributos
| Campo | Placeholder Blazor | Placeholder React | Atributos Blazor (`main`) | Atributos React (`React`) |
| :--- | :--- | :--- | :--- | :--- |
| **Login - Email** | `ejemplo@northwind.com` | `ejemplo@northwind.com` | `id="Email" class="form-control"` | `id="login-email" type="email" autoComplete="email"` |
| **Login - Password** | `••••••••` | `••••••••` | `type="password"` | `type="password" autoComplete="current-password"` |
| **Reg - Primer Nombre** | `Ej. Juan` | `Juan` | `maxlength="50" autocomplete="given-name" data-letters-only` | `maxLength={50}` (Falta `autoComplete="given-name"`, falta prefijo `Ej. `) |
| **Reg - Segundo Nombre** | `Ej. Carlos` | `Carlos (opcional)` | `maxlength="50" autocomplete="additional-name" data-letters-only` | `maxLength={50}` (Falta `autoComplete="additional-name"`, placeholder incongruente) |
| **Reg - Primer Apellido** | `Ej. Pérez` | `Pérez` | `maxlength="50" autocomplete="family-name" data-letters-only` | `maxLength={50}` (Falta `autoComplete="family-name"`, falta prefijo `Ej. `) |
| **Reg - Segundo Apellido** | `Ej. Gómez` | `Gómez (opcional)` | `maxlength="50" autocomplete="family-name" data-letters-only` | `maxLength={50}` (Falta `autoComplete="family-name"`, placeholder incongruente) |
| **Reg - Email** | `ejemplo@northwind.com` | `juan.perez@northwind.com` | `maxlength="100" autocomplete="email"` | `maxLength={100}` (Falta `autoComplete="email"`, placeholder cambió a `juan.perez@...`) |
| **Reg - Password** | `Mínimo 6 caracteres` | `Mínimo 6 caracteres` | `maxlength="100" autocomplete="new-password" type="password"` | `maxLength={100} type="password"` (Falta `autoComplete="new-password"`) |
| **Reg - Confirm Password** | `Repite la contraseña` | `Repita su contraseña` | `maxlength="100" autocomplete="new-password" type="password"` | `maxLength={100} type="password"` (Cambio de formalidad tuteo/usted; falta `autoComplete="new-password"`) |

---

### 3.3. Dimensión 3: Ayudas Visuales, Textos Explicativos y Enlaces

Esta dimensión representa una de las mayores brechas visuales. Blazor incluye micro-ayudas visuales descriptivas debajo de cada campo en el registro para evitar frustración al usuario con las restricciones de validación. En React fueron **completamente suprimidas**.

#### Textos de Ayuda en Formulario de Registro (`form-text`)
| Campo | Texto de Ayuda en Blazor (`main`) | Estado en React (`React`) |
| :--- | :--- | :--- |
| **Primer Nombre** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Solo letras y espacios (2 a 50 caracteres). Sin emojis.</div>` | 🛑 **Ausente** |
| **Segundo Nombre** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Opcional. 2 a 50 caracteres. Sin emojis.</div>` | 🛑 **Ausente** |
| **Primer Apellido** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Solo letras y espacios (2 a 50 caracteres). Sin emojis.</div>` | 🛑 **Ausente** |
| **Segundo Apellido** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Opcional. 2 a 50 caracteres. Sin emojis.</div>` | 🛑 **Ausente** |
| **Email** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Solo letras, números, punto (.) y arroba (@). Máx. 100 caracteres.</div>` | 🛑 **Ausente** |
| **Password** | `<div class="form-text text-muted" style="font-size: 0.75rem;">Mín. 6, mayúscula, dígito y símbolo. Sin emojis.</div>` | 🛑 **Ausente** |

#### Títulos, Subtítulos y Footers
| Elemento | Blazor (`main`) | React (`React`) | Disparidad |
| :--- | :--- | :--- | :--- |
| **Login - Icon Badge** | Badge cuadrado con gradiente `#2563eb` a `#4f46e5` e icono `<i class="bi bi-person-fill-lock"></i>` | Caja azul celeste con icono `Store` | Icono representa una tienda comercial en React en vez de credenciales/seguridad de usuario. |
| **Login - Título** | `@UserLoginMessages.LoginButtonText` ("Iniciar sesión") | `NorthWind Sales` | En Blazor el título es el nombre de la acción ("Iniciar sesión"); en React se puso el nombre de la app. |
| **Login - Subtítulo** | `Ingresa tus credenciales para acceder al sistema` | `Ingrese sus credenciales corporativas para acceder al sistema` | Cambió tuteo por usted e inventó "corporativas". |
| **Login - Botón Enviar** | `<i class="bi bi-box-arrow-in-right"></i> Iniciar sesión` | `<LogIn /> Iniciar Sesión` | Capitalización ("Sesión" vs "sesión"). |
| **Login - Footer Texto** | `¿No tienes una cuenta aún?` | `¿No tiene una cuenta corporativa?` | Incongruencia textual. |
| **Login - Footer Link** | `href="user/register"` -> `Crear cuenta` | `to="/register"` -> `Regístrese aquí` | Texto del enlace diferente; ruta sin prefijo de compatibilidad `/user/register`. |
| **Reg - Icon Badge** | Badge con gradiente e icono `<i class="bi bi-person-plus-fill"></i>` | Caja azul celeste con icono `Store` | Debería ser `UserPlus` con gradiente correspondiente. |
| **Reg - Título** | `@UserRegistrationMessages.RegisterButtonText` ("Registrar") | `Registro de Usuario` | Incongruencia textual. |
| **Reg - Subtítulo** | `Crea tu cuenta para comenzar a operar en NorthWind` | `Complete sus datos para crear su cuenta en NorthWind Sales` | Incongruencia textual. |
| **Reg - Botón Enviar** | `<i class="bi bi-check2-circle"></i> Registrar` | `<UserPlus /> Registrar Cuenta` | En Blazor la acción es "Registrar" con icono check-circle. |
| **Reg - Footer Texto** | `¿Ya tienes una cuenta registrada?` | *(Solo muestra botón Volver)* | Omitió el texto descriptivo del footer. |
| **Reg - Footer Link** | `href="user/login"` -> `Iniciar sesión` | `<ArrowLeft /> Volver a Iniciar Sesión` | Incongruencia de diseño y mensaje. |

---

### 3.4. Dimensión 4: Reglas de Validación, Regex y Mensajes (Zod vs FluentValidation)

En Blazor, las validaciones corren tanto en cliente como en backend a través de FluentValidation (`UserRegistrationDtoValidator.cs` y `UserCredentialsDtoValidator.cs`). En React, se implementaron con Zod (`schemas.ts`), pero existen notables diferencias en regex y mensajes de error.

#### Comparativa de Reglas y Mensajes: Login
| Regla | Mensaje Blazor (`main`) | Mensaje React Zod (`React`) | Estado |
| :--- | :--- | :--- | :--- |
| **Email Vacío** | `El correo es requerido.` | `El correo electrónico es requerido` | ❌ Discrepancia en texto ("electrónico", falta punto) |
| **Email Formato Inválido** | `El formato de correo no es válido.` | `Ingrese un correo electrónico válido` | ❌ Discrepancia en texto literal |
| **Password Vacío** | `La contraseña es requerida.` | `La contraseña es requerida` | ⚠️ Falta punto final |

#### Comparativa de Reglas y Mensajes: Registro
| Campo / Regla | Mensaje Blazor (`main`) | Mensaje React Zod (`React`) | Disparidad / Brecha |
| :--- | :--- | :--- | :--- |
| **FirstName - Requerido** | `El primer nombre es requerido.` | *(No tiene min(1) específico)* | Si se deja vacío, cae en error genérico de min(2). |
| **FirstName - Longitud (2-50)** | `El primer nombre debe tener entre 2 y 50 caracteres.` | `El primer nombre debe tener al menos 2 caracteres` / `no puede exceder 50 caracteres` | Blazor usa un único mensaje de rango; React divide en min y max con textos diferentes. |
| **FirstName - Caracteres** | `El primer nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).` | `El nombre solo puede contener letras y espacios` | Falta la aclaración de emojis y caracteres especiales. |
| **SecondName - Longitud** | `El segundo nombre debe tener entre 2 y 50 caracteres.` | `El segundo nombre debe tener entre 2 y 50 caracteres` | Coincide (falta punto final). |
| **SecondName - Caracteres** | `El segundo nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).` | `El segundo nombre solo puede contener letras y espacios` | Falta la aclaración de emojis y caracteres especiales. |
| **LastName - Requerido** | `El primer apellido es requerido.` | *(No tiene min(1) específico)* | Cae en min(2). |
| **LastName - Longitud (2-50)** | `El primer apellido debe tener entre 2 y 50 caracteres.` | `El primer apellido debe tener al menos 2 caracteres` / `no puede exceder...` | Mensaje desalineado. |
| **LastName - Caracteres** | `El primer apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).` | `El apellido solo puede contener letras y espacios` | Mensaje desalineado. |
| **SecondLastName - Longitud**| `El segundo apellido debe tener entre 2 y 50 caracteres.` | `El segundo apellido debe tener entre 2 y 50 caracteres` | Coincide (falta punto final). |
| **SecondLastName - Caracteres**| `El segundo apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).`| `El segundo apellido solo puede contener letras y espacios` | Mensaje desalineado. |
| **Email - Requerido** | `El correo es requerido.` | `El correo electrónico es requerido` | Texto desalineado ("electrónico", falta punto). |
| **Email - Máximo 100** | `El correo no debe superar los 100 caracteres.` | `El correo no puede exceder 100 caracteres` | Texto diferente ("superar" vs "exceder"). |
| **Email - Caracteres y Emojis** | `El correo solo puede contener letras, números, punto (.) y arroba (@). No se permiten otros caracteres especiales, espacios ni emojis.` | 🛑 **No implementado en Zod** | Blazor valida `^[a-zA-Z0-9.@]+$`, sin espacios y sin emojis. React no tiene esta restricción en `registerSchema`. |
| **Email - Formato** | `El formato de correo no es válido.` | `Ingrese un formato de correo electrónico válido` | Mensaje desalineado. |
| **Password - Requerido** | `La contraseña es requerida.` | *(No tiene min(1) específico)* | Cae en min(6). |
| **Password - Mínimo 6** | `Se requiere al menos 6 caracteres en la contraseña.` | `La contraseña debe tener al menos 6 caracteres` | Mensaje desalineado. |
| **Password - Máximo 100** | `La contraseña no debe superar los 100 caracteres.` | `La contraseña no puede exceder 100 caracteres` | Mensaje desalineado. |
| **Password - Emojis y espacios** | `La contraseña no debe contener emojis ni espacios en blanco.` | 🛑 **No implementado en Zod** | React no verifica espacios en blanco ni emojis en el schema de cliente. |
| **Confirmación Contraseña** | `La contraseña y la confirmación no coinciden.` | `Las contraseñas no coinciden` | Mensaje desalineado ("Las contraseñas no coinciden" vs texto oficial de Blazor). |

---

### 3.5. Dimensión 5: Feedback Visual de Error y Éxito

#### 1. Flujo posterior a Registro Exitoso
- **Comportamiento Blazor:**  
  Al registrarse satisfactoriamente, el usuario **permanece en la página de registro** y se despliega un banner de éxito verde destacado:
  ```html
  <div class="alert alert-success d-flex align-items-center mb-4">
      <i class="bi bi-check-circle-fill me-2 fs-5"></i>
      <div>Usuario registrado exitosamente.</div>
  </div>
  ```
  El formulario se limpia o se mantiene listo para que el usuario navegue a login mediante el enlace del footer cuando lo desee.
- **Comportamiento React:**  
  Ejecuta inmediatamente `navigate('/login', { state: { registered: true }, replace: true });` y muestra en la página de login un banner que dice: `"¡Cuenta creada con éxito! Ya puede iniciar sesión."`.
- **Incongruencia:**  
  Rompe el flujo y el mensaje exacto de Blazor (`"Usuario registrado exitosamente."`).

#### 2. Visualización de Errores de Validación y Servidor
- **Blazor:**  
  - Errores de validación de campos: aparecen inline bajo cada input mediante `<ValidationMessage For="@(() => ViewModel.Email)" />` y un bloque `<ValidationSummary />` al inicio del formulario.
  - Errores generales del servidor: banner rojo con `<i class="bi bi-exclamation-triangle-fill"></i>` y mensaje devuelto o fallback: `"Error inesperado en el servidor. Ocurrió un error inesperado al procesar la solicitud. Contactese con el Administrador."`.
  - Mapeo de `ValidationError`: Si el backend responde con errores de validación de FluentValidation (ej. duplicidad de usuario `DuplicateUserNameErrorMessage`), el View Model los inyecta en los campos correspondientes.
- **React:**  
  - `LoginPage.tsx` y `RegisterPage.tsx` mapean `fieldErrors` correctamente con `setError(key, { message })`, lo cual es correcto.
  - Sin embargo, los fallbacks de error son: `'Error al registrar el usuario.'` o `'Error al iniciar sesión. Inténtelo más tarde.'` en lugar del mensaje de fallo genérico de Blazor.

---

### 3.6. Dimensión 6: Comportamiento en Logout (Confirmación, Limpieza y Redirección)

Esta dimensión presenta una **omisión arquitectural crítica**:

#### 1. Pantalla de Confirmación de Logout
- **Blazor (`LogoutPage.razor`):**
  Existe una ruta `@page "/user/logout"` con una tarjeta de confirmación estilizada:
  - Icono distintivo en badge rojo: gradiente `#ef4444` a `#b91c1c` con sombra roja e icono `<i class="bi bi-box-arrow-right"></i>`.
  - Título: `Cerrar sesión`.
  - Subtítulo: `¿Estás seguro de que deseas salir del sistema?`.
  - Dos botones de acción centrados:
    1. `<a href="" class="btn btn-secondary px-4"><i class="bi bi-arrow-left"></i> Volver</a>`
    2. `<button class="btn btn-danger px-4" @onclick="CloseSession"><i class="bi bi-check2"></i> Confirmar Salida</button>`
  - Al pulsar "Confirmar Salida", se ejecuta:
    ```csharp
    await AuthenticationStateProvider.LogoutAsync();
    NavigationManager.NavigateTo("/");
    ```
- **React (`ReactClient`):**
  - **No existe componente `LogoutPage.tsx`**.
  - **No existe ruta `/user/logout` ni `/logout` en `AppRouter.tsx`**.
  - En `MainLayout.tsx`, al hacer clic en el botón de salida del header, se ejecuta inmediatamente `logout()` y se redirige forzosamente a `/login` sin preguntar ni confirmar nada al usuario.

#### 2. Destino de Redirección tras Logout
- Blazor redirige a la raíz (`"/"`), donde la barra de navegación se actualiza a estado no autenticado (mostrando botones "Crear cuenta" e "Iniciar sesión").
- En React, al ser una Single Page Application protegida donde `/` redirige a `/createorder`, se redirige a `/login`. Si se crea `LogoutPage.tsx`, debe redirigir a `/login` o gestionar la página pública de inicio.

---

## 4. Matriz de Incongruencias y Brechas (Gap Matrix)

| ID | Área | Severidad | Descripción de la Brecha | Impacto |
| :---: | :--- | :---: | :--- | :--- |
| **GAP-01** | Logout | 🔴 **CRÍTICA** | **Falta total de `LogoutPage` y ruta `/user/logout`**. En Blazor hay diálogo de confirmación ("Volver" vs "Confirmar Salida"); en React se cierra de golpe. | Violación de paridad funcional y riesgo de logout accidental por clic involuntario. |
| **GAP-02** | Registro | 🔴 **CRÍTICA** | **Omisión de los 6 textos de ayuda (`form-text`) bajo los campos**. | El usuario no tiene guía de qué caracteres están permitidos (emojis, mayúsculas, dígitos, longitud). |
| **GAP-03** | Registro | 🟠 **ALTA** | **Flujo post-registro alterado**. Blazor no redirige; muestra alerta de éxito `"Usuario registrado exitosamente."` en la misma pantalla. React redirige inmediatamente a `/login`. | Disparidad de comportamiento respecto a los tests y especificaciones de Blazor. |
| **GAP-04** | Validación | 🟠 **ALTA** | **Validación de Email y Contraseña en Zod no restringe emojis ni caracteres no permitidos**. Blazor exige `^[a-zA-Z0-9.@]+$` en email y prohíbe espacios y emojis en password. | Errores no atrapados en el cliente que fallarán inesperadamente en el backend. |
| **GAP-05** | UI / Copy | 🟡 **MEDIA** | **Discrepancia en Labels, Placeholders y Mensajes de Validación Zod**. Uso de asteriscos `*`, adición de palabras como "Corporativo" o "Electrónico", y omisión de `(Opcional)`. | Inconsistencia de identidad visual y pruebas automatizadas E2E. |
| **GAP-06** | UI / Estilos | 🟡 **MEDIA** | **Iconos en labels e icon badges de login/registro**. En Blazor son `person-fill-lock` y `person-plus-fill` con gradientes azul y rojo; en React se usó un icono genérico de tienda `Store`. | Pérdida de la semántica visual de autenticación y membresía. |
| **GAP-07** | HTML5 | 🟢 **BAJA** | **Falta de atributos `autoComplete` exactos en Registro** (`given-name`, `additional-name`, `family-name`, `new-password`). | Pérdida de optimización para autocompletado del navegador. |

---

## 5. Plan de Refactorización para Paridad 100%

A continuación se presentan las especificaciones de código exactas para subsanar cada brecha.

### 5.1. Actualización de Esquemas Zod (`src/features/auth/schemas.ts`)
Debe alinearse con `UserRegistrationDtoValidator.cs`, `UserCredentialsDtoValidator.cs` y los archivos de recursos:

```typescript
import { z } from 'zod';

// Regex Blazor: ^[\p{L}\s]+$ (Letras Unicode y espacios)
const NAME_REGEX = /^[\p{L}\s]+$/u;

// Regex Blazor: ^[a-zA-Z0-9.@]+$ (Solo letras, dígitos, punto y arroba)
const EMAIL_CHARS_REGEX = /^[a-zA-Z0-9.@]+$/;

// Detección de emojis para emular ContainsEmoji de C#
const CONTAINS_EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido.')
    .email('El formato de correo no es válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'El primer nombre es requerido.')
      .min(2, 'El primer nombre debe tener entre 2 y 50 caracteres.')
      .max(50, 'El primer nombre debe tener entre 2 y 50 caracteres.')
      .refine(
        (val) => NAME_REGEX.test(val) && !CONTAINS_EMOJI_REGEX.test(val),
        'El primer nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    secondName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo nombre debe tener entre 2 y 50 caracteres.'
      )
      .refine(
        (val) => !val || (NAME_REGEX.test(val) && !CONTAINS_EMOJI_REGEX.test(val)),
        'El segundo nombre solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    lastName: z
      .string()
      .trim()
      .min(1, 'El primer apellido es requerido.')
      .min(2, 'El primer apellido debe tener entre 2 y 50 caracteres.')
      .max(50, 'El primer apellido debe tener entre 2 y 50 caracteres.')
      .refine(
        (val) => NAME_REGEX.test(val) && !CONTAINS_EMOJI_REGEX.test(val),
        'El primer apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    secondLastName: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || (val.length >= 2 && val.length <= 50),
        'El segundo apellido debe tener entre 2 y 50 caracteres.'
      )
      .refine(
        (val) => !val || (NAME_REGEX.test(val) && !CONTAINS_EMOJI_REGEX.test(val)),
        'El segundo apellido solo debe contener letras y espacios (sin emojis ni caracteres especiales).'
      ),
    email: z
      .string()
      .trim()
      .min(1, 'El correo es requerido.')
      .max(100, 'El correo no debe superar los 100 caracteres.')
      .refine(
        (val) => !/\s/.test(val) && !CONTAINS_EMOJI_REGEX.test(val) && EMAIL_CHARS_REGEX.test(val),
        'El correo solo puede contener letras, números, punto (.) y arroba (@). No se permiten otros caracteres especiales, espacios ni emojis.'
      )
      .email('El formato de correo no es válido.'),
    password: z
      .string()
      .min(1, 'La contraseña es requerida.')
      .min(6, 'Se requiere al menos 6 caracteres en la contraseña.')
      .max(100, 'La contraseña no debe superar los 100 caracteres.')
      .refine(
        (val) => !/\s/.test(val) && !CONTAINS_EMOJI_REGEX.test(val),
        'La contraseña no debe contener emojis ni espacios en blanco.'
      ),
    confirmPassword: z
      .string()
      .min(1, 'La contraseña y la confirmación no coinciden.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'La contraseña y la confirmación no coinciden.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
```

---

### 5.2. Creación de la Página de Confirmación de Salida (`src/features/auth/pages/LogoutPage.tsx`)

Recrea la experiencia idéntica de `LogoutPage.razor`:

```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Check } from 'lucide-react';
import { useAuthStore } from '@/core/auth/useAuthStore';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';

export const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleConfirmLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200">
      <Card className="w-full max-w-md shadow-xl border-slate-200/80 bg-white p-6 text-center">
        <CardContent className="pt-4 flex flex-col items-center">
          {/* Badge rojo de salida con gradiente como Blazor */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 mb-4">
            <LogOut className="h-7 w-7" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-1">Cerrar sesión</h3>
          <p className="text-slate-500 text-sm mb-6">
            ¿Estás seguro de que deseas salir del sistema?
          </p>

          <div className="flex justify-center gap-3 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="px-6 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmLogout}
              className="px-6 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Check className="h-4 w-4" />
              Confirmar Salida
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

### 5.3. Actualización de Rutas en `src/app/router/AppRouter.tsx`

Registrar la ruta de logout y asegurar la compatibilidad con los enlaces de Blazor:

```tsx
// Dentro de createBrowserRouter:
{
  path: '/logout',
  element: <LogoutPage />,
},
{
  path: '/user/logout',
  element: <LogoutPage />,
},
```

Y en `src/shared/layouts/MainLayout.tsx`, actualizar el botón del navbar:
```tsx
// Reemplazar la ejecución directa de logout por navegación a /logout:
<Button
  variant="outline"
  size="sm"
  onClick={() => navigate('/logout')}
  className="flex items-center space-x-1.5 text-slate-600 hover:text-red-600 hover:border-red-200"
>
  <LogOut className="h-4 w-4" />
  <span className="hidden sm:inline">Cerrar Sesión</span>
</Button>
```

---

### 5.4. Refactorización de `LoginPage.tsx`

1. **Header Badge:** Cambiar el icono `Store` por icono de seguridad/usuario con gradiente azul `#2563eb` a `#4f46e5` (`UserCheck` o `Lock`).
2. **Título y subtítulo:** `"Iniciar sesión"` y `"Ingresa tus credenciales para acceder al sistema"`.
3. **Labels:**
   - Correo: `<Mail className="h-4 w-4 text-blue-600 inline mr-1" /> Correo`
   - Contraseña: `<Key className="h-4 w-4 text-blue-600 inline mr-1" /> Contraseña`
4. **Botón:** `<LogIn className="h-4 w-4 mr-2" /> Iniciar sesión`
5. **Footer:**
   ```tsx
   <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
     ¿No tienes una cuenta aún?{' '}
     <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline ms-1">
       Crear cuenta
     </Link>
   </div>
   ```

---

### 5.5. Refactorización de `RegisterPage.tsx`

1. **Header Badge:** Badge azul con icono de adición de usuario (`UserPlus`).
2. **Título y subtítulo:** `"Registrar"` y `"Crea tu cuenta para comenzar a operar en NorthWind"`.
3. **Inclusión de los textos de ayuda (`form-text`):**
   Agregar debajo de cada `Input`:
   ```tsx
   <div className="text-slate-500 text-xs mt-1">
     Solo letras y espacios (2 a 50 caracteres). Sin emojis.
   </div>
   ```
4. **Labels exactos con icono:**
   - `<User className="h-4 w-4 text-blue-600 inline mr-1" /> Primer Nombre`
   - `<User className="h-4 w-4 text-blue-600 inline mr-1" /> Segundo Nombre (Opcional)`
   - `<User className="h-4 w-4 text-blue-600 inline mr-1" /> Primer Apellido`
   - `<User className="h-4 w-4 text-blue-600 inline mr-1" /> Segundo Apellido (Opcional)`
   - `<Mail className="h-4 w-4 text-blue-600 inline mr-1" /> Correo`
   - `<Key className="h-4 w-4 text-blue-600 inline mr-1" /> Contraseña`
   - `<ShieldCheck className="h-4 w-4 text-blue-600 inline mr-1" /> Confirmar contraseña`
5. **Placeholders exactos:**
   - `Ej. Juan`, `Ej. Carlos`, `Ej. Pérez`, `Ej. Gómez`, `ejemplo@northwind.com`, `Mínimo 6 caracteres`, `Repite la contraseña`.
6. **Manejo de Éxito en Pantalla:**
   - Estado `informationMessage`: si el registro es exitoso, setear `informationMessage = "Usuario registrado exitosamente."` y renderizar:
     ```tsx
     {informationMessage && (
       <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
         <CheckCircle2 className="h-5 w-5 text-emerald-600" />
         <div>{informationMessage}</div>
       </div>
     )}
     ```
7. **Footer:**
   ```tsx
   <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
     ¿Ya tienes una cuenta registrada?{' '}
     <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline ms-1">
       Iniciar sesión
     </Link>
   </div>
   ```

---

## 6. Conclusión y Checklist de Paridad

Para alcanzar el 100% de paridad con la solución de referencia en Blazor:
- [ ] Implementar `LogoutPage.tsx` con modal/tarjeta de confirmación y ruta `/user/logout`.
- [ ] Actualizar `schemas.ts` con todos los mensajes literales y regex de caracteres/emojis de C#.
- [ ] Restaurar en `RegisterPage.tsx` las ayudas visuales (`form-text`), labels con iconos y placeholders `Ej. ...`.
- [ ] Reemplazar la redirección post-registro por la alerta inline `"Usuario registrado exitosamente."`.
- [ ] Alinear títulos, subtítulos y enlaces de pie de página en `LoginPage.tsx` y `RegisterPage.tsx`.

*Reporte generado y guardado en:*  
`4. Frameworks And Drivers\UI\ReactClient\auditoria\1-auth.md`
