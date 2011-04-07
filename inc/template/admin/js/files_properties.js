var admin_files_properties = new Class({
	
	initialize: function( pWindow ){
		this.win = pWindow;
		
		this.win.addEvent('close', function(){
			
			if( this.lastSizeRq )
				this.lastSizeRq.cancel();
			
		}.bind(this));
		
		this.file = this.win.params;
		this.render();
	},
	
	render: function(){
		
		this.tabGroup = this.win.addSmallTabGroup();
        this.tabButtons = $H();
        this.tabButtons['general'] = this.tabGroup.addButton(_('General'), this.changeType.bind(this,'general'));
        this.tabButtons['access'] = this.tabGroup.addButton(_('Access'), this.changeType.bind(this,'access'));
        this.tabButtons['filesystem'] = this.tabGroup.addButton(_('Filesystem'), this.changeType.bind(this,'filesystem'));
        this.tabButtons['versions'] = this.tabGroup.addButton(_('Versions'), this.changeType.bind(this,'versions'));
		
        this.panes = {};
        
        this.panes['general'] = new Element('div', {
            'class': 'admin-system-settings-pane',
            lang: 'general'
        }).inject( this.win.content );

        this.panes['access'] = new Element('div', {
            'class': 'admin-system-settings-pane',
            lang: 'access'
        }).inject( this.win.content );
        


        this.panes['filesystem'] = new Element('div', {
            'class': 'admin-system-settings-pane',
            lang: 'filesystem'
        }).inject( this.win.content );
        

        this.panes['versions'] = new Element('div', {
            'class': 'admin-system-settings-pane',
            lang: 'versions'
        }).inject( this.win.content );

        this.changeType( 'general' );
        this.load();
		
	},
	
	mkTd: function( pVal ){
		if( this.tr ){
			var td = new Element('td').inject( this.tr );
			if( $type(pVal) == 'string' )
				td.set('html', pVal);
			else if( pVal )
				pVal.inject( td );
				
		}
		return td;
	},
	
	mkTh: function( pVal ){
		if( this.tr ){
			var td = new Element('th').inject( this.tr );
			if( $type(pVal) == 'string' )
				td.set('html', pVal);
			else if( pVal )
				pVal.inject( td );
				
		}
		return td;
	},
	
	mkTr: function(){
		this.tr = new Element('tr').inject( this.generalTableBody );
		return this.tr;
	},
	
	mkDel: function(){

		this.mkTr();
		this.mkTd().setStyle('height', 14).setStyle('border-bottom','1px solid silver');
		this.mkTd().setStyle('border-bottom', '1px solid silver');
		
		this.mkTr();
		this.mkTd().setStyle('height', 14);
		this.mkTd();
		
	},
	
	load: function(){
		
		new Request.JSON({url: _path+'admin/files/getFileInfo', onComplete: function(res){
			if( !res ){
				this.win._alert(_('File does not exist.'), function(){
					this.win.close();
				}.bind(this));
			} else {
				this.file = res;
				this._load();
			}
		}.bind(this)}).post({path: this.file.path});
		
	},

	_load: function(){
		
		
		if( this.file.type == 'dir' )
			this.tabButtons['versions'].hide();
		
		this.win.setTitle(_('Properties of %s').replace('%s', this.file.name));
		this.panes['general'].setStyle('padding', 6);
		this.panes['general'].empty();
		
		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( this.panes['general'] );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );

		this.mkTr();
		var td = this.mkTd().setStyles({
			'width': 70,
			height: 50,
			'background-position': 'left center'
		});
		
		var tdClass = 'default';
		if( this.file.isDir ){
			tdClass += ' dir';
		} else {
			tdClass += ' '+this.file.ext;
		}
		td.set('class', tdClass);
		
		var td = this.mkTd();
		
		new Element('input', {'class': 'text', disabled: true, value: this.file.name}).inject(td);
		
		this.mkTr();
		this.mkTd(_('Type'))
		if( this.file.isDir )
			this.mkTd(_('Folder'));
		else
			this.mkTd(this.file.ext);
		
		this.mkTr();
		this.mkTd(_('Path'));
		this.mkTd(this.file.path);

		this.mkTr();
		this.mkTd(_('Location'));
		this.mkTd(this.file.location);
		
		
		this.mkDel();
		this.formatDate = '%A, %d. %B %Y, %H:%M:%S';
		
		this.mkTr();
		this.mkTd(_('Created'));
		this.mkTd( new Date(this.file.ctime*1000).format(this.formatDate));
		
		this.mkTr();
		this.mkTd(_('Modified'));
		this.mkTd( new Date(this.file.mtime*1000).format(this.formatDate));

		this.mkDel();
		
		this.mkTr();
		this.mkTd(_('Size'));

		if( this.file.isDir ){
			this.sizeTd = this.mkTd(_('Loading ...'));
			this.loadSize();
		} else {
			this.sizeTd = this.mkTd(this.file.size);
		}
		
		

		this.loadAccess();
		this.loadFilestem();
		this.loadVersions();
	},
	
	loadAccess: function(){
		
		var p = this.panes['access'];
		
		p.empty();
		
		if( this.file.writeaccess == 0 ){
			new Element('div', {
				text: _('You have no access to this file.'),
				style: 'color: gray; padding: 25px; text-align: center;'
			}).inject( p )
			return;
		}
		

		new Element('h3', {
			text: _('Public access')
		}).inject(p);
		
		new Element('div', {
			text: _('Following rules will be write in a regular .htaccess file. Please make sure, that your webserver allows such htaccess rules.'),
			style: 'color: gray; padding: 5px'
		}).inject( p );
		
		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( p );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );

		this.mkTr();
		if( this.file.type == 'dir' )
			this.mkTd(_('Access of this folder'));
		else
			this.mkTd(_('Access of this file'));
		
		var select = new Element('select').addEvent('change', this.saveAccess.bind(this));
		this.accessSelect = select;
		
		new Element('option', {
			text: _('-- not defined --'),
			value: ''
		})
		.inject( select );
		new Element('option', {
			text: _('Allow'),
			value: 'allow'
		}).inject( select );
		new Element('option', {
			text: _('Deny'),
			value: 'deny'
		}).inject( select );
		
		if( this.file.thishtaccess ){
			select.value = this.file.thishtaccess.access;
		}
		
		var td = this.mkTd(select);
		
		new Element('div', {
			style: 'color: silver',
			text: _('Saves after change')
		}).inject( td );
		
		
		if( this.file.type == 'dir' ){
			if( this.file.htaccess && this.file.htaccess.length > 0 ){

				this.mkTr();
				this.mkTd(
					new Element('b', {
						text: _('Containing rules')
					})
				).set('colspan', 2).setStyle('border-bottom', '1px solid silver');
				
				this.file.htaccess.each(function(item, index){
					this.mkTr();
					this.mkTd(item.file).setStyle('background-color', '#f7f7f7').setStyle('padding-left', 10);
					if( item.access != 'allow' ){
						this.mkTd(new Element('img', {title: _('Access denied'), src: _path+'inc/template/admin/images/icons/exclamation.png'}))
						.setStyle('background-color', '#f7f7f7');
					} else {
						this.mkTd(new Element('img', {title: _('Access granted'), src: _path+'inc/template/admin/images/icons/accept.png'}))
						.setStyle('background-color', '#f7f7f7');
					};
				}.bind(this));
			}
		}
		
		
		new Element('h3', {
			text: _('Intern access')
		}).inject(p);
		
		/*new Element('div', {
			text: _('These rules are inherited by %s').replace('%s', 'bla'),
			style: 'padding: 5px; color: gray;'
		}).inject(p);*/

		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'ka-Table-head ka-Table-body'}).inject( p );
		this.accessTbody = new Element('tbody').inject( this.generalTable );

		//ka-Table-hea
		
        var tr = new Element('tr').inject( this.accessTbody );
    
        new Element('th', {
            text: _('Target')
        }).inject( tr );
        new Element('th', {
            text: _('Access'),
            width: '80'
        }).inject( tr );
        new Element('th', {
            text: _('Sub'),
            title: _('With subfiles'),
            width: '30'
        }).inject( tr );
        new Element('th', {
            text: _('Write'),
            width: '30'
        }).inject( tr );
        new Element('th', {
            text: _('Read'),
            width: '30'
        }).inject( tr );
        new Element('th', {
            width: '30'
        }).inject( tr );
		

		this.addInternAclBtn = new ka.Button(new Element('img', {
				src: _path+'inc/template/admin/images/icons/add.png'
			})
		, null, _('Add new rule'))
		.addEvent('click', this.addRule.bind(this))
		.inject( p );
		
		
		this.applyInternalAclBtn = new ka.Button(_('Apply'))
		.addEvent('click', this.applyInternalAcls.bind(this))
		.inject( p );
		
		logger(this.file.internalacls);
		if( this.file.internalacls && $type(this.file.internalacls) == 'array' ){
			this.file.internalacls.each(function(rule){
			
				new files_properties_rule(rule, this.accessTbody, this.win);
				
			}.bind(this));
		}
		
		new Element('div', {
			style: 'height: 15px;'
		}).inject( p );
		
	},
	
	applyInternalAcls: function(){
		
		var rules = [];
		var req = {
			path: this.file.path
		};
		
		this.accessTbody.getElements('tr').each(function(tr,index){
		
			var rule = tr.retrieve('rule');
			if( !rule || rule.removed == true ) return;
			
			rules.include( rule.getValue() );
			
		}.bind(this));
		
		req.rules = rules;
		
		this.applyInternalAclBtn.startTip(_('Save ...'));
		new Request.JSON({url: _path+'admin/files/setInternalAcl', onComplete: function(pRes){

			this.applyInternalAclBtn.stopTip(_('Saved.'));
			
		}.bind(this)}).post(req);
		
	},
	
	addRule: function(){
		
		new files_properties_rule({access: 1, code: '/'+this.file.path+'[w,r]'}, this.accessTbody, this.win);
		
	},
	
	loadFilestem: function(){
		var p = this.panes['filesystem'];
		
		p.empty();
		

		if( this.file.writeaccess == 0 ){
			new Element('div', {
				text: _('You have no access to this file.'),
				style: 'color: gray; padding: 25px; text-align: center;'
			}).inject( p )
			return;
		}

		new Element('div', {
			text: _('Local filesystem permissions'),
			style: 'color: gray; padding: 5px'
		}).inject( p );

		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( p );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );
		this.filePermissionTable = this.generalTable;
		
		
		this.mkTr();
		
		this.mkTh(_('Type'));
		this.mkTh(_('Read'));
		this.mkTh(_('Write'));
		this.mkTh(_('Execute'));

		this.mkTr();
		this.mkTd(_('Owner'));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(1,1)=='r')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(2,1)=='w')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(3,1)=='x')?true:false}));
		
		this.mkTr();
		this.mkTd(_('Group'));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(4,1)=='r')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(5,1)=='w')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(6,1)=='x')?true:false}));
		

		this.mkTr();
		this.mkTd(_('Other'));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(7,1)=='r')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(8,1)=='w')?true:false}));
		this.mkTd(new Element('input', {type: 'checkbox', checked: (this.file.perms.substr(9,1)=='x')?true:false}));
		
		var p2 = new Element('div', {
			style: 'padding: 7px 0px; border-top: 1px solid silver'
		}).inject( p );
		
		new Element('div', {
			text: _('You can enter the numeric id or the name to change the owner/group id.'),
			style: 'color: gray; padding: 5px'
		}).inject( p2 );
		
		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( p2 );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );
		
		this.fileOwnerTable = this.generalTable;

		this.mkTr();
		this.mkTd(_('Owner id'));
		this.mkTd(new Element('input', {'class': 'text', value: this.file.owner}).addEvent('keyup', this.getFileOwnerNames.bind(this)))
		.setStyle('width', 160);
		this.fileOwnerNameTd = this.mkTd("").setStyle('color', 'gray');
		
		this.mkTr();
		this.mkTd(_('Group id'));
		this.mkTd(new Element('input', {'class': 'text', value: this.file.group}).addEvent('keyup', this.getFileOwnerNames.bind(this)))
		.setStyle('width', 160);

		this.fileGroupNameTd = this.mkTd("").setStyle('color', 'gray');
		
		this.getFileOwnerNames();

		this.applyFilesystemBtn = new ka.Button(_('Apply'))
		.addEvent('click', this.applyFilesystem.bind(this)).inject( p );
		
		this.applyFilesystemSubBtn = new ka.Button(_('Apply with all subfiles'))
		.addEvent('click', this.applyFilesystem.bind(this, true)).inject( p );
		
		/*
		var p2 = new Element('div', {
			style: 'padding: 10px 0px; background-color: #f5f5f5; border: 1px solid silver; margin: 10px; -moz-border-radius: 5px;'
		}).inject( p );
		
		
		new Element('b', {
			text: _('Find ID'),
			style: 'color: gray; padding: 5px'
		}).inject( p2 );

		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( p2 );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );
		this.getNameTable = this.generalTable;
		
		this.mkTr();
		this.mkTd('User').setStyle('width', 70);
		this.mkTd(new Element('input', {'class': 'text', style:'width: 60px;'}).addEvent('keyup', this.getNameIds.bind(this)));
		this.getNameOwnerName = this.mkTd(_("Please enter the owner")).setStyle('color', 'gray');
		

		this.mkTr();
		this.mkTd('Group').setStyle('width', 70);
		this.mkTd(new Element('input', {'class': 'text', style:'width: 60px;'}).addEvent('keyup', this.getNameIds.bind(this)));
		this.getNameOwnerGroup = this.mkTd(_("Please enter the group")).setStyle('color', 'gray');
		*/
	},
	
	applyFilesystem: function( pAll ){
		
		var button = this.applyFilesystemBtn;
		var ownerinputs = this.fileOwnerTable.getElements('input');
		
		var req = {
			path: this.file.path,
			user: ownerinputs[0].value,
			group: ownerinputs[1].value
		};
		
		if( pAll == true ){
			req.sub = 1;
			button = this.applyFilesystemSubBtn;
		}
		
		var inputs = this.filePermissionTable.getElements('input');

		var chmodoctalUser = 0;
		var chmodoctalGroup = 0;
		var chmodoctalOther = 0;

		chmodoctalUser += (inputs[0].checked)?4:0;
		chmodoctalUser += (inputs[1].checked)?2:0;
		chmodoctalUser += (inputs[2].checked)?1:0;
		
		chmodoctalGroup += (inputs[3].checked)?4:0;
		chmodoctalGroup += (inputs[4].checked)?2:0;
		chmodoctalGroup += (inputs[5].checked)?1:0;

		chmodoctalOther += (inputs[6].checked)?4:0;
		chmodoctalOther += (inputs[7].checked)?2:0;
		chmodoctalOther += (inputs[8].checked)?1:0;
		
		chmodoctal = chmodoctalUser+''+chmodoctalGroup+''+chmodoctalOther;
		
		req.chmod = chmodoctal;
		
		button.startTip(_('Set permissions ...'));

		new Request.JSON({url: _path+'admin/files/setFilesystem', onComplete: function( pOwnerNames ){
		
			button.stopTip(_('done.'));
			
		}.bind(this)}).post(req);
	},
	
	getNameIds: function(){
		
		var inputs = this.getNameTable.getElements('input');
		
		if( this.lastGetOwnerReq )
			this.lastGetOwnerReq.cancel();
		
		this.lastGetOwnerReq = new Request.JSON({url: _path+'admin/files/getOwnerIds', onComplete: function( pOwnerNames ){
		
			if( pOwnerNames.owner && pOwnerNames.owner > 0 ){
				this.getNameOwnerName.set('text', pOwnerNames.owner);
			} else {
				this.getNameOwnerName.set('text', _('Can not fetch user id.'));
			}

			if( pOwnerNames.group && pOwnerNames.group > 0 ){
				this.getNameOwnerGroup.set('text', pOwnerNames.group);
			} else {
				this.getNameOwnerGroup.set('text', _('Can not fetch group nid.'));
			}
			
		}.bind(this)}).post({owner: inputs[0].value, group: inputs[1].value});
		
		
		
	},
	
	getFileOwnerNames: function(){
		
		var inputs = this.fileOwnerTable.getElements('input');
		
		new Request.JSON({url: _path+'admin/files/getOwnerNames', onComplete: function( pOwnerNames ){
		
			if( pOwnerNames ){
				this.fileOwnerNameTd.set('text', pOwnerNames.owner);
				this.fileGroupNameTd.set('text', pOwnerNames.group);
			} else {
				this.fileOwnerNameTd.set('text', _('Can not fetch owner names.'));
				this.fileGroupNameTd.set('text', _('Can not fetch owner names.'));
			}
			
		}.bind(this)}).post({ownerid: inputs[0].value, groupid: inputs[1].value});
		
		
	},
	
	saveAccess: function(){
	
		var val = this.accessSelect.value;
		
		this.lastSizeRq = new Request.JSON({url: _path+'admin/files/setAccess', onComplete: function(res){
			ka._helpsystem.newBubble(_('File access saved'), this.file.path, 3000 );
			
		}.bind(this)}).post({path: this.file.path, access: val});
		
	},
	
	loadVersions: function(){
		
		var p = this.panes['versions'];
		p.empty();
		

		if( this.file.writeaccess == 0 ){
			new Element('div', {
				text: _('You have no access to this file.'),
				style: 'color: gray; padding: 25px; text-align: center;'
			}).inject( p )
			return;
		}


		this.generalTable = new Element('table', {width: '100%', cellpadding: 5, cellspacing: 0, 'class': 'admin-files'}).inject( p );
		this.generalTableBody = new Element('tbody').inject( this.generalTable );
		
		this.mkTr();

		this.mkTh(_('ID'));
		this.mkTh(_('Date'));
		this.mkTh(_('Size'));
		this.mkTh(_('Creator'));
		this.mkTh(_('Actions'));
		
		this.lastSizeRq = new Request.JSON({url: _path+'admin/files/getVersions', onComplete: function( pVersions ){
		
			this.renderVersions( pVersions );
			
		}.bind(this)}).post({path: this.file.path});
		
	},
	
	renderVersions: function( pVersions ){

		
		pVersions.each(function(version, id){
		
			this.mkTr();
			this.mkTd('#'+version.rsn).setStyle('width', 20);
			this.mkTd( new Date(version.created*1000).format('%d.%m.%Y, %H:%M') ).setStyle('width', 120);
			this.mkTd( version.size );
			this.mkTd( version.username );
			
			var div = new Element('div');
			
			new ka.Button(_('Recover'))
			.addEvent('click', this.recover.bind(this, version))
			.inject( div );
			
			this.mkTd( div );
			
		}.bind(this));
		
	},
	
	recover: function( pVersion ){
		
		this.win._confirm(_('The choosen version will be recovered to original path. The current file gets a new version.'), function(res){
			if( !res ) return;
			

			this.lastSizeRq = new Request.JSON({url: _path+'admin/files/recoverVersion', onComplete: function(res){

				this.loadVersions();
				ka._helpsystem.newBubble(_('File recovered'), pVersion.path, 3000 );
				
			}.bind(this)}).post({rsn: pVersion.rsn});
		}.bind(this));
		
	},
	
	loadSize: function(){
		
		this.lastSizeRq = new Request.JSON({url: _path+'admin/files/getFileInfo', onComplete: function(res){
			if( res ){
				this.sizeTd.set('text', res.sizeFormat+' ('+res.size+' Bytes)' );
				this.mkTr().inject( this.sizeTd.getParent(), 'after' );
				this.mkTd(_('Contains'));
				this.mkTd(_('%1 files, %2 directories').replace('%1', res.files).replace('%2', res.dirs));
			}
		}.bind(this)}).post({path: this.file.path, withSize: 1});
		
	},
	
	changeType: function( pType ){
        this.tabButtons.each(function(button, id){ 
            button.setPressed( false );
            this.panes[id].setStyle('display', 'none');
        }.bind(this));
        
        this.tabButtons[ pType ].setPressed(true);
        this.panes[ pType ].setStyle('display', 'block');
    }
	
});


var files_properties_rule = new Class({
	
	initialize: function( pContent, pContainer, pWin ){
		
		this.content = pContent;
		this.container = pContainer;
		this.win = pWin;
		
		var t = pContent.code.split('[');
		
		this.code = t[0];
		this.access = pContent.access;
		
		this.withsub = false;
		if( this.code.indexOf('%') > 0 ){
			this.withsub = true;
		}
		this.code = this.code.replace('%', '');
		
		this.actions = t[1].split(']')[0].split(',');
		
		this.fullcode = pContent.code;

		if( ! this.content )
		    this.content = {};
		
        if( !this.content.target_rsn )
            this.content.target_rsn = '';

        if( !this.content.target_type )
            this.content.target_type = '';

        if( !this.content.type )
            this.content.type = '';

		this.target_rsn = this.content.target_rsn.toInt();
		this.target_type = this.content.target_type.toInt();
		this.type = this.content.type.toInt();
		
		this.main = new Element('tr').inject( this.container );
		this.main.store('rule', this);
		
		this.tdLeft = new Element('td', {
			text: _('Please choose')
		}).inject( this.main );
		
		this.tdAccess = new Element('td').inject( this.main );
		this.tdWithsub = new Element('td').inject( this.main );
		this.tdWrite = new Element('td').inject( this.main );
		this.tdRead = new Element('td').inject( this.main );
		this.tdRemover = new Element('td').inject( this.main );
		
		this.iAccess = new Element('select', {
			width: 80,
			'class': 'txt'
		}).inject( this.tdAccess );

		new Element('option', {
			value: "1",
			text: _('Allow')
		}).inject( this.iAccess );

		new Element('option', {
			value: "0",
			text: _('Disallow')
		}).inject( this.iAccess );

		this.iWithsub = new Element('input', {
			type: 'checkbox',
			checked: true,
			value: 1
		}).inject( this.tdWithsub );
		
		this.iWrite = new Element('input', {
			type: 'checkbox',
			checked: true,
			value: 1
		}).inject( this.tdWrite );
		
		this.iRead = new Element('input', {
			type: 'checkbox',
			checked: true,
			value: 1
		}).inject( this.tdRead );
		
		this.remover = new Element('img', {
			src: _path+'inc/template/admin/images/icons/delete.png',
			style: 'cursor: pointer',
			title: _('Remove rule')
		})
		.addEvent('click', this.remove.bind(this))
		.inject( this.tdRemover );
		
		
		if( this.target_rsn > 0 )
			this.render();
		else
			this.newRule();
	},

	newRule: function(){

		ka.wm.open('users/browser/', {onChoose: this.didChooseATarget.bind(this)}, this.win.id);
		
		
	},
	
	didChooseATarget: function( pType, pValue ){
		
		
		
		
		if( !pType ){
			this.remove();
			return;
		}
		this.target_rsn = pValue;
		this.target_type = pType;
		
		this.render();
		
	},
	
	render: function(){
		
		this.iAccess.value = this.access;
		this.iWrite.checked = this.actions.contains('write');
		this.iRead.checked = this.actions.contains('read');
		this.iWithsub.checked = this.withsub;
		
		
		this.tdLeft.set('text', _('Loading ...'));
		
		new Request.JSON({url: _path+'admin/users/browser/getName', noCache: 1, onComplete: function(res){
			this.tdLeft.set('text', res.name)
			new Element('img', {
				src: _path+'inc/template/admin/images/icons/'+( (this.target_type == 1)?'group':'user')+'.png',
				title: (this.target_type == 1)?_('Group'):_('User'),
				style: 'position: relative; top: 3px; left: -1px'
			}).inject( this.tdLeft, 'top' );
			
		}.bind(this)}).post({rsn: this.target_rsn, type: this.target_type});
		
	},
	
	remove: function(){
		this.removed = true;
		this.main.destroy();
	},
	
	readValues: function(){
		
		this.access = this.iAccess.value;
		this.fullcode = this.code;
		
		if( this.iWithsub.checked )
			this.fullcode += '%';

		if( this.iWrite.checked && this.iRead.checked )
			this.fullcode += '[write,read]';
		else if( this.iRead.checked )
			this.fullcode += '[read]';
		else if( this.iWrite.checked )
			this.fullcode += '[write]';
		else
			this.fullcode += '[]';

	},
	
	getValue: function(){
		
		this.readValues();
		
		var res = {
			access: this.access,
			code: this.fullcode,
			target_rsn: this.target_rsn,
			target_type: this.target_type
		}
		
		return res;
	}
	
});
