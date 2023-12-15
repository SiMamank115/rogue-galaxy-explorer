let preloaded = false;
async function preload() {
	await loads(["./scene/galaxy.js"]);
	customSetup();
	return;
}
function customSetup() {
	createCanvas(600, 500);
	mgr = new SceneManager();
	mgr.addScene(galaxy);
	mgr.showNextScene();
	preloaded = true;
}

function draw() {
	if (!preloaded) return;
	mgr.draw();
}

function mousePressed() {
	mgr.handleEvent("mousePressed");
}

function keyPressed() {
	mgr.handleEvent("keyPressed");
}

let mgr;
