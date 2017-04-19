SINTER.Gameplay = class Gameplay {
	constructor(game) {
		this.game = game;
		this.world = game.world;
		this.score = 0;
		this.shake = 0;
		this.showScore = true;

		this.controllers = new Set();
	}

	tick() {
		let focus = this.game.graphics.focus.pos;
		let body = this.game.graphics.focus.body;

		for (let c of Array.from(this.controllers)) c.tick();

		if (focus.y > 1000 && focus.y < 100000) {
			let count = focus.y / 30000;
			count = Math.min(count, 20);

			for (let i = 0; i < count; i++) {
				let pos = {
					x: focus.x + (Math.random() - 0.5) * 2000,
					y: focus.y + (Math.random() - 0.5) * 2000
				};
				let size = 0.5 + (focus.y / 3000);

				this.world.createParticle({ pos: pos, size: size });
			}
		}

		if (focus.y > 30000 && focus.y < 100000) {
			let prob = Math.min(0.02, (focus.y - 30000) / 3000000);
			if (Math.random() < prob) {
				let shove = Math.max(20, (focus.y - 30000) / 1000);
				body.vel.x += (Math.random() - 0.5) * shove;
				body.vel.y += (Math.random() - 0.5) * shove;
			}
		}

		this.score = Math.max(this.score, ((-focus.y / 48) | 0));
	}

	startAdventure() {
		this.world.clearEntities();

		let player = this.world.createEntity();
		this.createController(player, 'player');
		this.game.graphics.focus = player;
		for (let i = 0; i < 10; i++) {
			let ai = this.world.createEntity();
			this.createController(ai, 'ai');
		}
	}

	createController(entity, type) {
		let controller = new SINTER.EntityController(this.game, entity, type);
		this.controllers.add(controller);
	}
}
