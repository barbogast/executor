## Deploy to github pages

1. Commit all changes to master
2. `git checkout gh_pages`
3. `git merge master`
4. `yarn copy-to-docs`
5. Get most recent version: `git log --oneline | grep "Version"`
6. Commit changes with message "Version X"
7. `git push`
