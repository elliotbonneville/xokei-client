/// requires
// var Player = require("./players");

/// object
function Puck(settings, board) {
	/// public variables	
	this.board = board;
	
	// the horizontal position of this Puck
	this.x = settings.x;
	
	// the vertical position of this Puck
	this.y = settings.y;
}

Puck.prototype = {
	kick: function (tile) {
		// kick to another tile
		this.x = tile.x;
		this.y = tile.y;
	},
	
	// calculate the directions this puck can be kicked in, based on the actors
	// surrounding it, and the player that is passed in
	kickDirections: function (player) {
		var directions = [],
			neighborhood,
			self = this,
			puckTile = this.board.tile(this.x, this.y);
		
		neighborhood = puckTile.neighborhood();
		
		neighborhood.forEach(function(actorTile) {
			var actorAngle,
				dx,
				dy,
				oppositeTile;
			
			if (!actorTile.actor || actorTile.actor.owner !== player) {
				return;
			}
			
			// find relative position of the actor on this tile
			dx = actorTile.x - self.x;
			dy = actorTile.y - self.y;
			
			// find tile on the other side of the ball based on the actor's 
			// position
			oppositeTile = self.board.tile(self.x - dx, self.y - dy);
			
			// find the relative angle of the player to the puck (atan2's
			// arguments are passed in backwards, counterintuitively)
			actorAngle = Math.atan2(dy, dx);
			
			// iterate through the neighbors of the puck and find their 
			// relative positions to the puck, then compare the atan2 of
			// that relative position to the atan2 of the relative position
			// of the player; if the absolute of resulting value is greater or 
			// equal to 1.57 degrees radian, we know that that direction is not
			// "backwards" for the current actor and we will add it to the
			// list of directions; otherwise, we can't add this tile
			neighborhood.forEach(function (tile) {
				var diffAngle,
					tileAngle = Math.atan2(tile.y - self.y, tile.x - self.x);
				
				diffAngle = Math.abs(actorAngle - tileAngle);
				
				if (diffAngle > Math.PI) {
					diffAngle = Math.PI * 2 - diffAngle;
				}
				
				if (// the direction is greater than 45º away from the player
					((diffAngle >= 1.57) ||
					
					// or the puck is against a wall and the player is facing
					// the wall
					((!oppositeTile || oppositeTile.type === "wall") &&
						dx * dy === 0) ||
					
					// or the puck is in a corner
					(neighborhood.length < 4)) &&
					
					// and the tile is not occupied or already in the list
					!tile.actor &&
					
					// and the tile is not already in the list
					directions.indexOf(tile) < 0 &&
					
					// and the path to the tile is not blocked
					puckTile.pathOpenTo(tile)) {
					
					// then we can add this direction to the list
					directions.push(tile);
				}
			});
		});

		return directions;
	},
	
	// return a list of tiles representing the path this puck would take if
	// kicked in the direction of the tile passed in
	calculateTrajectory: function (direction) {
		var crossedBorder = false,
			dx = direction.x - this.x,
			dy = direction.y - this.y,
			i = 0,
			lastTile = this.board.tile(this.x, this.y),
			tile,
			trajectory = [],
			x = this.x,
			y = this.y;
		
		while (i++ < 100) {
			if (tile) {
				lastTile = tile;
			}
			
			x += dx;
			y += dy;
			
			tile = this.board.tile(x, y);
			
			if (!tile || tile.type === "wall" || !lastTile.pathOpenTo(tile)) {
				// check if this is an orthagonal collision, in which case the
				// path of the puck needs to end here
				if (dx * dy === 0) {
					break;
				}
				
				// we know that this is a diagonal collision, so we need to 
				// reverse the direction and allow the puck to continue
				if (y === 8 || y === -1) {
					x -= dx;
					y -= dy;
					
					dy *= -1;
				}
				
				if (x <= 1 || x >= 13) {
					x -= dx;
					y -= dy;
					
					dx *= -1;
				}
				
				continue;
			}
			
			// check if the owner of this tile does not equal the owner of the 
			// original tile, which would indicate that the puck has crossed the
			// border at some point
			if (tile.owner !== lastTile.owner) {
				if (crossedBorder) {
					// if the tile has already crossed the border, then the next
					// tile represents a second crossing of the border, which we
					// won't allow
					break;
				} else {
					// however, if this is the first time crossing the border, 
					// then we let the puck continue on its way
					crossedBorder = true;
				}
			}
			
			// if the tile is occupied by an actor, end the loop
			if (tile.actor) {
				break;
			}

			if (tile && tile.type !== "wall") {
				trajectory.push(tile);
			}
			
			// if this tile is a goal, then break the loop
			if (tile.inZone("goal")) {
				break;
			}
		}
		
		return trajectory;
	}
};

/// exports
module.exports = Puck;