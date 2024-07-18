async function improvedRegression(regressionFn, data, lengthMultiplierFunction) {
    if (data.length > 5) {
        let results = [];
        for (let i = 0; i < data.length - 5; i++) {
            const result = regressionFn([...data].splice(i));
            var lengthMultiplierValue;
            await new Promise((resolve, reject) => {
                lengthMultiplierFunction(result.points.length, (err, value) => {
                    if (err) {
                        reject(Error(`invalid length multiplier property: ${err.message}`));
                    } else {
                        lengthMultiplierValue = value;
                        resolve();
                    }
                });
            });

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
