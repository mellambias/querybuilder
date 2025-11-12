#!/usr/bin/env node

/**
 * Script para agregar enlaces a recursos adicionales en el index.html
 * Agrega una sección con enlaces a CONFIG.html, CONTRIBUTING.html, etc.
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const indexPath = path.join(projectRoot, 'docs', 'jsdoc', 'index.html');

console.log('🔗 Agregando enlaces a recursos adicionales en index.html...\n');

// HTML para la sección de recursos adicionales
const resourcesSection = `
    <!-- Recursos Adicionales -->
    <div class="additional-resources" style="
        background: #f6f8fa;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        padding: 20px;
        margin: 20px 0;
    ">
        <h2 style="margin-top: 0; color: #24292e;">📚 Recursos Adicionales</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8;">
                <h3 style="margin-top: 0; font-size: 1.1em;">
                    <a href="CONFIG.html" style="color: #0366d6; text-decoration: none;">
                        🔧 Configuración
                    </a>
                </h3>
                <p style="margin: 0; color: #586069; font-size: 0.9em;">
                    Guía completa para configurar bases de datos y conexiones
                </p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8;">
                <h3 style="margin-top: 0; font-size: 1.1em;">
                    <a href="CONTRIBUTING.html" style="color: #0366d6; text-decoration: none;">
                        🤝 Contribuir
                    </a>
                </h3>
                <p style="margin: 0; color: #586069; font-size: 0.9em;">
                    Guía para contribuir al proyecto y proceso de desarrollo
                </p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8;">
                <h3 style="margin-top: 0; font-size: 1.1em;">
                    <a href="CODE_OF_CONDUCT.html" style="color: #0366d6; text-decoration: none;">
                        📜 Código de Conducta
                    </a>
                </h3>
                <p style="margin: 0; color: #586069; font-size: 0.9em;">
                    Normas de comportamiento en la comunidad
                </p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8;">
                <h3 style="margin-top: 0; font-size: 1.1em;">
                    <a href="LOCAL_PUBLISHING.html" style="color: #0366d6; text-decoration: none;">
                        📦 Publicación Local
                    </a>
                </h3>
                <p style="margin: 0; color: #586069; font-size: 0.9em;">
                    Testing local de paquetes con pnpm workspace
                </p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e1e4e8;">
                <h3 style="margin-top: 0; font-size: 1.1em;">
                    <a href="PNPM_LOCAL_SETUP.html" style="color: #0366d6; text-decoration: none;">
                        ⚙️ Setup PNPM
                    </a>
                </h3>
                <p style="margin: 0; color: #586069; font-size: 0.9em;">
                    Configuración de entorno de desarrollo con pnpm
                </p>
            </div>
        </div>
    </div>
`;

try {
    // Leer el archivo index.html
    let content = await fs.readFile(indexPath, 'utf8');
    
    // Buscar el cierre del article (justo antes de </article>)
    const insertPoint = content.indexOf('</article>');
    
    if (insertPoint === -1) {
        console.log('⚠️  No se encontró el punto de inserción en index.html');
        process.exit(1);
    }
    
    // Verificar si ya se agregó la sección
    if (content.includes('additional-resources')) {
        console.log('ℹ️  La sección de recursos adicionales ya existe');
        process.exit(0);
    }
    
    // Insertar la sección justo antes del cierre de </article>
    content = content.slice(0, insertPoint) + resourcesSection + '\n' + content.slice(insertPoint);
    
    // Guardar el archivo
    await fs.writeFile(indexPath, content, 'utf8');
    
    console.log('✅ Sección de recursos adicionales agregada exitosamente\n');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
