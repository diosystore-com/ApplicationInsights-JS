//
// This script wrap the generated api dts file with a oneDS namespace and copyright notice the version
//
//  node ../../scripts\dtsgen.js ./dist-es5/applicationinsights-web.d.ts 'Microsoft.ApplicationInsights' ./
//
const fs = require("fs");
const path = require("path");

function parseArgs(expectedArgs) {
    var passedArgs = process.argv;
    var theArgs = {
        "$script" : passedArgs[1]
    };

    for (var lp = 0; lp < expectedArgs.length; lp++) {
        var argIdx = 2 + lp;
        var expArg = expectedArgs[lp];
        var value = expArg.value;
        if (passedArgs.length > argIdx) {
            value = passedArgs[argIdx];
            if (value && value.length > 2 && (
                    (value[0] === "'" && value[value.length - 1] === "'") ||
                    (value[0] === '"' && value[value.length - 1] === '"')
                    )) {
                value = value.substring(1, value.length - 1);
            }
        }
        if (expArg.isSwitch) {
            // Convert to boolean
            value = !!value;
        }

        theArgs[expArg.name] = value;
    }

    return theArgs;
}

var theArgs = parseArgs([
    { name: "skuName", value: null},                        // The Sku name to place in the copyright notice
    { name: "projectPath", value: "./"},                    // The root path for the project
    { name: "dtsFile", value: ""},                          // [Optional] The generated Dts file (if cannot be derived from the package.json)
    { name: "hidePrivate", value: false, isSwitch: true},   // [Optional] Switch to hide private properties and functions
]);

if (!theArgs.skuName) {
    throw "Missing skuName";
}

var projectPath = path.resolve(process.cwd(), theArgs.projectPath)
var packagePath = path.resolve(theArgs.projectPath, "package.json");
console.log(`Using Package: ${packagePath}, current path cwd ${process.cwd()}`);

var packageJson = require(packagePath);
if (!packageJson || !packageJson.version) {
    throw `Missing package.json or version from [${packagePath}]`
}

var version = packageJson.version
var author = packageJson.author || "";
var homepage = packageJson.homepage || "";
var packageName = packageJson.name
packageName = packageName.replace('@microsoft/', '').replace('/', '_');

var rollupPath = "dist";
var rollupExt = ".rollup";
var namespacePath = "dist";
var namespaceExt = "";

var rollupNote = 
    " * use this version if your build environment doesn't support the using the\n" +
    " * individual *.d.ts files or the namespace wrapped version.\n";

if (!theArgs.dtsFile) {
    theArgs.dtsFile = path.resolve(projectPath, "dist", `${packageName}.d.ts`);
    if (!fs.existsSync(theArgs.dtsFile)) {
        theArgs.dtsFile = path.resolve(projectPath, "build/dts", `${packageName}.d.ts`);
        rollupPath = "types";
        rollupExt = "";
        namespacePath = "types";
        namespaceExt = ".namespaced"
        rollupNote = 
            " * if you require a namespace wrapped version it is also available.\n";

        // Make sure the destination path exists
        var dtsDestPath = path.resolve(projectPath, rollupPath);
        if (!fs.existsSync(dtsDestPath)) {
            fs.mkdirSync(dtsDestPath);
        }
    }
}

var dtsFileNamespaced = path.resolve(projectPath, namespacePath, `${packageName}${namespaceExt}.d.ts`)
var dtsFileRollup = path.resolve(projectPath, rollupPath, `${packageName}${rollupExt}.d.ts`)

var rollupContent = 
    "/*\n" +
    ` * ${theArgs.skuName}, ${version}\n` +
    " * Copyright (c) Microsoft and contributors. All rights reserved.\n" +
    " *\n" +
    ` * ${author}\n` +
    ` * ${homepage}\n`;

var newContent = rollupContent +
    " */\n\n" +
    "declare namespace ApplicationInsights {";

rollupContent += 
    " *\n" +
    " * ---------------------------------------------------------------------------\n" +
    " * This is a single combined (rollup) declaration file for the package,\n" +
    rollupNote +
    ` * - Namespaced version: ${namespacePath ? namespacePath + "/" : ""}${packageName}${namespaceExt}.d.ts\n` +
    " * ---------------------------------------------------------------------------\n" +
    " */\n";

console.log(`Transforming: ${theArgs.dtsFile}`);

fs.readFile(theArgs.dtsFile, (err, data) => {
    if (err) {
        console.error(err);
        throw `Failed to read .d.ts file [${theArgs.dtsFile}]`;
    } else {
        processFile(data.toString());
    }
});

function processFile(dtsContents) {
    console.log("File...");
    // console.log(dtsContents);

    // Read the generated dts file and append to the new content
    var lastLine = ""

    // Prefix every line with 4 spaces (indenting the lines)
    var lines = dtsContents.split("\n");
    console.log(`Lines: ${lines.length}`);
    // console.log(dtsContents);

    lines.forEach((line) => {
        // Trim whitespace from the end of the string
        var rollupLine = line.replace(/(\s+$)/g, '');

        if (line && line.trim().length > 0) {
            // Remove exports and declares
            line = line.replace('export declare ', '');
            line = line.replace('declare ', '');
            line = line.replace('export { }', '');

            // Trim whitespace from the end of the string
            line = line.replace(/(\s+$)/g, '');

            if (theArgs.hidePrivate) {
                // Hide private properties and functions
                line = line.replace(/(^\s+)private (.*);/, '$1// private $2;');
                rollupLine = rollupLine.replace(/(^\s+)private (.*);/, '$1// private $2;');
            }

            rollupContent +=  `\n${rollupLine}`;
            newContent += `\n    ${line}`;
        } else if (lastLine) {
            // Only add 1 blank line
            rollupContent += "\n"
            newContent += "\n"
        }

        lastLine = line
    });

    // Add final trailing closing bracket for the namespace
    newContent += "\n}";

    fs.writeFile(dtsFileRollup, rollupContent, (err, data) => {
        if (err) {
            console.error(err);
            throw `Failed to write ${dtsFileRollup}`;
        }
    });

    fs.writeFile(dtsFileNamespaced, newContent, (err, data) => {
        if (err) {
            console.error(err);
            throw `Failed to write ${dtsFileNamespaced}`;
        }
    });
}
