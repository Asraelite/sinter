SINTER.World = class World {
	constructor(game) {
		this.game = game;

		this.physics = new SINTER.Physics(this);

		this.chunks = new Map();
		this._entities = new Set();
		this._particles = new Set();
	}

	tick() {
		this.physics.tick();
		this.particles.forEach(p => p.tick());
	}

	getTilePos(worldPos) {
		let consts = this.game.consts;
		let x = worldPos.x;
		let y = worldPos.y;

		let wx = Math.floor(x / consts.TILE_SIZE);
		let wy = Math.floor(y / consts.TILE_SIZE);
		let cx = Math.floor(wx / consts.CHUNK_SIZE);
		let cy = Math.floor(wy / consts.CHUNK_SIZE);
		let tx = wx - consts.CHUNK_SIZE * cx;
		let ty = wy - consts.CHUNK_SIZE * cy;

		return {
			tile: { x: wx, y: wy },
			chunk: { x: cx, y: cy },
			chunkTile: { x: tx, y : ty }
		};
	}

	getTile(worldPos) {
		let pos = this.getTilePos(worldPos);
	 	return this.getChunk(pos.chunk).getTile(pos.chunkTile);
	}

	generate(source) {
		let consts = this.game.consts;
		let tileSize = consts.TILE_SIZE;
		let chunkSize = consts.CHUNK_SIZE * tileSize;
		let buffer = consts.WORLD_BUFFER_SIZE * chunkSize;
		let startx = source.x - buffer;
		let starty = source.y - buffer;

		for (let x = startx; x < startx + buffer * 2; x += chunkSize) {
			for (let y = starty; y < starty + buffer * 2; y += chunkSize) {
				let cpos = this.getTilePos({ x: x, y: y }).chunk;
				this.generateChunk(cpos, {});
			}
		}
	}

	generateChunk(pos, params) {
		let chunkSize = this.game.consts.CHUNK_SIZE;
		let chunk = new SINTER.WorldChunk(pos, chunkSize);

		let plats = [];

		for (let i = 0; i < Math.random() * 100; i++) {
			let plat = [];
			plat.push(Math.random() * chunkSize);
			plat.push(Math.random() * chunkSize);
			plat.push(Math.random() * chunkSize / 2);
			plat.push(Math.random() * chunkSize / 6);
			plat[0] -= plat[2] / 2;
			plat[1] -= plat[3] / 2;
			plat[2] += plat[0];
			plat[3] += plat[1];
			plats.push(plat);
		}

		chunk.tiles = chunk.tiles.map((col, tx) => col.map((tile, ty) => {
			let x = chunk.pos.x * chunkSize + tx;
			let y = chunk.pos.y * chunkSize + ty;

			if (plats.some(p => {
				return tx > p[0] && tx < p[2] && ty > p[1] && ty < p[3];
			})) return 1;
			return 0;
		}));

		this.chunks.set(chunk.posKey, chunk);
	}

	getChunk(pos) {
		let key = pos.x + '.' + pos.y;
		if (!this.chunks.has(key)) this.generateChunk(pos, {});
		return this.chunks.get(key);
	}

	updateActiveChunks() {

	}

	createEntity(params) {
		let type = 'cube';
		let body = {};
		let entity = new SINTER.Entity(this, type, body);
		this._entities.add(entity);
		return entity;
	}

	createParticle(params) {
		let particle = new SINTER.Particle(this, params.pos, params.size);
		this._particles.add(particle);
		return particle;
	}

	clearEntities() {
		for (e of this.entities) e.destruct();
	}

	get entities() {
		return Array.from(this._entities);
	}

	get particles() {
		return Array.from(this._particles);
	}
}

SINTER.WorldChunk = class Chunk {
	constructor(pos, size) {
		this.pos = pos;
		this.posKey = pos.x + '.' + pos.y;
		this.size = size;
		this.changed = true;
		this.active = true;
		this.imageCached = false;
		this._empty = true;
		this._tiles = Array(size).fill(Array(size).fill(0));
	}

	getTile(pos) {
		return this._tiles[pos.x][pos.y];
	}

	updateAttributes() {
		this._empty = this.tiles.every(a => a.every(t => t == 0));
		this.changed = false;
		this.imageCached = false;
	}

	get empty() {
		if (this.changed) this.updateAttributes();
		return this._empty;
	}

	get worldPos() {
		let size = SINTER.game.consts.TILE_SIZE * this.size;
		return {
			x: this.pos.x * size,
			y: this.pos.y * size
		};
	}

	get tiles() {
		return this._tiles
	}

	set tiles(value) {
		this._tiles = value;
		this.changed = true;
	}
}
