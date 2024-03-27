export default {
  // Specify the browser to use
  use: {
    browserName: 'chromium',
  },

  // Specify the directories where the tests are located
  testDir: './test',

  // Specify the directory where the test results should be stored
  outputDir: './output',

  // Specify other options as needed
  nodeResolve: true,
};
