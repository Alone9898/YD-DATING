#-*- coding:utf-8 -*-
import os
import os.path
import sys

basePath = os.path.abspath("../assets/resources/games/")

def usage():
    print("""
param:
subgame 子游戏文件夹名称
""")

def read_map(fullname):
    print(fullname)
    map = {}
    with open(fullname, 'r') as f:
        for line in f.readlines():
            line = line.strip()
            cols = line.split('    ', 1)
            if len(cols)==2:
                map[cols[0]] = cols[1]
    return map

def replace_string(fullname, map):
    print(fullname)
    with open(fullname, 'r') as fr:
        content = fr.read()
        for key in map:
            content = content.replace(key, map[key])
        
        with open(fullname+'.1', 'w') as fw:
            fw.write(content)

def walk_path(path, map):
    for parent,dirnames,filenames in os.walk(path):
        for filename in filenames:
            if filename.endswith(".fire") or filename.endswith(".prefab") or filename.endswith(".anim") or filename.endswith(".fnt"):
                fullname = os.path.join(parent,filename)
                replace_string(fullname, map)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        usage()
        sys.exit()
    p = os.path.join(basePath, sys.argv[1])
    print(p)
    if not os.path.isdir(p):
        print("文件夹不存在")
        sys.exit()
    else:
        map = read_map("collision_uuid.txt")
        for k in map:
            print(k+":"+map[k])
        walk_path(p, map)
