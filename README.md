# Upload asset(s) to a Github release

Use this action to upload asset(s) to a Github release.


## Usage

### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

* `repo` - Target repo to find a release. 
* `owner` - Owner of target repo.
* `tag_name` - Tag name of the release to upload, leave this empty to upload to latest release (not pre-release).
* `token` - Github api access token.
* `asset` - Asset to upload, can be a glob pattern to specified multiple files.

### Outputs

No outputs for now.

### Example workflow

```yaml
name: Upload my js files

on:
  workflow_dispatch:
  
jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.3.3
      - uses: chaosddp/upload_asset_to_release@v0.1
        name: upload js files to latest release
        with:
          repo: upload_asset_to_release
          owner: chaosddp
          # tag_name: v0.05
          token: ${{ secrets.GITHUB_TOKEN }}
          asset: "dist/*.js"
```

### Note

This action will not try to delete existing files with same name in target release, please make sure there is no asset that same name with uploading one, this will cause Github api failed.
