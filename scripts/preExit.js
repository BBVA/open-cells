const fs = require('fs');
const { exec } = require('child_process');

const preFile = '.changeset/pre.json';

fs.access(preFile, fs.constants.F_OK, (err) => {
  if (err) {
    // file does not exists so no need to do pre exit
    console.log(`Pre exit not done`);
  } else {
    // file exists so do pre exit
    console.log('Pre exit...');
    exec(`npx changeset pre exit`, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(stdout);
      console.error(stderr);
    });
  }
});
