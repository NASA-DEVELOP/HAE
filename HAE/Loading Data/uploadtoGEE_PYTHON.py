#/*
###THIS IS A PYTHON FILE THAT MUST BE RUN IN YOUR LOCAL PYTHON IDE (i.e. pycharm, idle, Spyder, iPython, etc.)
###This will not run in google earth engine so don't even think about it


##################################################################################################


import datetime
import subprocess
import os
##maybe helpful -> https://github.com/tracek/gee_asset_manager

##Google Earth Engine libraries must be installed

## before running this file, make sure you have uploaded your local folder of geotiff's to Google cloud storage.
## --> to upload to google cloud storage, go to cloud.google.com/storage and click console in the top-right.
## ---> Then, click the menu button in the top-left and click on storage. Click or create a bucket and upload folders!

def findDate(dateStr):
    ## IF inputted date format is YYYYDDD
    if len(dateStr)==7:
        laterDatesNotLoaded = datetime.datetime.strptime("2015305", "%Y%j")
        date = datetime.datetime.strptime(dateStr,"%Y%j")
        if date>laterDatesNotLoaded:
            outputDateStr = str(date.year)+"-"+str(date.month)+"-"+str(date.day)
            return outputDateStr
        else:
            return None
    ##IF inputted date format is YYYYMMDD (standard)
    else:
        year,month,day = dateStr[:4], dateStr[4:6], dateStr[6:]
        return year+"-"+month+"-"+day

def upload(fileName):
    #******MUST EDIT NEXT LINE******#
    destinationID = "projects/chile-water/SMAP_SM/SMAP_Daily/" + fileName.replace(".tif","")   ##the path to asset it GEE assets tab
    # ******MUST EDIT NEXT LINE******#
    source= "gs://arc_chilewater_2017sp/SMAP_SM/"+fileName         ##the path to google cloud storage source
    #********MUST EDIT NEXT LINE*********#
    date=findDate(fileName[15:23])     ## find the location of the date in the title
    if date!=None:
        geeCommand = "earthengine upload image --asset_id=" + destinationID + " --time_start=" + date + " --property acl=public " + source
        print geeCommand
        p=subprocess.Popen("powershell.exe " + geeCommand, stdin=subprocess.PIPE, shell=True)
        stdout, stderr = p.communicate()


#this actually calls the function
#******MUST EDIT NEXT LINE******#
directory="C:\Users\mjwebb4\Documents\SMAP_data\SMAP_SM"    ###change to your local folder containing geotiff's
for filename in os.listdir(directory):
    upload(filename)




## ***  if we used the geebam library, this would be the code ***

#directory = "C:\Users\wbabis\Desktop\ChileWaterResources\mytest"
#geebamCommand= "geebam upload -u billybabis@gmail.com --source "+directory+" -m newfile.csv --dest "+"projects/chile-water/MODIS_SC/MODIS_8day/"
#p = subprocess.Popen("powershell.exe " + geebamCommand)
#upload(user=username, source_path=source, destination_path=dest, metadata_path=metadata, multipart_upload=multipart, nodata_value=nodata)
#*/