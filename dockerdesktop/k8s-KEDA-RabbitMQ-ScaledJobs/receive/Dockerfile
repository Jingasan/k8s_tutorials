##### Build environment #####
FROM node:18-alpine as builder

# ビルド
COPY node /node
WORKDIR /node
RUN npm install
RUN npm run build


##### Production environment #####
FROM node:18-alpine as releaser

# インストール
COPY --from=builder /node /node
WORKDIR /node
ENTRYPOINT ["node", "dist/index.js"]