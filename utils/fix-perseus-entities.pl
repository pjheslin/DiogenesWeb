#!/usr/bin/perl -w
# Older Perseus texts contain external Entity declarations that have to be
# loaded from the internet.  But modern browers refuse to load such resources as
# a security measure.  So when the browser tries to parse these files after
# receiving the XHR data, it returns null to indicate a processing error.

# We generate a list of entities to replace or remove like so:
# find Perseus_Greek Perseus_Latin -name "*[0-9].xml" -print |xargs pcregrep --buffer-size 16M -rho "&[^;]+;" |sort|uniq
# Also reference to the entity declaration: %PersProse

# Numerical entities are ok.

use strict;
use warnings;
use utf8;
use open qw(:utf8);

chdir "../" or die $!;

my %entities = (
"&AElig;" => "Æ",
"&Aacute;" => "Á",
"&Ccedil;" => "Ç",
"&Eacute;" => "É",
"&Emacr;" => "Ē",
"&Euml;" => "Ë",
"&Iacute;" => "Í",
"&Imacr;" => "Ī",
"&Iuml;" => "Ï",
"&OElig;" => "Œ",
"&Ouml;" => "Ö",
"&Perseus.DE;" => "",
"&Perseus.OCR;" => "",
"&Perseus.class;" => "",
"&Perseus.publish;" => "",
"&Prime;" => "′",
"&TLG.canon;" => "",
"&Tcedil;" => "Ţ",
"&Ucirc;" => "Û",
"&Uuml;" => "Ü",
"&aacute;" => "á",
"&abreve;" => "ă",
"&acirc;" => "â",
"&acute;" => "´",
"&aelig;" => "æ",
"&agrave;" => "à",
"&amacr;" => "ā",
"&amp;" => "&amp;",
"&aring;" => "å",
"&ast;" => "*",
"&atilde;" => "ã",
"&auml;" => "ä",
"&breve;" => "˘",
"&ccaron;" => "č",
"&ccedil;" => "ç",
"&cdot;" => "ċ",
"&dagger;" => "†",
"&deg;" => "°",
"&eacute;" => "é",
"&ebreve;" => "ĕ",
"&ecaron;" => "ě",
"&ecirc;" => "ê",
"&edot;" => "ė",
"&egrave;" => "è",
"&emacr;" => "ē",
"&emdash;" => "—",
"&equals;" => "=",
"&euml;" => "ë",
"&fund.AnnCPB;" => "",
"&fund.NEH;" => "",
"&fund.NSF;" => "",
"&fund.Tufts;" => "",
"&gdot;" => "ġ",
"&gt;" => "&gt;",
"&iacute;" => "í",
"&icaron;" => "ǐ",
"&icirc;" => "î",
"&igrave;" => "ì",
"&imacr;" => "ī",
"&itilde;" => "ĩ",
"&iuml;" => "ï",
"&lang;" => "‹",
"&ldquo;" => "“",
"&lpar;" => "(",
"&lsqb;" => "[",
"&lsquo;" => "‘’",
"&lt;" => "&lt;",
"&macr;" => "¯",
"&mdash;" => "—",
"&middot;" => "∙",
"&ndash;" => "–",
"&ndot;" => "ṅ",
"&ntilde;" => "ñ",
"&oacute;" => "ó",
"&obreve;" => "ŏ",
"&ocaron;" => "ǒ",
"&ocirc;" => "ô",
"&oelig;" => "œ",
"&ograve;" => "ò",
"&omacr;" => "ō",
"&oslash;" => "ø",
"&ouml;" => "ö",
"&pound;" => "£",
"&prime;" => "′",
"&prose.eng.encode;" => "",
"&quot;" => "&quot;",
"&racute;" => "ŕ",
"&rang;" => "›",
"&rdquo;" => "”",
"&responsibility;" => "",
"&rpar;" => ")",
"&rsqb;" => "]",
"&rsquo;" => "’",
"&sacute;" => "ś",
"&sect;" => "§",
"&snull;" => "∅",
"&tcedil;" => "ţ",
"&times;" => "×",
"&tnull;" => "∅",
"&uacute;" => "ú",
"&ucirc;" => "û",
"&udblac;" => "ű",
"&ugrave;" => "ù",
"&umacr;" => "ū",
"&uring;" => "ů",
"&utilde;" => "ũ",
"&uuml;" => "ü",
"&yacute;" => "ý",
"&ycirc;" => "ŷ",
"&ymacr;" => "ȳ",
"&yuml;" => "ÿ"
);

my @files = (`find public/texts/Perseus_Greek public/texts/Perseus_Latin -name "*[0-9].xml" -print |xargs pcregrep --buffer-size 16M -l "&[^;]+;|PersProse"`);

foreach my $file (@files) {
  print STDERR "$file\n";
  local $/ = undef;
  open my $fh, "<$file" or die $!;
  my $out = '';
  while (my $chunk = <$fh>) {
    # $chunk =~ s/(&[A-Z\.a-z]+;)/{exists entities{$1} ? entities{$1} : die "No match for $1"}/gex;
    $chunk =~ s/(&[A-Z\.a-z]+;)/swap($1)/ge;
    print ">$1\n" if $1;
    $chunk =~ s/\%PersProse;//g;
    $out .= $chunk;
  }
  close $fh;
  open $fh, ">$file" or die $!;
  print $fh $out;
  close $fh;
}

sub swap {
  my $ent = shift;
  if (exists $entities{$ent}) {
    return $entities{$ent};
  }
  else {
    die "No match for $ent\n";
  }
}
