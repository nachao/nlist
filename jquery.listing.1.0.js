/**
 * @name Cloudhawk - Listing
 * @version version 1.0
 * @author Na Chao
 * @fileoverview
 * 
 * Cloudhawk 列表功能
 */
 
 /**
 * This file is a commercial private.
 *
 *     http://www.mycloudhawk.com
 *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Cloudhawk - Listing
 *
 * @constructor
 */
function Listing( opt_options ){

	opt_options = opt_options || {};

	/**
	* @type {object}
	* @private
	*/
	this.param_ = {};
	
	this.param_.table_ = opt_options.table || null;	// 表单元素
	
	this.param_.th_ = opt_options.th || null;			// 表头

	this.param_.td_ = opt_options.td || null;			// 单元格模板
	
	this.param_.style_ = opt_options.style || null;		// 样式

	this.param_.prevBtn_ = opt_options.prevBtn || null;	// 前一页
	
	this.param_.nextBtn_ = opt_options.nextBtn || null;	// 后一页
	
	this.param_.pageNow_ = opt_options.pageNow || null;	// 显示当前页
	
	this.param_.pageTotal_ = opt_options.pageTotal || null;	// 显示总页数
	

	/**
	* @type {number}
	* @private
	*/
	this.param_.begin_ = 0;		// 当前开始页数

	this.param_.pages_ = 10;	// 每页显示的数量
	
	this.param_.filter_ = null;	// 搜索内容
	

	/**
	* @type {boolean}
	* @private
	*/
	this.param_.defaultStyle_ = opt_options.defaultStyle_ || false;		// 是否显示默认样式以及鼠标效果


	/**
	* @type {Array}
	* @private
	*/
	this.param_.record_ = [];		// 记录所有数据


	/**
	* @init
	*/
	this.dataSet_(opt_options, true);
}


/**
*  过滤数据分享数据
*
*  @param {function} filter
*  @param {array<objecy>} datas = 需要过滤的数据，默认为全部数据
*  @return {Array<object>} 返回的数组对象数据
*  @private
*/
Listing.prototype.dataQuery_ = function( filter, datas ) {

	datas = datas || this.param_.record_;
	filter = filter || this.param_.filter_;

	var reply = [];

	if ( filter ) {
		$(datas).each(function( i, data ){

			if ( $.type(filter) == 'function' && !!filter(data) ) {
				reply.push(data);
			}
		});

	} else {
		reply = datas;
	}

	return reply;
}


/**
*  对列表数据排序
*
*  @param {string} key = 指定排序键值
*  @param {string} way = 指定排序方式 默认为从小到大，设置为 true 时为相反
*  @private
*/
Listing.prototype.dataSort_ = function( key, way ) {

	// key = key || 'alias';
	// way = way || false;

	var av, bv;

	this.param_.record_.sort(function( a, b ) {

		if ( $.isFunction(key) ) {
			return key(a, b);

		} else {
			if ( String(a[key]).length && String(b[key]).length ) {
				av = a[key];
				bv = b[key];

				if ( typeof a[key] == 'string' ) {
					av = String(a[key]).toUpperCase();
					bv = String(b[key]).toUpperCase();
				}

				if ( av < bv ) {
					return Boolean(way) ? 1 : -1;
				} else if ( av > bv ) {
					return Boolean(way) ? -1 : 1;
				} else {
					return 0;
				}
			}
		}
	});
}


/**
*  对数据进行分页
*
*  @param {array<objecy>} datas = 指定数据，默认为全部数据
*  @return {Array<object>} 返回的数组对象数据
*  @private
*/
Listing.prototype.dataPage_ = function( datas ) {

	begin = this.param_.begin_ * this.param_.pages_;
	pages = this.param_.pages_;
	datas = datas || this.param_.record_;

	var reply = [];

	$(datas).each(function( key, data ){

		if ( key >= begin && key < begin + pages ) {
			reply.push(data);
		}
	});

	return reply;
}


/**
*  扩展数据单元内(td.event)可修改数值，只给绑定对象数据
*
*  @private
*/
Listing.prototype.dataRevise_ = function ( array ) {
	var that = this;

	$(array).each(function( i, obj ){
		$.extend(obj, {
			set: function ( value ) {
				for ( var key in value ) {
					if ( $.type(obj[key]) != 'undefined' ) {
						obj[key] = value[key];
					}
				}
			},
			that: that
		});
	});
}


/**
*  设置参数
*
*  @param {object}
*  @param {boolean} refresh = 是否刷新界面
*  @private
*/
Listing.prototype.dataSet_ = function( param, refresh ) {

	param = param || {}
	refresh = refresh;

	var that = this;

	for ( var key in param ) {
		if ( key == 'msg' ) {
			continue;
		}
		that.param_[key + '_'] = param[key] || null;
	}

	// 绑定数据操作
	if ( param.record ) {
		this.dataRevise_(this.param_.record_);
	}

	// 是否刷新
	if ( refresh ) {

		if ( param.th ) {
			this.tableEmpty_();
			this.dataInitTh_();
		} else {
			this.tableRemoveTd_();
		}

		this.dataView_();
		this.onpage();
	}
}


/**
*  初始化页面列表数据
*
*  @param {array<objecy>} th = 指定数据
*  @private
*/
Listing.prototype.dataInit_ = function( data, key ) {

	var array = [],
		item = {};

	$(data).each(function( k, val ){
		item = {
			val: '-'
		};

		if ( $.isPlainObject(val) ) {
			item = $.extend({}, val);
		} else {
			item['val'] = val;
		}

		if ( key ) {
			item['key'] = key;
		}

		array.push(item);
	});

	return array;
}


/**
*  初始化页面列表表头
*
*  @private
*/
Listing.prototype.dataInitTh_ = function() {
	if ( this.param_.th_ && this.param_.table_ ) {
		this.tableInner_(this.dataInit_(this.param_.th_, 'th'), this);
	}
}


/**
*  插入一行数据
*
*  @param {array<objecy>} html = 指定html
*  @param {array<objecy>} item = 指定数据
*  @private
*/
Listing.prototype.dataInitTd_ = function( html, item ) {
	if ( html && this.param_.table_ ) {
		this.tableInner_(this.dataInit_(html, 'td'), item);
	}
}


/**
*  将一行的数据导入模板中
*
*  @param {array<objecy>} item = 指定数据
*  @private
*/
Listing.prototype.dataTemplet_ = function( item ) {

	var templet = [],
		temp = null,
		reg = null;

	$(this.param_.td_).each(function( i, value ){

		if ( $.type == 'string' ) {
			temp = { val: value };

		} else  if ( $.isPlainObject(value) ) {
			temp = $.extend({}, value);
		}

		for ( var key in item ) {
			if ( temp.val && temp.val.indexOf( '{{' + key + '}}' ) >= 0 ) {
				reg = new RegExp( '{{' + key + '}}', 'g' );
				temp.val = temp.val.replace( reg, item[key] );
			}
		}

		templet.push(temp);
	})
	
	return templet;
}


/**
*  循环数值指定的内容
*
*  @param {array<objecy>} data
*  @private
*/
Listing.prototype.dataView_ = function( data ) {
	data = data || this.param_.record_;

	var that = this;

	data = this.dataQuery_();
	data = this.dataPage_(data);

	$(data).each(function( key, item ){
		that.dataInitTd_( that.dataTemplet_(item), item );
	});
}


/**
*  列表等待提示
*
*  @param {string} msg = 指定提示信息
*  @private
*/
Listing.prototype.hintLoading_ = function( msg ) {
	
	msg = msg || 'Loading...';

	var len = 1;

	if ( this.param_.th_ ) {
		len = this.param_.th_.length;
	}

	this.tableInner_([
		{ val: msg, attr: { colspan: len }, css: { textAlign: 'center', color: '#aaa' } }
	]);
}


/**
*  列表无数据提示
*
*  @param {string} msg = 指定提示信息，默认：Sorry! Query less than specified data.
*  @private
*/
Listing.prototype.hintNot_ = function( msg ) {
	
	msg = msg || 'Empty.';

	var len = 1;

	if ( this.param_.th_ ) {
		len = this.param_.th_.length;
	}

	this.tableInner_([
		{ val: msg, attr: { colspan: len }, css: { textAlign: 'center', color: '#aaa' } }
	]);
}


/**
*  给指定元素绑定事件
*
*  @param {string} e = 指定绑定的键值
*  @param {object} td = 元素
*  @param {object} control = 参数
*  @return {boolean}
*  @private
*/
Listing.prototype.tableEvent_ = function( e, td, control, data ) {
	var ev = e.replace('on', ''),
		el = td.find(control.key);

	el.unbind(ev).bind(ev, function(){
		control[e]( el, td, data );
	});
}


/**
*  给指定元素绑定属性和事件
*
*  @param {object} td = TD元素
*  @param {object} control = 所有属性以及事件
*  @return {boolean}
*  @private
*/
Listing.prototype.tableBinding_ = function( td, control, data ) {

	var that = this;

	for ( var k in control ) {

		if ( k.indexOf('on') == 0 ) {
			that.tableEvent_( k, td, control, data );
		}

		if ( k == 'init' ) {
			control[k]( td.find(control.key), td, data );
		}

		if ( k == 'css' ) {
			td.find(control.key).css(control[k]);
		}

		if ( k == 'className' ) {
			el.find(control.key).attr( 'class', control[k] );
		}
	}
}


/**
*  设置当前列表元素的样式
*
*  @param {object} el = TR元素
*  @private
*/
Listing.prototype.tableStyle_ = function( el ) {

	var style = {
			th: {
				backgroundColor: '#ccc',
				lineHeight: '33px'
			},
			td: {
				lineHeight: '33px'
			},
			odd: function(i){
				return i % 2 == 0;
			},
			shade: {
				backgroundColor: '#eee',
			},
			hover: {
				backgroundColor: '#ddd',
			}
		},
		defaultStyle = this.param_.defaultStyle_;

	// 绑定自定义的样式
	if ( defaultStyle && $.isPlainObject(defaultStyle) ) {
		for ( var key in defaultStyle ) {
			style[key] = defaultStyle[key];
		}
	}

	if ( !el ) {
		return;
	}

	if ( style.odd(el.index()) ) {
		el.css(style.shade);	 // 默认tr渐变
	}

	if ( el.find('th').length ) {
		el.css(style.th);		// 默认th样式

	} else {
		el.css(style.td);		// 默认td样式
	}

	el.mouseenter(function(){
		var el = $(this),
			bg = el.css('backgroundColor');

		el.attr( 'bg', bg );
		el.find('td').css(style.hover);
	});

	el.mouseleave(function(){ 
		var el = $(this),
			bg = el.attr('bg');

		el.removeAttr('bg')
		el.find('td').css('backgroundColor', ''); 
	});
}


/**
*  页面列表插入新值 HTML，（此函数可以抽出扩建为新功能：列表功能）
*
*  @param {Array.<object || array || string>} newValue = 列表值
*  @param {Array.<object || array || string>} newData = 数据
*  @private
*/
Listing.prototype.tableInner_ = function( newValue, newData ) {

	newData = newData || {};

	var that = this,
		list = this.param_.table_,
		comm = this.param_.style_ || {},
		newTr = null,
		newEl = null;

	if ( !list ) {
		return;
	}

	if ( comm.table ) {
		list.css(comm.table);	// 表样式
	}

	if ( newValue[0].key && newValue[0].key == 'th' ) {		// 如果是表头
		if ( list.find('thead').length == 0 ) {
			list.append('<thead></thead>');
		}
		list = list.find('thead');
	}

	if ( !newValue[0].key || newValue[0].key != 'th' ) {		// 如果是内容
		if ( list.find('tbody').length == 0 ) {
			list.append('<tbody></tbody>');
		}
		list = list.find('tbody');
	}

	list.append('<tr></tr>');

	newTr = list.find('tr:last');

	$(newValue).each(function( i, value ){

		if ( $.type(value) == 'string' ) {
			newTr.append('<td>'+ value +'</td>');
			newEl = newTr.find('td:last');
		}

		if ( $.isPlainObject(value) ) {

			if ( value.key == 'th' ) {
				newTr.append('<th>'+ value.val +'</th>');
				newEl = newTr.find('th:last');

			} else {
				newTr.append('<td>'+ value.val +'</td>');
				newEl = newTr.find('td:last');
			}
		}

		if ( that.param_.defaultStyle_ ) {	// 开启默认样式
			that.tableStyle_( newTr );
		}

		if ( ( !value.key || value.key != 'th' ) && comm.td ) {
			newEl.css(comm.td);			// 自定义td指定样式
		}

		if ( ( value.key || value.key == 'th' ) && comm.th ) {
			newEl.css(comm.th);			// 自定义th指定样式
		}

		if ( value.css ) {
			newEl.css(value.css);		// 自定义td默认样式
		}

		if ( value.attr ) {
			newEl.attr(value.attr);		// 自定义td属性
		}

		for ( var key in value ) {
			if ( newEl.find(key).length > 0 ) {
				value[key]( newEl.find(key), newData );		// 元素事件
			}
			if ( key == 'init' ) {
				value.init( newEl, newData );		// 默认TD事件
			}
		}

		if ( value.control && $.isArray(value.control) ) {	// 多个控件
			$(value.control).each(function( i, control ){
				that.tableBinding_( newEl, control, newData );
			});
		}

		if ( value.control && $.isPlainObject(value.control) ) {	// 单个控件
			that.tableBinding_( newEl, value.control, newData );
		}
	});

}


/**
*  获取当前分页信息
*
*  @return {object} 分页的相关参数
*  @private
*/
Listing.prototype.pageGet_ = function() {

	var info = this.dataQuery_();

	var total = info.length,
		number = this.param_.pages_,
		pages = Math.ceil(total / number),
		current = this.param_.begin_;

	return {
		'total': total,		// 总内容条数
		'pages': pages,		// 总页数
		'number': number,	// 每页显示数量
		'current': current + 1	// 当前页数
	}
}


/**
*  将分页信息输出至页面
*
*  @param {object} 分页的相关参数
*  @private
*/
Listing.prototype.pageDisplay_ = function( info ) {

	var that = this;

	if ( this.param_.pageNow_ ) {
		this.param_.pageNow_.html( info.current );
	}

	if ( this.param_.pageTotal_ ) {
		this.param_.pageTotal_.html( info.pages );
	}

	// 分页按钮 - 下一页
	if ( this.param_.nextBtn_ ) {

		if ( info.current >= info.pages ) {
			this.param_.nextBtn_.addClass('disabledButton').attr('disabled', true);
		} else {
			this.param_.nextBtn_.removeClass('disabledButton').attr('disabled', false);
		}

		this.param_.nextBtn_.unbind('click').click(function(){
			if ( that.param_.begin_ + 1 < that.pageGet_().pages ) {
				that.dataSet_({ begin: that.param_.begin_ + 1 }, true);
			}
		});
	}

	// 分页按钮 - 下一页
	if ( this.param_.prevBtn_ ) {

		if ( info.current <= 1 ) {
			this.param_.prevBtn_.addClass('disabledButton').attr('disabled', true);
		} else {
			this.param_.prevBtn_.removeClass('disabledButton').attr('disabled', false);
		}

		this.param_.prevBtn_.unbind('click').click(function(){
			if ( that.param_.begin_ - 1 >= 0 ) {
				that.dataSet_({ begin: that.param_.begin_ - 1 }, true);
			}
		});
	}
	
	return info;
}


/**
*  清楚页面列表样式
*
*  @private
*/
Listing.prototype.tableEmpty_ = function() {

	if ( this.param_.table_ ) {
		this.param_.table_.empty();
	}
}


/**
*  清楚页面列表内容(td)
*
*  @private
*/
Listing.prototype.tableRemoveTd_ = function() {

	if ( this.param_.table_ ) {
		this.param_.table_.find('tr:gt(0)').remove();
	}
}


/**
*  循环数值指定的内容
*
*  @public
*/
Listing.prototype.empty = function() {
	this.tableRemoveTd_();
}


/**
*  显示等待提示
*
*  @public
*/
Listing.prototype.loading = function() {
	this.tableRemoveTd_();
	this.hintLoading_();
}


/**
*  显示等待提示
*
*  @public
*/
Listing.prototype.nothing = function(msg) {
	this.tableRemoveTd_();
	this.hintNot_(msg);
}


/**
*  对数据进行排序，并从新生成
*
*  @param {string} key
*  @public
*/
Listing.prototype.sort = function( key, way ) {

	if ( key ) {
		this.dataSort_( key, way );
	}

	this.empty();
	this.view();
}


/**
*  开启分页功能
*
*  @public
*/
Listing.prototype.onpage = function() {

	var info = null;

	if ( this.param_.record_.length ) {
		info = this.pageGet_()
		this.pageDisplay_(info);
	}
}


/**
*  单独设置多有参数，可修改 param_ 内的所有参数
*
*  @param {object}
*  @param {boolean} refresh = 是否刷新界面
*  @public
*/
Listing.prototype.set = function( param, refresh ) {
	this.dataSet_( param, refresh );
}


/**
*  循环数值指定的内容
*
*  @param {array<objecy>} data
*  @public
*/
Listing.prototype.view = function( data ) {

	data = data || this.param_.record_;

	this.dataSet_({
		msg: '输出数据',
		record: data
	}, true);
}


/**
*  过滤数据
*
*  @param {function} data
*  @public
*/
Listing.prototype.filter = function( way ) {

	if ( way ) {
		this.dataSet_({
			msg: '排序数据',
			filter: way,
			begin: 0
		}, true);
	}
}