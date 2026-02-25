#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
子游戏热更包生成工具 (Windows)

核心原理:
    1. 从 assets/resources/games/{game_name} 目录下的 .meta 文件获取子游戏资源的UUID映射
    2. 在 build/jsb-link 中找到对应的构建文件
    3. 计算每个文件的MD5，生成 project.manifest
    4. 计算所有MD5的汇总值，更新主包 version.manifest 的 subVer 字段

使用方法:
    python subgame_hotupdate.py --games Sphinx,Archer --version 1.2.2.4 --url https://xxx.com/GameX

参数说明:
    --games     要打包的子游戏名称，多个用逗号分隔，或 all 表示全部
    --version   热更版本号
    --url       热更服务器基础URL
    --build     构建目录路径 (默认: ../build/jsb-link)
    --output    输出目录 (默认: ../hotupdate)
"""

import os
import sys
import json
import hashlib
import argparse
import shutil
from pathlib import Path


def calculate_file_md5(file_path):
    """计算文件MD5"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


def calculate_subver_md5(assets_dict):
    """
    计算子游戏的汇总MD5 (用于version.manifest的subVer字段)
    
    逻辑与客户端 hall_pre_loading.js 中的 _compareSubgameLocalMd5 一致:
    1. 提取所有文件的md5
    2. 排序
    3. 拼接成字符串
    4. 对拼接后的字符串计算MD5
    """
    md5_list = [v['md5'] for v in assets_dict.values()]
    md5_list.sort()
    combined = ''.join(md5_list)
    # 客户端使用 Uint8Array，这里用 utf-8 编码
    return hashlib.md5(combined.encode('utf-8')).hexdigest()


def get_game_uuid_mapping(project_root, game_name):
    """
    从 assets/resources/games/{game_name} 目录下的 .meta 文件获取子游戏相关的UUID映射
    """
    game_path = os.path.join(project_root, 'assets', 'resources', 'games', game_name)
    if not os.path.exists(game_path):
        print(f"错误: 子游戏目录不存在 {game_path}")
        return {}
    
    def extract_uuids_recursive(data):
        """递归提取meta数据中的所有UUID"""
        uuids = set()
        
        # 获取主UUID
        main_uuid = data.get('uuid', '')
        if main_uuid:
            uuids.add(main_uuid)
        
        # 获取subMetas中的UUID（递归处理嵌套情况）
        sub_metas = data.get('subMetas', {})
        for sub_name, sub_info in sub_metas.items():
            if isinstance(sub_info, dict):
                sub_uuid = sub_info.get('uuid', '')
                if sub_uuid:
                    uuids.add(sub_uuid)
                # 递归处理嵌套的subMetas
                uuids.update(extract_uuids_recursive(sub_info))
        
        return uuids
    
    game_uuids = {}
    
    # 遍历子游戏目录下所有 .meta 文件
    for root, dirs, files in os.walk(game_path):
        for filename in files:
            if filename.endswith('.meta'):
                meta_path = os.path.join(root, filename)
                rel_path = os.path.relpath(meta_path, os.path.join(project_root, 'assets')).replace('\\', '/')
                try:
                    with open(meta_path, 'r', encoding='utf-8') as f:
                        meta_data = json.load(f)
                    for uuid in extract_uuids_recursive(meta_data):
                        game_uuids[uuid] = rel_path
                except (json.JSONDecodeError, IOError) as e:
                    # 忽略无法解析的meta文件
                    pass
    
    return game_uuids


def find_game_files_in_build(build_path, game_uuids):
    """
    在构建目录中查找子游戏相关的文件
    Cocos Creator 2.x 构建后文件按UUID前两位分散存储在 res/raw-assets 和 res/import 中
    """
    raw_assets_path = os.path.join(build_path, 'res', 'raw-assets')
    import_path = os.path.join(build_path, 'res', 'import')
    
    game_files = {}
    
    for uuid in game_uuids.keys():
        prefix = uuid[:2]
        
        # 查找raw-assets中的文件
        prefix_dir = os.path.join(raw_assets_path, prefix)
        if os.path.exists(prefix_dir):
            for filename in os.listdir(prefix_dir):
                # UUID格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                # 文件名可能是 uuid后半部分.ext 或包含完整uuid
                file_uuid_part = uuid[3:].replace('-', '')  # 去掉前两位和横线
                if filename.startswith(uuid[3:8]) or uuid.replace('-', '') in filename.replace('-', ''):
                    file_path = os.path.join(prefix_dir, filename)
                    if os.path.isfile(file_path):
                        rel_path = f"res/raw-assets/{prefix}/{filename}"
                        game_files[rel_path] = file_path
        
        # 查找import目录中的文件
        prefix_dir = os.path.join(import_path, prefix)
        if os.path.exists(prefix_dir):
            for filename in os.listdir(prefix_dir):
                if filename.startswith(uuid[3:8]) or uuid.replace('-', '') in filename.replace('-', ''):
                    file_path = os.path.join(prefix_dir, filename)
                    if os.path.isfile(file_path):
                        rel_path = f"res/import/{prefix}/{filename}"
                        game_files[rel_path] = file_path
    
    return game_files


def generate_subgame_manifest(game_name, zh_name, game_files, version, base_url, output_dir):
    """
    生成子游戏的project.manifest和version.manifest
    
    服务器目录结构:
    - manifest文件: {base_url}/{game_name}/version.manifest (固定路径)
    - 资源文件: {base_url}/{version}/{game_name}/res/... (按版本号)
    """
    assets = {}
    
    for rel_path, abs_path in game_files.items():
        file_size = os.path.getsize(abs_path)
        file_md5 = calculate_file_md5(abs_path)
        
        assets[rel_path] = {
            "size": file_size,
            "md5": file_md5
        }
        
        # 如果是zip文件，标记为压缩
        if rel_path.endswith('.zip'):
            assets[rel_path]["compressed"] = True
    
    # 计算汇总MD5
    subver_md5 = calculate_subver_md5(assets)
    
    # 生成project.manifest (包含assets)
    project_manifest = {
        "version": version,
        "name": game_name,
        "zhName": zh_name,
        "packageUrl": f"{base_url}/{game_name}/{version}",           # 资源在版本号目录下
        "remoteVersionUrl": f"{base_url}/{game_name}/version.manifest",  # manifest在游戏名目录下
        "remoteManifestUrl": f"{base_url}/{game_name}/project.manifest",
        "assets": assets,
        "searchPaths": []
    }
    
    # 生成version.manifest (不含assets，用于快速版本检查)
    version_manifest = {
        "version": version,
        "name": game_name,
        "zhName": zh_name,
        "packageUrl": f"{base_url}/{game_name}/{version}",
        "remoteVersionUrl": f"{base_url}/{game_name}/version.manifest",
        "remoteManifestUrl": f"{base_url}/{game_name}/project.manifest"
    }
    
    # manifest输出到 {output_dir}/{game_name}/ (对应服务器的固定路径)
    manifest_output_dir = os.path.join(output_dir, game_name)
    os.makedirs(manifest_output_dir, exist_ok=True)
    
    # 写入manifest文件
    with open(os.path.join(manifest_output_dir, 'project.manifest'), 'w', encoding='utf-8') as f:
        json.dump(project_manifest, f, ensure_ascii=False)
    
    with open(os.path.join(manifest_output_dir, 'version.manifest'), 'w', encoding='utf-8') as f:
        json.dump(version_manifest, f, ensure_ascii=False)
    
    return subver_md5, len(assets)


def copy_game_files(game_files, version, game_name, output_dir):
    """
    复制子游戏文件到输出目录，保持目录结构
    
    资源输出到 {output_dir}/{game_name}/{version}/res/... (对应服务器的版本号路径)
    """
    game_res_dir = os.path.join(output_dir, game_name, version)
    
    for rel_path, abs_path in game_files.items():
        dest_path = os.path.join(game_res_dir, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(abs_path, dest_path)
    
    print(f"  已复制 {len(game_files)} 个文件到 {game_res_dir}")


def get_manifest_uuid(resources_path, game_name, manifest_name):
    """
    从meta文件获取子游戏manifest的UUID
    """
    meta_file = os.path.join(resources_path, 'Manifest', game_name, f'{manifest_name}.meta')
    if os.path.exists(meta_file):
        with open(meta_file, 'r', encoding='utf-8') as f:
            meta_data = json.load(f)
            return meta_data.get('uuid', '')
    return ''


def update_subgame_build_manifest(build_path, resources_path, output_dir, game_name):
    """
    用生成的manifest覆盖构建目录中的manifest文件
    Cocos Creator构建后，资源路径会变化：
    - 原始路径: assets/resources/Manifest/{game_name}/project.manifest
    - 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    """
    # 获取manifest文件的UUID
    project_uuid = get_manifest_uuid(resources_path, game_name, 'project.manifest')
    # version_uuid = get_manifest_uuid(resources_path, game_name, 'version.manifest')
    
    if not project_uuid:
        print(f"  警告: 无法获取 {game_name} manifest文件的UUID，跳过构建目录更新")
        return False
    # if not version_uuid:
    #     print(f"  警告: 无法获取 {game_name} manifest文件的UUID，跳过构建目录更新")
    #     return False
    
    # 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    project_build_path = os.path.join(
        build_path, 'res', 'raw-assets', 
        project_uuid[:2], f'{project_uuid}.manifest'
    )
    # version_build_path = os.path.join(
    #     build_path, 'res', 'raw-assets',
    #     version_uuid[:2], f'{version_uuid}.manifest'
    # )
    
    # 生成的manifest路径
    generated_project = os.path.join(output_dir, game_name, 'project.manifest')
    # generated_version = os.path.join(output_dir, game_name, 'version.manifest')
    
    updated_count = 0
    
    # 用生成的project.manifest覆盖构建目录
    if os.path.exists(project_build_path) and os.path.exists(generated_project):
        shutil.copy2(generated_project, project_build_path)
        print(f"  ✓ 已覆盖构建目录 project.manifest")
        updated_count += 1
    else:
        if not os.path.exists(project_build_path):
            print(f"  警告: 构建目录中未找到 project.manifest: {project_build_path}")
        if not os.path.exists(generated_project):
            print(f"  警告: 生成的 project.manifest 不存在")
    
    # 用生成的version.manifest覆盖构建目录
    # if os.path.exists(version_build_path) and os.path.exists(generated_version):
    #     shutil.copy2(generated_version, version_build_path)
    #     print(f"  ✓ 已覆盖构建目录 version.manifest")
    #     updated_count += 1
    # else:
    #     if not os.path.exists(version_build_path):
    #         print(f"  警告: 构建目录中未找到 version.manifest: {version_build_path}")
    #     if not os.path.exists(generated_version):
    #         print(f"  警告: 生成的 version.manifest 不存在")
    
    return updated_count == 2


def update_main_build_manifest(build_path, resources_path, subver_dict):
    """
    更新主包version.manifest中的subVer字段
    这是客户端判断子游戏是否需要更新的依据
    
    注意: 只更新subVer，不修改主包版本号
    """

    version_uuid = get_manifest_uuid(resources_path, 'Main', 'version.manifest')
    main_manifest_path = os.path.join(
        build_path, 'res', 'raw-assets',
        version_uuid[:2], f'{version_uuid}.manifest'
    )

    if os.path.exists(main_manifest_path):
        with open(main_manifest_path, 'r', encoding='utf-8') as f:
            main_manifest = json.load(f)
    else:
        print(f"错误: 主包version.manifest不存在: {main_manifest_path}")
        return
    
    # 只更新subVer，不修改主包版本号
    if 'subVer' not in main_manifest:
        main_manifest['subVer'] = {}
    
    main_manifest['subVer'] = subver_dict
    
    with open(main_manifest_path, 'w', encoding='utf-8') as f:
        json.dump(main_manifest, f, ensure_ascii=False)
    
    print(f"\n已更新主包version.manifest的subVer字段: {main_manifest_path}")


def get_available_games(resources_path):
    """获取所有可用的子游戏列表"""
    games_dir = os.path.join(resources_path, 'games')
    if not os.path.exists(games_dir):
        return []
    
    return [d for d in os.listdir(games_dir) 
            if os.path.isdir(os.path.join(games_dir, d))]


def get_game_zh_name(settings_path, game_name):
    """从AssetsBundle.json获取子游戏中文名"""
    bundle_file = os.path.join(settings_path, 'AssetsBundle.json')
    if os.path.exists(bundle_file):
        with open(bundle_file, 'r', encoding='utf-8') as f:
            bundle_data = json.load(f)
        for sub in bundle_data.get('subpackArr', []):
            if sub.get('name') == game_name:
                return sub.get('zhName', game_name)
    return game_name



def main():
    parser = argparse.ArgumentParser(description='子游戏热更包生成工具 (Windows)')
    parser.add_argument('--games', type=str, default='all',
                        help='子游戏名称，多个用逗号分隔，或 "all" 表示全部')
    parser.add_argument('--version', type=str, default='1.0.0.6',
                        help='热更版本号，如 1.0.0.0')
    parser.add_argument('--url', type=str, default='http://www.25599.in/GameX',
                        help='热更服务器基础URL，如 http://www.25599.in/GameX , http://www.25599.in/yindu')
    parser.add_argument('--build', type=str, default='../build/jsb-link',
                        help='构建目录路径 (默认: ../build/jsb-link)')
    parser.add_argument('--output', type=str, default='../hotupdate',
                        help='输出目录 (默认: ../hotupdate)')
    parser.add_argument('--copy-files', action='store_true', default='true',
                        help='是否复制资源文件到输出目录')
    
    args = parser.parse_args()
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # 解析路径
    build_path = os.path.normpath(os.path.join(script_dir, args.build))
    output_path = os.path.normpath(os.path.join(script_dir, args.output))
    settings_path = os.path.join(project_root, 'settings')
    resources_path = os.path.join(project_root, 'assets', 'resources')
    # main_manifest_path = os.path.join(resources_path, 'Manifest', 'Main', 'version.manifest')
    
    print("=" * 60)
    print("子游戏热更包生成工具")
    print("=" * 60)
    print(f"项目根目录: {project_root}")
    print(f"构建目录: {build_path}")
    print(f"输出目录: {output_path}")
    print(f"版本号: {args.version}")
    print(f"热更URL: {args.url}")
    print("")
    
    # 检查构建目录
    if not os.path.exists(build_path):
        print(f"错误: 构建目录不存在 {build_path}")
        print("请先在Cocos Creator中构建项目 (构建 -> Android/iOS)")
        sys.exit(1)
    
    # 获取要处理的游戏列表
    available_games = get_available_games(resources_path)
    
    if args.games.lower() == 'all':
        games = available_games
    else:
        games = [g.strip() for g in args.games.split(',')]
        # 验证游戏是否存在
        for game in games:
            if game not in available_games:
                print(f"警告: 子游戏 '{game}' 不存在于 assets/resources/games/")
    
    print(f"将处理以下子游戏: {', '.join(games)}")
    print("=" * 60)
    
    # 创建输出目录
    os.makedirs(output_path, exist_ok=True)
    
    # 存储所有子游戏的subVer MD5
    subver_dict = {}
    success_count = 0
    
    for game_name in games:
        print(f"\n[{game_name}] 开始处理...")
        print("-" * 40)
        
        # 获取中文名
        # zh_name = get_game_zh_name(settings_path, game_name)
        
        # 获取子游戏的UUID映射
        game_uuids = get_game_uuid_mapping(project_root, game_name)
        
        if not game_uuids:
            print(f"  警告: 未找到 {game_name} 的资源UUID映射")
            print(f"  可能原因: 1.游戏名称错误 2.资源未导入library")
            continue
        
        print(f"  找到 {len(game_uuids)} 个资源UUID")
        
        # 查找构建后的文件
        game_files = find_game_files_in_build(build_path, game_uuids)
        
        if not game_files:
            print(f"  警告: 未找到 {game_name} 的构建文件")
            print(f"  请确保已在Cocos Creator中构建项目")
            continue
        
        print(f"  找到 {len(game_files)} 个构建文件")
        
        # 生成manifest
        subver_md5, file_count = generate_subgame_manifest(
            game_name, game_name, game_files, args.version, args.url, output_path
        )
        
        subver_dict[game_name] = subver_md5
        success_count += 1
        print(f"  ✓ manifest生成完成")
        print(f"  ✓ subVer MD5: {subver_md5}")
        
        # 更新构建目录中的manifest文件
        # update_subgame_build_manifest(build_path, resources_path, output_path, game_name)
        
        # 复制文件（可选）
        if args.copy_files:
            copy_game_files(game_files, args.version, game_name, output_path)
    
    # 更新主包的version.manifest (只更新subVer，不改版本号)
    update_main_build_manifest(build_path, resources_path, subver_dict)

    if subver_dict:        
        print("\n" + "=" * 60)
        print(f"处理完成! 成功: {success_count}/{len(games)}")
        print("=" * 60)
        print(f"\n输出目录: {output_path}")
        print("\n各子游戏 subVer MD5 (已写入主包version.manifest):")
        for game, md5 in subver_dict.items():
            print(f"  {game}: {md5}")
        
        print("\n" + "-" * 60)
        print("下一步操作:")
        print(f"1. 将 {output_path}/ 目录下的文件上传到服务器")
        print("-" * 60)
    else:
        print("\n没有成功处理任何子游戏")
        sys.exit(1)


if __name__ == '__main__':
    main()
