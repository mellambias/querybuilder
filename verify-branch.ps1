#!/usr/bin/env pwsh
# 🌳 Branch Verification Script
# Script para verificar que estemos en la rama correcta antes de trabajar

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("core", "postgresql", "mysql", "mongodb", "integration", "main")]
    [string]$ExpectedModule
)

# Colores para output
$Green = "`e[32m"
$Blue = "`e[34m"
$Yellow = "`e[33m"
$Red = "`e[31m"
$Reset = "`e[0m"

function Write-Success {
    param([string]$Message)
    Write-Host "$Green✅ $Message$Reset"
}

function Write-Info {
    param([string]$Message)
    Write-Host "$Blue📘 $Message$Reset"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow⚠️  $Message$Reset"
}

function Write-Error {
    param([string]$Message)
    Write-Host "$Red❌ $Message$Reset"
}

# Verificar que estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Error "No estás en un repositorio Git"
    exit 1
}

# Obtener rama actual
$currentBranch = git branch --show-current
$expectedBranch = if ($ExpectedModule -eq "main") { "main" } else { "module/$ExpectedModule" }

Write-Info "Verificando rama para módulo: $ExpectedModule"
Write-Host ""

if ($currentBranch -eq $expectedBranch) {
    Write-Success "✅ Estás en la rama correcta: $currentBranch"
    Write-Success "✅ Puedes trabajar en el módulo $ExpectedModule"
    
    # Mostrar información del módulo
    switch ($ExpectedModule) {
        "core" {
            Write-Info "📁 Directorio: packages/@querybuilder/core/"
            Write-Info "🎯 Funcionalidad: Motor principal QueryBuilder, SQL2006"
        }
        "postgresql" {
            Write-Info "📁 Directorio: packages/@querybuilder/postgresql/"
            Write-Info "🎯 Funcionalidad: JSON/JSONB, Arrays, CTEs, Window Functions"
        }
        "mysql" {
            Write-Info "📁 Directorio: packages/@querybuilder/mysql/"
            Write-Info "🎯 Funcionalidad: MySQL/MariaDB específicas"
        }
        "mongodb" {
            Write-Info "📁 Directorio: packages/@querybuilder/mongodb/"
            Write-Info "🎯 Funcionalidad: NoSQL, aggregation pipeline"
        }
        "integration" {
            Write-Info "📁 Directorio: Todo el proyecto"
            Write-Info "🎯 Funcionalidad: Features transversales, testing integración"
        }
        "main" {
            Write-Info "📁 Directorio: Todo el proyecto"
            Write-Info "🎯 Funcionalidad: Versión estable integrada"
        }
    }
    
} else {
    Write-Error "❌ Estás en la rama incorrecta!"
    Write-Warning "   Rama actual: $currentBranch"
    Write-Warning "   Rama esperada: $expectedBranch"
    Write-Host ""
    Write-Info "🔄 Para cambiar a la rama correcta ejecuta:"
    Write-Host "   $Yellow.\switch-module.bat $ExpectedModule$Reset"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Success "Verificación completada. ¡Listo para trabajar!"