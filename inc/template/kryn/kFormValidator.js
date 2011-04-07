var kFormValidator = new Class({
    initialize: function( pId, pErrorMessage, pOpts ){
        this.id = pId;
        this.field = $(pId);
        this.field.addEvent('focus', this.removeBubble.bind(this) );
        this.opts = pOpts;
        this.errorMessage = pErrorMessage;
    },
    ok: function(){
        if( this.opts.empty == false && ( ['text','password'].contains(this.field.get('type')) || this.field.get('tag') == 'select' 
            || this.field.get('tag') == 'textarea') && this.field.value == "" ){
            return false;
        }

        if( this.opts.empty == false && ['checkbox'].contains(this.field.get('type')) && !this.field.checked ){
            return false
        }
        if( this.opts.minlength > 0 && this.field.value.length < this.opts.minlength ){
            return false;
        }
        if( this.opts.equalWith && $(this.opts.equalWith).value != this.field.value )
            return false;

        if( this.opts.check == 'email' ){
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if( reg.test( this.field.value ) == false )
                return false;
        }
        return true;
    },
    okOrShow: function(){
        if( this.ok() == false ){
            if( this.bubble ){
                this.bubble.destroy();
            }
            this.bubble = new Element('div', {
                html: this.errorMessage,
                'class': 'formValidatorBubble',
                styles: {
                    opacity: 0,
                    position: 'absolute'
                }
            }).inject( document.body );
            var position = this.field.getPosition( document.body );
            this.bubble.setStyles({
                left: position.x,
                'top': position.y-this.bubble.getSize().y-2
            });
            this.bubble.tween('opacity', 1);
            (function(){this.removeBubble();}.bind(this)).delay(3000);
            return false;
        }
        return true;
    },
    removeBubble: function(){
        if(! this.bubble ) return;
        this.bubble.set('tween', {duration: 400, onComplete: function(){
            this.bubble.destroy();
        }.bind(this)});
        this.bubble.tween('opacity', 0);
    }
});

