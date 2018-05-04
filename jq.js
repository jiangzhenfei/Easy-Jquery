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
    init:function(selector,parent){
        var parentNodes = parent || [document];
        var ele = selector.split(" ")
        
        var _ele = ele[0]
        var nodes=[]
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
    /**
     * 
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
     * 获取元素的属性
     */
    getStyle:function (element, property){
        var proValue = null;
        if (!document.defaultView) {
            proValue = element.currentStyle[property];
        } else {
            proValue = document.defaultView.getComputedStyle(element)[property];
        }
        return proValue;
    },
    /**
     * json={
     *    color:'red'
     * }
     */
    css:function(json){
        for(var i in json){
            this.each(function(item){
                item.style[i] = json[i]
            })
        }
        return this;
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

