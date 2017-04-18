SINTER.Physics = class Physics {
	constructor(world) {
		this.world = world;
		this.gravity = SINTER.consts.physics.GRAVITY;
		this.airResistance = {
			x: SINTER.consts.physics.AIR_RESISTANCE_X,
			y: SINTER.consts.physics.AIR_RESISTANCE_Y
		};
	}

	tick() {
		this.world.entities.forEach(e => e.body.tick());
	}
}

SINTER.PhysicsBody = class PhysicsBody {
	constructor(entity, world, body) {
		this.world = world;
		this.speed = entity.speed;
		this.jumpPower = entity.jumpPower;

		this.state = {
			grounded: false
		};

		this.pos = { x: 0, y: 0 };
		this.vel = { x: 0, y: 0 };
		this.acc = { x: 0, y: 0 };

		let size = body.size || SINTER.consts.TILE_SIZE;
		this.smallestSide = SINTER.consts.TILE_SIZE;
		this.createVertices([[0, 0, size, size]]);
		this.width = size;
		this.height = size;
	}

	action(action) {
		if (action == 'right') {
			this.vel.x += this.speed;
		}
		if (action == 'left') {
			this.vel.x -= this.speed;
		}
		if (action == 'jump' && this.state.grounded) {
			this.vel.y = -this.jumpPower;
		}
	}

	tick() {
		this.move();

		this.vel.x *= this.world.physics.airResistance.x;
		this.vel.y *= this.world.physics.airResistance.y;

		let tile = this.world.getTile({ x: this.pos.x, y: this.pos.y });

		if (!this.state.grounded) {
			this.vel.y += this.world.physics.gravity;
		} else {

		}
	}

	move(q, z) {
		let tileSize = SINTER.consts.TILE_SIZE;

		let cof = (val, ceil, add) => {
			if (ceil) return (Math.ceil(val / tileSize) - add) * tileSize;
			return Math.floor(val / tileSize) * tileSize;
		}

		this.state.grounded = false;

		this.vertices.forEach(r => {
			let interval = Math.min(this.smallestSide, tileSize);
			let iterX = Math.ceil(Math.abs(this.vel.x) / (interval / 2));
			let iterY = Math.ceil(Math.abs(this.vel.y) / (interval / 2));
			let iter = Math.max(iterX, iterY, 1);

			for (let k = 0; k < iter; k++) {
				r.forEach((v, i) => v.forEach((c, j) => {
					let vertex = c;

					if (i == 0 && j == 0) this.pos.x += (this.vel.x / iter);
					if (i == 2 && j == 0) this.pos.y += (this.vel.y / iter);

					let x = this.pos.x + vertex[0];
					let y = this.pos.y + vertex[1];

					let tx = cof(x, (j > 0 || i < 2) && i != 0, 1);
					let ty = cof(y, (j > 0 || i > 1) && i != 2, 1);

					let tile = this.world.getTile({ x: tx, y : ty });
					let debugInfo;

					if (tile == 0) return;
					if (q) debugInfo = this.pos.x + ', ' + this.pos.y;

					if (i < 2) {
						this.vel.x = 0;
						this.pos.x = cof(x, i == 0, 0);
						this.pos.x = this.pos.x - vertex[0];
					}
					if (i > 1) {
						this.vel.y = 0;
						if (i == 3) this.state.grounded = true;
						this.pos.y = cof(y, i == 2, 0);
						this.pos.y = this.pos.y - vertex[1];
					}

					if (q) {
						console.groupCollapsed(`Collision ${i} ` + debugInfo);
						let c = "font-weight: bold; color: #888;"
						console.log(`%ci%c: ${i}`, c, '');
						console.log(`%ck%c: ${k}`, c, '');
						console.log(`%ct%c: ${tx + ', ' + ty}`, c, '');
						console.log(`%cstart%c: ${debugInfo}`, c, '');
						console.log(`%cend%c: ${this.pos.x + ', ' + this.pos.y}`, c, '');
						console.groupEnd();
						debugger;
					}
				}));
			}
		});
	}

	test() {
		console.group('Collision test');
		/*
		[[40, -80, 0, -5], [40, -90], [-1, 0], [16, -81], [16, 1]].forEach(a => {
			console.groupCollapsed(`Position ${a[0]}, ${a[1]}`);
			if (a[2] != undefined) this.vel = { x: a[2], y: a[3] };
			this.pos = { x: a[0], y: a[1] };
			debugger;
			this.move(true);
			console.log(`%c${this.pos.x}, ${this.pos.y}`, 'font-weight: bold');
			console.groupEnd();
		});
		*/
		this.pos = { x: 500, y: 80 };
		this.vel.y = 20;
		this.move(true);
		console.log(`%c${this.pos.x}, ${this.pos.y}`, 'font-weight: bold');
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

			this.smallestSide = Math.min(this.smallestSide, rect[2], rect[3]);

			this.vertices.push(vertices);
		}
	}
}
