# Matter.js

## 2D Physics Engine

Matter.js is an open source 2D physics engine written in JavaScript:

Website: https://brm.io/matter-js/

Github repository: https://github.com/liabru/matter-js

You can enable and use Matter.js in your microStudio project, whichever language
you picked: microScript, JavaScript, Python, Lua.

## Basics

### Enable Matter.js

After creating your project, open the settings tab and click "Show advanced options".
Check "Matter.js" to enable the library for your project. The Matter.js API will be exposed
to your code as a global variable `Matter`.

### Initializing the engine

You can create a Matter engine with this line:
```
engine = Matter.Engine.create()
```
To get the engine's default gravity to be downwards, set
```
engine.world.gravity.y = -1
```

### Adding shapes

The API sometimes requires you to pass JavaScript objects as arguments, for example
`{ isStatic: true }`. From microScript, you will pass the equivalent microScript object: `object isStatic = true end`.
This is how you can add a fixed ground object to your Matter world:

```
ground = Matter.Bodies.rectangle(0,-50,200,10,object isStatic=true end)
Matter.Composite.add(engine.world,ground)
```

You can then add a moving box as follows:

```
box = Matter.Bodies.rectangle(0,50,20,20)
Matter.Composite.add(engine.world,box)
```

### Running the simulation

In the body of your function `update()`, simply call `Matter.Engine.update`:

```
update = function()
  Matter.Engine.update(engine,1000/60)
end
```

### Drawing your shapes

In the course of your function `draw()`, you can draw all the shapes you have added to the world.
Here is an example:

```
draw = function()
  screen.clear()
  screen.drawRect(ground.position.x,ground.position.y,200,10,"rgb(255,0,0)")
  screen.setDrawRotation(box.angle/PI*180)
  screen.drawRect(box.position.x,box.position.y,20,20,"#FF0")
  screen.setDrawRotation(0)
end
```

## Bodies
The Matter.Bodies module contains factory methods for creating rigid body models with commonly used body configurations (such as rectangles, circles and other polygons).

### Creating a circle body
##### Matter.Bodies.circle(x, y, radius, [options])
This methods creates a new rigidbody with circle as its shape, centered around the `x` and `y` coordinates.
The `radius` parameter determine how big the circle is
and `[options]` is a javascript object which can contain angle, angularSpeed, isStatic, and many more

Example:
```
baloon = Matter.Bodies.circle(0, 0, 5, object isStatic = true end)
```

### Creating a rectangle body
##### Matter.Bodies.rectangle(x, y, width, height, [options])
This methods creates a new rigidbody with rectangle as its shape, centered around the `x` and `y` coordinates.
The `width` and `height` parameters determine how wide or tall the rectangle is

Example:
```
ground = Matter.Bodies.rectangle(0, -90, 200, 10, object isStatic=true end)
```

### Creating a regular polygon body
##### Matter.Bodies.polygon(x, y, sides, radius, [options])
This methods creates a new rigidbody with any regular polygon with the given number of sides as its shape, centered around the `x` and `y` coordinates.
The `radius` also determine how big the polygon is going to be

Example:
```
spike = Matter.Bodies.polygon(0, 0, 3, 5)
```
This will create an equilateral triangle (a 3-sided regular polygon) body with the radius of 5

## Documentation

### Official documentation

Reference: https://brm.io/matter-js/docs/

Wiki: https://github.com/liabru/matter-js/wiki

### Example projects

https://microstudio.dev/i/gilles/matterjstest/
