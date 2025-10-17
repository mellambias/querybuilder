import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Documentación QueryBuilder',
  description: 'API fluida para construir y ejecutar consultas de base de datos',
  base: '/',
  lang: 'es-ES',
  
  // Ignorar enlaces locales y externos durante la compilación
  ignoreDeadLinks: true,
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Inicio', link: '/' },
      { text: 'Referencia API', link: '/api/' },
      { text: 'Guías', link: '/guides/' },
      { text: 'Accesibilidad', link: '/accessibility' },
      { text: 'GitHub', link: 'https://github.com/mellambias/querybuilder' }
    ],
    
    sidebar: {
      '/api/': [
        {
          text: 'Referencia de la API',
          items: [
            { text: 'API Completa (JSDoc)', link: '/api/generated' },
            { text: 'Índice General', link: '/api/' },
            { text: 'Clase QueryBuilder', link: '/api/querybuilder' },
            { text: 'Métodos DDL', link: '/api/ddl' },
            { text: 'Métodos DML', link: '/api/dml' },
            { text: 'Métodos DQL', link: '/api/dql' },
            { text: 'Métodos DCL', link: '/api/dcl' },
            { text: 'Predicados', link: '/api/predicates' },
            { text: 'Funciones', link: '/api/functions' },
            { text: 'Transacciones', link: '/api/transactions' },
            { text: 'Cursores', link: '/api/cursors' },
            { text: 'Utilidades', link: '/api/utilities' }
          ]
        }
      ],
      
      '/guides/': [
        {
          text: 'Guías de Uso',
          items: [
            { text: 'Inicio Rápido', link: '/guides/getting-started' },
            { text: 'Configuración', link: '/guides/configuration' },
            { text: 'Ejemplos', link: '/guides/examples' },
            { text: 'Adaptadores', link: '/guides/adapters' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/mellambias/querybuilder' }
    ],
    
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Buscar',
                buttonAriaLabel: 'Buscar documentación'
              },
              modal: {
                displayDetails: 'Mostrar lista detallada',
                resetButtonTitle: 'Limpiar búsqueda',
                backButtonTitle: 'Cerrar búsqueda',
                noResultsText: 'No se encontraron resultados para',
                footer: {
                  selectText: 'seleccionar',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'navegar',
                  navigateUpKeyAriaLabel: 'flecha arriba',
                  navigateDownKeyAriaLabel: 'flecha abajo',
                  closeText: 'cerrar',
                  closeKeyAriaLabel: 'escape'
                }
              }
            }
          }
        }
      }
    },
    
    editLink: {
      pattern: 'https://github.com/mellambias/querybuilder/edit/main/docs-vitepress/:path',
      text: 'Editar esta página en GitHub'
    },
    
    lastUpdated: {
      text: 'Última actualización',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    
    docFooter: {
      prev: 'Página anterior',
      next: 'Página siguiente'
    },
    
    outline: {
      label: 'En esta página'
    },
    
    returnToTopLabel: 'Volver arriba',
    sidebarMenuLabel: 'Menú',
    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Cambiar a tema claro',
    darkModeSwitchTitle: 'Cambiar a tema oscuro',
    
    footer: {
      message: 'Publicado bajo la Licencia MPL-2.0. | <a href="/accessibility" style="color: var(--vp-c-brand-1); text-decoration: underline;">Declaración de Accesibilidad</a>',
      copyright: 'Copyright © 2024-presente Miguel E. Llambías Llansó'
    }
  },
  
  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[!code-focus\]/g, '')
        }
      }
    ]
  },
  
  head: [
    ['meta', { name: 'theme-color', content: '#2d5a4f' }], // Color actualizado para mejor contraste
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'es' }],
    ['meta', { property: 'og:title', content: 'QueryBuilder | API fluida para bases de datos' }],
    ['meta', { property: 'og:site_name', content: 'QueryBuilder' }],
    ['meta', { property: 'og:image', content: '/querybuilder-og.jpg' }],
    ['meta', { property: 'og:url', content: 'https://mellambias.github.io/querybuilder/' }],
    
    // Metadatos de accesibilidad
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['meta', { name: 'supported-color-schemes', content: 'light dark' }],
    
    // Viewport optimizado para accesibilidad
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0' }],
    
    // Mejorar experiencia de lectura
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    
    // Preload para fuentes accesibles
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    
    // Soporte para modo alto contraste
    ['style', {}, `
      @media (prefers-contrast: high) {
        :root {
          --vp-c-brand-1: #000080 !important;
          --vp-c-text-1: #000000 !important;
          --vp-c-bg: #ffffff !important;
        }
      }
      
      @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        :root {
          --vp-c-brand-1: #66b3ff !important;
          --vp-c-text-1: #ffffff !important;
          --vp-c-bg: #000000 !important;
        }
      }
    `]
  ]
})