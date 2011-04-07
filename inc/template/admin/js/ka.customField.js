/**
 * 
 * ka.customField - The motherclass of a custom ka.field.
 * 
 * 
 * If your class depends on another class of your project or
 * of another extension, please use:
 * window.addEvent('init', function(){
 * 
 *    //your class definition here
 *  
 * });
 * 
 */



ka.customField = new Class({
	
	Implements: Events,
	
	/**
	 * Main container
	 */
	main: null,
	
	field: null,
	container: null,
	
	
	/**
	 * Example of a constructor.
	 * 
	 */
	initialize: function( pField, pFieldContainer ){
		this.field = pField; //values of the ka.field definition
		this.fieldContainer = pFieldContainer; //Element of your parent (Before .inject() it is not full registered in DOM at the target node)
		this.main = new Element('div').inject( document.hidden );
		this._createLayout();
	},
	
	
	/**
	 * Do some stuff here. Create your HTML Elements and inject them to this.main.
	 * Events:
	 * The motherclass needs to know when your fields has changed his value. Please tell him this via fireEvent:
	  
	   this.fireEvent('change');
	 */
	_createLayout: function(){
	},
	
	
	/**
	 * The motherclass calls this function when your field should display a new value.
	 * 
	 */
	setValue: function( pValue ){		
	},
	
	/**
	 * The motherclass calls this function when he want to know the value of your field.
	 */
	getValue: function( pValue ){
	},

	/**
	 * The motherclass calls this function to detect whether this field is empty or not. (Only if pField.empty is false)
	 * Please make sure, that this function returns false or true.
	 * 
	 */
	isEmpty: function(){
	},
	
	/**
	 * The motherclass calls this function as a virsual notification when your field is empty but should be filled.
	 */
	highlight: function(){
	},
	
	
	/**
	 * The motherclass calls this function to inject your main-container to the container of the field.
	 * (Called when the main container of the ka.field (not yours) is already registered in DOM) 
	 */
	inject: function( pTo, pWhere ){
		this.main.inject( pTo, pWhere );
	}
	
	
	
})