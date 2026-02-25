@echo off 
setlocal enabledelayedexpansion

rem 遍历指定文件夹
rem 参数argv
rem @argv[0] 文件夹路径
rem @argv[1] 输出路径
rem @argv[2] 所需遍历的文件后缀, 为空时遍历所有文件, 以逗号分隔,如".prefab,.fire"
extract_translation.exe "..\assets" .\ ".prefab,.fire,.ts" "___"

rem pause
exit