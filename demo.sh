echo "DB_USER=\"afm_interplanetary_server\"" > .env;
echo "DB_PASS=\"\$uperStrongP@ssw0rd\"" >> .env;
echo "SESSION_SECRET=\"mY\$ecre7\"" >> .env;

mysql -u root < demo.sql

npm start
