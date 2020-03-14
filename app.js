var express = require('express');
var app = express();

app.get("/health", (req, res) => {
    res.send("API Granger Online")
})

app.post("/descritiva", (req, res) => {
    let body = req.body
    let dados = body.dados.split(";")
    let json = {
        tipo: "qualitativa",
        variavel: body.nomeVariavel,
        dados: []
    }
    if (isNaN(dados[0])) {
        //Se não for um número, será qualitativa
        let dadosDistintos = [...new Set(dados)]
        dadosDistintos.forEach(element => {
            let vet = dados.filter(item => element == item)
            let total = dados.length
            let repet = vet.length
            let obj = {
                name: element,
                value: vet.length,
                fi: Math.round((100*repet)/total)
            }
            json.dados.push(obj)
        });
    }
    else {
        //Se for um número, será quantitativa
    }
    res.send(json)
})
                             
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('API Granger online na porta %s', port);
});