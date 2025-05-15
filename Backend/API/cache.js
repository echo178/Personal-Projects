export default class DataCache {
    constructor(fetchFunction) {
      this.cachedMonth = new Date().getUTCMonth();
      this.fetchFunction = fetchFunction;
      this.cache = null;
      this.getData = this.getData.bind(this);
      this.isCacheExpired = this.isCacheExpired.bind(this);
    }
    isCacheExpired() {
      return this.cachedMonth !== new Date().getUTCMonth();
    }
    getData() {
      if (!this.cache || this.isCacheExpired()) {
        return this.fetchFunction()
          .then((data) => {
          this.cache = data
          this.fetchDate = new Date();
          this.cachedMonth = new Date().getUTCMonth();
          return this.cache;
        });
      } else {
        return Promise.resolve(this.cache);
      }
    }
}
