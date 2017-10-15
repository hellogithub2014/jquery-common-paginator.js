(function() {
    window.onload = function() {
        var paginator = new JqueryCommonPaginator();

        var mockUserParam = {
            asistParam: {
                prcCode: "AS03GETTSKINFLISTCONDITIONS",
                path: "lc07SysTask",
            },
            mainParam: {
                usrTyp: "1",
                key: "",
                startTime: "",
                endTime: "",
                tskSts: ""
            }
        };

        var mockPageSizeList = [3, 6, 9];
        var repeat = mockPageSizeList[0];

        var mockSingleItem = { a: 1, b: 2 };
        var mockList = [];
        var success = true;
        for (var i = 0; i < repeat; i++) {
            mockList.push(mockSingleItem);
        }


        var mockResponse = {
            "DALCOD": "",
            "ERRMSG": "",
            "ISUDAT": "",
            "ISUTIM": "",
            "PRCCOD": "AS03GETTSKINFLISTCONDITIONS",
            "RTNCOD": "SUC0000",
            "RTNLVL": "",
            "TARSVR": "",
            "WEBCOD": "",
            "INFBDY": { "GETTSKINFLISTCONDITIONSZ1": mockList, "GETTSKINFLISTCONDITIONSZ2": [{ "totalCount": 7 }] }
        };

        var newFetchData = function() {
            if (success) {
                this.getSuccessFunc().call(this, mockResponse);
            } else {
                this.getFailedFunc().call(this, "出错了");
            }
        }

        paginator
            .setPageSizeList(mockPageSizeList)
            .setFetchDataFunc(newFetchData)
            .setUserParam(mockUserParam)
            .trigger(); // 初始化时需要使用trigger()显式搜索

        // setTimeout(function() {
        //     userParam = Object.assign(userParam, { tskSts: "0" });
        //     paginator.setUserParam(userParam); // 之后只要更改参数就会自动进行搜索
        // }, 3000);

    }
})();