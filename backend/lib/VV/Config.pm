package VV::Config;
use strict;  
use warnings;

=head1 NAME

VV::Config - The VeryVault Configuration

=head1 SYNOPSIS

 use VV:Config;

 my $parser = VV::Config->new(file=>'/etc/vv/system.cfg');

 my $cfg = $parser->parse_config();
 my $pod = $parser->make_pod();

=head1 DESCRIPTION

Configuration reader for Extopus

=cut

use Carp;
use Config::Grammar;
use Mojo::Base -base;

use POSIX qw(strftime);

has 'file';
    

=head1 METHODS

All methods inherited from L<Mojo::Base>. As well as the following:

=cut

=head2 $x->B<parse_config>(I<path_to_config_file>)

Read the configuration file and die if there is a problem.

=cut

sub parse_config {
    my $self = shift;
    my $cfg_file = shift;
    my $parser = $self->_make_parser();
    my $cfg = $parser->parse($self->file) or croak($parser->{err});
    my %ret;
    for my $item ( sort { $cfg->{$a}{_order} <=> $cfg->{$b}{_order} } grep /^ITEM:/, keys %$cfg ) {
        next if not $item =~ /ITEM:(\S+)/;
        my $itemKey = $1;
        my $itemCfg = $cfg->{$item};
        push @{$ret{itemList}}, $itemKey;
        for my $key (qw(icon name shared_access lable_js)){
             $ret{items}{$itemKey}{$key} = $itemCfg->{$key};
        }
        for my $field ( sort { $itemCfg->{$a}{_order} <=> $itemCfg->{$b}{_order} } grep /^FIELD:/, keys %$itemCfg ) {
            next if not $field =~ /FIELD:(\S+)/;
            my $fieldKey = $1;
            my $fieldCfg = $itemCfg->{$field};
            push @{$ret{items}{$itemKey}{fieldList}}, $fieldKey;
            $ret{items}{$itemKey}{fields}{$fieldKey} = $fieldCfg;
        }
        delete $cfg->{$item};
    }
    $cfg->{DATA} = \%ret;
    return $cfg;
}

=head2 $x->B<make_config_pod>()

Create a pod documentation file based on the information from all config actions.

=cut

sub make_pod {
    my $self = shift;
    my $parser = $self->_make_parser();
    my $E = '=';
    my $footer = <<"FOOTER";

${E}head1 COPYRIGHT

Copyright (c) 2012 by OETIKER+PARTNER AG. All rights reserved.

${E}head1 LICENSE

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

${E}head1 AUTHOR

S<Tobias Oetiker E<lt>tobi\@oetiker.chE<gt>>

${E}head1 HISTORY

 2011-04-19 to 1.0 first version

FOOTER
    my $header = $self->_make_pod_header();    
    return $header.$parser->makepod().$footer;
}



=head2 $x->B<_make_pod_header>()

Returns the header of the cfg pod file.

=cut

sub _make_pod_header {
    my $self = shift;
    my $E = '=';
    return <<"HEADER";
${E}head1 NAME

vv.cfg - The VeryVault cofiguration file

${E}head1 SYNOPSIS

 *** GENERAL ***
 database_dir = /var/lib/vv/database
 cookie_secret = Secret Cookie Password
 log_file = /var/log/vv.log

 *** HELLO ***
 # these keys are only used during the association process
 # they may be removed later
 tobi\@oetiker.ch = MyAssociationKey
 some\@other.user = OtherAssociationKey

 *** ITEM:password ***

 icon = apps/preferences-security
 name = Passwords
 # public_access = rw | ro | cr | no (default)
 shared_access = no
 # the item object holds all the items elements
 # for encrypted (cr) items the element content will be replaces
 # by *** while the decryption key is not entered ...
 # when you try to open an item you will be prompted for the key
 # until the right key is provided
 label_js = item.title

 +FIELD:title
 label = Title
 type = text

 +FIELD:login
 label = Login
 type = text

 +FIELD:password
 label = Password
 type = text

 +FIELD:note
 label = Note
 type = textarea
 optional = yes

 *** ITEM:time ***
 icon = apps/preferences-clock
 name = Time Tracker
 shared_access = ro

 +FIELD:job
 label = Job
 type = text

 +FIELD:time
 label = Timer
 type = timer  

 *** ITEM:smart ***
 item = categories/system
 name = SMART Track
 shared_access = ro

 +FIELD:date
 label = date
 type = date

 +FIELD:who
 type = select
 cfg_pl = qw(ok oe st ge fy to mo rp rw)
 label = Who

 +FIELD:dest
 type = text
 label = Where

 +FIELD:dist
 type = text
 label = Distance (km)

${E}head1 DESCRIPTION

VeryVault configuration is based on L<Config::Grammar>. The following options are available.

HEADER

}

=head2 $x->B<_make_parser>()

Create a config parser for DbToRia.

=cut

sub _make_parser {
    my $self = shift;
    my $E = '=';

    my $grammar = {
        _sections => [ qw{GENERAL HELLO /ITEM:\s*\S+/ }],
        _mandatory => [qw(GENERAL)],
        GENERAL => {
            _doc => 'Global configuration settings for VeryVault',
            _vars => [ qw(database_dir cookie_secret log_file) ],
            _mandatory => [ qw( database_dir cookie_secret log_file) ],
            database_dir => { _doc => 'location to store your VeryVault database',
                _sub => sub {
                    if ( not -d $_[0] ){
                        return "Cache directory $_[0] does not exist";
                    }
                    return undef;
                }
            },
            cookie_secret => { _doc => 'secret for signing mojo cookies' },
            log_file => { _doc => 'write a log file to this location (unless in development mode)'},
        },
        HELLO => {
            _doc => <<DOC_END,
List of association email - key combinations used as user associate their devices with the server.
The email address, once associated is stored in an encrypted cookie on the users browser.
If the cookie is lost, the user has to re-associate by providing the secret listed here.
DOC_END
            _vars => [ qw(/[^\s\@]+\@[^\s\@]+/) ],
            '/[^\s\@]+\@[^\s\@]+/' => { 
                _doc => 'email address associated with a user association key.',
            },
        },
        '/ITEM:\s*\S+/' => {
            _doc => 'Setup items for storage in the database',
            _vars => [ qw(icon name shared_access label_js) ],
            _sections => [ qw(/FIELD:\s*\S+/) ],
            _order => 1,
            _madatory => [ qw(name) ],
            icon => { _doc => 'which icon to associate with the item' },
            name => { _doc => 'what to call items of this type' },
            shared_access => { 
                _doc => 'should other users get access to these items',
                _re => '(ro|rw|cr|no)',
                _default => 'no',
                _example => 'ro',
                _re_error => 'pick one of cr, ro, rw or no'
            },
            label_js => {
                _doc => 'Java Script expression used to build the content of the label in the item overview. The item object is called item',
                _example => 'item.label'
            },
            '/FIELD:\s*\S+/' => {
                _doc => 'Content field for the item',
                _order => 1,
                _vars => [ qw(label type optional cfg_pl) ],
                _mandatory => [ qw(label) ],
                label => { _doc => 'what to call the field' },
                type => { 
                    _doc => 'what type of information to prompto for. Choose one of text, textarea, date, timer, select',
                    _re => '(text|textarea|date|timer|select)',
                    _re_error => 'choose one of text, textarea, date, timer',
                    _default => 'text'
                },
                optional => {
                    _doc => 'By default all fields are required. Make this one optional',
                    _re => '(yes|no)',
                    _re_error => 'choose yes or now',
                    _default => 'no'
                },
                cfg_pl => {
                    _doc => 'widget dependent perl fragment with configuration information',
                    _sub => sub {
                        my $c = eval $_[0]; 
                        if ($@){ 
                            return "Failed to compile $_[0]: $@" 
                        } else { 
                            $_[0] = $c 
                        } 
                        return undef;
                    }
                }
            }
        }
    };
    my $parser =  Config::Grammar->new ($grammar);
    return $parser;
}

1;
__END__

=head1 SEE ALSO

L<Config::Grammar>

=head1 COPYRIGHT

Copyright (c) 2011 by OETIKER+PARTNER AG. All rights reserved.

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

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY

 2011-02-19 to 1.0 first version

=cut

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

