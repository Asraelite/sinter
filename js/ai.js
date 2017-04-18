SINTER.Ai = class Ai {
	constructor(entity, type) {
		this.entity = entity;

		this.createPaths();

		this.state = {
			dir: 'right'
		};
	}

	createPaths() {
		let physics = this.entity.world.physics;
		let jp = this.entity.jumpPower;
		let g = physics.gravity;
		let jumpHeight = 0;
		let jumpTicks = 0;
		while(jp > 0) {
			jumpHeight += jp;
			jumpTicks++;
			jp -= g;
		}
		console.log(jumpHeight / 16);

		let arx = physics.airResistance.x;
		let speed = this.entity.speed;
		let maxSpeed = -speed / (arx - 1);
		let maxJumpDistance = maxSpeed * jumpTicks * 2;
		console.log(maxJumpDistance / 16);

		let xvel = maxSpeed;
		let yvel = this.entity.jumpPower;

	}

	tick() {
		if (this.entity.body.vel.x == 0 || Math.random() < 0.01)
			this.state.dir = this.state.dir == 'right' ? 'left' : 'right';
		this.entity.inputAction(this.state.dir);
		this.entity.inputAction('jump');
	}
}
