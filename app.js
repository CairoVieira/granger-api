var express = require("express");
var cors = require("cors");
var app = express();
var {
	quickSort,
	media,
	moda,
	mediana,
	medidasSeparatriz,
	desvioPadrao,
	distribuicaoBinomial,
	distribuicaoNormal,
	mediaBinomial,
	desvioPadraoBinomial,
	coeficienteVariacaoBinomial,
	desvioPadraoUniforme,
	distribuicaoUniforme,
	correlacao,
	correlacaoGrafico,
	regressao,
	tipoCorrelacao,
	autenticarUsuario,
	cadastrarUsuario,
} = require("./funcoes");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.send("API Granger Online");
});

app.post("/mediana", (req, res) => {
	let body = req.body;
	let resultado = "";
	resultado = mediana(body.tipo, body.dados);
	res.send(resultado.toString());
});

app.post("/quartil/:id", (req, res) => {
	let body = req.body;
	let quartil = Number(req.params.id);
	console.log("1.0", body, quartil);
	const resultado = medidasSeparatriz(body.tipo, body.dados, 4, quartil);
	console.log("1.1", resultado);
	res.send(resultado.toString());
});

app.post("/quintil/:id", (req, res) => {
	let body = req.body;
	let quintil = Number(req.params.id);
	const resultado = medidasSeparatriz(body.tipo, body.dados, 5, quintil);
	res.send(resultado.toString());
});

app.post("/decil/:id", (req, res) => {
	let body = req.body;
	let decil = Number(req.params.id);
	const resultado = medidasSeparatriz(body.tipo, body.dados, 10, decil);
	res.send(resultado.toString());
});

app.post("/porcentil/:id", (req, res) => {
	let body = req.body;
	let porcentil = Number(req.params.id);
	const resultado = medidasSeparatriz(body.tipo, body.dados, 100, porcentil);
	res.send(resultado.toString());
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
			json.desvio = desvioPadrao(json.tipo, body.amostra === true ? 1 : 0, json.dados);
		} else {
			//será quantitativa contínua
			json.tipo = "quantitativaContinua";
			let menor = dados[0];
			let maior = dados[dados.length - 1];
			let amplitude = maior - menor;
			let constante = Math.sqrt(dados.length);

			let k = [Math.trunc(constante - 1), Math.trunc(constante), Math.trunc(constante + 1)];

			let linhas;
			let isNotMultiple = true;
			while (isNotMultiple) {
				amplitude += 1;
				for (let i = 0; i < k.length; i++) {
					if (amplitude % k[i] == 0) {
						isNotMultiple = false;
						linhas = k[i];
						break;
					}
				}
			}

			let intervaloClasses = amplitude / linhas;

			for (let i = 0; i < linhas; i++) {
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
			json.desvio = desvioPadrao(json.tipo, body.amostra === true ? 1 : 0, json.dados);

			/** STURGES
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
			json.desvio = desvioPadrao(json.tipo, body.amostra === true ? 1 : 0, json.dados);
			**/
		}
	}
	res.send(json);
});

app.post("/probabilidade/binomial", (req, res) => {
	let body = req.body;
	let resultado = distribuicaoBinomial(Number(body.n), Number(body.p), Number(body.q), body.k);
	let media = mediaBinomial(Number(body.n), Number(body.p));
	let desvio = desvioPadraoBinomial(Number(body.n), Number(body.p), Number(body.q));
	let coeficiente = coeficienteVariacaoBinomial(desvio, media);
	let json = {
		dados: {
			resultado,
			media,
			desvio,
			coeficiente,
		},
	};
	res.send(json);
});

app.post("/probabilidade/normal", (req, res) => {
	let body = req.body;
	let resultado = distribuicaoNormal(Number(body.media), Number(body.desvio), Number(body.valor), body.intervalo, Number(body.de), Number(body.para));
	let json = {
		dados: {
			resultado,
		},
	};
	res.send(json);
});

app.post("/probabilidade/uniforme", (req, res) => {
	let body = req.body;
	const resultado = distribuicaoUniforme(Number(body.minimo), Number(body.maximo), Number(body.valor), body.intervalo, Number(body.de), Number(body.ate));
	const media = ((Number(body.minimo) + Number(body.maximo)) / 2).toFixed(2);
	const desvio = desvioPadraoUniforme(Number(body.minimo), Number(body.maximo));
	const coeficiente = ((desvio / media) * 100).toFixed(2);
	let json = {
		dados: {
			resultado,
			media,
			desvio,
			coeficiente,
		},
	};
	res.send(json);
});

app.post("/correlacao", (req, res) => {
	const x = req.body.x.split(";");
	const y = req.body.y.split(";");
	const correlacaoResultado = correlacao(x, y);
	const tipo = tipoCorrelacao(correlacaoResultado);
	const regressaoResultado = regressao(x, y);
	const dadosGrafico = correlacaoGrafico(x, y, regressaoResultado);
	const json = {
		dados: {
			correlacaoResultado,
			dadosGrafico,
			regressaoResultado,
			tipo,
		},
	};
	res.send(json);
});

app.post("/login", (req, res) => {
	const email = req.body.email;
	const senha = req.body.senha;

	const usuario = autenticarUsuario(email, senha);
	if (!usuario) res.send("Usuário não cadstrado!");
	else res.send(usuario);
});

app.post("/cadastrar", async (req, res) => {
	const email = req.body.email;
	const senha = req.body.senha;
	const nome = req.body.nome;

	const usuario = await cadastrarUsuario(nome, email, senha);
	if (!usuario) res.send("Usuário não cadstrado!");
	else res.send(usuario);
});

var port = process.env.PORT || 3001;
app.listen(port, function () {
	console.log("API Granger online na porta %s", port);
});
