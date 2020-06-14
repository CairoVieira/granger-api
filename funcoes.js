function troca(vet, i, j) {
	let aux = vet[i];
	vet[i] = vet[j];
	vet[j] = aux;
}

function quickSort(vet, posIni = 0, posFim = vet.length - 1) {
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
}

function media(tipo, dados) {
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
}

function moda(tipo, dados) {
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
}

function mediana(tipo, dados) {
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
}

function medidasSeparatriz(tipo, dados, medida, parte) {
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
}

function desvioPadrao(tipo, amostraPopulacao, dados) {
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
}

function fatorial(numero) {
	if (numero == 0) return 1;
	if (numero != 1) return numero * fatorial(numero - 1);
	return Number(numero);
}

function analiseCombinatoria(n, k) {
	return Number(fatorial(n) / (fatorial(n - k) * fatorial(k)));
}

function distribuicaoBinomial(n, p, q, k, tipo) {
	if (tipo == "maior") {
		let total = 0;
		for (let index = k; index <= n; index++) {
			total += Number(analiseCombinatoria(n, index) * Math.pow(p, index) * Math.pow(q, n - index) * 100);
		}
		return total.toFixed(2);
	}
	if (tipo == "menor") {
		let total = 0;
		for (let index = 0; index < k; index++) {
			total += Number(analiseCombinatoria(n, index) * Math.pow(p, index) * Math.pow(q, n - index) * 100);
		}
		return total.toFixed(2);
	}
	return Number(analiseCombinatoria(n, k) * Math.pow(p, k) * Math.pow(q, n - k) * 100).toFixed(2);
}

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
};
