var express = require("express");
var cors = require("cors");
var app = express();
var { quickSort, media, moda, mediana } = require("./sorting");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.send("API Granger Online");
});

app.post("/mediana", (req, res) => {
	let body = req.body;
	let resultado = "";
	resultado = mediana(body.tipo, body.dados);
	res.send(resultado);
});

app.post("/quartil/:id", (req, res) => {
	let body = req.body;
	let quartil = req.params.id;
	console.log("req", quartil, body);
	res.send("teste");
});

app.post("/descritiva", (req, res) => {
	let body = req.body;
	body.dados = body.dados.toLowerCase().split(",").join(".");
	let dados = body.dados.split(";");
	let vetAux = [];
	dados.forEach((element) => {
		if (isNaN(element)) {
			vetAux.push(element.trim());
		} else {
			vetAux.push(Number(element));
		}
	});
	dados = vetAux;
	quickSort(dados);

	let json = {
		tipo: "",
		media: "",
		moda: "",
		mediana: "",
		variavel: body.nomeVariavel,
		dados: [],
	};

	if (isNaN(dados[0])) {
		//Se não for um número, será qualitativa
		json.tipo = "qualitativa";
		let dadosDistintos = [...new Set(dados)];

		dadosDistintos.forEach((element) => {
			let vet = dados.filter((item) => element == item);
			let total = dados.length;
			let repet = vet.length;
			let obj = {
				name: element,
				value: vet.length,
				fr: Math.round((100 * repet) / total),
			};
			json.dados.push(obj);
		});

		json.media = media(json.tipo).trim();
		json.moda = moda(json.tipo, json.dados).trim();
		json.mediana = mediana(json.tipo, dados).trim();
	} else {
		//Se for um número, será quantitativa
		let dadosDistintos = [...new Set(dados)];
		if (dadosDistintos.length <= 6) {
			// Será quantitativa discreta
			json.tipo = "quantitativaDiscreta";
			dadosDistintos.forEach((element) => {
				let vet = dados.filter((item) => element == item);
				let total = dados.length;
				let repet = vet.length;
				let obj = {
					name: element,
					value: vet.length,
					fr: Math.round((100 * repet) / total),
				};
				json.dados.push(obj);
			});
			json.media = media(json.tipo, json.dados).trim();
			json.moda = moda(json.tipo, json.dados).trim();
			json.mediana = mediana(json.tipo, dados).trim();
		} else {
			//será quantitativa contínua
			json.tipo = "quantitativaContinua";
			let menor = dados[0];
			let maior = dados[dados.length - 1];
			let amplitude = maior - menor;
			let constante = Math.round(1 + 3.3 * Math.log10(dados.length));
			let intervaloClasses = Math.ceil(amplitude / constante);

			for (let i = 0; i < constante; i++) {
				let contador = 0;
				dados.forEach((element) => {
					if (element >= menor && element < menor + intervaloClasses) {
						contador += 1;
					}
				});
				let intervalo = menor + " |-- " + (menor + intervaloClasses);
				menor = intervaloClasses + menor;
				let obj = {
					name: intervalo,
					value: contador,
					fr: Math.round((100 * contador) / dados.length),
				};
				json.dados.push(obj);
			}
			json.media = media(json.tipo, json.dados).trim();
			json.moda = moda(json.tipo, json.dados).trim();
			json.mediana = mediana(json.tipo, json.dados).trim();
		}
	}
	console.log("json", json);
	res.send(json);
});

var port = process.env.PORT || 3001;
app.listen(port, function () {
	console.log("API Granger online na porta %s", port);
});
