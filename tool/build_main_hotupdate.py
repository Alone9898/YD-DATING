#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
主包热更包生成工具 (Windows)

主包热更包含:
    - src/ 目录下的脚本文件 (.jsc)
    - res/import.zip 或 res/import/ 目录
    - res/raw-assets/ 下的资源文件 (排除子游戏资源)

使用方法:
    python main_hotupdate.py --version 1.2.2.4 --url https://xxx.com/GameX

参数说明:
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


def get_subgame_uuids(project_root):
    """
    获取所有子游戏资源的UUID，用于排除
    通过扫描 assets/resources/games/ 目录下所有 .meta 文件获取UUID
    """
    subgame_uuids = set()
    games_path = os.path.join(project_root, 'assets', 'resources', 'games')
    
    if not os.path.exists(games_path):
        print(f"  警告: 子游戏目录不存在 {games_path}")
        return subgame_uuids
    
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
    
    # 遍历 games 目录下所有 .meta 文件
    for root, dirs, files in os.walk(games_path):
        for filename in files:
            if filename.endswith('.meta'):
                meta_path = os.path.join(root, filename)
                try:
                    with open(meta_path, 'r', encoding='utf-8') as f:
                        meta_data = json.load(f)
                    subgame_uuids.update(extract_uuids_recursive(meta_data))
                except (json.JSONDecodeError, IOError) as e:
                    # 忽略无法解析的meta文件
                    pass
    
    return subgame_uuids


def normalize_uuid_set(subgame_uuids):
    """
    预处理UUID集合，去掉连字符，用于快速查找
    """
    return {uuid.replace('-', '') for uuid in subgame_uuids}


def is_subgame_file(file_path, subgame_uuids_normalized):
    """
    判断文件是否属于子游戏资源
    subgame_uuids_normalized: 已经去掉连字符的UUID集合
    """
    filename = os.path.basename(file_path)
    # 获取文件名中的UUID部分（去掉扩展名和连字符）
    file_uuid = os.path.splitext(filename)[0].replace('-', '')
    
    # O(1) 查找
    return file_uuid in subgame_uuids_normalized


def collect_main_files(build_path, subgame_uuids):
    """
    收集主包需要热更的文件 (排除子游戏资源)
    """
    main_files = {}
    
    # 预处理UUID集合，提升查找性能
    subgame_uuids_normalized = normalize_uuid_set(subgame_uuids)
    
    # 1. 收集 src/ 目录下的脚本文件
    src_path = os.path.join(build_path, 'src')
    if os.path.exists(src_path):
        for root, dirs, files in os.walk(src_path):
            for filename in files:
                abs_path = os.path.join(root, filename)
                rel_path = os.path.relpath(abs_path, build_path).replace('\\', '/')
                main_files[rel_path] = abs_path
    
    # 2. 收集 res/import.zip 或 res/import/ 目录
    import_zip = os.path.join(build_path, 'res', 'import.zip')
    if os.path.exists(import_zip):
        main_files['res/import.zip'] = import_zip
    else:
        import_path = os.path.join(build_path, 'res', 'import')
        if os.path.exists(import_path):
            for root, dirs, files in os.walk(import_path):
                for filename in files:
                    abs_path = os.path.join(root, filename)
                    # 排除子游戏资源
                    if not is_subgame_file(abs_path, subgame_uuids_normalized):
                        rel_path = os.path.relpath(abs_path, build_path).replace('\\', '/')
                        main_files[rel_path] = abs_path
    
    # 3. 收集 res/raw-assets/ 目录 (排除子游戏资源)
    raw_assets_path = os.path.join(build_path, 'res', 'raw-assets')
    if os.path.exists(raw_assets_path):
        for root, dirs, files in os.walk(raw_assets_path):
            for filename in files:
                abs_path = os.path.join(root, filename)
                # 排除子游戏资源
                if not is_subgame_file(abs_path, subgame_uuids_normalized):
                    rel_path = os.path.relpath(abs_path, build_path).replace('\\', '/')
                    main_files[rel_path] = abs_path
    
    return main_files


def load_existing_subver(manifest_path):
    """
    加载现有的subVer数据
    """
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('subVer', {})
    return {}


def generate_main_manifest(main_files, version, base_url, build_path, resources_path, output_dir):
    """
    生成主包的project.manifest和version.manifest
    """
    assets = {}
    
    print(f"  正在计算 {len(main_files)} 个文件的MD5...")
    
    for rel_path, abs_path in main_files.items():
        file_size = os.path.getsize(abs_path)
        file_md5 = calculate_file_md5(abs_path)
        
        assets[rel_path] = {
            "size": file_size,
            "md5": file_md5
        }
        
        # 如果是zip文件，标记为压缩
        if rel_path.endswith('.zip'):
            assets[rel_path]["compressed"] = True
    
    
    """
    用生成的manifest覆盖构建目录中的manifest文件
    Cocos Creator构建后，资源路径会变化：
    - 原始路径: assets/resources/Manifest/Main/project.manifest
    - 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    """
    # 获取manifest文件的UUID
    project_uuid = get_manifest_uuid(resources_path, 'project.manifest')
    version_uuid = get_manifest_uuid(resources_path, 'version.manifest')
    
    if not project_uuid or not version_uuid:
        print("  警告: 无法获取manifest文件的UUID，跳过构建目录更新")
        return False
    
    # 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    project_build_path = os.path.join(
        build_path, 'res', 'raw-assets', 
        project_uuid[:2], f'{project_uuid}.manifest'
    )
    version_build_path = os.path.join(
        build_path, 'res', 'raw-assets',
        version_uuid[:2], f'{version_uuid}.manifest'
    )
    
    # 生成project.manifest (包含assets)
    project_manifest = {}
    # 尝试从现有的project.manifest读取
    if os.path.exists(project_build_path):
        with open(project_build_path, 'r', encoding='utf-8') as f:
            project_manifest = json.load(f)
    # project_manifest = {
    #     "version": version,
    #     "name": "Main",
    #     "zhName": "主包",
    #     "packageUrl": f"{base_url}/Main/{version}",
    #     "remoteVersionUrl": f"{base_url}/Main/version.manifest",
    #     "remoteManifestUrl": f"{base_url}/Main/project.manifest",
    #     "assets": assets,
    #     "searchPaths": []
    # }
    project_manifest["version"] = version
    project_manifest["packageUrl"] = f"{base_url}/Main/{version}"
    project_manifest["remoteVersionUrl"] = f"{base_url}/Main/version.manifest"
    project_manifest["remoteManifestUrl"] = f"{base_url}/Main/project.manifest"
    project_manifest["assets"] = assets
    
    # 生成version.manifest (从构建路径读取原有数据，只更新指定字段)
    version_manifest = {}
    # 尝试从现有的version.manifest读取
    if os.path.exists(version_build_path):
        with open(version_build_path, 'r', encoding='utf-8') as f:
            version_manifest = json.load(f)
    
    # 只更新指定的4个字段
    version_manifest["version"] = version
    version_manifest["packageUrl"] = f"{base_url}/Main/{version}"
    version_manifest["remoteVersionUrl"] = f"{base_url}/Main/version.manifest"
    version_manifest["remoteManifestUrl"] = f"{base_url}/Main/project.manifest"
    
    # manifest输出到 {output_dir}/Main/
    manifest_output_dir = os.path.join(output_dir, 'Main')
    os.makedirs(manifest_output_dir, exist_ok=True)
    
    # 写入manifest文件
    with open(os.path.join(manifest_output_dir, 'project.manifest'), 'w', encoding='utf-8') as f:
        json.dump(project_manifest, f, ensure_ascii=False)
    
    with open(os.path.join(manifest_output_dir, 'version.manifest'), 'w', encoding='utf-8') as f:
        json.dump(version_manifest, f, ensure_ascii=False)
    
    return len(assets)


def copy_main_files(main_files, version, output_dir):
    """
    复制主包文件到输出目录
    """
    main_res_dir = os.path.join(output_dir, 'Main', version)
    
    for rel_path, abs_path in main_files.items():
        dest_path = os.path.join(main_res_dir, rel_path)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        shutil.copy2(abs_path, dest_path)
    
    print(f"  已复制 {len(main_files)} 个文件到 {main_res_dir}")


def get_manifest_uuid(resources_path, manifest_name):
    """
    从meta文件获取manifest的UUID
    """
    meta_file = os.path.join(resources_path, 'Manifest', 'Main', f'{manifest_name}.meta')
    if os.path.exists(meta_file):
        with open(meta_file, 'r', encoding='utf-8') as f:
            meta_data = json.load(f)
            return meta_data.get('uuid', '')
    return ''


def update_build_manifest(build_path, resources_path, output_dir):
    """
    用生成的manifest覆盖构建目录中的manifest文件
    Cocos Creator构建后，资源路径会变化：
    - 原始路径: assets/resources/Manifest/Main/project.manifest
    - 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    """
    # 获取manifest文件的UUID
    project_uuid = get_manifest_uuid(resources_path, 'project.manifest')
    version_uuid = get_manifest_uuid(resources_path, 'version.manifest')
    
    if not project_uuid or not version_uuid:
        print("  警告: 无法获取manifest文件的UUID，跳过构建目录更新")
        return False
    
    # 构建路径: res/raw-assets/{uuid前2位}/{uuid}.manifest
    project_build_path = os.path.join(
        build_path, 'res', 'raw-assets', 
        project_uuid[:2], f'{project_uuid}.manifest'
    )
    version_build_path = os.path.join(
        build_path, 'res', 'raw-assets',
        version_uuid[:2], f'{version_uuid}.manifest'
    )
    
    # 生成的manifest路径
    generated_project = os.path.join(output_dir, 'Main', 'project.manifest')
    generated_version = os.path.join(output_dir, 'Main', 'version.manifest')
    
    updated_count = 0
    
    # 用生成的project.manifest覆盖构建目录
    if os.path.exists(project_build_path) and os.path.exists(generated_project):
        shutil.copy2(generated_project, project_build_path)
        print(f"  ✓ 已覆盖构建目录 project.manifest: {project_build_path}")
        updated_count += 1
    else:
        if not os.path.exists(project_build_path):
            print(f"  警告: 构建目录中未找到 project.manifest: {project_build_path}")
        if not os.path.exists(generated_project):
            print(f"  警告: 生成的 project.manifest 不存在: {generated_project}")
    
    # 用生成的version.manifest覆盖构建目录
    if os.path.exists(version_build_path) and os.path.exists(generated_version):
        shutil.copy2(generated_version, version_build_path)
        print(f"  ✓ 已覆盖构建目录 version.manifest: {version_build_path}")
        updated_count += 1
    else:
        if not os.path.exists(version_build_path):
            print(f"  警告: 构建目录中未找到 version.manifest: {version_build_path}")
        if not os.path.exists(generated_version):
            print(f"  警告: 生成的 version.manifest 不存在: {generated_version}")
    
    return updated_count == 2


def main():
    parser = argparse.ArgumentParser(description='主包热更包生成工具 (Windows)')
    parser.add_argument('--version', type=str, default='1.0.0.6',
                        help='热更版本号，如 1.0.0.0')
    parser.add_argument('--url', type=str, default='http://www.25599.in/GameX',
                        help='热更服务器基础URL，如 http://www.25599.in/GameX , http://www.25599.in/yindu')
    parser.add_argument('--build', type=str, default='../build/jsb-link',
                        help='构建目录路径 (默认: ../build/jsb-link)')
    parser.add_argument('--output', type=str, default='../hotupdate',
                        help='输出目录 (默认: ../hotupdate)')
    parser.add_argument('--copy-files', action='store_true', default=True,
                        help='是否复制资源文件到输出目录')
    
    args = parser.parse_args()
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # 解析路径
    build_path = os.path.normpath(os.path.join(script_dir, args.build))
    output_path = os.path.normpath(os.path.join(script_dir, args.output))
    resources_path = os.path.join(project_root, 'assets', 'resources')
    
    print("=" * 60)
    print("主包热更包生成工具")
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
    
    # 获取子游戏UUID用于排除
    print("\n正在分析子游戏资源...")
    subgame_uuids = get_subgame_uuids(project_root)
    print(f"找到 {len(subgame_uuids)} 个子游戏资源UUID")
    
    # 收集主包文件
    print("\n正在收集主包文件...")
    main_files = collect_main_files(build_path, subgame_uuids)
    print(f"找到 {len(main_files)} 个主包文件")
    
    if not main_files:
        print("错误: 未找到任何主包文件")
        sys.exit(1)
    
    # 创建输出目录
    os.makedirs(output_path, exist_ok=True)
    
    # 生成manifest
    print("\n正在生成manifest...")
    file_count = generate_main_manifest(
        main_files, args.version, args.url, build_path, resources_path, output_path
    )
    print(f"  ✓ manifest生成完成，包含 {file_count} 个文件")
    
    # 更新构建目录中的manifest文件
    print("\n正在更新构建目录中的manifest...")
    update_build_manifest(build_path, resources_path, output_path)
    
    # 复制文件（可选）
    if args.copy_files:
        print("\n正在复制资源文件...")
        copy_main_files(main_files, args.version, output_path)
    
    print("\n" + "=" * 60)
    print("主包热更包生成完成!")
    print("=" * 60)
    print(f"\n输出目录: {output_path}")
    print(f"  Main/project.manifest  - 包含所有文件MD5")
    print(f"  Main/version.manifest  - 版本信息 + subVer")

    print("\n" + "-" * 60)
    print("服务器目录结构:")
    print(f"  {args.url}/")
    print(f"  ├── Main/")
    print(f"      ├── version.manifest   <- 上传 Main/version.manifest")
    print(f"      └── project.manifest   <- 上传 Main/project.manifest")
    print(f"      └── Main/{args.version}               <- 上传资源文件")
    print("-" * 60)
    
    print("\n下一步操作:")
    print(f"1. 将 {output_path}/Main/ 目录下的文件上传到服务器")


if __name__ == '__main__':
    main()
