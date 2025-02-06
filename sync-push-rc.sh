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

# Change to the private repo directory
cd "$PUBLIC_REPO_DIR"
git checkout main 
git fetch
git pull

cd "$PRIVATE_REPO_DIR"

# Entering release candidate mode
npm run rc:on

# Generate a new rc version number
npm run version

# Commit the version number change
git add --all
git commit -m "chore: bump rc version number"
git push

# Sync the private repo to the public repo
rsync -av --exclude '.git' --exclude 'node_modules' --exclude sync-push.sh --delete "$PRIVATE_REPO_DIR/" "$PUBLIC_REPO_DIR/"

# Change to the public repo directory
cd "$PUBLIC_REPO_DIR"

# Check if there are changes to commit
if [ -n "$(git status --porcelain)" ]; then
  # if there are changes, create a new branch and push it
  # Check if the branch already exists
  if git rev-parse --verify "$RC_BRANCH" >/dev/null 2>&1; then
    # if the branch exists, switch to it and pull the latest changes
    git checkout "$RC_BRANCH"
    git fetch
    git pull
  else
    # branch does not exist, create it
    git checkout -b "$RC_BRANCH"
  fi
  git add --all
  git commit -m "initiate/update release candidate"
  git push --set-upstream origin "$RC_BRANCH"
  git status
else
  echo "There are no changes to sync."
fi