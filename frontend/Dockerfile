FROM node:22-alpine

RUN adduser -D appuser
WORKDIR /app
RUN chown appuser:appuser /app

USER appuser

COPY --chown=appuser:appuser package.json package-lock.json ./
RUN npm ci

COPY --chown=appuser:appuser . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
