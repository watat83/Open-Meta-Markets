const axios = require("axios");
const fs = require('fs')
const util = require('util');
const fetch = require("node-fetch");
// Convert fs.readFile && fs.writeFile into Promise versions of same    
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const cheerio = require('cheerio')

const {
    MAPBOX_API_BASE,
    MAPBOX_KEY,
    HERE_KEY,
    HERE_GEOCODE_API_BASE
} = process.env;

const fetchUrl = async (siteUrl) => {
    const result = await axios.get(siteUrl);
    return cheerio.load(result.data);
};

module.exports = {
    UtilsArray: {
        intersect: (a, b) => {
            var setA = new Set(a);
            var setB = new Set(b);
            var intersection = new Set([...setA].filter(x => setB.has(x)));
            return Array.from(intersection);
        },
        groupBy: (array, keys) => {
            return array.reduce((r, o) => {
                const key = keys.map(k => o[k]).join('|');
                (r[key] = r[key] || []).push(o);
                return r;
            }, {});
        },
        groupBy2: (array, key) => {
            return array.reduce((r, a) => {
                (r[a[String(key)]] = r[a[String(key)]] || []).push(a);
                return r;
            }, {});
        },
        sortBy: (data, filter, order = 'DESC') => {
            if (order === 'DESC') {
                return data.sort((a, b) => {
                    if (a[filter] instanceof String && b[filter] instanceof String) {
                        return a[filter].toLowerCase() < b[filter].toLowerCase() ? 1 : -1;
                    } else {
                        return a[filter] < b[filter] ? 1 : -1;
                    }
                });
            } else {
                return data.sort((a, b) => {
                    if (a[filter] instanceof String && b[filter] instanceof String) {
                        return a[filter].toLowerCase() > b[filter].toLowerCase() ? 1 : -1;
                    } else {
                        return a[filter] > b[filter] ? 1 : -1;
                    }
                });
            }
        },
        sortByNestedProperty: (nestedPropChain, arr, order = 'ASC') => {
            nestedPropChain = nestedPropChain.split('.');
            var len = nestedPropChain.length;

            if (order === 'ASC') {
                arr.sort(function (a, b) {
                    var i = 0;
                    while (i < len) {
                        a = a[nestedPropChain[i]];
                        b = b[nestedPropChain[i]];
                        i++;
                    }
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                return arr;
            } else if (order === 'DESC') {
                arr.sort(function (a, b) {
                    var i = 0;
                    while (i < len) {
                        a = a[nestedPropChain[i]];
                        b = b[nestedPropChain[i]];
                        i++;
                    }
                    if (a < b) {
                        return 1;
                    } else if (a > b) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                return arr;
            }
        },
        search: (row) => {
            return Object.keys(this).every((key) => row[key] && row[key] != null && row[key].toLowerCase() === this[key].toLowerCase());
        },
        filter: (array, field, value) => {
            let filtered = array.filter(e => {
                return e[field] === value
            })
            return filtered;
        },

        searchArrayOfObjectsBy2FieldsAnd2Values: (arr, field1, field2, value1, value2) => {
            var result = arr.find(obj => {
                if (field2 && value2) {
                    return obj[field1] === value1 && obj[field2] === value2;
                } else if (!field2 && !value2) {
                    return obj[field1] === value1;
                }
            })
            return result;
        },
        findMinMax: (arr, field) => {

            if (field === undefined || field == null || field === '') {
                let min = arr[0],
                    max = arr[0];

                for (let i = 1, len = arr.length; i < len; i++) {
                    let v = arr[i];
                    min = (v < min) ? v : min;
                    max = (v > max) ? v : max;
                }
                return [min, max];

            } else {
                let min = arr[0][field],
                    max = arr[0][field];

                for (let i = 1, len = arr.length; i < len; i++) {
                    let v = arr[i][field];
                    min = (v < min) ? v : min;
                    max = (v > max) ? v : max;
                }
                return [min, max];
            }
        },
        findMax: (arr, field) => arr.reduce((m, x) => m[field] > x[field] ? m : x),
        findMin: (arr, field) => arr.reduce((m, x) => m[field] < x[field] ? m : x),
        sum: (arr, field) => {
            return arr.reduce((a, b) => {
                return a + b[field];
            }, 0);
        }
    },
    UtilsObject: {
        flattenObject: async (obj) => {
            const flattened = {}

            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    Object.assign(flattened, flattenObject(obj[key]))
                } else {
                    flattened[key] = obj[key]
                }
            })

            return flattened
        }
    },
    UtilsString: {
        subCompare: (needle = '', haystack = '', min_substring_length) => {

            let need = needle;
            let hay = haystack;

            if (need.length > hay.length) {
                const tmp = need;
                need = hay;
                hay = tmp;
            }
            // Min substring length is optional, if not given or is 0 default to 1:
            min_substring_length = min_substring_length || 1;

            // Search possible substrings from largest to smallest:
            for (var i = need.length; i >= min_substring_length; i--) {
                for (j = 0; j <= (need.length - i); j++) {
                    var substring = need.substr(j, i);
                    var k = hay.indexOf(substring);
                    if (k != -1) {
                        return {
                            found: 1,
                            substring: substring,
                            needleIndex: j,
                            haystackIndex: k
                        }
                    }
                }
            }
            return {
                found: 0
            }
        }
    },
    WebScraper: {
        url: async (url, tagPath = '') => {
            const html = await fetchUrl(url);
            const content = await html((tagPath))
            return content;
        },
    },
    Location: {
        explodeAddress: async (address) => {
            let obj;
            const url = (MAPBOX_API_BASE + '/mapbox.places/' + address + '.json?access_token=' + MAPBOX_KEY).toString();
            const geocodedObj = await axios(url);
            obj = geocodedObj;
            // console.log(MAPBOX_KEY);
            // console.log(obj);
            if (!geocodedObj) {
                // console.log('nothing');
            }

            return obj;
        },
        explodeAddressWithHere: async (address) => {
            let obj;
            const url = (HERE_GEOCODE_API_BASE + '?q=' + encodeURIComponent(address) + '&apiKey=' + HERE_KEY).toString();
            const geocodedObj = await axios(url);
            // obj = geocodedObj.data['items'][0];
            // console.log(MAPBOX_KEY);
            // console.log(obj);
            if (!geocodedObj) {
                // console.log('nothing')
            }

            // console.log(obj)
            return geocodedObj;
        }
    },
    Task: {
        updateFile: async (period = 12, filePath) => {
            let cron = require('node-schedule');
            let rule = new cron.RecurrenceRule();
            rule.hour = period;
            rule.minute = 0;
            cron.scheduleJob(rule, function () {

                // console.log(new Date(), 'Every 12 hours');
            });
        },
    },
    File: {
        readJSON: async (filePath, /** cb */ ) => {
            try {
                return readFile(filePath)
            } catch (err) {
                // console.log(err)
                return
            }

            // fs.readFile(filePath, (err, fileData) => {
            //     if (err) {
            //         return cb && cb(err)
            //     }
            //     try {
            //         const object = JSON.parse(fileData)
            //         return cb && cb(null, object)
            //     } catch(err) {
            //         return cb && cb(err)
            //     }
            // })
        },
        writeJSON: async (filePath, data) => {

            try {
                // let json;
                if (typeof data === 'string') {
                    writeFile(filePath, data)
                } else {
                    data = JSON.stringify(data, null, 2)
                    writeFile(filePath, data)
                }
                return 'json written';
            } catch (err) {
                // console.log(err)
                // return
            }

            // fs.readFile(filePath, (err, fileData) => {
            //     if (err) {
            //         return cb && cb(err)
            //     }
            //     try {
            //         const object = JSON.parse(fileData)
            //         return cb && cb(null, object)
            //     } catch(err) {
            //         return cb && cb(err)
            //     }
            // })
        },
        csvToJSON: async (csv) => {

            var lines = csv.split("\n");

            var result = [];

            var headers = lines[0].split(",");

            for (var i = 1; i < lines.length; i++) {

                var obj = {};
                var currentline = lines[i].split(",");

                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }

                result.push(obj);

            }

            return result; //JavaScript object
            // return JSON.stringify(result); //JSON
        },
        csvToJSONFromURL: async (url) => {
            return fetch(url)
                .then(function (response) {
                    return response.ok ? response.text() : Promise.reject(response.status);
                })
                .then(function (text) {
                    return text;
                }).then(function (value) {
                    var lines = value.split("\n");

                    var result = [];

                    var headers = lines[0].split(",");

                    for (var i = 1; i < lines.length; i++) {

                        var obj = {};
                        var currentline = lines[i].split(",");

                        for (var j = 0; j < headers.length; j++) {
                            obj[headers[j]] = currentline[j];
                        }

                        result.push(obj);

                    }
                    // console.log(json)
                    return (result)
                })
        }
    },
    Network: {
        isLocal: async (req) => {
            return (req.connection.localAddress === req.connection.remoteAddress);
        },
        setHost: async (req) => {
            let host = '';
            if (req.connection.localAddress === req.connection.remoteAddress) {
                host = 'http://' + req.headers.host;
                // console.log('req.headers', req.headers)
            } else {
                host = 'https://' + req.headers.host;
                // console.log('req.headers', req.headers)
            }
            return host;
        }
    }
};