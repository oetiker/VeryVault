package VV;
use Mojo::Base 'Mojolicious';


# This method will run once at server start
sub startup {
    my $self = shift;

    # Documentation browser under "/perldoc"
    $self->plugin('PODRenderer');

    # Routes
    my $r = $self->routes;
    $self->plugin('VV::DocPlugin', {
        root => '/doc',
        index => 'VV::Index',
           template => Mojo::Asset::File->new(
            path=>$self->home->rel_file('templates/doc.html.ep')
        )->slurp,
    });                                                             
}

1;
