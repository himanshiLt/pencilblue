/**
 * @author Brian Hyder <brian@penciblue.org>
 * @copyright 2014 PencilBlue, LLC. All Rights Reserved
 */

//dependencies
var os = require('os');

/**
 * @class CallHomeService
 * @constructor
 */
function CallHomeService(){}

//constants
var HOST   = 'pencilblue.org';
var PORT   = 443;
var PATH   = '/api/v1/callhome/event';
var METHOD = 'POST';

//statics
CallHomeService.SYSTEM_SETUP_EVENT = 'system_setup';


CallHomeService.callHome = function(type, data) {
    if (!pb.utils.isObject(data)) {
        data = {};
    }
    
    data.type      = type;
    data.site_ip   = pb.config.siteIP;
    data.site_name = pb.config.siteName;
    data.os        = os.type();
    data.platform  = os.platform();
    data.release   = os.release();
    data.cpus      = os.cpus();
    data.version   = process.versions;
    var post_data  = JSON.stringify(data);
    
    // An object of options to indicate where to post to
    var post_options = {
        host: HOST,
        port: PORT,
        path: PATH,
        method: METHOD,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    // Set up the request
    pb.log.debug('CallHomeService: Sending event [%s] to [%s:%s%s', type, METHOD, HOST, PATH);
    CallHomeService._callHome(post_options, post_data);
};

CallHomeService._callHome = function(options, postData) {
    
    var d = domain.create();
    d.on('error', function(err) {
        pb.log.silly('CallHomeService: An error occurred attempting to send event. %s', err.stack);
    });
    d.run(function() {
        
        var post_req = https.request(options, function(res) {
        
            var json = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                json += chunk;
            });
            res.on('end', function() {
                CallHomeService.onResponseRecieved(res, json);
            });
        });

        // post the data
        post_req.write(postData);
        post_req.end();
    });
};

CallHomeService.onResponseRecieved = function(res, json) {
    pb.log.silly('CallHomeService: Event Response: %s', json);
};

//exports
module.exports = CallHomeService;