var xhr;
if (window.XMLHttpRequest) xhr = new XMLHttpRequest();      // all browsers except IE
else xhr = new ActiveXObject("Microsoft.XMLHTTP");      // for IE
 
xhr.open('GET', 'inc/content.json', false);
xhr.onreadystatechange = function () {
    if (xhr.readyState===4 && xhr.status===200) {           

        var items = JSON.parse(xhr.responseText);
        var output = '';
        var color = 'black';
        for (var key in items) {
                switch (items[key].status) {
                    case "on hold":
                        color = 'orange';
                        break;
                    case "in progress":
                        color = 'green';
                        break;
                    case "stopped":
                        color = 'red';
                        break;
                }
        	if (items[key].section==='development')
        	{
            	output += '<h4><font color=' +color+'>' + items[key].status + '</font></h4> <p>' + items[key].description + '</p>';
                output += '<dl class=dl-horizontal> <dt class=text-muted> Next Deployment Date</dt> <dd><strong>' + items[key].nextdate + '</strong> </dd>';
                output += '<dt class=text-muted>Deployment Content</dt> <dd><strong><a href="https://jira.ihtsdotools.org/browse/BROWSE/fixforversion/' + items[key].nextversionid + '/?selectedTab=com.atlassian.jira.jira-projects-plugin:version-summary-panel" target=_blank>content list</a></strong> </dd><br>';
        	}
        }
        output += ''
        document.getElementById('dev').innerHTML = output;


    }
}
xhr.send();