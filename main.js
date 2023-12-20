let game;
function preload() {
	return;
}
function setup() {
	createCanvas(500, 500);
	game = new Game();
	frameRate(60);
}
function draw() {
	background(0);
	game.render();
}
class Game {
	constructor() {
		this.camera = new Camera();
		this.ship = new Ship({ camera: this.camera });
		this.background = new Background({ ship: this.ship });
	}
	render() {
		// this.background.render();
		this.camera.render([this.ship, this.background]);
		this.ship.driver();
	}
}
class Ship {
	constructor({ camera }) {
		this.camera = camera;
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
		rotate(createVector(mouseX, mouseY).sub(this.camera.anchor).heading());
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
		this.tl = gsap.timeline();
		this.anchor = createVector(width * 0.5, height * 0.5);
		this.onanimation = false;
		this.maxDist = 0.1;
		this.tilt = createVector(0, 0); //* the addition to make all object center from the canvas
	}
	render(instances = []) {
		if (!instances[0]) return;
		let playerInstance = instances.shift();
		if (
			frameCount % 5 == 0 &&
			((!playerInstance?.moving &&
				(abs(playerInstance.pos.x + this.tilt.x - this.anchor.x) > width * this.maxDist || abs(playerInstance.pos.y + this.tilt.y - this.anchor.y) > height * this.maxDist)) ||
				playerInstance.pos.x + this.tilt.x != this.anchor.x ||
				playerInstance.pos.y + this.tilt.y != this.anchor.y)
		) {
			this.tl.clear();
			this.tl.to(this.tilt, {
				onComplete: () => {
					this.onanimation = false;
				},
				ease: Linear.easeNone,
				x: this.anchor.x - playerInstance.pos.x,
				y: this.anchor.y - playerInstance.pos.y,
				duration: 0.1,
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
class Background {
	constructor({ ship }) {
		this.ship = ship;
		this.stars = [];
		for (let i = 0; i < 200; i++) {
			this.stars.push(new Star({ ship: this.ship }));
		}
	}
	render(tilt) {
		this.stars.forEach((e) => {
			e.render(tilt);
		});
	}
}
class Star {
	constructor({ x, y, radius1, radius2, npoints, ship }) {
		this.ship = ship;
		this.angle = TWO_PI / (npoints ?? (_.random(1, 3) != 1 ? _.random(5, 6) : 3));
		this.halfAngle = this.angle / 2.0;
		this.pos = createVector(x ?? _.random(ship.pos.x - width, ship.pos.x + width), y ?? _.random(ship.pos.y - height, ship.pos.y + height));
		this.rad = radius1 ?? _.random(1, 2);
		this.rad2 = radius2 ?? _.random(3, 7);
		this.tiltMult = (_.random(1, 2) == 1 ? _.random(8, 10) : _.random(2, 7)) * 0.1;
		this.fill = _.random(255 * this.tiltMult);
	}
	render(tilt) {
		let tilted = createVector(this.pos.x + (tilt?.x ?? 0) * this.tiltMult, this.pos.y + (tilt?.y ?? 0) * this.tiltMult);
		push();
		noStroke().fill(this.fill);
		beginShape();
		for (let a = 0; a < TWO_PI; a += this.angle) {
			let sx = tilted.x + cos(a) * this.rad2;
			let sy = tilted.y + sin(a) * this.rad2;
			vertex(sx, sy);
			sx = tilted.x + cos(a + this.halfAngle) * this.rad;
			sy = tilted.y + sin(a + this.halfAngle) * this.rad;
			vertex(sx, sy);
		}
		endShape(CLOSE);
		pop();
	}
}
