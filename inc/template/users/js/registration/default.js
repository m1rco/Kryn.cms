
window.addEvent('domready', function() {
    // Hide error div and loader img
    hide('error');
    hide('loader');
    
    // Register click
    $('register').addEvent('click', registerClicked.bind());
});

var show = function(id) { var element = $(id); if(element != null) { element.setStyle('display', ''); } };
var hide = function(id) { var element = $(id); if(element != null) { element.setStyle('display', 'none'); } };

var getFieldValue = function(id) {
    var field = $(id);
    if(field == null)
        return '';
    return field.value;
};

var registerClicked = function() {
    // Show loader
    show('loader');
    
    // Send request to server
    new Request.JSON({
        url: window.location.href,
        noCache: 1,
        
        onComplete: function(res) {
            // Hide loader
            hide('loader');
            
            // Handle result
            if(res.error)
                showError(res.error);
            else
                document.location.href = res.href;
        }
    }).post({
        postdata: 1,
        email: getFieldValue('reg_email'),
        password: getFieldValue('reg_password'),
        username: getFieldValue('reg_username'),
        firstname: getFieldValue('reg_firstname'),
        lastname: getFieldValue('reg_lastname'),
        street: getFieldValue('reg_street'),
        city: getFieldValue('reg_city'),
        zipcode: getFieldValue('reg_zipcode'),
        country: getFieldValue('reg_country'),
        phone: getFieldValue('reg_phone'),
        fax: getFieldValue('reg_fax'),
        company: getFieldValue('reg_company')
    });
};

var showError = function(message) {
    var div = $('error');
    // When error div is not found, use alert
    if(div == null) alert(message);
    
    div.set('html', message);
    show('error');
};