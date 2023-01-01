// npm init -y
// npm install minimist
// npm install axios
// npm install jsdom
// npm install excel4node
// node 2011WorldCup.js --source="https://www.mykhel.com/cricket/icc-world-cup-2011-schedule-results-s9986/"

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require("path");


let args = minimist(process.argv);

// browser => url to html (url se http request -> server ne html in http response)
let responseKaPromise = axios.get(args.source);
responseKaPromise.then(function (response) {
    let html = response.data;

    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    let matchScoreTabs = document.querySelectorAll("div.os-pt")[0].getElementsByTagName('table');
    let matches = [];

    for (let i = 1; i < matchScoreTabs.length; i++) {
        let match = {
            date: "",
            stats: "",
            result: "",
        };
        match.date = matchScoreTabs[i].textContent.split('     ')[0].trim();
        match.stats = matchScoreTabs[i].textContent.split('     ')[1].trim() + ', ' + matchScoreTabs[i].textContent.split('     ')[2].trim();
        match.result = matchScoreTabs[i].textContent.split('     ')[3].trim();
        matches.push(match);
    }

    let matchesKaJSON = JSON.stringify(matches);
    fs.writeFileSync("matches.json", matchesKaJSON, "utf-8");

    //Json to excel
    data = matches;
    const xl = require('excel4node');
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet('WC2011');
    const headingColumnNames = [
        "Date",
        "Statistics",
        "Result",
    ]
    //Write Column Title in Excel file
    let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
        ws.cell(1, headingColumnIndex++)
            .string(heading)
    });
    //Write Data in Excel file
    let rowIndex = 2;
    data.forEach( record => {
        let columnIndex = 1;
        Object.keys(record).forEach(columnName =>{
            ws.cell(rowIndex,columnIndex++)
                .string(record [columnName])
        });
        rowIndex++;
    }); 
    wb.write('WC2011.xlsx');
    })

