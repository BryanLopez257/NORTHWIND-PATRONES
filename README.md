# NorthWind - Sistema de Ventas con Clean Architecture y Blazor

Este proyecto es una solución empresarial basada en el dominio de ventas **Northwind**, diseñada siguiendo los principios de **Clean Architecture** (Arquitectura Limpia / Puertos y Adaptadores / Onion), **Blazor WebAssembly** en el frontend y **ASP.NET Core Web API** en el backend (.NET 10).

---

## 🏗️ Arquitectura de la Solución

El proyecto está organizado en 4 capas concéntricas más el módulo de seguridad e identidad:

```text
├── 1. Enterprise Business Rules/      # Entidades de dominio, especificaciones, eventos y excepciones
├── 2. Application Business Rules/     # Casos de uso, interactores e interfaces (Puertos Input/Output)
├── 3. Interface Adapters/             # Controladores, Presenters, Repositorios, Gateways y Razor Components
├── 4. Frameworks And Drivers/         # DataContexts (EF Core), IoC (Inyección de Dependencias) y Proyectos UI
│   ├── UI/NorthWind.Sales.WebApi/     # API REST (Endpoints, Swagger, Autenticación JWT)
│   └── UI/NorthWind.Sales.BlazorClient/ # Aplicación Frontend en Blazor WebAssembly
└── NorthWind.Membership/              # Módulo de Autenticación, ASP.NET Identity, Tokens JWT y Vistas
```

---

## 📋 Requisitos Previos

Asegúrate de contar con las siguientes herramientas instaladas en tu equipo:

1. **[.NET 10 SDK](https://dotnet.microsoft.com/download)** (versión `10.0.x` o superior).
   * Verifica tu versión con: `dotnet --version`
2. **IDE Recomendado**:
   * **Visual Studio 2022 o 2025** con la carga de trabajo *"Desarrollo de ASP.NET y web"*.
   * O **Visual Studio Code** con la extensión *C# Dev Kit*.
   * O **JetBrains Rider**.
3. **Motor de Base de Datos**:
   * **Microsoft SQL Server** (LocalDB, SQL Server Express o contenedor Docker).
4. **Herramienta dotnet-ef CLI** (opcional, recomendada para migraciones):
   ```bash
   dotnet tool install --global dotnet-ef
   ```

---

## 🗄️ Configuración de la Base de Datos

La aplicación utiliza tres bases de datos en SQL Server:
* `NorthWindDB`: Base de datos transaccional de órdenes, productos y clientes.
* `NorthWindLogsDB`: Base de datos de logs de dominio (`DomainLogs`).
* `NorthWindUsersDB`: Base de datos de membresía y usuarios (ASP.NET Core Identity).

### Cadena de conexión por defecto
Las cadenas se encuentran en `4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/appsettings.json`:
```text
Server=127.0.0.1,1433;User Id=sa;Password=1234;TrustServerCertificate=True;Encrypt=True;
```

> **Consejo si usas Docker**: Puedes levantar una instancia de SQL Server rápidamente con:
> ```bash
> docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=1234" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
> ```

### Aplicación de Migraciones / Tablas
Para inicializar y actualizar las bases de datos mediante EF Core CLI:

```bash
# 1. Base de datos de ventas (NorthWindDB)
dotnet ef database update --project "4. Frameworks And Drivers/DataContexts/NorthWind.Sales.Backend.DataContexts.EFCore" --context NorthWindSalesContext

# 2. Base de datos de logs (NorthWindLogsDB)
dotnet ef database update --project "4. Frameworks And Drivers/DataContexts/NorthWind.Sales.Backend.DataContexts.EFCore" --context NorthWindDomainLogsContext

# 3. Base de datos de usuarios (NorthWindUsersDB)
dotnet ef database update --project "NorthWind.Membership/NorthWind.Membership.Backend.AspNetIdentity" --context NorthWindMembershipContext
```

*Nota:* Si necesitas aplicar manualmente los cambios de facturas, también dispones del script SQL `create_invoices_tables.sql` en la raíz del repositorio.

---

## 🚀 Pasos para Clonar y Ejecutar el Proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/BryanLopez257/NORTHWIND-PATRONES.git
cd NORTHWIND-PATRONES
```

### 2. Restaurar dependencias y compilar
```bash
dotnet restore
dotnet build
```

---

## ⚡ Cómo Levantar los Servicios

### Opción A: Desde Visual Studio (Recomendado)
El proyecto incluye el archivo `NorthWind.slnLaunch.user` con el perfil de inicio múltiple ya preconfigurado:
1. Abre el archivo de solución `NorthWind.slnx`.
2. Verifica que en el botón de inicio de la barra de herramientas esté seleccionado el perfil `"Nuevo perfil"`.
3. Presiona **F5** (o Ctrl+F5).
4. Visual Studio levantará automáticamente tanto la **Web API** como el **Blazor Client**.

---

### Opción B: Desde la Consola / Terminal

Abre dos terminales en la carpeta raíz del proyecto:

#### Terminal 1 — Web API (Backend):
```bash
dotnet run --project "4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi"
```
* **URL:** `http://localhost:5000` / `https://localhost:5001`
* **Swagger UI:** [http://localhost:5000/swagger](http://localhost:5000/swagger)

#### Terminal 2 — Blazor Client (Frontend):
```bash
dotnet run --project "4. Frameworks And Drivers/UI/NorthWind.Sales.BlazorClient"
```
* **URL:** `http://localhost:7000` / `https://localhost:7001`

---

## 📧 Servicio de Notificaciones (SMTP / Mailtrap)
Para el envío de correos (notificaciones de órdenes), la Web API viene preconfigurada para pruebas con **Mailtrap** en `appsettings.json`:
* Host: `sandbox.smtp.mailtrap.io`
* Puerto: `2525`

---

## 🔐 Autenticación y Cuentas de Usuario
El sistema cuenta con autenticación basada en **JWT** y **ASP.NET Core Identity**.
* Al iniciar la aplicación en Blazor, dirígete a la opción de **Registro** para crear tu primer usuario.
* Una vez registrado, inicia sesión con tus credenciales para acceder a la gestión de órdenes, facturas y productos.

---

## 👥 Contribuciones y Equipo
* Proyecto presentado con calificación de **9**.
* Mantén el estándar de Clean Architecture y respeto de puertos/adaptadores en cada nuevo cambio.
# NORTHWIND-PATRONES
