#!/usr/bin/perl -w
use strict;
use warnings;
use feature qw/say/;
use XML::LibXML qw(:libxml);
use File::Path qw(remove_tree);
use open qw( :utf8 :std );
use utf8;

# chdir "../" or die $!;

my @corpora = ('Perseus_Greek', 'Perseus_Latin', 'Perseus_Translations', 'First1KGreek', 'DigiLibLT');
# my @corpora = ('First1KGreek');
# my @corpora = ('Perseus_Latin');
my %fileRegex = (
# Perseus_Greek => '-grc\\d*\\.xml$',
Perseus_Greek => '-grc\\d*\\.xml$',
Perseus_Latin => '-lat\\d*\\.xml$',
Perseus_Translations => '-eng\\d*\\.xml$',
DigiLibLT => '/dlt.*\\.xml$',
Misc => '\\.xml$',
First1KGreek => '-grc\\d*\\.xml$',
);
my %missing_authors = (
'static/texts/DigiLibLT/dlt000007/dlt000007.xml' => 'Corpus Hermeticum',
'static/texts/DigiLibLT/dlt000036/dlt000036.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000037/dlt000037.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000097/dlt000097.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000116/dlt000116.xml' => 'Rhetores Latini Minores',
'static/texts/DigiLibLT/dlt000143/dlt000143.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000149/dlt000149.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000178/dlt000178.xml' => 'Rhetores Latini Minores',
'static/texts/DigiLibLT/dlt000180/dlt000180.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000196/dlt000196.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000207/dlt000207.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000208/dlt000208.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000209/dlt000209.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000214/dlt000214.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000219/dlt000219.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000220/dlt000220.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000221/dlt000221.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000253/dlt000253.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000292/dlt000292.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000296/dlt000296.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000298/dlt000298.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000300/dlt000300.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000344/dlt000344.xml' => 'Mallius Theodorus',
'static/texts/DigiLibLT/dlt000364/dlt000364.xml' => 'Vatican Mythographer',
'static/texts/DigiLibLT/dlt000374/dlt000374.xml' => 'Geographi latini minores',
'static/texts/DigiLibLT/dlt000386/dlt000386.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000390/dlt000390.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000391/dlt000391.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000392/dlt000392.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000394/dlt000394.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000397/dlt000397.xml' => 'Panegyrici Latini',
'static/texts/DigiLibLT/dlt000405/dlt000405.xml' => 'Egeria',
'static/texts/DigiLibLT/dlt000406/dlt000406.xml' => '[Livy]',
'static/texts/DigiLibLT/dlt000410/dlt000410.xml' => 'Physiologus latinus',
'static/texts/DigiLibLT/dlt000426/dlt000426.xml' => '[Priscian]',
'static/texts/DigiLibLT/dlt000431/dlt000431.xml' => 'Geographi latini minores',
'static/texts/DigiLibLT/dlt000433/dlt000433.xml' => 'Rufinus',
'static/texts/DigiLibLT/dlt000444/dlt000444.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000452/dlt000452.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000453/dlt000453.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000454/dlt000454.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000458/dlt000458.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000459/dlt000459.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000463/dlt000463.xml' => 'Lactantius Placidus',
'static/texts/DigiLibLT/dlt000470/dlt000470.xml' => 'Servius',
'static/texts/DigiLibLT/dlt000487/dlt000487.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000493/dlt000493.xml' => 'Gromatici Veteres',
'static/texts/DigiLibLT/dlt000524/dlt000524.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000538/dlt000538.xml' => 'Probus',
'static/texts/DigiLibLT/dlt000542/dlt000542.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000544/dlt000544.xml' => 'Justin',
'static/texts/DigiLibLT/dlt000555/dlt000555.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000566/dlt000566.xml' => 'Vatican Mythographer',
'static/texts/DigiLibLT/dlt000573/dlt000573.xml' => '[Augustine]',
'static/texts/DigiLibLT/dlt000579/dlt000579.xml' => 'Rufinus',
'static/texts/DigiLibLT/dlt000583/dlt000583.xml' => 'Scholia',
'static/texts/DigiLibLT/dlt000592/dlt000592.xml' => 'Perpetua',
'static/texts/DigiLibLT/dlt000595/dlt000595.xml' => 'Anonymus',
'static/texts/DigiLibLT/dlt000603/dlt000603.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000604/dlt000604.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000605/dlt000605.xml' => 'Grammatici Latini',
'static/texts/DigiLibLT/dlt000610/dlt000610.xml' => 'Anonymus',

);

sub natural_sort {
  # Case insensitive
  my $aa = lc $a;
  my $bb = lc $b;
  my @a = split /(\d+)/, $aa;
  my @b = split /(\d+)/, $bb;
  my $M = @a > @b ? @a : @b;
  my $res = 0;
  for (my $i = 0; $i < $M; $i++) {
    return -1 if ! defined $a[$i];
    return 1 if  ! defined $b[$i];
    if ($a[$i] =~ /\d/) {
      $res = $a[$i] <=> $b[$i];
    } else {
      $res = $a[$i] cmp $b[$i];
    }
    last if $res;
  }
  $res;
}

# Traverse the directories, collecting files
my %paths;
foreach my $corpus (@corpora) {
  my $regex = $fileRegex{$corpus};
  my %seen;
  my @dirs;
  if ($corpus eq 'Perseus_Translations') {
    @dirs = ('static/texts/Perseus_Greek', 'static/texts/Perseus_Latin');
  }
  else {
    @dirs = ("static/texts/$corpus");
  }
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
          # print $path, "\n";
          $paths{$corpus}{$path}++;
        }
      }
    }
  }
}

# Remove older versions of Perseus Lat/Grc texts.  Varian English texts are more often entirely different translations.
foreach my $corpus ('Perseus_Greek', 'Perseus_Latin', 'First1KGreek') {
  foreach my $path (sort keys %{ $paths{$corpus} }) {
    # For the Greek Anthology, the numbered files indicate Loeb volumes rather than file versions (!)
    next if $path =~ m/tlg7000.tlg001.perseus-grc\d.xml$/;
    if ($path =~ m/perseus-(?:lat|grc)(\d+)\.xml$/) {
      my $num = $1;
      my $newer = $path;
      my $higher = $num + 1;
      $newer =~ s/(\d+).xml$/$higher.xml/;
      if (exists $paths{$corpus}{$newer}) {
        delete $paths{$corpus}{$path};
        # print "Deleting $path\n"
      }
      else {
        # print "Keeping $path\n"
      }
    }
  }
}

my %titles;
# Read TEI header of each file; presumes some sanity of markup
foreach my $corpus (@corpora) {
  foreach my $path (sort keys %{ $paths{$corpus} }) {
    my $header = '';
    open my $fh, "<$path" or die "$!";
    # For d.iogen.es
    my $real_path = $path;
    $real_path =~ s/^static\///;
    while (my $line = <$fh>) {
      # Get rid of namespaces to make xpath easier
      $line =~ s/\s+xmlns="[^"]*"//g;
      if ($line =~ m!</teiHeader>!) {
        $line =~ s!(</teiHeader>).*$!$1!;
        $header .= $line;
        last;
      }
      else {
        $header .= $line;
      }
    }
    # Close root element
    $header =~ m/<(TEI[^\s>]*)/;
    my $root = $1;
    $header .= "</$root>";
    # print "root: <$root>\n";
    # print "$header\n";

    # say $path;
    # parse header
    # my $dom = XML::LibXML->load_xml(string => $header, load_ext_dtd => 0, expand_entities => 0, suppress_errors => 1, supress_warnings => 1, recover => 1);
    my $dom = XML::LibXML->load_xml(string => $header, no_network => 1, recover => 2);
    my ($author, $title);
    foreach my $author_node ($dom->findnodes("//titleStmt/author")) {
      next unless $author_node->to_literal();
      $author = $author_node->to_literal();
    }
    # say $author;
    # say $path;
    unless ($author) {
      if (exists $missing_authors{$path}) {
        $author = $missing_authors{$path};
      }
    }
    unless ($author) {
      my $other_title_nodes = $dom->findnodes("//sourceDesc//title");
      my $other_title;
      if ($other_title_nodes && $other_title_nodes->[0]) {
        $other_title = $other_title_nodes->[0]->to_literal;
      }
      # print "other: $other_title\n";
      if ($other_title) {
        $author = 'Homer' if $other_title =~ m/Homeric Hymns/;
        $author = 'Bible' if $other_title =~ m/Bible/;
        $author = 'New Testament' if $other_title =~ m/New Testament/;
        $author = 'Greek Anthology' if $other_title =~ m/Greek Anthology/;
        $author = 'Scriptores Historiae Augustae' if $other_title =~ m/Scriptores Historiae Augustae/;
        $author = 'Virgil' if $other_title =~ m/Appendix Vergiliana/;
        $author = 'Anonymous' if $other_title =~ m/Apostolic Fathers/;
        $author = 'Zonaras, Iohannes' if $other_title =~ m/IOANNIS ZONARAE/;
      }
    }
    if ($author) {
      $author = 'Anonymous' if $author eq 'Anonymus';
      $author = 'Servius' if $author eq 'Seruius';
      $author = 'Donatus, Aelius' if $author eq 'Aelius Donatus';
      $author = 'Boethius' if $author eq 'Boethius (Anicius Manlius Seuerinus Boethius)';
      $author = 'Cassiodorus' if $author eq 'Cassiodorus (Flauius Magnus Aurelius Cassiodorus Senator)';
      $author = 'Archimedes' if $author eq 'Archimède';
      $author = 'Anna Comnena' if $author eq 'Annae Comnenae';
      $author = 'Aristotle' if $author eq 'Aristoteles';
      $author = 'Euclid' if $author eq 'Euclides';
      $author = 'Gregorius Nazianzenus' if $author eq 'Gregory Nazianzus';
      $author = 'Anonymous' if $author eq 'Hermannus Diels';
      $author = 'Athanasius' if $author eq 'Athanasius of Alexandria';
      $author = 'Justin Martyr' if $author eq 'Justinus Martyr';
      $author = 'Lucian of Samosata' if $author eq 'Lucianus Samosatenus';
      $author = 'Michaelis Ephesius' if $author eq 'Michael Ephesius';
      $author = 'Nichomachus of Gerasa' if $author eq 'Nichomachus Gerasenus';
      $author = 'Nichomachus of Gerasa' if $author eq 'Nicomachus Gerasenus';
      $author = 'Origen' if $author eq 'Origenes';
      $author = 'Scholia in Pindarum' if $author eq 'Pindar Scholia';
      $author = 'Porphyry' if $author eq 'Porphyrius';
      $author = 'Scholia in Euripidem' if $author eq 'Scholia Euripidem';
      $author = 'Theodoretus' if $author eq 'Theodoret, Bishop of Cyrus';
      $author =~ s/^Pseudo[- ]/pseudo-/;
      $author =~ s/^\s+//;
      $author =~ s/\s+$//;
      $author =~ s/^>//;
      # say "Author: $author";
    } else {
      warn "No author: $path";
      $author = 'Anonymous';
    }

    foreach my $title_node ($dom->findnodes("//titleStmt/title")) {
      # Skip subtitles (except for Sallust and Seneca, where the title is the subtitle)
      next if ($title_node->hasAttribute('type') and $title_node->getAttribute('type') eq 'sub' and $author ne 'Sallust' and $author ne 'Seneca');
      $title = $title_node->to_literal();
      $title =~ s/Machine readable text//i;
      last if $title;
    }
    die "No title: $path" unless $title;
    $title =~ s/^\s+//;
    $title =~ s/\s+$//;
    $title =~ s/Ab urbe condita,/Ab Urbe Condita,/g;

    # say "Title: $title";
    # print "\n";
    # die unless $title_string;
    $titles{$corpus}{$author}{$title} = $real_path;
  }
}

my $out = '';
# Now we have authors and titles, so we output the list
foreach my $corpus (@corpora) {
  my $corpus_display = $corpus;
  $corpus_display =~ s/_/ /g;
  $out .= qq{<button type="button" class="collapsible" onClick="toggleFold(this)">$corpus_display</button>\n};
  $out .= qq{<div type="corpus" class="content">\n};
  foreach my $author (sort natural_sort keys %{ $titles{$corpus} }) {
    $out .= qq{<button type="button" class="collapsible authorName" onClick="toggleFold(this)">$author</button>\n};
    $out .= qq{<div type="author" class="content">\n};
    foreach my $title (sort natural_sort keys %{ $titles{$corpus}{$author} }) {
      $out .= qq{<button type="button" class="uncollapsible fileName"  onClick="openLocalFile('$titles{$corpus}{$author}{$title}')">$title</button>\n};
    }
    $out .= qq{</div>\n};
  }
  $out .= qq{</div>\n};
}

# print $out;
# exit;

my $template_file = 'source/file-list-prototype.html';
open my $fh, "<$template_file" or die $!;
my $template;
{
  local $/ = undef;
  $template = <$fh>;
}
close $fh;
my ($prefix, $suffix) = split /INSERT HERE/, $template;
open $fh, ">source/templates/file-list-public.html" or die $!;
print $fh $prefix, $out, $suffix;
close $fh;
