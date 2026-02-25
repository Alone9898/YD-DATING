@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    主包热更包生成工具 (Windows)
echo ========================================
echo.

echo.
echo 开始生成主包热更包...
echo.

python "%~dp0build_main_hotupdate.py"

pause
