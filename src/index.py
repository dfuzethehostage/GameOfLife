from browser import window
import time

# Configuration
GRID_WIDTH = 100
GRID_HEIGHT = 100
CELL_SIZE = 10

class GameState:
    def __init__(self):
        self.live_cells = set()  # Use a set to store live cells
        self.last_update = time.time()
        self.update_interval = 0.2  # Update every 200ms
        self.generation = 0  # Track the current generation
        self.highscore = 0   # Track the highest generation reached

    def update(self):
        """Calculate the next generation of the grid."""
        current_time = time.time()
        if current_time - self.last_update < self.update_interval:
            return {
                "coords_dead": [],
                "coords_alive": [],
                "generation": self.generation,
                "highscore": self.highscore
            }

        # Track changes
        new_live_cells = set()
        cells_to_check = self.get_cells_to_check()

        # Calculate the next generation
        for (y, x) in cells_to_check:
            neighbors = self.count_neighbors(y, x)
            if (y, x) in self.live_cells:  # Cell is alive
                if 2 <= neighbors <= 3:
                    new_live_cells.add((y, x))  # Cell stays alive
            else:  # Cell is dead
                if neighbors == 3:
                    new_live_cells.add((y, x))  # Cell is created

        # Determine changes
        coords_dead = self.live_cells - new_live_cells
        coords_alive = new_live_cells - self.live_cells

        # Update the grid and generation counter
        self.live_cells = new_live_cells
        self.generation += 1
        if self.generation > self.highscore:
            self.highscore = self.generation
        self.last_update = current_time

        return {
            "coords_dead": list(coords_dead),
            "coords_alive": list(coords_alive),
            "generation": self.generation,
            "highscore": self.highscore
        }

    def reset(self):
        """Reset the grid and generation counter."""
        self.live_cells = set()
        self.generation = 0
        return {
            "coords_dead": list(self.live_cells),  # Clear all live cells
            "coords_alive": [],
            "generation": self.generation,
            "highscore": self.highscore
        }

    def get_cells_to_check(self):
        """Get all cells to check (live cells and their neighbors)."""
        cells_to_check = set()
        for (y, x) in self.live_cells:
            # Add the cell and its neighbors
            for dy in [-1, 0, 1]:
                for dx in [-1, 0, 1]:
                    ny = y + dy
                    nx = x + dx
                    if 0 <= ny < GRID_HEIGHT and 0 <= nx < GRID_WIDTH:
                        cells_to_check.add((ny, nx))
        return cells_to_check

    def count_neighbors(self, y, x):
        """Count the number of live neighbors for a cell at (y, x)."""
        neighbors = 0
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                if dy == 0 and dx == 0:
                    continue  # Skip the cell itself
                ny = y + dy
                nx = x + dx
                if (ny, nx) in self.live_cells:
                    neighbors += 1
        return neighbors

# Initialize the game state
game_state = GameState()

def getDataFromJs(data):
    """Handle data from JavaScript (user-drawn cells or reset)."""
    data = window.JSON.parse(data)
    if data["action"] == "draw":
        y = data["y"]
        x = data["x"]
        if data["draw"]:
            game_state.live_cells.add((y, x))  # Mark the cell as alive
        else:
            game_state.live_cells.discard((y, x))  # Mark the cell as dead
    elif data["action"] == "reset":
        return game_state.reset()

def sendDataToJs():
    """Send the next generation of the grid to JavaScript."""
    changes = game_state.update()
    return window.JSON.stringify({
        "coords_dead": [[y, x] for (y, x) in changes["coords_dead"]],
        "coords_alive": [[y, x] for (y, x) in changes["coords_alive"]],
        "generation": changes["generation"],
        "highscore": changes["highscore"]
    })

# Expose Python functions to JavaScript
window.getDataFromPython = sendDataToJs
window.sendDataToPython = getDataFromJs