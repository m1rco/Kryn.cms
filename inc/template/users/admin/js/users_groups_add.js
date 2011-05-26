users_users_groups_add = new Class({
	Extends: ka.windowAdd,
	
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