### GAME NAME ###
DoodleFinn

### GAME DESIGN ###
https://doodlefinn-9e0c7.firebaseapp.com/benchmark1/

### CORE GAMEPLAY ###
https://doodlefinn-9e0c7.firebaseapp.com/benchmark2/

### HOW TO MAKE A LEVEL ###
1. Create Tileset(256x256px), and create level.
2. Platform layer should have a property "Collidable" set to true.
3. Layers should be named accordingly. 
- "Platforms" for platforms
- "Background" for background
- "Collectables" for collectables(papers)
- "Animated" for tiles that can trigger the end of the level.
- "Foreground" as a second visual layer on top of the background.
4. Embed the tilset into the tilemap.
5. Export as JSON as <filename>.json
6. Edit the file <filename>.json and replace the word "orientation:orthogonal" with "orientation:dynamic"
