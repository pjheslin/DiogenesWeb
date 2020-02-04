# Fixes
Add version numbers to static files to update cache.
For dynamic files served by app, add ver to query string and ignore when serving because we don't really want them to be cached.
For static files, add version to path as directory, so that they will be cached except when releasing a new version.


Fix listing of misc files on dropbox


Fix Fetch dependency.

Fix quotations in the Iliad

#Near term
Add lookup function

# Longer term
Implement search
