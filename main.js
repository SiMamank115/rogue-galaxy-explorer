let game;
let currentFPS;
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
	fill(255).text(game.ship.pos.x + ", " + game.ship.pos.y, 50, 20);
	renderFPS();
}
function renderFPS() {
	if (frameCount % 10 == 0) {
		currentFPS = round(frameRate());
	}
	push();
	fill(255).noStroke().strokeWeight(0).text(currentFPS, 10, 20);
	pop();
} //! FPS counter
class Game {
	constructor() {
		this.camera = new Camera();
		this.ship = new Ship({ camera: this.camera });
		this.background = new Background({ ship: this.ship });
	}
	render() {
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
		translate(tilted.x, tilted.y);
		rectMode(CENTER).noStroke();
		rotate(createVector(mouseX, mouseY).sub(tilted).heading());
		circle(0, 0, 40);
		stroke(0);
		rect(10, 0, 35, 10);
		circle(0, 0, 30);
		circle(0, 0, 20);
		circle(0, 0, 10);
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
		this.density = 200;
		this.ship = ship;
		this.stars = [];
		this.clouds = new Clouds();
	}
	render(tilt) {
		let rendered = 0;
		this.clouds.render(tilt);
		this.stars.forEach((e) => {
			rendered += e.render(tilt);
		});
		if (rendered < this.density * 0.6) this.stars.push(new Star({ ship: this.ship }));
	}
}
class Clouds {
	constructor() {
		this.noiseLevel = 1;
		this.noiseScale = 0.002;
		this.noiseDetail = [6, 0.2];
		this.breakPoint = 30;
		this.rect = [];
		for (let i = 0; i < floor((width * 1.2) / this.breakPoint); i++) {
			let row = [];
			for (let u = 0; u < floor((height * 1.2) / this.breakPoint); u++) {
				row.push({
					bg: [200, 200, 200],
					x: i * this.breakPoint - width * 0.1,
					y: u * this.breakPoint - height * 0.1,
					fill: {
						value: 0,
					},
					tl: gsap.timeline(),
				});
			}
			this.rect.push(row);
		}
	}
	render(tilt) {
		noiseDetail(...this.noiseDetail);
		this.rect.forEach((e) => {
			e.forEach((u) => {
				let val = u.fill.value;
				let rgba = u.fill.value ? `rgba(${round(u.fill.bg?.[0])},${round(u.fill.bg?.[1])},${round(u.fill.bg?.[2])},${val})` : 0;
				fill(rgba).strokeWeight(0).noStroke();
				rect(u.x + round(tilt.x % this.breakPoint), u.y + round(tilt.y % this.breakPoint), this.breakPoint, this.breakPoint);
				// fill(255);
				// text(round(u.fill.value,2), u.x + (tilt.x % this.breakPoint), u.y + (tilt.y % this.breakPoint));
				if (frameCount % 5 == 0) {
					let nx = this.noiseScale * (tilt.x - u.x);
					let ny = this.noiseScale * (tilt.y - u.y);
					let c = this.noiseLevel * (0.3 - noise(nx, ny, this.noiseScale * frameCount * 0.5));
					u.fill.bg = [255 * noise(nx), 255 * noise(ny), 255 * noise(this.noiseScale * frameCount * 0.5)];
					u.tl.clear();
					u.tl.to(u.fill, { value: c < 0 ? 0 : c, duration: 0.2, ease: Linear.easeNone });
				}
			});
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
		this.tiltMult = (_.random(0, 1) ? _.random(8, 10) : _.random(2, 7)) * 0.1;
		this.fill = { value: _.random(205 * this.tiltMult) + 50, animated: 0 };
		this.move = _.random(0, 10) == 0;
		if (this.move) {
			this.moveY = (_.random(0, 1) ? _.random(-1, 1) : _.random(-3, 3)) * 0.1;
			this.moveX = (_.random(0, 1) ? _.random(-1, 1) : _.random(-3, 3)) * 0.1;
		}
	}
	render(tilt) {
		let tilted = createVector(this.pos.x + (tilt?.x ?? 0) * this.tiltMult, this.pos.y + (tilt?.y ?? 0) * this.tiltMult);
		let cullingX = abs(this.ship.pos.x + (tilt.x ?? 0) - tilted.x) > width * 0.75;
		let cullingY = abs(this.ship.pos.y + (tilt.y ?? 0) - tilted.y) > height * 0.75;
		if (cullingX || cullingY) return 0;
		push();
		let animatedFix = round(this.fill.animated);
		noStroke().fill(`rgba(${animatedFix},${animatedFix},${animatedFix},${round(animatedFix / this.fill.value, 2)})`);
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
		this.pos.x += this?.moveX ?? 0;
		this.pos.y += this?.moveY ?? 0;
		this.fill.animated += this.fill.value > this.fill.animated ? 2 : 0;
		// if (cullingX || cullingY) return 0; //* debug
		return 1;
	}
}
