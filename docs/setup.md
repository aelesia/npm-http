# Initialization

https://medium.com/cameron-nokes/the-30-second-guide-to-publishing-a-typescript-package-to-npm-89d93ff7bccd

## tsconfig.json

    "compilerOptions": {
        "target": "esnext",
        "module": "esnext",
        "declaration": true,
        "outDir": "dist",
        "moduleResolution": "node",
    }

## package.json

    {
        "name": "@aelesia/http",
        "version": "0.1.1",
        "description": "Simplified wrapper for HTTP calls",
        "author": "aelesia",
        "license": "MIT",
        "repository": "https://github.com/aelesia/npm-http",
        "main": "dist/index.js",
        "types": "dist/index.d.ts",
        "scripts": {
            "prepublish": "tsc"
        }
    }

## Testing

### Link module
    npm link

### Link module from another project
    npm link @aelesia/http

## Publishing

    npm publish