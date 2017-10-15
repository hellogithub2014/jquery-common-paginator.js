# jquery-common-paginator.js
pc端通用分页列表组件`JqueryCommonPaginator`，一般来说一个带搜索的分页列表页面布局类似如下：

![Image text](https://github.com/hellogithub2014/jquery-common-paginator.js/raw/master/images/paginator-for-present.png)

此组件可以

1. 自动生成列表展示区域
2. 自动处理分页区域页码点击逻辑
3. 自动处理每页条数变换的逻辑
4. 在每次用户的自定义搜索参数变化时自动刷新列表

# 如何使用

## 依赖
1. `jquery`
2. `jquery-common-paginator.css` - 用于生成分页区域的自定义样式，若用户想要自定义样式，可不使用此文件
3. `/dependencies/jquery-page/jquery.page.js` - 用于生成分页区域的页码条，同时提供自动的点击处理。 若用户想自定义此处逻辑，同样可不使用此文件
4. `jquery-common-paginator.js`
	
## 必需关键配置
使用此组件使用了几个关键配置，用户必须提供这些配置。
1. 自定义搜索参数的格式`userParam`

	```
	userParam: {
		asistParam?:any, // 可选的辅助参数,对整个请求格式的辅助类信息,例如请求的url 
		mainParam:any // 必选主要的参数，推荐在其中放置用户搜索条件参数
	}
	```
	
2. 固定的分页参数格式`paginatorParam`,若用`typescript`表示
	```js
	paginatorParam:{
	   startIndex: number, // 分页的索引起点
	   pageSize: number // 每页的大小
	}
	```
	
3. 将`userParam`和`paginatorParam`组合成为真正后台请求入参格式的`backendParamGenerator
`函数

	```js
	backendParamGenerator:(userParam:any, paginatorParam:Object) =>any;
	```
4. 发送后台请求的方法`fetchData`
	
	```
	 /**
	  * 获取后台数据接口
	  *
	  * 注意：若想自定义此函数，要求是
	  * 1. 在成功拿到想要的响应数据后，显式的调用this.getSuccessFunc(response)
	  * 2. 失败时，显式的调用this.getFailedFunc(error)
	  */
	fetchData : (backendInterfaceParam:any)=>void
	```
	
5. 从响应数据中获取列表的函数`getListFromResponse`
			
	```
	getListFromResponse: (response:any)=>any[];
	```

6. 从响应数据中获取总数据条数的函数`getTotalCountFromResponse`
	
	```
	getTotalCountFromResponse: (response:any)=>number
	```
7. 用于根据每个列表项数据生成对应的模板html字符串的函数`itemRenderFunc`
	
	```
	//renderOptionFunc是可能影响结果的其他参数，可以根据数据的不同而不同
	itemRenderFunc：(itemModel:any, renderOptionFunc:(itemModel:any)=>any)=>string;
	```

## 可选配置

以下配置是可选的，如果不提供将会使用默认配置。

1. 每页条数数组 - `PAGE_SIZE_LIST:number[]`
2. 相关的页面dom选型器`DOM_SELECTORS` - 在渲染页面时，会使用这里定义的选择器来渲染列表及分页
	
	页面列表及分页渲染区域DOM结构如下
	
	```html
    <div>
        <div id="data-list"></div>                      <!-- 列表渲染区域 -->
        <div id="pagenitor-area" class="clearfix">      
            <div id="page-number-area"></div>           <!-- 页码条区域 -->
            <div id="page-hinter-area"></div>           <!-- 分页提示区域 -->
            <div id="page-size-area"></div>             <!-- 每页大小选择区域 -->
        </div>
    </div>
	```
	
	对应的选择器解释：
	
	```
	DOM_SELECTORS: {
	   LIST_SELECTOR: string, // 列表渲染区域
	   PAGE_NUMBER_SELECTOR: string, // 页码条区域
	   PAGE_HINT_SELECTOR: string, // 提示用户当前数据范围，总共有多少数据
	   PAGE_SIZE_SELECTOR: string, // 每页条数区域
	}
	```
	
	**注意**： `jquery-common-paginator.css`对此处的选择器有依赖，若更改了此选项，同时需要修改此css文件中的选择器。
	
3. 后台接口失败时的错误处理函数 - `failedFunc`

	```
	failedFunc: (error:any)=>void
	```

4. 辅助`itemRenderFunc`工作的`itemRenderOptionFunc`，例如在渲染每个列表项时除了列表项本身的数据模型外还需要一些其他参数，均可以使用函数生成，`itemRenderFunc`可以调用此函数来获取额外的辅助信息。
	 
	```
	itemRenderOptionFunc:(itemModel:any)=>any;
	```

5. 当请求成功，但列表为空时，渲染空白的列表区域的函数`renderEmptyList`
	
	```
	renderEmptyList: ()=>void;
	```

6. 渲染分页区域的函数 `renderPaginatorArea`

	```js
	/**
	 * dataListLength:当前页的数列表数据长度
	 * totalCount: 后台数据总条数
	 */
	renderPaginatorArea: (dataListLength:number,totalCount:number)=>void;
	```

## 添加配置
以上必需和可选配置均可以使用一一对应的函数来配置，它们是：

```
JqueryCommonPaginator.prototype.setUserParam;
// 设置新的分页大小选项。 注意此时需要更新this.curPaginatorParam的pageSize属性
JqueryCommonPaginator.prototype.setPageSizeList;
JqueryCommonPaginator.prototype.setDomSelectors;
JqueryCommonPaginator.prototype.setBackendParamGenerator;
JqueryCommonPaginator.prototype.setFetchDataFunc;
JqueryCommonPaginator.prototype.setFailedFunc;
JqueryCommonPaginator.prototype.setGetListFromResponseFunc;
JqueryCommonPaginator.prototype.setGetTotalCountFromResponseFunc;
JqueryCommonPaginator.prototype.setItemRenderFunc;
JqueryCommonPaginator.prototype.setItemRenderOptionFunc;
JqueryCommonPaginator.prototype.setRenderEmptyListFunc;
JqueryCommonPaginator.prototype.setPaginatorAreaRenderFunc;
```

具体使用可以参考`jquery-common-paginator.js`的默认配置。在设置时，可能的代码如下：

```
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
  .setRenderEmptyListFunc(mockRenderEmptyList)
  // .setPaginatorAreaRenderFunc();
  .setUserParam(mockUserParam);
```

## 使用
在准备工作做好后，第一次需要使用`trigger()`显式触发第一次搜索：

```
paginator.trigger();
```

之后每次只要调用`setUserParam`来更改自定义的搜索参数时，均会自动刷新列表，例如

```
$("#search-btn").click(function() {
  paginator.setUserParam(mockUserParam);
});
```

# DEMO
请参见`test.html`和`test.js`

