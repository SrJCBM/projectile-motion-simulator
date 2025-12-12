# 🚀 Projectile Motion Simulator (Simulador de Tiro Parabólico)

> **Versión:** 1.2.0  
> **Estado:** En Desarrollo 🚧  
> **Último Update:** Diciembre 2025  
> **Enfoque:** Usabilidad, Educación Interactiva y Portabilidad.

## 📖 Descripción del Proyecto

Aplicación web educativa diseñada para **visualizar, simular y analizar el movimiento de proyectiles en tiempo real**. El objetivo principal es cerrar la brecha entre las ecuaciones matemáticas abstractas y la realidad física, permitiendo a estudiantes de ingeniería y bachillerato experimentar con variables cinemáticas ($v_0$, $\theta$, $g$, $h$) en un entorno controlado, visual e intuitivo.

El sistema está diseñado rigurosamente bajo principios de **Ingeniería de Usabilidad (ISO 9241-11)** y las **Heurísticas de Nielsen**, garantizando una curva de aprendizaje mínima y una alta eficiencia en la realización de tareas académicas.

---

## 📊 Estado del Proyecto

### Resumen de Implementación

| Módulo | Estado | Progreso |
|--------|--------|----------|
| Estructura del Proyecto | ✅ Completo | 100% |
| Frontend Core | ✅ Completo | 95% |
| Backend API | ✅ Completo | 90% |
| Autenticación | ✅ Completo | 100% |
| Persistencia (MongoDB) | ✅ Completo | 95% |
| Usabilidad (Nielsen) | ⚠️ Parcial | 70% |
| Accesibilidad | ⚠️ Parcial | 60% |
| Documentación | ⚠️ Parcial | 75% |

---

## 🏗️ Arquitectura y Stack Tecnológico

El proyecto sigue una arquitectura **Cliente-Servidor** desacoplada pero portable, diseñada para funcionar tanto en la nube (**Render**) como en entornos locales (**Localhost**) sin dependencias críticas externas.

### **Frontend (Cliente)**
| Tecnología | Uso | Estado |
|------------|-----|--------|
| HTML5 Semántico | Estructura accesible | ✅ |
| CSS3 (Grid/Flexbox) | Layout responsivo | ✅ |
| JavaScript ES6+ Vanilla | Lógica de aplicación | ✅ |
| HTML5 Canvas API | Renderizado 60 FPS | ✅ |
| MathJax | Fórmulas LaTeX | ✅ |

### **Backend (Servidor API)**
| Tecnología | Uso | Estado |
|------------|-----|--------|
| Node.js | Runtime | ✅ |
| Express.js | Framework REST | ✅ |
| JWT | Autenticación | ✅ |
| bcryptjs | Hash de contraseñas | ✅ |
| pdfkit | Generación de reportes | ⚠️ Backend listo, UI pendiente |

### **Base de Datos**
| Tecnología | Uso | Estado |
|------------|-----|--------|
| MongoDB Atlas | Persistencia en la nube | ✅ |
| Mongoose | ODM | ✅ |

---

## 📂 Estructura del Proyecto

```bash
projectile-motion-simulator/
├── client/                     # Frontend
│   ├── index.html              # Landing page
│   ├── login.html              # Página de inicio de sesión
│   ├── register.html           # Página de registro
│   ├── simulator.html          # Interfaz principal del simulador
│   ├── css/
│   │   ├── style.css           # Estilos globales (Responsive + Variables CSS)
│   │   └── ui-components.css   # Componentes (Sliders, Botones, Cards, History)
│   └── js/
│       ├── physics.js          # Motor de física (Cálculos cinemáticos puros)
│       ├── canvas.js           # Renderizado y animación Canvas
│       ├── ui.js               # Manejo del DOM, Eventos y Sincronización
│       ├── api.js              # Comunicación con Backend (Fetch + JWT)
│       └── main.js             # Entry point y gestión de estado
├── server/                     # Backend API
│   ├── app.js                  # Configuración Express y Entry point
│   ├── package.json            # Dependencias del servidor
│   ├── .env.example            # Template de variables de entorno
│   ├── config/
│   │   └── database.js         # Conexión MongoDB
│   ├── controllers/
│   │   ├── authController.js   # Registro, Login, GetMe
│   │   ├── simulationController.js # CRUD de simulaciones
│   │   └── reportController.js # Generación de PDF
│   ├── middleware/
│   │   └── auth.js             # Middleware JWT (protect, optionalAuth)
│   ├── models/
│   │   ├── User.js             # Esquema de usuario (bcrypt, lastLogin)
│   │   └── Simulation.js       # Esquema de simulación
│   └── routes/
│       ├── auth.js             # Rutas de autenticación
│       ├── simulations.js      # Rutas CRUD simulaciones
│       └── reports.js          # Rutas de reportes PDF
├── render.yaml                 # Configuración para deploy en Render
├── .gitignore                  # Archivos ignorados (node_modules, .env)
└── README.md                   # Este archivo
```

---

## ✅ Funcionalidades Implementadas

### **Simulación de Física**
- [x] Cálculo de trayectoria parabólica en tiempo real
- [x] Parámetros ajustables: Velocidad inicial (v₀), Ángulo (θ), Altura inicial (h), Gravedad (g)
- [x] Presets de gravedad: Tierra (9.81), Luna (1.62), Marte (3.72)
- [x] Visualización de resultados: Altura máxima, Distancia, Tiempo de vuelo, Velocidad final
- [x] Vista previa de trayectoria (línea punteada)
- [x] Animación fluida a 60 FPS
- [x] Controles: Simular, Pausar, Reanudar, Reiniciar
- [x] Sincronización Slider ↔ Input numérico

### **Sistema de Usuarios**
- [x] Registro con nombre, email y contraseña
- [x] Hash de contraseñas con bcrypt (salt rounds: 10)
- [x] Login con JWT (token válido por 7 días)
- [x] Validación de campos con express-validator
- [x] Campo `lastLogin` con zona horaria UTC-5
- [x] Logout (eliminación de token en cliente)

### **Historial de Simulaciones**
- [x] Guardar simulaciones con nombre personalizado
- [x] Panel lateral de historial
- [x] Cargar simulación guardada (restaura parámetros)
- [x] Eliminar simulaciones
- [x] Ordenado por fecha (más reciente primero)
- [x] Paginación en API (limit, page)

### **Interfaz de Usuario**
- [x] Diseño minimalista y limpio
- [x] Paleta de colores consistente (Teal #2a9d8f)
- [x] Responsive (Mobile-first)
- [x] Notificaciones Toast
- [x] Formularios con validación visual
- [x] Toggle de visibilidad de contraseña

---

## ⚠️ Funcionalidades Parciales

### **Generación de Reportes PDF**
| Componente | Estado |
|------------|--------|
| Backend (`reportController.js`) | ✅ Implementado |
| Endpoint `POST /api/reports/generate` | ✅ Funcional |
| Botón "Descargar PDF" en UI | ❌ **Pendiente** |

### **Usabilidad (Heurísticas de Nielsen)**
| Heurística | Estado | Observación |
|------------|--------|-------------|
| 1. Visibilidad del estado | ⚠️ | Falta spinner de carga |
| 2. Correspondencia mundo real | ✅ | Terminología física correcta |
| 3. Control y libertad | ✅ | Pause, Reset, navegación |
| 4. Consistencia | ✅ | UI uniforme |
| 5. Prevención de errores | ⚠️ | Validación básica |
| 6. Reconocimiento vs recuerdo | ✅ | Labels claros |
| 7. Flexibilidad | ⚠️ | Atajos de teclado no documentados |
| 8. Diseño minimalista | ✅ | UI limpia |
| 9. Ayuda con errores | ⚠️ | Mensajes genéricos |
| 10. Documentación | ⚠️ | Sin tutorial/FAQ |

### **Accesibilidad (WCAG 2.1)**
| Criterio | Estado | Observación |
|----------|--------|-------------|
| Etiquetas ARIA | ✅ | `aria-label`, `aria-live` implementados |
| Skip links | ✅ | Enlace para saltar al contenido |
| Contraste de colores | ⚠️ | No verificado formalmente |
| Navegación por teclado | ⚠️ | Parcial |
| Modo oscuro | ❌ | **Pendiente** |
| Lectores de pantalla | ⚠️ | No testeado |

---

## ❌ Pendiente de Implementar

### **Alta Prioridad**
- [ ] Botón para descargar reporte PDF
- [ ] Loading spinner durante peticiones
- [ ] Mensajes de error más descriptivos
- [ ] Sección de ayuda/FAQ

### **Media Prioridad**
- [ ] **Modo Oscuro** 🌙
- [ ] **Internacionalización (Español/Inglés)** 🌐
- [ ] Tests unitarios (Jest)
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] PWA (Service Worker para modo offline)

### **Baja Prioridad**
- [ ] Comparación de múltiples trayectorias
- [ ] Exportar datos a CSV/Excel
- [ ] Compartir simulación por URL
- [ ] Resistencia del aire (parámetro opcional)
- [ ] Animación de proyectil mejorada

---

## 🚀 Instalación y Uso

### **Requisitos Previos**
- Node.js v18+
- MongoDB (local o Atlas)
- Git

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/SrJCBM/projectile-motion-simulator.git
cd projectile-motion-simulator
```

### **2. Configurar Backend**
```bash
cd server
npm install
```

### **3. Crear archivo `.env`**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/projectile-simulator

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development

# Timezone
TZ=America/Guayaquil
```

### **4. Iniciar el Servidor**
```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm start
```

### **5. Abrir el Frontend**
Abrir `client/simulator.html` en el navegador o usar Live Server en VS Code.

---

## 🌐 Despliegue en Render

### **Variables de Entorno en Render**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave_segura_produccion
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3000
TZ=America/Guayaquil
```

### **Configuración del Servicio**
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`

---

## 📡 API Endpoints

### **Autenticación**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### **Simulaciones**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/simulations` | Listar simulaciones | Sí |
| GET | `/api/simulations/:id` | Obtener una simulación | Sí |
| POST | `/api/simulations` | Guardar simulación | Sí |
| PUT | `/api/simulations/:id` | Actualizar simulación | Sí |
| DELETE | `/api/simulations/:id` | Eliminar simulación | Sí |

### **Reportes**
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/reports/generate` | Generar PDF | Opcional |

### **Health Check**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Estado del servidor |

---

## 🧮 Fórmulas Físicas Implementadas

### **Ecuación de Trayectoria**
$$y = h_0 + x \tan(\theta) - \frac{g \cdot x^2}{2 \cdot v_0^2 \cdot \cos^2(\theta)}$$

### **Posición en el Tiempo**
$$x(t) = v_0 \cdot \cos(\theta) \cdot t$$
$$y(t) = h_0 + v_0 \cdot \sin(\theta) \cdot t - \frac{1}{2} g t^2$$

### **Altura Máxima**
$$y_{max} = h_0 + \frac{v_0^2 \cdot \sin^2(\theta)}{2g}$$

### **Tiempo de Vuelo**
$$t = \frac{v_0 \cdot \sin(\theta) + \sqrt{(v_0 \cdot \sin(\theta))^2 + 2gh_0}}{g}$$

### **Alcance Horizontal**
$$x_{max} = v_0 \cdot \cos(\theta) \cdot t_{total}$$

---

## 🎨 Guía de Estilos

### **Paleta de Colores**
| Variable | Color | Uso |
|----------|-------|-----|
| `--color-primary` | #2a9d8f | Botones, acentos |
| `--color-accent` | #264653 | Header, texto principal |
| `--color-success` | #4caf50 | Confirmaciones |
| `--color-error` | #f44336 | Errores |
| `--color-background` | #e8f4f3 | Fondo general |

### **Tipografía**
- **Fuente:** Inter (Google Fonts)
- **Tamaños:** 0.75rem - 2rem
- **Pesos:** 400, 500, 600, 700

---

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 📝 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

## 👥 Autor

**Julio Blacio**
- GitHub: [@SrJCBM](https://github.com/SrJCBM)

---

## 📌 Notas de Desarrollo

### **Atajos de Teclado (Implementados)**
| Tecla | Acción |
|-------|--------|
| `Enter` | Iniciar simulación |
| `Space` | Pausar/Reanudar |
| `Escape` | Reiniciar |

### **Zona Horaria**
El sistema usa **UTC-5 (America/Guayaquil)** para:
- `lastLogin` de usuarios
- `createdAt` de simulaciones
- Timestamps en reportes PDF
