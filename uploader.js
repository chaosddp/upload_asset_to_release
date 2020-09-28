const glob = require("glob");
const fs = require("fs");
const path = require("path");

const STATUS_OK = 200;


function response_to_release(resp) {
    var success = true;
    var result = null;

    // check reponse status
    if (resp == null || resp.status != 200) {
        success = false;
        
        if(resp == null){
            result = "Invalid response of release api."
        }else{
            result = `Api request not success, status code: ${resp.status}.`;
        }
    }
    else {
        // for release we only need following fields
        // 1. upload_url: used for asset upload operation
        // 2. tag: used for logging to show which release we are operating
        // 3. name: for logging
        // 4. id: for following operation
        result = {
            "upload_url": resp.data.upload_url,
            "tag": resp.data.tag_name,
            "name": resp.data.name,
            "id": resp.data.id
        };
    }

    return [success, result];
}

// get latest release
async function get_latest_release(octokit, owner, repo) {
    var success = true;
    var result = null;

    try {
        result = await octokit.repos.getLatestRelease({
            owner: owner,
            repo: repo
        });
    }
    catch (err) {
        success = false;
        result = err.message;
    }

    return [success, result];
}

async function get_release_by_tag(octokit, owner, repo, tag_name) {
    var success = true;
    var result = null;

    try {
        result = await octokit.repos.getReleaseByTag({
            owner: owner,
            repo: repo,
            tag: tag_name
        });
    }
    catch (err) {
        success = false;
        result = err.message;
    }

    return [success, result];
}

async function get_release(octokit, owner, repo, tag_name, default_latest = false) {
    var release = null;
    var success = true;
    var result = null;
    
    try {
        if (!tag_name || tag_name == "") {
            // if not contains tag name then get latest release
            release = await get_latest_release(octokit, owner, repo);
        } else {
            try {
                // try to get release by name first
                release = await get_release_by_tag(octokit, owner, repo, tag_name);
            } catch (err) {
                success = false;
                result = err.message;

                if (default_latest) {
                    success = true;
                    result = null;

                    // then try to use latest if enabled
                    release = await get_latest_release(octokit, owner, repo);
                }
            }
        }
    } catch (err) {
        success = false;
        result = err.message;

    }

    if(release){
        return [success, result];
    }

    return response_to_release(release);
}


async function upload_asset(octokit, owner, repo, name, path, release_id, upload_url) {
    var success = true;
    var result = null;
    
    try {
        const data = fs.readFileSync(path);

        result = await octokit.repos.uploadReleaseAsset({
            owner: owner,
            repo: repo,
            name: name,
            release_id: release_id,
            origin: upload_url,
            data: data
        });
    } catch (err) {
        success = true;
        result = err.message;
    }

    return [success, result];
}


async function upload_assets(octokit, owner, repo, tag_name, assets) {
    const release_ret = get_release(octokit, owner, repo, tag_name);

    if(!release_ret[0]){
        return [false, [release_ret[1]]];
    }

    const release = release_ret[1];

    console.log(`Got release, name: ${release.name}, tag: ${release.tag}. `);

    const asset_list = glob.sync(assets);

    var success = true;
    var result = [];

    for (var i = 0; i < asset_list.length; i++) {
        var asset = asset_list[i];
        var name = path.basename(asset);

        console.log(`Uploading file: ${asset}.`);

        var part_result = await upload_asset(octokit, owner, repo, name, asset, release.id, release.upload_url);

        success = success && part_result[0];

        result.push(part_result);

        if(!success){
            break;
        }
    }

    return [success, result];
}


module.exports = upload_assets;