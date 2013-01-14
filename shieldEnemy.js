
function ShieldEnemy(stage,id)
{
  Enemy.call(this,stage,id);

	this.life = 10;
	this.damage = 0;
	this.ammo = 0;
	this.ground = 0;
	this.oldDir = null;
}
ShieldEnemy.prototype = new Enemy;
ShieldEnemy.prototype.init = function(image)
{
		this.image = image;

		

		var sprite = new createjs.SpriteSheet({
			images: [this.image],
	  		frames: {width:55, height:49, regX:23, regY:24},
			animations: {
				run: [0,11,"run",4],
				idle: [28,28,"idle",4],
				takingupgun: [28,31,"shoot",4],
				shoot:[32,38,"shoot",4],
				protecting:[0,11,"protecting",4],
				stabbing:[12,29,"stabbing",4],
				dead:[38,48,"run",4]
			}
		});

	//	createjs.SpriteSheetUtils.addFlippedFrames(sprite,true,false,false);
        createjs.SpriteSheetUtils.addFlippedFrames(sprite, true, false, false);

		this.animation = new createjs.BitmapAnimation(sprite);

		this.animation.name= this.id;
		
		this.animation.regX = this.animation.spriteSheet.frameWidth / 2 | 0;
   		this.animation.regY = this.animation.spriteSheet.frameHeight / 2 | 0;

	  	this.animation.currentFrame = 0;
	  	this.animation.vY = 0;
		this.animation.vX = 0;
		this.animation.x = 40;
		this.animation.y = 30;
		this.ground = this.animation+15;

		//this.animation.gotoAndPlay("run_h"); 
		this.run();
		this.oldDir = this.way;
};
	/*
	* These functions are used by ai
	*/
ShieldEnemy.prototype.run = function(dir)
{
		this.animation.vX = 1.3;
		this.damage = 40;
		this.way = dir;
		this.mode = MODE.RUNNING;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("run");   
		}
		else
		{
			this.animation.gotoAndPlay("run_h");
		}
};
ShieldEnemy.prototype.freeze = function() 
{
	this.animation.vX = 0;
	this.animation.vY = 0;
}
ShieldEnemy.prototype.idle = function(dir)
{
		
		this.damage = 40;
		this.animation.vX = 0;
		this.mode= MODE.IDLE;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("idle");   
		}
		else
		{
			this.animation.gotoAndPlay("idle_h");
		}
};
ShieldEnemy.prototype.shoot = function(dir)
{
		this.damage = 40;
		this.animation.vX = 0.2;
		this.mode = MODE.SHOOTING;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("takingupgun");   
		}
		else
		{
			this.animation.gotoAndPlay("takingupgun_h");
		}
};
ShieldEnemy.prototype.stabb = function(dir)
{
		this.damage = 80;
		this.animation.vX = 0;
		this.mode = MODE.STABBING;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("stabbing");
		}
		else
		{
			this.animation.gotoAndPlay("stabbing_h");
		}
};
ShieldEnemy.prototype.protect =  function(dir)
{
		this.damage = 30;
		this.animation.vX = 1.3;
		this.mode = MODE.PROTECTING;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("protecting");
		}
		else
		{
			this.animation.gotoAndPlay("protecting_h");
		}
};
ShieldEnemy.prototype.die = function(dir)
{
		this.damage = 30;
		this.animation.vX = 1;
		this.mode = MODE.DEAD;
		if(dir == DIRECTION.RIGHT)
		{
			this.animation.gotoAndPlay("dead");
		}
		else
		{
			this.animation.gotoAndPlay("dead_h");
		}
};
ShieldEnemy.prototype.ai =  function(target)
{
			// om soldaten koliderar , 
			var offset = 25; 
			var distance = 0;
			var extension = "";
			var acceptangle = {min:0,max:0};

			this.animation.y-=offset;
			if(Collision.platform(this.animation,Map.platforms) == true)
			{
	//			console.log("Collision");
				this.animation.y-=1; // höj soldaten lite , om vi fortfarande är under marken, icke bra
				if(Collision.platform(this.animation,Map.platforms) == false)
				{
					// om vi hamnar här så ligger gubben i perfekt höjd och vi ändrar tillbaka höjden
					// hamnar vi inte här, så är vi väldigt långt ner.. detta körs i tick så vi kommer hella tiden höja med 4
					// tills vi hamnar där vi vill. 
	//				console.log("jumping back");
					this.animation.y+=1;
				}
			} 
			else
			{
	//			console.log("diving");
				this.animation.y+=4;
			}

			this.animation.y+=offset;

		
		// if soldier is on left side, turn left (if not already in that direction)
			if(parseInt(target.x) <= parseInt(this.animation.x))
			{
				distance = this.animation.x - target.x;
				this.way = DIRECTION.LEFT;
				acceptangle.min = -190;
				acceptangle.max = -140;
			}
			else
			{
				distance = target.x -this.animation.x;
				this.way = DIRECTION.RIGHT;
				acceptangle.min = 20;
				acceptangle.max = 40;

			}


			if(distance > 150 && this.mode != MODE.RUNNING )
			{
				this.run.call(this,this.way);
			}
			else if(distance > 100 && distance < 150 && this.mode != MODE.SHOOTING)
			{
				this.shoot.call(this,this.way);
			}
			else if(distance > 20 && distance < 100 && this.mode != MODE.PROTECTING)
			{
				this.protect.call(this,this.way);
			}
			else if(distance <= 20 && this.mode != MODE.STABBING)
			{

				this.stabb.call(this,this.way);
		
			}
			else if(this.mode == MODE.SHOOTING)
			{

				// reloading function
				this.ammo++;
				if(this.ammo == 150)
				{
					//console.log("moving to protect");
					this.shoot.call(this,this.way);	
					this.ammo = 0;
				}

			}
		if(target.y < (this.animation.y - 50) || target.y > (this.animation.y +50))
		{
			this.idle(this.way);
		}
		else
		{
			this.move();
		}

};
