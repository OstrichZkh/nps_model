
from osgeo import gdal
import sys
import numpy as np
import pandas as pd
import os
os.environ['PROJ_LIB'] = r'C:\Users\yezouhua\AppData\Local\Programs\Python\Python39\Lib\site-packages\pyproj\proj_dir\share\proj'


# gdalEnv =  sys.argv[3]
# landusePath  =  r'C:\Users\yezouhua\Desktop\master\webPlatform\JLX\landUse.tif'
# filePath = r'C:\Users\yezouhua\Desktop\master\webPlatform\JLX'

def load_img_to_array(img_file_path):

    dataset = gdal.Open(img_file_path)  # 读取栅格数据
    Bands = np.array([dataset.RasterCount])

    # 判断是否读取到数据
    if dataset is None:
        sys.exit(1)  # 退出

    projection = dataset.GetProjection()  # 投影
    transform = dataset.GetGeoTransform()  # 几何信息


    array_channel = 0  # 数组从通道从0开始

    # 读取Bands列表中指定的波段
    for band in Bands:  # 图片波段从1开始
        band = int(band)
        srcband = dataset.GetRasterBand(band)  # 获取栅格数据集的波段
        if srcband is None:
            continue
        #  一个通道转成一个数组（5888,5888）
        arr = srcband.ReadAsArray()
    return arr


def cellaround(x, y, data):
    xaround = np.zeros((8, 1))
    xaround[0] = data[x + 1, y]  # 右
    xaround[1] = data[x + 1, y + 1]  # 右下
    xaround[2] = data[x, y + 1]  # 下
    xaround[3] = data[x - 1, y + 1]  # 左下
    xaround[4] = data[x - 1, y]  # 左
    xaround[5] = data[x - 1, y - 1]  # 左上
    xaround[6] = data[x, y - 1]  # 上
    xaround[7] = data[x + 1, y - 1]  # 右上
    return xaround


def sinkcount(data):
    nrow, ncol = data.shape
    nodata = np.min(data)
    sinkcount = 0
    for i in range(1, nrow - 1):
        for j in range(1, ncol - 1):
            x = data[i, j]
            if x != nodata:
                if ((cellaround(i, j, data) - x) > 0).all() == 1:
                    sinkcount += 1
    return sinkcount


def sinkfill(data, zlimit):
    """
    fill: 填洼
    zlimit: 允许的最大坡降值
    """
    nrow, ncol = data.shape
    nodata = np.min(data)
    for i in range(1, nrow - 1):
        for j in range(1, ncol - 1):
            x = data[i, j]
            if x != nodata:
                if ((cellaround(i, j, data) - x) > zlimit).all() == 1:
                    data[i, j] = np.min(cellaround(i, j, data))
    return data


sourcePath = sys.argv[1]
filePath = sys.argv[2]
eventType = sys.argv[3] # soilType,DEM,landuse

if eventType=='landuse':
    data2 = load_img_to_array(sourcePath)
    output2 = pd.DataFrame(data2)
    output2.to_csv(filePath+r'./landUse.csv')
    luDF = pd.read_csv(filePath + r'./landUse.csv', index_col=0).values
    luDict = {}
    for x in range(0, len(luDF)):
        for y in range(0, len(luDF[0])):
            code = luDF[x][y]
            if code in luDict:
                luDict[code] += 1
            else:
                luDict[code] = 1
    print(luDict)
elif eventType=='DEM':
    data2 = load_img_to_array(sourcePath)
    output2 = pd.DataFrame(data2)
    output2.to_csv(filePath + r'./DEM.csv')
    DEMDF = pd.read_csv(filePath + r'./DEM.csv', index_col=0).values
    DEMArr = []
    for x in range(0, len(DEMDF)):
        for y in range(0, len(DEMDF[0])):
            dem = DEMDF[x][y]
            if dem > 0 and dem < 8000:
                DEMArr.append(dem)
    DEMArr.sort()
    minDEM = DEMArr[0]
    maxDEM = DEMArr[len(DEMArr) - 1]
    gap = (maxDEM - minDEM) / 10
    countArr = []
    demArr = []
    for i in range(1, 11):
        nextMax = gap * i + minDEM

        demArr.append('%s-%s' % (int(nextMax - gap), int(nextMax)))
        count = 0
        while DEMArr.pop(0) < nextMax:
            count += 1
        countArr.append(count)
    print({
        'DEM':demArr,
        'count':countArr
    })
elif eventType=='soilType':
    data2 = load_img_to_array(sourcePath)
    output2 = pd.DataFrame(data2)
    output2.to_csv(filePath + r'./soilType.csv')
    luDF = pd.read_csv(filePath + r'./soilType.csv', index_col=0).values
    luDict = {}
    for x in range(0, len(luDF)):
        for y in range(0, len(luDF[0])):
            code = luDF[x][y]
            if code in luDict:
                luDict[code] += 1
            else:
                luDict[code] = 1
    print(luDict)





