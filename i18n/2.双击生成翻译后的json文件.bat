
@echo off 
setlocal enabledelayedexpansion

rem 遍历指定文件夹(默认为po2json.exe所在文件夹)内所有的.po文件生成对应的 .json文件
rem 参数argv
rem @argv[0] .po 文件所在文件夹, 
rem @argv[1] 输出路径, 默认输出到字体资源路径下的output文件夹,如果output文件夹不存在则创建后输出
po2json.exe .\ .\output

rem 拷贝覆盖
xcopy /y ".\output" "..\assets\resources\i18n" /e

rem 删除output文件夹
rd /s /q ".\output"

rem pause
exit