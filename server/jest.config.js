const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset({ tsconfig: "tsconfig.json" }).transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  collectCoverage:true,
  transform: {
    ...tsJestTransformCfg,
  },
};