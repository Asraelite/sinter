SINTER.Graphics = class Graphics {
	constructor(game) {
		this.game = game;
		this.canvas = document.getElementById('game-canvas');
		this.context = this.canvas.getContext('2d');
		this.tempCanvas = document.getElementById('temp-canvas');
		this.tempContext = this.tempCanvas.getContext('2d');

		window.addEventListener('resize', this.resizeCanvas.bind(this));
		this.resizeCanvas();

		this.chunkCache = new Map();

		this.focus = { center: { x: 0, y: 0 } };
	}

	render() {
		let consts = this.game.consts;
		let tileSize = consts.TILE_SIZE;
		let chunkSize = consts.CHUNK_SIZE;

		let world = this.game.world;
		let state = this.game.state;

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.save();

		let focus = this.focus.center;
		let tx = -focus.x + this.canvas.width / 2;
		let ty = -focus.y + this.canvas.height / 2;
		this.context.translate(tx, ty);

		this.renderTerrain();

		for (let e of world.entities) this.renderEntity(e);

		this.context.restore();
	}

	renderTerrain() {
		let world = this.game.world;
		let focus = this.focus.center;

		let topLeftPos = {
			x: focus.x - this.canvas.width / 2,
			y: focus.y - this.canvas.height / 2
		};
		let bottomRightPos = {
			x: focus.x + this.canvas.width / 2,
			y: focus.y + this.canvas.height / 2
		};

		let topLeftChunk = world.getTilePos(topLeftPos).chunk;
		let bottomRightChunk = world.getTilePos(bottomRightPos).chunk;

		for (let x = topLeftChunk.x; x <= bottomRightChunk.x; x++) {
			for (let y = topLeftChunk.y; y <= bottomRightChunk.y; y++) {
				let pos = { x: x, y: y };
				let chunk = world.getChunk(pos);
				if (!this.chunkCache.has(chunk.posKey))
					this.renderChunk(chunk, pos);
				let wpos = chunk.worldPos;
				let img = this.chunkCache.get(chunk.posKey);
				this.context.drawImage(img, wpos.x, wpos.y);
			}
		}
	}

	renderChunk(chunk, pos) {
		let tileSize = this.game.consts.TILE_SIZE;
		let chunkSize = this.game.consts.CHUNK_SIZE;
		let size = tileSize * chunkSize;
		let context = this.tempContext;
		this.tempCanvas.width = size;
		this.tempCanvas.height = size;
		context.clearRect(0, 0, this.tempCanvas.width, this.tempCanvas.height);

		for (let x = 0; x < size; x += tileSize) {
			for (let y = 0; y < size; y += tileSize) {
				let tile = chunk.getTile({ x: x / tileSize, y: y / tileSize });
				context.fillStyle = tile == 0 ? '#f8f8f8' : '#aaa';
				context.fillRect(x, y, tileSize, tileSize);
				context.fillStyle = '#000';
				context.font = '8px Arial';
			}
		}

		let img = new Image();
		img.src = this.tempCanvas.toDataURL();
		this.chunkCache.set(chunk.posKey, img);
	}

	renderEntity(entity) {
		let body = entity.body;
		this.context.fillStyle = '#46b';
		let pos = entity.pos;
		this.context.fillRect(pos.x, pos.y, body.width, body.height);
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.width = this.canvas.width + 'px';
		this.canvas.style.height = this.canvas.height + 'px';
	}
}
