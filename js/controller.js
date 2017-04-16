SINTER.EntityController = class EntityController {
	constructor(game, entity, type) {
		this.game = game;
		this.world = game.world;
		this.input = game.input;
		this.entity = entity;
		this.tick = type == 'player' ? this.keyboardInput : _ => {};
	}

	keyboardInput() {
		let input = this.input;
		if (input.keyCode.held['KeyD'])
			this.entity.inputAction('right');
		if (input.keyCode.held['KeyA'])
			this.entity.inputAction('left');
		if (input.keyCode.held['KeyW'])
			this.entity.inputAction('jump');
	}
}

SINTER.Input = class Input {
	constructor() {
		['keydown', 'keyup', 'mousedown', 'mouseup'].forEach(e =>
			window.addEventListener(e, this.processEvent.bind(this)));

		this.mouse = { pressed: {}, held: {} };
		this.keyCode = { pressed: {}, held: {} };
		this.key = { pressed: {}, held: {} };
	}

	processEvent(event) {
		let updateInput = (object, value, pressed) => {
			object.pressed[value] = pressed && !object.held[value];
			object.held[value] = pressed;
		};

		let pressed = ['mousedown', 'keydown'].includes(event.type);
		if (['mousedown', 'mouseup'].includes(event.type)) {
			updateInput(this.mouse, event.button, pressed);
		} else {
			updateInput(this.keyCode, event.code, pressed);
			updateInput(this.key, event.key, pressed);
		}
	}
}
