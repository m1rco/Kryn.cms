umsNewMessageCheckForm = function () {
	if($('sendNewMessage') && $('user-message-system-new-message-form')) {		
		validError = false;		
		var req = ['to_user_id','message_subject', 'message_text'];	    

	    var failed = false;
	    var scroll = new Fx.Scroll(window);
	    req.each(function(item){	
	    	var preError = false;
			var obj = $('user-message-system-new-message-form').getElement('input[name='+item+']');
       
			if(item == 'message_text') {
				obj = $('user-message-system-new-message-form').getElement('textarea[name='+item+']');				
			}
			
	        if((obj && obj.value == "") || preError){
	        	validError = true;
	            scroll.toElement( obj );
	            (function(){
	                obj.highlight();
	                (function(){
	                    obj.highlight();
	                }).delay(600);
	            }).delay(500);
	        }
	    });    
	    
	   
	    if(validError)
	    	return false;
	    		
		$('user-message-system-new-message-form').submit();		
	}
}