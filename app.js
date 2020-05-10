var express = require('express');
var cors = require('cors');
var app = express();
var { quickSort } = require('./sorting')

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("API Granger Online")
})

app.post("/descritiva", (req, res) => {
    let body = req.body;
    body.dados = body.dados.toLowerCase().split(",").join('.'); 
    let dados = body.dados.split(";");
    let vetAux = [];
    dados.forEach(element => {
        vetAux.push(element.trim())
    });
    dados = vetAux;
    // dados.sort();
    quickSort(dados)
    // console.log(quickSort(dados))
    let json = {
        tipo: "",
        variavel: body.nomeVariavel,
        dados: []
    };

    if (isNaN(dados[0])) {
        //Se não for um número, será qualitativa
        json.tipo = "qualitativa"
        let dadosDistintos = [...new Set(dados)]
        dadosDistintos.forEach(element => {
            let vet = dados.filter(item => element == item)
            let total = dados.length
            let repet = vet.length
            let obj = {
                name: element,
                value: vet.length,
                fi: Math.round((100 * repet) / total)
            }
            json.dados.push(obj)
        });
    }
    else {
        //Se for um número, será quantitativa
        let vetAux = [];
        dados.forEach(element => {
            vetAux.push(Number(element))
        });
        dados = vetAux;
        let dadosDistintos = [...new Set(dados)];
        if (dadosDistintos.length <= 6) {
            // Será quantitativa discreta
            json.tipo = "quantitativaDiscreta"
            dadosDistintos.forEach(element => {
                let vet = dados.filter(item => element == item)
                let total = dados.length
                let repet = vet.length
                let obj = {
                    name: element,
                    value: vet.length,
                    fi: Math.round((100 * repet) / total)
                }
                json.dados.push(obj)
            });
        }
        else {
            //será quantitativa contínua
            json.tipo = "quantitativaContinua"
            let menor = dados[0];
            let maior = dados[dados.length - 1];
            let amplitude = maior - menor;
            let constante = Math.round(1 + 3.3 * Math.log10(dados.length));
            let intervaloClasses = Math.ceil(amplitude / constante)

            for (let i = 0; i < constante; i++) {
                let contador = 0
                dados.forEach(element => {
                    if (element >= menor && element < (menor + intervaloClasses)) {
                        contador += 1
                    }
                })
                let intervalo = menor + " |-- " + (menor + intervaloClasses);
                menor = intervaloClasses + menor
                let obj = {
                    name: intervalo,
                    value: contador,
                    fi: Math.round((100 * contador) / dados.length)
                }
                json.dados.push(obj)
            }
        }
    }
    res.send(json)
})

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('API Granger online na porta %s', port);
});