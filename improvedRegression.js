function prumerXProcentNahoru(pole, procento) {
    pole.sort((a, b) => b - a);
    const pocetPrvku = Math.ceil(pole.length * (procento / 100));
    const orezanePole = pole.slice(0, pocetPrvku);
    const prumer = orezanePole.reduce((akumulator, aktualniHodnota) => akumulator + aktualniHodnota, 0) / pocetPrvku;

    return prumer;
}

function improvedRegression(regressionFn, data) {
    const X = 0;
    const Y = 1;
    // let minIndex = data.length - 1;
    // let maxIndex = data.length - 1;
    // for (let i = 0; i < data.length - 1; i++) {
    //     if (data[i][Y] <= data[minIndex][Y]) {
    //         minIndex = i;
    //     }
    //     if (data[i][Y] >= data[maxIndex][Y]) {
    //         maxIndex = i;
    //     }
    // }
    // let startIndex = Math.max(minIndex, maxIndex);
    // data.reduce((prev, curr) => {
    //     return prev[Y] < curr[Y] ? prev : curr;
    // });

    if (data.length > 15) {
        let results = [];
        console.log(data.length - 15)
        for (let i = 0; i < data.length - 15; i++) {
            const result = regressionFn([...data].splice(i));
            // result.r2Max = 1 / Math.max(...result.points.map(
            //     (evaluatedPoint, index) => Math.pow(evaluatedPoint[Y] - data[i+index][Y], 2))
            // );
            result.r2Length = result.r2 * Math.pow(1.005, result.points.length);
            results.push(result);
        }
        // results.sort((a, b) => a.r2 > b.r2);
        // const averageR2 = prumerXProcentNahoru(results.map((result) => result.r2), 99);
        // const averageR2Max = prumerXProcentNahoru(results.map((result) => result.r2Max), 99);
        results = results
            // .filter((result) => result.r2 > averageR2)
            // .filter((result) => result.r2Max > averageR2Max)
            .sort((a, b) => a.r2Length < b.r2Length ? 1 : -1);
        for (let i = 0; i < 3; i++) {
            results[i].points = results[i].points.length;
            console.log(results[i]);
        }
        return results[0];
    } else {
        return regressionFn(data);
    }
}

module.exports = improvedRegression;
