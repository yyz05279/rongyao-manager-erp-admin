@echo off
REM 海棠企业管理系统 - 本地服务器启动脚本（Windows）
REM 用途：在没有开发环境的机器上运行打包后的应用

setlocal enabledelayedexpansion

REM 颜色定义（Windows 10+）
set "BLUE=[94m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

echo [INFO] 项目根目录: %PROJECT_ROOT%

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装，请先安装 Node.js
    echo 访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js 已安装: %NODE_VERSION%

REM 检查 npm 是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm 未安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm 已安装: %NPM_VERSION%

REM 检查 http-server 是否全局安装
where http-server >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] http-server 未全局安装，正在安装...
    call npm install -g http-server
    if %errorlevel% neq 0 (
        echo [ERROR] http-server 安装失败
        pause
        exit /b 1
    )
    echo [SUCCESS] http-server 安装完成
)

REM 检查 dist 文件夹是否存在
if not exist "%PROJECT_ROOT%\dist" (
    echo [WARNING] dist 文件夹不存在，正在构建项目...
    
    REM 检查 node_modules 是否存在
    if not exist "%PROJECT_ROOT%\node_modules" (
        echo [INFO] 安装项目依赖...
        cd /d "%PROJECT_ROOT%"
        call npm install
        if %errorlevel% neq 0 (
            echo [ERROR] 依赖安装失败
            pause
            exit /b 1
        )
    )
    
    echo [INFO] 构建项目...
    cd /d "%PROJECT_ROOT%"
    call npm run build:prod
    if %errorlevel% neq 0 (
        echo [ERROR] 项目构建失败
        pause
        exit /b 1
    )
    
    if not exist "%PROJECT_ROOT%\dist" (
        echo [ERROR] 项目构建失败，dist 文件夹未生成
        pause
        exit /b 1
    )
    
    echo [SUCCESS] 项目构建完成
)

REM 设置端口（默认 8080）
set PORT=8080
if not "%1"=="" set PORT=%1

REM 启动服务器
echo [INFO] 启动 HTTP 服务器...
echo [INFO] 访问地址: http://localhost:%PORT%
echo [INFO] 按 Ctrl+C 停止服务器

cd /d "%PROJECT_ROOT%\dist"
call http-server . -p %PORT% -c-1 -o

pause

