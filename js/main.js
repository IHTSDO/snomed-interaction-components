
// Requires jQuery!
jQuery.ajax({
    url: "https://jira.ihtsdotools.org/s/d41d8cd98f00b204e9800998ecf8427e/en_US49ycqg-1988229788/6262/3/1.4.7/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?collectorId=26fb9fa1",
    type: "get",
    cache: true,
    dataType: "script"
});

window.ATL_JQ_PAGE_PROPS = $.extend(window.ATL_JQ_PAGE_PROPS, {
 
    // ==== custom trigger function ====
    triggerFunction : function( showCollectorDialog ) {
        $('#feedback-button').on( 'click', function(e) {
            e.preventDefault();
            showCollectorDialog();
        }); 
    },
    // ==== we add the code below to set the field values ====
    fieldValues: {
        summary : 'enter a brief summary of the requirement',
        description : 'Requirements should be entered here as user stories - as a <type of user>, I want <some goal> [so that <some reason>]',
    }                  
});
