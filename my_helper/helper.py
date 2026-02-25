#-*- coding:utf-8 -*-
import shutil
import subprocess
import datetime
import time
import os
import os.path
import string
import subprocess
import sys

basePath = os.path.abspath("../assets/resources/games/")

def usage():
    print("""
cmd param1 param2 ... paramN

cmd = clear 删除所有子游戏
cmd = remove 删除指定子游戏
cmd = retain 保留指定子游戏
cmd = recover 恢复指定子游戏
""")

def clearAll():
    '''
    清除所有子游戏
    '''
    entries = os.listdir(basePath)
    for entry in entries:
        p = os.path.join(basePath, entry)
        print(p)
        if not os.path.isdir(p):
            continue
        cmd = 'cd %s && ls  | xargs rm -rf'%p
        print(cmd)
        os.system(cmd)

def remove_game(param):
    '''
    移除指定游戏
    '''
    for entry in param:
        p = os.path.join(basePath, entry)
        if not os.path.isdir(p):
            continue
        cmd = 'cd %s && ls  | xargs rm -rf'%p
        print(cmd)
        os.system(cmd)

def retain_game(param):
    '''
    保留指定游戏
    '''
    entries = os.listdir(basePath)
    for entry in entries:
        p = os.path.join(basePath, entry)
        print(p)
        if not os.path.isdir(p):
            continue
        if entry in param:
            continue
        cmd = 'cd %s && ls  | xargs rm -rf'%p
        print(cmd)
        os.system(cmd)

def recover_game(param):
    '''
    还原指定游戏
    '''
    for entry in param:
        p = os.path.join(basePath, entry)
        print(p)
        if not os.path.isdir(p):
            continue
        cmd = 'cd %s && git reset --hard'%p
        print(cmd)
        os.system(cmd)

if __name__ == '__main__':
    args = sys.argv[1:]
    if len(args) < 1:
        usage()
        sys.exit()
    cmd = args[0]
    print("执行命令:%s"%cmd)
    param = args[1:]
    print("命令参数：%s"%" ".join(param))
    if cmd == "clear":
        clearAll()
    elif cmd == "remove":
        remove_game(param)
        pass
    elif cmd == "retain":
        retain_game(param)
        pass
    elif cmd == "recover":
        recover_game(param)
        pass
    