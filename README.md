## Visit this website <a href="https://nvios.github.io/pixpad">here!</a>

This is a simple **pixel-art editor** that turns your artwork in a **LEGO© masterpiece**, and if that weren't enough, it also gives you the instructions to build it yourself. 

The full version of this editor is coming soon, on the <a href="https://pixpad.github.io/pixpad/gallery">**Pixpad**</a> website **stay tuned!**

## About:

This demo showcases some of the features available on the full version of the application. A tabular structure was used to create the pixel canvas in order to have more flexibility in setting the CSS styles for the preview in this serverless implementation.

#### Algorithms:

The **fill** function uses a four-directional **flood fill recursive algorithm** to check for neighbors with the same color and fill them with the desired target color if within the bounded space.

To overcome the issue of intermittent registration of the cursor location while in drawing mode a custom pathfinding algorithm was used. Since standard path finding algorithms are only focused on finding the shortest path between two points and being constrained by the non linearity of the grid path, I created a custom implementaiton based on **Dijkstra's algorithm**.

The draw function uses an **omni-directional recursion** to determine the best matrix representation of the shortest linear path between two points registered by the mouseover event listener when the cursor is moved across the canvas.

#### Integrations:

The other complexity introduced in this project is the integration of of a draw cursor of size higher than one pixel with the path finding algorithms and the undo/redo stacks. 

Different brush sizes are obtained by including a **neigbor fronteer** function within the drawing function. Since a naive computation of all neighbors to draw into was too expensive for live rendering, a **context-aware** solution was developed to add only newly visited pixels to the fronteer. 

The previous task prooved to be particularly challenging when the path finding function was added. At that stage, the custom fronteer (brush size) had to be applied to the new path as well and the array of pixels had to be stored in the undo/redo stacks to allow the user to discard the last actions. 


