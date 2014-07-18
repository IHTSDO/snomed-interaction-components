/**
 * Created by alo on 7/17/14.
 */
countryIcons = {
    '999000041000000102': 'gb',
    '999000011000000103': 'gb',
    '999000021000000109': 'gb',
    '999000031000000106': 'gb',
    '450829007': 'es'
}

Handlebars.registerHelper('countryIcon', function(moduleId) {
    return countryIcons[moduleId];
});