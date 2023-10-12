[Unit]
Description=redis-server
After=network.target

[Service]
Type=forking

ExecStart=/tools/redis/bin/redis-server /tools/install/redis/redis.conf
PrivateTmp=true

[Install]
WantedBy=multi-user.target