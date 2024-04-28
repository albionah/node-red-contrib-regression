function improvedRegression(regressionFn, data, lengthMultiplierFunction) {
    const X = 0;
    const Y = 1;

    if (data.length > 15) {
        let results = [];
        for (let i = 0; i < data.length - 15; i++) {
            const result = regressionFn([...data].splice(i));
            var lengthMultiplierValue;
            lengthMultiplierFunction(result.points.length, (err, value) => {
                if (err) {
                    throw new Error("invalid length multiplier property");
                } else {
                    lengthMultiplierValue = value;
                }
            });
            result.r2Length = result.r2 * lengthMultiplierValue; //(Math.log10(100 + result.points.length) - 1);
            results.push(result);
        }
        results = results.sort((a, b) => a.r2Length < b.r2Length ? 1 : -1);
        return results[0];
    } else {
        return regressionFn(data);
    }
}

module.exports = improvedRegression;
