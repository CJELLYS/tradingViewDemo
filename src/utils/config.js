const config = {
    // 开发
    DEV:{
        mimic:{
            appId:"wx5ce679a43c490556",
            http_api: "http://wetest.bitmoon.pro/api", // "http://local.mimic.com/api", //
            kline_api: "http://we.bitmoon.pro/api",
            https_api:"https://wetest.bitmoon.pro/api",
            origin:'http://xcoin.bitmoon.pro/mimic',
            isWX:false,
            openId:"",
            userId:"",
            user_token:"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhlYTBlMjQ0NzRhZTU0M2MzZmVhNWYxMjU0YTAxN2YwYTI5NTI4OGZlNTE2ZmU5YjYwNzY2NzJjYzJhMDNiNGQwZDVkZjFmZmMwOTBiMGU1In0.eyJhdWQiOiIxIiwianRpIjoiOGVhMGUyNDQ3NGFlNTQzYzNmZWE1ZjEyNTRhMDE3ZjBhMjk1Mjg4ZmU1MTZmZTliNjA3NjY3MmNjMmEwM2I0ZDBkNWRmMWZmYzA5MGIwZTUiLCJpYXQiOjE1MzA3NTcyMDUsIm5iZiI6MTUzMDc1NzIwNSwiZXhwIjoxNTYyMjkzMjA1LCJzdWIiOiIxNCIsInNjb3BlcyI6W119.UgSy5sq5gnM3tkThDsa8kxzQxvj7FxMbEniy7A7_u3AhrCo2uiC1cgetRUYOfug-0XJUx59sPRuMCmR3htqR9_5aA1jMcOA5S7MFp8csQmMumdub972mXPeUEcjJhBciXg-dy70_eAzskpXo3_4XEpbMb9xwTIbTF52vDJnKb6xKOJWJN2huEwsb6YwgrCF7xpW75arwAOhugixWobZwuL2tHEI1aEjfpYVWF-ml8uAj1SOahr2XEmTkimiYphsZ6VbZ0yBQRFC6tr_OHle-T3ID-TRgadq7SdWqgjAMHZrbKt_ghDz9UyuwSsAGFiOc_d0pUuYoj2SXw1RuJMdRMI-k2uWbdYvG_VZ-YORBzcuamEcwdB2YomhS4yNoM0QFZQb8W9fGQLwQV_fnmBdkSlezmYQrml3AUmnsCgKGl_htO3sp1wai-uwBjl3hJxCLQkK1lwsqocwBdRpLCZ1fAUZeDkpAni1cSLpq8xmwaSsEzuFy9KuZkOVKEa5he2zXZKk7oRGucKc4ChaTs5P-D2TKGJ9Yi7XQ3pzRmXsTawX6fTxtBaB_JOsWVYUpP4w_LLCbeoGFkxGf6QzJtxtTlaoHFR3Q3LNKBmo0PUidwF6zdw8EDX6RwIARSrOAnZWlGKYceuz2z-EqyphU6-rJKTqI_jD0JE2wzrSEYH2hfEc",
            token_type:"Bearer",
            userInfo: null,
            source_from:"wechat_MIM_h5"
        }
    },
    // 线上
    ONLINE:{
        mimic:{
            appId:"wx5ce679a43c490556",
            http_api: "http://we.bitmoon.pro/api", // "http://local.mimic.com/api", //
            https_api:"https://we.bitmoon.pro/api",
            kline_api: "http://we.bitmoon.pro/api",
            origin:'http://xcoin.bitmoon.pro/mimic',
            isWX:false,
            openId:"",
            userId:"",
            user_token:"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjhlYTBlMjQ0NzRhZTU0M2MzZmVhNWYxMjU0YTAxN2YwYTI5NTI4OGZlNTE2ZmU5YjYwNzY2NzJjYzJhMDNiNGQwZDVkZjFmZmMwOTBiMGU1In0.eyJhdWQiOiIxIiwianRpIjoiOGVhMGUyNDQ3NGFlNTQzYzNmZWE1ZjEyNTRhMDE3ZjBhMjk1Mjg4ZmU1MTZmZTliNjA3NjY3MmNjMmEwM2I0ZDBkNWRmMWZmYzA5MGIwZTUiLCJpYXQiOjE1MzA3NTcyMDUsIm5iZiI6MTUzMDc1NzIwNSwiZXhwIjoxNTYyMjkzMjA1LCJzdWIiOiIxNCIsInNjb3BlcyI6W119.UgSy5sq5gnM3tkThDsa8kxzQxvj7FxMbEniy7A7_u3AhrCo2uiC1cgetRUYOfug-0XJUx59sPRuMCmR3htqR9_5aA1jMcOA5S7MFp8csQmMumdub972mXPeUEcjJhBciXg-dy70_eAzskpXo3_4XEpbMb9xwTIbTF52vDJnKb6xKOJWJN2huEwsb6YwgrCF7xpW75arwAOhugixWobZwuL2tHEI1aEjfpYVWF-ml8uAj1SOahr2XEmTkimiYphsZ6VbZ0yBQRFC6tr_OHle-T3ID-TRgadq7SdWqgjAMHZrbKt_ghDz9UyuwSsAGFiOc_d0pUuYoj2SXw1RuJMdRMI-k2uWbdYvG_VZ-YORBzcuamEcwdB2YomhS4yNoM0QFZQb8W9fGQLwQV_fnmBdkSlezmYQrml3AUmnsCgKGl_htO3sp1wai-uwBjl3hJxCLQkK1lwsqocwBdRpLCZ1fAUZeDkpAni1cSLpq8xmwaSsEzuFy9KuZkOVKEa5he2zXZKk7oRGucKc4ChaTs5P-D2TKGJ9Yi7XQ3pzRmXsTawX6fTxtBaB_JOsWVYUpP4w_LLCbeoGFkxGf6QzJtxtTlaoHFR3Q3LNKBmo0PUidwF6zdw8EDX6RwIARSrOAnZWlGKYceuz2z-EqyphU6-rJKTqI_jD0JE2wzrSEYH2hfEc",
            token_type:"Bearer",
            userInfo: null,
            source_from:"wechat_MIM_h5"
        }
    }

};

// eslint-disable-next-line
let _config = "";

if (process.env.TESTING) {
    _config = config.DEV;
} else {
    _config= process.env.NODE_ENV === 'production'?config.ONLINE:config.DEV;
}

export default _config;
// export default (process.env.NODE_ENV === 'production'?config.ONLINE:config.DEV);

