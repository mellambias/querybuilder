@echo off
REM 🌳 QueryBuilder Module Switcher (Windows Batch)
REM Script para facilitar el cambio entre ramas de módulos con verificación

if "%1"=="" (
    echo 🚀 QueryBuilder Module Switcher
    echo.
    echo Uso: switch-module.bat [módulo]
    echo.
    echo Módulos disponibles:
    echo   core        - Motor principal QueryBuilder
    echo   postgresql  - Adaptador PostgreSQL  
    echo   mysql       - Adaptador MySQL
    echo   mongodb     - Adaptador MongoDB
    echo   main        - Rama principal
    echo   list        - Mostrar estado de ramas
    echo.
    echo 💡 Tip: Usa verify-branch.bat [módulo] para verificar rama actual
    goto :end
)

if "%1"=="list" (
    echo 📍 Estado actual de las ramas:
    echo.
    git branch
    echo.
    echo 📘 Rama actual:
    git branch --show-current
    goto :end
)

if "%1"=="core" (
    echo 🔧 Cambiando a módulo Core...
    git checkout module/core
    if %errorlevel%==0 (
        echo ✅ Ahora en rama: module/core
        echo 📁 Directorio: packages/@querybuilder/core/
        echo.
        echo 🔍 Verificando rama...
        call verify-branch.bat core
    ) else (
        echo ❌ Error al cambiar a module/core
    )
    goto :end
)

if "%1"=="postgresql" (
    echo 🐘 Cambiando a módulo PostgreSQL...
    git checkout module/postgresql
    if %errorlevel%==0 (
        echo ✅ Ahora en rama: module/postgresql
        echo 📁 Directorio: packages/@querybuilder/postgresql/
        echo.
        echo 🔍 Verificando rama...
        call verify-branch.bat postgresql
    ) else (
        echo ❌ Error al cambiar a module/postgresql
    )
    goto :end
)

if "%1"=="mysql" (
    echo 🐬 Cambiando a módulo MySQL...
    git checkout module/mysql
    echo ✅ Ahora en rama: module/mysql
    echo 📁 Directorio: packages/@querybuilder/mysql/
    goto :end
)

if "%1"=="mongodb" (
    echo 🍃 Cambiando a módulo MongoDB...
    git checkout module/mongodb
    echo ✅ Ahora en rama: module/mongodb
    echo 📁 Directorio: packages/@querybuilder/mongodb/
    goto :end
)

if "%1"=="main" (
    echo 🏠 Cambiando a rama principal...
    git checkout main
    echo ✅ Ahora en rama principal
    echo 📁 Directorio: Todo el proyecto
    goto :end
)

echo ❌ Módulo desconocido: %1
echo.
echo Módulos disponibles: core, postgresql, mysql, mongodb, main, list

:end