#!/usr/bin/perl -w
use strict;
use warnings;
use feature qw/say/;
use XML::LibXML;

# The title/author of CSEL works is not indicated in the TEI header, but by a
# CTS URN given in the n attribute of the main div.  This reference needs to be
# resolved to a title.  In the absence of a public record of the meaning of the
# stoa numbers (apparently from a Stoa Inventory of Latin Literature), we have
# to look at info embedded in the XML header.  Oddly, some headers seem to
# pertain to a different print volume entirely and omit to resolve this
# reference, the meaning of which has to be sought in the header of another XML
# file.  So we build a general table of references here, and then correct it for
# the many errors in the data.

my %seen;
my $regex = '-lat\\d*\\.xml$';
my @dirs = ("static/texts/CSEL");
while (my $pwd = shift @dirs) {
  opendir(DIR,"$pwd") or die "Cannot open $pwd\n";
  my @files = readdir(DIR);
  closedir(DIR);
  foreach my $file (@files) {
    next if $file =~ /^\.\.?$/;
    my $path = "$pwd/$file";
    if (-d $path) {
      next if $seen{$path};
      $seen{$path} = 1;
      push @dirs, $path;
    }
    else {
      if ($path =~ m#$regex#) {
        print $path, "\n";
        parse($path);
      }
    }
  }
}

sub parse {
  my $path = shift;
  open my $fh, '<', $path or die $!;
  binmode $fh; # drop all PerlIO layers possibly created by a use open pragma
  my $dom = XML::LibXML->load_xml(IO => $fh, no_network => 1, recover => 2);
  my $xpc = XML::LibXML::XPathContext->new($dom);
  $xpc->registerNs('tei', "http://www.tei-c.org/ns/1.0");

  foreach my $author_node ($xpc->findnodes("//tei:titleStmt/author"),
  $xpc->findnodes("//tei:sourceDesc//tei:author")) {
    next unless $author_node->to_literal();
    my $author = $author_node->to_literal();
    say $author;
  }
}
