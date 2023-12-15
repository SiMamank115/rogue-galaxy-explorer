async function loads(scripts = []) {
	let scr = document.createElement("script");
	scr.async = true;
	scr.defer = true;
	for (let i = 0; i < scripts.length; i++) {
		await fetch(scripts[i])
			.then((e) => e.text())
			.then((e) => {
				scr.textContent += e + "\n";
			});
	}
	document.body.appendChild(scr);
}
