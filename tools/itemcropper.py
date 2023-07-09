import PIL.Image as Image
import json
import os

positions = './images/positions'

for position in os.listdir(positions):
    print(position)
    position_fp = os.path.join(positions, position)
    for view in os.listdir(position_fp):
        print("--- " + view)
        view_fp = os.path.join(position_fp, view)
        for file in os.listdir(view_fp):
            print("------ " + file)
            if file == 'items':
                itemsfolder_fp = os.path.join(view_fp, file)
                items_json_fp = os.path.join(itemsfolder_fp, 'items.json')
                itemdata = {"items" : []}
                try:
                    with open(items_json_fp, 'r') as itemdatafile:
                        itemdata = json.load(itemdatafile)
                except FileNotFoundError:
                    ...

                
                for item in os.listdir(itemsfolder_fp):
                    name, extention = os.path.splitext(item)
                    if extention != '.png':
                        continue
                    item_fp = os.path.join(itemsfolder_fp, item)
                    print("---------" + name)


                    image=Image.open(item_fp)

                    imageComponents = image.split()

                    rgbImage = Image.new("RGB", image.size, (0,0,0))
                    rgbImage.paste(image, mask=imageComponents[3])
                    croppedBox = rgbImage.getbbox()


                    if croppedBox[2] == image.size[0] and croppedBox[3] == image.size[1]:
                        print("Image {} already cropped, skipping...".format(name))
                    else:
                        itemdata['items'].append({'name': name, 'croppedBox': croppedBox})
                        cropped=image.crop(croppedBox)
                        cropped.save(os.path.join(itemsfolder_fp, item))
                    
                with open(os.path.join(itemsfolder_fp, "items.json"), 'w') as outfile:
                    json.dump(itemdata, outfile)