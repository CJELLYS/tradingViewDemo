/* eslint-disable */ 
// 重写的 webSocket
import XSocket from '@/utils/webSocket';

let symbolList =[];
const wsUrl =  "wss://okexcomreal.bafang.com:10441/websocket";
const requestType = ["addChannel", "removeChannel"]

// 获取 单一币种 深度

const getTicker = (payload, cb) => {
    let _data = {};
   let subList =  _returnParamters({
    symbol:payload,
    type:0,
   },"ticker");
    const bbsocket = new XSocket({
        url: wsUrl,
        subList: subList,
        callback:function (data) {
            if(Array.isArray(data)){
                data.forEach(element => {
                    payload.map((symbol)=>{
                        if(element.channel.indexOf(symbol)>-1 ){
                            _data[symbol] = element.data;
                        }
                    })
                });
                cb(_data)
            }
           
        }
    });
};

let depth = "";
let  okex_Depth= null;

const getDepth = (symbol, cb) => {
    let _data = {};
    let subList =[];
    let _symbol = symbol;

    if(okex_Depth){
        let subList1 =  _returnParamters({
            symbol:depth,
            step:"10",
            type:1,
        }, "depth");
        console.log("取消Depth",depth)
        okex_Depth.sub(subList1);
        // depth.initiativeClose = true;
        // depth.socket.close();


        let subList2 =  _returnParamters({
            symbol,
            step:"10",
            type:0,
        }, "depth");
       
        setTimeout(() => {
            console.log("新增Depth",symbol)
            depth = symbol;
            okex_Depth.sub(subList2);
        }, 250);
        
    }else{
        
       subList =  _returnParamters({
            symbol,
            step:"10",
            type:0,
        }, "depth");

        depth = symbol;
        console.log("第一次Depth",depth)
        setTimeout(() => {
            okex_Depth = new XSocket({
                url: wsUrl,
                subList: subList,
                callback:function (data) {
                    let _data = {};
                    _data[depth] = data[0].data;
                    cb(_data)
                   
                }
            });
           }, 250);
        
    }
    
   
    //let mss ="[{'event':'addChannel','channel':'ok_sub_spot_bch_btc_ticker'},{'event':'addChannel','channel':'ok_sub_spot_bch_btc_ticker'},{'event':'addChannel','channel':'ok_sub_spot_bch_btc_ticker'}]";
    
   
    
};

let okex_Kline = "";
let kline = "";
// symbol, timestamp, callback_ok, callback_err
  // timestamp : 1min, 3min, 5min, 15min, 30min, 1hour, 2hour, 4hour, 6hour, 12hour, day, 3day, week
const getKline = (params,cb) =>{
    let _symbol =params.symbol;
    let subList =[];
     if(okex_Kline){
        let subList1 =  _returnParamters({
            symbol:kline,
            timestamp:params.timestamp,
            type:1,
        }, "kline");
        okex_Kline.sub(subList1);
        // okex_Kline.initiativeClose = true;
        // okex_Kline.socket.close();

        let subList2 =  _returnParamters({
            symbol:params.symbol,
            timestamp:params.timestamp,
            type:0,
        }, "kline");
        
        setTimeout(() => {
            kline = params.symbol;
            okex_Kline.sub(subList2);
        }, 250);
    }else{
        subList =  _returnParamters({
            symbol:params.symbol,
            timestamp:params.timestamp,
            type:0,
        }, "kline");
        // okex_Kline= new wss("okex");
        // okex_Kline.ws_klines(params.symbol,params.timestamp,false, (data)=>{
        //     _data[params.symbol] = data;
        //     kline="";
        //     kline=params;
        //     cb(_data)
        // },(err)=>{
        //     console.log("err", err);
        // })
        kline = params.symbol;
     
        okex_Kline = new XSocket({
            url: wsUrl,
            subList: subList,
            callback:function (data) {
                let _data = {};
                    _data[kline] = data[0].data;
                cb(_data)
            }
        });
         
    }
    
}

const _returnParamters = (params, type) => {
    let param = [];
    let _symbol = params.symbol;
    let rType =params.type;
    let step =params.step
    let timestamp = params.timestamp;
        switch (type) {
        case "ticker":
            param = [];
           (Array.isArray(_symbol) ? _symbol : [_symbol]).map((sb) => {
                if(sb){
                    let obj = {
                        "id":new Date().getTime()+"_id",
                        event:requestType[rType],
                        channel:`ok_sub_spot_${sb}_ticker`
                    }
                    param.push(obj)
                }
              
            });
            // param.sendParamt.event=this.config.requestType;
            // param.sendParamt.channel=`ok_sub_spot_${_symbol}_ticker`;
            break;
        case "depth":
             (Array.isArray(_symbol) ? _symbol : [_symbol]).map((sb) => {
                if(sb){
                    param.push({
                        "id":new Date().getTime()+"_id",
                        event:requestType[rType],
                        channel:`ok_sub_spot_${_symbol}_depth_${step}`
                    })
                }
            
            });
            
            break;
        case "trade":
            (Array.isArray(_symbol) ? _symbol : [_symbol]).map((sb) => {
                if(sb){
                    param.push({
                        "id":new Date().getTime()+"_id",
                        event:requestType[rType],
                        channel:`ok_sub_spot_${_symbol}_deals`
                    })
                }
            
            });
            break;
            // param.event=this.config.requestType;
            // param.channel=`ok_sub_spot_${_symbol}_deals`; break;
        case "kline":
       
            (Array.isArray(_symbol) ? _symbol : [_symbol]).map((sb) => {
                if(sb){
                    param.push({
                        "id":new Date().getTime()+"_id",
                        event:requestType[rType],
                        channel:`ok_sub_spot_${_symbol}_kline_${timestamp}`
                    })
                }
            
            });
            break;
            // param.event=this.config.requestType;
            // param.channel=`ok_sub_spot_${_symbol}_kline_${this.config.timestamp}`; break;
        default:
            return "";
        }

    return param;
};


export default {
    getTicker:getTicker,
    getDepth:getDepth,
    getKline:getKline
};
