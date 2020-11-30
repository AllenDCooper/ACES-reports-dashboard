//PX.API.DataService.loadInstitutionalData( datasetid , institutionid, termid )

class DataService {

    constructor() {
        this.api = typeof (((window.parent || {}).PX || {}).API || {}).DataService !== 'undefined'
            ? window.parent.PX.API.DataService
            : noopApi;
       // always load test data for now for testing purposes
       //this.api = noopApi;
    }

    getData(dataset, institution_id, term_id) {
        console.log('DataService.getData(' + dataset + ', ' + institution_id + ', ' + term_id + ')');

        const dfd = jQuery.Deferred();

        if (institution_id === undefined) {
            return this.initializeClass(dataset).then(
                function(data) {
                    console.log('getData -> initializeClass succeeded');
                    console.log(data);
                    const this_data = data;
                    dfd.resolve(this_data);
                    return dfd.promise();
                },
                function(err) {
                    console.log('getData -> initializeClass failed');
                    console.log(err);
                    dfd.reject(err);
                    return dfd.promise();
                }
            );
        }
        else {
            return this.loadInstitutionalData(dataset, institution_id, term_id).then(
                function(data) {
                    dfd.resolve(data);
                    return dfd.promise();
                },
                function(err) {
                    dfd.reject(err);
                    return dfd.promise();
                }
            );
        }
    }

    initializeClass(dataset) {
        console.log('DataService.initializeClass(' + dataset + ')');

        const dfd = jQuery.Deferred();

        return this.api.initializeClass(dataset).then(
            function(data) {
                console.log('DataService.initializeClass received data');
                console.log(data);
                if ($.isArray(data)) {
                    dfd.resolve(data);
                }
                else {
                    dfd.resolve([]);
                }
                return dfd.promise();
            },
            function(err) {
                dfd.reject(err);
                return dfd.promise();
            }
        );
    }

    loadInstitutionalData(dataset, institution_id, term_id) {

        term_id = term_id.replace(/ /g, '');

        console.log('DataService.loadInstitutionalData(' + dataset + ', ' + institution_id + ', ' + term_id + ')');

        const dfd = jQuery.Deferred();

        return this.api.loadInstitutionalData(dataset, institution_id, term_id).then(
            function(data) {
                console.log('DataService.loadInstitutionalData received data');
                console.log(data);
                if ($.isArray(data)) {
                    dfd.resolve(data);
                }
                else {
                    dfd.resolve([]);
                }
                return dfd.promise();
            },
            function(err) {
                dfd.reject(err);
                return dfd.promise();
            }
        );
    }
};

class DataSources {

    constructor() {
        this.dataSources = {};
    }

    /*
    createDataSources() {
        const dfd = jQuery.Deferred(); 

        $('#please_wait').find('#dots').text('.');
        return this.createDataSource('initial').then(function() {
            return new Promise((resolve, reject) => setTimeout(resolve, 1000));
        }).then(() => {
            $('#please_wait').find('#dots').text('. .');
            return this.createDataSource('progress');
        }).then(function() {
            return new Promise((resolve, reject) => setTimeout(resolve, 1000));
        }).then(() => {
            $('#please_wait').find('#dots').text('. . .');
            return this.createDataSource('initial', true);
        }).then(function() {
            return new Promise((resolve, reject) => setTimeout(resolve, 1000));
        }).then(() => {
            $('#please_wait').find('#dots').text('. . . .');
            return this.createDataSource('progress', true);
        }).then(function() {
            dfd.resolve('data sources created');
            return dfd.promise();
        }).catch(function(err) {
            dfd.reject(err);
            return dfd.promise();
        });
    }
    */

    async createDataSources() {
        //const dfd = jQuery.Deferred();

        //try {
            $('#please_wait').find('#dots').text('.');
            await this.createDataSource('initial');
            await new Promise((resolve, reject) => setTimeout(resolve, 1000));
            $('#please_wait').find('#dots').text('. .');
            await this.createDataSource('progress');
            await new Promise((resolve, reject) => setTimeout(resolve, 1000));
            $('#please_wait').find('#dots').text('. . .');
            await this.createDataSource('initial', true);
            await new Promise((resolve, reject) => setTimeout(resolve, 1000));
            $('#please_wait').find('#dots').text('. . . .');
            await this.createDataSource('progress', true);
            //dfd.resolve('succeeded');
            //return dfd.promise();
        //}
        
        //catch(err) {
        //    console.log('DataSources.createDataSources: caught error');
        //    console.log(err);
        //    dfd.reject(err);
        //    return dfd.promise();
        //}
    }

    // This does two things:
    // Removes any student from progress data who is in the progress data but not the initial data
    // Adds a compare = false key to any student in initial data who is not in progress data
    fix() {

        console.log('fixing data sources...');

        // check progress data to make sure every student is also in initial data
        let initialData = this.getData('initial');
        let progressData = this.getData('progress');
        for (let student_id in progressData) {
            // skip loop if the property is from prototype
            if (!progressData.hasOwnProperty(student_id)) {
                continue;
            }
            if (!(student_id in initialData)) {
                console.log(student_id + ' in progress but not in initial, deleting from progress');
                delete progressData[student_id];
            }
        }

        let instInitialData = this.getData('initial', 'institutional');
        let instProgressData = this.getData('progress', 'institutional');
        for (let student_id in instProgressData) {
            // skip loop if the property is from prototype
            if (!instProgressData.hasOwnProperty(student_id)) {
                continue;
            }
            if (!(student_id in instInitialData)) {
                console.log(student_id + ' in inst_progress but not in inst_initial, deleting from inst_progress');
                delete instProgressData[student_id];
            }
        }

        // check initial data and mark any student with key/value compare = false if they are not in progress data
        for (let student_id in initialData) {
            // skip loop if the property is from prototype
            if (!initialData.hasOwnProperty(student_id)) {
                continue;
            }
            if (!(student_id in progressData)) {
                console.log(student_id + ' in initial but not in progress, adding compare=false');
                initialData[student_id]['compare'] = false;
            }
        }

        for (let student_id in instInitialData) {
            // skip loop if the property is from prototype
            if (!instInitialData.hasOwnProperty(student_id)) {
                continue;
            }
            if (!(student_id in instProgressData)) {
                console.log(student_id + ' in inst_initial but not in inst_progress, adding compare=false');
                instInitialData[student_id]['compare'] = false;
            }
        }

        console.log(this.dataSources);
    }

    // populate the autocomplete arrays
    fillAutoComplete() {
        const initial_data = this.getData('initial');
        const progress_data = this.getData('progress');

        const sort_function = function(a, b) {
            if (a.label.toLowerCase() > b.label.toLowerCase()) {
                return 1;
            }
            if (a.label.toLowerCase() < b.label.toLowerCase()) {
                return -1;
            }
            return 0;
        };

        // create autocomplete for initial reports
        for (let student_id in initial_data) {
            if (!(initial_data.hasOwnProperty(student_id))) {
                continue;
            }   
            const name = initial_data[student_id].name.replace('%20', ' ');
            ACES.preAutoComplete.push({ label: name, value: student_id });
        }
        
        ACES.preAutoComplete.sort(sort_function);
        ACES.preAutoComplete.unshift('All Students');

        // create autocomplet for all other reports
        for (let student_id in progress_data) {
            if (!(progress_data.hasOwnProperty(student_id))) {
                continue;
            }   
            const name = initial_data[student_id].name.replace('%20', ' ');
            ACES.postAutoComplete.push({ label: name, value: student_id });
        }
        
        ACES.postAutoComplete.sort(sort_function);
        ACES.postAutoComplete.unshift('All Students');
    }

    getNumberStudents(report, subreport) {
        return Object.keys(this.getData(report, subreport)).length;
    }

    updateStudentNumbers() {

        const init_completed = this.getNumberStudents('initial', 'institutional');
        const prog_completed = this.getNumberStudents('progress', 'institutional');
        const init_text = init_completed === 1 ? ' student has' : ' students have';
        const prog_text = prog_completed === 1 ? ' student has' : ' students have';

        $('#initial_institutional_num_students').text(init_completed + init_text + ' completed the ACES Initial self-assessment at your institution this term.');

        $('#progress_institutional_num_students').text(prog_completed + prog_text + ' completed the Progress instance of ACES at your institution this term.');

        $('#comparison_institutional_num_students').text(prog_completed + prog_text + ' completed both the Initial and the Progress instances of ACES at your institution this term.');

        $('#change_institutional_num_students').text(prog_completed + prog_text + ' completed both the Initial and the Progress instances of ACES at your institution this term.');
    }

    createDataSource(type, institutional = false) {
        const dfd = jQuery.Deferred();

        console.log('DataSources.createDataSource(' + type + ', ' + institutional + ')');
        let name = type;
        if (institutional) {
            name = 'inst_' + name;
        }
        
        this.dataSources[name] = new DataSource(type, institutional);

        return this.dataSources[name].loadDataSource().then(
            function(data) {
                dfd.resolve(data);
                return dfd.promise();
            },
            function(err) {
                console.log('DataSources.createDataSource: loadDataSource failed:');
                console.log(err);
                dfd.reject(err);
                return dfd.promise();
            }
        );
    }

    getData(type, subtype) {
        let name = type;
        if (subtype === 'institutional') {
            name = 'inst_' + name;
        }
        console.log('getData: serving ' + name + ' data source');

        return this.dataSources[name].userData;
    }

};

class DataSource {

    constructor(dataSetId, institutional = false) {
        console.log('DataSource.constructor(' + dataSetId + ', ' + institutional + ')');
        this.dataSetId = dataSetId;
        this.institutional = institutional;
        this.userData = {};
    }

    get data() {
        return this.userData;
    }

    get ACESDataSetId() {
        if (this.dataSetId == 'initial') {
            return 'aces';
        }
        else {
            return 'acespost';
        }
    }

    // this needs to return a promise
    loadDataSource() {
        console.log('DataSource.loadDataSource: ' + this.dataSetId + ',' + this.institutional);

        const dfd = jQuery.Deferred();

        const dataset = this.dataSetId === 'progress' ? 'acespost' : 'aces';
        const institutionId = this.institutional ? ACES.institutionId : undefined;

        return ACES.data_service.getData(dataset, institutionId, ACES.termId).then(
            (student_data) => {
                console.log('DataSource.getData succeeded');
                console.log(student_data);

                    for (let i = 0; i < student_data.length; i++) {
                        if (student_data[i].DataSetId !== this.ACESDataSetId) {
                            continue;
                        }
                        let tempObj = JSON.parse(student_data[i].Value.v);
                        tempObj.rawScores = {};

                        console.log('isComplete = ' + tempObj.isComplete);
                        console.log(typeof tempObj.isComplete);
                        console.log('isInstructor = ' + tempObj.isInstructor);
                        console.log(typeof tempObj.isInstructor);

                        //const isComplete = tempObj.isComplete;
                        //const isInstructor = parseInt(tempObj.isInstructor);
                        if (tempObj.isComplete !== 0 && tempObj.isInstructor !== 1) {
                            //convert scores to percentiles
                            for (let key in tempObj.scores) {
                                if (tempObj.scores.hasOwnProperty(key)) {
                                    // we need to save the raw scores for the Change reports
                                    // so we can calculate percentage changed
                                    tempObj.rawScores[key] = tempObj.scores[key];
                                    tempObj.scores[key] = ACES.table[key][tempObj.scores[key]];
                                }
                            }
            
                            let userid = String(student_data[i].UserId);
                            this.userData[userid] = tempObj;
                        }
                    }
                    console.log('loaded ' + this.dataSetId + ' (' + this.institutional + ') data');
                    console.log(this.userData);
                    dfd.resolve("succeeded");
                    return dfd.promise();
                },
                function(err) {
                    console.log('DataSource.loadDataSource: getData failed');
                    console.log(err);
                    dfd.reject(err);
                    return dfd.promise();
                }
        );
    }
};

class MainTabs {

    constructor() {
        $("#tabs").tabs({
            active: 0,
            activate: function( event, ui ) {
                if (ACES.radio_buttons.activeSubtype === undefined) {
                    $('#' + ACES.main_tabs.activeTab + '_class').trigger('click');
                    $('#' + ACES.main_tabs.activeTab + '_class_radio').addClass('selected');
                }
            }
        });
    }

    get activeTab() {
        return $("#main_tab > .ui-tabs-active").attr('aria-controls');
    }

};

class Printer {

    constructor() {

    }

    print() {

        this.updateACESPrintHeaderInfo();

        let $report_html = $('#' + ACES.main_tabs.activeTab + '_report_display');
        ACES.html_to_print = $report_html.html();
        var win = window.open('asset/print_page.html', 'printwindow');
    }

    // this updates the various ACES data that the print page will need
    // to print the header info
    updateACESPrintHeaderInfo() {
        let type = ACES.main_tabs.activeTab;
        let $reportDiv = $('#'+type);
        let subtype = ACES.radio_buttons.activeSubtype;

        ACES.report_title = $reportDiv.find('h3').text();
        ACES.px_term = "Not implemented yet";

        if (subtype == 'roster') {
            ACES.measure_name = ACES.measure_names[$('#'+type+'_scale').val()-2].value;
            ACES.report_title = ACES.report_title.replace(/ for .*/, '');
        }
        else {
            ACES.measure_name = null;
        }
    }
};

class Exporter {

    constructor() {

    }

    studentRanks() {
        let type = ACES.main_tabs.activeTab === 'progress' ? 'progress' : 'initial';
        let class_data = ACES.data.getData(type);
        let csv = 'Name';

        for (let i = 0; i < ACES.measure_names.length; i++) {
            csv += ',' + ACES.measure_names[i].value;
        }

        for (let key in class_data) {
            if (class_data.hasOwnProperty(key)) {
                let student = class_data[key];
                let student_name = ACES_UTILS.clean_name_csv(student.name);
                let line = student_name + ',';
                for (let scale in student.scores) {
                    if (student.scores.hasOwnProperty(scale)) {
                        line += student.scores[scale] + ',';
                    }
                }
                line = line.substring(0, line.length - 1);
                csv += '\n' + line;
            }
        }

        this._sendData(csv, 'student-ranks');
    }

    studentChange() {
        const classData = ACES.data.getData('initial');
        const classDataCompare = ACES.data.getData('progress');
        let csv = 'Name';

        for (let i = 0; i < ACES.measure_names.length; i++) {
            csv += ',' + ACES.measure_names[i].value;
        }

        for (let student_id in classDataCompare) {
            csv += '\n' + ACES_UTILS.clean_name_csv(classData[student_id].name);
            for (let i = 0; i < ACES.measure_names.length; i++) {
                const preScore = Number(classData[student_id].rawScores[(i+2)]);
                const postScore = Number(classDataCompare[student_id].rawScores[(i+2)]);
                let scoreChange = 0;

                if (postScore > preScore) {
                    scoreChange = ((postScore - preScore)/preScore) * 100;
                    scoreChange = Math.round(scoreChange * 10) / 10;
                }
                else if (postScore < preScore) {
                    scoreChange = ((preScore - postScore)/preScore) * 100;
                    scoreChange = Math.round(scoreChange * 10) / 10;
                    scoreChange *= -1;
                }
                csv += ',' + scoreChange;
            }
        }

        this._sendData(csv, 'class-data');

    }

    institutionalChange() {
        const classData = ACES.data.getData('initial', 'institutional');
        const classDataCompare = ACES.data.getData('progress', 'institutional');
        let csv = 'Scale,Percent Change';

        for (let i = 0; i < ACES.measure_names.length; i++) {
            const row = {};
            const shortName = ACES.measure_names[i].key;

            csv += '\n' + ACES.measure_names[i].value;

            [row.preAverage, row.postAverage] = ReportGenerator.getAverageScores(shortName, classData, classDataCompare);

            if (row.postAverage > row.preAverage) {
                row.averageChange = ((row.postAverage - row.preAverage)/row.preAverage) * 100;
                row.averageChange = Math.round(row.averageChange * 10) / 10;
            }
            else if (row.postAverage < row.preAverage) {
                row.averageChange = ((row.preAverage - row.postAverage)/row.preAverage) * 100;
                row.averageChange = Math.round(row.averageChange * 10) / 10;
                row.averageChange *= -1;
            }
            else {
                row.averageChange = 0;
            }

            csv += ',' + row.averageChange;
           
        }

        this._sendData(csv, 'institutional-data');
    }

    demographics() {
        // Demographics are only in the initial report data source
        const initial_data = ACES.data.getData('initial');
        const class_data = ACES.main_tabs.activeTab == 'progress' ? ACES.data.getData('progress') : initial_data;
        let csv = 'Name';

        for (let i = 0; i < ACES.demographic_keys.length; i++) {
            csv += ',' + ACES.demographic_keys[i];
        }

        for (let key in class_data) {
            if (class_data.hasOwnProperty(key)) {
                const student = initial_data[key];
                const student_name = ACES_UTILS.clean_name_csv(student.name);
                let line = student_name + ',';

                for (let i = 0; i < ACES.demographic_keys.length; i++) {
                    let demo = initial_data[key].demographics[ACES.demographic_keys[i]];
                    // demo may be undefined because we have added three
                    // new demo questions
                    if (demo !== undefined) {
                        // brb: parens from questions 98 & 99
                        demo = demo.replace(/ \(.*\)/, '');
                        // brb: remove any commas
                        demo = demo.replace(/[,"]/g, '');
                        line += demo + ',';
                    }
                }

                line = line.substring(0, line.length - 1);
                csv += '\n' + line;
            }
        }

        // Send 'false' as second arg because we don't want the report
        // type to show up in the file name since demographic data doesn't
        // depend on the report type.
        // Changing this to true since they want the Demo link on the Progress
        // reports to only show students who have completed the ACES Progress
        // activity.
        this._sendData(csv, 'demographics', true);
    }

    // This combines student ranks for both initial and progress
    comparisonData() {
        const class_data_initial = ACES.data.getData('initial');
        const class_data_progress = ACES.data.getData('progress');
        let csv = 'Name,Initial/Progress';

        for (let i = 0; i < ACES.measure_names.length; i++) {
            csv += ',' + ACES.measure_names[i].value;
        }

        for (let student_id in class_data_progress) {
            if (class_data_progress.hasOwnProperty(student_id)) {
                // first get initial ranks
                const student_initial = class_data_initial[student_id];
                const student_name = ACES_UTILS.clean_name_csv(student_initial.name);
                let line = student_name + ',Initial,';
                for (let scale in student_initial.scores) {
                    if (student_initial.scores.hasOwnProperty(scale)) {
                        line += student_initial.scores[scale] + ',';
                    }
                }
                line = line.substring(0, line.length - 1);
                csv += '\n' + line;
                // then get progress ranks
                const student_progress = class_data_progress[student_id];
                line = student_name + ',Progress,';
                for (let scale in student_progress.scores) {
                    if (student_progress.scores.hasOwnProperty(scale)) {
                        line += student_progress.scores[scale] + ',';
                    }
                }
                line = line.substring(0, line.length - 1);
                csv += '\n' + line;
            }
        }

        this._sendData(csv, 'student-ranks');
    }

    institutionalData() {
        let type = ACES.main_tabs.activeTab;
        let class_data;
        let class_data_compare;
        let csv = 'Scale,Low,Moderate,High\n';

        if (type === 'initial' || type === 'progress') {
            class_data = ACES.data.getData(type, 'institutional');
        }
        else if (type === 'comparison') {
            class_data = ACES.data.getData('initial', 'institutional');
            class_data_compare = ACES.data.getData('progress', 'institutional');
            csv = 'Scale,Initial/Progress,Low,Moderate,High\n';
        }

        const percentages = {low: 0, mid: 0, high: 0};
        const percentagesCompare = {low: 0, mid: 0, high: 0};
        for (let i = 0; i < ACES.measure_names.length; i++) {
            ReportGenerator.getRowPercentages(class_data, String(i+2), percentages);
            if (type === 'comparison') {
                csv += ACES.measure_names[i].value + ',Initial,' + percentages.low + ',' + percentages.mid + ',' + percentages.high + '\n';
            }
            else {
                csv += ACES.measure_names[i].value + ',' + percentages.low + ',' + percentages.mid + ',' + percentages.high + '\n';
            }

            if (type === 'comparison') {
                ReportGenerator.getRowPercentages(class_data_compare, String(i+2), percentagesCompare);
                csv += ACES.measure_names[i].value + ',Progress,' + percentagesCompare.low + ',' + percentagesCompare.mid + ',' + percentagesCompare.high + '\n';
            }
        }

        this._sendData(csv, 'institutional-data');
    }

    get hiddenForm() {
        return $('#hidden_form').find('iframe');
    }

    _sendData(data, name, include_report=true) {
        let $form = this.hiddenForm;
        $form.contents().find('#data').val(data);
        let filename = this._generateCSVFilename(name, include_report);
        $form.contents().find('#file_name').val(filename);
        $form.contents().find('#data_form').submit();
    }

    _generateCSVFilename(download_type, include_report=true) {
        let d = new Date();
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();

        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }

        const report_name = include_report ? ACES.main_tabs.activeTab + '-' : '';
        const filename = 'ACES-' + report_name + download_type + '-' + year + '-' + month + '-' + day + '.csv';
        return filename;
    }
}

class RadioButtons {

    constructor() {

        $('.intro_header input[type="radio"]').on("change, click", this, function (event) {
            var value = $(event.target).val();

            if (value === 'class') {
                ACES.class_report.show();
            }
            else if (value === 'roster') {
                ACES.roster_report.show();
            }
            else if (value === 'institutional') {
                ACES.institutional_report.show();
            }
            else {
                console.log('can\'t find value for radio button');
            }
        });

        $('input[type="radio"]').each(function() {
            $(this)[0].checked = false;
        });

    }

    get activeSubtype() {
        const type = ACES.main_tabs.activeTab;
        const $reportDiv = $('#'+type);
        const $fieldset = $reportDiv.find('fieldset');
        let subtype;
        
        $fieldset.find('input').each(function() {
            const $this = $(this);
            //if ($this.is(':checked')) {
            if ($this[0].checked) {
                subtype = $this.val();
            }
        });
        
        return subtype;
    }
};

// do not instantiate
class Report {

    constructor() {

    }

    createColorKey() {
        this.addSingleColorKey($('[data-report_type="initial_'+this.subtype+'"] .color_key'));
        this.addSingleColorKey($('[data-report_type="progress_'+this.subtype+'"] .color_key'));
        this.addDoubleColorKey($('[data-report_type="comparison_'+this.subtype+'"] .color_key'));
    }

    addSingleColorKey($div) {
        $div.html('<span class="key color_key_high">High</span><span class="key color_key_moderate">Moderate</span><span class="key color_key_low">Low</span>');
    }

    addDoubleColorKey($div) {
        $div.html('<div class="key_text"><span class="initial_text">Initial</span><span class="progress_text">Progress</div></div>' +
            '<div class="double"><span class="key color_key_init_high"></span><span class="key color_key_high">High</span></div>' +
            '<div class="double"><span class="key color_key_init_moderate"></span><span class="key color_key_moderate">Moderate</span></div>' +
            '<div class="double"><span class="key color_key_init_low"></span><span class="key color_key_low">Low</span></div>');
    }

    show() {
        // always enable the intro content for the report
        this.reportDiv.find('.report_intro').attr('aria-hidden', 'true');
        this.reportDiv.find('[data-report_type="' + this.type + '_' + this.subtype + '"]').attr('aria-hidden', 'false');

        // display links if we have students for this report
        if (this.studentsAvailable()) {
            this.displayLinks();
        }
        else {
            $('#' + this.type + '_report_display_links').html('');
        }
    }

    studentsAvailable() {
        if (this.type === 'initial') {
            if (Object.keys(ACES.data.getData('initial', this.subtype)).length < 1) {
                return false;
            }
        }
        else {
            if (Object.keys(ACES.data.getData('progress', this.subtype)).length < 1) {
                return false;
            }
        }
        return true;
    }

    noStudentsAvailableMessage() {
        if (this.type === 'initial') {
            if (this.subtype !== 'institutional') {
                this.reportDisplayDiv.html('<p>Currently, zero students have completed the ACES Initial Activity in your class.</p>');
            }
            else {
                this.reportDisplayDiv.html('<p>Currently, zero students have completed the ACES Initial Activity at your institution.</p>');
            }
        }
        else {
            if (this.subtype !== 'institutional') {
                this.reportDisplayDiv.html('<p>Currently, zero students have completed the ACES Progress Activity in your class.</p>');
            }
            else {
                this.reportDisplayDiv.html('<p>Currently, zero students have completed the ACES Progress Activity at your institution.</p>');
            }
        }
    }

    // returns name of current report selected (i.e. current tab selected)
    get type() {
        return ACES.main_tabs.activeTab;
    }

    // returns jQuery object for the main report div
    get reportDiv() {
        return $('#' + this.type);
    }

    // returns jQuery object for div where report is displayed
    get reportDisplayDiv() {
        return $('#' + this.type + '_report_display');
    }

    displayLinks() {

        let html = '<div class="report_links" data-type="' + this.type + '" data-subtype="' + this.subtype + '">' +
            '<a href="#" class="print_report">Print Report</a>' +
            this.linkHTML +
            '</div>';

        $('#' + this.type + '_report_display_links').html(html);
    }

    // should be implemented by each child class
    get linkHTML() {
        return '';
    }
};

class ClassReport extends Report {

    constructor() {
        super();
        this.subtype = 'class';

        // set up Student autocomplete functionality
        this.enableAutoComplete('initial', ACES.preAutoComplete);
        this.enableAutoComplete('progress', ACES.postAutoComplete);
        this.enableAutoComplete('comparison', ACES.postAutoComplete);
        this.enableAutoComplete('change', ACES.postAutoComplete);
        this.addHandlers();
        this.createColorKey();
    }

    addHandlers() {

        // handlers for the category and student names in the rankings tabs
        $('.report_display').on('click', this, function (event) {
            var $target = $(event.target);
            if ($target.hasClass('topic_link_text')) {
                event.preventDefault();
                ACES.toggle_topic_link($target.parent());
            }
            else if ($target.hasClass('topic_link')) {
                event.preventDefault();
                ACES.toggle_topic_link($target);
            }
            else if ($target.hasClass('class_user_details')) {
                event.preventDefault();
                var href = $target.attr('href');
                if (/^#user/.test(href)) {
                    var student_id = href.replace('#user/', '');
                    event.data.showFromRoster(student_id);
                }
            }
            else if ($target.hasClass('roster_user_details')) {
                event.preventDefault();
                var href = $target.attr('href');
                if (/^#user/.test(href)) {
                    var student_id = href.replace('#user/', '');
                    event.data.showFromRoster(student_id);
                }
            }
        });

    }

    enableAutoComplete(type, array_src) {
        let this_context = this;
        $('#' + type + '_student').autocomplete({
            minLength: 0,
            //source: array_src,
            source: function(request, response) {
                const isMouseClick = request.term === 'mouseclick';
                console.log('source');
                console.log(request);
                console.log(response);
                console.log(this);
                let report_type = ACES.main_tabs.activeTab;
                let current_student_id = $('#'+report_type+'_student').attr('data-studentid');
                
                const term = isMouseClick ? $(this.element).val().toLowerCase() : request.term.toLowerCase();
                console.log('term = ' + term);
                const matchingTags = $.grep(array_src, function(tag) {
                    if (typeof tag === 'string') {
                        return tag.toLowerCase().indexOf(term) >= 0; 
                    }
                    else {
                        return tag.label.toLowerCase().indexOf(term) >= 0;
                    }
                });
                
                console.log(matchingTags);

                // display all students if input box is empty
                // or it has 'All Students'
                if (term === '' || term === 'all students') {
                    response(array_src);
                }
                // don't display drop down if there is only one entry and 
                // it is for the current student in the input box
                else if (matchingTags.length === 1 && current_student_id === matchingTags[0].value) {
                    if (isMouseClick) {
                        response(array_src);
                    }
                    else {
                        response([]);
                    }
                }
                // display all matches
                else {
                    // right now we are always going to show the full
                    // student list for a mouse click but this may change
                    if (isMouseClick) {
                        response(array_src);
                    }
                    else {
                        response(matchingTags);
                    }
                }
            },
            delay: 0,
            autoFocus: true,
            select: function (event, ui) {
                // if the item selected has a ui value and label then that 
                // means we need to store the student id (value) so we 
                // can use it to generate a student report
                if (ui.item !== undefined && ui.item.value !== undefined &&
                    ui.item.label !== undefined) {
                    event.preventDefault();
                    ACES.setStudentInputId(type, ui.item.value, ui.item.label);
                    this_context.show();
                }
            },
            focus: function (event, ui) {
                // this prevents the input box value from updating when
                // we are scrolling through select with keyboard
                event.preventDefault();
            },
        }).focus(function () {
            $(this).autocomplete("search");
        }).val('All Students');

        $('#' + type + '_student').click(function() {
            $('#' + type + '_student').autocomplete('search', 'mouseclick');
        });
        $('#' + type + '_student').keydown(function(e) {
            // delete key: clear the student input box
            if (e.which === 46) {
                var $target = $(e.target);
                $target.val('');
                $target.autocomplete('search');
            }
        });
    }

    show(id) {
        super.show();

        if (!this.studentsAvailable()) {
            this.noStudentsAvailableMessage();
            return;
        }

        // there are two different types of class report, one for the 
        // entire class and one for an individual student
        let student_id = id || $('#' + this.type + '_student').attr('data-studentid');

        if (student_id === undefined || student_id === '' ||
            student_id === 'All Students') {
            this.showAll();
        }
        else {
            this.showStudent(student_id);
        }
    }

    // This is used to show the student info when the user clicks on a 
    // student name in the Roster report.
    // We are also going to use then when they click on a student name
    // in the Class report while viewing All Students.
    showFromRoster(student_id) {

        console.log('showFromRoster');
        ACES.student_info_id = student_id;
        ACES.student_info_report_type = ACES.main_tabs.activeTab;
    
        // A little hack to force the student window to gain focus
        // even it if already exists.
        if (student_id in ACES.student_windows) {
            ACES.student_windows[student_id].close();
        }
        ACES.student_windows[student_id] = window.open('asset/student_info.html', 'win_'+student_id);
    }

    get linkHTML() {
        let html = '';
        if (this.type === 'initial' || this.type === 'progress') {
            html += '<a href="#" class="export_ranks">Export Student Ranks</a>' + '<a href="#" class="export_demo">Export Demographic Data</a>';
        }
        else if (this.type === 'comparison') {
            html += '<a href="#" class="export_comparison_data">Export Data</a>'; 
        }
        else if (this.type === 'change') {
            html += '<a href="#" class="export_student_change">Export Change Data</a>';
        }
        return html;
    }

    showAll() {
        // set h3
        var report_title = ACES_UTILS.capitalize(this.type) + ' Class Report';
        $('#' + this.type + '_h3').text(report_title);

        // for printing
        ACES.student_name = null;
        ACES.report_title = report_title;

        if (this.type === 'change') {
            ReportGenerator.percentage(this);
        }
        else {
            ReportGenerator.category(this);
        }
    }

    // display_div is optional and is the 'div' element where the results 
    // should be displayed. This will be set when we are opening a student
    // report from the Roster report.
    showStudent(student_id, display_div) {
        console.log('showStudent');
        console.log(display_div);

        let type = this.type;

        // Set student input box. We don't want to do this if this is 
        // a link from the Roster report.
        if (display_div === undefined) {
            var $input = $('#' + type + '_student');
            $input.attr('data-studentid', student_id).val(ACES.getName(student_id));
        }

        var student_name = ACES.getName(student_id);
        var report_title = ACES_UTILS.capitalize(type) + ' Report for ' + student_name;

        if (display_div === undefined) {
            $('#' + type + '_h3').text(report_title);
        }

        // for printing
        ACES.student_name = student_name;
        ACES.report_title = report_title;

        if (this.type === 'change') {
            console.log('ClassReport.showStudent() calling ReportGenerator.percentage');
            ReportGenerator.percentage(this, student_id, display_div);
        }
        else {
            console.log('ClassReport.showStudent() calling ReportGenerator');
            ReportGenerator.category(this, student_id, display_div);
        }
    }
};

class RosterReport extends Report {

    constructor(type) {
        super(type);
        this.subtype = 'roster';
        this.createColorKey();
    }

    show() {
        super.show();

        if (!this.studentsAvailable()) {
            this.noStudentsAvailableMessage();
            return;
        }

        let measure_name = ACES.measure_names[$('#'+this.type+'_scale').val() - 2].value;

        // set h3
        var report_title = ACES_UTILS.capitalize(this.type) + ' Roster Report for ' + measure_name;

        $('#' + this.type + '_h3').text(report_title);

        // for printing
        ACES.student_name = null;
        ACES.report_title = ACES_UTILS.capitalize(this.type) + ' Roster Report';
        ACES.measure_name = measure_name;

        if (this.type === 'change') {
            ReportGenerator.percentage(this); 
        }
        else {
            ReportGenerator.roster(this);
        }
    }

    get linkHTML() {
        let html = '';
        if (this.type === 'initial' || this.type === 'progress') {
            html += '<a href="#" class="export_ranks">Export Student Ranks</a>' + '<a href="#" class="export_demo">Export Demographic Data</a>';
        }
        else if (this.type === 'comparison') {
            html += '<a href="#" class="export_comparison_data">Export Data</a>'; 
        }
        else if (this.type === 'change') {
            html += '<a href="#" class="export_student_change">Export Change Data</a>';
        }
        return html;
    }
};

class InstitutionalReport extends Report {

    constructor(type) {
        super(type);
        this.subtype = 'institutional';
        this.createColorKey();
    }

    show() {
        super.show();

        if (!this.studentsAvailable()) {
            this.noStudentsAvailableMessage();
            return;
        }

        // set h3
        var report_title = ACES_UTILS.capitalize(this.type) + ' Institutional Report';
        $('#' + this.type + '_h3').text(report_title);

        // for printing
        ACES.student_name = null;
        ACES.report_title = report_title;

        $('#' + this.type + '_h3').text(report_title);

        if (this.type === 'change') {
            console.log('InstitutionalReport.show() calling ReportGenerator');
            ReportGenerator.percentage(this);
        }
        else {
            console.log('InstitutionalReport.show() calling ReportGenerator');
            ReportGenerator.category(this);
        }
    }

    get linkHTML() {
        if (this.type === 'change') {
            return '<a href="#" class="export_institutional_change">Export Change Data</a>';
        }
        return '<a href="#" class="export_data">Export Data</a>';
    }

};

class ReportGenerator {

    constructor() {

    }

    // Creates the percentages report for Change tab.
    // display_div is passed in if this was a student name link on the Roster report.
    static percentage(report, student_id, display_div) {

        if (report.subtype === 'class' || report.subtype == 'institutional' ||
            display_div !== undefined) {
            ReportGenerator.percentageCategory(report, student_id, display_div);
        }
        if (report.subtype === 'roster') {
            ReportGenerator.percentageRoster(report);
        }
    }

    static percentageRoster(report) {
        console.log('ReportGenerator.percentageRoster(' + report.type + ')');
        
        const measure = $('#'+report.type+'_scale').val();
        const rowCollection = [];

        // only Change->Roster should use this report
        if (report.type !== 'change') {
            console.log('ERROR: ' + report.type + '.' + report.subtype + ' trying to call ReportGenerator.percentageRoster');
            return;
        }

        const classData = ACES.data.getData('initial', report.subtype);
        const classDataCompare = ACES.data.getData('progress', report.subtype);
        let largestPercent = 0;
        const percentages = {};

        // We go through the students in classDataCompare because there may
        // be students in classData (initial scores) who didn't complete the
        // progress test and we only want to include students who completed
        // both.
        for (let student_id in classDataCompare) {
            const row = {};

            row.preScore = Number(classData[student_id].rawScores[measure]);
            row.postScore = Number(classDataCompare[student_id].rawScores[measure]);

            if (row.postScore > row.preScore) {
                row.scoreChange = ((row.postScore - row.preScore)/row.preScore) * 100;
                row.scoreChange = Math.round(row.scoreChange * 10) / 10;
            }
            else if (row.postScore < row.preScore) {
                row.scoreChange = ((row.preScore - row.postScore)/row.preScore) * 100;
                row.scoreChange = Math.round(row.scoreChange * 10) / 10;
                row.scoreChange *= -1;
            }
            else {
                row.scoreChange = 0;
            }

            if (Math.abs(row.scoreChange) > largestPercent) {
                largestPercent = Math.abs(row.scoreChange);
            }

            percentages[student_id] = row;
        }

        let scale = 0;

        for (let student_id in classDataCompare) {

            if (!(classDataCompare.hasOwnProperty(student_id))) {
                continue;
            }

            let html = '';
            const row = {};
            const student_name = ACES.getName(student_id);

            row.student_name = student_name;
            row.scoreChange = percentages[student_id].scoreChange;
            row.preScore = percentages[student_id].preScore;
            row.postScore = percentages[student_id].postScore;

            html += '<div class="report_summary_row">';
            html += '<div class="topic">';
            html += '<h4><a class="roster_user_details" href="#user/' + student_id + '">' + student_name + '<span class="visually-hidden">, opens in new window</span></a></h4>';
            html += '</div>';
            html += '<div class="results_right">';

            html += '<div class="percent_bar" aria-hidden="true">';

            let bar_width = 0;

            /*
            if (largestPercent <= 10) {
                // we have 66% 
                bar_width = Math.abs(row.scoreChange) * 10 * .667;
                scale = 6;
            }
            else if (largestPercent <= 20) {
                bar_width = Math.abs(row.scoreChange) * 5 * .667;
                scale = 6;
            }
            else if (largestPercent <= 40) {
                bar_width = Math.abs(row.scoreChange) * 2.5 * .667;
                scale = 6;
            }
            else if (largestPercent <= 50) {
                bar_width = Math.abs(row.scoreChange) * 2 * .667;
                scale = 6;
            }
            else if (largestPercent <= 100) {
                bar_width = Math.abs(row.scoreChange) * .667;
                scale = 6;
            }
            else if (largestPercent <= 200) {
                bar_width = Math.abs(row.scoreChange) * 0.5 * .667;
                scale = 6;
            }
            */

            // Editorial has decided that the always want the scale to be 
            // 0-100%

            bar_width = Math.abs(row.scoreChange) * .8;
            scale = 6;
            // If the percentage is over 100% then max it out at 100
            if (row.scoreChange > 100) {
                bar_width = 100 * .8;
            }

            let title_text = '';
                if (ACES.testing) {
                    title_text = 'From ' + row.preScore + ' to ' + row.postScore;
                }

            if (row.scoreChange > 0) {
                html += '<span class="percent increase"><span class="percentage" style="width: ' + bar_width + '%" title="' + title_text + '"></span><span class="number">' + row.scoreChange + '%</span></span>';
            }
            else if (row.scoreChange < 0) {
                html += '<span class="percent decrease"><span class="percentage" style="width: ' + bar_width + '%" title="' + title_text + '"></span><span class="number">' + row.scoreChange + '%</span></span>';
            }
            else {
                html += '<span class="percent zero"><span class="number">0%</span></span>';
            }

            html += '</span>';

            html += '</div>';

            html += '</div></div>';

            row.html = html;
            rowCollection.push(row);
        
        } // end for

        //console.log('rowCollection');
        //console.log(rowCollection);

        const order = $('#' + report.type + '_scale_order_by').val();
        let sort_function = function(a, b) {
            if (a.student_name.toLowerCase() > b.student_name.toLowerCase()) {
                return 1;
            }
            if (a.student_name.toLowerCase() < b.student_name.toLowerCase()) {
                return -1;
            }
            return 0;
        };

        if (order == 'lowest') {
            sort_function = function(a, b) {
                return (a.scoreChange - b.scoreChange);
            };
        }

        if (order == 'highest') {
            sort_function = function(a, b) {
                return (b.scoreChange - a.scoreChange);
            };
        }

        rowCollection.sort(sort_function);

        let h = '';
        for (let i = 0; i < rowCollection.length; i++) {
            h += rowCollection[i].html;
        }

        if (scale === 6) {
            h += '<div id="change_canvas"><span class="percentile"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile"></div>';
        }
        else {
            h += '<div id="change_canvas"><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span></div>';
        }

         // display report
         report.reportDisplayDiv.html(h);
    }

    static percentageCategory(report, student_id, display_div) {
        console.log('ReportGenerator.percentageCategor(' + report.type + ')');

        const classData = ACES.data.getData('initial', report.subtype);
        const classDataCompare = ACES.data.getData('progress', report.subtype);

        const rowCollection = [];
        let largestPercent = 0;
        const percentages = {};

        for (let i = 0; i < ACES.measure_names.length; i++) {
            let row = {};
            let shortName = ACES.measure_names[i].key;

            if (student_id !== undefined) {
                row.preAverage = Number(classData[student_id].rawScores[shortName]);
                row.postAverage = Number(classDataCompare[student_id].rawScores[shortName]);
            }
            else {
                [row.preAverage, row.postAverage] = ReportGenerator.getAverageScores(shortName, classData, classDataCompare);
            }

            if (row.postAverage > row.preAverage) {
                row.averageChange = ((row.postAverage - row.preAverage)/row.preAverage) * 100;
                row.averageChange = Math.round(row.averageChange * 10) / 10;
            }
            else if (row.postAverage < row.preAverage) {
                row.averageChange = ((row.preAverage - row.postAverage)/row.preAverage) * 100;
                row.averageChange = Math.round(row.averageChange * 10) / 10;
                row.averageChange *= -1;
            }
            else {
                row.averageChange = 0;
            }

            if (Math.abs(row.averageChange) > largestPercent) {
                largestPercent = Math.abs(row.averageChange);
            }

            percentages[shortName] = row;
        }

        let scale = 6;

        for (let i = 0; i < ACES.measure_names.length; i++) {

            let html = '';
            const row = {};
            const shortName = ACES.measure_names[i].key;
            const longName = ACES.measure_names[i].value;

            row.shortName = shortName;
            row.longName = longName;
            row.averageChange = percentages[shortName].averageChange;
            row.preAverage = percentages[shortName].preAverage;
            row.postAverage = percentages[shortName].postAverage;

            const zebra = i%2 === 0 ? " zebra" : "";

            html += '<div class="report_summary_row' + zebra + '">';
            html += '<div class="topic">';
            html += '<h4>' + longName + '</h4>';
            html += '</div>';
            html += '<div class="results_right">';

            html += '<div class="percent_bar" aria-hidden="true">';

            let bar_width = 0;

            /*
            if (largestPercent <= 10) {
                // we have 66% 
                bar_width = Math.abs(row.averageChange) * 10 * .667;
                scale = 6;
            }
            else if (largestPercent <= 20) {
                bar_width = Math.abs(row.averageChange) * 5 * .667;
                scale = 6;
            }
            else if (largestPercent <= 40) {
                bar_width = Math.abs(row.averageChange) * 2.5 * .667;
                scale = 6;
            }
            else if (largestPercent <= 50) {
                bar_width = Math.abs(row.averageChange) * 2 * .667;
                scale = 6;
            }
            else if (largestPercent <= 100) {
                bar_width = Math.abs(row.averageChange) * .667;
                scale = 6;
            }
            else if (largestPercent <= 200) {
                bar_width = Math.abs(row.averageChange) * 0.5 * .667;
                scale = 6;
            }
            */

            // Editorial has decided that the always want the scale to be 
            // 0-100%

            bar_width = Math.abs(row.averageChange) * .8;
            scale = 6;
            // If the percentage is over 100% then max it out at 100
            if (row.averageChange > 100) {
                bar_width = 100 * .8;
            }

            let title_text = '';
            if (ACES.testing) {
                title_text = 'From ' + row.preAverage + ' to ' + row.postAverage;
            }

            if (row.averageChange > 0) {
                html += '<span class="percent increase"><span class="percentage" style="width: ' + bar_width + '%" title="' + title_text + '"></span><span class="number">' + row.averageChange + '%</span></span>';
            }
            else if (row.averageChange < 0) {
                html += '<span class="percent decrease"><span class="percentage" style="width: ' + bar_width + '%" title="' + title_text + '"></span><span class="number">' + row.averageChange + '%</span></span>';
            }
            else {
                html += '<span class="percent zero"><span class="number">0%</span></span>';
            }

            html += '</span>';

            html += '</div>';

            html += '</div></div>';

            row.html = html;
            rowCollection.push(row);
        }

        const order = $('#' + report.type + '_' + report.subtype + '_order_by').val();

        //console.log('order = ' + order);

        var sort_function = function (a, b) {
            if (a.shortName * 1 > b.shortName * 1) {
                return 1;
            }
            if (a.shortName * 1 < b.shortName * 1) {
                return -1;
            }
            return 0;
        };

        if (student_id !== undefined) {
            if (order === 'lowest') {
                sort_function = function (a, b) {
                    return (a.averageChange - b.averageChange);
                };
            }
            else if (order === 'highest') {
                sort_function = function (a, b) {
                    return (b.averageChange - a.averageChange);
                }
            }
        }
        else {
            if (order === 'lowest') {
                sort_function = function (a, b) {
                    return (a.averageChange - b.averageChange);
                };
            }
            else if (order === 'highest') {
                sort_function = function (a, b) {
                    return (b.averageChange - a.averageChange);
                }
            }
        }

        rowCollection.sort(sort_function);

        let h = '';

        for (let i = 0; i < rowCollection.length; i++) {
            var row = rowCollection[i];
            h = h + row.html;

        }

        if (scale === 6) {
            h += '<div id="change_canvas"><span class="percentile"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile inner"></span><span class="percentile"></div>';
        }
        else {
            h += '<div id="change_canvas"><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span><span class="percentile"></span></div>';
        }


        // display report
        const report_div = (display_div !== undefined) ? display_div : report.reportDisplayDiv;
        report_div.html(h);
    }


    static getAverageScores(measure, pre_data, post_data) {

        let pre_score = 0;
        let post_score = 0;
        const num_students = Object.keys(post_data).length;

        // make sure we don't divide by 0
        if (num_students < 1) {
            return [0,0];
        }

        //console.log('num_students = ' + num_students);

        // Go through all students in both pre/post data and get their
        // scores for the measure
        for (let student in post_data) {
            if (!(post_data.hasOwnProperty(student))) {
                continue;
            }
            pre_score += Number(pre_data[student].rawScores[measure]);
            post_score += Number(post_data[student].rawScores[measure]);
        }

        // Math.round( number * 10 ) / 10;
        const pre_score_rounded = Math.round((pre_score/num_students) * 10) / 10;
        const post_score_rounded = Math.round((post_score/num_students) * 10) / 10;

        return [pre_score_rounded, post_score_rounded];

    }

    static roster(report) {
        console.log('ReportGenerator.roster(' + report.type + ')');
        console.log(report);
        const measure = $('#'+report.type+'_scale').val();
        const measure_name = ACES.measure_names[(measure -2)].value;

        let rowCollection = [];
        let classData;
        let classDataCompare;

        // if this is a comparison report then we need to pull pre/post data sources
        if (report.type === 'comparison') {
            classData = ACES.data.getData('initial', report.subtype);
            classDataCompare = ACES.data.getData('progress', report.subtype);
            console.log(classDataCompare);
        }
        else {
            classData = ACES.data.getData(report.type, report.subtype);
        }

        // If this is a comparison report then we want to go through students
        // in the compare data (progress) data source.
        let sourceClassData = report.type === 'comparison' ? classDataCompare : classData;

        //console.log('sourceClassData');
        //console.log(sourceClassData);

        for (let student in sourceClassData) {
            let percentages = {low: 0, mid: 0, high: 0};
            let percentagesCompare = {low: 0, mid: 0, high: 0};
            let rank = {original: '', compare: ''};

            if (sourceClassData.hasOwnProperty(student)) {

                let html = '';
                let row = {};
                let student_name = ACES.getName(student);
                
                row.percentage = classData[student].scores[measure];
                percentages.rawScore = classData[student].rawScores[measure];

                if (report.type === 'comparison') {
                    row.percentageCompare = classDataCompare[student].scores[measure];
                    percentagesCompare.rawScore = classDataCompare[student].rawScores[measure];
                }
                row.student_name = student_name;

                if (row.percentage <= 25) {
                    percentages.low = row.percentage;
                    rank.original = "Low";
                } 
                else if (row.percentage <= 75) {
                    percentages.mid = row.percentage;
                    rank.original = "Moderate";
                } 
                else {
                    percentages.high = row.percentage;
                    rank.original = "High";
                }

                if (report.type === 'comparison') {
                    if (row.percentageCompare <= 25) {
                        percentagesCompare.low = row.percentageCompare;
                        rank.compare = "Low";
                    }
                    else if (row.percentageCompare <= 75) {
                        percentagesCompare.mid = row.percentageCompare;
                        rank.compare = "Moderate";
                    }
                    else {
                        percentagesCompare.high = row.percentageCompare;
                        rank.compare = "High";
                    }
                }

                html += '<div class="report_summary_row">';
                html += '<div class="topic">';
                html += '<h4><a class="roster_user_details" href="#user/' + student + '">' + student_name + '<span class="visually-hidden">, opens in new window</span></a></h4>';
                html += '</div>';
                html += '<div class="results_right">';

                if (report.type !== 'comparison') {
                    html += ReportGenerator.getAriaRanksHTML(percentages, measure_name);
                    html += ReportGenerator.getProgressBarHTML(percentages);
                }
                else {
                    html += ReportGenerator.getAriaRanksHTML(percentages, measure_name, 'Initial');
                    html += ReportGenerator.getProgressBarHTML(percentages, 'initial');
                    html += ReportGenerator.getAriaRanksHTML(percentagesCompare, measure_name, 'Progress');
                    html += ReportGenerator.getProgressBarHTML(percentagesCompare, 'progress');
                }

                html += '</div></div>';


                row.html = html;
                rowCollection.push(row);
            }
        } // end for

        let order = $('#' + report.type + '_scale_order_by').val();
        let sort_function = function(a, b) {
            if (a.student_name.toLowerCase() > b.student_name.toLowerCase()) {
                return 1;
            }
            if (a.student_name.toLowerCase() < b.student_name.toLowerCase()) {
                return -1;
            }
            return 0;
        };

        if (report.type === 'comparison') {
            if (order == 'lowest') {
                sort_function = function(a, b) {
                    return (a.percentageCompare - b.percentageCompare);
                };
            }
            if (order == 'highest') {
                sort_function = function(a, b) {
                    return (b.percentageCompare - a.percentageCompare);
                };
            }
        }
        else {
            if (order == 'lowest') {
                sort_function = function(a, b) {
                    return (a.percentage - b.percentage);
                };
            }
            if (order == 'highest') {
                sort_function = function(a, b) {
                    return (b.percentage - a.percentage);
                };
            }
        }

        console.log('rowCollection');
        console.log(rowCollection);

        rowCollection.sort(sort_function);

        let h = '';
        for (let i = 0; i < rowCollection.length; i++) {
            h += rowCollection[i].html;
        }

         // display report
         report.reportDisplayDiv.html(h);
    }

    static category(report, student_id, display_div) {

        console.log('ReportGenerator.category()');
        console.log(report);
        console.log('student_id = ' + student_id);

        let classData;
        let classDataCompare;

        // if this is a comparison report then we need to pull pre/post data sources
        if (report.type === 'comparison') {
            classData = ACES.data.getData('initial', report.subtype);
            classDataCompare = ACES.data.getData('progress', report.subtype);
        }
        else {
            classData = ACES.data.getData(report.type, report.subtype);
        }

        let data = student_id !== undefined ? classData[student_id] : undefined;
        let dataCompare;
        if (report.type === 'comparison' && student_id !== undefined) {
            dataCompare = classDataCompare[student_id];
        }

        let rowCollection = [];

        let categoryLinks = false;
        if (report.type === 'initial' || report.type === 'progress') {
            if (report.subtype === 'class') {
                if (student_id === undefined || student_id === null || student_id === "All") {
                    categoryLinks = true;
                }
            }
        }

        for (var i = 0; i < ACES.measure_names.length; i++) {

            var html = '';
            var row = {};

            var shortName = ACES.measure_names[i].key;
            var longName = ACES.measure_names[i].value;

            row.shortName = shortName;
            row.longName = longName;
            if (student_id !== undefined) {
                row.score = data.scores[shortName];
                row.rawScore = data.rawScores[shortName];
                if (report.type === 'comparison') {
                    row.scoreCompare = dataCompare.scores[shortName];
                    row.rawScoreCompare = dataCompare.rawScores[shortName];
                }
            }

            let detail = '';
            let names = {
                lowNames: [],
                medNames: [],
                highNames: [],

            };
            let percentages = { low: 0, mid: 0, high: 0};
            let percentagesCompare = {low: 0, mid: 0, high: 0};
            var rank = {original: '', compare: ''};

            if (student_id !== undefined) {
                if (row.score <= 25) {
                    percentages.low = row.score;
                    rank.original = "Low";
                }
                else if (row.score <= 75) {
                    percentages.mid = row.score;
                    rank.original = "Moderate";
                }
                else {
                    percentages.high = row.score;
                    rank.original = "High";
                }
                percentages.rawScore = row.rawScore;
                if (report.type === 'comparison') {
                    if (row.scoreCompare <= 25) {
                        percentagesCompare.low = row.scoreCompare;
                        rank.compare = "Low";
                    }
                    else if (row.scoreCompare <= 75) {
                        percentagesCompare.mid = row.scoreCompare;
                        rank.compare = "Moderate";
                    }
                    else {
                        percentagesCompare.high = row.scoreCompare;
                        rank.compare = "High";
                    }
                    percentagesCompare.rawScore = row.rawScoreCompare;
                }
            }
            else {
                if (report.type !== 'comparison') {
                    ReportGenerator.getRowPercentages(classData, shortName, percentages, names);
                    row.lowPercentage = percentages.low;
                    row.midPercentage = percentages.mid;
                    row.highPercentage = percentages.high;
                }
                else {
                    ReportGenerator.getRowPercentages(classData, shortName, percentages);
                    row.lowPercentage = percentages.low;
                    row.midPercentage = percentages.mid;
                    row.highPercentage = percentages.high;

                    ReportGenerator.getRowPercentages(classDataCompare, shortName, percentagesCompare);
                    row.lowPercentageCompare = percentagesCompare.low;
                    row.midPercentageCompare = percentagesCompare.mid;
                    row.highPercentageCompare = percentagesCompare.high;
                }

                if (categoryLinks) {
                    detail = ReportGenerator.getRanksTabsHTML(names, shortName, report.type);
                }
            }

            const student_heading_tag = (display_div !== undefined) ? 'h2' : 'h4';

            // create row HTML
            if (student_id !== undefined) {

                html += '<div class="report_summary_row">';
                html += '<div class="topic">';
                html += '<'+student_heading_tag+'>' + longName + '</'+student_heading_tag+'>';
                html += '</div>';
                html += '<div class="results_right">';

                if (report.type !== 'comparison') {
                    html += ReportGenerator.getAriaRanksHTML(percentages, longName);
                    html += ReportGenerator.getProgressBarHTML(percentages);
                }
                else {
                    html += ReportGenerator.getAriaRanksHTML(percentages, longName, 'Initial');
                    html += ReportGenerator.getProgressBarHTML(percentages, 'initial');
                    html += ReportGenerator.getAriaRanksHTML(percentagesCompare, longName, 'Progress');
                    html += ReportGenerator.getProgressBarHTML(percentagesCompare, 'progress');
                }

                html += '</div></div>';

                row.html = html;
                rowCollection.push(row);

            }
            else {

                html += '<div class=\'report_summary_row\'>';

                if (!categoryLinks) {
                    html += '<div class="topic">';
                    html += '<h4>' + longName + '</h4>';
                    html += '</div>';
                }
                else {
                    html += '<h4 id="' + report.type + '_scale' + shortName + '_details" class="visually-hidden">' + longName + '</h4>';
                    html += '<div class="topic"><button class="topic_link" aria-expanded="false" data-category="' + shortName + '"><span class="topic_link_text" aria-hidden="true">' + longName + '</span><span class="visually-hidden topic_link_text">Show student ranks for ' + longName + '</span></button></div>';
                }
                html += '<div class="results_right">';

                if (report.type !== 'comparison') {
                    html += ReportGenerator.getAriaRanksHTML(percentages, longName);
                    html += ReportGenerator.getProgressBarHTML(percentages);
                }
                else {
                    html += ReportGenerator.getAriaRanksHTML(percentages, longName, 'Initial');
                    html += ReportGenerator.getProgressBarHTML(percentages, 'initial');
                    html += ReportGenerator.getAriaRanksHTML(percentagesCompare, longName, 'Progress');
                    html += ReportGenerator.getProgressBarHTML(percentagesCompare, 'progress');
                }

                if (categoryLinks) {
                    html += '<div class="results_details" aria-hidden="true">';
                    html += '<div>';

                    html += detail;

                    html += '</div>';
                    html += '</div>';
                }
                html += '</div>';
                html += '</div>';


                row.html = html;
                rowCollection.push(row);
            }

        }

        var order = $('#' + report.type + '_' + report.subtype + '_order_by').val();

        var sort_function = function (a, b) {
            if (a.shortName * 1 > b.shortName * 1) {
                return 1;
            }
            if (a.shortName * 1 < b.shortName * 1) {
                return -1;
            }
            return 0;
        };

        if (student_id !== undefined) {
            if (order === 'lowest') {
                sort_function = function (a, b) {
                    if (report.type === 'comparison') {
                        return (a.scoreCompare - b.scoreCompare);
                    }
                    else {
                        return (a.score - b.score);
                    }
                };
            }
            else if (order === 'highest') {
                sort_function = function (a, b) {
                    if (report.type === 'comparison') {
                        return (b.scoreCompare - a.scoreCompare);
                    }
                    else {
                        return (b.score - a.score);
                    }
                }
            }
        }
        else {
            if (order === 'lowest') {
                sort_function = function (a, b) {
                    if (report.type !== 'comparison') {
                        return ((b.lowPercentage * 100000 + b.midPercentage * 100 + b.highPercentage) - (a.lowPercentage * 100000 + a.midPercentage * 100 + a.highPercentage));
                    }
                    else {
                        return ((b.lowPercentageCompare * 100000 + b.midPercentageCompare * 100 + b.highPercentageCompare) - (a.lowPercentageCompare * 100000 + a.midPercentageCompare * 100 + a.highPercentageCompare));
                    }
                };
            }
            else if (order === 'highest') {
                sort_function = function (a, b) {
                    if (report.type !== 'comparison') {
                        return ((b.highPercentage * 100000 + b.midPercentage * 100 + b.lowPercentage) - (a.highPercentage * 100000 + a.midPercentage * 100 + b.lowPercentage));
                    }
                    else {
                        return ((b.highPercentageCompare * 100000 + b.midPercentageCompare * 100 + b.lowPercentageCompare) - (a.highPercentageCompare * 100000 + a.midPercentageCompare * 100 + b.lowPercentageCompare));
                    }
                }
            }
        }

        rowCollection.sort(sort_function);

        var h = '';

        if (report.type === 'comparison') {
            console.log(Object.keys(classDataCompare).length + ' students included in this report');
        }
        else {
            console.log(Object.keys(classData).length + ' students included in this report');
        }

        for (var i = 0; i < rowCollection.length; i++) {
            var row = rowCollection[i];
            h = h + row.html;

        }

        // display report
        const output_div = (display_div !== undefined) ? display_div : report.reportDisplayDiv;
        output_div.html(h);

        if (student_id === undefined) {
            // activate rankings tabs
            $('#' + report.type + '_report_display .tabs').tabs({
                active: 0,
                create: function (event, ui) {

                },
            });
        }

    } // end category

    static getAriaRanksHTML(percentages, longName, prefix = '') {
        let aria_ranks = '<p class="visually-hidden">' + prefix + ' ' + longName + ' rankings ';
        if (percentages.low > 0) {
            aria_ranks += ', Low, ' + percentages.low + ' percent';
        }
        if (percentages.mid > 0) {
            aria_ranks += ', Moderate, ' + percentages.mid + ' percent';
        }
        if (percentages.high > 0) {
            aria_ranks += ', High, ' + percentages.high + ' percent';
        }
        aria_ranks += '</p>';
        return aria_ranks;
    }

    // 
    static getRowPercentages(classData, shortName, percentages, names) {
        let numStudents = 0;
        let numLow = 0;
        let numMid = 0;
        let numHigh = 0;

        // go through each student in class data and get their shortName score
        // add them to the names obj if defined
        for (let student in classData) {
            if (classData.hasOwnProperty(student)) {

                // if this is a comparison type report then we don't want to
                // include the student if they have compare set to false
                if (names === undefined && classData[student].compare === false) {
                    //console.log('getRowPercentages: skipping ' + student + ' because this is a comparison type report and compare is set to false');
                    continue;
                } 

                numStudents++;
                var score = classData[student].scores[shortName];
                if (score <= 25) {
                    numLow++;
                    if (names !== undefined && names !== null) {
                        names.lowNames.push(student);
                    }
                }
                else if (score <= 75) {
                    numMid++;
                    if (names !== undefined && names !== null) {
                        names.medNames.push(student);
                    }
                }
                else {
                    numHigh++;
                    if (names !== undefined && names !== null) {
                        names.highNames.push(student);
                    }
                }
            }
        }

        percentages.low = Math.round((numLow / numStudents) * 100);
        percentages.mid = Math.round((numMid / numStudents) * 100);
        percentages.high = Math.round((numHigh / numStudents) * 100);
        const percent_sum = percentages.low + percentages.mid + percentages.high;

        // adjust percentages if they don't equal 100
        if (percent_sum < 100) {
            var diff = 100 - percent_sum;
            if (percentages.high > 0) {
                percentages.high += diff;
            }
            else if (percentages.mid > 0) {
                percentages.mid += diff;
            }
            else {
                percentages.low += diff;
            }
        }
        if (percent_sum > 100) {
            var diff = percent_sum - 100;
            if (percentages.high > 0) {
                percentages.high -= diff;
            }
            else if (percentages.mid > 0) {
                percentages.mid -= diff;
            }
            else {
                percentages.low -= diff;
            }
        }
    }

    static getRanksTabsHTML(names, shortName) {
        //console.log('getRanksTabsHTML()');
        //console.log(names);

        let detail = '<div class="tabs">'; // start of tabs div
        detail += '<h5 class="visually-hidden">Student Details</h5>';
        detail += '<ul class="nav nav-tabs">';
        detail += '<li><a href="#' + shortName + '_low">Low Ranks</a></li>';
        detail += '<li><a href="#' + shortName + '_med">Moderate Ranks</a></li>';
        detail += '<li><a href="#' + shortName + '_high">High Ranks</a></li>';
        detail += '</ul>';
        detail += '<div id="' + shortName + '_low" class="details_wrap">';
        detail += '<ul class="student_details">';
        for (let j = 0; j < names.lowNames.length; j++) {
            detail += '<li><a class="class_user_details" href="#user/' + names.lowNames[j] + '">' + ACES.getName(names.lowNames[j], 'pre') + '<span class="visually-hidden">, opens in new window</span></a></li>';

        }
        if (names.lowNames.length === 0) {
            detail += '<li>No students in low rank</li>';
        }
        detail += '</ul></div>';
        detail += '<div id="' + shortName + '_med" class="details_wrap">';
        detail += '<ul class="student_details">';
        for (let j = 0; j < names.medNames.length; j++) {
            detail += '<li><a class="class_user_details" href="#user/' + names.medNames[j] + '">' + ACES.getName(names.medNames[j], 'pre') + '<span class="visually-hidden">, opens in new window</span></a></li>';

        }
        if (names.medNames.length === 0) {
            detail += '<li>No students in moderate rank</li>';
        }
        detail += '</ul></div>';
        detail += '<div id="' + shortName + '_high" class="details_wrap">';
        detail += '<ul class="student_details">';
        for (let j = 0; j < names.highNames.length; j++) {
            detail += '<li><a class="class_user_details" href="#user/' + names.highNames[j] + '">' + ACES.getName(names.highNames[j], 'pre') + '<span class="visually-hidden">, opens in new window</span></a></li>';

        }
        if (names.highNames.length === 0) {
            detail += '<li>No students in high rank</li>';
        }
        detail += '</ul></div>';
        detail += '</div>'; // end of tabs div

        return detail;
    }

    // p = percentages object
    static getProgressBarHTML(p, class_name) {
        let add_class = class_name !== undefined ? ' ' + class_name : '';

        let title_text = '';
        if (ACES.testing && p.rawScore !== undefined) {
            title_text = 'Score: ' + p.rawScore;
        }

        var html = '<div class="progress_bar' + add_class + '" aria-hidden="true">';
        if (p.low > 0) {
            html += '<span title="' + title_text + '" class="low" style="width: ' + p.low + '%">' + p.low + '<span class="percent_sign">%</span></span>';
        }
        if (p.mid > 0) {
            html += '<span title="' + title_text + '"class="mid" style="width: ' + p.mid + '%">' + p.mid + '<span class="percent_sign">%</span></span>';
        }
        if (p.high > 0) {
            html += '<span title="' + title_text + '"class="high" style="width: ' + p.high + '%">' + p.high + '<span class="percent_sign">%</span></span>';
        }
        html += '</div>';

        return html;
    }


};