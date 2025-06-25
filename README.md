# Dashboard Grid

Proyecto React con Vite, TypeScript, Tailwind CSS y arquitectura hexagonal para el frontend.

## 🚀 Características

- **React 19** con TypeScript
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Arquitectura Hexagonal** orientada al frontend
- **Autenticación** con datos mockeados
- **Ruteo** con React Router DOM
- **Estado global** con Zustand
- **Validación de formularios** con React Hook Form + Zod
- **Iconos** con Lucide React

## 📁 Estructura del Proyecto

```
src/
├── domain/                    # Capa de dominio
│   ├── entities/             # Entidades del negocio
│   ├── repositories/         # Interfaces de repositorios
│   └── services/            # Servicios del dominio
├── application/             # Capa de aplicación
│   └── use-cases/          # Casos de uso
├── infrastructure/          # Capa de infraestructura
│   ├── repositories/       # Implementaciones de repositorios
│   └── di/                # Inyección de dependencias
└── presentation/           # Capa de presentación
    ├── components/         # Componentes React
    ├── pages/             # Páginas
    ├── hooks/             # Hooks personalizados
    └── stores/            # Estado global
```

## 🔧 Instalación Manual de Dependencias

Para instalar las dependencias de forma manual, ejecuta los siguientes comandos:

### Dependencias principales:

```bash
npm install react@^19.1.0 react-dom@^19.1.0
npm install react-router-dom@^7.6.2
npm install zustand@^5.0.5
npm install react-hook-form@^7.58.1
npm install @hookform/resolvers@^5.1.1
npm install zod@^3.25.67
npm install lucide-react@^0.523.0
```

### Dependencias de desarrollo:

```bash
npm install -D @types/react@^19.1.8 @types/react-dom@^19.1.6
npm install -D @types/node@^24.0.4
npm install -D @vitejs/plugin-react@^4.6.0
npm install -D vite@^7.0.0
npm install -D typescript@^5.8.3
npm install -D tailwindcss@^4.1.10
npm install -D autoprefixer@^10.4.21
npm install -D postcss@^8.5.6
```

### Alternativa (todas las dependencias en un comando):

```bash
# Dependencias principales
npm install react@^19.1.0 react-dom@^19.1.0 react-router-dom@^7.6.2 zustand@^5.0.5 react-hook-form@^7.58.1 @hookform/resolvers@^5.1.1 zod@^3.25.67 lucide-react@^0.523.0

# Dependencias de desarrollo
npm install -D @types/react@^19.1.8 @types/react-dom@^19.1.6 @types/node@^24.0.4 @vitejs/plugin-react@^4.6.0 vite@^7.0.0 typescript@^5.8.3 tailwindcss@^4.1.10 autoprefixer@^10.4.21 postcss@^8.5.6
```

## 🚀 Scripts Disponibles

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar la build de producción
npm run preview

# Linting (requiere ESLint instalado)
npm run lint
```

## 🔐 Autenticación

El proyecto incluye un sistema de autenticación con datos mockeados. Puedes usar las siguientes credenciales:

### Usuarios de prueba:

- **Email:** `admin@example.com` | **Contraseña:** `admin123`
- **Email:** `john.doe@example.com` | **Contraseña:** `password123`

## 🎯 Funcionalidades

### Autenticación

- ✅ Login con validación de formularios
- ✅ Persistencia de sesión con localStorage
- ✅ Rutas protegidas
- ✅ Logout

### Navegación

- ✅ Ruteo con React Router DOM
- ✅ Rutas públicas y privadas
- ✅ Redirecciones automáticas

### Estado Global

- ✅ Gestión de estado con Zustand
- ✅ Persistencia de estado de autenticación
- ✅ Manejo de errores y loading states

## 🏗️ Arquitectura Hexagonal

La aplicación sigue los principios de la arquitectura hexagonal:

- **Dominio**: Contiene las entidades y reglas de negocio
- **Aplicación**: Casos de uso que orquestan el dominio
- **Infraestructura**: Implementaciones concretas (repositorios mock, DI)
- **Presentación**: Componentes React y lógica de UI

## 🚀 Empezar

1. Instala las dependencias manualmente usando los comandos anteriores
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abre tu navegador en `http://localhost:5173`
4. Usa las credenciales de prueba para acceder

## 🔄 Flujo de Trabajo

1. **Login**: Inicia sesión con las credenciales de prueba
2. **Dashboard**: Accede al dashboard protegido
3. **Navegación**: Usa la barra de navegación para navegar
4. **Logout**: Cierra sesión desde la barra de navegación

## 📝 Notas Técnicas

- Los datos de usuario están mockeados en `MockUserRepository`
- El token de autenticación es un JSON codificado en base64 (solo para demo)
- El estado se persiste en localStorage usando Zustand
- La validación de formularios usa Zod schemas
- Los estilos utilizan Tailwind CSS con clases utility-first
