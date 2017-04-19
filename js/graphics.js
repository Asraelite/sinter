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
		let focus = this.focus.center;

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let v = Math.max(5, Math.min(this.focus.pos.y / 100, 240)) | 0;
		this.context.fillStyle = `rgb(${260 - v}, ${255 - v}, ${255 - v})`;
		if (focus.y > 100000) this.context.fillStyle = '#000';
		if (focus.y > 200500) {
			let r = Math.min(((focus.y - 200000) / 100) | 0, 255);
			let gb = Math.max(r - 5, 0);
			this.context.fillStyle = `rgb(${r}, ${gb}, ${gb})`;
		}
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.save();

		if (focus.y > 5000 && focus.y < 100000) {
			let shake = (focus.y - 5000) / 10000;
			let shakeX = (Math.random() - 0.5) * shake;
			let shakeY = (Math.random() - 0.5) * shake;
			this.context.translate(shakeX, shakeY);
		}

		this.context.save();

		let tx = -focus.x + this.canvas.width / 2;
		let ty = -focus.y + this.canvas.height / 2;
		this.context.translate(tx, ty);

		this.renderTerrain();

		for (let e of world.entities) this.renderEntity(e);
		for (let e of world.particles) this.renderParticle(e);

		this.context.restore();

		if (this.game.gameplay.showScore) {
			let str = 'Score: ' + this.game.gameplay.score;
			this.context.font = '12pt Arial';
			this.context.textBaseline = 'top';
			this.context.fillStyle = 'rgba(0, 0, 0, 0.1)';
			this.context.fillText(str, 12, 12);
			this.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
			this.context.fillText(str, 10, 10);
		}

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
				if (!this.chunkCache.has(chunk.posKey) || !chunk.imageCached)
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

		let tileMap = [];
		let wpos = chunk.worldPos;

		for (let x = 0; x < chunkSize + 2; x++) {
			tileMap[x] = [];
			for (let y = 0; y < chunkSize + 2; y++) {
				tileMap[x].push(this.game.world.getTile({
					x: wpos.x + (x - 1) * tileSize,
					y: wpos.y + (y - 1) * tileSize
				}));
			}
		}

		context.fillStyle = 'rgba(0, 0, 0, 0.05)';
		for (let x = 0; x < chunkSize + 2; x++) {
			for (let y = 0; y < chunkSize + 2; y++) {
				let tile = tileMap[x][y];
				if (!tile) continue;
				let rx = (x - 1) * tileSize;
				let ry = (y - 1) * tileSize;
				context.fillRect(rx + 5, ry + 5, tileSize, tileSize);
			}
		}

		for (let x = 1; x <= chunkSize; x++) {
			for (let y = 1; y <= chunkSize; y++) {
				let neighbours = [[-1, 0], [1, 0], [0, 1], [0, -1],
					[-1, -1], [1, 1], [-1, 1], [1, -1]].map(t => {
					return tileMap[x + t[0]] ? tileMap[x + t[0]][y + t[1]] : 0;
				});
				let tile = tileMap[x][y];
				if (!tile) continue;
				context.fillStyle = '#aaa';
				if (neighbours.some(t => !t) && tile)
					context.fillStyle = '#888';
				if (tile == 2) context.fillStyle = '#fff';
				let rx = (x - 1) * tileSize;
				let ry = (y - 1) * tileSize;
				context.fillRect(rx, ry, tileSize, tileSize);
			}
		}

		let img = new Image();
		img.src = this.tempCanvas.toDataURL();
		chunk.imageCached = true;
		this.chunkCache.set(chunk.posKey, img);
	}

	renderEntity(entity) {
		let body = entity.body;
		this.context.fillStyle = '#46b';
		let pos = entity.pos;
		this.context.fillRect(Math.round(pos.x), Math.round(pos.y), body.width, body.height);
	}

	renderParticle(particle) {
		let pos = particle.pos;
		let size = particle.size;
		this.context.beginPath();
		this.context.arc(pos.x, pos.y, size, 0, Math.PI * 2, true);
		this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
		this.context.fill();
		this.context.closePath();
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.style.width = this.canvas.width + 'px';
		this.canvas.style.height = this.canvas.height + 'px';
	}
}
