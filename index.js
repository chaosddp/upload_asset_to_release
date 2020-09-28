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

    const octokit = github.getOctokit(token);

    await upload(octokit, owner, repo, tag_name, asset);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
