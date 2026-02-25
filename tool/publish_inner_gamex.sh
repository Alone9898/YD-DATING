#!/usr/bin/sh
#############################################
#
# 上传热更新文件到内网165上，直接更新内网域名下的热更文件
#
# sh publish_inner_gamex.sh GameX.zip
#
#############################################

filename="GameX.zip"
if [ -f "$filename" ]; then
    echo "删除旧的GameX.zip"
    rm GameX.zip
fi

echo "start zip file from GameX"
zip -9 -r GameX.zip GameX
echo "zip file success"


if [ ! -f "$filename" ]; then
    echo "当前目录下并未找到GameX.zip"
    echo "执行方式: sh publish_inner_gamex.sh GameX.zip"
    exit
fi

# 输入一个提示信息
echo "接下来，请输入您要更新的目标App名:"

while [ x$select = "x" ]; do
# 提示用户输入目标项目
echo "请选择要更新的App："
echo "1)：cashmaster"
echo "2)：texasslots"
echo "3)：cashhero"
echo "4)：europehuawei"
#read -p "输入要更新的APP(cashmaster 或 texasslots 或 cashhero), 大小必须一致。开始输入:" project
read -p "请输入选择项，例如:3,表示更新cashhero, 选择:" select
done

#if [ $project != 'cashmaster' ] && [ $project != 'texasslots' ] && [ $project != 'cashhero' ]
if [ $select != '1' ] && [ $select != '2' ] && [ $select != '3' ] && [ $select != '4' ]
then
    echo "发布项目必须为 cashmaster 或 texasslots 或 cashhero 或 europehuawei 。请重新执行命令: sh publish_inner_gamex.sh GameX.zip"
    exit
fi

if [ $select == '1' ]
then
project="cashmaster"

elif [ $select == '2' ]
then
project="texasslots"

elif [ $select == '3' ]
then
project="cashhero"

elif [ $select == '4' ]
then
project="europehuawei"
else
    echo "项目名称不对，必须是 cashmaster 或 texasslots 或 cashhero 或 europehuawei"
    exit
fi

echo '开始上传...'
echo "文件:${filename} "
echo "待更新APP:${project}\r\n"
scp $filename root@10.0.0.165:/data_server/hotupdate/

echo "上传完毕，开始远程操作.."

remote_cmd="/root/shell/rummyslot/update_local_gamex.sh"
sshpass -p 'liyi100' ssh -p22 root@10.0.0.165 "sh $remote_cmd $project $filename"
echo "更新远程完毕!\r\n"
