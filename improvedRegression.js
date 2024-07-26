async function improvedRegression(regressionFn, data, lengthMultiplierFunction) {
    const X = 0;
    const Y = 1;

    if (data.length > 5) {
        let results = [];
        for (let i = 0; i < data.length - 5; i++) {
            const result = regressionFn([...data].splice(i));
            const lengthMultiplierValue = lengthMultiplierFunction(result.points.length);

            result.r2Length = result.r2 * lengthMultiplierValue;
            results.push(result);
        }
        results = results.sort((a, b) => a.r2Length < b.r2Length ? 1 : -1);
        return results[0];
    } else {
        return regressionFn(data);
    }
}

module.exports = improvedRegression;
