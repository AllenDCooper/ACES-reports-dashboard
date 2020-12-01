// These will be used if we are not in PX
var noopApi = {
    initializeClass: function(dataset_id) {
        console.log('nooApi.initializeClass(' + dataset_id + ')');

        var dfd = jQuery.Deferred();
        var source_array;

        try {
            source_array = (dataset_id === 'acespost') ? PROGRESS_TEST_DATA: INITIAL_TEST_DATA;
        }
        catch(err) {
            console.log('noopApi.initializeClass: error 1');
            dfd.reject(err.message);
            return dfd.promise();
        }

        if (source_array === undefined || !($.isArray(source_array))) {
            console.log('noopApi.initializeClass: error 2');
            dfd.reject('source_array not defined');
        }
        else {
            dfd.resolve(source_array);
            //dfd.reject('intentionally rejected for testing');
        }
        return dfd.promise();
    },

    loadInstitutionalData: function(dataset, institution_id, term_id) {
        var dfd = jQuery.Deferred();
        var source_array;

        try {
            source_array = (dataset === 'acespost') ? INST_PROGRESS_TEST_DATA: INST_INITIAL_TEST_DATA;
        }
        catch(err) {
            dfd.reject(err);
            return dfd.promise();
        }

        if (source_array === undefined || !($.isArray(source_array))) {
            dfd.reject('institutional source_array not defined');
        }
        else {
            dfd.resolve(source_array);
        }
        return dfd.promise();
    }
};


// local JS file for instructor reports

var ACES = {};

// set this to false for production
ACES.testing = true;

ACES.preAutoComplete = [];
ACES.postAutoComplete = [];
// when printing, set this to the report content HTML
ACES.html_to_print = "";
// Information for printing header
ACES.px_student_name = "Test User";
ACES.px_term = "Test Term";
ACES.report_title = "Test Report";
ACES.measure_name = "Test Measure";

// These are used when displaying student information from the Roster report
ACES.student_info_id;
ACES.student_info_report_type;

// this will be set to initial|progress|comparison|change
ACES.current_tab = "";
ACES.current_report = "";

// InstitutionId, used to pull institutional data
ACES.institutionId;
// TermId for the course, used to pull institutional data
ACES.termId;

$(window).ready(function () {
	ACES.run();
});

ACES.student_windows = {};

ACES.table = {
    2: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 9, 13, 18, 25, 33, 43, 53, 64, 74, 81, 87, 91, 95, 99],
    3: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 5, 7, 9, 13, 17, 22, 28, 35, 42, 51, 59, 67, 74, 81, 87, 92, 96, 99],
    4: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 9, 12, 17, 22, 28, 35, 42, 49, 55, 62, 69, 75, 80, 84, 88, 91, 94, 96, 97, 98, 99, 99],
    5: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 11, 14, 18, 23, 27, 32, 38, 43, 49, 54, 59, 64, 69, 73, 77, 80, 84, 87, 89, 92, 94, 95, 97, 97, 98, 99, 99, 99],
    6: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 11, 14, 18, 24, 30, 37, 45, 53, 62, 70, 78, 84, 89, 92, 95, 97, 98, 99],
    7: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 7, 9, 11, 14, 18, 22, 27, 33, 40, 47, 55, 63, 70, 78, 83, 88, 91, 94, 96, 98, 99],
    8: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 12, 16, 22, 29, 38, 47, 57, 66, 75, 83, 89, 92, 95, 97, 98, 99],
    9: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 5, 7, 9, 12, 16, 20, 26, 32, 38, 46, 54, 61, 69, 77, 83, 87, 90, 93, 95, 97, 99],
    10: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 5, 6, 9, 11, 15, 19, 24, 30, 36, 43, 50, 57, 64, 71, 77, 83, 87, 91, 94, 96, 97, 98, 99],
    11: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 6, 8, 11, 14, 18, 24, 30, 37, 45, 53, 61, 69, 75, 82, 87, 91, 94, 96, 98, 98, 99],
    12: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 5, 7, 9, 12, 15, 20, 24, 30, 36, 43, 49, 56, 63, 69, 76, 81, 86, 90, 93, 95, 97, 98, 99, 99, 99],
    13: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 4, 6, 8, 10, 13, 16, 21, 26, 31, 37, 43, 49, 55, 62, 68, 74, 80, 84, 89, 92, 94, 96, 98, 99]
};

ACES.measure_names = [{
    key: '2',
    value: 'Critical Thinking/Goal Setting',
    score: 0
}, 
{
    key: '3',
    value: 'Motivation/Decision Making/Personal Responsibility',
    score: 0
}, 
{
    key: '4',
    value: 'Learning Preferences',
    score: 0
}, 
{
    key: '5',
    value: 'Organization/Time Management',
    score: 0
}, 
{
    key: '6',
    value: 'Reading',
    score: 0
}, 
{
    key: '7',
    value: 'Note Taking',
    score: 0
}, 
{
    key: '8',
    value: 'Memory/Studying',
    score: 0
}, 
{
    key: '9',
    value: 'Test Taking',
    score: 0
}, 
{
    key: '10',
    value: 'Information Literacy and Communication',
    score: 0
}, 
{
    key: '11',
    value: 'Connecting with Others',
    score: 0
}, 
{
    key: '12',
    value: 'Personal and Financial Health',
    score: 0
}, 
{
    key: '13',
    value: 'Academic and Career Planning',
    score: 0
}],

ACES.demographic_keys = [
    'gender_identity',
    'hispanic_origin',
    'American Indian or Alaskan Native',
    'Asian',
    'Black or African American',
    'Native Hawaiian or Other Pacific Islander',
    'White',
    'International or foreign national',
    'Started college at this institution',
    'Current college credits',
    'Enrolled for 12 or more credits',
    'Birth year',
    'Parents highest level of education',
    'Expected level of education',
    'First person to attend college',
    'Eligible for Federal Pell Grant',
    'Serve in US Military'
],

ACES.aria_speech = function(message) {
    $('#aria-speech').text('');
    var timeout = setTimeout(function() {
        $('#aria-speech').text(message); 
    }, 200);
};

ACES.run = function() {

    $('main').css('display', 'none');

    // check that this is the instructor
    // if (ACES_UTILS.viewingInPx() && !ACES.isInstructor()) {
    //     ACES.abort("Sorry, only the instructor for this course may open this activity.");
    //     return;
    // }   

    // if (!ACES.configureVariables()) {
    //     ACES.abort("Sorry, we are having issues configuring your reports at the moment. Please try again later.");
    //     return;
    // }

    ACES.aria_speech('Please wait while your course data is loading.');

    ACES.data_service = new DataService();
    ACES.data = new DataSources();
    ACES.data.createDataSources().then(
        function() {
            ACES.init();
        },
        function(err) {
            console.log('ACES.data.createDataSources() failed:');
            console.log(err);
            ACES.abort("Sorry, there was a temporary error obtaining the data for your reports. Please try again later.");
        }
    );
    
};

ACES.configureVariables = function() {
    if (ACES_UTILS.viewingInPx()) {
        try {
            ACES.termId = parent.PxPage.Context.Course.AcademicTerm;
            ACES.institutionId = parent.PxPage.Context.Course.Domain.Id;
            if (ACES.termId === undefined) {
                throw new Error('TermId is undefined');
            }
            if (ACES.institutionId === undefined) {
                throw new Error('InstitutionId is undefined');
            }
        }
        catch(err) {
            console.log(err.message);
            return false;
        }
    }
    else {
        ACES.termId = "Spring 2019";
        ACES.institutionId = "9999";
    }
    return true;
};

ACES.isInstructor = function() {

    if (window.parent.PxPage === undefined ||  
        window.parent.PxPage.Context === undefined || 
        window.parent.PxPage.Context.User === undefined) {
        return true;
    }

    var isInstructor = window.parent.PxPage.Context.User.IsInstructor;

    if (isInstructor === "true") {
        return true;
    }
    return false;
};

ACES.abort = function(message) {
    $('#please_wait').remove();
    $('main').html('<p id="abort">' + message + '</p>').css('display', 'block');
    ACES.aria_speech(message);
};

ACES.init = function() {

    $('#please_wait').remove();
    $('main').css('display', 'block');

    ACES.data.fix();
    ACES.data.fillAutoComplete();
    ACES.data.updateStudentNumbers();

    // we always start on the initial tab
    ACES.current_tab = 'initial';
    ACES.current_report = 'class';
    ACES.measure_name = null; // will be updated each time we print

    //ACES.loadClassData();

    ACES.setHandlers();

    // order is important here
    ACES.radio_buttons = new RadioButtons();
    ACES.main_tabs = new MainTabs();
    ACES.class_report = new ClassReport();
    ACES.roster_report = new RosterReport();
    ACES.institutional_report = new InstitutionalReport();
    ACES.printer = new Printer();
    ACES.exporter = new Exporter();

    // always start at Initial Class report
    $('#ui-id-1').focus();
    $('#initial_class').trigger('click');
    $('#initial_class_radio').addClass('selected');

};

// type = initial or progress
// s_id = student ID
// s_name = student name
ACES.setStudentInputId = function(type, s_id, s_name) {

    var $input = $('#'+type+'_student');

    if (s_id !== undefined && s_name !== undefined) {
        $input.attr('data-studentid', s_id);
        $input.val(s_name);
    }

    /*
    var search_object;
    if (type === undefined) {
        type = 'initial';
    }
    if (type === 'progress') {
        search_object = ACES.postClassData;
    }
    else {
        search_object = ACES.preClassData;
    }
    console.log(search_object);
    var input_val = $input.val();
    console.log(input_val);
    if (input_val in search_object) {
        console.log('found ' + input_val + ' in search object');
        // set student ID in hidden div
        $input.attr('data-studentid', input_val);
        var name = ACES.getName(input_val, 'pre');
        console.log(name);
        $input.val(name);
    }
    */
};

ACES.setHandlers = function() {

    // handler for report links
    $('.report_display_links').on('click', function(e) {
        var $target = $(e.target);
        if ($target.hasClass('print_report')) {
            e.preventDefault();
            ACES.printer.print();
        }
        else if ($target.hasClass('export_ranks')) {
            e.preventDefault();
            ACES.exporter.studentRanks($target.parent().attr('data-type'));
        }
        else if ($target.hasClass('export_demo')) {
            e.preventDefault();
            ACES.exporter.demographics($target.parent().attr('data-type'));
        }
        else if ($target.hasClass('export_data')) {
            e.preventDefault();
            ACES.exporter.institutionalData($target.parent().attr('data-type'));
        }
        else if ($target.hasClass('export_comparison_data')) {
            e.preventDefault();
            ACES.exporter.comparisonData($target.parent().attr('data-type'));
        }
        else if ($target.hasClass('export_student_change')) {
            e.preventDefault();
            ACES.exporter.studentChange($target.parent().attr('data-type'));
        }
        else if ($target.hasClass('export_institutional_change')) {
            e.preventDefault();
            ACES.exporter.institutionalChange($target.parent().attr('data-type'));
        }
    });

    // Order by menu
    $('.order_by').change(function(event) {
        var subreport = $(event.target).attr('data-subreport');
        console.log(subreport);
        if (subreport === 'class') {
            console.log('ordering class report');
            ACES.class_report.show();
        }
        else if (subreport === 'roster') {
            ACES.roster_report.show();
        }
        else if (subreport === 'institutional') {
            console.log('ordering institutional report');
            ACES.institutional_report.show();
        }
    });


    // scale select for roster report
    $('.scale').change(function(event) {
        ACES.roster_report.show();
    });

    // for custom radio buttons
    $('.intro_header input[type="radio"]').focusin(function(e) {
        var $target = $(e.target);
        var $fieldset = $target.parents('fieldset');
        $fieldset.find('.radio_button').removeClass('selected').removeClass('focused');
        var target_id = $target.attr('id');
        $('#'+target_id+'_radio').addClass('selected').addClass('focused');
    });
    $('.intro_header input[type="radio"]').focusout(function(e) {
        var $target = $(e.target);
        var target_id = $target.attr('id');
        $('#'+target_id+'_radio').removeClass('focused');
    });
    $('.intro_header .radio_button').click(function(e) {
        var $target = $(e.target);
        var target_id = $target.attr('id');
        var input_id = target_id.replace('_radio', '');
        $('#'+input_id).focus().click();
    });

};

ACES.toggle_topic_link = function($target) {
    console.log('toggle_topic_link');
    var $row = $target.parents('.report_summary_row');
    if ($target.attr('aria-expanded') === 'false') {
        //$row.attr('aria-expanded','true');
        $row.find('.results_details').attr('aria-hidden', 'false');
        var button_text = $target.find('.visually-hidden').text();
        button_text = button_text.replace('Show', 'Hide');
        $target.find('.topic_link_text').eq(1).text(button_text);
        $target.attr('aria-expanded','true');
    }
    else {
        //$row.attr('aria-expanded','false');
        $target.attr('aria-expanded','false');
        $row.find('.results_details').attr('aria-hidden', 'true');
        var button_text = $target.find('.visually-hidden').text();
        button_text = button_text.replace('Hide', 'Show');
        $target.find('.topic_link_text').eq(1).text(button_text);
    }
};

// This always returns the name in the initial data source.
ACES.getName = function(userId) {
    if (typeof userId !== 'string') {
        userId = String(userId);
    }
    //var name = ACES.main_tabs.activeTab === 'initial' ? ACES.data.getData('initial')[userId].name : ACES.data.getData('progress')[userId].name;
    var name = ACES.data.getData('initial')[userId].name;
    name = name.replace('%20', ' ');
    return name;
};
