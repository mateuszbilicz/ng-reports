echo "Starting NG Reports..."
if [ ! -d "./build/api"]; then
  echo "API is not built, installing dependencies and building projects..."
  pnpm i
  pnpm run build
fi
if [! -d "./build/client/browser"]; then
  echo "Client is not built, installing dependencies and building projects..."
  pnpm i
  pnpm run build
fi
if [! -d "./build/client-host"]; then
  echo "Client Host is not built, installing dependencies and building projects..."
  pnpm i
  pnpm run build
fi
echo "Setting up directories..."
mkdir ./build/client-host/public
cp ./build/client/browser ./build/client-host/public
cd ./build
echo "Starting processes..."
{ pm2 start ./api/main.js --name "NG Reports API"; } &
{ pm2 start ./client-host/app.js --name "NG Reports Client Host"; } &
{ echo "Started!" }