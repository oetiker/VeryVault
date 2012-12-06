package VV::Store;

=head1 NAME

VV::Store - data store object

=head1 SYNOPSIS

 use VV::Store;

 my $store = VV::Store->new(
        storeRoot => $cfg->{GENERAL}{database_dir},
 );

 $store->getItems(lastSync);
 
 $store->storeItems([item,item]);

 $store->removeItem(itemId,lastChange);

=head1 DESCRIPTION

Provide a simple key value data store with a few methods to save and
retrieve items.

=cut


use Mojo::Base -base;
use DBI;
use Mojo::JSON;
use Carp;
use Encode;
use VV::Exception qw(mkerror);
use File::Spec;

=head2 ATTRIBUTES

The store objects supports the following attributes

=cut

=head3 user

the username of the curent store user. Only items belonging to that user or
those where the item configuration provides appropriate rights can be
accessed by the user.

=cut

has 'user';

=head3 storeRoot

path to the directory to store our database

=cut

has storeRoot  => sub { croak "storeRoot is a mandatory property" };

has app => sub { croak "app must point to the app object" };

has json => sub { Mojo::JSON->new };

has dbh => sub {
    my $self = shift;
    my $path = File::Spec->catfile($self->storeRoot,'VeryVault.sqlite');
    my $dbh = DBI->connect_cached("dbi:SQLite:dbname=$path","","",{
         RaiseError => 1,
         PrintError => 1,
         AutoCommit => 1,
         ShowErrorStatement => 1,
         sqlite_unicode => 1,
    });
    return $dbh;
};

has encodeUtf8  => sub { find_encoding('utf8') };

has json        => sub {Mojo::JSON->new};


=head2 B<new>(I<config>)

Create an EP::nodeCache object.

=over

=item B<storeRoot>

Directory to store the databases.

=back

=cut


sub new {
    my $self =  shift->SUPER::new(@_);
    my $sth = $self->dbh->table_info(undef,'%','%','TABLE',{});
    my $tables = $sth->fetchall_hashref('TABLE_NAME');
    $self->createTables() unless exists $tables->{vault};
    return $self;
}

=head2 createTables

crate the cache tables

=cut

sub createTables {
    my $self = shift;
    my $dbh = $self->dbh;
    # cache tables
    $dbh->begin_work();
    $dbh->do(<<SQL_END);
CREATE TABLE user ( 
    user_id INTEGER PRIMARY KEY,
    user_name TEXT UNIQUE NOT NULL
)
SQL_END

    $dbh->do(<<SQL_END);
CREATE TABLE vault ( 
    vault_id INTEGER PRIMARY KEY,
    vault_user INTEGER NOT NULL,
    vault_savetime INTEGER NOT NULL,
    vault_updatetime INTEGER NOT NULL,
    vault_type TEXT NOT NULL,
    vault_data TEXT NOT NULL  
    FOREIGN KEY(vault_user) REFERENCES user(user_id)
)
SQL_END

    # list of ids that have been removed from the vault
    $dbh->do(<<SQL_END);
CREATE TABLE fluff (
    fluff_id INTEGER PRIMARY KEY,
    fluff_rmtime INTEGER NOT NULL
);
SQL_END

    $dbh->commit();
    return;
}


=head2 $store->getItems(lastSync);

Returns all the items from the vault that have been added or modified since
the given date. Items of types not listed in the configuration or where the
user has no access permissions are not returned.

Return

 [
   { id: number,
     savetime: epoch-seconds,
     updatetime: epoch-seconds,
     type: string,
     readonly: boolean,
     data: {
        key1: value1,
        key2: value2,
        ...
     },
   },
   { id: number,
     rmtime: epoch-sconds
   }
 ]

=cut

sub getItems {
    my $self = shift;
    my $lastSync = shift;    
    my $dbh = $self->dbh;
    my $cfg = $self->app->cfg;
    my $user = $self->user;
    my $updated = $dbh->selectall_arrayref("SELECT * FROM vault WHERE vault_savetime > ?",{ Slice => {} },$lastSync);
    my @return;
    for my $item (@$updated){
        my $itemcfg =  $cfg->{DATA}{$item->{vault_type}} or next;
        my $ro = ($item->{vault_user} ne $user and $itemcfg->{shared_access} eq 'ro');
        if ( $item->{vault_user} eq $user or $itemcfg->{shared_access} ~~ [qw(rw ro)] ){
            push @return, {
                id => $item->{vault_id},
                savetime => $item->{vault_savetime},
                updatetime => $item->{vault_updatetime},
                type => $item->{vault_type},
                readonly => $ro,
                data => $item->{vault_data},
            }    
        }
    }
    my $removed = $dbh->selectall_arrayref("SELECT * FROM fluff WHERE fluff_rmtime > ?",{ Slice => {} },$lastSync); 
    for my $item (@$removed){
        push @return, {
            id => $item->{fluff_id},
            rmtime => $item->{fluff_rmtime}
        }
    }
    return \@return;    
}    
 
=head2 $store->storeItem(item);

The item is identified by its id and their 'savetime'. The Item can only be
saved when id and savetime match and if the logged-in user together with the
access privileges in the item definition permit the save.

New items are identified by not having an id.

Input:

  {
    id: numeric | null,
    savetime: epoch-seconds,
    updatetime: epoch-seconds,
    type: string,
    data: { }
  }

Return:
  
  {
    id: numeric,
    savetime: epoch-seconds
  }

=cut

sub storeItem {
    my $self = shift;
    my $item = shift;
    my $dbh = $self->dbh;
    my $cfg = $self->app->cfg;
    my $user = $self->user;
    my $savetime = time;
    my $data = $self->json->encode($item->{data});
    die mkerror(394994,"Data type $item->{type} is not known") unless defined $cfg->{DATA}{$item->{type}};
    my $id = $item->{id};
    if (not $id){
        $dbh->do("INSERT INTO vault (vault_user,vault_savetime,vault_updatetime,vault_type,vault_data) VALUES(?,?,?,?,?)",{},
                $user,$savetime,$item->{updatetime},$item->{type},$data);
        $id = $dbh->last_insert_id("","","","");
    } 
    else {
        my $rows = $dbh->do(<<SQL_END,{},$user,$savetime,$item->{updatetime},$data,$item->{id},$user,$cfg->{DATA}{$item->{type}}{shared_access} ~~ 'rw');
UPDATE vault 
   SET vault_user = ?, 
       vault_savetime = ?, 
       vault_updatetime = ?, 
       vault_data = ?  
 WHERE vault_id = ? 
   AND ( vault_user = ? OR ? = 1) 
   AND vault_type = ? 
   AND vault_savetime = ?
SQL_END
        if ($rows == 0){
            die mkerror(2394,"Failed to update, maybe you have to sync your copy first");
        }
    }     
    return { id => $id, savetime => $savetime };
}

=head2 $store->removeItem(itemId,lastsave);

Remove the given item. The request will succeed if item id and lastsave match or if the item has been removed already.

=cut


sub removeItem {
    my $self = shift;
    my $id = shift;
    my $savetime = shift;
    my $dbh = $self->dbh;
    my $user = $self->user;
    my $cfg = $self->app->cfg;    
    $dbh->begin_work;
    my $vaultType = $dbh->selectrow("SELECT vault_type FROM vault WHERE vault_id = ?",{},$id);
    my $time = time;
    if ($vaultType){
        my $rows = $dbh->do("DELETE FROM vault WHERE vault_id = ? AND vault_savetime = ? AND ( vault_user = ? OR ? = 1 )",{},$id,$savetime,$user,$cfg->{DATA}{$vaultType}{shared_access} ~~ 'rw');
        if ($rows == 0) {
            $dbh->rollback;
            die mkerror(2394,"Failed to remove, maybe you do not have the necessary priviledges");
        }
        $dbh->do("INSERT INTO fluff (fluff_id,fluff_rmtime) VALUE(?,?)",{},$id,$time);
    }
    $dbh->commit;
    return {$id,$time};
}


1;

__END__

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

Copyright (c) 2011 by OETIKER+PARTNER AG. All rights reserved.

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY

 2010-11-04 to 1.0 first version

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

