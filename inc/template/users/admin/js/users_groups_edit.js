users_users_groups_edit = new Class({
	Extends: ka.windowEdit,
	
	initialize: function( pWin )
	{
        this.windowAdd = true;
        this.parent(pWin);
    },
    
    _saveSuccess: function()
    {
        ka.loadSettings();
    }
});