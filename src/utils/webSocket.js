/* eslint-disable */ 
function XSocket(opts) {
    this.options = opts;

    // 用来存储结果
    // this.tradeRs = null;
    // this.marketRs = null;
    // this.depthRs = null;
    this.market = [];
    this.initiativeClose = false;
    // 过滤数据的函数
    this.filter = null;

    // 数据排序的函数
    this.sorter = null;

    // 数据合并的函数
    this.merge = null;

    // 最近一次长链接返回时间
    this.lastWSSRepinseStamp = null;

    this.init();
}
XSocket.prototype = {
    init: function () {
        let me = this;
        this.onopen = function () {
            me.sub(me.options.subList);
            me.pingpong();
        };
        if(this.initiativeClose){
            return me.socket.close();
        }
        this.onmessage = function (evt) {
            let rs = evt;
            try {
                let received_msg =evt.data?eval("("+evt.data+")"):eval("("+evt+")");
                let data =received_msg[0]?received_msg[0]:received_msg;
                if (data.data){
                    if(data.data.result){
                        me.market= [];
                        console.log("订阅成功", data.data.channel);
                    }else{
                        if ( !data.data.error_code ) {
                            if (me.market.length>=me.options.subList.length) {
                                me.market.forEach((arr) => {
                                    let _arr = arr;
                                    if (data.channel) {
                                        if (_arr.channel == data.channel) {
                                            _arr.data = data.data;
                                        }
                                    }
                                });
                            } else {
                                me.market.push(data);
                            }
                            if (typeof me.options.callback === "function") {
                                me.options.callback(me.market);
                            }
                        }
                    }
                    
                }
              
                
            } catch (e) {
                // 长链接有异常，也要轮训
                me.startPolling();
            }
            // if (rs) {
            //     me.handleResponse(rs);

            //     me.stopPolling();
            //     me.lastWSSRepinseStamp = Date.now();
            // }
        };
        this.onclose = function () {
            
            if(!me.initiativeClose){
                me.reconnectWSS();
                me.startPolling();
            }else{
                console.log("主动断开");
            }
           
        };
        this.onerror = function () {
            console.log(me.initiativeClose)
            if(!me.initiativeClose){
                console.log("连接出错");
                me.reconnectWSS();
                me.startPolling();
            }else{
                console.log("主动断开提示");
            }
            
        };

        this.initWebSocket();
        this.startPolling();
    },
    // 数据观察员3 s 做一次判断
    // 记录长链接返回数据距上次数据的时间，如果时间超过10s，自动启动polling
    // 暂时不开启
    observeWss: function () {
        let me = this;
        setInterval(() => {
            let diff = Date.now() - me.lastWSSRepinseStamp;
            if (diff> 10* 1000) {
                me.startPolling();
            }
        }, 3* 1000);
    },
    initWebSocket: function () {
        this.socket = new WebSocket(this.options.url);
        this.socket.onopen = this.onopen;
        this.socket.onmessage = this.onmessage;
        this.socket.onclose = this.onclose;
        this.socket.onerror = this.onerror;
      
    },

    // 10 秒后重链接
    reconnectWSS: function () {
        let me = this;
        console.log("10 秒后重链接");
        // 100ms 内，禁止快速重新连接
        clearTimeout(this.reconn_timer);
        this.reconn_timer = setTimeout(() => {
            setTimeout(() => {
                me.initWebSocket();
            }, 10 * 1000);
        }, 100);
    },
    handleResponse: function (rs) {
        let me = this;

        // let action = rs.action;
        // let params = rs.params;
        // let type = params.type;
        // let pair = params.pair;

        // switch (type) {
        // case 'market':
        //     me.marketRs = rs;
        //     me.renderMarket(rs);
        //     break;
        // case 'trade':
        //     me.tradeRs = rs;
        //     me.renderTrade(rs);
        //     break;
        // case 'depth':
        //     me.depthRs = rs;
        //     me.renderDepth(rs);
        //     break;
        // default:
        //     console.log('unhandled', rs);
        // }
    },


    // 添加heart-bit
    pingpong: function () {
        let me = this;
        setInterval(() => {
            if (me.socket.readyState == 1) {
                me.socket.send('{"event":"ping"}');
            }
        }, 10* 1000);
    },

    sub: function (subList) {
        let _subList = [].concat.apply([], subList);

        for (let i = 0; i < _subList.length; i++) {
            let itemSub = _subList[i];

            if (!itemSub) {
                return;
            }

            itemSub = JSON.stringify(itemSub);
            this.socket.send(itemSub);
        }
    },

    setFilter: function (fn) {
        this.filter = fn;
    },
    setSorter: function (fn) {
        this.sorter = fn;
    },
    setMerge: function (fn) {
        this.merge = fn;
    },

    renderTitle: function (obj) {

    },
    // trade和market 共同决定的
    renderTradePriceTrend() {

    },
    renderTrade: function (rs) {

    },

    /*
    /*filter 过滤数据的函数
    */
    renderMarket: function (rs) {

        // let regBTC = /\_btc$/ig;
        // let regDKKT = /\_dkkt$/ig;
        // let regETH = /\_eth$/ig;
        // let regUSDT = /\_usdt$/ig;
    },
    renderDepth: function (rs) {

    },
    // 1. 页面开始进入使用该调用，直到长链接首次返回数据，才停止
    // 2. 长链接断开使用该调用，直到长链接重新连接并返回数据，才停止
    fetch: function () {
        let me = this;

        if (me._isStopPolling_) {
            console.log('stoped', me._isStopPolling_);
            return;
        }

        if (me.isPolling) {
            return;
        }

        me.isPolling = true;

        // $.ajax({
        //     url: this.options.http_url,
        //     type: 'post',
        //     dataType: "json",
        //     data: {
        //         type: 'market,depth,trade',
        //         pair: PAIR
        //     }
        // }).then((rs, state) => {
        //     if (!rs) {
        //         setTimeout(() => {
        //             me.fetch();
        //         }, 1000* 2);
        //         return;
        //     }
        //     let trade = rs.trade;
        //     let depth = rs.depth;
        //     let market = rs.market;

        //     me.handleResponse(trade);
        //     me.handleResponse(depth);
        //     me.handleResponse(market);

        //     setTimeout(() => {
        //         me.fetch();
        //     }, 1000* 2);
        // });
    },
    startPolling: function () {
        let me = this;

        // 防止重复启动
        if (me.isPolling) {
            return;
        }

        clearTimeout(me.pollingTimer);
        me.pollingTimer = setTimeout(() => {
            // 防止重复启动
            if (me.isPolling) {
                return;
            }

            me.fetch();
        }, 0);
    },
    stopPolling: function () {
        this._isStopPolling_ = true;
        this.isPolling = false;
    }
};


export default XSocket;
