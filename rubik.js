/*
*
* HTML5: CSS3 & JavaScript Rubik's cube
* Rubik's Cube ® used by permission of Seven Towns Limited.
* http://www.rubiks.com
*
*/

YUI.add('rubik-queue', function (Y) {

    Queue = function (config) {
        config = config || {};
        this.size = 0;
        this.current = -1;
        this._queue = [];
    };

    Queue.prototype = {

        add: function (m) {
            if(++this.current == this.size){
                this._queue.push(m);
                this.size++;
            }else{
                this._queue = this._queue.slice(0,this.current);
                this.size = this.current + 1;
                this._queue.push(m);
            }
        },
        undo: function () {
            var m;
            if(this.current >= 0){
                m = this._queue[this.current];
                m.rotate = m.rotate === 'left'? 'right' : 'left';
                this.current--;
                return m;
            }
        },
        redo: function () {
            if (this.current + 1 < this.size){
                var m = this._queue[++this.current];
                m.rotate = m.rotate === 'left'? 'right' : 'left';
                return m;
            }
        }

    };
    Y.Queue = Queue;
});


YUI.add('rubik', function (Y) {
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
            this._controls = Y.one(cfg.controls || '#cube-controls');
            this._rotation = Y.one(cfg.controls || '#rotation');
            this._messages = Y.one(cfg.messages || '#messages');
            this._tutorial = Y.one(cfg.messages || '#tutorial');
            this._solve = Y.one(cfg.solve || '.solve');
            this._undo = Y.one(cfg.undo || '.undo');
            this._redo = Y.one(cfg.redo || '.redo');
            this._queue = new Y.Queue();
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

           this._solve.on('gesturemovestart',this._solveFake,{preventDefault:true},this);
           this._undo.on('gesturemovestart',this._undoMove,{preventDefault:true},this);
           this._redo.on('gesturemovestart',this._redoMove,{preventDefault:true},this);

           if (Y.UA.mobile) {
                //this._rotation.on('gesturestart',this._onRotationFocus,this);
                //this._rotation.on('gestureend',this._onRotationBlur,this);
                //we support it by default:
                this._enableRotation = true;
            } else {
                this._rotation.on('click',this._onRotationToggle,this);
                Y.on('keypress',Y.bind(this._keyPress,this));
            }


           Y.on('orientationchange',Y.bind(this._changeOrientation,this));
           Y.one('body').on('gesturemovestart',this._checkScroll,{},this);
        },
        _keyPress: function (e) {
            e.halt();
            if (e.charCode == 114) {
                this._onRotationToggle();
            }
            return;
        },
        _undoMove: function (e) {
            if (this._moving)return;
            var movement = this._queue.undo();
            this._expectingTransition = true;
            movement && this._doMovement(movement, true);
            return movement;
        },
        _redoMove: function (e) {
            if (this._moving)return;
            var movement = this._queue.redo();
            this._expectingTransition = true;
            movement && this._doMovement(movement, true);
        },
        _solveFake: function (){
            this._solving = Y.later(350,this,function (){
                var m = this._undoMove();
                if(!m){
                    this._solving.cancel();
                }
            },null,true);
        },
        _changeOrientation: function (evt) {
            this._setScroll();
            this._portrait = window.orientation === 0 ? this._changeToPortrait() : this._changeToLandscape();
        },
        _onRotationFocus: function ()  {
            this._enableRotation = true;
        },
        _onRotationBlur: function ()  {
          this._enableRotation = false;
        },
        //handler only for non-touch/gesture devices
        _onRotationToggle: function ()  {
            var enabled = this._enableRotation;
            if (enabled) {
               this._rotation.removeClass('pcRotation');
            } else {
                 this._rotation.addClass('pcRotation');
            }
            this._enableRotation = !enabled;
            this._gesture = !enabled;
        },
        _setScroll: function (evt) {
            self = this;
            setTimeout(function () {
                window.scrollTo(0,1);
            },1);
        },
        _checkScroll: function (evt) {
            this._setScroll();
        },
        _setInitialPosition: function (cfg) {
            this._setInitialColors();
            //TODO: set as a configurable ATTR on instanciation
            var pos = cfg && cfg.position || {x: 30, y: -30 };
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
                evt.halt();
                this._plane.set('className',"");
                this._reorganizeCubies();
                this._reorientCubies();
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
            }else{
                this._moved = false;
            }
        },
        /*
        * All magic happen here. We have to check how the use flick his finger, in which side,
        */
        _onEndCube:function (evt) {
            //if gesture we dont do movement
            if (this._gesture || this._moved || !this._tempCubie) {
                this._gesture = false;
                this._moved = false;
                if (!Y.UA.mobile){
                    this._onRotationToggle();
                    this._multiTouchEnd(evt);
                }
                return;
            }
            evt.halt();
            if (!this._deltaX && !this._deltaY)return; // if we dont move we dont do nothing
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
             // We will have to translate the finger movements to the cube movements
             //(implies transform 2D dimension into -> 3D)
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
             //this._gesture = false;//finish all touching
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
            //save the movement if doesnt came from the queue.
            if(!fromQueue){
                this._queue.add(m);
            }
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
        _changeTextOrientation:function (elm,rotation) {
            var state = elm.get('className'),txt = state.split(' ',2),color = txt[0] + " ";
            txt= txt[1] || txt[0];
            switch(txt){
                case "textLeft": elm.replaceClass(txt, rotation == "left" ? 'textDown' : '');break;
                case "textRight":elm.replaceClass(txt, rotation == "left" ? '' : 'textDown');break;
                case "textDown": elm.replaceClass(txt, rotation == "left" ? 'textRight' : 'textLeft');break;
                default: elm.set('className',color + (rotation == "left" ? 'textLeft' : 'textRight') );break;
            }
        },
        //Reorient the content inside the cubics
        _reorientCubies:function () {
            var plane = this._plane,
                cubies = plane.get('children'),
                m = this._movement;

            switch(true){
                case m.face == "C" && m.slice == "S":
                case m.face == "F" && m.slice == "S":
                    cubies.each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                                        
                case m.face == "B" && m.slice == "S":
                    cubies.filter('.back').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate == "left"? "right":"left" );
                    },this);
                    cubies.filter(':not(.back)').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                                                     
                case m.face == "L" && m.slice == "M":
                    cubies.filter('.left').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                                                     
                case m.face == "R" && m.slice == "M":
                    cubies.filter('.right').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate =="left"? "right":"left");
                    },this);
                    break;
                                                     
                case m.face =="C" && m.slice == "E" && m.rotate =="left":
                case m.face =="U" && m.slice == "E" && m.rotate =="left":
                    cubies.filter('.up').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate =="left"? "right":"left");
                    },this);
                    cubies.filter('.back').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter('.right').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        },this);
                    break;
                                                     
                case m.face =="C" && m.slice == "E" && m.rotate =="right":
                case m.face =="U" && m.slice == "E" && m.rotate =="right":
                    cubies.filter(function (i) {
                        return i.className.indexOf('up') !== -1;
                    }).each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate =="left"? "right":"left");
                    },this);
                    cubies.filter(function (i) {
                        return i.className.indexOf('back') !== -1;
                    }).each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter(function (i) {
                        return i.className.indexOf('left') !== -1;
                    }).each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                
                case m.face =="D" && m.slice == "E" && m.rotate =="right":
                    cubies.filter('.down').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter('.back').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter('.left').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                                                     
                case m.face =="D" && m.slice == "E" && m.rotate == "left":
                    cubies.filter('.down').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter('.back').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    cubies.filter('.right').each(function (e) {
                        this._changeTextOrientation(e.one('*'),m.rotate);
                        this._changeTextOrientation(e.one('*'),m.rotate);
                    },this);
                    break;
                default: break;
            }
        },
        _startRotationMode: function () {
            if (window.DeviceOrientationEvent) {
                this._tempXY = {x:-20,y:50};
                this._rotationAttach = Y.bind(this._getRotation,this);
                window.addEventListener('deviceorientation',this._rotationAttach, false);
            }
        },
        _endRotationMode:function () {
            window.removeEventListener('deviceorientation',this._rotationAttach);
        },
        _getRotation: function (evt) {
            var tiltLR = this._tempXY.x + Math.round(evt.gamma* 1.4) ,
                tiltFR = this._tempXY.y - Math.round(evt.beta * 1.4) ,
                rotation = "rotateY(" + tiltLR + "deg) rotateX("+tiltFR +"deg)";
            //Y.one('#log > p').setContent(rotation);
            this._cube.setStyle('transform',rotation);
            //this._tempXY = {x: tiltFR,y: tiltLR};
        },
        _initPortrait:function () {
            var transformIn = {opacity: 1,duration: 2},
                css = {display: 'block'},
                cubeStyle = {
                    zoom: '1.20',
                    margin: '80px 180px',
                    display:'block'
                },
                self = this;
            this._startRotationMode();
            this._cube.setStyles(cubeStyle).transition(transformIn);
            this._tutorial.setStyles(css).transition(transformIn);

        },
        _changeToPortrait: function () {
            var css = {display: 'none'},
            cubeStyle = {
                    zoom: '1.20',
                    margin: '80px 180px',
                    display:'block'
                };

            //start gyroscope rotation
            this._startRotationMode();

            //show:
            Y.later(300,this,function () {
                this._tutorial.setStyles({display: 'block',opacity:1,bottom:'10px'});
            });

            //hide:
            this._messages.setStyles(css);
            this._controls.setStyles(css);
            this._cube.transition(cubeStyle);
            return true;
        },
        _initLandscape:function () {
            var transformIn = {opacity: 1,duration:2},
                css = {display: 'block'};

            this._cube.transition(transformIn);
            this._messages.setStyles(css).transition(transformIn);
            this._controls.setStyles(css).transition(transformIn);
        },
        _changeToLandscape:function () {
            //stop gyroscope rotation
            this._endRotationMode();

            var tr = {opacity:0},
                cssDisplayNone = {display: 'none'},
                cssDisplay = {display: 'block',opacity:1},
                cubeStyle = {
                    zoom: '0.85',
                    margin: '40px 110px'
                };

            //show
            this._cube.setStyles(cubeStyle);
            this._messages.setStyles(cssDisplay);
            this._controls.setStyles(cssDisplay);

            //hide
            this._tutorial.transition(tr,function () {
                this.setStyles(cssDisplayNone);
            });

            return false;//for the orientation(for sake of simplicity)
        },
        run:function () {
            var force;
            //force = true;
            if (force || (this._portrait = window.orientation === 0)){
                this._initPortrait();
            }else{
                this._initLandscape();
            }
        }
    };
Y.Rubik = Rubik;
},"0.0.1",{
    requires:['rubik-queue','yui-later','node','transition','event','event-delegate','event-gestures']
});