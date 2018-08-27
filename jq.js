/**
 * 设置当前激活的tab页顺序
 *
 * @param { selector } 指的是当前的选择器
 * @param { parent } 指的是当前选择器在哪些父元素内,一般不需要填写，是为了递归用的，不填代表是document
 * $(''#app li) 指的就是在id为app的元素内部所有的li集合，返回是数组
 */
var $ = function(selector){
    return new $.prototype.init(selector)
}
$.prototype={
    length:0,
    constructor: $,
    init:function(selector,parent){
        //不存在selector
        if(!selector){
            return this;
        }
        //是对象时候相当于触发domLoad
        if(this.isFunction(selector)){
            this.ready(selector)
            return;
        }
        //原生元素处理
        if( selector.nodeType ){
            this[ 0 ] = selector;
			this.length = 1;
			return this;
        }
        var parentNodes = parent || [document];
        var ele = selector.split(" ")
        
        var _ele = ele[0]
        var nodes=[]
        //这里在jq内部是sizzle，我们为了方便理解，后续会用document.querySelectorAll来实现
        for (var i in parentNodes){
            switch(_ele.charAt(0)){
                case "#":
                    name = ele[0].replace(/^#/,"");
                    nodes.push(parentNodes[i].getElementById(name))
                    break;
                case '.':
                    name = ele[0].replace(/^\./,"");
                    var Iterator = document.createNodeIterator(parentNodes[i],NodeFilter.SHOW_ELEMENT,
                        function(node){
                            return new RegExp("^"+name+"$").test(node.className)?NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                        },false);
                    var currentNode;
                    while(currentNode = Iterator.nextNode()){
                        nodes.push(currentNode);
                    }
                    break;
                default:
                    var Iterator = document.createNodeIterator(parentNodes[i],NodeFilter.SHOW_ELEMENT,
                    function(node){
                        return node.tagName.toLocaleLowerCase()===_ele?NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    },false);
                    var currentNode;
                    while(currentNode = Iterator.nextNode()){
                        nodes.push(currentNode);
                    }
                    break;
            }
        }
        if(ele.length<=1){
            for(var i in nodes){
                this[i] = nodes[i]
            }
            this.length = nodes.length || 0;
            return this;
        }else{
            /**
             * 找到第一层父元素，
             * ele.splice(0,1) 剔除第一层筛选过的选择器，因为第一层父元素已经找到，
             * 接着递归调用，直到最后一个选择器内容
            */
            ele.splice(0,1)
            var _newEle = ele.join(" ")
            return this.init(_newEle,nodes)//在当前父元素下递归寻找下一层元素
        }   
    },
    /*判断是否为对象 */
    isObject:function (value){
        return Object.prototype.toString.call(value)==='[object Object]'; 
    },
    /*判断是否为数组 */
    isArray:function (value){
        return Object.prototype.toString.call(value)==='[object Array]'; 
    },
    isFunction(value){
        return Object.prototype.toString.call(value)==='[object Function]';
    },
    /**
     * 最核心的方法，可以在原型上扩展其他方法，jq的·插件就是靠他扩展的
     * @param {*} obj1 
     * @param {*} obj2 
     * 两个参数则是将后一个对象合并到前一个
     * 一个参数代表将对象拷贝到$的原型或者实例上
     */
    extend(obj1,obj2){
        var target;
        var clone;
        var copy;
        var src;
        target = obj2 ? obj1 : this;
        if(!obj2){
            obj2 = obj1;
        }
        for(var name in obj2){
            copy = obj2[name]
            src = target[name]
            if(typeof copy === 'object'){//如果需要复制的属性是对象类型
                if(this.isObject(copy)){
                    clone = src && isObject(src) ? src : {}
                }else if(this.isArray(copy)){//当属性为数组的时候
                    clone = src && this.isArray(src) ? src : []
                }
                target[name] = this.extend(clone,copy)
            }else{
                if(copy){
                    target[name] = copy
                }
            }
        }
        return target;
    },   
    /**
     * 循环jq的元素，callback实现循环中需要的操作
     */
    each:function (callback){
        for (var i = 0;i<this.length;i++){
            callback(this[i])
        }
    },
    /**
     * 3种情况
     * 1.css('width','200px')                     设置一个
     * 2.css({'width':'200px','height':'300px'})  设置一群
     * 3.css('width')                             获取
     */
    css:function(key,value){
        return $.access(this, key, value, function(elem,key,value){
            //value存在就设置属性，不存在就获取属性
            return value ? $.setStyle(elem,key,value) : $.getStyle(elem,key)
        })
    },
    /**
     * 3种情况
     * 1.attr('data-id','name')                      设置一个
     * 2.attr({'data-key':'0000','data-id':'name'})  设置一群
     * 3.attr('data-id')                               获取
     */
    attr(key,value){
        return $.access(this, key, value, function(elem,key,value) {
            return value ? $.setAttr(elem,key,value) : $.getAttr(elem,key)
        })
    },
    /**
     *设置元素的width，没有参数且选择器选择元素唯一时候返回元素的width
     */
    width:function(params){
        if(params){
            this.each(function(item){
                item.style['width'] = params + 'px'
            })
        }else if(!params && this.length===1){
            return this.getStyle(this[0],'width')
        }
    },
    /**
     * 入栈操作，栈的最上方的最先出来,返回一个新的jq对象，保存前一个
     * $('#app').pushStack(document.querySelector('li')).css({background:'red'})
     * 那么此时只是li颜色变化
     * 使用end()方法，回到前一个jq对象
     */
    pushStack: function( elems ) {
		var ret = $.merge( this.constructor(), elems );
		ret.prevObject = this;
		return ret;
    },
    /**
     * 返回前一个jq对象，现在栈的底下一个栈
     */
    end: function() {
        if(this.prevObject){
            return this.prevObject
        }else{
            return this;
        }
    },
    /**
     * 循环jq对象自身，对每个匹配到的元素做操作
     */
    map: function( callback ) {
		return this.pushStack( $.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
    },
    ready: function(event){
        var domReady = new Defferd()
        domReady.push(event)
        document.addEventListener('DOMContentLoaded', function() {
            domReady.done()
        })
    }

}
$.prototype.init.prototype = $.prototype;
$.extend = $.prototype.extend;
/**
 * 解析html
 */
$.extend({
    parseHTML:function(ele){
        //匹配<li>111</li><li>222</li>
        var regx = /<(\w+)>(\w+)<\/\w+>/g;
        var obj={}
        var i=0;
        while(true){
            var item = regx.exec(ele)
            console.log(item)
            if(!item){
                break
            }else{
                obj[i] = document.createElement(item[1])
                obj[i].innerHTML = item[2]
                i++;
            }
        }
        return obj;
    }
})
$.extend({
    grep: function( elems, callback, inv ) {
        var ret = [], retVal;
        inv = !!inv;//转成真正的布尔类型,对否反选的操作
        for ( var i = 0, length = elems.length; i < length; i++ ) {
            // 这里callback的参数列表为：value, index，与each的习惯一致
            retVal = !!callback( elems[ i ], i );
            // 是否反向选择
            if ( inv !== retVal ) {
                ret.push( elems[ i ] );
            }
        }
        return ret;
    },
})
/**
 * jq真正的遍历方法，上面的each是我写的比较简单
 * 可以将每个回调函数的this指向遍历的元素本身，于是可以在回调内部使用this
 */
$.extend({
    jqEach: function( object, callback) {
        var name;
        for ( name in object ) {
            //将this的指向指为每个遍历的元素对象
            //所以在遍历dom元素时候，内部可以使用$(this)来生成相应的jq对象
            if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                break;
            }
        }
    },
})
/**
 * map方法，返回的是对数组的每一项做处理，‘
 * 返回一个新的数组为处理后的数组
 * jq内部可以处理对象，这里做了简化不能处理对象，只是处理数组
 */
$.extend({
    map: function( arr, callback) {
        var i = 0;
        var ret = [];
        var length = arr.length;
        for ( ; i < length; i++ ) {
            // 执行callback，参数依次为value, index, arg
            value = callback( arr[ i ], i);
            // 如果返回null，则忽略（无返回值的function会返回undefined）
            if ( value != null ) {
                ret[ ret.length ] = value;
            }
        }
        return ret;
    }
})
$.extend({
    merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},
})

$.extend({
    access: function( elems, key,value ,fn) {
        //console.log(key)
        var i = 0;
        var length = elems.length;
        /**
         * key是对象
         * {
         *   width:200px;
         *   background:'red'
         * }
         */
		if($.prototype.isObject(key)){
            for (var k in key){
                console.log(k,key[k])
                $.access(elems,k,key[k],fn)
            }
            return elems;
        }
        /**
         * key ,value都存在，给每个元素执行方法，比如css每个元素绑定样式
         */
        if(value){
            for(;i<length;i++){
                fn(elems[i],key,value)
            }
            return elems
        }
        /**
         * value不存在就是获取，比如获取样式
         */
        return length > 0?fn(elems[0],key) : undefined;
	},
})
$.extend({
    //获取样式
    getStyle:function (element, property){
        var proValue = null;
        if (!document.defaultView) {
            proValue = element.currentStyle[property];
        } else {
            proValue = document.defaultView.getComputedStyle(element)[property];
        }
        return proValue;
    },
    //设置样式
    setStyle: function (ele,key,value) {
        ele.style[key] = value;
    },
    //获取自定义属性
    getAttr: function (element, property) {
        return element.getAttribute(property); //获取
    },
    //设置自定义属性
    setAttr: function (ele,key,value) {
        ele.setAttribute(key,value)
    }
    
})
/**
 * 延迟对象
 * push是在对象放入方法
 * done是执行该对象队列中所有的方法
 */
// function Defferd(){
//     this.events = []
//     this.push = function(event){
//         this.events.push(event)
//     }
//     this.done = function(){
//         for(var i = 0; i < this.events.length; i++){
//             this.events[i]()
//         }
//     }
// }

/**
 * 回调对象实现 -- 在很多时候需要控制一系列的函数顺序执行。那么一般就需要一个队列函数来处理这个问题
 * list保存回调函数
 * fire执行回调函数
 * 与正真的jq callback差距很大，包括可以停止，可以清除等等
 */
$.extend({
    Callback: function (option) {
        option = option || {}
        var list = []
        var self = {
            add: function ( fn ) {
                if( Object.prototype.toString.call( fn )==='[object Function]' ){
                    /*
                        不存在unique，直接push
                        存在unique，看后面是否成立
                    */
                    if( !option.unique || !list.includes(fn)){
                        list.push( fn )
                    }
                    
                }
                console.log(this)
                return this;
            },
            fire: function ( args ){
                list.forEach( function ( fn ) {
                    fn( args )
                } )
            }
        }
        return self;
    }
})

/**
 * 延迟对象
 * var d = $.Defferd()
 * d.done(function(e){}).fail(function(e){})
 * d.resolve('haha')
 * 
 */
$.extend({
    Defferd: function () {
        var tuples = [
            ['resolve','done',Callback()],
            ['reject','fail',Callback()]
        ]
        var defferd = {}
        tuples.forEach( function ( tuple ) {
            var list = tuple[2]
            defferd[tuple[1]] = list.add
            defferd[tuple[0]] = list.fire
        } )
        return defferd;
    }
})

$.extend({
    error: function ( msg ) {
       throw new Error( msg )
    }
})

/**
 * 数据缓存
 */
function  Data(){
    this.cache = {}//存储数据的地方
    this.expando = 'JQuery'+ Math.random()
}

Data.uid = 1;
//获取元素对应的key，key是元素跟this.cache的映射
Data.prototype.key = function( owner ){
    var unlock = owner[ this.expando ]
    if( !unlock ){//key不存在则给元素加自定义属性'JQuery'+ Math.random() = ‘key’
        unlock = Data.uid++
        owner[ this.expando ] = unlock;
    }
    if( !this.cache[ unlock ] ){//在cache中的key不存在则分配一个空对象
        this.cache[ unlock ] = {}
    }
    return unlock;//返回对应的key
}
/**
 * 
 * @param {HTMLEle} owner html元素
 * @param {string} key    存储的key
 * @param {string} value  存储的value
 */
Data.prototype.set = function( owner,key,value ){
    var unlock = this.key( owner )
    var cache = this.cache[ unlock ]
    if( typeof key === 'string'){
        cache[ key ] = value
    }
}
/**
 * 
 * @param {HTMLEle} owner html元素
 * @param {string} key 获取的key，可以不存在则返回该元素所有缓存
 */
Data.prototype.get = function( owner,key ){
    var unlock = this.key( owner )
    var cache = this.cache[ unlock ]
    if( key ){
        return cache[ key ]
    }
    return cache;
}
/**
 * 
 * @param {HTMLEle} owner html元素
 * @param {string} key    设置或者获取的key，跟value一同不存在则返回该元素所有缓存
 * @param {string} value  设置的value，不存早则就是内部调用get，存在内部调用set
 */
Data.prototype.access = function( owner,key,value ){
    if( value ){
        return this.set( owner, key, value )
    }
    return this.get( owner, key )
}
var data_user = new Data()
//给JQ添加该工具方法
$.extend({
    data: data_user.access.bind( data_user )
})
$.extend({
    error: function ( msg ) {
       throw new Error( msg )
    }
})
