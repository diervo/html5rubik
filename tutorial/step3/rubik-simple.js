/*
*
* HTML5: CSS3 & JavaScript Rubik's cube
* Rubik's Cube ® used by permission of Seven Towns Limited.
* http://www.rubiks.com
*
*/

YUI.add('rubik-simple', function (Y) {
    /*
    * This is a map for the cubies movements.
    * When the cube rotates in a certain way we have move his position on the cube.
    * Every cubie represent a css class which contains his transformation in 3D
    * Example:
    * When we rotate the left side of the cube clockwise,
    * which is the movement "M" in the left part => LM-left).
    * The cubie which is on the upper side, on the top left corner ("utl"), after the Left side movement
    * goes to the bottom side in the same position ("btl").
    * So on LM-left, "utl" => "btl"
    * Where "utl" class is .utl {-webkit-transform:rotateX(90deg)   translate3d(50px,-100px,0)}
    * and "btl" class is:  .btl {-webkit-transform:rotateX(-180deg) translate3d(50px,-250px,150px)}
    *
    */
    var CUBIE_MOVEMENTS = {
        'LM-left':{
            "utl":"btl","ucl":"bcl","ubl":"bbl","ftl":"utl","fcl":"ucl","fbl":"ubl","dtl":"ftl",
            "dcl":"fcl","dbl":"fbl","btl":"dtl","bcl":"dcl","bbl":"dbl","ltl":"lbl","lcl":"lbc",
            "lbl":"lbr","ltc":"lcl","lbc":"lcr","ltr":"ltl","lcr":"ltc","lbr":"ltr","lcc":"lcc"
        },
        "LM-right":{
            "utl":"ftl","ucl":"fcl","ubl":"fbl","ftl":"dtl","fcl":"dcl","fbl":"dbl","dtl":"btl",
            "dcl":"bcl","dbl":"bbl","btl":"utl","bcl":"ucl","bbl":"ubl","ltl":"ltr","lcl":"ltc",
            "lbl":"ltl","ltc":"lcr","lbc":"lcl","ltr":"lbr","lcr":"lbc","lbr":"lbl","lcc":"lcc"
        },
        'RM-right':{
            "utr":"ftr","ucr":"fcr","ubr":"fbr","ftr":"dtr","fcr":"dcr","fbr":"dbr","dtr":"btr",
            "dcr":"bcr","dbr":"bbr","btr":"utr","bcr":"ucr","bbr":"ubr","rtl":"rbl","rcl":"rbc",
            "rbl":"rbr","rtc":"rcl","rcc":"rcc","rbc":"rcr","rtr":"rtl","rcr":"rtc","rbr":"rtr"
        },
        'RM-left':{
            "utr":"btr","ucr":"bcr","ubr":"bbr","ftr":"utr","fcr":"ucr","fbr":"ubr","dtr":"ftr",
            "dcr":"fcr","dbr":"fbr","btr":"dtr","bcr":"dcr","bbr":"dbr","rtl":"rtr","rcl":"rtc",
            "rbl":"rtl","rtc":"rcr","rbc":"rcl","rtr":"rbr","rcr":"rbc","rbr":"rbl","rcc":"rcc"
        },
        'CM-right':{
            "utc":"ftc","ucc":"fcc","ubc":"fbc","ftc":"dtc",
            "fcc":"dcc","fbc":"dbc","dtc":"btc","dcc":"bcc",
            "dbc":"bbc","btc":"utc","bcc":"ucc","bbc":"ubc"
        },
        'CM-left':{
            "utc":"btc","ucc":"bcc","ubc":"bbc","ftc":"utc",
            "fcc":"ucc","fbc":"ubc","dtc":"ftc","dcc":"fcc",
            "dbc":"fbc","btc":"dtc","bcc":"dcc","bbc":"dbc"
        },
        'UE-left':{
            "rtl":"ftl","rtc":"ftc","rtr":"ftr","ftl":"ltl","ftc":"ltc","ftr":"ltr","ltl":"bbr",
            "ltc":"bbc","ltr":"bbl","bbr":"rtl","bbc":"rtc","bbl":"rtr","utl":"utr","ucl":"utc",
            "ubl":"utl","utc":"ucr","ubc":"ucl","utr":"ubr","ucr":"ubc","ubr":"ubl","ucc":"ucc"
        },
        'UE-right':{
            "ltl":"ftl","ltc":"ftc","ltr":"ftr","ftl":"rtl","ftc":"rtc","ftr":"rtr","rtl":"bbr",
            "rtc":"bbc","rtr":"bbl","bbr":"ltl","bbc":"ltc","bbl":"ltr","utl":"ubl","ucl":"ubc",
            "ubl":"ubr","utc":"ucl","ucc":"ucc","ubc":"ucr","utr":"utl","ucr":"utc","ubr":"utr"
        },
        'CE-right':{
            "fcl":"rcl","fcc":"rcc","fcr":"rcr","lcl":"fcl",
            "lcc":"fcc","lcr":"fcr","bcl":"lcr","bcc":"lcc",
            "bcr":"lcl","rcl":"bcr","rcc":"bcc","rcr":"bcl"
        },
        'CE-left':{
            "fcl":"lcl","fcc":"lcc","fcr":"lcr","rcl":"fcl",
            "rcc":"fcc","rcr":"fcr","bcl":"rcr","bcc":"rcc",
            "bcr":"rcl","lcl":"bcr","lcc":"bcc","lcr":"bcl"
        },
        'DE-left':{
            "fbl":"lbl","fbc":"lbc","fbr":"lbr","lbl":"btr","lbc":"btc","lbr":"btl","btr":"rbl",
            "btc":"rbc","btl":"rbr","rbl":"fbl","rbc":"fbc","rbr":"fbr","dtl":"dbl","dcl":"dbc",
            "dbl":"dbr","dtc":"dcl","dcc":"dcc","dbc":"dcr","dtr":"dtl","dcr":"dtc","dbr":"dtr"
        },
        'DE-right':{
            "fbl":"rbl","fbc":"rbc","fbr":"rbr","rbl":"btr","rbc":"btc","rbr":"btl","btr":"lbl",
            "btc":"lbc","btl":"lbr","lbl":"fbl","lbc":"fbc","lbr":"fbr","dtl":"dtr","dcl":"dtc",
            "dbl":"dtl","dtc":"dcr","dbc":"dcl","dtr":"dbr","dcr":"dbc","dbr":"dbl","dcc":"dcc"
        },
        'FS-left':{
            "ubl":"lbr","ubc":"lcr","ubr":"ltr","lbr":"dtr","lcr":"dtc","ltr":"dtl","dtl":"rbl",
            "dtc":"rcl","dtr":"rtl","rbl":"ubr","rcl":"ubc","rtl":"ubl","ftl":"fbl","fcl":"fbc",
            "fbl":"fbr","ftc":"fcl","fcc":"fcc","fbc":"fcr","ftr":"ftl","fcr":"ftc","fbr":"ftr"
        },
        'FS-right':{
            "ubl":"rtl","ubc":"rcl","ubr":"rbl","lbr":"ubl","lcr":"ubc","ltr":"ubr","dtl":"ltr",
            "dtc":"lcr","dtr":"lbr","rbl":"dtl","rcl":"dtc","rtl":"dtr","ftl":"ftr","fcl":"ftc",
            "fbl":"ftl","ftc":"fcr","fbc":"fcl","ftr":"fbr","fcr":"fbc","fbr":"fbl","fcc":"fcc"
            
        },
        'CS-left':{
            "ucl":"lbc","ucc":"lcc","ucr":"ltc","ltc":"dcl",
            "lcc":"dcc","lbc":"dcr","dcl":"rbc","dcc":"rcc",
            "dcr":"rtc","rbc":"ucr","rcc":"ucc","rtc":"ucl"
        
        },
        'CS-right':{
            "lbc":"ucl","lcc":"ucc","ltc":"ucr","dcl":"ltc",
            "dcc":"lcc","dcr":"lbc","rbc":"dcl","rcc":"dcc",
            "rtc":"dcr","ucr":"rbc","ucc":"rcc","ucl":"rtc"
        },
        'BS-right':{
            "utl":"rtr","utc":"rcr","utr":"rbr","rtr":"dbr","rcr":"dbc","rbr":"dbl","dbr":"lbl",
            "dbc":"lcl","dbl":"ltl","lbl":"utl","lcl":"utc","ltl":"utr","btl":"bbl","bcl":"bbc",
            "bbl":"bbr","btc":"bcl","bcc":"bcc","bbc":"bcr","btr":"btl","bcr":"btc","bbr":"btr"
        },
        'BS-left':{
            "rtr":"utl","rcr":"utc","rbr":"utr","dbr":"rtr","dbc":"rcr","dbl":"rbr","lbl":"dbr",
            "lcl":"dbc","ltl":"dbl","utl":"lbl","utc":"lcl","utr":"ltl","btl":"btr","bcl":"btc",
            "bbl":"btl","btc":"bcr","bbc":"bcl","btr":"bbr","bcr":"bbc","bbr":"bbl","bcc":"bcc"
        }
    };
      
    //Match the sides with css .class
    var INIT_CONFIG = {
        "front":"blue",
        "back":"green",
        "up":"red",
        "down":"white",
        "left":"orange",
        "right":"yellow"
    };
    function Rubik (cfg) {
        this._init(cfg || {});
        this._bind();
        this._setInitialPosition(cfg);
    }
    Rubik.prototype = {
        _init: function (cfg) {
            this._container = Y.one(cfg.container || '#cube-container');
            this._cube = Y.one(cfg.src || '#cube');
            this._plane = Y.Node.create('<div id="plane"></div>');
            this._cube.append(this._plane);
            this._expectingTransition = false;
            this._setScroll();
        },
        /*
        * We use the YUI gesture which allows to abstract the click/tap
        * so it works with the mouse click or with tap/flick gestures.
        */
        _bind: function () {
            //TODO: Fix YUI bug to abstract transitionEnd
           this._cube.on('transitionend',this._endTransition,this);
           this._cube.on('webkitTransitionEnd',this._endTransition,this);
           
           this._container.on('gesturemovestart',this._onTouchCube,{preventDefault:true},this);
           this._container.on('gesturemove',this._onMoveCube,{preventDefault:true},this);
           this._container.on('gesturemoveend',this._onEndCube,{preventDefault:true},this);
           
           this._container.on('gesturestart',this._multiTouchStart,this);
           this._container.on('gesturechange',this._multiTouchMove,this);
           this._container.on('gestureend',this._multiTouchEnd,this);

           Y.one('body').on('gesturemovestart',this._checkScroll,{},this);
        },
        _setScroll: function (evt) {
            self = this;
            setTimeout(function () {
                window.scrollTo(0,1);
            },1);
        },
        _setInitialPosition: function (cfg) {
            this._setInitialColors();
            //TODO: set as a configurable ATTR on instanciation
            var pos = cfg && cfg.position || {x: 28, y: -28 };
            this._cube.setStyle('transform','rotateX('+ pos.y + 'deg) rotateY(' +pos.x + 'deg)');
            this._cubeXY = pos;
            this._tempXY = pos;
        },
        _setInitialColors: function (){
            for(var face in INIT_CONFIG){
                Y.all('.' +face + ' > div').addClass(INIT_CONFIG[face]);
            }
        },
        _endTransition: function (evt) {
            if (this._expectingTransition){
                console.log('W');
                evt.halt();
                this._plane.set('className',"");
                this._reorganizeCubies();
                this._detachToPlane();
                this._moving = false;
                this._expectingTransition = false;
            }
        },
        /*
        * We got the first finger/click on the cube
        * Save the position.
        */
        _onTouchCube:function (evt) {
            evt.halt();
            this._tempCubie = evt.target.ancestor('.cubie');
            this._startX = evt.clientX;
            this._startY = evt.clientY;
            this._deltaX = 0;
            this._deltaY = 0;
        },
        /*
        * Getting a mouse/double-finger moving. We need to update the rotation(XY) of the cube
        * We need to add some logic due to the mouse.
        * This function gets triggered if a gesture/click is present
        */
        _onMoveCube:function (evt) {
            evt.halt();
            //TODO set rate move as a constant.
            var deltaX = this._deltaX = ((evt.clientX - this._startX)/1.2),
            deltaY = this._deltaY = ((evt.clientY - this._startY)/1.2),
            x = this._cubeXY.x + deltaX;
            y = this._cubeXY.y - deltaY;
            if (this._gesture){
                this._tempXY = {x: x, y:y};
                this._moved = true;
                this._cube.setStyle('transform','rotateX('+ y  + 'deg) rotateY(' + x + 'deg)');
                Y.one('#log > p').setContent("Moved:" + Math.floor(y) +' , ' + Math.floor(x) );
            }else{
                this._moved = false;
            }
        },
        /*
        * All magic happen here. Check how the user flick his finger, in which side...
        * Map this regarding the 2D position of the cube and transform it in 3D.
        */
        _onEndCube:function (evt) {
            //if gesture we dont do movement
            if (this._disabledFLick || this._gesture || this._moved || !this._tempCubie) {
                this._gesture = false;
                this._moved = false;
                return;
            }
            evt.halt();

            if (!this._deltaX && !this._deltaY)return; // if no delta no move, so nothing to do!

            this._tempXY = {x: this._tempXY.x % 360, y: this._tempXY.y % 360 };// to get controlled the degrees
            var threshold = 70,//ToDo: Double check this value in different devices
                movement,swap,
                rotateX = this._deltaX > 0 ? "right" :"left",
                rotateXInverted = rotateX == "right" ? "left": "right",
                deg = Math.abs(this._tempXY.x),
                rotateY = this._deltaY > 0 ? "right" : "left",
                rotateYInverted = rotateY == "right" ? "left": "right",
                rotateBoth = Math.abs(this._deltaX) > threshold && Math.abs(this._deltaY) > threshold;
                mHorizontal = Math.abs(this._deltaX) > Math.abs(this._deltaY),
                parts = this._tempCubie.get('className').split(' ');
                this._expectingTransition = true;

             /* We will have to translate the finger movements to the cube movements
             * (implies transform 2D dimension into -> 3D)
             * At some point we should refactor this in a better way...
             */

            switch(true){
                //E Movements:
                //Front, left, right, back in E (left or right) direction
                case parts[2] != "up" && parts[2] != "down" && mHorizontal:
                    movement = {face: parts[4].charAt(0),slice: parts[4].charAt(1),rotate: rotateX};
                    break;
                //up and down in E ( we have to adjust the 3D rotation tu a 2D plane:
                case (parts[2] == "up" || parts[2] == "down") && mHorizontal && deg>= -45 &&  deg<45:
                    if (parts[2] == "down"){swap = rotateX; rotateX = rotateXInverted; rotateXInverted = swap;}
                    movement = {face: parts[5].charAt(0),slice: parts[5].charAt(1),rotate: rotateX};
                    break;

                case (parts[2] == "up" || parts[2] == "down") && mHorizontal && deg>= 45 &&  deg< 135:
                    if (parts[2] == "down"){swap = rotateX; rotateX = rotateXInverted; rotateXInverted = swap;}
                    movement = {face: parts[3].charAt(0),slice: parts[3].charAt(1),rotate: this._tempXY.x < 0 ? rotateXInverted: rotateX};
                    break;
                
                case (parts[2] == "up" || parts[2] == "down") && mHorizontal && deg>= 135 && deg < 225:
                    if (parts[2] == "down"){swap = rotateX; rotateX = rotateXInverted; rotateXInverted = swap;}
                    movement = {face: parts[5].charAt(0),slice: parts[5].charAt(1),rotate: rotateXInverted};
                    break;
                    
                case (parts[2] == "up" || parts[2] == "down") && mHorizontal && deg>= 225 && deg < 315:
                    if (parts[2] == "down"){swap = rotateX; rotateX = rotateXInverted; rotateXInverted = swap;}
                    movement = {face: parts[3].charAt(0),slice: parts[3].charAt(1),rotate: this._tempXY.x < 0 ?rotateX: rotateXInverted};
                    break;
                    
                //M movements:
                
                //front and back
                case (parts[2] == "front" || parts[2] == "back") && !mHorizontal:
                    if (parts[2] == "back"){swap = rotateY; rotateY = rotateYInverted; rotateYInverted = swap;}
                    movement = {face: parts[3].charAt(0),slice: parts[3].charAt(1),rotate: rotateY};
                    break;
                //right and left
                case (parts[2] == "right" || parts[2] == "left") && !mHorizontal:
                    if (parts[2] == "left"){swap = rotateY; rotateY = rotateYInverted; rotateYInverted = swap;}
                    movement = {face: parts[5].charAt(0),slice: parts[5].charAt(1),rotate: rotateY};
                    break;
                //up & down:
                case (parts[2] == "up" || parts[2] == "down") && !mHorizontal && deg>= -45 &&  deg<45:
                    movement = {face: parts[3].charAt(0),slice: parts[3].charAt(1),rotate: rotateY};
                    break;

                case (parts[2] == "up" || parts[2] == "down") && !mHorizontal && deg>= 45 &&  deg<135:
                    movement = {face: parts[5].charAt(0),slice: parts[5].charAt(1),rotate: rotateYInverted};
                    break;

                case (parts[2] == "up" || parts[2] == "down") && !mHorizontal && deg>= 135 &&  deg<225:
                    movement = {face: parts[3].charAt(0),slice: parts[3].charAt(1),rotate: rotateYInverted};
                    break;

                case (parts[2] == "up" || parts[2] == "down") && !mHorizontal && deg>= 225 &&  deg<315:
                    movement = {face: parts[5].charAt(0),slice: parts[5].charAt(1),rotate: rotateY};
                    break;
                   
                default: break;
             }
            if (movement)
                this._doMovement(movement);
        },
        _multiTouchStart:function (evt) {
            evt.halt();
            this._startX = evt.clientX || evt.pageX;
            this._startY = evt.clientY || evt.pageY;
            this._gesture = true;
        },
        _multiTouchMove:function (evt) {
            if (this._portrait || !this._enableRotation)return;

            evt.clientX = evt.pageX;
            evt.clientY = evt.pageY;
            this._onMoveCube(evt);
        },
        _multiTouchEnd:function (evt) {
            this._gesture = false;
            evt.halt();
            this._cubeXY.x = this._tempXY.x;
            this._cubeXY.y = this._tempXY.y;
        },
        
        _doMovement:function (m,fromQueue) {
            if (this._moving)return;//we cancel if there is some movement going on
            var plane = this._plane,
                list = Y.all('.' + m.face + m.slice);
            this._movement = m;
            this._moving = true;
            this._attachToPlane(list);
            plane.addClass('moving').addClass(m.slice +'-'+ m.rotate);
        },
        _attachToPlane:function (list) {
            this._plane.setContent(list);
        },
        _detachToPlane:function () {
            var children = this._plane.get('children');
            this._cube.append(children);
        },
        _reorganizeCubies:function () {
            var m = this._movement,
                changes = CUBIE_MOVEMENTS[m.face + m.slice +'-' +m.rotate],
                list = this._plane.get('children'),
                tempCubies = {};
                list.each(function (originCube,i) {
                    if (originCube.hasClass('face'))return;
                    //get the class and the position of the cubie
                    var originCubeClass = originCube.get('className'),
                        cubePos = (originCubeClass.split(' ',1))[0];
                    //we keep te original position and class
                    tempCubies[cubePos] = originCubeClass;
                    
                    //we try to find the cube to swap position
                    var destCube = Y.one('.' + changes[cubePos]);
                    
                    // if we dont find it, we already swap that cubie, we have to find the original css class in temp.
                    var destCubeClass = destCube? destCube.get('className'): tempCubies[changes[cubePos]],
                        cubePosDes = destCubeClass.split(' ',1)[0];
                        
                   //swap position of the cubie acording to the movement.
                    originCube.set('className', cubePosDes + destCubeClass.substr(3));
                });
        },
        _initLandscape:function () {
            var transformIn = {opacity: 1,duration:2},
                css = {display: 'block'};

            this._cube.transition(transformIn);
        },
        run:function () {
                this._initLandscape();
        }
    };
Y.Rubik = Rubik;
},"0.0.1",{
    requires:['yui-later','node','transition','event','event-delegate','event-gestures']
});