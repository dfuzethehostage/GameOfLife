from browser import window


grid_width = 100
grid_height = 100
grid = [[0 for _ in range(grid_width)] for _ in range(grid_height)]

def getDataFromJs(data):
    
    global grid
    data = window.JSON.parse(data)
    y = data["y"]
    x = data["x"]
    if(data.draw): grid[y][x] = 1
    else: grid[y][x] = 0  
    return

def sendDataToJs():
    
    global grid
    new_grid = [[0 for _ in range(grid_width)] for _ in range(grid_height)]
    coords_dead = []
    coords_alive = []

    
    for y in range(grid_height):
        for x in range(grid_width):
            neighbors = count_neighbors(y, x)
            if grid[y][x]:  # Cell is alive
                if neighbors < 2 or neighbors > 3:
                    coords_dead.append([y, x])  # Cell dies
                else:
                    coords_alive.append([y, x])  # Cell stays alive
                    new_grid[y][x] = 1
            else:  # Cell is dead
                if neighbors == 3:
                    coords_alive.append([y, x])  # Cell is created
                    new_grid[y][x] = 1

    
    grid = new_grid

    # Send the changes to JavaScript
    data = window.JSON.stringify({
        "coords_dead": coords_dead,
        "coords_alive": coords_alive
    })
    return data

def count_neighbors(y, x):
    
    neighbors = 0
    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            if dx == 0 and dy == 0:
                continue
            ny = y + dy
            nx = x + dx
            if 0 <= ny < grid_height and 0 <= nx < grid_width:
                neighbors += grid[ny][nx]
    return neighbors

# Expose the Python functions to JavaScript
window.getDataFromPython = sendDataToJs
window.sendDataToPython = getDataFromJs