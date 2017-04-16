SINTER.Gameplay = class Gameplay {
	constructor(game) {
		this.game = game;
		this.world = game.world;

		this.controllers = new Set();
	}

	tick() {
		for (let c of Array.from(this.controllers)) c.tick();
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
