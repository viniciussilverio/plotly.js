#!/usr/bin/env node
var spawn = require('child_process').spawn;

// retry a given command if no standard output is produced within a given timeout
function retry(cmd, args, timeout, trials) {
    if(trials === 0) {process.exit(1)}
    var timer
    function retryAfterTimeout() {
      console.log(trials + ' trials left');
      console.log('Retrying after no output for ' + timeout + ' seconds');
      child.kill();
      retry(cmd, args, timeout, --trials)
    }

    function setTimer() {
      timer = setTimeout(retryAfterTimeout, timeout * 1000)
    }

    const child = spawn(cmd,args);
    setTimer();

    child.stdout.on('data', function(data) {
        clearTimeout(timer);
        setTimer()
        console.log(data.toString());
    })

    child.on('error', function(err) {
        console.log(err.toString());
        retry(cmd, args, --trials)
    })

    child.on('close', function(code) {
        console.log('Exit with code ' + code);
        process.exit(code)
    })
}

var args = process.argv
args.splice(0,2);
retry('.circleci/orca-build-verify.sh', args, 60, 5)