# Building DiogenesWeb
# DigilibLT has to be downloaded manually

TEXTS = public/texts
PERSEUSGREEKLIT = $(TEXTS)/Perseus_Greek/
PERSEUSLATINLIT = $(TEXTS)/Perseus_Latin/
DIOGENESXML = $(HOME)/Diogenes-Resources/xml

all: perseus file-list index

perseus:
	cd $(PERSEUSGREEKLIT) && git pull
	cd $(PERSEUSLATINLIT) && git pull
	utils/fix-perseus-entities.pl

file-list: perseus
	utils/make-file-list.pl

index:
	utils/parse-authtab.pl $(DIOGENESXML)/phi/authtab.xml $(DIOGENESXML)/tlg/authtab.xml

upload:
	rclone -v copy public/images diogenes-s3:d.iogen.es/static/images
	rclone -v copy public/js diogenes-s3:d.iogen.es/static/js
	rclone -v copy public/css diogenes-s3:d.iogen.es/static/css
	rclone -v copy public/static-html diogenes-s3:d.iogen.es/static/html

upload-texts:
	rclone -v --include "*[^_].xml" copy public/texts diogenes-s3:d.iogen.es/static/texts

deploy:
	docker build -t pjheslin/diogenesweb .
	docker push pjheslin/diogenesweb
	zip -r Dockerrun.zip Dockerrun.aws.json .ebextensions
	eb deploy
