/* eslint-disable */ 
<template>
  <div class="coin">
    <div id="chart_container" class="f-fill" :style="{'height':screenHeight>900?screenHeight+'px':900+'px'}"></div>
    <div class="depthDiv" :style="{'height':screenHeight>900?screenHeight+'px':900+'px'}">
         <div class="theader ft10">
            <div>价格(USD)</div>
            <div>数量({{symbolId.toLocaleUpperCase()}})</div>
        </div>
         <div class="red" >
            <div v-if="depths.bids" class="cell" v-for=" (item, index) in depths.asks" :key="index">
                <div class="asksPercent" :style="{'width':adjustSum(item[1],asksMax) +'px'}" />
                <div style="z-index: 2">{{item[0]}}</div>
                <div style="z-index: 2">{{item[1] }}</div>
            </div>
        </div>
        <div class="mid" id='mid'>
            {{lastPrice?lastPrice:""}}
        </div>
        <div class="green" >
            <div v-if="depths.asks" class="cell" v-for=" (item, index) in depths.bids" :key="index">
                <div class="bidsPercent"  :style="{'width':adjustSum(item[1],bidsMax) +'px'}"  />
                <div>{{item[0]}}</div>
                <div>{{item[1]}}</div>
            </div>

        </div>
    </div>
  </div>
</template>

<script>
import wsProxy from "./api/wsProxy.js"
import config from "@/utils/config";

export default {
    name: "HelloWorld",
    data: function () {
        return {
            screenHeight:window.innerHeight,
            historyDataTop:[],//历史k线数据
            symbolId:this.$route.query.id?this.$route.query.id:"btc",
            symbol:this.$route.query.id?this.$route.query.id+"_usdt":"btc_usdt",
            ohlc: [],
            saved_chart: null,
            chart: null,
            feed: null,
            last_price:1234.2365,
            bars: [],
            depths:{},
            asksMax:null,
            bidsMax:null,
            price:"",
            bidsPrice:"",
            midDivWidth:300,
            marketInfo:null,
            lastPrice:0,
        }
    },
    mounted: function() {
        this.getTicker();
        this.getOhlcv((data)=>{
            this.initTradingView();
        });
    },
    methods: {
        adjustSum(number , max){
            return number/max * this.midDivWidth
        },
        getTicker(){
            let that = this;
            wsProxy.getTicker([this.symbol], (res) => {
                if (res) {
                    let arr =[];
                    let object=res;
                    for (const key in object) {
                        let element ={
                            id:key.split("_")[0],
                            info:object[key]
                        };
                        arr.push(element);
                    }
                        if (arr) {
                        arr.forEach((element) => {
                            if (element.id == that.symbolId.toLowerCase()) {
                                that.marketInfo = element.info;
                            }
                        });
                    }

                    this.getDepth();
                }
            });
        },
        getDepth() {
            wsProxy.getDepth(this.symbol, (res) => {
            if (res) {
                let that = this;
                
                if ( res[this.symbol]) {
                    if (res[that.symbol].asks) {
                        if (res[that.symbol].asks[0]) {
                            that.price = res[that.symbol].asks[4][0];
                            that.bidsPrice = res[that.symbol].asks[0][0];
                        }
                    }
                }
                //取到最大值最小值
                if (res[this.symbol] && res[this.symbol].asks) {
                    let asksMaxnum = 0;
                    let asksMinPrice = parseFloat(res[this.symbol].asks[4][0]);
                    let bidsMaxPrice = parseFloat(res[this.symbol].bids[0][0]);;
                    let bidsMaxnum = 0;
                    for (let i =0; i < res[this.symbol].asks.length; i++) {
                        if (asksMaxnum < parseFloat(res[this.symbol].asks[i][1])) {
                            asksMaxnum = parseFloat(res[this.symbol].asks[i][1]);
                        }
                    }
                    for (let i =0; i < res[this.symbol].bids.length; i++) {
                        if (bidsMaxnum < parseFloat(res[this.symbol].bids[i][1])) {
                            bidsMaxnum = parseFloat(res[this.symbol].bids[i][1]);
                        }
                    }
                    that.asksMax = asksMaxnum;
                    that.bidsMax = bidsMaxnum;
                    that.lastPrice = that.marketInfo.last;
                    if(that.lastPrice < bidsMaxPrice){
                        that.lastPrice = bidsMaxPrice;
                    }
                    if(that.lastPrice > asksMinPrice){
                        that.lastPrice = asksMinPrice;
                    }
                }

                this.depths = res[this.symbol] || {};
            }
        });
        },
        getOhlcv(callback) {
            let _this = this;
            this.axios
                .get(
                    `${config['mimic'].kline_api}/exchange/ohlcv?exchange=okex&symbol=${_this.symbolId}usdt&time_frame=15m&limit=2000`
                )
                .then((response) => {
                    this.ohlc = response.data;
                    _this.$data.bars=[];
                    response.data.forEach((order) => {
                        _this.$data.bars.push({
                            close: Number(order[4]),
                            open: Number(order[1]),
                            high: Number(order[2]),
                            low: Number(order[3]),
                            volume: Number(order[5]),
                            time: Number(order[0])
                        });
                    });
                    this.historyDataTop.push(this.bars[this.bars.length-1].high);
                    if (callback) {
                        callback(response);
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        initTradingView(){
            const this_vue = this;
            this_vue.feed = this_vue.createFeed();
            const TradingView =window.TradingView;
                this_vue.chart = window.tvWidget = new TradingView.widget({
                fullscreen: false,
                autosize: true,
                symbol:this_vue.symbol,
                container_id: "chart_container",
                datafeed: this_vue.feed,
                library_path: "static/custom_scripts/chart_main/",
                locale: "zh",
                timezone: 'Asia/Shanghai', //todo: ustawianie timezone'a po strefie usera
                client_id: 'tradingview.com',
                // user_id: 'public_user_id',
                // debug: true,
                interval: '15',
                // timeframe:'D',//todo: na koncu//设置缩放
                toolbar_bg: "#20334d",
                allow_symbol_change: true,
                time_frames: [
                    {text: "1y", resolution: "1W"},
                    {text: "6m", resolution: "3D"},
                    {text: "3m", resolution: "1D"},
                    {text: "1m", resolution: "1D"},
                    {text: "1w", resolution: "30"},
                    {text: "3d", resolution: "30"},
                    {text: "1d", resolution: "30"},
                    {text: "6h", resolution: "15"},
                    {text: "1h", resolution: "1"}],
                drawings_access: {
                    type: 'black',
                    // tools: [{name: "Regression Trend"}]//todo: moje
                    tools: [{name: "Trend Line", grayed: true}, {name: "Trend Angle", grayed: true}] //todo: bb
                },
                theme:"Dark",//设置背景主题
                disabled_features: [
                    "left_toolbar",
                    "volume_force_overlay",
                    "header_symbol_search",
                    // "header_interval_dialog_button",
                    // "show_interval_dialog_on_key_press",
                    "symbol_search_hot_key",
                    "study_dialog_search_control",
                    "display_market_status",
                    "header_compare",
                    "edit_buttons_in_legend",
                    "symbol_info",
                    "border_around_the_chart",
                    "main_series_scale_menu",
                    // "star_some_intervals_by_default",
                    "datasource_copypaste",
                    "right_bar_stays_on_scroll",
                    "go_to_date",
                    "compare_symbol",
                    "border_around_the_chart",
                    // "timezone_menu",
                    // "header_resolutions",//todo: przetestowac//隐藏时间选择
                    // "control_bar",//todo: przetestowac
                    // "edit_buttons_in_legend",//todo: przetestowac
                    "remove_library_container_border",
                ],
                enabled_features: [
                    "dont_show_boolean_study_arguments",
                    "use_localstorage_for_settings",
                    "remove_library_container_border",
                    "save_chart_properties_to_local_storage",
                    "side_toolbar_in_fullscreen_mode",
                    "hide_last_na_study_output",
                    "constraint_dialogs_movement",//todo: nie do końca jestem pewien
                ],
                studies_overrides: {
                    "volume.volume.color.1": "#fe4761",
                    "volume.volume.color.0": "#3fcfb4",
                    "volume.volume.transparency": 75,
                },
                overrides: {
                    "symbolWatermarkProperties.color": "rgba(0,0,0, 0)",
                    "paneProperties.background": "#20334d",
                    "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
                    "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",
                    "paneProperties.crossHairProperties.color": "#58637a",
                    "paneProperties.crossHairProperties.style": 2,
                    "mainSeriesProperties.style": 1,//设置主题样式
                    "mainSeriesProperties.showCountdown": false,
                    "scalesProperties.showSeriesLastValue": true,
                    "mainSeriesProperties.visible": false,
                    "mainSeriesProperties.showPriceLine": false,
                    "mainSeriesProperties.priceLineWidth": 1,
                    "mainSeriesProperties.lockScale": false,
                    "mainSeriesProperties.minTick": "default",
                    "mainSeriesProperties.extendedHours": false,
                    "volumePaneSize": "small",//supported values: large, medium, small, tiny
                    editorFontsList: ["Lato", "Arial", "Verdana", "Courier New", "Times New Roman"],
                    "paneProperties.topMargin": 5,
                    "paneProperties.bottomMargin": 5,
                    "paneProperties.leftAxisProperties.autoScale": true,
                    "paneProperties.leftAxisProperties.autoScaleDisabled": false,
                    "paneProperties.leftAxisProperties.percentage": false,
                    "paneProperties.leftAxisProperties.percentageDisabled": false,
                    "paneProperties.leftAxisProperties.log": false,
                    "paneProperties.leftAxisProperties.logDisabled": false,
                    "paneProperties.leftAxisProperties.alignLabels": true,

                    "paneProperties.legendProperties.showLegend": true,
                    "paneProperties.legendProperties.showStudyArguments": true,
                    "paneProperties.legendProperties.showStudyTitles": true,
                    "paneProperties.legendProperties.showStudyValues": true,
                    "paneProperties.legendProperties.showSeriesTitle": true,
                    "paneProperties.legendProperties.showSeriesOHLC": true,
                    
                    "scalesProperties.showLeftScale": false,
                    "scalesProperties.showRightScale": true,
                    // "scalesProperties.backgroundColor": "#20334d",
                    "scalesProperties.lineColor": "#46587b",
                    "scalesProperties.textColor": "#8f98ad",
                    "scalesProperties.scaleSeriesOnly": false,
                    "mainSeriesProperties.priceAxisProperties.autoScale": true,
                    "mainSeriesProperties.priceAxisProperties.autoScaleDisabled": false,
                    "mainSeriesProperties.priceAxisProperties.percentage": false,
                    "mainSeriesProperties.priceAxisProperties.percentageDisabled": false,
                    "mainSeriesProperties.priceAxisProperties.log": false,
                    "mainSeriesProperties.priceAxisProperties.logDisabled": false,
                    "mainSeriesProperties.candleStyle.upColor": "#fe4761",
                    "mainSeriesProperties.candleStyle.downColor": "#3fcfb4",
                    "mainSeriesProperties.candleStyle.drawWick": true,
                    "mainSeriesProperties.candleStyle.drawBorder": true,
                    "mainSeriesProperties.candleStyle.borderColor": "#fe4761",//绿色
                    "mainSeriesProperties.candleStyle.borderUpColor": "#fe4761",//绿色
                    "mainSeriesProperties.candleStyle.borderDownColor": "#3fcfb4",//红色
                    "mainSeriesProperties.candleStyle.wickColor": "#737375",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#fe4761",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#3fcfb4",
                    "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false,
                    // "mainSeriesProperties.hollowCandleStyle.upColor": "#3fcfb4",
                    // "mainSeriesProperties.hollowCandleStyle.downColor": "#fe4761",
                    // "mainSeriesProperties.hollowCandleStyle.drawWick": true,
                    // "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
                    // "mainSeriesProperties.hollowCandleStyle.borderColor": "#3fcfb4",
                    // "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#3fcfb4",
                    // "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#fe4761",
                    // "mainSeriesProperties.hollowCandleStyle.wickColor": "#737375",
                    // "mainSeriesProperties.hollowCandleStyle.wickUpColor": "#3fcfb4",
                    // "mainSeriesProperties.hollowCandleStyle.wickDownColor": "#fe4761",
                    "mainSeriesProperties.haStyle.upColor": "#3fcfb4",
                    "mainSeriesProperties.haStyle.downColor": "#fe4761",
                    "mainSeriesProperties.haStyle.drawWick": true,
                    "mainSeriesProperties.haStyle.drawBorder": true,
                    "mainSeriesProperties.haStyle.borderColor": "#3fcfb4",
                    "mainSeriesProperties.haStyle.borderUpColor": "#3fcfb4",
                    "mainSeriesProperties.haStyle.borderDownColor": "#fe4761",
                    "mainSeriesProperties.haStyle.wickColor": "#737375",
                    "mainSeriesProperties.haStyle.wickUpColor": "#3fcfb4",
                    "mainSeriesProperties.haStyle.wickDownColor": "#fe4761",
                    "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,
                    "mainSeriesProperties.barStyle.upColor": "#3fcfb4",
                    "mainSeriesProperties.barStyle.downColor": "#fe4761",
                    "mainSeriesProperties.barStyle.barColorsOnPrevClose": false,
                    "mainSeriesProperties.barStyle.dontDrawOpen": false,
                    "mainSeriesProperties.lineStyle.color": "#0cbef3",
                    "mainSeriesProperties.lineStyle.linestyle": 0,
                    "mainSeriesProperties.lineStyle.linewidth": 1,
                    "mainSeriesProperties.lineStyle.priceSource": "close",
                    "mainSeriesProperties.areaStyle.color1": "#0cbef3",
                    "mainSeriesProperties.areaStyle.color2": "#0098c4",
                    "mainSeriesProperties.areaStyle.linecolor": "#0cbef3",
                    "mainSeriesProperties.areaStyle.linestyle": 0,
                    "mainSeriesProperties.areaStyle.linewidth": 1,
                    "mainSeriesProperties.areaStyle.priceSource": "close",
                    "mainSeriesProperties.areaStyle.transparency": 80
                },
                custom_css_url: 'chart.css'
            });
        
            document.getElementById('chart_container').childNodes[0].setAttribute('style', 'display:block;width:100%;height:100%;');
            this_vue.chart.onChartReady(function () {
                
                // this_vue.chart.chart().removeAllStudies();//移除指标
                // this_vue.chart.chart().getAllStudies();
                //设置指标
                this_vue.chart.chart().createStudy('Moving Average', false, false,[7,'close',0],null, {"Plot.color" : "cyan"});//7天移动平均线
                this_vue.chart.chart().createStudy('Moving Average', false, false,[30,'close',0],null, {"Plot.color" : "orange"});
                this_vue.chart.chart().createStudy('Moving Average', false, false,[90,'close',0],null, {"Plot.color" : "red"});
                this_vue.chart.closePopupsAndDialogs();
                    let fromTime = this_vue.bars[this_vue.bars.length - 200].time / 1000;
                    let toTime = this_vue.bars[this_vue.bars.length - 1].time / 1000;
                    if(toTime>fromTime){
                         //根据时间 设置缩放
                        this_vue.chart.chart().setVisibleRange({from: fromTime, to: 4102329540});
                    }
                });
            
        },
        createFeed: function(){
            let this_vue = this;
            let Datafeed = {};
            
            Datafeed.DataPulseUpdater = function(datafeed, updateFrequency) {
                this._datafeed = datafeed;
                this._subscribers = {};

                this._requestsPending = 0;
                var that = this;

                var update = function() {
                    if (that._requestsPending > 0) {
                        return;
                    }

                    for (var listenerGUID in that._subscribers) {
                        var subscriptionRecord = that._subscribers[listenerGUID];
                        var resolution = subscriptionRecord.resolution;

                        var datesRangeRight = parseInt((new Date().valueOf()) / 1000);

                        //	BEWARE: please note we really need 2 bars, not the only last one
                        //	see the explanation below. `10` is the `large enough` value to work around holidays
                        var datesRangeLeft = datesRangeRight - that.periodLengthSeconds(resolution, 10);

                        that._requestsPending++;

                        (function(_subscriptionRecord) { // eslint-disable-line
                            that._datafeed.getBars(_subscriptionRecord.symbolInfo, resolution, datesRangeLeft, datesRangeRight, function(bars) {
                                    that._requestsPending--;

                                    //	means the subscription was cancelled while waiting for data
                                    if (!that._subscribers.hasOwnProperty(listenerGUID)) {
                                        return;
                                    }

                                    if (bars.length === 0) {
                                        return;
                                    }

                                    var lastBar = bars[bars.length - 1];
                                    if (!isNaN(_subscriptionRecord.lastBarTime) && lastBar.time < _subscriptionRecord.lastBarTime) {
                                        return;
                                    }

                                    var subscribers = _subscriptionRecord.listeners;

                                    //	BEWARE: this one isn't working when first update comes and this update makes a new bar. In this case
                                    //	_subscriptionRecord.lastBarTime = NaN
                                    var isNewBar = !isNaN(_subscriptionRecord.lastBarTime) && lastBar.time > _subscriptionRecord.lastBarTime;

                                    //	Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
                                    //	old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
                                    if (isNewBar) {
                                        if (bars.length < 2) {
                                            throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
                                        }

                                        var previousBar = bars[bars.length - 2];
                                        for (var i = 0; i < subscribers.length; ++i) {
                                            subscribers[i](previousBar);
                                        }
                                    }

                                    _subscriptionRecord.lastBarTime = lastBar.time;

                                    for (var i = 0; i < subscribers.length; ++i) {
                                        subscribers[i](lastBar);
                                    }
                                },

                                //	on error
                                function() {
                                    that._requestsPending--;
                                });
                        })(subscriptionRecord);
                    }
                };

                if (typeof updateFrequency != 'undefined' && updateFrequency > 0) {
                    setInterval(update, updateFrequency);
                }
            };

            Datafeed.DataPulseUpdater.prototype.periodLengthSeconds = function(resolution, requiredPeriodsCount) {
                var daysCount = 0;

                if (resolution === 'D') {
                    daysCount = requiredPeriodsCount;
                } else if (resolution === 'M') {
                    daysCount = 31 * requiredPeriodsCount;
                } else if (resolution === 'W') {
                    daysCount = 7 * requiredPeriodsCount;
                } else {
                    daysCount = requiredPeriodsCount * resolution / (24 * 60);
                }

                return daysCount * 24 * 60 * 60;
            };

            Datafeed.DataPulseUpdater.prototype.subscribeDataListener = function(symbolInfo, resolution, newDataCallback, listenerGUID) {
                this._datafeed._logMessage('Subscribing ' + listenerGUID);
                if (!this._subscribers.hasOwnProperty(listenerGUID)) {
                    this._subscribers[listenerGUID] = {
                        symbolInfo: symbolInfo,
                        resolution: resolution,
                        lastBarTime: NaN,
                        listeners: []
                    };
                }

                this._subscribers[listenerGUID].listeners.push(newDataCallback);
            };

            Datafeed.DataPulseUpdater.prototype.unsubscribeDataListener = function(listenerGUID) {
                this._datafeed._logMessage('Unsubscribing ' + listenerGUID);
                delete this._subscribers[listenerGUID];
            };

            Datafeed.Container = function(updateFrequency){
                this._configuration = {
                    supports_search: false,
                    supports_group_request: false,
                    supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '720', '1D', '3D', '1W', '1M'],
                    supports_marks: true,
                    supports_timescale_marks: true,
                    exchanges: ['myExchange']
                };
                this._barsPulseUpdater = new Datafeed.DataPulseUpdater(this, updateFrequency || 10 * 1000);
                // this._quotesPulseUpdater = new Datafeed.QuotesPulseUpdater(this);

                this._enableLogging = true;
                this._callbacks = {};

                this._initializationFinished = true;
                this._fireEvent('initialized');
                this._fireEvent('configuration_ready');
            };

            Datafeed.Container.prototype._fireEvent = function(event, argument) {
                if (this._callbacks.hasOwnProperty(event)) {
                    var callbacksChain = this._callbacks[event];
                    for (var i = 0; i < callbacksChain.length; ++i) {
                        callbacksChain[i](argument);
                    }

                    this._callbacks[event] = [];
                }
            };

            Datafeed.Container.prototype._logMessage = function(message) {
                if (this._enableLogging) {
                    var now = new Date();
                    console.log("CHART LOGS: "+now.toLocaleTimeString() + '.' + now.getMilliseconds() + '> ' + message);
                }
            };

            Datafeed.Container.prototype.on = function(event, callback) {
                if (!this._callbacks.hasOwnProperty(event)) {
                    this._callbacks[event] = [];
                }

                this._callbacks[event].push(callback);
                return this;
            };

            Datafeed.Container.prototype.onReady = function(callback) {
                let that = this;
                if (this._configuration) {
                    setTimeout(function() {
                        callback(that._configuration);
                    }, 0);
                }
                else {
                    this.on('configuration_ready', function() {
                        callback(that._configuration);
                    });
                }
            };

            Datafeed.Container.prototype.resolveSymbol = function(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
                this._logMessage("GOWNO :: resolve symbol "+ symbolName);
                Promise.resolve().then(() => {
                    function adjustScale() {
                        if (this_vue.bars[this_vue.bars.length-1].last_price > 1000) { 
                            return 100;
                        } else {
                            return 1000000; 
                        }
                    }
    
                    this._logMessage("GOWNO :: onResultReady inject "+symbolName);
                    onSymbolResolvedCallback({
                        "name": this_vue.symbol,
                        "timezone": 'Asia/Shanghai',
                        "pricescale": adjustScale(),
                        "minmov": 1,
                        "minmov2": 0,
                        "ticker": this_vue.symbol,
                        "description": this_vue.symbol,
                        "session": "24x7",
                        "type": "bitcoin",
                        // "exchange-traded": "myExchange",
                        // "exchange-listed": "myExchange",
                        "has_intraday": true,
                        "intraday_multipliers": ['15'], //It is an array containing intraday resolutions (in minutes) the datafeed wants to build by itself. E.g., if the datafeed reported he supports resolutions ["1", "5", "15"], but in fact it has only 1 minute bars for symbol X, it should set intraday_multipliers of X = [1]. This will make Charting Library to build 5 and 15 resolutions by itself.
                        "has_weekly_and_monthly": true,
                        "has_no_volume": false,
                        "regular_session": "24x7"
                    });
                })
            };

            Datafeed.Container.prototype.getBars = function(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback) {
                if (rangeStartDate > 0 && (rangeStartDate + '').length > 10) {
                    throw new Error(['Got a JS time instead of Unix one.', rangeStartDate, rangeEndDate]);
                }
        
                if(this_vue.bars && document.getElementById('chart_container')){
                    onDataCallback(this_vue.bars, { noData: false  });
                }else{
                    onDataCallback([], { noData: true });
                }
                
            };
            
            //获取最新的图表数据
            Datafeed.Container.prototype.subscribeBars = function(symbolInfo, resolution, onRealtimeCallback, listenerGUID, onResetCacheNeededCallback) {
                wsProxy.getKline({
                    symbol: this_vue.symbol,
                    timestamp: "1min",
                },
                (data) => {
                        if ( data[this_vue.symbol] && !data[this_vue.symbol].result) {
                            
                            let bars ={};
                            let res = data[this_vue.symbol];
                            if(res){
                                let newDate = new Date(res[0])
                                res.forEach((order) => {
                                    bars={
                                        close: Number(order[4]), // 收盘价
                                        open: Number(order[1]), // 开盘价
                                        high: Number(order[2]), // 最高价
                                        low: Number(order[3]), // 最低价
                                        volume: Number(order[5]), // 成交量
                                        time: Number(order[0])// 时间
                                    };
                                    this_vue.bars.push(bars);
                                });
                                this_vue.dataTop = bars;
                            
                                this_vue.historyDataTop.push(bars.close);
                                onRealtimeCallback(bars);
                            }
                        }
                });
            };

            Datafeed.Container.prototype.unsubscribeBars = function(listenerGUID) {
                this._barsPulseUpdater.unsubscribeDataListener(listenerGUID);
            };

            return new Datafeed.Container;
        },
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.coin{
    width: 100%;
    height: 100%;
    display: -webkit-flex;
    /* -webkit-box-pack: center; */
    .f-fill{
        width: 100%;
        height: 100%;
        min-width: 1000px;
        min-height: 800px
    }
    .depthDiv{
        position: relative;
        padding: 5px;
        width: 300px;
        min-width: 300px;
        background: #20334d;
        border-left:3px solid black
    }
     .theader {
      display: -webkit-box;
      -webkit-box-pack: justify;
      color: white;
      margin-bottom: 10px;
    }
    .ft10 {
      font-size: 12px;
      color: #616c81;
      margin-bottom: 0px;
    }
    .asksPercent{
       background-color: rgba(72, 9, 26, 0.59);
       height: 30px;
       position: absolute;
       right:0;
       top:0;
       z-index: -1;
    }
    .bidsPercent{
       background-color: rgba(0, 45, 48, 0.59);
       height: 30px;
       position: absolute;
       right:0;
       top:0;
       z-index: -1;
    }
    .red .cell {
      position:relative;
      color: #ffffff;
      display: -webkit-box;
      -webkit-box-pack: justify;
      font-size: 14px;
      background-position: 0 50% ;
      margin-top: 3px;
      margin-bottom: 3px;
      height: 30px;
      line-height: 30px;
      display: -webkit-box;
      -webkit-box-align: center;
      z-index: 0;
      cursor: pointer;
      div:nth-of-type(2) {
           color: #e72057;
      }
    }
     .red,
    .green {
      display: -webkit-box;
      -webkit-box-orient: vertical;
    //   height: 8rem;
    }
    .mid {
      color: #00c091;
      border: 1px solid #1e4097;
      margin: 5px 0px 5px 0px;
      font-size: 14px;
      height: 30px;
      display: -webkit-box;
      -webkit-box-pack: center;
      -webkit-box-align: center;
    }
    .green .cell {
      position:relative;
      color: #00c091;
      display: -webkit-box;
      -webkit-box-pack: justify;
      font-size: 14px;
      margin-top: 3px;
      margin-bottom: 3px;
      height: 30px;
      line-height: 30px;
      z-index: 0;
      cursor: pointer;
      div:nth-of-type(2) {
        color: #ffffff;
      }
    }
}

</style>
