# Release Flow Guidelines

## Introduction

Release Flow is a lightweight but effective Git workflow that helps teams cooperate regardless of team size or technical expertise. It provides a recipe for how to use Git to control source code in a consistent and productive manner.

## Branching Policy

| Branch | Naming convention | Origin | Merge to | Purpose |
|--------|-------------------|--------|----------|---------|
| feature or topic | <ul><li>feature/feature-name</li><li>feature/feature-area/feature-name</li><li>topic/description</li></ul> | master | master | Add a new feature or a topic |
| bugfix | bugfix/description | master, feature | master, feature | Fix a bug |
| hotfix | hotfix/description | release | release & master[1] | Fix a bug in a submitted assignment after deadline |
| refactor | refactor/description | master, feature | master, feature | Refactor |
| release | release/labXX | master | none | Submit assignment [2] |

**Notes:** 
- [1] If we want to update solutions within a week after the deadline, we could make a new hotfix branch (e.g., `hotfix/stop-the-world`). Then we merge the hotfix branch with master and with release branch for the last submitted assignment (e.g., `release/lab01`). In case we already created a release branch for the current week assignment (e.g., `release/lab02`), we could merge the hotfix branch with the current release branch if needed, or we can delete and then recreate the current release branch.
- [2] Latest versions of projects in release branch serve as the submitted assignment.

## Release Flow Best Practices

1. We can create as many branches as we need.
2. We name branches with meaningful names following the branching policy.
3. We should keep branches as close to master as possible; otherwise, we could face merge hell.
4. Generally, when we merge a branch with its origin, that branch has been history. We usually do not touch it a second time.
5. We must strictly follow the branching policy. Others are flexible.

## Typical Git Commands for Working with Branches

### Creating and Working with a New Branch

```bash
# Create and switch to a new branch
git checkout -b <branch-name>

# Make modifications in the local repo

# Add all changes in the current directory and subdirectories to the staging area
git add .

# Commit the change in the local repo
git commit -m "What you have changed"

# Push the local branch to the remote branch
git push origin <branch-name>
```

## Release Flow Demonstration (Step by Step)

### Step 1: Update local repository
```bash
(master) $ git pull
```

### Step 2: Create and switch to a new branch in the local repository
```bash
(master) $ git checkout -b feature/demonstrate-release-flow
```

### Step 3: Make modifications in the local repository

### Step 4: Add all changes to the staging area
```bash
(feature/demonstrate-release-flow) $ git add .
```

### Step 5: Commit the change in the local repository
```bash
(feature/demonstrate-release-flow) $ git commit -m "Change files in assignment folder"
```

### Step 6: Push the local branch to the remote branch
```bash
(feature/demonstrate-release-flow) $ git push origin feature/demonstrate-release-flow
```

### Step 7: Create a pull request in GitHub GUI (for working in a team)
1. Choose the "Pull requests" tab from the top navigation bar.
2. Click the button "New pull request" in the top right corner of the interface.
3. Pick the target branch and current branch. The target branch will determine which branch your changes will be merged into.
4. Choose reviewers for the pull request. You can also change the commit message and add comments as needed.
5. Click "Create pull request".

### Step 8: Merge the new remote branch to the master branch
1. Open the pull request.
2. Choose "Merge pull request". You can select one of several merge options from the dropdown menu.
3. Change the commit message if needed and click "Confirm merge".

## Example Application (Lab02)

For example, in lab02 with 7 main tasks, one possible way to apply Release Flow is to create 7 branches:

- Create a branch `topic/use-case-diagram` for the Use Case diagram
- Create a branch `topic/class-diagram` for the UML Class diagram
- Create a branch `feature/initial-aims` for the implementation of specific sections
- Create a branch `feature/manage-cart` for the implementation of other sections
- Create a branch `topic/method-overloading` for the implementation of method overloading
- Create a branch `topic/passing-parameters` for the implementation of parameter passing
- Create a branch `topic/classifier-and-instance-member` for classifier and instance implementation

After completing all tasks and merging all branches into the master branch, create a release branch from the master in the remote repository (GitHub):
```
release/lab02
```

This release branch will serve as your submitted assignment.