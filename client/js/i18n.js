/**
 * Internationalization (i18n) Module
 * 
 * Provides translations for the Projectile Motion Simulator.
 * Supports Spanish (es) and English (en).
 */

/**
 * Translation dictionary
 */
const translations = {
    es: {
        // Header
        appTitle: 'Simulador de Movimiento Proyectil',
        signIn: 'Iniciar sesión',
        history: 'Historial',
        save: 'Guardar',
        downloadPDF: 'PDF',
        
        // Controls
        parameters: 'Parámetros',
        initialVelocity: 'Velocidad inicial',
        angle: 'Ángulo',
        initialHeight: 'Altura inicial',
        gravity: 'Gravedad',
        simulate: 'Simular',
        pause: 'Pausar',
        resume: 'Reanudar',
        reset: 'Reiniciar',
        
        // Status
        statusReady: 'Listo para simular',
        statusRunning: 'Simulando...',
        statusPaused: 'Pausado',
        statusCompleted: 'Completado',
        loading: 'Preparando simulación...',
        calculating: 'Calculando trayectoria...',
        
        // Results
        resultsTitle: 'Resultados de la Simulación',
        maxHeight: 'Altura máxima',
        distance: 'Distancia',
        flightTime: 'Tiempo de vuelo',
        finalVelocity: 'Velocidad final',
        
        // Formulas
        viewFormulas: '📐 Ver Fórmulas Físicas',
        trajectory: 'Trayectoria',
        position: 'Posición',
        
        // History
        simulationHistory: 'Historial de Simulaciones',
        noSimulations: 'No hay simulaciones guardadas.',
        loadBtn: 'Cargar',
        deleteBtn: 'Eliminar',
        
        // Messages
        simulationSaved: '¡Simulación guardada!',
        simulationLoaded: '¡Simulación cargada!',
        simulationDeleted: 'Simulación eliminada',
        loggedOut: 'Sesión cerrada correctamente',
        loginRequired: 'Inicia sesión para guardar simulaciones',
        saveFailed: 'Error al guardar simulación',
        loadFailed: 'Error al cargar simulación',
        deleteFailed: 'Error al eliminar simulación',
        pdfFailed: 'Error al generar PDF',
        enterName: 'Ingresa un nombre para esta simulación:',
        confirmDelete: '¿Estás seguro de que deseas eliminar esta simulación?',
        
        // Footer
        footer: 'Hecho con ❤️ para Estudiantes de Física',
        
        // Tooltips
        tooltipVelocity: 'Velocidad inicial del proyectil',
        tooltipAngle: 'Ángulo de lanzamiento (0° = horizontal, 90° = vertical)',
        tooltipHeight: 'Altura desde donde se lanza el proyectil',
        tooltipGravity: 'Selecciona la gravedad: Tierra, Luna o Marte',
        tooltipSimulate: 'Iniciar simulación con los parámetros actuales',
        tooltipPause: 'Pausar/Reanudar simulación',
        tooltipReset: 'Reiniciar simulación',
        tooltipMaxHeight: 'Punto más alto alcanzado por el proyectil',
        tooltipDistance: 'Distancia horizontal recorrida',
        tooltipFlightTime: 'Tiempo total en el aire',
        tooltipFinalVelocity: 'Velocidad al momento del impacto',
        tooltipTheme: 'Cambiar tema',
        tooltipLang: 'Cambiar idioma',
        tooltipHistory: 'Ver historial de simulaciones',
        tooltipSave: 'Guardar simulación actual',
        tooltipPDF: 'Descargar reporte PDF',
        tooltipLogout: 'Cerrar sesión',
        tooltipHome: 'Ir al inicio',
        
        // Gravity options
        gravityEarth: '🌍 Tierra - 9.81 m/s²',
        gravityMoon: '🌙 Luna - 1.62 m/s²',
        gravityMars: '🔴 Marte - 3.72 m/s²'
    },
    en: {
        // Header
        appTitle: 'Projectile Motion Simulator',
        signIn: 'Sign In',
        history: 'History',
        save: 'Save',
        downloadPDF: 'PDF',
        
        // Controls
        parameters: 'Parameters',
        initialVelocity: 'Initial velocity',
        angle: 'Angle',
        initialHeight: 'Initial height',
        gravity: 'Gravity',
        simulate: 'Simulate',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset',
        
        // Status
        statusReady: 'Ready to simulate',
        statusRunning: 'Simulating...',
        statusPaused: 'Paused',
        statusCompleted: 'Completed',
        loading: 'Preparing simulation...',
        calculating: 'Calculating trajectory...',
        
        // Results
        resultsTitle: 'Simulation Results',
        maxHeight: 'Maximum Height',
        distance: 'Distance',
        flightTime: 'Flight Time',
        finalVelocity: 'Final Velocity',
        
        // Formulas
        viewFormulas: '📐 View Physics Formulas',
        trajectory: 'Trajectory',
        position: 'Position',
        
        // History
        simulationHistory: 'Simulation History',
        noSimulations: 'No simulations saved yet.',
        loadBtn: 'Load',
        deleteBtn: 'Delete',
        
        // Messages
        simulationSaved: 'Simulation saved!',
        simulationLoaded: 'Simulation loaded!',
        simulationDeleted: 'Simulation deleted',
        loggedOut: 'Logged out successfully',
        loginRequired: 'Please log in to save simulations',
        saveFailed: 'Failed to save simulation',
        loadFailed: 'Failed to load simulation',
        deleteFailed: 'Failed to delete simulation',
        pdfFailed: 'Failed to generate PDF',
        enterName: 'Enter a name for this simulation:',
        confirmDelete: 'Are you sure you want to delete this simulation?',
        
        // Footer
        footer: 'Built with ❤️ for Physics Students',
        
        // Tooltips
        tooltipVelocity: 'Initial velocity of the projectile',
        tooltipAngle: 'Launch angle (0° = horizontal, 90° = vertical)',
        tooltipHeight: 'Height from which the projectile is launched',
        tooltipGravity: 'Select gravity: Earth, Moon or Mars',
        tooltipSimulate: 'Start simulation with current parameters',
        tooltipPause: 'Pause/Resume simulation',
        tooltipReset: 'Reset simulation',
        tooltipMaxHeight: 'Highest point reached by the projectile',
        tooltipDistance: 'Horizontal distance traveled',
        tooltipFlightTime: 'Total time in the air',
        tooltipFinalVelocity: 'Velocity at impact',
        tooltipTheme: 'Toggle theme',
        tooltipLang: 'Change language',
        tooltipHistory: 'View simulation history',
        tooltipSave: 'Save current simulation',
        tooltipPDF: 'Download PDF report',
        tooltipLogout: 'Log out',
        tooltipHome: 'Go to home',
        
        // Gravity options
        gravityEarth: '🌍 Earth - 9.81 m/s²',
        gravityMoon: '🌙 Moon - 1.62 m/s²',
        gravityMars: '🔴 Mars - 3.72 m/s²'
    }
};

/**
 * Current language
 */
let currentLang = localStorage.getItem('preferredLang') || 'es';

/**
 * Gets a translation by key
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
export function t(key) {
    return translations[currentLang]?.[key] || translations['es'][key] || key;
}

/**
 * Gets the current language
 * @returns {string} Current language code
 */
export function getCurrentLang() {
    return currentLang;
}

/**
 * Sets the current language and updates the UI
 * @param {string} lang - Language code ('es' or 'en')
 */
export function setLang(lang) {
    if (!translations[lang]) {
        console.warn(`Language "${lang}" not supported`);
        return;
    }
    
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    document.documentElement.lang = lang;
    updatePageTranslations();
}

/**
 * Updates all elements with data-i18n attribute
 */
export function updatePageTranslations() {
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            el.textContent = translation;
        }
    });
    
    // Update tooltips
    document.querySelectorAll('[data-tooltip-i18n]').forEach(el => {
        const key = el.getAttribute('data-tooltip-i18n');
        const translation = t(key);
        if (translation) {
            el.setAttribute('data-tooltip', translation);
        }
    });
    
    // Update gravity select options
    const gravitySelect = document.getElementById('gravity-select');
    if (gravitySelect) {
        gravitySelect.options[0].text = t('gravityEarth');
        gravitySelect.options[1].text = t('gravityMoon');
        gravitySelect.options[2].text = t('gravityMars');
    }
}

/**
 * Initializes i18n with saved preference
 */
export function initI18n() {
    const savedLang = localStorage.getItem('preferredLang') || 'es';
    currentLang = savedLang;
    document.documentElement.lang = savedLang;
    
    // Setup language buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        const lang = btn.getAttribute('data-lang');
        
        // Set initial active state
        btn.classList.toggle('lang-btn--active', lang === currentLang);
        
        btn.addEventListener('click', () => {
            setLang(lang);
            
            // Update active state
            langBtns.forEach(b => b.classList.remove('lang-btn--active'));
            btn.classList.add('lang-btn--active');
        });
    });
    
    // Initial translations
    updatePageTranslations();
}

export { translations };
