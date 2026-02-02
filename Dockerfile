FROM ubuntu:22.04

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Volta
RUN curl https://get.volta.sh | bash

# Set Volta environment variables
ENV VOLTA_HOME /root/.volta
ENV PATH $VOLTA_HOME/bin:$PATH

# Install Node.js and npm using Volta
RUN volta install node@22 npm

# アプリファイルコピー
COPY package*.json ./
RUN npm install
COPY . .

# ポート開放
EXPOSE 3000
