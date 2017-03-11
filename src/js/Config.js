/*
 * Config: th配置
 * */
import $ from './jTool';
import Base from './Base';
import Cache from './Cache';
import Adjust from './Adjust';
const Config = {
	html: function () {
		const html = '<div class="config-area"><span class="config-action"><i class="iconfont icon-31xingdongdian"></i></span><ul class="config-list"></ul></div>';
		return html;
	}
	/*
	 @绑定配置列表事件[隐藏展示列]
	 $.table: table [jTool object]
	 */
	,bindConfigEvent: function(table){
		let Settings = Cache.getSettings(table);
		//打开/关闭设置区域
		const tableWarp = $(table).closest('div.table-wrap');
		const configAction = $('.config-action', tableWarp);
		configAction.unbind('click');
		configAction.bind('click', function(){
			const _configAction = $(this),		//展示事件源
				_configArea = _configAction.closest('.config-area');	//设置区域
			//关闭
			if(_configArea.css('display') === 'block'){
				_configArea.hide();
				return false;
			}
			//打开
			_configArea.show();
			const _tableWarp = _configAction.closest('.table-wrap'),  //当前事件源所在的div
				_table	= $('[grid-manager]', _tableWarp),			//对应的table
				_thList = $('thead th', _table),					//所有的th
				_trList = $('tbody tr', _table);					//tbody下的tr
			let	_td = null;												//与单个th对应的td
			$.each(_thList, function(i, v){
				v = $(v);
				$.each(_trList, function(i2, v2){
					_td = $('td', v2).eq(v.index());
					_td.css('display', v.css('display'));
				});
			});
			//验证当前是否只有一列处于显示状态 并根据结果进行设置是否可以取消显示
			const checkedLi = $('.checked-li', _configArea);
			checkedLi.length == 1 ? checkedLi.addClass('no-click') : checkedLi.removeClass('no-click');
		});
		//设置事件
		$('.config-list li', tableWarp).unbind('click');
		$('.config-list li', tableWarp).bind('click', function(){
			const _only 		= $(this),		//单个的设置项
				_thName 	= _only.attr('th-name'),							//单个设置项的thName
				_checkbox 	= _only.find('input[type="checkbox"]'),			    //事件下的checkbox
				_tableWarp  = _only.closest('.table-wrap'), 					//所在的大容器
				_tableDiv	= $('.table-div', _tableWarp), 						//所在的table-div
				_table	 	= $('[grid-manager]', _tableWarp),				    //所对应的table
				_th			= $('thead[grid-manager-thead] th[th-name="'+_thName +'"]', _table); 	//所对应的th
			let	_checkedList = null;		//当前处于选中状态的展示项
			if(_only.hasClass('no-click')){
				return false;
			}
			_only.closest('.config-list').find('.no-click').removeClass('no-click');
			let isVisible = !_checkbox.prop('checked');

			//设置与当前td同列的td是否可见
			_tableDiv.addClass('config-editing');
			Base.setAreVisible(_th, isVisible, function(){
				_tableDiv.removeClass('config-editing');
			});
			//限制最少显示一列
			_checkedList =  $('.config-area input[type="checkbox"]:checked', _tableWarp);
			if(_checkedList.length == 1){
				_checkedList.parent().addClass('no-click');
			}

			//重置调整宽度事件源
			if(Settings.supportAdjust){
				Adjust.resetAdjust(_table);
			}

			//重置镜像滚动条的宽度
			$('.sa-inner', _tableWarp).width('100%');

			//重置当前可视th的宽度
			const _visibleTh = $('thead th[th-visible="visible"]', _table);
			$.each(_visibleTh, function(i, v){
				// GM自动创建的列使终为50px
				if(v.getAttribute('gm-create') === 'true'){
					v.style.width = '50px';
				}
				else{
					v.style.width = 'auto';
				}
			});

			//当前th文本所占宽度大于设置的宽度
			//需要在上一个each执行完后才可以获取到准确的值
			$.each(_visibleTh, function(i, v){
				let _realWidthForThText = Base.getTextWidth(v),
					_thWidth = $(v).width();
				if(_thWidth < _realWidthForThText){
					$(v).width(_realWidthForThText);
				}else{
					$(v).width(_thWidth);
				}
			});
			Cache.setToLocalStorage(_table);	//缓存信息
		});
	}
};
export default Config;
