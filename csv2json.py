"""
PowerWatch
Format US power plant data points to json for visualization
"""

import csv
import json
import codecs

filename = 'powerwatch_data.csv'
first_row = 0
fhand = codecs.open('dataPoints.js', 'w', 'utf-8')
fhand.write("dataPoints = [\n")

with open(filename) as fn:
    reader = csv.reader(fn)
    header = reader.next()
    plantname_col = header.index('name')
    fuel_col = header.index('fuel')
    capacity_col = header.index('capacity_mw')
    lat_col = header.index('latitude')
    lng_col = header.index('longitude')
    for row in reader:
        try:
            plantname = str(row[plantname_col])
            plantname = plantname.replace("'","")
            fuel = str(row[fuel_col])
            capacity = str(row[capacity_col])
            lat = str(row[lat_col])
            lng = str(row[lng_col])
            if float(lat) < -60 or float(lat) >= 85: continue
            if abs(float(lng)) > 180: continue
            if float(lat) == 0 or float(lng) == 0: continue
            try:
                if first_row == 0:
                    output = "['"+plantname+"', '"+fuel+"', "+capacity+", "+lat+", "+lng+"]"
                    first_row = 1
                    fhand.write(output)
                else:
                    # fhand.write(",\n")
                    output = ",\n['"+plantname+"', '"+fuel+"', "+capacity+", "+lat+", "+lng+"]"
                    fhand.write(output)
            except: continue
        except: continue
fn.close()

fhand.write("\n];\n")
fhand.close()
