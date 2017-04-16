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
			this.vel.y = -7;
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

	move(q) {
		let tileSize = SINTER.consts.TILE_SIZE;

		let cof = (val, ceil) => {
			if (ceil) return (Math.ceil(val / tileSize) - 1) * tileSize;
			return Math.floor(val / tileSize) * tileSize;
		}

		this.state.grounded = false;

		this.vertices.forEach(r => r.forEach((v, i) => v.forEach((c, j) => {
			let vertex = c;
			let iter = 1;

			if (i == 0) iter = Math.ceil(Math.abs(this.vel.x) / tileSize);
			if (i == 2) iter = Math.ceil(Math.abs(this.vel.y) / tileSize);

			for (let k = 0; k < iter; k++) {
				let x = this.pos.x + vertex[0];
				let y = this.pos.y + vertex[1];

				if (i == 0) this.pos.x += this.vel.x / iter;
				if (i == 2) this.pos.y += this.vel.y / iter;

				let tx = cof(x, (j > 0 || i < 2) && i != 0);
				let ty = cof(y, (j > 0 || i > 1) && i != 2);

				let tile = this.world.getTile({ x: tx, y : ty });

				if (tile == 0) return;
				if (q) console.log(i, tx, ty);

				if (i < 2) {
					this.vel.x = 0;
					this.pos.x = cof(x, i == 0);
					this.pos.x = this.pos.x - vertex[0] + (i == 0 ? tileSize : 0);
				}
				if (i > 1) {
					this.vel.y = 0;
					this.state.grounded = true;
					this.pos.y = cof(y, i == 2) - vertex[1] + (i == 2 ? tileSize : 0);
				}

				if (q) console.info(this.pos.x, this.pos.y, vertex);
			}
		})));

		if (this.pos.y > 64) {
			this.pos.y = 64;
			this.vel.y = 0;
		}

		/*
		for (let i = 0; i < xiter; i++) {
			this.pos.x += this.vel.x / xiter;
			let col = this.getCollisions(0);
			if (col !== false) {
				this.vel.x = 0;
				this.pos.x = col;
			}
		}

		this.state.grounded = false;

		for (let i = 0; i < yiter; i++) {
			this.pos.y += this.vel.y / yiter;
			let col = this.getCollisions(1);
			if (col !== false) {
				this.pos.y = col;
				this.vel.y = 0;
				this.state.grounded = true;
			}
		}
		*/
	}

	/*
	getCollisions(axis) {
		let tileSize = SINTER.consts.TILE_SIZE;
		for (let vertex of this.vertices[axis]) {
			let pos = {
				x: this.pos.x + vertex[0],
				y: this.pos.y + vertex[1]
			}

			pos.x = (Math.floor(pos.x / tileSize)) * tileSize;
			if (vertex[2][0] == -1)
				pos.x = (Math.ceil(pos.x / tileSize) - 1) * tileSize;
			pos.y = (Math.floor(pos.y / tileSize)) * tileSize;
			if (vertex[2][1] == -1)
				pos.y = (Math.ceil(pos.y / tileSize) - 1) * tileSize;

			if (this.world.getTile(pos) == 0) continue;

			pos = (axis ? this.pos.y : this.pos.x);
			let target = Math.floor((pos + vertex[axis]) / tileSize);
			if (vertex[2][axis] == 1)
				target = Math.ceil((pos + vertex[axis]) / tileSize);
			target = target * tileSize - vertex[axis];
			return target;
		}
		return false;
	}
	*/

	test() {
		console.group('Collision test');
		[[79, 64, 0], [177, 64, 0], [100, 65, 1]].forEach(a => {
			console.groupCollapsed(`Position ${a[0]}, ${a[1]}`);
			this.pos = { x: a[0], y: a[1] };
			this.move(true);
			console.log(`%c${this.pos.x}, ${this.pos.y}`, 'font-weight: bold');
			console.groupEnd();
		});
		console.groupEnd('Collision test');
	}

	createVertices(rects) {
		let tileSize = SINTER.consts.TILE_SIZE;
		let xVertices = [];
		let yVertices = [];

		this.vertices = [];

		for (let rect of rects) {
			let xi = Math.ceil(Math.abs(rect[2]) / tileSize);
			let yi = Math.ceil(Math.abs(rect[3]) / tileSize);
			let xinc = rect[2] / xi;
			let yinc = rect[3] / yi;
			let x = rect[0];
			let y = rect[1];
			let lx = x + rect[2];
			let ly = y + rect[3];
			let vertices = [[], [], [], []];

			for (let i = 0; i <= yi; i++) vertices[0].push([x, y + yinc * i]);
			for (let i = 0; i <= yi; i++) vertices[1].push([lx, y + yinc * i]);
			for (let i = 0; i <= xi; i++) vertices[2].push([x + xinc * i, y]);
			for (let i = 0; i <= xi; i++) vertices[3].push([x + xinc * i, ly]);

			this.vertices.push(vertices);
		}
	}
}
