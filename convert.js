const marp = require('./marp-cli/marp-cli.js').default;

async function compile(filename) {
    return await marp(['--no-stdin', '--template=bespokeSlideshow', `--bespoke.syncurl=/sync/${filename}`, `${__dirname}/slides/${filename}`]);
}

module.exports = compile;
