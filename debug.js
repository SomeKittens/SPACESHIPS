var benchmarks;

module.exports = function(io) {
  io.route('debug-start', function() {
    benchmarks = [];
  });

  return true;
};