window.addEventListener('load', _ => {
	SINTER.game = new SINTER.Game();
	SINTER.game.init();
});

window.SINTER = {};

SINTER.Game = class Game {
	constructor() {
		this.state = {
			state: 'initialising',
			get ingame() {
				return state == 'playing' || state == 'paused';
			}
		};

		this.consts = SINTER.consts;

		this.graphics = new SINTER.Graphics(this);
		this.world = new SINTER.World(this);
		this.gameplay = new SINTER.Gameplay(this);
		this.input = new SINTER.Input();
	}

	init() {
		this.world.generate({ x: 0, y: 0 });
		this.gameplay.startAdventure();

		this.tick();
	}

	tick() {
		this.gameplay.tick();
		this.world.tick();
		this.graphics.render();

		requestAnimationFrame(this.tick.bind(this));
	}
};
