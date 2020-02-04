# Building DiogenesWeb
# DigilibLT has to be downloaded manually

TEXTS = static/texts
PERSEUSGREEKLIT = $(TEXTS)/Perseus_Greek/
PERSEUSLATINLIT = $(TEXTS)/Perseus_Latin/
DIOGENESXML = $(HOME)/Diogenes-Resources/xml

all: perseus file-list index

update-version:

# Change version.js
# Generate new html from templates
# Make new file-list from template
# Change static directory name
# Upload new directory

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
	rclone -v copy static/js diogenes-s3:d.iogen.es/static/js
	rclone -v copy static/css diogenes-s3:d.iogen.es/static/css
	rclone -v copy static/html diogenes-s3:d.iogen.es/static/html

upload-texts:
	rclone -v --include "*[^_].xml" copy static/texts diogenes-s3:d.iogen.es/static/texts

deploy:
	docker build -t pjheslin/diogenesweb .
	docker push pjheslin/diogenesweb
	zip -r Dockerrun.zip Dockerrun.aws.json .ebextensions
	eb deploy
