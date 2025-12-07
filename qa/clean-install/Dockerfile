# Clean Environment Test for @qwickapps/server
# This Dockerfile simulates a fresh installation environment

FROM node:20-slim

ARG TARBALL

WORKDIR /app

# Copy and install the package tarball
COPY ${TARBALL} ./package.tgz
RUN npm init -y && \
    npm pkg set type="module" && \
    npm install ./package.tgz

# Copy test files
COPY qa/clean-install/test-app.ts ./test-app.ts
COPY qa/clean-install/tsconfig.json ./tsconfig.json

# Install TypeScript and compile
RUN npm install typescript @types/node @types/express --save-dev && \
    npx tsc --noEmit

# Run the test
RUN node --loader ts-node/esm test-app.ts || npx tsx test-app.ts
