ka.fupload = {};
ka.fupload._win = false;
ka.fupload._items = new Hash();

ka.fupload._times = new Hash();

ka.fupload.count = 0;
ka.fupload.done = 0;

ka.fupload.choose = function( pPathTo ){
}

ka.fupload._start = function( file ){
    this.removeFileParam( file.id, 'path' );
    this.addFileParam( file.id, 'path', ka.fm.current );
    this.startUpload( file.id );
    ka.fupload.addToUploadMonitor( file );
}

ka.fupload.addToUploadMonitor = function( file, pFlash ){
    ka.fupload.showUploadMonitor();
    ka.fupload.addItem( file, pFlash );
}

ka.fupload.showUploadMonitor = function(){
    if(! ka.fupload._win ){
        ka.uploadMenu.tween( 'top', 53 );
        ka.fupload._win = true;
    }
}

ka.fupload.hideUploadMonitor = function(){
    //ka.uploadMenu.tween( 'top', 20 );
    ka.fupload._win = false;
}

ka.fupload.addItem = function( file, pFlash ){
    ka.fupload.count++;

    ka.uploadMenuInfo.setStyle('display', 'block');

    var item = new Element( 'div', {
        'class': 'item',
        'title': 'Klicken um abzubrechen'
    })
    .addEvent( 'click', function(){
        pFlash.cancelUpload( file.id, true );
//        ka.fupload.success( file );
    })
    .inject( ka.uploadMenuInfo, 'before' );

    var pBar = new Element( 'div', {
        'class': 'pbar'
    }).inject( item );

    new Element( 'div', {
        'class': 'title',
        html: file.name
    }).inject( item );

    new Element( 'div', {
        'class': 'pbarProc'
    }).inject( pBar );

    new Element( 'div', {
        'class': 'pbarProgress'
    })
    .setStyle( 'opacity', 0.6 )
    .inject( pBar );

    ka.fupload._items[ file.id ] = item;
}

function roundNumber(num, dec) {
    var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
    return result;
}

function minsec(time, tempTime) {
    var ztime;
    if (time == "m") {
        ztime = Math.floor(tempTime/60);
        if (ztime < 10) {
            ztime = "0" + ztime;  
        }
    } else if (time == "s") {
        ztime = Math.ceil(tempTime % 60);
        if (ztime < 10) {
            ztime = "0" + ztime;  
        }
    } else {
        ztime = "minsec error...";
    }
    return ztime;
}

ka.fupload._progress = function( file, byteLoaded, byteTotal ){

    if( !ka.fupload._times[ file.id ] )
        ka.fupload._times[ file.id ] = new Date();

    var speed = '0';
    var currentTime = new Date();
    var iTime = ka.fupload._times[ file.id ];
    bytesLoaded = byteLoaded;
    bytesTotal = byteTotal;

    var tempTime = 0;
    var rndfilesize = roundNumber(((file.size/1024)/1024),1);
    var uploaded = roundNumber(((bytesLoaded/1024)/1024),1);
    var uTime = (Math.ceil(currentTime-iTime)/1000);

    var uSpeed = Math.floor(roundNumber(((bytesLoaded/uTime)/1024),2));
    var tempTime = uTime;
    uTime = minsec("m", tempTime) + ":" + minsec("s", tempTime) + " elapsed";

    var mspeed = bytesLoaded / (Math.ceil(currentTime-iTime)/1000);
    var rest = bytesTotal - bytesLoaded;
    var tempTime = rest / mspeed;

//  tempTime = roundNumber(((((bytesTotal-bytesLoaded)/uSpeed)/60)/10),2);
    if (tempTime != "Infinity") {
        if (tempTime > 0) {
            //if greater than 0
            //Timeleft in min:sec
            Timeleft = minsec("m", tempTime) + ":" + minsec("s", tempTime) + "";
        } else {
            Timeleft = "";
        }
    } else {
        Timeleft = "";
    }

    ka.uploadMenuInfo.set('html', 'Speichere '+(ka.fupload.done+1)+' (von '+ka.fupload.count+')<div style="padding-left: 13px;">Aktuelle Datei '+uSpeed+' kB/s - ('+Timeleft+')</div>');

    var item = ka.fupload._items[ file.id ];
    var percent = Math.ceil((byteLoaded / file.size) * 100);

    item.getElement( 'div[class=pbarProc]' ).set( 'html', percent + ' %' );
    item.getElement( 'div[class=pbarProgress]' ).setStyle( 'width', percent + '%' );
}

ka.fupload.error = function( file ){
    ka.fupload.success( file );
}

ka.fupload.success = function( file ){
    ka.fupload.done++;
    if( ka.fupload.done >= ka.fupload.count){ //all done - reset values
        ka.fupload.count = 0;
        ka.fupload.done = 0;
        ka.uploadMenuInfo.setStyle('display', 'none');
    }

    var item = ka.fupload._items[ file.id ];
    item.set( 'tween', {onComplete: function(){
        item.destroy();
    }});
    item.set('tween', {onComplete: function(){
        item.destroy(); 
    }});
    item.tween( 'opacity', 0);
    //ka.fm.reload();
}
