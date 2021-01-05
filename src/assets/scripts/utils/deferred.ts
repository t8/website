export default class Deferred {
  promise: Promise<any>;
  reject: any;
  resolve: any;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
