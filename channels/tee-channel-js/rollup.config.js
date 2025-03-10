import { createConfig } from "../../rollup.base.config";
import { updateDistEsmFiles } from "../../tools/updateDistEsm/updateDistEsm";

const version = require("./package.json").version;
const browserEntryPointName = "applicationinsights-teechannel-js";
const browserOutputName = "applicationinsights-teechannel-js";
const entryPointName = "applicationinsights-teechannel-js";
const outputName = "applicationinsights-teechannel-js";
const banner = [
  "/*!",
  ` * Application Insights JavaScript SDK - Tee Channel, ${version}`,
  " * Copyright (c) Microsoft and contributors. All rights reserved.",
  " */"
].join("\n");

const replaceValues = {
  "// Copyright (c) Microsoft Corporation. All rights reserved.": "",
  "// Licensed under the MIT License.": ""
};


updateDistEsmFiles(replaceValues, banner, true, true, "dist-es5");

export default createConfig(banner, 
  {
    namespace: "Microsoft.ApplicationInsights3",
    version: version,
    node: {
      entryPoint: entryPointName,
      outputName: outputName
    },
    browser: {
      entryPoint: browserEntryPointName,
      outputName: browserOutputName
    }
  },
  [ "applicationinsights-teechannel-js" ]
);
