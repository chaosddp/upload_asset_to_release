const glob = require("glob");
const fs = require("fs");
const path = require("path");

const STATUS_OK = 200;


function response_to_release(resp){
    // check reponse status
    if(resp == null || resp.status != 200){
        return null;
    }

    // for release we only need following fields
    // 1. upload_url: used for asset upload operation
    // 2. tag: used for logging to show which release we are operating
    // 3. name: for logging
    // 4. id: for following operation
    return{
        "upload_url": resp.data.upload_url,
        "tag": resp.data.tag_name,
        "name": resp.data.name,
        "id": resp.data.id
    };
}

// get latest release
async function get_latest_release(octokit, owner, repo){
    try{
        return await octokit.repos.getLatestRelease({
            owner: owner,
            repo: repo
        });
    }
    catch(err){
        console.info("get latest release.");
        console.error(err.message);
    }

    return null;
}

async function get_release_by_tag(octokit, owner, repo, tag_name){
    try{
        return await octokit.repos.getReleaseByTag({
            owner: owner,
            repo: repo,
            tag: tag_name
        });
    }
    catch(err){
        console.log(err.message);
    }

    return null;
}

async function get_release(octokit, owner, repo, tag_name, default_latest = false){
    var release = null;

    try{
        if(!tag_name){
            // if not contains tag name then get latest release
            release = await get_latest_release(octokit, owner, repo);
        }else{
            try{
                // try to get release by name first
                release = await get_release_by_tag(octokit, owner, repo, tag_name);
            }catch(err){
                console.log(err.message);

                if(default_latest)
                {
                    // then try to use latest if enabled
                    release = await get_latest_release(octokit, owner, repo);
                }
            }
        }
    }catch(err){
        console.log(err.message);
    }

    return response_to_release(release);
}


async function upload_asset(octokit, owner, repo, name, path, release_id, upload_url){
    try{
        const data = fs.readFileSync(path);

        return await octokit.repos.uploadReleaseAsset({
            owner: owner,
            repo: repo,
            name: name,
            release_id: release_id,
            origin: upload_url,
            data: data
        });
    }catch(err){
        console.error(err.message);
    }

    return null;
}

/**
    const owner = "chaosddp";
    const repo = "get_release_by_tag";
    const tag_name = null;

    const assets = ["package.json", ];
 */
async function upload_assets(octokit, owner, repo, tag_name, assets){
    const asset_list = glob.sync(assets);

    console.log(asset_list);

    var success = True;

    for(var i=0;i<asset_list.length;i++){
        var asset = asset_list[i];
        var name = path.basename(asset);

        var resp = await upload_asset(octokit, owner, repo, name, asset, release.id, release.upload_url);
        
        success = success && resp != null;

        console.log(resp);
    }
}


module.exports = upload_assets;