# 1 - Executação do projeto em modo de desenvolvimento
-Crie um arquivo .env na raiz do projeto de acordo com os valores do arquivo de exemplo;
-Verifique se o serviço `api_rest_development` do arquivo docker-compose.yml está descomentado. Caso não esteja, descomente. O serviço `api_rest_production` precisa estar comentado para não ter conflito. Por padrão, o serviço `api_rest_production` já está comentado;
-Para executar o projeto em modo de desenvolvimento com apenas um comando, basta executar o comando na raiz do projeto `npm run db:up`;
Obs.: vão ser criado dois containers, um para o banco de dados e outro para a aplicação. Após o container da aplicação ser criado, ele ficará fazendo testes tcp com a porta 3306 a cada 10 segundos e quando estabelecer conexão, irá iniciar a aplicação. Então espere alguns segundos, antes de utilizar a aplicação, após ser criado o container, para dar tempo do banco de dados e aplicação iniciarem.

# 2 - Executação do projeto em modo de produção
-Crie um arquivo .env na raiz do projeto de acordo com os valores do arquivo de exemplo;
-Verifique se o serviço `api_rest_production` do arquivo docker-compose.yml está descomentado. Caso não esteja, descomente. O serviço `api_rest_development` precisa estar comentado para não ter conflito;
-Para executar o projeto em modo de produção com apenas um comando, basta executar o comando na raiz do projeto `npm run db:up`;
Obs.: vão ser criado dois containers, um para o banco de dados e outro para a aplicação. Após o container da aplicação ser criado, ele ficará fazendo testes tcp com a porta 3306 a cada 10 segundos e quando estabelecer conexão, irá iniciar a aplicação. Então espere alguns segundos, antes de utilizar a aplicação, após ser criado o container, para dar tempo do banco de dados e aplicação iniciarem.

# 3 - Execução dos testes unitários
-Executar o comando `npm test`, sem as aspas, na raiz do projeto backend. Obs.: esse comando só funciona em modo de desenvolvimento.