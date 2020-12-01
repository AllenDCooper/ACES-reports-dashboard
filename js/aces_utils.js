(function($) {
    $.fn.changeElementType = function(newType) {
        var attrs = {};

        $.each(this[0].attributes, function(idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });

        this.replaceWith(function() {
            return $("<" + newType + "/>", attrs).append($(this).contents());
        });
    };
})(jQuery);

var ACES_UTILS = {};

ACES_UTILS.getDate = function(delimiter) {
    if (delimiter === undefined) {
        delimiter = '/';
    }

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return mm + delimiter + dd + delimiter + yyyy;
};

ACES_UTILS.capitalize = function(string) {
    if (string !== undefined) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return "";
};

ACES_UTILS.delay = function(time) {
    if (time === undefined) {
        time = 200;
    }
    return new Promise((resolve, reject)=> { 
        setTimeout(function() {
            resolve('done');
        }, time);
    });
}

// cleans student name for CSV export
ACES_UTILS.clean_name_csv = function(name) {
    name = name.replace(/\%20/g, ' ');
    name = name.replace(/[,"]/g, '');
    return name;
}

ACES_UTILS.viewingInPx = function() {
    // if (typeof window.parent === 'undefined' ||
    //         typeof window.parent.PX === 'undefined') {
    //         return true;
    //     }
        return true;
}