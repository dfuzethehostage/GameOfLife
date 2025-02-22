from browser import document,window

def getDataFromJs(data):
    data = window.JSON.parse(data)
    return

def sendDataToJs():
    data = window.JSON.stringify({
        "coords_dead": [[window.Math.floor(window.Math.random() * 400),window.Math.floor(window.Math.random() * 400)]],
        "coords_alive": [[window.Math.floor(window.Math.random() * 400),window.Math.floor(window.Math.random() * 400)]]
    })
    return data
    

window.getDataFromPython = sendDataToJs
window.sendDataToPython = getDataFromJs
