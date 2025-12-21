# Asfales Web - Backend API

<p align="left">
  <a href="http://nestjs.com/" target="blank"><img src="https://wfcc6kelz9zexsot.public.blob.vercel-storage.com/20-vRibJMLzjhkcZHiTmRHZbI477Lks4r.png" width="60" alt="Asales Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="60" alt="Nest Logo" /></a>
</p>

![Vercel](https://vercelbadge.vercel.app/api/CourantLuna/asfales-web-backend)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

API RESTful robusta construida con **NestJS** que sirve como el núcleo lógico de la plataforma Asfales. Se caracteriza por utilizar **Google Sheets** como capa de persistencia (Base de Datos) y **Firebase** para la validación de seguridad.

🔗 **Base URL:** [https://asfales-web-backend.vercel.app/](https://asfales-web-backend.vercel.app/)

## 🧠 Arquitectura y Módulos

La aplicación sigue una arquitectura modular escalable:

* **AppModule:** Módulo raíz que orquesta la configuración.
* **SheetsModule:** Servicio centralizado que abstrae la API de Google Sheets. Funciona como un ORM personalizado permitiendo métodos `find`, `create`, `update`, `delete` sobre filas de Excel.
* **AuthModule:** Middleware y Guards para validar tokens JWT de Firebase.
* **UserModule:** Gestión de perfiles de usuario, lógica de actualización de JSONs complejos (Lealtad, Pagos) y cálculo de puntos.
* **BookingsModule:** Creación y consulta de reservas.
* **FavoritesModule:** Gestión de listas de deseos.

## 💾 Estrategia de Base de Datos

El sistema no utiliza SQL ni NoSQL tradicional. Utiliza **Google Sheets** mediante una Service Account.
* Cada "Hoja" (Tab) en el Spreadsheet actúa como una tabla.
* Los datos complejos (Direcciones, Preferencias) se almacenan como **JSON Strings** dentro de celdas específicas, permitiendo estructuras flexibles dentro de un formato rígido.

## 🚀 Instalación y Ejecución

1.  **Clonar repositorio:**
    ```bash
    git clone [https://github.com/CourantLuna/asfales-web-backend.git](https://github.com/CourantLuna/asfales-web-backend.git)
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    El sistema requiere credenciales críticas de Google Cloud. Crea un archivo `.env`:
    ```env
    # Google Sheets Credentials
    GOOGLE_PROJECT_ID=tu-project-id
    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
    GOOGLE_CLIENT_EMAIL=tu-service-account@...

    # Spreadsheet IDs (Tablas)
    SPREADSHEET_ID_USER=1T4Vtp2QAE30iNh4vc4DkzV0TRmHio0FcORpqx59G2E0
    # ... otros IDs de hojas
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run start:dev
    ```

## 📡 Endpoints Principales

### Usuarios
* `GET /perfil/:uid` - Obtener perfil completo.
* `PUT /perfil/:uid` - Actualizar datos (acepta partial updates).
* `PATCH /perfil/:uid/recharge` - Recargar saldo en billetera.

### Reservas
* `POST /bookings` - Crear nueva reserva (Desencadena lógica de lealtad).
* `GET /bookings/user/:uid` - Obtener historial.

### Sheets (Genérico - Admin)
* `GET /sheets/:id/:range` - Lectura directa (protegida).

## 👥 Equipo
Desarrollado por el Heydi García Sánchez - Proyecto Asfales.
