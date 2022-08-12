
with open(r"C:\Users\yezouhua\Desktop\TE\AA.json",'r') as fp1, open(r"C:\Users\yezouhua\Desktop\TE\res.json",'w') as fp2:

    fp2.write(''.join(fp1.readlines()[::-1]))