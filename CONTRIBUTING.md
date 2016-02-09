Wanna help make Budgie better? Here are some general guidelines:

#Git Workflow 

Fork the repo at [github.com/ng-four/budgie](http://github.com/ng-four/budgie)

Clone the fork locally

	$ git clone http://github.com/your-user-name/budgie.git

Set up your upstream repo:

	$ git remote add upstream http://github.com/ng-four/budgie.git

Create a new branch

	$ git checkout -b [your-branch-name-here]

Make commits to your branch, taking care to make sure that any changes you make are relevant only to the branch you're working on. Try to keep commit messages under 70 characters, and please prefix them with one of the following:

- [feature]
- [bugfix]
- [update] 
- [refactor]
- [cleanup]
- [testing]
- [docs]

Before submitting a pull request, you must first rebase upstream changes into your branch:

	$ git pull --rebase upstream dev

Fix all merge conflicts, if necessary. Submit all pull requests to the dev branch. Please include a short description of your changes.

Thank you for contributing to Budgie!
