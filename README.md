# 🚀 Projectile Motion Simulator (Simulador de Tiro Parabólico)

> **Versión:** 1.0.0
> **Estado:** En Desarrollo 🚧
> **Enfoque:** Usabilidad, Educación Interactiva y Portabilidad.

## 📖 Descripción del Proyecto

Aplicación web educativa diseñada para **visualizar, simular y analizar el movimiento de proyectiles en tiempo real**. El objetivo principal es cerrar la brecha entre las ecuaciones matemáticas abstractas y la realidad física, permitiendo a estudiantes de ingeniería y bachillerato experimentar con variables cinemáticas ($v_0$, $\theta$, $g$, $h$) en un entorno controlado, visual e intuitivo.

El sistema está diseñado rigurosamente bajo principios de **Ingeniería de Usabilidad (ISO 9241-11)** y las **Heurísticas de Nielsen**, garantizando una curva de aprendizaje mínima y una alta eficiencia en la realización de tareas académicas.

---

## 🏗️ Arquitectura y Stack Tecnológico

El proyecto sigue una arquitectura **Cliente-Servidor** desacoplada pero portable, diseñada para funcionar tanto en la nube (**Render**) como en entornos locales (**Localhost**) sin dependencias críticas externas.

### **Frontend (Cliente)**
* **Core:** HTML5 Semántico + CSS3 (Grid/Flexbox).
* **Lógica:** JavaScript (ES6+) Vanilla. *No se utilizan frameworks pesados (React/Vue) para maximizar el rendimiento y la comprensión del código base.*
* **Gráficos:** **HTML5 Canvas API** (Renderizado optimizado a 60 FPS).
* **Matemáticas:** MathJax / KaTeX (para renderizado de fórmulas LaTeX en la UI).

### **Backend (Servidor API)**
* **Runtime:** Node.js.
* **Framework:** Express.js (Arquitectura RESTful).
* **Reportes:** `pdfkit` (Generación de informes de laboratorio descargables).

### **Base de Datos**
* **Persistencia:** MongoDB.
    * Producción: MongoDB Atlas.
    * Desarrollo: Instancia local.
* **ODM:** Mongoose.

---

## 📂 Estructura del Proyecto

```bash
projectile-simulator/
├── client/                 # Frontend
│   ├── index.html          # Interfaz principal (Canvas + Controles)
│   ├── css/
│   │   ├── style.css       # Estilos Globales (Responsive + Accesibilidad)
│   │   └── ui-components.css # Estilos de componentes específicos
│   ├── js/
│   │   ├── physics.js      # Motor lógico (Cálculos cinemáticos puros)
│   │   ├── canvas.js       # Lógica de renderizado y animación
│   │   ├── ui.js           # Manejo del DOM, Eventos y Sliders
│   │   └── api.js          # Comunicación con Backend (Fetch API)
│   └── assets/             # Imágenes e iconos
├── server/                 # Backend (API)
│   ├── config/             # Configuración DB (Mongo URI)
│   ├── controllers/        # Lógica de negocio (Simulations, Auth)
│   ├── models/             # Esquemas Mongoose (User, SimulationResult)
│   ├── routes/             # Endpoints de la API
│   └── app.js              # Configuración y Entry point Express
└── README.md