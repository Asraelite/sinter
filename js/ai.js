SINTER.Ai = class Ai {
	constructor(entity, type) {
		this.entity = entity;

		this.createPaths();
	}

	createPaths() {
		let jp = this.entity.jumpPower;
		let g = this.entity.world.physics.gravity;
		let t = jp / g;
		let jumpHeight = jp * t + (-g / 2) * (t * t);
		console.log(jumpHeight / 16);
	}

	tick() {
	}
}
