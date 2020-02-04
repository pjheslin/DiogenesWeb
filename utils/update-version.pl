#!/usr/bin/perl -w
use strict;
use warnings;
use utf8;

my $file = "Version";
open(my $fh, "<", $file) or die "Can't open $file: $!";
my $version = (<$fh>);
chomp $version;
print "Version: $version\n";
close $fh or die "Can't close $file: $!";
