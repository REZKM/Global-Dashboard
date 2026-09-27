# Instructions for Claude

## Always push to `main`

Railway deploys only from the `main` branch. Commit and push all changes
directly to `main` (`git push origin HEAD:main`), not to a feature branch —
a push to any other branch will not deploy.
