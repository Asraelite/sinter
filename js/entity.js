SINTER.Entity = class Entity {
	constructor(world, type, body) {
		this.world = world;
		this.body = new SINTER.PhysicsBody(world, body);
		this.controller = false;
	}

	tick() {

	}

	destruct() {
		this.world._entities.delete(this);
	}

	inputAction(action) {
		this.body.move(action);
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
