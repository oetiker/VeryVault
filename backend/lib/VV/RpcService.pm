package VV::RpcService;

use Mojo::Base -base;
use VV::Exception qw(mkerror);

=head1 NAME

VV::RpcService - RPC services for VV

=head1 SYNOPSIS

This module provides the backend rpc services for VeryVault. See L<VV::Store> for details
on the storage methods.

=head1 DESCRIPTION

the module provides the following attributes:

=head2 controller

pointing to the controller of the current request

=cut

has 'controller';

has 'app';

=head2 store

pointing to the data store object

=cut

has 'store' => sub {
    VV::Store->new(
        cfg=>$_[0]->app->cfg
    );
}

=pod

and the following methods:

=head2 allow_rpc_access(method)

is this method accessible?

=cut

our %allow = (
    associate => 1,
    getConfig => 2,
    getItems => 2,
    storeItem => 2,
    removeItem => 2,  
);


sub allow_rpc_access {
    my $self = shift;
    my $method = shift;
    if ($allow{$method} == 2){
        my $user = $self->controller->session('vvUser');
        die mkerror(3978,q{Your Device is not associated with the VeryVault Server. Please re-associate.}) unless defined $user;
    }
    return $allow{$method}; 
}
   

=head2 associate(email,password)

Associate the device with the veryvault server. You need the association password
in order todo that.

=cut

sub associate {
    my $self = shift;
    my $email = shift;
    my $password = shift;
    die mkerror(942,q{Provide your email address as your identification}) unless $email ~~ /^[^\s\@]+\@[^\s\@]+$/;
    my $hello_key = $self->app->cfg->{HELLO}{$email};
    die mkerror(4453,q{Provide a valid Access Key to associate with VeryVault}) unless $pass ~~ $hello_key;
    $self->controller->session('vvUser',$email);
}
    

=head2 getConfig()

get some gloabal configuration information into the interface

=cut

sub getConfig {
    my $self = shift;
    my $cfg = $self->app->cfg();
    return $cfg->{DATA};
}

=head2 getItems(lastSync)

See L<VV::Store>.

=cut  

sub getItems { 
    my $self = shift;    
    return $self->store->getItems(@_); 
}

=head2 storeItem(item)

See L<VV::Store>.

=cut  

sub storeItem { 
    my $self = shift;    
    return $self->store->storeItem(@_); 
}

=head2 removeItem(id,lastsave)

See L<VV::Store>.

=cut  

sub removeItem { 
    my $self = shift;    
    return $self->store->removeItem(@_); 
}


1;
__END__

=head1 COPYRIGHT

Copyright (c) 2011 by OETIKER+PARTNER AG. All rights reserved.

=head1 LICENSE

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY 

 2011-01-25 to Initial

=cut
  
1;

# Emacs Configuration
#
# Local Variables:
# mode: cperl
# eval: (cperl-set-style "PerlStyle")
# mode: flyspell
# mode: flyspell-prog
# End:
#
# vi: sw=4 et
