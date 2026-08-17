/**
 * @typedef {number} Integer
 */
/**
 * `FileList` polyfill.
 */
class FileList {
  /**
   * Set private properties and length.
   * @param {File[]} files Files to include.
   */
  constructor (files) {
    this._files = files;
    this.length = this._files.length;
  }
  /**
   * @param {Integer} index
   * @returns {File}
   */
  item (index) {
    return this._files[index];
  }
  /* eslint-disable class-methods-use-this -- API */
  /**
   * @returns {"FileList"}
   */
  get [Symbol.toStringTag] () {
    /* eslint-enable class-methods-use-this -- API */
    return 'FileList';
  }
}
export default FileList;
