/* eslint no-underscore-dangle: 0 */
const _ = require('lodash');

class executeOrder {
  constructor(blockNum, txid, rawLog) {
    if (!_.isEmpty(rawLog)) {
      this.blockNum = blockNum;
      this.txid = txid;
      this.rawLog = rawLog;
      this.decode();
    }
  }

  decode() {
    this.orderId = this.rawLog._id.toString(10);
    this.time = this.rawLog._time.toString(10);
  }

  translate() {
    return {
      status: 'CONFIRMED',
      orderId: this.orderId,
      time: this.time,
    };
  }
}

module.exports = executeOrder;
