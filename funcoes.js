const tabelaZ = require("./z-score-table.js");
const fs = require("fs");
var CryptoJS = require("crypto-js");
const nodemailer = require('nodemailer');

function troca(vet, i, j) {
	let aux = vet[i];
	vet[i] = vet[j];
	vet[j] = aux;
}

function quickSort(vet, posIni = 0, posFim = vet.length - 1) {
	try {
		if (posFim > posIni) {
			const posPivot = posFim;
			let posDiv = posIni - 1;
			for (let i = posIni; i < posFim; i++) {
				if (vet[i] < vet[posPivot] && i != posDiv) {
					posDiv++;
					troca(vet, i, posDiv);
				}
			}
			posDiv++;
			troca(vet, posDiv, posPivot);

			quickSort(vet, posIni, posDiv - 1);

			quickSort(vet, posDiv + 1, posFim);
		}
	} catch (error) {
		console.log("error", error)
	}
}

function media(tipo, dados) {
	try {
		let media = 0;
		let total = 0;
		if (tipo !== "qualitativa") {
			if (tipo === "quantitativaDiscreta") {
				dados.forEach((element) => {
					media += Number(element.name) * Number(element.value);
					total += Number(element.value);
				});
				return "Média: " + (media / total).toFixed(2);
			} else {
				dados.forEach((element) => {
					let xi = element.name.split("|--");
					media += ((Number(xi[0]) + Number(xi[1])) / 2) * element.value;
					total += element.value;
				});
			}
			return "Média: " + (media / total).toFixed(2);
		}
		return "";
	} catch (error) {
		console.log("error", error)
	}
}

function moda(tipo, dados) {
	try {
		let moda = "";
		if (tipo === "quantitativaContinua") {
			let valor = -1;
			dados.forEach((element) => {
				let xi = element.name.split("|--");
				if (element.value > valor) {
					valor = element.value;
					moda = ((Number(xi[0]) + Number(xi[1])) / 2).toFixed(2).toString();
				}
				if (element.value == valor) {
					if (!moda.includes(((Number(xi[0]) + Number(xi[1])) / 2).toFixed(2).toString())) {
						moda = moda + ", " + ((Number(xi[0]) + Number(xi[1])) / 2).toFixed(2).toString();
					}
				}
			});
		} else {
			let valor = -1;
			dados.forEach((element) => {
				if (element.value > valor) {
					valor = element.value;
					moda = element.name.toString();
				}
				if (element.value == valor) {
					if (!moda.includes(element.name.toString())) {
						moda = moda + ", " + element.name;
					}
				}
			});
			let vetorModa = moda.split(",");
			if (vetorModa.length == dados.length) return "Moda: não existe";
		}
		return "Moda: " + moda;
	} catch (error) {
		console.log("error", error)
	}
}

function mediana(tipo, dados) {
	try {
		if (tipo != "quantitativaContinua") {
			if (dados.length % 2 == 0) {
				let indice = dados.length / 2;
				if (dados[indice] == dados[indice - 1]) return "Mediana: " + dados[indice];
				return "Mediana: " + dados[indice - 1] + ", " + dados[indice];
			} else {
				let indice = Math.floor(dados.length / 2);
				return "Mediana: " + dados[indice];
			}
		} else {
			let total = 0;
			dados.forEach((element) => {
				total += Number(element.value);
			});
			let posicao = total / 2;
			let intervaloClasse = {};
			let Fac = 0;
			total = 0;

			for (let index = 0; index < dados.length; index++) {
				if (posicao >= total && posicao <= total + Number(dados[index].value)) {
					intervaloClasse = dados[index];
					break;
				}
				Fac += Number(dados[index].value);
				total += Number(dados[index].value);
			}
			let limites = intervaloClasse.name.split("|--");
			let mediana = Number(limites[0]) + ((posicao - Fac) / intervaloClasse.value) * Number(limites[1] - Number(limites[0]));
			return "Mediana: " + mediana.toFixed(2).toString();
		}

	} catch (error) {
		console.log("error", error)
	}
}

function medidasSeparatriz(tipo, dados, medida, parte) {
	try {
		let total = 0;
		dados.forEach((item) => {
			total += item.value;
		});
		let porcetagem = (100 / medida) * parte;
		let posicao = Math.round((porcetagem * total) / 100);
		let Fac = 0;
		let intervaloClasse = {};
		for (let index = 0; index < dados.length; index++) {
			if (posicao >= Fac && posicao <= Fac + Number(dados[index].value)) {
				intervaloClasse = dados[index];
				break;
			}
			Fac += Number(dados[index].value);
		}

		if (tipo == "quantitativaContinua") {
			let limites = intervaloClasse.name.split("|--");
			let resultado = Number(limites[0]) + ((posicao - Fac) / intervaloClasse.value) * Number(limites[1] - Number(limites[0]));
			return resultado.toFixed(2);
		}
		return intervaloClasse.name;
	} catch (error) {
		console.log("error", error)
	}
}

function desvioPadrao(tipo, amostraPopulacao, dados) {
	try {
		let media = 0;
		let total = 0;
		if (tipo != "quantitativaContinua") {
			dados.forEach((element) => {
				media += Number(element.name) * Number(element.value);
				total += Number(element.value);
			});
			media = media / total;
			let somatorio = 0;
			dados.forEach((item) => {
				somatorio += (item.name - media) ** 2 * item.value;
			});
			let desvio = Math.sqrt(somatorio / (total - amostraPopulacao));
			return `Desvio Padrão: ${desvio.toFixed(2)} - Coeficiente de Variação: ${((desvio / media) * 100).toFixed(2)}%`;
		}

		dados.forEach((element) => {
			let xi = element.name.split("|--");
			media += ((Number(xi[0]) + Number(xi[1])) / 2) * element.value;
			total += Number(element.value);
		});
		media = media / total;
		let somatorio = 0;
		dados.forEach((item) => {
			let xi = item.name.split("|--");
			xi = (Number(xi[0]) + Number(xi[1])) / 2;
			somatorio += (xi - media) ** 2 * item.value;
		});
		let desvio = Math.sqrt(somatorio / (total - amostraPopulacao));
		return `Desvio Padrão: ${desvio.toFixed(2)} - Coeficiente de Variação: ${((desvio / media) * 100).toFixed(2)}%`;
	} catch (error) {
		console.log("error", error)
	}
}

function fatorial(numero) {
	try {
		if (numero == 0) return 1;
		if (numero != 1) return numero * fatorial(numero - 1);
		return Number(numero);
	} catch (error) {
		console.log("error", error)
	}
}

function analiseCombinatoria(n, k) {
	try {
		if (k == 0) return 1;
		return Number((fatorial(n) / (fatorial(n - k) * fatorial(k)).toFixed(2)));
	} catch (error) {
		console.log("error", error)
	}
}

function distribuicaoBinomial(n, p, q, k, tipo) {
	try {
		const arrayK = k.split(";")
		let total = 0;
		for (let index = 0; index < arrayK.length; index++) {
			const element = Number(arrayK[index]);
			total += Number(analiseCombinatoria(n, element) * Math.pow(p, element) * Math.pow(q, n - element) * 100);
		}
		return total.toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function mediaBinomial(n, p) {
	try {
		return (n * p).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function desvioPadraoBinomial(n, p, q) {
	try {
		return Math.sqrt(n * p * q).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function coeficienteVariacaoBinomial(desvio, media) {
	try {
		return ((desvio / media) * 100).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function zscore(media, desvio, valor) {
	try {
		let score = (valor - media) / desvio;
		return Math.round((score + Number.EPSILON) * 100) / 100;
	} catch (error) {
		console.log("error", error)
	}
}

function buscaBinaria(valor, vetor) {
	try {
		let primeiro = 0;
		let ultimo = vetor.length - 1;
		let match = false;
		let meio = 0;

		while (primeiro <= ultimo && !match) {
			meio = Math.ceil((primeiro + ultimo) / 2);
			if (vetor[meio] == valor) {
				match = true;
			} else {
				if (valor < vetor[meio]) {
					ultimo = meio - 1;
				} else {
					primeiro = meio + 1;
				}
			}
		}
		return meio;
	} catch (error) {
		console.log("error", error)
	}
}

function retornaArea(media, desvio, valor) {
	try {
		const score = Math.abs(zscore(media, desvio, valor));
		const numeroLin = Math.trunc(score * 10) / 10;
		const numeroCol = Math.round((score - numeroLin + Number.EPSILON) * 100) / 100;
		const indiceColuna = buscaBinaria(numeroCol, tabelaZ.coluna);
		const indiceLinha = buscaBinaria(numeroLin, tabelaZ.linha);
		const area = tabelaZ.resultado[indiceLinha][indiceColuna];
		return area;
	} catch (error) {
		console.log("error", error)
	}
}

function distribuicaoNormal(media, desvio, valor, intervalo, de, ate) {
	try {
		if (intervalo == "entre") {
			const area1 = retornaArea(media, desvio, de);
			const area2 = retornaArea(media, desvio, ate);

			if (de < media && ate < media) {
				return Math.abs((area1 - area2) * 100).toFixed(2);
			}
			if (de > media && ate > media) {
				return Math.abs((area2 - area1) * 100).toFixed(2);
			}
			return ((area1 + area2) * 100).toFixed(2);
		} else {
			const area = retornaArea(media, desvio, valor);
			if ((valor < media && intervalo == "maior") || (valor > media && intervalo == "menor")) return ((0.5 + area) * 100).toFixed(2);

			return ((0.5 - area) * 100).toFixed(2);
		}
	} catch (error) {
		console.log("error", error)
	}
}

function distribuicaoUniforme(minimo, maximo, valor, intervalo, de, ate) {
	try {
		if (intervalo == "entre") {
			return ((1 / (maximo - minimo)) * (ate - de) * 100).toFixed(2);
		}
		if (intervalo == "maior") {
			return ((1 / (maximo - minimo)) * (maximo - valor) * 100).toFixed(2);
		}
		return ((1 / (maximo - minimo)) * (valor - minimo) * 100).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function desvioPadraoUniforme(minimo, maximo) {
	try {
		return Math.sqrt((maximo - minimo) ** 2 / 12).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function correlacao(x, y) {
	try {
		let somatorioX = 0;
		let somatorioY = 0;
		let somatorioXY = 0;
		let somatorioX2 = 0;
		let somatorioY2 = 0;

		for (let i = 0; i < x.length; i++) {
			const elementX = Number(x[i]);
			const elementY = Number(y[i]);

			somatorioX += elementX;
			somatorioY += elementY;
			somatorioXY += elementX * elementY;
			somatorioX2 += elementX * elementX;
			somatorioY2 += elementY * elementY;
		}
		const n = x.length;
		const divisor = n * somatorioXY - somatorioX * somatorioY;
		const dividendo = Math.sqrt(n * somatorioX2 - Math.pow(somatorioX, 2)) * Math.sqrt(n * somatorioY2 - Math.pow(somatorioY, 2));
		const resultado = divisor / dividendo;
		return (resultado * 100).toFixed(2);
	} catch (error) {
		console.log("error", error)
	}
}

function regressao(x, y) {
	try {
		let somatorioX = 0;
		let somatorioY = 0;
		let somatorioXY = 0;
		let somatorioX2 = 0;
		let somatorioY2 = 0;

		for (let i = 0; i < x.length; i++) {
			const elementX = Number(x[i]);
			const elementY = Number(y[i]);

			somatorioX += elementX;
			somatorioY += elementY;
			somatorioXY += elementX * elementY;
			somatorioX2 += elementX * elementX;
			somatorioY2 += elementY * elementY;
		}

		const n = x.length;
		const divisor = n * somatorioXY - somatorioX * somatorioY;
		const dividendo = n * somatorioX2 - Math.pow(somatorioX, 2);
		const a = (divisor / dividendo).toFixed(2);
		const b = (somatorioY / n - a * (somatorioX / n)).toFixed(2);
		return { a, b };
	} catch (error) {
		console.log("error", error)
	}
}

function correlacaoGrafico(x, y, regressao) {
	try {
		let resultado = [];

		for (let i = 0; i < x.length; i++) {
			const elementX = Number(x[i]);
			const elementY = Number(y[i]);

			let item = {
				x: elementX,
				y: elementY,
			};
			if (i == 0 || i == x.length - 1) {
				const linha = Number(regressao.a) * elementX + Number(regressao.b);
				item.l = linha;
			}
			resultado.push(item);
		}
		return resultado;
	} catch (error) {
		console.log("error", error)
	}
}

function tipoCorrelacao(correlacao) {
	try {
		if (Number(correlacao) == 0) return "Variáveis não correlacionadas";
		if (Number(correlacao) <= 30) return "Fraca";
		if (Number(correlacao) <= 70 && Number(correlacao) > 30) return "Moderada";
		if (Number(correlacao) == 100) return "Perfeita";
		return "Forte";
	} catch (error) {
		console.log("error", error)
	}
}

function autenticarUsuario(email, senha) {
	try {
		const dados = load();
		const hasEmail = dados.filter(
			(u) => u.email == email);

		if (hasEmail.length > 0) {
			const isUserLogged = hasEmail.filter(x => x.senha == senha)
			if (isUserLogged.length > 0) return isUserLogged[0];
			return "Senha incorreta."
		}
		return hasEmail.length > 0;
	} catch (error) {
		console.log("error", error)
	}
}

async function cadastrarUsuario(nome, email, senha) {
	try {
		const dados = load();
		const user = {
			nome,
			email,
			senha,
		};
		const isUserLogged = dados.filter((u) => u.email == email);
		if (isUserLogged.length == 0) {
			dados.push(user);
			save(dados);

			const emailASerEnviado = {
				from: 'grangerstats@gmail.com',
				to: email,
				subject: 'Cadastro efetuado com sucesso',
				html: `<h3>Olá ${nome},</h3>
			<p>Seja bem-vindo! Seu cadastro foi efetuado com sucesso.</p>
			<p>Agora você já pode iniciar sua jornada no Granger.</p>

			<p>Para acessá-lo basta utilizar <b>${email}</b> e senha feita no cadastro.</p>

			<i>Alohomora!</i>
		`,
			};

			await sendEmail(emailASerEnviado);
			return autenticarUsuario(email, senha);
		}
		return "E-mail já cadastrado."
	} catch (error) {
		console.log("error", error)
	}
}

function sendEmail(emailASerEnviado) {
	try {
		const remetente = createSendEmail()

		return new Promise(function (resolve, reject) {
			remetente.sendMail(emailASerEnviado, function (err, info) {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					console.log('Email enviado com sucesso.');
					resolve(info);
				}
			});
		});
	} catch (error) {
		console.log("error", error)
	}
}

function save(content) {
	try {
		const contentString = JSON.stringify(content);
		return fs.writeFileSync("login.txt", contentString);
	} catch (error) {
		console.log("error", error)
	}
}

function load() {
	try {
		const fileBuffer = fs.readFileSync("login.txt", "utf-8");
		const json = JSON.parse(fileBuffer);
		return json;
	} catch (error) {
		console.log("error", error)
	}
}

function createSendEmail() {
	try {
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'grangerstats@gmail.com',
				pass: 'hermione20'
			}
		});
	} catch (error) {
		console.log("error", error)
	}
}

async function recuperarSenha(email) {
	try {
		const dados = load();
		const hasEmail = dados.filter(
			(u) => u.email == email);

		if (hasEmail.length > 0) {
			const remetente = createSendEmail();

			const emailCript = criptografar(email)

			const emailASerEnviado = {
				from: 'grangerstats@gmail.com',
				to: email,
				subject: 'Recuperação de Senha',
				html: `<h3>Olá,</h3>
			<p>Para recuperar seu acesso será necessário cadastrar uma nova senha.</p>
			<p>Acesse o link abaixo para trocar sua senha.</p>

			<p>http://granger-stats-com.umbler.net/esqueci-senha?e=${emailCript}</p>

			<i>Alohomora!</i>
		`,
			};
			await sendEmail(emailASerEnviado);
			return { mensagem: "E-mail de recuperação de senha foi enviado!" }
		}
		return "E-mail não cadastrado."
	} catch (error) {
		console.log("error", error)
	}
}

async function alterarSenha(email, senha) {
	try {
		const dados = load();
		const hasUser = dados.filter(
			(u) => u.email == email);

		if (hasUser.length > 0) {
			const user = {
				nome: hasUser[0].nome,
				email: hasUser[0].email,
				senha: descriptografar(senha),
			};
			const newList = dados.filter(
				(u) => u.email != email);
			newList.push(user);
			save(newList);
			return { mensagem: "Senha cadastrada com sucesso!" }
		}
		return "E-mail não cadastrado."
	} catch (error) {
		console.log("error", error)
	}
}

function criptografar(text) {
	try {
		return CryptoJS.AES.encrypt(JSON.stringify(text), 'secret key 123').toString();
	} catch (error) {
		console.log("error", error)
	}
};

function descriptografar(senha) {
	try {
		var bytes = CryptoJS.AES.decrypt(senha, 'secret key 123');
		var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

		return decryptedData
	} catch (error) {
		console.log("error", error)
	}

};

module.exports = {
	quickSort,
	media,
	moda,
	mediana,
	medidasSeparatriz,
	desvioPadrao,
	fatorial,
	analiseCombinatoria,
	distribuicaoBinomial,
	mediaBinomial,
	desvioPadraoBinomial,
	coeficienteVariacaoBinomial,
	distribuicaoNormal,
	desvioPadraoUniforme,
	distribuicaoUniforme,
	correlacao,
	correlacaoGrafico,
	regressao,
	tipoCorrelacao,
	autenticarUsuario,
	cadastrarUsuario,
	recuperarSenha,
	alterarSenha
};
