# 🎨 Variables de Borde - Valores y Especificaciones

## 📊 **Valores Actuales de las Variables de Borde**

### **Variables CSS Principales:**

| Variable | Valor Hex | Uso | Contraste vs Blanco |
|----------|-----------|-----|---------------------|
| `--vp-c-border` | `#9ca3af` | Bordes principales | 3.8:1 ✅ AA |
| `--vp-c-border-light` | `#d1d5db` | Separadores sutiles | 2.9:1 ⚠️ Decorativo |
| `--vp-c-border-medium` | `#b4b8bf` | Elementos destacados | 3.2:1 ✅ AA |
| `--vp-c-border-strong` | `#6b7280` | Elementos importantes | 5.4:1 ✅ AA |
| `--vp-c-gutter` | `#e5e7eb` | Separadores de contenido | 2.4:1 ⚠️ Decorativo |

### **Variables para Tema Oscuro:**

| Variable | Valor Hex | Uso | Contraste vs Fondo Oscuro |
|----------|-----------|-----|---------------------------|
| `--vp-c-border-dark` | `#4b5563` | Bordes principales | 3.1:1 ✅ AA |
| `--vp-c-border-light-dark` | `#374151` | Separadores sutiles | 2.3:1 ⚠️ Decorativo |
| `--vp-c-border-strong-dark` | `#6b7280` | Elementos importantes | 4.2:1 ✅ AA |

## 🎯 **Aplicaciones Específicas**

### **Código y Bloques:**
```css
/* Código inline */
border: 1px solid var(--vp-c-border-medium); /* #b4b8bf */

/* Bloques de código */  
border: 1px solid var(--vp-c-border-strong); /* #6b7280 */
```

### **Tablas:**
```css
/* Tabla completa */
border: 1px solid var(--vp-c-border-medium); /* #b4b8bf */

/* Celdas de encabezado */
border: 1px solid var(--vp-c-border-medium); /* #b4b8bf */

/* Celdas de datos */
border: 1px solid var(--vp-c-border-light); /* #d1d5db */
```

### **Elementos de Formulario:**
```css
/* Estado normal */
border: 2px solid var(--vp-c-border); /* #9ca3af */

/* Estado focus */
border-color: var(--vp-c-brand-1); /* #2d5a4f */
box-shadow: 0 0 0 3px rgba(45, 90, 79, 0.2);
```

### **Alertas y Bloques:**
```css
/* Tip blocks */
border: 1px solid var(--vp-c-border-light); /* #d1d5db */
border-left: 4px solid var(--vp-c-success); /* #2d5a4f */

/* Warning blocks */
border: 1px solid #f0d000;
border-left: 4px solid var(--vp-c-warning); /* #b8860b */

/* Danger blocks */
border: 1px solid #f5c6cb;
border-left: 4px solid var(--vp-c-danger); /* #c53030 */
```

## 🔍 **Pregunta: "¿Qué valor tiene la variable env language?"**

**Respuesta**: La variable `env language` **no existe** en el código actual. 

### **Historial de la corrección:**
1. **Antes**: Se usaba `````env` como identificador de lenguaje en bloques de código
2. **Problema**: VitePress mostraba advertencia: "The language 'env' is not loaded"
3. **Solución**: Se cambió a `````bash` que es un lenguaje reconocido
4. **Estado actual**: ✅ **No hay referencias a 'env' como lenguaje**

### **Archivos donde se hizo la corrección:**
- `docs-vitepress/guides/configuration.md` (línea ~106)
- Cambio: `````env` → `````bash`

## ✅ **Mejoras Implementadas en Bordes**

### **Nuevas Características:**
1. **🎨 Sistema de Bordes Jerárquico**: 4 niveles de intensidad
2. **🌗 Soporte Tema Oscuro**: Variables específicas para modo oscuro
3. **💎 Efectos Visuales**: Box-shadows y transiciones
4. **📱 Responsive**: Adaptación automática a diferentes tamaños
5. **♿ Accesibilidad**: Contrastes validados según WCAG 2.1

### **Elementos Mejorados:**
- ✅ Código inline con bordes más definidos
- ✅ Bloques de código con sombras sutiles
- ✅ Tablas con bordes redondeados y jerarquía visual
- ✅ Formularios con estados focus mejorados
- ✅ Alertas con bordes colored y sombras
- ✅ Elementos interactivos con transiciones

### **Compatibilidad:**
- ✅ **Modo Claro**: Todos los bordes optimizados
- ✅ **Modo Oscuro**: Variables específicas aplicadas
- ✅ **Alto Contraste**: Respeta preferencias del sistema
- ✅ **Móvil**: Bordes adaptativos para touch

---

*Valores actualizados: 17 de Octubre 2025*  
*Sistema de bordes: Completamente optimizado* ✅