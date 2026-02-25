@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    子游戏热更包生成工具 (Windows)
echo ========================================
echo.


echo.
echo 开始生成热更包...
echo.

python "%~dp0build_subgame_hotupdate.py"

pause
