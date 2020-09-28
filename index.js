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

    const result = await upload(octokit, owner, repo, tag_name, asset);

    if(result[0]){
      core.setOutput("Success to upload asset(s) to target release");
    }else{
      for(var i=0;i<result[1].length;i++){
        core.setOutput(result[1][i]);
      }
      
      core.setFailed("Fail to upload asset.");
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
