SINTER.Physics = class Physics {
	constructor(world) {
		this.world = world;
		this.gravity = SINTER.consts.physics.GRAVITY;
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
		this.createVertices([[0, 0, size, size]]);
		this.width = size;
		this.height = size;
	}

	action(action) {
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

		if (!this.state.grounded) {
			this.vel.y += this.world.physics.gravity;
		}
	}

	move() {
		let tileSize = SINTER.consts.TILE_SIZE;
		let xiter = Math.ceil(Math.abs(this.vel.x) / tileSize);
		let yiter = Math.ceil(Math.abs(this.vel.y) / tileSize);
		let nx = this.pos.x;
		let ny = this.pos.y;

		for (let i = 0; i < xiter; i++) {
			this.pos.x += this.vel.x / xiter;
			let col = this.getCollisions(this.vertices[0]);
			this.pos.x += col;
			if (col != 0) this.vel.x = 0;
		}

		this.state.grounded = false;

		for (let i = 0; i < yiter; i++) {
			this.pos.y += this.vel.y / yiter;
			let col = this.getCollisions(this.vertices[1]);
			this.pos.y += col;
			if (col != 0) {
				this.vel.y = 0;
				this.state.grounded = true;
			}
		}
	}

	getCollisions(vertices) {
		for (let vertex of vertices) {
			let pos = {
				x: this.pos.x + vertex[0],
				y: this.pos.y + vertex[1]
			}
			if (this.world.getTile(pos) != 0) return vertex[2];
		}
		return 0;
	}

	// Vertices are stored in an array in the form
	// [posx, posy, [normalx, normaly]]
	createVertices(rects) {
		let tileSize = SINTER.consts.TILE_SIZE;
		let xVertices = [];
		let yVertices = [];

		for (let rect of rects) {
			let xiter = Math.ceil(Math.abs(rect[2]) / tileSize);
			let yiter = Math.ceil(Math.abs(rect[3]) / tileSize);
			let xinc = rect[2] / xiter;
			let yinc = rect[3] / yiter;

			for (let i = 0; i <= xiter; i++) {
				yVertices.push([rect[0] + xinc * i, rect[1], 1]);
				yVertices.push([rect[0] + xinc * i, rect[1] + rect[3], -1]);
			}
			for (let i = 0; i <= yiter; i++) {
				xVertices.push([rect[0], rect[1] + yinc * i, 1]);
				xVertices.push([rect[0] + rect[2], rect[1] + yinc * i, -1]);
			}
		}

		this.vertices = [xVertices, yVertices];
	}
}
