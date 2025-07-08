#!/bin/bash
echo -e "\033[33;5;7mrunning entrypoint.sh. wait for copy node_modules dependencies ...\033[0m"
cp -r /usr/src/app-build/node_modules/. /usr/src/app/node_modules/
echo "exited $0"
exec "$@"