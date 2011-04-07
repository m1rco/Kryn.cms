window.addEvent('domready', function() {
	
	if($('user-message-system-toggle-all-checks')) {
		$('user-message-system-toggle-all-checks').addEvent('change', function(){
		
			$$('input[type="checkbox"].user-message-system-one-message-action-select').each(function(pElem)
				{
					pElem.checked = $('user-message-system-toggle-all-checks').checked;
				});			
		});
	}
	
});



openMessage = function(pElem, pRsn){ 
	
	if(pElem.hasClass('one-message-subject-0')) {
		new Request.JSON({url: self.location.href, onSuccess: function(response){
			//check if there is a unread class if so remove
			if(response == 1) {
				pElem.removeClass('one-message-subject-0');
				pElem.addClass('one-message-subject-1');
			}		
			
		}}).get({'ajSetRead': 'true', 'ajMessageRsn': pRsn});
	}

	
	
	
	msgText = pElem.getNext();
	if(! msgText ) return; 
    if( msgText.get( 'tag' ) != 'div' ) return;		    
   
    	msgText.toggle();			
};

