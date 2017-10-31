var svnUltimate = require('node-svn-ultimate');
const log = require('electron-log');


// var obj = svnUltimate.util.parseUrl( 'https://rgapvba0004.dir.svc.accenture.com:3688/svn/TIA7/trunk' );
// // this call will return an object comprising of
// // obj = {
// // 	rootUrl: 'https://my.url/svn/repo',
// // 	type: 'trunk', // either trunk, tags, or branches
// // 	typeName: '1.3.5' // only populated if a tag or a branch, name of the tag or branch
// // 	trunkUrl: 'https://my.url/svn/repo/trunk',
// // 	tagsUrl: 'https://my.url/svn/repo/tags',
// // 	branchesUrl: 'https://my.url/svn/repo/branches'
// // };
// log.info('svnUltimate.util.parseUrl returned ', obj);

svnUltimate.util.getLatestTag( 'https://rgapvba0004.dir.svc.accenture.com:3688/svn/TIA7/trunk', function( err, latestTag ) {
    // latestTag will be the most recent tag, worked out by semver comparison (not the date it was created)
    if(err){
        log.error(err);
        return;
    }
    
    log.info(latestTag);
} );