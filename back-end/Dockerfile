FROM node:19-alpine As prod-build 
ENV PATH /back-end/node_modules/.bin:$PATH 

WORKDIR /back-end 

COPY . ./ 

RUN npm ci --production 
RUN npm run build 

FROM node:19-alpine As prod-run 
COPY --chown=node:node --from=prod-build /Sample/dist /Sample/ 

WORKDIR /Sample

ENV NODE_ENV production 
EXPOSE 3001 
USER node
CMD ["node", "index.js"]
