//--- The gameTimer object
var gameTimer =
{
  time: 0,
  interval: undefined,

  start: function()
  {
	var self = this;
	  this.interval = setInterval(function(){self.tick();}, 1000);
  },
  tick: function()
  {
	this.time--;
  },
  stop: function()
  {
	clearInterval(this.interval);
  },
  reset: function()
  {
	this.time = 0;
  }
};

//--- The monster object
var monster =
{
  //The size of each frame on the tile sheet and the tile sheet's number of columns
  IMAGE: "monsterTileSheet.png",
  SIZE: 128,
  COLUMNS: 3,
  
  //The numbers of the animation frames and the starting frame
  numberOfFrames: 5,
  currentFrame: 0,
  
  //Properties of the animation frames's x and y positions on the tile sheet. They're 0 when this object first loads
  sourceX: 0,
  sourceY: 0,
  
  //A property to control the loop  
  forward: true,
  
  //States
  HIDING: 0,
  JUMPING: 1,
  HIT: 2,
  state: this.HIDING,
  
  //Properties needed to help reset the animation
  timeToReset: 9,
  resetCounter: 0,
  
  //A property to store the random time
  waitTime: undefined,
  
  //A method to find a random animation time
  findWaitTime: function()
  {
	this.waitTime = Math.ceil(Math.random() * 60);  
  },
  
  //The monster's updateAnimation method
  updateAnimation: function()
  {  
	this.sourceX 
	  = Math.floor(this.currentFrame % this.COLUMNS) * this.SIZE;
	this.sourceY 
	  = Math.floor(this.currentFrame / this.COLUMNS) * this.SIZE;
		 
	//Figure out the monster's state
	if(this.state !== this.HIT)
	{
	  if(this.waitTime > 0  || this.waitTime === undefined)
	  {
		this.state = this.HIDING;
	  }
	  else
	  {
		this.state = this.JUMPING;
	  }
	}
	
	//Change the behaviour of the animation based on the state
	switch(this.state)
	{
	  case this.HIDING:
		this.currentFrame = 0;
		this.waitTime--;
		break;
		
	  case this.JUMPING:
		//If the last frame has been reached, set forward to false
		  if(this.currentFrame === this.numberOfFrames)
		{
		  this.forward = false;
		}

		//If the first frame has been reached, set forward to true
		if(this.currentFrame === 0 && this.forward === false)
		{
		  //Set forward to true, find a new waitTime, set the state to HIDING and break the switch statement
		  this.forward = true;
		  this.findWaitTime();
		  this.state = this.HIDING;
		  break;
		}

		//Add 1 to currentFrame if forward is true, subtract 1 if it's false
		  if(this.forward)
		{
		  this.currentFrame++;
		}
		else
		{
		  this.currentFrame--;
		}
		break;
		
	  case this.HIT:
			//Set the current frame to the last one on the tilesheet to display the explosion image
		this.currentFrame = 6;
		
		//Update the resetCounter by 1
			this.resetCounter++;
			
			//Reset the animation if the resetCounter equals the timeToReset
			if(this.resetCounter === this.timeToReset)
			{
			  this.state = this.HIDING;
		  this.forward = true;
		  this.currentFrame = 0;
		  this.resetCounter = 0;
		  this.findWaitTime();
			}
		break;
	}
  }
};

//--- The main program

//Load the animation tile sheet
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "images/" + monster.IMAGE;

//The number of rows and columns and the size of each cell
var ROWS = 3;
var COLUMNS = 4;
var SIZE = monster.SIZE;
var SPACE = 10;

//Arrays for the monsters, their canvases and their drawing surfaces
var monsterObjects = [];
var monsterCanvases = [];
var monsterDrawingSurfaces = [];

//Game variables
var monstersHit = 0;

//Get a referene to the output
var output = document.querySelector("#output");

function loadHandler()
{ 
  //Plot the grid of monsters
  buildMap();
  
  //Start the game timer
  gameTimer.time = 30;
  gameTimer.start();
  
  //Start the animation loop
  updateAnimation();
}

function buildMap()
{
  for(var row = 0; row < ROWS; row++) 
  {	
	for(var column = 0; column < COLUMNS; column++) 
	{ 
	  
	  //Create a single new monster object, give it a random time, display its first frame and push it into an array
	  var newMonsterObject = Object.create(monster);
	  newMonsterObject.findWaitTime();
	  monsterObjects.push(newMonsterObject);
	  
	  //Create a canvas tag for each monster and add it to the <div id="stage"> tag, position it, add a mousedown listener and push it into an array
	  var canvas = document.createElement("canvas");
	  canvas.setAttribute("width", SIZE);
	  canvas.setAttribute("height", SIZE);
	  stage.appendChild(canvas);
	  canvas.style.top = row * (SIZE + SPACE) + "px";
	  canvas.style.left = column * (SIZE + SPACE) + "px";
	  canvas.addEventListener("mousedown", mousedownHandler, false);
	  
	  // touch functionality? ----------------------------------------------------------------------------------------------------------------------------------------------------
	  canvas.addEventListener("touchstart", mousedownHandler, false);
	  
	  monsterCanvases.push(canvas);
	  
	  //Create a drawing surface and push it into the drawingSurfaces array
	  var drawingSurface = canvas.getContext("2d");
	  monsterDrawingSurfaces.push(drawingSurface);
	}
  }
}

function updateAnimation()
{ 
  //Call updateAnimation every 120 milliseconds while the timer is greater than zero.
  if(gameTimer.time > 0)
  {
	setTimeout(updateAnimation, 120);
  }
  
  //Loop through all the monsters in the monsters array and call their updateAnimation methods
  for(var i = 0; i < monsterObjects.length; i++)
  {
	monsterObjects[i].updateAnimation();
  }
  
  //check for the end of the game
  if(gameTimer.time === 0)
  {
	endGame();
  }
  
  //Render the animation
  render();
}

function endGame()
{
  //Stop the gameTimer
  gameTimer.stop();
  
  //Remove the mousedown and touchstart event listeners from the canvas tags so that they can't be clicked
  for(var i = 0; i < monsterCanvases.length; i++)
  {
	var canvas = monsterCanvases[i];
	canvas.removeEventListener("mousedown", mousedownHandler, false);
	canvas.removeEventListener("touchstart", mousedownHandler, false);
  }
}
function mousedownHandler(event)
{
  //Find out which canvas was clicked
  var theCanvasThatWasClicked = event.target;
  
  //Search the monsterCanvases array for a canvas that matches the one that's been clicked
  for(var i = 0; i < monsterCanvases.length; i++)
  {
	if(monsterCanvases[i] === theCanvasThatWasClicked)
	{
	  var monster = monsterObjects[i]
	  if(monster.state === monster.JUMPING)
	  {
		monster.state = monster.HIT;
		monstersHit++;      
	  }
	}
  }
}

function render()
{
  for(var i = 0; i < monsterObjects.length; i++)
  { 
	//Get reference to the current monster and drawing surface
	var monster = monsterObjects[i];
	var drawingSurface = monsterDrawingSurfaces[i];
	   
	//Clear the current monster's canvas
	drawingSurface.clearRect(0, 0, SIZE, SIZE);
	
	//Draw the monster's current animation frame 
	drawingSurface.drawImage
	(
	  image, 
	  monster.sourceX, monster.sourceY, SIZE, SIZE, 
	  0, 0, SIZE, SIZE
	);
  }
  
  //Display the output
  output.innerHTML 
	= "Monsters smashed: " + monstersHit 
	+ "<br>Time left: " + gameTimer.time;
}