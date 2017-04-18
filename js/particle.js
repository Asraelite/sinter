SINTER.Particle = class Particle {
	constructor(world, pos, size) {
		this.world = world;
		this.targetSize = (Math.random() + 0.1) * size;
		this.size = 0;
		this.targetReached = false;
		this.pos = pos;
		this.vel = {
			x: (Math.random() - 0.5) * 0.8,
			y: (Math.random() - 0.5) * 0.8
		};
	}

	destruct() {
		this.world._particles.delete(this);
	}

	tick() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;
		this.vel.x += (Math.random() - 0.5) * 0.1;
		this.vel.y += (Math.random() - 0.5) * 0.1;

		if (this.targetReached) {
			this.size *= 0.99;
			if (this.size < 0.1) this.destruct();
	 	} else {
			this.size += 0.05;
			if (this.size > this.targetSize) this.targetReached = true;
		}
	}
}
