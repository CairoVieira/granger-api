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
	if (tipo != "quantitativaContinua") {
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
		return "Medida Separatriz: " + intervaloClasse.name;
	}
	if (tipo != "quantitativaContinua") {
		return "teste";
	}
}

module.exports = {
	quickSort,
	media,
	moda,
	mediana,
	medidasSeparatriz,
};
