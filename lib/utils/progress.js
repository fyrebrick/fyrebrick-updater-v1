const cliProgress = require('cli-progress');

module.exports = new cliProgress.MultiBar({
  clearOnComplete: true,
  hideCursor: true,
  stopOnComplete: true,
  format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | {description}'
}, cliProgress.Presets.shades_grey);