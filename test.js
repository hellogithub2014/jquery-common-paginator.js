(function() {
    window.onload = function() {
        // TODO:使用karma或其他库编写单元测试/e2e测试

        /**
         * 此处的选择器需要与页面的dom结构对应；同时jquery-common-paginator.css也需要针对性修改
         */
        var mockDomSelectors = {
            LIST_SELECTOR: "#data-list", // 列表渲染区域
            PAGE_NUMBER_SELECTOR: "#crm-page-number-area", // 页码条区域
            PAGE_HINT_SELECTOR: "#crm-page-hinter-area", // 提示用户当前数据范围，总共有多少数据
            PAGE_SIZE_SELECTOR: "#crm-page-size-area", // 每页条数区域
        }

        var mockPageSizeList = [4, 6, 9];

        /**   -------------------  当使用不同的前后端交互方式时，一般来说需要设置以下选项   -----------------------------   */

        var mockUserParam = { // 用户自定义参数格式
            asistParam: {
                prcCode: "AS03GETTSKINFLISTCONDITIONS",
                path: "lc07SysTask",
            },
            mainParam: {
                key: "",
            }
        };
        var mockResponse = { // 后台响应格式
            list: new Array(mockPageSizeList[0]).fill({ name: "helllogithub2014" }),
            totalCount: 20
        };

        /**
         * 此处示例是为了说明： 用户无法自定义页码大小改变的处理逻辑。此逻辑已由组件封装好
         */
        $(mockDomSelectors.PAGE_SIZE_SELECTOR + '  select').change(function(e) {
            // would not be processed!!!
            mockResponse.list = new Array(parseInt($(this).val())).fill(1);
        });

        /**
         * 如何使用userParam和paginatorParam生成真正的接口请求体
         * 
         * @param {any} userParam 
         * @param {any} paginatorParam 
         * @returns 
         */
        function mockBackendParamGenerator(userParam, paginatorParam) {
            return {
                url: userParam.asistParam.path,
                keyWord: userParam.mainParam.key,
            };
        }

        /**
         * 如何使用新的后台数据请求方式，例如ajax
         * 
         * 注意：若想自定义此函数，要求是
         * 1. 在成功拿到想要的响应数据后，显式的调用this.getSuccessFunc().call(this, response);
         * 2. 失败时，显式的调用this.getFailedFunc().call(this, error);
         * 
         * @param {any} backendInterfaceParam 后端接口请求参数
         */
        function newFetchData(backendInterfaceParam) {
            var success = true;
            var response = mockResponse;
            var error = "出错了";
            if (success) {
                this.getSuccessFunc().call(this, response);
            } else {
                this.getFailedFunc().call(this, error);
            }
        }

        /**
         * 失败处理函数
         * 
         * @param {any} error 
         */
        function mockFailedFunc(error) {
            alert(error);
        }

        /**
         * 如何从响应体中提取列表数据
         * 
         * @param {any} response 
         * @returns 
         */
        function mockGetListFromResponse(response) {
            return response.list;
        }

        /**
         * 如何从响应中提取数据总条数
         * 
         * @param {any} response 
         * @returns 
         */
        function mockGetTotalCountFromResponseFunc(response) {
            return response.totalCount;
        }

        /**
         * 如何渲染每一条数据
         * 
         * @param {any} itemModel 列表项数据
         * @param {any} renderOptionFunc 渲染选项生成函数
         * @returns 
         */
        function mockItemRenderFunc(itemModel, renderOptionFunc) {
            var renderOption = renderOptionFunc(itemModel);
            return "<div style='border:1px solid green;margin:20px 0;'>this is the mock html, index:" + renderOption.index + "<br/>name: " + renderOption.name + "</div>";
        }

        var index = 1;

        /**
         * 渲染选项生成函数,在渲染列表项时，若还需要其他参数，请使用此函数生成
         * 
         * @param {any} itemModel 
         * @returns 
         */
        function mockItemRenderOptionFunc(itemModel) {
            return {
                index: index++,
                name: itemModel.name
            };
        }

        var paginator = new JqueryCommonPaginator();
        paginator
            .setPageSizeList(mockPageSizeList)
            .setDomSelectors(mockDomSelectors)
            .setBackendParamGenerator(mockBackendParamGenerator)
            .setFailedFunc(mockFailedFunc)
            .setFetchDataFunc(newFetchData)
            .setGetListFromResponseFunc(mockGetListFromResponse)
            .setGetTotalCountFromResponseFunc(mockGetTotalCountFromResponseFunc)
            .setItemRenderFunc(mockItemRenderFunc)
            .setItemRenderOptionFunc(mockItemRenderOptionFunc)
            // .setPaginatorAreaRenderFunc();
            .setUserParam(mockUserParam)
            .trigger(); // 初始化时需要使用trigger()显式进行第一次搜索

        $("#search-btn").click(function() {
            mockUserParam.mainParam.key = $("#searchKeyWord").val();
            paginator.setUserParam(mockUserParam); // 之后每次只要调用setUserParam均会自动搜索
        })

    }
})();