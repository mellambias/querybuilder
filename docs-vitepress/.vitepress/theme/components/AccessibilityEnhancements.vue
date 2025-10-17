// Componente de accesibilidad mejorada
<template>
  <div class="accessibility-enhancements">
    <!-- Skip Links para navegación por teclado -->
    <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
    <a href="#sidebar" class="skip-link">Saltar a la navegación</a>
    <a href="#search" class="skip-link">Saltar a la búsqueda</a>
    
    <!-- Anuncio para lectores de pantalla -->
    <div class="sr-only" aria-live="polite" id="announcements"></div>
  </div>
</template>

<script>
export default {
  name: 'AccessibilityEnhancements',
  mounted() {
    this.initAccessibility()
  },
  
  methods: {
    initAccessibility() {
      // Agregar IDs para skip links si no existen
      this.addSkipTargets()
      
      // Mejorar navegación por teclado
      this.enhanceKeyboardNavigation()
      
      // Anunciar cambios de página para lectores de pantalla
      this.announcePageChanges()
      
      // Mejorar el manejo del foco
      this.improveFocusManagement()
    },
    
    addSkipTargets() {
      // Agregar ID al contenido principal
      const mainContent = document.querySelector('.vp-doc') || document.querySelector('main')
      if (mainContent && !mainContent.id) {
        mainContent.id = 'main-content'
        mainContent.setAttribute('tabindex', '-1')
      }
      
      // Agregar ID al sidebar
      const sidebar = document.querySelector('.VPSidebar') || document.querySelector('aside')
      if (sidebar && !sidebar.id) {
        sidebar.id = 'sidebar'
        sidebar.setAttribute('tabindex', '-1')
      }
      
      // Agregar ID a la búsqueda
      const search = document.querySelector('.VPLocalSearchBox') || document.querySelector('[role="search"]')
      if (search && !search.id) {
        search.id = 'search'
        search.setAttribute('tabindex', '-1')
      }
    },
    
    enhanceKeyboardNavigation() {
      // Manejar navegación con teclas
      document.addEventListener('keydown', (e) => {
        // Alt + M = Menú principal
        if (e.altKey && e.key === 'm') {
          e.preventDefault()
          const nav = document.querySelector('.VPNav')
          if (nav) nav.focus()
        }
        
        // Alt + S = Búsqueda
        if (e.altKey && e.key === 's') {
          e.preventDefault()
          const search = document.querySelector('.VPNavBarSearch button') || document.querySelector('#search')
          if (search) search.focus()
        }
        
        // Alt + C = Contenido principal
        if (e.altKey && e.key === 'c') {
          e.preventDefault()
          const content = document.querySelector('#main-content')
          if (content) content.focus()
        }
      })
    },
    
    announcePageChanges() {
      // Observar cambios en el título para anunciar navegación
      const announcements = document.querySelector('#announcements')
      if (!announcements) return
      
      const observer = new MutationObserver(() => {
        const title = document.title
        if (title && announcements) {
          announcements.textContent = `Página cargada: ${title}`
        }
      })
      
      observer.observe(document.querySelector('title'), {
        childList: true,
        characterData: true
      })
    },
    
    improveFocusManagement() {
      // Mejorar indicadores de foco
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation')
        }
      })
      
      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation')
      })
      
      // Asegurar que elementos importantes sean focusables
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        if (!heading.getAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1')
        }
      })
    }
  }
}
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--vp-c-brand-1);
  color: white;
  padding: 8px 12px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid transparent;
}

.skip-link:focus {
  top: 6px;
  outline: 3px solid #ffff00;
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Mejorar focus para navegación por teclado */
:global(.keyboard-navigation) *:focus {
  outline: 3px solid var(--vp-c-brand-2) !important;
  outline-offset: 2px !important;
  border-radius: 4px !important;
}

:global(.keyboard-navigation) .VPNavBarMenuLink:focus,
:global(.keyboard-navigation) .VPSidebarItem .link:focus {
  background-color: var(--vp-c-brand-soft) !important;
  color: var(--vp-c-brand-1) !important;
}
</style>