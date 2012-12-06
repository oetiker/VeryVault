#!/bin/bash

. `dirname $0`/sdbs.inc

for module in \
    Mojolicious \
    MojoX::Dispatcher::Qooxdoo::Jsonrpc \
    Mojo::Server::FastCGI \
    DBI \
    DBD::SQLite \
    Config::Grammar \
; do
    perlmodule $module
done

        
