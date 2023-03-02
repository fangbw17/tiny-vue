import languageTranslator from "./LanguageTranslator";
import Debug from "./Debug";

const debug = new Debug(new languageTranslator())
window['debug'] = debug