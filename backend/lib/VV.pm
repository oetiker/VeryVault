package VV;

=head1 NAME

VV - the mojo application starting point

=head1 SYNOPSIS

 use VV;
 use Mojolicious::Commands;

 $ENV{MOJO_APP} = VV->new;
 # Start commands
 Mojolicious::Commands->start;

=head1 DESCRIPTION

Configure the mojo engine to run our application logic as webrequests arrive.

=head1 ATTRIBUTES

=cut

use Mojo::Base 'Mojolicious';

use VV::RpcService;
use VV::Config;

=head2 cfg

A hash pointer to the parsed extopus configuraton file. See L<VV::Cfg> for
synta x. The default configuration file is located in etc/extopus.cfg. You
can override the path by setting the C<VV_CONF> environment variable.

The cfg property is set automatically on startup.

=cut

has 'cfg' => sub {
    my $self = shift;
    my $conf = VV::Config->new( 
        file=> ( $ENV{VV_CONF} || $self->home->rel_file('etc/veryvault.cfg') )
    );
    return $conf->parse_config();
};

=head2 startup

Mojolicious calls the startup method at initialization time.

=cut

# This method will run once at server start
sub startup {
    my $self = shift;
    my $gcfg = $self->cfg->{GENERAL};
    $self->secret($gcfg->{cookie_secret});
    if ($self->mode ne 'development'){
        $self->log->path($gcfg->{log_file});
    }
    # tinker with the environment in such a way, that mojo
    # figures the corect path we are exposed under
    $self->hook( before_dispatch => sub {
        my $self = shift;
        my $uri = $self->req->env->{SCRIPT_URI} || $self->req->env->{REQUEST_URI};
        my $path_info = $self->req->env->{PATH_INFO};
        $uri =~ s|/?${path_info}$|/| if $path_info and $uri;
        $self->req->url->base(Mojo::URL->new($uri)) if $uri;
    });

    # Routes
    my $r = $self->routes;
    $self->plugin('VV::DocPlugin', {
        root => '/doc',
        index => 'VV::Index',
        template => Mojo::Asset::File->new(
            path=>$self->home->rel_file('templates/doc.html.ep')
        )->slurp,
    });

    my $service = VV::RpcService->new( app => $self );

    $self->plugin('qooxdoo_jsonrpc',{
        prefix => '/',
        services => {
            vv => $service
        }
    }); 
}

1;

=head1 LICENSE

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=head1 COPYRIGHT

Copyright (c) 2012 by OETIKER+PARTNER AG. All rights reserved.

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY

 2012-04-25 to 1.0 first version

=cut

# Emacs Configuration
#
# Local Variables:
# mode: cperl
# eval: (cperl-set-style "PerlStyle")
# mode: flyspell
