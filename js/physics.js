SINTER.Physics = class Physics {
	constructor(world) {
		this.world = world;
	}

	tick() {
		this.world.entities.forEach(e => e.body.tick());
	}
}

SINTER.PhysicsBody = class PhysicsBody {
	constructor(world, body) {
		this.world = world;

		this.state = {
			grounded: false
		};

		this.pos = { x: 0, y: 0 };
		this.vel = { x: 0, y: 0 };

		let size = body.size || SINTER.consts.TILE_SIZE;
		this.rects = [[0, 0, size, size]];
		this.width = size;
		this.height = size;
	}

	move(action) {
		if (action == 'right') {
			this.vel.x += 0.3;
		}
		if (action == 'left') {
			this.vel.x -= 0.3;
		}
		if (action == 'jump' && this.state.grounded) {
			this.vel.y = -10;
		}
	}

	tick() {
		this.move();

		this.vel.x *= SINTER.consts.physics.AIR_RESISTANCE_X;
		this.vel.y *= SINTER.consts.physics.AIR_RESISTANCE_Y;

		let tile = this.world.getTile({ x: this.pos.x, y: this.pos.y });

		if (tile == 0) {
			this.vel.y += 0.5;
			this.state.grounded = false;
		} else {
			this.vel.y = 0;
			this.state.grounded = true;
		}
	}

	move() {
		let tileSize = SINTER.consts.TILE_SIZE;
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
	}
}
