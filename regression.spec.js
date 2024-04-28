const regression = require('regression');
const improvedRegression = require('./improvedRegression');
const csv = require('csv-parser');
const fs = require('fs');
const { Transform } = require('stream');
const { expect } = require('chai');

class CSVTransform extends Transform {
    constructor(options = {}) {
        super({ ...options, objectMode: true });
        this.buffer = '';
    }

    _transform(chunk, encoding, callback) {
        this.buffer += chunk.toString();
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop();

        lines.forEach(line => {
            const values = line.split(';');
            const parsedValues = values.map(val => isNaN(parseFloat(val)) ? val : parseFloat(val.replace(',', '.')));
            this.push(parsedValues);
        });

        callback();
    }

    _flush(callback) {
        if (this.buffer.length > 0) {
            const values = this.buffer.split(';');
            const parsedValues = values.map(val => isNaN(parseFloat(val)) ? val : parseFloat(val.replace(',', '.')));
            this.push(parsedValues);
        }
        callback();
    }
}


const lengthMultiplierFunction = (length, callback) => {

    callback(undefined, Math.log10(100 + length) - 1);
};

describe('Regression', () => {
    const regressionFn = (data) => regression.linear(data, { precision: 100 });

    describe('when graph is slowly raising but suddenly is dropping', () => {
        it('should catch just the drop', async () => {
            const X = 0;
            const Y = 1;
            const data = (await readCsv());//.slice(281370-1800, 281370);
            let end;
            for (let i = 0; i < data.length; i++) {
                if (data[i][X] === 1680955654)
                    end = i;
            }
            const start = end - 180;
            console.log("points indeces", start, end);
            console.log("points", new Date(data[start][X]*1000), new Date(data[end][X]*1000));
            console.log("points values", data[start][Y], data[end][Y]);
            const result = improvedRegression(regressionFn, data.slice(start, end), lengthMultiplierFunction);
            result.pointsNumber = result.points.length;
            delete result.points;
            console.log(result);
            expect(result.equation[0]).to.be.lessThan(-0);
        });
    });

    describe('when graph is dropping but then raising slowly', () => {
        it('should be positive', async () => {
            const X = 0;
            const Y = 1;
            const data = (await readCsv());//.slice(281370-1800, 281370);
            let start;
            for (let i = 0; i < data.length; i++) {
                if (data[i][X] === 1680955386)
                    start = i;
            }
            const end = start + 180;
            console.log("points indeces", start, end);
            console.log("points", new Date(data[start][X]*1000), new Date(data[end][X]*1000));
            console.log("points values", data[start][Y], data[end][Y]);
            const result = improvedRegression(regressionFn, data.slice(start, end), lengthMultiplierFunction);
            result.pointsNumber = result.points.length;
            delete result.points;
            console.log(result);
            expect(result.equation[0]).to.be.greaterThan(0);
        });
    });

    describe('when graph is stable', () => {
        it('should be almost zero', async () => {
            const X = 0;
            const Y = 1;
            const data = (await readCsv());//.slice(281370-1800, 281370);
            let start;
            for (let i = 0; i < data.length; i++) {
                if (data[i][X] === 1678584005)
                    start = i;
            }
            const end = start + 180;
            console.log("points indeces", start, end);
            console.log("points", new Date(data[start][X]*1000), new Date(data[end][X]*1000));
            console.log("points values", data[start][Y], data[end][Y]);
            const result = improvedRegression(regressionFn, data.slice(start, end), lengthMultiplierFunction);
            delete result.points;
            console.log(result);
            expect(result.equation[0]).to.be.lessThan(Math.abs(0.0001));
        });
    });

    describe('when graph drops and then raises', () => {
        it('should be positive', async () => {
            const X = 0;
            const Y = 1;
            const data = (await readCsv());//.slice(281370-1800, 281370);
            let start;
            for (let i = 0; i < data.length; i++) {
                if (data[i][X] === 1680955386)
                    start = i;
            }
            const end = start + 41;
            console.log("points indeces", start, end);
            console.log("points", new Date(data[start][X]*1000), new Date(data[end][X]*1000));
            console.log("points values", data[start][Y], data[end][Y]);
            const result = improvedRegression(regressionFn, data.slice(start, end), lengthMultiplierFunction);
            result.pointsNumber = result.points.length;
            delete result.points;
            console.log(result);
            expect(result.equation[0]).to.be.greaterThan(0);
        });
    });

    function readCsv() {
        return new Promise((resolve) => {
            const results = [];
            const csvTransform = new CSVTransform();

            fs.createReadStream('heating-status.csv')
                // .pipe(csv({separator: ";", headers: ["time", "temperature"]}))
                .pipe(csvTransform)
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                });
        });
    }
});
