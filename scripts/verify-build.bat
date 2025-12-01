@echo off
REM 构建验证脚本 (Windows)
REM 用于验证打包过程中是否包含不需要的文件

setlocal enabledelayedexpansion

echo.
echo 🔍 开始验证构建输出...
echo.

REM 检查dist目录是否存在
if not exist "dist" (
    echo ✗ dist 目录不存在
    exit /b 1
)

echo ✓ dist 目录存在
echo.

REM 检查是否包含markdown文件
echo 📄 检查 Markdown 文件...
set md_count=0
for /r dist %%F in (*.md) do (
    set /a md_count+=1
    echo ✗ 发现 Markdown 文件: %%F
)

if !md_count! gtr 0 (
    exit /b 1
) else (
    echo ✓ 没有发现 Markdown 文件
)
echo.

REM 检查是否包含测试文件
echo 🧪 检查测试文件...
set test_count=0
for /r dist %%F in (*.test.js *.spec.js test-*.js) do (
    set /a test_count+=1
    echo ✗ 发现测试文件: %%F
)

if !test_count! gtr 0 (
    exit /b 1
) else (
    echo ✓ 没有发现测试文件
)
echo.

REM 检查可执行文件
echo 📦 检查可执行文件...
set exe_count=0
for /r dist %%F in (Haitang*.exe Haitang*.msi) do (
    set /a exe_count+=1
    for %%Z in (%%F) do (
        set size=%%~zF
        REM 转换为MB
        set /a size_mb=!size! / 1048576
        echo ✓ 发现可执行文件: %%F (!size_mb! MB^)
    )
)

if !exe_count! equ 0 (
    echo ⚠ 没有发现可执行文件
)
echo.

REM 检查checksum文件
echo 🔐 检查校验和文件...
if exist "dist\checksums-windows.txt" (
    echo ✓ 校验和文件存在
    type dist\checksums-windows.txt
) else (
    echo ⚠ 校验和文件不存在
)
echo.

REM 统计文件
echo 📊 构建统计...
set file_count=0
for /r dist %%F in (*) do (
    set /a file_count+=1
)
echo   总文件数: !file_count!
echo.

echo ✅ 构建验证完成！
echo.

