/**
 * Copyright 2018 Dean Cording
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {

    var regression = require('regression');
    var util = require('util');
    var improvedRegression = require('./improvedRegression');

    var setNodeProperty = function(field, type, node, msg, value) {
        if (type === 'msg') {
            RED.util.setMessageProperty(msg,field,value);
        } else if (type === 'flow') {
            node.context().flow.set(field,value);
        } else if (type === 'global') {
            node.context().global.set(field,value);
        }
    };


    class RegressionNode {
        constructor(config) {
            RED.nodes.createNode(this, config);

            this.dataSetMinSize = ((config.dataSetMinSize != undefined) ? config.dataSetMinSize : 0) * 1;
            this.dataSetMaxSize = ((config.dataSetMaxSize != undefined) ? config.dataSetMaxSize : 0) * 1;
            this.regressionType = config.regressionType || "linear";
            this.options = {};
            this.options.order = Math.round((config.polynomialOrder || 2) * 1);
            this.options.precision = Math.round((config.precision || 2) * 1);
            this.xInputField = config.xInputField || "payload.x";
            this.xInputFieldType = config.xInputFieldType || "msg";
            this.yInputField = config.yInputField || "payload.y";
            this.yInputFieldType = config.yInputFieldType || "msg";
            this.yOutputField = config.yOutputField || "payload.y";
            this.yOutputFieldType = config.yOutputFieldType || "msg";
            this.functionOutputField = config.functionOutputField;
            this.functionOutputFieldType = config.functionOutputFieldType || "none";
            this.resultOnly = (config.resultOnly != undefined) ? config.resultOnly : true;

            this.data = [];
            this.function = undefined;

            if (this.dataSetMinSize < 0) {
                this.dataSetMinSize = 0;
            }

            if (this.dataSetMaxSize < 0) {
                this.dataSetMaxSize = 0;
            }

            if (this.regressionType != "polynomial") {
                this.options.order = 2;
                config.polynomialOrder = 2;
            }

            this.status({});

            this.on('input', this.onInput.bind(this));
        }

        saveData(x, y) {
            if (x != undefined) {
                if (Array.isArray(x)) {
                    x.forEach(function (element) {
                        if (Array.isArray(element)) {
                            saveData(element[0],element[1]);
                        }
                    });
                } else {
                    x = parseFloat(x);
                    y = parseFloat(y);
                    if (!isNaN(x) && !isNaN(y)) {
                        this.data.push([x,y]);

                        if (this.dataSetSize > 0) {
                            while (this.data.length > this.dataSetSize) {
                                this.data.shift();
                            }
                        }
                    }
                }
            }
        };

        onInput(msg) {
            var x = RED.util.evaluateNodeProperty(this.xInputField, this.xInputFieldType, node, msg);
            var y = RED.util.evaluateNodeProperty(this.yInputField, this.yInputFieldType, node, msg);

            if (((x != undefined) && (y != undefined)) || Array.isArray(x)) {
                this.saveData(x,y);

                const Y = 1;
                let minIndex = this.data.length - 1;
                let maxIndex = this.data.length - 1;
                for (let i = 0; i < this.data.length - 1; i++) {
                    if (this.data[i][Y] <= this.data[minIndex][Y]) {
                        minIndex = this.data[i];
                    }
                    if (this.data[i][Y] >= this.data[maxIndex][Y]) {
                        maxIndex = this.data[i];
                    }
                }
                let startIndex = Math.max(minIndex, maxIndex);
                this.data.reduce((prev, curr) => {
                    return prev[Y] < curr[Y] ? prev : curr;
                });

                const regressionFn = (data) => regression[this.regressionType](data, this.options);
                this.function = improvedRegression(regressionFn, this.data);

                if (!isNaN(this.function.equation[0])) {
                    delete this.function.points;
                    this.status({text:this.function.string});
                    setNodeProperty(this.functionOutputField, this.functionOutputFieldType, node, msg, this.function);

                    if (!Array.isArray(x)) {
                        setNodeProperty(this.yOutputField, this.yOutputFieldType, node, msg,
                                        this.function.predict(x)[1]);
                    }
                }
                if (!this.resultOnly) {
                    this.send(msg);
                }
            } else if (x != undefined) {
                x = parseFloat(x);

                if (!isNaN(x) && (this.function != undefined)) {
                    setNodeProperty(this.yOutputField, this.yOutputFieldType, node, msg,
                                    this.function.predict(x)[1]);
                    this.send(msg);
                }
            } else {
                // Empty input signal to clear data
                this.data = [];
                this.line = undefined;
            }
        }
    }

    RED.nodes.registerType("regression",RegressionNode);
};
