# Building DiogenesWeb
# DigilibLT has to be downloaded manually

VERSION = 1.011

TEXTS = static/texts
PERSEUSGREEKLIT = $(TEXTS)/Perseus_Greek/
PERSEUSLATINLIT = $(TEXTS)/Perseus_Latin/
DIOGENESXML = $(HOME)/Diogenes-Resources/xml

all: perseus file-list index

version:
	rm -rf static/ver/$(VERSION)
	mkdir -p static/ver/$(VERSION)
	cp -r source/js static/ver/$(VERSION)
	cp -r source/css static/ver/$(VERSION)
	cp -r source/html static/ver/$(VERSION)
	echo 'const Version = "'$(VERSION)'";' > static/ver/$(VERSION)/js/version.js
	cp source/templates/*.html generated/
	perl -pi -e 's!/static/ver/VERSION/!/static/ver/'$(VERSION)/'!g' generated/*.html
	cp source/templates/*.hbs views/
	perl -pi -e 's!/static/ver/VERSION/!/static/ver/'$(VERSION)/'!g' views/*.hbs

	# rclone -v copy static/ver diogenes-s3:d.iogen.es/static/ver

perseus:
	cd $(PERSEUSGREEKLIT) && git stash && git pull
	cd $(PERSEUSLATINLIT) && git stash && git pull
	utils/fix-perseus-entities.pl

file-list:
	utils/make-file-list.pl

index:
	utils/parse-authtab.pl $(DIOGENESXML)/phi/authtab.xml $(DIOGENESXML)/tlg/authtab.xml

upload:
	rclone -v copy static/images diogenes-s3:d.iogen.es/static/images
	rclone -v copy static/ver diogenes-s3:d.iogen.es/static/ver

upload-texts:
	rclone -v --include "*[^_].xml" copy static/texts diogenes-s3:d.iogen.es/static/texts

deploy:
	docker build -t pjheslin/diogenesweb .
	docker push pjheslin/diogenesweb
	zip -r Dockerrun.zip Dockerrun.aws.json .ebextensions
	eb deploy
