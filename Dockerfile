FROM nginx:1.23-alpine

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./dist/operador-front-end /usr/share/nginx/html
COPY asistente.cer /etc/ssl/certs/
COPY asistente.key /etc/ssl/private/

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]