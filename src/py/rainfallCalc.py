import sys
import json
import datetime
# os.system('chcp 65001')
rainfallPath = sys.argv[1]
jsonPath = sys.argv[2]
# jsonPath = r'C:\Users\yezouhua\Desktop\master\webPlatform\SSS\dataInfo.json'
# rainfallPath = r'C:\Users\yezouhua\Desktop\master\webPlatform\SSS\rain.txt'
# 获取降雨列表
rainfallArr = []
for line in open(rainfallPath):
    rainfallArr.append(line.replace('\n',''))
# 此文件用于计算降雨数据
rainfallArr.pop(0)

# 读取项目的起始，结束时间
# with open(jsonPath, "r") as f:
#     projInfo = json.load(f)

js = open(jsonPath)
projInfo = json.load(js)
# print(isinstance(projInfo,dict))


startDate = projInfo['periods']['startDate'].split('-')
endDate = projInfo['periods']['endDate'].split('-')


startDateTime = datetime.date(int(startDate[0]),int(startDate[1]),int(startDate[2]))
endDateTime = datetime.date(int(endDate[0]),int(endDate[1]),int(endDate[2]))
gapDays = (endDateTime-startDateTime).days

monthSum = 0
monthArr = []
count = 0
# [[2011,1],[2011,2]]
dateArr = []

while True:
    if(startDateTime==endDateTime):
        break
    monthSum += float(rainfallArr[count])
    count = count + 1
    monBefore = startDateTime.month
    startDateTime = startDateTime+datetime.timedelta(days=1)
    monAfter = startDateTime.month
    if(monBefore!=monAfter or count==4283):
        if(monthSum>=0):
            monthArr.append(monthSum)
        else:
            monthArr.append(0)
        monthSum = 0

print(monthArr)








