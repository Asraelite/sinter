SINTER.Gameplay = class Gameplay {
	constructor(game) {
		this.game = game;
		this.world = game.world;

		this.controllers = new Set();
	}

	tick() {
		let focus = this.game.graphics.focus;

		for (let c of Array.from(this.controllers)) c.tick();

		let count = focus.pos.y / 30000;

		for (let i = 0; i < count; i++) {
			let pos = {
				x: focus.pos.x + (Math.random() - 0.5) * 2000,
				y: focus.pos.y + (Math.random() - 0.5) * 2000
			};
			let size = 0.5 + (focus.pos.y / 3000);

			this.world.createParticle({ pos: pos, size: size });
		}
	}

	startAdventure() {
		this.world.clearEntities();

		let player = this.world.createEntity();
		this.createController(player, 'player');
		this.game.graphics.focus = player;
	}

	createController(entity, type) {
		let controller = new SINTER.EntityController(this.game, entity, type);
		this.controllers.add(controller);
	}
}
