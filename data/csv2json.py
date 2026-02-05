import csv
import json

out = []

keys = {}
with open("ucs_headers.json", "r") as headerfile:
    keys = json.load(headerfile)["csv2json"]

with open("./UCS-Satellite-Data.csv", "r") as csvfile:
    reader = csv.reader(csvfile)
    
    headers = []

    for row in reader:
        if len(headers) == 0:
            headers = row
        else:
            entry = {}
            sources = []

            for i, c in enumerate(row):
                h = headers[i]
                if h == "": continue

                if h == "Source":
                    if c != "": sources.append(c)
                else:
                    entry[keys[h.strip()]] = c

            entry["srcURLs"] = sources
            out.append(entry)

with open("ucs.json", "w") as jsonfile:
    json.dump(out, jsonfile, indent=4)