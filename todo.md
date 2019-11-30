# Features
* English dictionary for transl and parse_eng
* Add Gentium

# Building
* Makefile
* Make package.json for npm start
* Try Docker
2 separate containers: node and perl with tini (or with --init flag)
EXPOSE 8989
ENTRYPOINT npm start
* Test with full corpora
* Remove misc

# Perseus
* Ensure Perseus server enforces and records user type
* Try without keepalive

# Fix bugs
* Logeion link
* Occasional mojibake: eg first word of Ach Tatius 1.1.2
Words begining with a capital vowel and leading diacrits.
Problem with utf8 to beta conversion?
* Get rid of OLD/TLL links in Perseus output
* Add spinning cursor on dropbox refresh
* No sidepanel on mobile

# Settings
* Font size in pixels ??

# FAQs
* Other cloud hosts
* Formatting problems
* What Dropbox folder
* How to refresh
* Privacy notice
* Categories of user
* JumpTo not implemented yet.

# Before release
* Move assets to CDN
Put all XML files, json and static js/css assets into a bucket.
dw-static
Keep static html on node server to record user type
Remove unindexed files from Perseus trees (also .git dirs)
restrict s3 cors to d.iogen.es

# Longer term
* Add search server
