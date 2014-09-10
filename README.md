# SNOMED Interaction Components

SNOMED Interaction Components are Javascript widgets that can be easily integrated in any website to provide SNOMED CT Navigation features, querying an IHTSDO Snapshot Backend Server.

## Distribution

This project gould be compiled using Grunt.js (http://gruntjs.com/) creating the distribution files:

* js
  * snomed-interaction-components-1.0.0.js
  * snomed-interaction-components-1.0.0.min.js
* css
  * snomed-interaction-components-1.0.0.css
  * snomed-interaction-components-1.0.0.min.css

The Grunt default task will create all these components, running `grunt` in the root folder of the project will create the distribution artifacts.

## Use components in your project

Use the js and css files resulting from Grunt.js build, import them in your project and add these import references in your HTML file:
```HTML
<link rel="stylesheet" href="snomed-interaction-components/css/snomed-interaction-components-1.19.0.min.css">
<script src="snomed-interaction-components/js/snomed-interaction-components-1.19.0.min.js"></script>
```
The SNOMED Interaction Componets require you to have JQuery 2.1.x and Boostrap 3.x imported in your project also, fo example:
```HTML
<script src="external-libs/jquery-2.1.0.min.js" type="text/javascript"></script>
<script src="external-libs/bootstrap.min.js" type="text/javascript"></script>
<link rel="stylesheet" href="css/bootstrap.min.css">
```
## Included Components

The included components are:
* Taxonomy: A tree view of the SNOMED CT Content, selectable logic view and it can be refocused to any concept.
* Search: Search SNOMED CT Content with multiple modes and filters.
* Concept Details: A full concept data display, including a summary, advanced details, navigation to parents and children, diagrams, etc.
* Refsets: List of available Reference Sets in the environment.

## Instantiating components in your project

These components can be included in your app by creating an empty div in HTML and using javascript to instantiate a complete view inside it.

```javascript
var tpt = new taxonomyPanel(document.getElementById("div-1-id"), conceptId, options);
var spa = new searchPanel(document.getElementById("div-2-id"), options);
var ref = new refsetPanel(document.getElementById("div-3-id"), options);
var cdp = new conceptDetails(document.getElementById("div-4-id"), conceptId, options);
```

Concept Details and Taxonomy have a conceptId parameter that will focus the panel in the provided concept.
All components require an Options object that will configure preferences and the access to the backend server.

### Example: Preparing the canvas for the Concept Details panel

The body of the HTML page needs to include a div element that will contain the widget. This div needs to have a unique id. In this example we also assign the `onload` event of the body to the `initialize()` javascript function (that we will create later).

In this example we create two different divs, one as an example of plain Javascript mode and the other for the example of the JQuery mode.

```HTML
    <body onload="initialize()">
        <h1>Testing Concept Details Widget</h1>

        <h2>Plain Javascript mode</h2>
        <div id="concept_details_canvas" style="width:30%; height:100%"></div>

        <h2>JQuery mode</h2>
        <div id="concept_details_canvas_jquery" style="width:30%; height:100%"></div>
    </body>
```

### Initializing the Concept Details Panel

The `initialize()` function should be implemented in javascript in this example HTML page. It will define the `options` object that will configure the panel preferences.

After that, 2 panels are created using the 2 different modes.

```HTML
    <script type="text/javascript">
        function initialize() {
            // Example: common options object
            var options = {
                serverUrl: "http://127.0.0.1/api/snomed",
                edition: "en-edition",
                release: "v20140731",
                showIds: false,
                hideNotAcceptable: true,
                displayInactiveDescriptions: false,
                displaySynonyms: true,
                selectedView: "inferred",
                displayChildren: false,
                langRefset: "900000000000509007",
                closeButton: false,
                collapseButton: false,
                linkerButton: true,
                subscribersMarker: true,
                searchMode: "partialMatching",
                searchLang: "english",
                diagrammingMarkupEnabled: false,
                statusSearchFilter: "activeOnly",
                highlightByEffectiveTime: "false"
            };

            // Example: load first widget using plain javascript
            var cdPanel = new conceptDetails(document.getElementById("concept_details_canvas"), "404684003", options);
            cdPanel.updateDivContent();

        }
    </script>
```
The `options` object can include a property called `url` that would allow to connect to any provided terminology server, that follows a pre-defined rest methods API. In this example we don't provide any `url` value and the plugin will default to a development Terminology Server.

After the initial load, it is possible to set the panel to a different concept by using the Javascript object methods.

```JavaScript
panel.conceptId = "4046840038";
panel.updateDivContent();
```



