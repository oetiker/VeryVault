#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../thirdparty/lib/perl5";
use lib "$FindBin::Bin/../lib";
# use lib qw() # PERL5LIB
use Mojolicious::Commands;
use VV;

our $VERSION = "0";

local $ENV{MOJO_APP} = VV->new;

# Start commands
Mojolicious::Commands->start;
