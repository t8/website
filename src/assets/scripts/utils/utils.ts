export default class Utils {

  static async pause(timeout: number = 500) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), timeout);
    });
  }

  static async capitalize(str: string) {
    try {
      str = str.replace(/([A-Z])/g, ' $1').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}); 
    } catch (e) {}

    return str;
  }

  static async isArTx(str: string): Promise<boolean> {
    return /^[a-z0-9-_]{43}$/i.test(str);
  }

  static formatMoney(amount: number, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-" : "";
  
      let i = parseInt((amount = Math.abs(Number(amount) || 0)).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - (+i)).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e);
    }
  }

  static stripTags(str: any) {
    if(typeof str === 'object') {
      for(let key in str) {
        str[this.stripTags(key)] = this.stripTags(str[key]);
      }
    }

    return str;
  }

  static stripHTML(str: string) {
    return str.replace(/<\/?[^>]*>/gi, '');
  }

  static escapeScriptStyles(str: string) {
    str = str.replace(/onload="?[^>]+/gi, '');
    return str.replace(/<(\/?(script|style|iframe))[^>]*>/gi, '&lt;$1$2&gt;');
  }
}