#!/bin/bash

# Define the paths to the private and public repositories
if [ -f .env ]; then
  source .env
fi

# Read the new branch name from the first argument
RC_BRANCH="$1"

if [ -z "$RC_BRANCH" ]; then
  echo "Error: You must specify the name of the release branch as an argument."
  exit 1
fi

cd "$PUBLIC_REPO_DIR"
git checkout main 
git fetch
git pull

# Change to the private repo directory
cd "$PRIVATE_REPO_DIR"
git checkout master 
git fetch
git pull

git checkout "$RC_BRANCH"
git fetch
git pull

git checkout master
git merge "$RC_BRANCH"


# Leaving release candidate mode
npm run rc:off

# Generate a new stable version number
npm run version

# Commit the version number change
git add --all
git commit -m "chore: bump version number"
git push

# Sync the private repo to the public repo
rsync -av --exclude '.git' --exclude 'node_modules' --exclude sync-push.sh --delete "$PRIVATE_REPO_DIR/" "$PUBLIC_REPO_DIR/"

# Change to the public repo directory
cd "$PUBLIC_REPO_DIR"

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
  git add --all
  git commit -m "chore: publish release version"
  git push --set-upstream origin main
  git status
else
  echo "There are no changes to sync."
fi