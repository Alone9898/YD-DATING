import plistlib
import os
import sys
from PIL import Image


def export_image(img, pathname, item):
    # 去透明后的子图矩形
    x, y, w, h = tuple(map(int, item['frame']))
    # 获取子图左上角，右下角
    if item['rotated']:
        box = (x, y, x + h, y + w)
    else:
        box = (x, y, x + w, y + h)
    sprite = img.crop(box)
    # rotated纹理旋转90度
    if item['rotated']:
        sprite = sprite.transpose(Image.ROTATE_90)
    sprite.save(os.path.join('.', pathname))


def get_frame(frame):
    result = {}
    if frame['frame']:
        result['frame'] = frame['frame'].replace(
            '}', '').replace('{', '').split(',')
        result['sourceSize'] = frame['sourceSize'].replace(
            '}', '').replace('{', '').split(',')
        result['sourceColorRect'] = frame['sourceColorRect'].replace(
            '}', '').replace('{', '').split(',')
        result['rotated'] = frame['rotated']
    return result


def gen_image(file_name, export_path):
    # 检查文件是否存在
    plist = file_name + '.plist'
    if not os.path.exists(plist):
        print('plist文件【%s】不存在！请检查' % plist)
        return

    png = file_name + '.png'
    if not os.path.exists(png):
        print('png文件【%s】不存在！请检查' % plist)
        return

    # 检查导出目录
    if not os.path.exists(export_path):
        try:
            os.mkdir(export_path)
        except Exception as e:
            print(e)
            return

    # 使用plistlib库加载 plist 文件
    lp = plistlib.load(open(plist, 'rb'))
    # 加载 png 图片文件
    img = Image.open(png)

    # 读取所有小图数据
    frames = lp['frames']
    for key in frames:
        item = get_frame(frames[key])
        print(os.path.basename(key))
        export_image(img, os.path.join(export_path, os.path.basename(key)), item)


# if __name__ == '__main__':
#     # if len(sys.argv) == 3:
#     #     filename = sys.argv[1]
#     #     exportPath = sys.argv[2]
#     #     gen_image(filename, exportPath)
#     gen_image("1d0ef5aac.c3913", "output")

if __name__ == "__main__":
    # gen_image(sys.argv[1], sys.argv[2])
    for root, dirs, files in os.walk('.'):
        for fileName in files:
            baseName = os.path.splitext(fileName)[0]
            fileType = os.path.splitext(fileName)[1]
            if fileType == ".plist":
                gen_image(baseName, baseName)
                pass
