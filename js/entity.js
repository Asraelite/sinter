SINTER.Entity = class Entity {
	constructor(world, type, body) {
		this.world = world;
		this.controller = false;
		this.jumpPower = SINTER.consts.entities.JUMP_POWER;
		this.speed = SINTER.consts.entities.SPEED;
		this.body = new SINTER.PhysicsBody(this, world, body);
	}

	tick() {

	}

	destruct() {
		this.world._entities.delete(this);
	}

	inputAction(action) {
		this.body.action(action);
	}

	get pos() {
		return this.body.pos;
	}

	get center() {
		return {
			x: this.pos.x + this.body.width / 2,
			y: this.pos.y + this.body.height / 2
		}
	}
}
