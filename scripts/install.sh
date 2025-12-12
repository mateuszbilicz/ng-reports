#!/usr/bin/env bash

# Creator: Mateusz Bilicz
# Last updated: 10.12.2025 08:02

echo "This installer is created specifically for Ubuntu 22.04 server or Zorin OS 16. All installed programs are described with comments to installation URLs inside this file below each install function."
echo "Programs to install:"
echo " - MongoDB Server 8.0"
echo " - NVM"
echo " - NodeJS v24.8.0"
echo " - PNPM"
echo " - NestJS 11"
echo " - Angular 21"
echo " - PM2"
read -p "Are you sure that you want to run installation? (y/N): " confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1

installSucceedFor=()
installFailedFor=()

# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
installMongoDB()
{
  echo "Installing MongoDB 8.0 Server..."
  sudo apt-get install gnupg curl
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
     sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
     --dearmor
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  echo "MongoDB 8.0 Server installed successfully!"
}

# https://github.com/nvm-sh/nvm?tab=readme-ov-file#install--update-script
installNVM()
{
  echo "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  echo "NVM installed and initialized successfully!"
}

# https://github.com/nvm-sh/nvm?tab=readme-ov-file#set-default-node-version
installNodeJS()
{
  echo "Installing NodeJS v24.8.0..."
  nvm install v24.8.0
  nvm alias default v24.8.0
  echo "NodeJS v24.8.0 installed successfully!"
}

# https://pnpm.io/installation
installPNPM()
{
  echo "Installing PNPM..."
  curl -fsSL https://get.pnpm.io/install.sh | sh -
  echo "PNPM installed successfully!"
}

# https://docs.nestjs.com/first-steps
installNestJS()
{
  echo "Installing NestJS 11..."
  npm install -g @nestjs/cli@11.0.1
  echo "NestJS 11 installed successfully!"
}

# https://angular.dev/installation
installAngular()
{
  echo "Installing Angular 21..."
  npm install -g @angular/cli@21.0.2
  echo "Angular 21 installed successfully!"
}

# https://pm2.io/docs/runtime/guide/installation/
installPM2()
{
  echo "Installing PM2..."
  npm install pm2 -g
  echo "PM2 installed successfully!"
}

installationProgressCoverage()
{
  $1 "test"
  if [[ $? -ne 0 || $commandOutput == *"string"* || $commandOutput == *"strong"* ]]; then
    installFailedFor+=($1)
  else
    installSucceedFor+=($1)
  fi
}

showInstallationInfo()
{
  echo "-----------------------------"
  echo "    Installation results"
  echo "-----------------------------"
  if [ "${#installSucceedFor[@]}" -ne 0 ]; then
    echo "Installation succeeded for:"
    for succeeded in "${installSucceedFor[@]}"; do echo " - $succeeded"; done
  else
    echo "Nothing succeeded."
  fi
  echo ""
  if [ "${#installFailedFor[@]}" -ne 0 ]; then
    echo "Installation failed for:"
    for failed in "${installFailedFor[@]}"; do echo " - $failed"; done
  else
    echo "Nothing failed."
  fi
  echo "-----------------------------"
  if ["${#installFailedFor[@]}" -eq 0]; then
    echo "Starting post-install script..."
    sudo ./post-install.sh
    echo "Post-install script finished."
  fi
}

installationProgressCoverage installMongoDB
installationProgressCoverage installNVM
installationProgressCoverage installNodeJS
installationProgressCoverage installPNPM
installationProgressCoverage installNestJS
installationProgressCoverage installAngular
installationProgressCoverage installPM2

showInstallationInfo