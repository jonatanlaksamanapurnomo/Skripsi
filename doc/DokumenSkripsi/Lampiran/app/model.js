const fs = require("fs")
const {csvToObject, buildFilter, filterData} = require("./Utils");

class KiriHistory {
    constructor() {
        this.fetchData();
    }

    fetchData = () => {
        fs.readFile(__dirname + "/data/KIRIStatistics.csv", "utf8", ((err, data) => {
            if (err === null) {
                let arrCSV = data.split("\n")
                //remove header
                arrCSV.shift();
                // console.log(arrCSV);
                this.data = arrCSV.map(csvToObject).filter(item => item !== undefined);
            }
        }))
    }
    //trigger heroku
    filterData = (filterParams) => {
        this.fetchData();
        let query = buildFilter(filterParams);
        this.data = filterData(this.data, query);
        // selasa 21:00 data cuman 1?
        // console.log(this.data)
        return this.data;
    }

}

module.exports = KiriHistory;
