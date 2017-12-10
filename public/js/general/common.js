function padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
}
//or as a Number prototype method:
Number.prototype.padLeft = function (n, str) {
    return Array(n - String(this).length + 1).join(str || '0') + this;
}

String.prototype.contains = function (it) {
    return this.indexOf(it) != -1;
};

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

function padLeftTime(nr, n, str) {
    if (String(nr).length == 2) {
        return "00:00:00";
    }
    if (String(nr).length < 8)
        return Array(n - String(nr).length + 1).join(str || '00:') + nr;
    else {
        return nr;
    }
}

String.prototype.format = function (args) {
    var newStr = this;
    for (var key in args) {
        newStr = newStr.split('{' + key + '}').join(args[key]);
    }
    return newStr;
}

function convertToByteArray(str) {
    var bytes = [];

    for (var i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}


var wsStatus;

function connectStatus() {

    //var URL = 'ws://' + location.host  + '/websockets/simple';
    //ws://54.151.8.166:7080/v2/broker/?topics=testmessageevents_1,blacklistipaddr,unknownuseraccess,outsidenormalbusinesshours
    var URL = 'ws://54.151.8.166:7080/v2/broker/?topics=testmessageevents_1,';
    // 'ws://54.159.38.198:7080/v2/broker/?topics=teststatus_1,testout_1';

    if ('WebSocket' in window) {

        wsStatus = new WebSocket(URL);
    } else if ('MozWebSocket' in window) {

        wsStatus = new MozWebSocket(URL);
    } else {

        console.log('websocke is not supported');
        return;
    }

    wsStatus.onopen = function () {
        console.log('Open Status!');
    };

    wsStatus.onmessage = function (event) {

        console.log(event);
    };


    wsStatus.onclose = function () {

        disconnectStatus();
        console.log('Close Status!');
    };

    wsStatus.onerror = function (event) {
        console.log('Error Status!');
    };
}

function disconnectStatus() {

    if (wsStatus != null) {

        wsStatus.close();
        wsStatus = null;
    }

    console.log('Disconnect Status!');
}

function formatModelVersion(version) {
    var v1 = parseInt(version.substr(0, 6));
    var v2 = parseInt(version.substr(5, 6));
    var v3 = parseInt(version.substr(12, 6));
    return v1 + '.' + v2 + '.' + v3;
}

