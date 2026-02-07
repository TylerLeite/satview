import json

DAT = []
with open("_SATCAT.json", "r") as ifile:
    DAT = json.load(ifile)

def reword(entry):
    out = {}
    for k, v in entry.items():
        parts = k.lower().split('_')
        new_k = parts[0] + "".join([part.capitalize() for part in parts[1:]])
        out[new_k] = v
    return out

dat = [reword(e) for e in DAT]

with open("satcat.json", "w") as file:
    json.dump(dat, file, indent=4)