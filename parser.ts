// const json = '{"name": "John", "age": 31, "city": {"name": {"value": "Seattle", "country":"United States", "language": {"name": "English","code": "EN"}}}, "Graduate": "null", "nums":["1","2",{"val":3,"text":[{"val":"3","text":"three"}]}]}';
const json = '{"values":[{"values":[{"values":[{"values":[{"values":[{"values":[{"values":[{"values":[{"values":[{"values":[{"key":"1","text":"one"},{"key":"2","text":"two"}]}]}]}]}]}]}]}]}]}]}';

function iTypeSense(text: any) {
    text = text.trim();

    if (text === "false") {
        return false;
    } else if (text === "true") {
        return true;
    } else if (text === "null") {
        return null;
    } else if (text === "undefined") {
        return undefined;
    } else {
        const num = parseFloat(text);

        if (!isNaN(num)) {
            return num;
        }
    }

    return text;
}

function _parse(index: number, json: any, context: string): any {

    let obj: any = {};
    let text = "";
    let pretext = "";
    let array: any[] = [];

    let i = index;
    while (i < json.length) {
        if (json[i] !== " ") {
            if (json[i] === "{") {
                // start of an object context
                if (context === "object" || context === "prevalue") {
                    return _parse(i + 1, json, "object");
                } else if (context === "arrayprevalue") {
                    const [_obj, next] = _parse(i + 1, json, "object");
                    i = next;
                    array.push(_obj);
                    continue;
                }
            } else if (json[i] === "[") {
                // start of array context
                if (context === "value" || context === "prevalue") {
                    return _parse(i + 1, json, "arrayprevalue");
                }
            } else if (json[i] === '"') {
                if (context === "key" && json[i + 1] === ":") {
                    // end of key
                    return [text, i + 2];
                } else if (context === "prevalue") {
                    // start of value
                    return _parse(i + 1, json, "value");
                } else if (context === "arrayprevalue") {
                    // start of value
                    context = "arrayvalue";
                    ++i;
                    continue;
                } else if ((context === "value" || context === "arrayvalue") && json[i + 1] === ",") {
                    // end of value
                    if (context === "value") {
                        return [text, i + 2];
                    } else {
                        array.push(text);
                        text = "";
                        context = "arrayprevalue";
                        i += 2;
                        continue;
                    }
                } else if (context === "object") {
                    const [key, next] = _parse(i + 1, json, "key");
                    const [value, next2] = _parse(next, json, "prevalue");
                    obj[key] = value;
                    i = next2 - 1;
                }
            } else if (json[i] === "}") {
                // end of object and value
                if (context === "value" || context === "prevalue") {
                    return [context === "value" ? text : iTypeSense(pretext), i];
                } else if (context === "object") {
                    return [obj, i + 1];
                }
            } else if (json[i] === "," && context === "prevalue") {
                // end of prevalue (non string values)
                return [iTypeSense(pretext), i + 1];
            } else if (json[i] === "," && context === "arrayprevalue") {
                // end of prevalue for array
                const _parsedText = iTypeSense(pretext);
                if (_parsedText) {
                    array.push(_parsedText);
                }

                pretext = "";
                ++i;
                continue;
            } else if (json[i] === "]") {
                // end of array context
                if (context === "arrayprevalue") {
                    const _parsedText = iTypeSense(pretext);

                    if (_parsedText) {
                        array.push(_parsedText);
                    }
                } else if (context === "arrayvalue") {
                    array.push(text);
                }

                return [array, i + 1];
            }
        }

        if (context !== "object" && context !== "array" && json[i] != `"`) {
            if (context === "prevalue" || context === "arrayprevalue") {
                pretext += json[i];
            } else {
                text += json[i];
            }
        }

        ++i;
    }

    return context === "object" ? [obj, i] : [text, i];
}

function parse(json: any){
    return _parse(0, json, "object");
}


// execution

(function main() {
    console.log(parse(json));
}());
