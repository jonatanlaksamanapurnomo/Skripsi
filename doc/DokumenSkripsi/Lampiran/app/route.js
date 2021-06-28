const express = require('express')
const app = express()
const Kiri = require("../model/Kirihistory");
const path = require('path');
let modelKiri = new Kiri();
app.use(express.json())
app.get("/", (req, res) => {
    res.sendFile(path.join(`${__dirname}../../views/index.html`));
})


app.post('/searchRoute', (req, res) => {
    let filterParams = req.body;
    let data = modelKiri.filterData(filterParams);
    res.status(200).json({
        'status': 'OK',
        'messages': 'Data',
        'data': data,
    })

})


module.exports = {app, express};