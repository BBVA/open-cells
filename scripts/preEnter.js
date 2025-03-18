const fs = require('fs');
const { exec } = require('child_process');

console.log(`Current directory: ${process.cwd()}`);
const preFile = '.changeset/pre.json';

// get tag from command line argument or use 'rc' as default
const tag = process.argv[2] || 'rc';

const enterPre = () => {
  exec(`npx changeset pre enter ${tag}`, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  });
};

fs.access(preFile, fs.constants.F_OK, (err) => {
  if (err) {
    // file does not exists so we can do pre enter
    console.log(`Pre enter not done. Entering pre mode with tag: ${tag}...`);
    enterPre();
  } else {
    // file exists so check if mode is pre
    fs.readFile(preFile, 'utf8', (readError, data) => {
      if (readError) {
        console.error(`Error reading ${preFile}: ${readError}`);
        return;
      }
      try {
        const preData = JSON.parse(data);
        if (preData.mode === 'pre') {
          // mode is pre so no need to do pre enter
          console.log('Pre mode is already active. No action taken.');
        } else {
          // mode is not pre so do pre enter
          console.log('Pre file exists but mode is not "pre". Action needed.');
          enterPre();
        }
      } catch (parseError) {
        console.error(`Error parsing ${preFile}: ${parseError}`);
      }
    });
  }
});
