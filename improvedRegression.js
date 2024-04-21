function improvedRegression(regressionFn, data) {
    const X = 0;
    const Y = 1;

    if (data.length > 15) {
        let results = [];
        for (let i = 0; i < data.length - 15; i++) {
            const result = regressionFn([...data].splice(i));
            result.r2Length = result.r2 * Math.pow(1.005, result.points.length);
            results.push(result);
        }
        results = results.sort((a, b) => a.r2Length < b.r2Length ? 1 : -1);
        return results[0];
    } else {
        return regressionFn(data);
    }
}

module.exports = improvedRegression;
