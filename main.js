let ship;
let camera;
function preload() {
	return;
}
function setup() {
	createCanvas(500, 500);
	ship = new Ship();
	camera = new Camera();
	frameRate(60);
}
function draw() {
	background(0);
	camera.render([ship]);
	ship.driver();
}
class Ship {
	constructor() {
		this.rotation = 0;
		this.pos = createVector();
		this.speed = 5;
	}
	render(tilt) {
		push();
		let tilted = createVector(this.pos.x + (tilt?.x ?? 0), this.pos.y + (tilt?.y ?? 0));
		fill(255);
		text(this.pos.x + ", " + this.pos.y, 50, 20);
		translate(tilted.x, tilted.y);
		circle(0, 0, 40);
		rectMode(CENTER);
		// rotate(tilted.angleBetween(createVector(mouseX, mouseY)));
		rotate(createVector(mouseX, mouseY).sub(camera.anchor).heading());
		rect(0, 0, 45, 10);
		pop();
	}
	move({ x = 0, y = 0 }) {
		this.pos.add(createVector(x, y));
	}
	driver() {
		let finalPos = { x: 0, y: 0 };
		if (keyIsDown(65)) {
			finalPos.x -= this.speed;
		}
		if (keyIsDown(68)) {
			finalPos.x += this.speed;
		}
		if (keyIsDown(87)) {
			finalPos.y -= this.speed;
		}
		if (keyIsDown(83)) {
			finalPos.y += this.speed;
		}
		this.move(finalPos);
	}
}
class Camera {
	constructor() {
		this.anchor = createVector(width * 0.5, height * 0.5);
		this.onanimation = false;
		this.maxDist = 0.1;
		this.tilt = createVector(0, 0); //* the addition to make all object center from the canvas
	}
	render(instances = []) {
		if (!instances[0]) return;
		let playerInstance = instances.pop();
		if (
			!this.onanimation &&
			// frameCount % 5 == 0 &&
			((!playerInstance?.moving &&
				(abs(playerInstance.pos.x + this.tilt.x - this.anchor.x) > width * this.maxDist || abs(playerInstance.pos.y + this.tilt.y - this.anchor.y) > height * this.maxDist)) ||
				playerInstance.pos.x + this.tilt.x != this.anchor.x ||
				playerInstance.pos.y + this.tilt.y != this.anchor.y)
		) {
			this.onanimation = true;
			gsap.to(this.tilt, {
				onComplete: () => {
					this.onanimation = false;
				},
				ease: Linear.easeNone,
				x: this.anchor.x - playerInstance.pos.x,
				y: this.anchor.y - playerInstance.pos.y,
				duration: 0.2,
			});
		} //* update tilt if player moves, every 5 frames
		push();
		rectMode(CENTER);
		instances.forEach((e) => {
			e?.render?.(this.tilt);
		});
		playerInstance?.render(this.tilt); //* render the player with tilt
		pop();
	}
}
