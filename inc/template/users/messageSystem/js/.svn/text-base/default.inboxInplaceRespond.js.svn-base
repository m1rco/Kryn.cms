window.addEvent('domready', function() {	
	
	if($('user-message-system-toggle-all-checks')) {
		$('user-message-system-toggle-all-checks').addEvent('change', function(){
		
			$$('input[type="checkbox"].user-message-system-one-message-action-select').each(function(pElem)
				{
					pElem.checked = $('user-message-system-toggle-all-checks').checked;
				});			
		});
	}
	
	if($('msg-action-select') && $('msg-action-form')) {
	$('msg-action-select').addEvent('change', function(item) {
		actionValue = item.target.value;
		if(actionValue == 'none')
			return;
		if(actionValue == 'delete' && !confirm('Do you want to delete all selected messages?'))
			return;
			
		$('msg-action-form').submit();		
	})
	}
	
});



openMessage = function(pElem, pRsn){ 
	var scroll = new Fx.Scroll(window);
	
	if(pElem.hasClass('one-message-subject-0')) {
		new Request.JSON({url: self.location.href, onSuccess: function(response){
			//check if there is a unread class if so remove
			if(response == 1) {
				pElem.removeClass('one-message-subject-0');
				pElem.addClass('one-message-subject-1');
			}		
			
		}}).get({'ajSetRead': 'true', 'ajMessageRsn': pRsn});
	}

		
	msgText = $('one-message-text-'+pRsn);
	if(! msgText ) return; 
    if( msgText.get( 'tag' ) != 'div' ) return;		    
   
    	msgText.toggle();    	   	
    	if(msgText.isVisible()) {  
    		var scroll = new Fx.Scroll(window);
    		scroll.toElement($('one-message-pre-'+pRsn));                	
         }
}

askDelete = function(pElem) {
	if(confirm('Do you want to delete this message?'))
		window.location.href = pElem.href;  
	return false;
}

sendAjReMessage = function(pRsn, pBtnElem) {
	reText = $('one-message-response-textarea-'+pRsn).value;
	//check if text is present
	if(reText == "" || reText.length < 5) {
		 (function(){
			 $('one-message-response-textarea-'+pRsn).highlight();
             (function(){
            	 $('one-message-response-textarea-'+pRsn).highlight();
             }).delay(600);
         }).delay(500);
		return false;
	}
	
	pBtnElem.toggle();
	pBtnElem.getNext().toggle();
	pBtnElem.getNext().getNext().getNext().hide();
	new Request.JSON({url: self.location.href, 
		onSuccess: function(response){
			pBtnElem.getNext().toggle();
		if(response == 1) {		
			
			pBtnElem.getNext().getNext().toggle();
		}else{
			pBtnElem.toggle();
			pBtnElem.getNext().getNext().getNext().toggle();
		}		
	}}).post({'ajSendReMessage': 'true', 'ajMessageRsn': pRsn, 'ajResponseText' : reText});	
}


openRespondPanel = function(pRsn) {
	msgText = $('one-message-text-'+pRsn);
	if(! msgText ) return; 
    if( msgText.get( 'tag' ) != 'div' ) return;	
    msgText.show();
    var scroll = new Fx.Scroll(window);
	scroll.toElement($('one-message-response-textarea-'+pRsn));
	$('one-message-response-textarea-'+pRsn).focus();   
}
