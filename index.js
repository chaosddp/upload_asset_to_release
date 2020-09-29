const core = require('@actions/core');
const github = require('@actions/github')
const upload = require("./uploader");


async function run() {
  try {
    const repo = core.getInput("repo");
    const owner = core.getInput("owner");
    const tag_name = core.getInput("tag_name");
    const token = core.getInput("token");
    const asset = core.getInput("asset");

    console.log(repo);
    console.log(owner);
    console.log(asset);
    console.log(tag_name);

    const octokit = github.getOctokit(token);

    console.log(octokit);

    const success = await upload(octokit, owner, repo, tag_name, asset);

    if(!success)
    {
      core.setFailed("Fail to upload asset.");
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
