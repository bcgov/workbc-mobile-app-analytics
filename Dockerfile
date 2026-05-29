# B.C. artifact mirror — align with other WorkBC images; override with node:24-alpine if needed.
ARG BASE_IMAGE=artifacts.developer.gov.bc.ca/docker-remote/node:24-alpine

FROM ${BASE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM ${BASE_IMAGE}
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# OpenShift restricted SCC uses an arbitrary UID; group 0 + g=u keeps /app readable/executable.
RUN chgrp -R 0 /app && chmod -R g=u /app
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/index.js"]
