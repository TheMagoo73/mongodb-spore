module.exports = verboseOutput;
function verboseOutput(verbose) {
  this._verbose = verbose;
}

verboseOutput.prototype.log = function (message) {
    if(this._verbose === true)
      console.log(message);
}
