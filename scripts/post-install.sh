sudo -i
mkdir /data
sudo chmod -R 777 /data
echo "Created /data directory with access for all users"
mkdir /data/log
mkdir /data/db
mkdir /data/db/ng-reports
mkdir /data/cfg
echo "Created database directories inside /data"
cp ./database/ng-reports-db.yaml /data/cfg/ng-reports-db.yaml
echo "Copied database config into /data/cfg/ng-reports-db.yaml"