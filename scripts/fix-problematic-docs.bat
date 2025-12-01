@echo off
REM GitHub 流水线修复脚本 (Windows 版本)
REM 用途：移除有问题的文档文件并更新 workflow 配置

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo GitHub 流水线配置修复脚本 (Windows)
echo ==========================================
echo.

REM 第一步：检查 Git 状态
echo [1/4] 检查 Git 状态...
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo.
    echo ❌ 工作目录有未提交的更改，请先提交或暂存
    echo.
    git status
    exit /b 1
)
echo ✓ Git 状态正常
echo.

REM 第二步：查找有问题的文档文件
echo [2/4] 查找有问题的文档文件...

set "file1=src\views\erp\saltprocess\records\binary\# 二元化盐记录管理 - "修改"按钮功能修复验证.md"
set "file2=src\views\erp\saltprocess\records\binary\二元化盐记录管理 - "修改"按钮问题详细分析.md"

set "found_count=0"

if exist "!file1!" (
    echo   找到: !file1!
    set /a found_count+=1
)

if exist "!file2!" (
    echo   找到: !file2!
    set /a found_count+=1
)

if !found_count! equ 0 (
    echo ✓ 未找到有问题的文件
) else (
    echo   共找到 !found_count! 个有问题的文件
)
echo.

REM 第三步：从 Git 追踪中移除文件
if !found_count! gtr 0 (
    echo [3/4] 从 Git 追踪中移除文件...
    
    if exist "!file1!" (
        git ls-files --error-unmatch "!file1!" >nul 2>&1
        if errorlevel 0 (
            git rm --cached "!file1!"
            echo ✓ 已移除: !file1!
        )
    )
    
    if exist "!file2!" (
        git ls-files --error-unmatch "!file2!" >nul 2>&1
        if errorlevel 0 (
            git rm --cached "!file2!"
            echo ✓ 已移除: !file2!
        )
    )
    echo.
)

REM 第四步：验证 workflow 配置
echo [4/4] 验证 workflow 配置...

set "workflows=.github\workflows\build-mac.yml .github\workflows\build-mac-intel.yml .github\workflows\build-mac-arm64.yml"

for %%w in (%workflows%) do (
    if exist "%%w" (
        findstr /M "workflow_dispatch:" "%%w" >nul
        if errorlevel 0 (
            echo ✓ %%w 已禁用自动触发
        ) else (
            echo ❌ %%w 配置可能有问题
        )
    )
)
echo.

REM 总结
echo ==========================================
echo 修复完成！
echo ==========================================
echo.
echo 后续步骤：
echo 1. 检查 Git 状态: git status
echo 2. 提交更改: git commit -m "chore: 从版本控制中移除有问题的文档文件"
echo 3. 推送到远程: git push origin master
echo.
echo 注意：
echo - 如果需要完全清除历史，请使用 BFG Repo-Cleaner
echo - 参考文档: docs\github流水线打包\GitHub流水线配置完整修复方案.md
echo.

endlocal

