# Clean Environment Validation Test

This directory contains tests that validate `@qwickapps/server` can be installed and used correctly in a completely clean environment.

## Purpose

Before publishing to npm, we need to ensure:

1. **All exports work** - Core functions, plugins, and types are properly exported
2. **TypeScript types resolve** - No missing type definitions
3. **Plugin system works** - Built-in plugins can be imported and configured
4. **HealthManager functions** - Health check system is accessible
5. **No hidden dependencies** - Package doesn't rely on monorepo internals

## Running the Validation

```bash
# From the package root
npm run validate:clean-install

# Or directly
./qa/clean-install/validate.sh
```

## What It Does

1. **Builds the package** - Creates npm tarball
2. **Runs Docker container** - Fresh Node.js environment
3. **Creates TypeScript project** - Standard TS setup
4. **Installs package** - From local tarball (like npm would)
5. **Compiles TypeScript** - Verifies types resolve
6. **Runs the code** - Verifies runtime functionality

If any step fails, the validation fails and publishing should be blocked.

## Test Application

The `test-app.ts` file tests major functionality:

- `createControlPanel` factory function
- `HealthManager` class
- Built-in plugin creators (health, logs, config, diagnostics)
- Type definitions for config, plugins, and health checks
- Custom plugin interface

## Requirements

- Docker must be installed and running
- Package must be buildable (`npm run build` must pass)

## Troubleshooting

### "Cannot find module '@qwickapps/server'"
The package wasn't installed correctly. Check the npm pack output.

### "Property 'X' does not exist"
Check that the export exists in src/index.ts.

### TypeScript compilation errors
Verify that all types are properly exported and the API matches test expectations.
