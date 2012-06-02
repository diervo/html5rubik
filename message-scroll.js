YUI.add('message-scroll',function(Y){

    function MessageScroll (cfg){
        cfg = cfg || {};
        this._src = Y.one(cfg.src || '#messages');
        this._cardWidth = cfg.width || 408;
        this._src.one('ul.active');
        this._ul = this._src.one('ul.active');
        this._cards = this._src.one('div.populate');
        this.init();
    }

    MessageScroll.prototype = {
        init:function(){
            this.bind();
            this.position = 0;
            this.populate(0);
            this._ul.setStyle('transform','translate3d(-' + this._cardWidth + 'px,0,0)');
            this._ul.addClass('moving');
            this.checkSupport();
        },
        bind: function(){
            this._src.on('webkitTransitionEnd',this._endTransition,this);
            this._src.on('transitionend',this._endTransition,this);
            this._ul.on("flick", Y.bind(this.flickHandler, this), {
                minDistance: 5,
                minVelocity: 0.2,
                preventDefault: true
            });
        },
        checkSupport: function (){
            var notSupported = (Y.UA.opera || Y.UA.ie);
            if(notSupported){
                var tmpl = '<hgroup>' +
                '<h1>Ups!, Browser not supported yet!</h1>' +
                '<h2>I\'m working on it... Try with a Webkit browser in the meantime! :)</h2>' +
                '</hgroup>';
                Y.one('div [data-pos="0"]').setContent(tmpl);
            }
            
        },
        populate: function(position){
            var liPrev = this._ul.one('*'),
                liCurrent = liPrev.next(),
                liNext = liCurrent.next(),

                contentLiPrev = liPrev.one('*'),
                contentLiCurrent = liCurrent.one('*'),
                contentLiNext = liNext.one('*');

                this._cards.append(contentLiPrev);
                this._cards.append(contentLiCurrent);
                this._cards.append(contentLiNext);

                //we check here the cards in case some new load update to the DOM
                this._totalCards = this._cards.get('children').size();

                positionNode = this._cards.one('div[data-pos="'+ position +'"]'),
                prevNode = this._cards.one('div[data-pos="'+ (position-1) +'"]'),
                nextNode = this._cards.one('div[data-pos="'+ (position+ 1) +'"]'),

                liPrev.append(prevNode);
                liCurrent.append(positionNode);
                liNext.append(nextNode);

        },
        _endTransition:function(evt){
                this.populate(this.position);
                this._ul.setStyle('transform','translate3d(-' + this._cardWidth + 'px,0,0)');
                this.moving = false;
            
        },
        flickHandler:function(evt){
            var cardW = this._cardWidth,
                dir = evt.flick.distance > 0 ? 0 : -2,
                horizontal = evt.flick.axis == 'x',
                move = 'translate3d('+ (dir * cardW) +'px,0,0)',
                newPos = this.position + (dir < 0 ? 1 : -1);

            if(horizontal && !this.moving && newPos>=0 && newPos<=this._totalCards-1){
                this.position = newPos;
                this.moving = true;
                this._ul.setStyle('transform',move);
            }
        }
    };

Y.MessageScroll = MessageScroll;

},"0.0.1",{
    requires:['node','transition','event','event-delegate','event-gestures']
});