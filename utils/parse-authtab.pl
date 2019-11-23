#!/usr/bin/perl -w
use strict;
use warnings;
use utf8;
use open qw(:std :utf8);
use XML::LibXML;

my @authtabs = @ARGV;
die "Error: list authtab files on command-line." unless @authtabs;

my $out = '{';

foreach my $authtab (@authtabs) {
  open my $fh, "<$authtab" or die $!;
  my $contents;
  {
    local $/ = undef;
    $contents = <$fh>;
  }
  my $parser = XML::LibXML->new({huge=>1});
  my $doc = $parser->parse_string($contents);
  my $root = $doc->documentElement();
  my $corpus = $root->getAttribute('corpus');
  $out .= qq{"$corpus": \{\n};
  foreach my $auth_node ($root->childNodes) {
    next if $auth_node->nodeType == 3; # text (whitespace)
    die $auth_node->nodeName unless $auth_node->nodeName eq 'author';
    my $auth_name = $auth_node->getAttribute('name');
    $auth_name =~ s/"/\\"/g;
    # print "$auth_name\n";
    my $auth_num = $auth_node->getAttribute('n');
    foreach my $work_node ($auth_node->childNodes) {
      next if $work_node->nodeType == 3; # text (whitespace)
      die $work_node->nodeName unless $work_node->nodeName eq 'work';
      my $work_name = $work_node->getAttribute('name');
      $work_name =~ s/"/\\"/g;
      my $work_num = $work_node->getAttribute('n');
      # print "  $work_name\n";

      my $filename = $corpus.$auth_num.$work_num.'.xml';
      $out .= qq{"$filename": ["$auth_name", "$work_name"],\n};
    }
  }
  $out .= "},\n";
}
$out .= "}\n";

open my $fh, ">index.json" or die $!;
print $fh $out;
close $fh;
