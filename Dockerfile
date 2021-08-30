FROM node:15-buster

WORKDIR /usr/app

# Install cmake, openssl & build-essential
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y cmake
RUN apt-get install -y python make gcc g++
RUN apt-get install -y openssl
RUN apt-get install -y build-essential
RUN apt-get install -y libncurses5
RUN apt-get install -y llvm-dev libclang-dev clang

# Install RUST
RUN apt-get install -y rustc
RUN curl https://sh.rustup.rs -sSf -m 1 | sh -s -- -y
ENV PATH "$HOME/.cargo/bin:$PATH"

# Install NPM packages
COPY package.json .
RUN npm install --quiet

# Move complete working directory to docker without docker-compose.yml
COPY . .
RUN rm -f ./docker-compose.yml

# Install @iota/streams-wasm library for npm
RUN git clone https://github.com/iotaledger/streams.git && \
    cd streams && \
    # git checkout tags/1.1.0 && \
    # git checkout feat/wasm-binding && \
    cd bindings/wasm && \
    sed -i '49s/.*/"wasm2wat": "^1.1.1"/' package.json && \
    export PATH="$HOME/.cargo/bin:$PATH" && \
    npm install && \
    npm run build:nodejs && \
    cd ../../.. && \
    npm install ./streams/bindings/wasm/wasm-node

#Open Port to the World
EXPOSE 3000

# Set startup script
CMD [ "npm", "start" ]

