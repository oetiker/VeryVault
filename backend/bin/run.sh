#! /bin/sh
export QX_SRC_MODE=1
exec ./vv.pl daemon --listen 'https://*:18486'
