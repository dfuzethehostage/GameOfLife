
from browser import document,window

def getData(data):
    data = window.JSON.parse(data)

def sendData():
    data = window.JSON.stringify({
        "coords_dead": [[1,1]],
        "coords_alive": [[3,3]]
    })
    return data
    

document.getPythonData = sendData
document.sendPythonData = getData
