@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     GitHub Trending 提取工具 - 启动器                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [INFO] 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败
        pause
        exit /b 1
    )
)

:: 检查是否已编译
if not exist "dist\index.js" (
    echo [INFO] 首次运行，正在编译项目...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] 编译失败
        pause
        exit /b 1
    )
)

echo [INFO] 正在启动 Web 测试服务器...
echo [INFO] 请稍候...
echo.

:: 启动服务器
npm run server

:: 如果服务器异常退出，暂停显示错误
if errorlevel 1 (
    echo.
    echo [ERROR] 服务器异常退出
    pause
)
