//  map
const c2eMap = {
    你好: "hello",
    "调用 patch": "call patch function",
};

const e2cMap = {
    hello: "你好",
};

export default class languageTranslator {
    private currentLanguage: string;
    constructor() {
        this.currentLanguage = "cn";
    }

    private get currentMap(): any {
        return this.currentLanguage === "cn" ? e2cMap : c2eMap;
    }

    transition(text) {
        const result = this.currentMap[text];
        return result ? result : text
    }
}
