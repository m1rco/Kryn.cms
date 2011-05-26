users_users_groups = new Class({
    Extends: ka.list,
    
    _deleteSuccess: function()
    {
        ka.loadSettings();
    }
});