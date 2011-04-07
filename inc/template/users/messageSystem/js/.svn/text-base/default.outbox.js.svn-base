window.addEvent('domready', function() {	
	$$('.user-message-system-outbox-one-message-subject').each(function(pElem){
		pElem.addEvent('click', function(pElem){ 
			pElem = pElem.target;
			
			msgText = pElem.getNext();
			if(! msgText ) return; 
		    if( msgText.get( 'tag' ) != 'div' ) return;		    
		   
		    	msgText.toggle();			
		});
	});	
	
});