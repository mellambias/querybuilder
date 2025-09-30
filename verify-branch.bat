@echo off
REM 🌳 Branch Verification Script (Windows Batch)
REM Script para verificar que estemos en la rama correcta

if "%1"=="" (
    echo ❌ Error: Especifica el módulo esperado
    echo.
    echo Uso: verify-branch.bat [módulo]
    echo.
    echo Módulos disponibles:
    echo   core        - Motor principal QueryBuilder
    echo   postgresql  - Adaptador PostgreSQL  
    echo   mysql       - Adaptador MySQL
    echo   mongodb     - Adaptador MongoDB
    echo   integration - Features transversales
    echo   main        - Rama principal
    goto :error
)

REM Obtener rama actual
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

REM Determinar rama esperada
if "%1"=="main" (
    set EXPECTED_BRANCH=main
) else (
    set EXPECTED_BRANCH=module/%1
)

echo 📘 Verificando rama para módulo: %1
echo.

if "%CURRENT_BRANCH%"=="%EXPECTED_BRANCH%" (
    echo ✅ Estás en la rama correcta: %CURRENT_BRANCH%
    echo ✅ Puedes trabajar en el módulo %1
    echo.
    
    REM Mostrar información del módulo
    if "%1"=="core" (
        echo 📁 Directorio: packages/@querybuilder/core/
        echo 🎯 Funcionalidad: Motor principal QueryBuilder, SQL2006
    )
    if "%1"=="postgresql" (
        echo 📁 Directorio: packages/@querybuilder/postgresql/
        echo 🎯 Funcionalidad: JSON/JSONB, Arrays, CTEs, Window Functions
    )
    if "%1"=="mysql" (
        echo 📁 Directorio: packages/@querybuilder/mysql/
        echo 🎯 Funcionalidad: MySQL/MariaDB específicas
    )
    if "%1"=="mongodb" (
        echo 📁 Directorio: packages/@querybuilder/mongodb/
        echo 🎯 Funcionalidad: NoSQL, aggregation pipeline
    )
    if "%1"=="integration" (
        echo 📁 Directorio: Todo el proyecto
        echo 🎯 Funcionalidad: Features transversales, testing integración
    )
    if "%1"=="main" (
        echo 📁 Directorio: Todo el proyecto
        echo 🎯 Funcionalidad: Versión estable integrada
    )
    
    echo.
    echo ✅ Verificación completada. ¡Listo para trabajar!
    goto :success
) else (
    echo ❌ Estás en la rama incorrecta!
    echo ⚠️  Rama actual: %CURRENT_BRANCH%
    echo ⚠️  Rama esperada: %EXPECTED_BRANCH%
    echo.
    echo 🔄 Para cambiar a la rama correcta ejecuta:
    echo    switch-module.bat %1
    echo.
    goto :error
)

:success
exit /b 0

:error
exit /b 1