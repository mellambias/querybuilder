# Declaración de Accesibilidad

Esta documentación está diseñada para ser accesible para todos los usuarios, incluyendo aquellos que utilizan tecnologías de asistencia como lectores de pantalla, navegación por teclado, o que tienen necesidades específicas de contraste y legibilidad.

## Características de Accesibilidad Implementadas

### 🎨 **Contraste de Colores**
- ✅ **WCAG 2.1 AA**: Todos los textos cumplen con un contraste mínimo de 4.5:1
- ✅ **WCAG 2.1 AAA**: Los textos principales tienen un contraste superior a 7:1
- ✅ **Modo Alto Contraste**: Soporte automático para `prefers-contrast: high`
- ✅ **Tema Oscuro**: Colores optimizados para visualización nocturna

### ⌨️ **Navegación por Teclado**
- ✅ **Skip Links**: Enlaces de salto al contenido principal, navegación y búsqueda
- ✅ **Focus Visible**: Indicadores claros de foco con contorno de 3px
- ✅ **Atajos de Teclado**:
  - `Alt + C`: Saltar al contenido principal
  - `Alt + M`: Ir al menú de navegación
  - `Alt + S`: Activar búsqueda
- ✅ **Tab Order**: Orden lógico de navegación por pestañas

### 🔊 **Tecnologías de Asistencia**
- ✅ **Screen Readers**: Marcado semántico con ARIA labels apropiados
- ✅ **Live Regions**: Anuncios automáticos de cambios de página
- ✅ **Landmarks**: Uso correcto de elementos `nav`, `main`, `aside`
- ✅ **Headings**: Estructura jerárquica correcta de encabezados

### 📱 **Responsive y Touch**
- ✅ **Target Size**: Área mínima de 44x44px para elementos táctiles
- ✅ **Zoom**: Soporte hasta 500% sin pérdida de funcionalidad
- ✅ **Orientation**: Funciona en modo portrait y landscape
- ✅ **Reduced Motion**: Respeta `prefers-reduced-motion`

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Alt + C` | Ir al contenido principal |
| `Alt + M` | Ir al menú de navegación |
| `Alt + S` | Activar búsqueda |
| `Tab` | Navegar al siguiente elemento |
| `Shift + Tab` | Navegar al elemento anterior |
| `Enter` | Activar enlace o botón |
| `Escape` | Cerrar modal o menú |

## Configuraciones de Usuario Soportadas

### Preferencias del Sistema
- 🌓 **`prefers-color-scheme`**: Tema claro/oscuro automático
- 🔍 **`prefers-contrast`**: Modo alto contraste
- ⚡ **`prefers-reduced-motion`**: Animaciones reducidas
- 📱 **`user-scalable`**: Zoom habilitado hasta 500%

### Lectores de Pantalla Compatibles
- ✅ **NVDA** (Windows)
- ✅ **JAWS** (Windows)
- ✅ **VoiceOver** (macOS/iOS)
- ✅ **TalkBack** (Android)
- ✅ **Orca** (Linux)

## Problemas de Accesibilidad

Si encuentras algún problema de accesibilidad en esta documentación, por favor:

1. **Reporta el problema** en nuestro [repositorio de GitHub](https://github.com/mellambias/querybuilder/issues)
2. **Incluye información** sobre:
   - Tecnología de asistencia utilizada
   - Navegador y versión
   - Sistema operativo
   - Descripción detallada del problema
3. **Etiqueta el issue** con `accessibility`

## Estándares Cumplidos

Esta documentación cumple con:
- ✅ **WCAG 2.1 AA**: Web Content Accessibility Guidelines nivel AA
- ✅ **Section 508**: Estándares de accesibilidad del gobierno de EE.UU.
- ✅ **EN 301 549**: Estándar europeo de accesibilidad
- ✅ **HTML5 Semántico**: Marcado estructurado y significativo

## Mejoras Continuas

Trabajamos constantemente para mejorar la accesibilidad:

- 🔄 **Auditorías Regulares**: Evaluaciones periódicas con herramientas automatizadas
- 👥 **Testing con Usuarios**: Pruebas con usuarios de tecnologías de asistencia
- 📚 **Formación del Equipo**: Capacitación continua en accesibilidad web
- 🎯 **Objetivo AAA**: Trabajando hacia el cumplimiento WCAG 2.1 AAA

---

*Última actualización de accesibilidad: Octubre 2025*  
*Próxima revisión programada: Enero 2026*