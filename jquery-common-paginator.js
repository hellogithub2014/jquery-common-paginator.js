/**
 * pc端通用分页列表组件。
 *
 * 依赖： jquery、jquery-page两个库
 *
 * 列表组件有 jquery-common-paginator.js和jquery-common-paginator.css两个文件。
 * 其中css文件用于简单的设置如下dom结果的一些样式，使用者如果想自定义样式，可以不使用此css文件
 *
 * 页面的分页列表区域的DOM结果应该类似如下：
 * <div id="data-list"></div>
 * <div id="pagenitor-area" class="clearfix">
 *      <div class="fll" id="page-number-area"></div>
 *      <div class="fll" id="page-hinter-area"></div>
 *      <div class="fll" id="page-size-area"></div>
 * </div>
 *
 * 如果不想使用上面4个id，可以利用分页组件实例的setDomSelectors进行自定义。
 *
 * 用法示范：
 * var paginator = new JqueryCommonPaginator();
 * var userParam = {
 *      prcCode: "AS03GETTSKINFLISTCONDITIONS",
 *      path: "lc07SysTask",
 *      usrTyp: "1",
 *      key: "",
 *      startTime: "",
 *      endTime: "",
 *      tskSts: ""
 *  };
 *
 * paginator.setUserParam(userParam).trigger(); // 初始化时需要使用trigger()显式触发搜索
 *
 * setTimeout(function() {
 *      userParam = Object.assign(userParam, { tskSts: "0" });
 *      paginator.setUserParam(userParam); // 之后只要更改参数就会自动进行搜索
 * }, 3000);
 *
 */

var JqueryCommonPaginator = (function() {
    var defaultOptions = {};

    function JqueryCommonPaginator(options) {
        // 作用域安全的构造函数
        if (this instanceof JqueryCommonPaginator) {
            this.options = Object.assign({}, defaultOptions, options);
            this.isTriggered = false;
        } else {
            return new JqueryCommonPaginator(options);
        }
    }

    defaultOptions.userParam = {}; // 用户自定义，用户的个性化搜索参数，Z21框架中的需要有path、prcCode两个属性
    defaultOptions.PAGE_SIZE_LIST = [5, 10, 20]; // 用户自定义，默认的每页条数数据
    defaultOptions.INIT_PAGINATOR_PARAM = { // 初始分页参数
        startIndex: 0,
        pageSize: defaultOptions.PAGE_SIZE_LIST[0]
    };

    // 相关的页面dom选型器。用户可自定义
    defaultOptions.DOM_SELECTORS = {
        LIST_SELECTOR: "#data-list", // 列表渲染区域
        PAGE_NUMBER_SELECTOR: "#page-number-area", // 页码条区域
        PAGE_HINT_SELECTOR: "#page-hinter-area", // 提示用户当前数据范围，总共有多少数据
        PAGE_SIZE_SELECTOR: "#page-size-area", // 每页条数区域
    };

    /**
     * 默认后台接口请求入参生成函数。用户可自定义
     */
    defaultOptions.backendParamGenerator = function(userParam, paginatorParam) {
        var backendInterfaceParam = {};
        var infoBodyData = {};
        // TODO 将prccode、path和正常的数据放在不同的属性中
        if (userParam && userParam.prcCode && typeof userParam.prcCode === "string") {
            var prcCodeSuffix = userParam.prcCode.substring(4); //去掉前4位
            infoBodyData[prcCodeSuffix + "X1"] = [].concat(userParam);
            infoBodyData[prcCodeSuffix + "X2"] = [].concat(paginatorParam);
            backendInterfaceParam = {
                "TARSVR": "",
                "PRCCOD": userParam.prcCode,
                "WEBCOD": "",
                "ISUDAT": "",
                "ISUTIM": "",
                "DALCOD": "",
                "RTNLVL": "",
                "RTNCOD": "",
                "ERRMSG": "",
                "INFBDY": infoBodyData,
            };
        }
        return JSON.stringify(backendInterfaceParam);
    };

    /**
     * 获取后台数据接口
     *
     * 注意：若想自定义此函数，要求是
     * 1. 在成功拿到想要的响应数据后，显式的调用this.getSuccessFunc(response)
     * 2. 失败时，显式的调用this.getFailedFunc(error)
     */
    defaultOptions.fetchData = function(backendInterfaceParam) {
        var _this = this;
        $.ajax({
            type: "POST",
            url: "/" + _this.options.userParam.path + "/rmi.do",
            cache: false,
            data: backendInterfaceParam,
            dataType: "json",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            success: function(response) {
                if (response.ERRMSG === "" || response.ERRMSG === null) {
                    _this.getSuccessFunc().call(_this, response);
                } else {
                    _this.getFailedFunc().call(_this, response.ERRMSG);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                if (errorThrown) {
                    _this.getFailedFunc().call(_this, errorThrown);
                }
            }
        });
    };

    defaultOptions.failedFunc = function(error) { // 用户自定义，错误函数
        console.error("后台请求出错", error, "入参:  ", this.options.userParam, _curPaginatorParam);
        // TODO:寻找jquery-toast库
    };

    defaultOptions.getListFromResponse = function(response) { // 从响应数据中获取列表的函数
        var dataList = [];
        var prcCodeSuffix = this.options.userParam.prcCode.slice(4); //去掉前4位
        dataList = response.INFBDY[prcCodeSuffix + 'Z1'];

        return dataList;
    };

    defaultOptions.getTotalCountFromResponse = function(response) { // 从响应数据中获取列表总条数的函数
        var totalCount = 0;
        var prcCodeSuffix = this.options.userParam.prcCode.slice(4); //去掉前4位
        totalCount = (response.INFBDY[prcCodeSuffix + 'Z2'][0]).totalCount;
        return totalCount;
    };

    /**
     * 此函数用于根据每个列表项数据生成对应的模板html
     * renderOptionFunc是可能影响结果的其他参数，可以根据数据的不同而不同
     */
    defaultOptions.itemRenderFunc = function(itemModel, renderOptionFunc) {
        return "<div style='border:1px solid red;margin:20px 0;'>Hello ,this is the default html generated by itemRenderFunc. Please use the setItemRenderFunc and setItemRenderOptionFunc to customer your  per list item html</div>";
    };

    /**
     * 提供给@itemRenderFunc的参数,用户自定义、提供默认值
     */
    defaultOptions.itemRenderOptionFunc = function(itemModel) {
        return {};
    };

    /**
     * 渲染分页区域，并绑定点击事件
     */
    defaultOptions.renderPaginatorArea = function(dataListLength, totalCount) {
        var _this = this;

        // 利用jquery-page渲染页码条，同时绑定页码点击函数
        $(this.options.DOM_SELECTORS.PAGE_NUMBER_SELECTOR).createPage({
            pageCount: Math.ceil(totalCount / _curPaginatorParam.pageSize), // 总页码
            current: _curPageIndex, // 初始页码
            backFn: function(page) { // 页码条点击事件处理函数
                if (page !== _curPageIndex) { // 只有点击的是不同的页码，才执行后续请求
                    _curPageIndex = page;

                    _curPaginatorParam = Object.assign(_curPaginatorParam, { // 更新当前分页参数
                        startIndex: _curPaginatorParam.pageSize * (page - 1)
                    });

                    _refresh.call(_this);
                }
            },
        });

        // 渲染分页提示区域、每页大小下拉框
        var curStartIndex = _curPaginatorParam.startIndex;
        var paginatorHintHtml = '当前<a>' + (curStartIndex + 1) +
            '-' + (curStartIndex + dataListLength) + '</a>,共<b>' + totalCount + '</b>条信息';
        $(this.options.DOM_SELECTORS.PAGE_HINT_SELECTOR).html(paginatorHintHtml); // 分页提示

        // 渲染每页大小下拉框
        var pageSizeSelectorHtml = '每页显示<select>';
        this.options.PAGE_SIZE_LIST.forEach(function(pageSize) {
            pageSizeSelectorHtml += '<option value="' + pageSize + '">' + pageSize + '</option>';
        });
        pageSizeSelectorHtml += '</select>';

        $(this.options.DOM_SELECTORS.PAGE_SIZE_SELECTOR).html(pageSizeSelectorHtml);
        $(this.options.DOM_SELECTORS.PAGE_SIZE_SELECTOR + '  select').val(_curPaginatorParam.pageSize); // 当前每页的大小

        _bindPageSizeChangeHandler.call(this); // 绑定每页大小变更事件
    };

    /* ------------------------------------------    getter      ------------------------------------------------- */

    JqueryCommonPaginator.prototype.getDefaultOptions = function() { // 获取默认配置对象
        return defaultOptions;
    };

    JqueryCommonPaginator.prototype.getOptions = function() { // 获取用户的配置对象
        return this.options;
    };

    JqueryCommonPaginator.prototype.getSuccessFunc = function() { // 获取成功拿到想要的response后的操作
        return _successFunc;
    };

    JqueryCommonPaginator.prototype.getFailedFunc = function() { // 获取失败处理函数
        return this.getOptions().failedFunc;
    };

    /* ------------------------------------------    setter      ------------------------------------------------- */

    JqueryCommonPaginator.prototype.setUserParam = function(newUserParam) {
        this.options.userParam = newUserParam;

        if (this.isTriggered) { // 如果已经trigger
            _curPaginatorParam.startIndex = 0; // 重置分页参数，并使用当前分页大小
            _curPageIndex = 1; // 重置选中的页码

            _refresh.call(this);
        }
        return this;
    };

    /**
     * 为防止用户初始化后，第一次过早的调用了setUserParam，需要使用此方法来显式触发.
     * 后续调用setUserParam后，就不需要使用此方法了。
     */
    JqueryCommonPaginator.prototype.trigger = function() {
        this.isTriggered = true;
        this.setUserParam(this.options.userParam);
    };


    /**
     * 选项属性设置帮助函数. TODO:测试所有setter
     *
     * @param {any} tagetOptionName  选项的目标属性名称
     * @param {any} newOptionValue 想要设置的新值
     * @param {any} typeToCheck 校验类型字符串 如 Array、Function、Object等
     * @returns this
     */
    function _setterHelper(tagetOptionName, newOptionValue, typeToCheck) {
        if (!newOptionValue || Object.prototype.toString.call(newOptionValue).slice(8, -1) !== typeToCheck) {
            console.error("tagetOptionName 需要是一个" + typeToCheck, "你设置的值是: ", newOptionValue);
            return this;
        }
        var temp = {};
        temp[tagetOptionName] = newOptionValue;
        this.options = Object.assign(this.options, temp);
        return this;
    }
    /**
     * 设置新的分页大小选项。 注意此时需要更新_curPaginatorParam的pageSize属性
     */
    JqueryCommonPaginator.prototype.setPageSizeList = function(newPageSizeList) {
        _curPaginatorParam.pageSize = newPageSizeList[0];

        return _setterHelper.call(this, "PAGE_SIZE_LIST", newPageSizeList, "Array");
    };

    // JqueryCommonPaginator.prototype.setInitPaginatorParam = function(newInitPaginatorParam) {
    //     return _setterHelper.call(this, "INIT_PAGINATOR_PARAM", newInitPaginatorParam, "Object");
    // };

    JqueryCommonPaginator.prototype.setDomSelectors = function(newSelectors) {
        return _setterHelper.call(this, "DOM_SELECTORS", newSelectors, "Object");
    };

    JqueryCommonPaginator.prototype.setBackendParamGenerator = function(newGenerator) {
        return _setterHelper.call(this, "backendParamGenerator", newGenerator, "Function");
    };

    JqueryCommonPaginator.prototype.setFetchDataFunc = function(newFetchDataFunc) {
        return _setterHelper.call(this, "fetchData", newFetchDataFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setFailedFunc = function(newFailedFunc) {
        return _setterHelper.call(this, "failedFunc", newFailedFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setGetListFromResponseFunc = function(newGetListFromResponseFunc) {
        return _setterHelper.call(this, "getListFromResponse", newGetListFromResponseFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setGetTotalCountFromResponseFunc = function(newGetTotalCountFromResponseFunc) {
        return _setterHelper.call(this, "getTotalCountFromResponse", newGetTotalCountFromResponseFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setItemRenderFunc = function(newItemRenderFunc) {
        return _setterHelper.call(this, "itemRenderFunc", newItemRenderFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setItemRenderOptionFunc = function(newItemRenderOptionFunc) {
        return _setterHelper.call(this, "itemRenderOptionFunc", newItemRenderOptionFunc, "Function");
    };

    JqueryCommonPaginator.prototype.setPaginatorAreaRenderFunc = function(newRenderFunc) {
        return _setterHelper.call(this, "renderPaginatorArea", newRenderFunc, "Function");
    };

    /* ------------------------------------------  固定逻辑        ------------------------------------------------- */

    var _curPaginatorParam = { // 当前分页参数
        startIndex: 0,
        pageSize: defaultOptions.PAGE_SIZE_LIST[0], // TODO: 若调用构造函数就更新了PAGE_SIZE_LIST选项，则此处的默认配置是错误的。 改为 this.curPaginatorParam={startIndex:0,pageSize:this.options.PAGE_SIZE_LIST[0]},同时直接在构造函数中调用
    };
    var _curPageIndex = 1; // 当前选中的页码索引，以1为起点


    /**
     * 使用当前的参数刷新列表
     * 
     */
    function _refresh() {
        // 生成真正的后台接口入参
        var backendInterfaceParam = this.options.backendParamGenerator.call(this, this.options.userParam, _curPaginatorParam);
        _this.options.fetchData.call(this, backendInterfaceParam);
    }

    /**
     * 成功拿到想要的response后的操作
     *
     * @param {any} response 响应
     */
    function _successFunc(response) {
        var dataList = this.options.getListFromResponse.call(this, response);
        var totalCount = this.options.getTotalCountFromResponse.call(this, response);

        this.options.renderPaginatorArea.call(this, dataList.length, totalCount); // 渲染分页区域
        _renderList.call(this, dataList); // 渲染列表区域
    };

    /**
     * 生成列表区域的html
     */
    function _renderList(dataList) {
        var _this = this;
        var toatlListHtml = dataList.reduce(function(curListHtml, data) {
            return curListHtml += _this.options.itemRenderFunc.call(_this, data,
                _this.options.itemRenderOptionFunc.bind(_this));
        }, "");

        $(this.options.DOM_SELECTORS.LIST_SELECTOR).html(toatlListHtml);
    }

    /**
     * 绑定每页大小变更事件
     */
    function _bindPageSizeChangeHandler() {
        var _this = this;
        $(this.options.DOM_SELECTORS.PAGE_SIZE_SELECTOR + '  select').change(function(e) {
            _curPaginatorParam = { startIndex: 0, pageSize: parseInt($(this).val()) };
            _curPageIndex = 1; // 重置选中的页码

            _refresh.call(_this); // 刷新
        });
    }

    return JqueryCommonPaginator;
})();