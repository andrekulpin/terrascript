(function(that, Connector){
	
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var hasProp = Object.prototype.hasOwnProperty;
	var	$ = {object : '[object Object]', array : '[object Array]', string : '[object String]', 
			 number : '[object Number]', db    : 'DBDataset'};

	if(Object.create !== 'function'){
		Object.create = function(o){
			function F(){}
			F.prototype = o;
			var o = new F();
			F.prototype = null;
			return o;
		}
	}

	function Create(o, type){
		switch(type){
			case $.object:
				function F(o){
					for(var i in o){
						hasProp(o, i) && (this[i] = o[i]);
					}
				}	
				F.prototype = new ObjectUtils();
				var o = new F();
				F.prototype = null;
				return o;
			break;
			case $.array:
				function F(){
					this.array = o;
				}
				F.prototype = new ArrayUtils();
				var o = new F();
				F.prototype = null;
				return o;
			break;
		}	
	}

	function ArrayUtils(){

		this.first = function(){
			return slice.call(this, 0, 1);
		}

		this.last = function(){
			return slice.call(this, this.length - 1, this.length);
		}

		this.unique = function(){
			var seen = {};
			for(var i in this){
				!seen[this[i]] && (seen[this[i]] = true);
			}
			return new ObjectUtils.keys.call(seen);
		}

	}

	function ObjectUtils(){

		this.size = function(){
			var c = 0;
			for(var i in this){
				hasProp.call(this, i) && ++c;
			}
			return c;
		}

		this.keys = function(){
			var keys = [];
			for(var i in this){
				hasProp.call(this, i) && keys.push(i);
			}
			return keys;
		}

		this.values = function(){
			var values = [];
			for(var i in this){
				hasProp.call(this, i) && values.push(this[i]);
			}
			return values;
		}

		this.hasKey = function(key){
			for(var i in this){
				if(hasProp.call(this, i) && key === i){
					return true;
				}
			}
			return false
		}

		this.hasValue = function(value){
			for(var i in this){
				if(hasProp.call(this, i) && value === this[i]){
					return true;
				}
			}
			return false;
		}

		this.empty = function(){
			for(var i in this){
				if(hasProp.call(this, i)){
					return true;
				}
			}
			return false;
		}

		this.toArray = function(){
			var arr = [];
			for(var i in this){
				hasProp.call(this, i) && arr.push(this[i]);
			}	
		}

		this.map = function(cb){
			if(cb && typeof cb !== 'function'){
				throw TypeError();
			}
			for(var i in this){
				var value = cb(this[i], i)
				typeof value !== 'undefined' && (this[i] = value);
			}
		}
	}






			 	
	function Promise(error, data){
		this.error = function(cb){
			if(error){
				if(!cb){
					System.MessageDialog(error, mdtWarning, mdbOK, 0);
				} else {
					cb(error);	
				}
				return this;									
			} else {
				return this;	
			}			
		}
		this.then = function(cb){
			if(error){
				return this;
			} else {
				cb && cb(data);
				return this;
			}			
		}
	}



	function Main(){

		var obj = slice.call(arguments)[0]

		Create(obj, typeof obj);

	}


	function $$(){

		var SessionID, Version;
		Connector && (SessionID = Connector.SessionID, Version = Connector.Version);

		Binder.call(this);


		this.getSessionID = function(){
			return SessionID;
		}

		this.getVersion = function(){
			return Version;
		}

	}

	if(typeof Connector !== 'undefined' && Connector !== null){
		var IsAdmin = Connector.CurrentUser.IsAdmin;
		var CurrentUser = Connector.CurrentUser.ContactID;
	}

	$$.prototype.user = {

		getID : function(){
			return CurrentUser;
		},

		isAdmin : function(){
			return IsAdmin;
		}
	}
	

	$$.prototype.sp = function(){
		
		this.exec = function(name){
			var args = slice.call(arguments);
			if(args[1] && toString.call(args[1]) === $.object){
				var params = System.CreateObject('TSObjectLibrary.Parameters');
				var sql = 'EXEC ' + name;
				var p = args[1];
				var keys = _.keys(p);
				for(var i in keys){
					var item = p[keys[i]];
					var out = item.output;
					if(out){
						var output = output || [];
						output.push(this.add(params, keys[i], item.type, item.value, true));	
					} else {
						this.add(params, keys[i], item.type, item.value, false);	
					}						
					sql += ' @' + keys[i] + ' = :' + keys[i] + (out ? ' output' : '') + ',';	
				}
				try{
					Connector.DBEngine.ExecuteCustomSQL(sql.slice(0, sql.length - 1), params);
				} catch(e) {
					return new Promise(e.message);
				}
					return new Promise(null, output);							
			}		
		}
			
		this.add = typeof AddParameterEx === 'function' ? AddParameterEx : null
						
	}

		
	var $$ = {

		hasKey : function(o, key){
			if(o && toString.call(o) === $.object){
				return key in o;
			}
		},
		
		inObject : function(o, val){
			if(o && toString.call(o) === $.object){
				for(var i in o){
					if(o[i] === val){
						return true;
					}
				}
				return false;		
			}			
		},
		
		inArray : function(a, val){
			if(a && toString.call(a) === $.array){
				var l = a.length, i = 0;
				for(;i < l;){
					if(a[i++] === val){
						return true;
					}
				}	
			}	
		},
		
		size : function(o){
			if(typeof o.length !== 'undefined'){return o.length}
			var c = 0;
			for(var i in o){
				o.hasOwnProperty(i) && (function(c){c++}(c));
			}
			return c;
		},
		
		empty : function(o){
			if(!o){return void 0}
			for(var i in o){
				if(o.hasOwnProperty(i)){
					return false;
				}	
			}
			return true;
		},
		
		values : function(o){
			if(!o && this.toString.call(o) === $.object){
				var a = [];
				for(var i in o){
					o.hasOwnProperty(i) && push(o[i]);	
				}
				return a;
			}
		},
		
		keys : function(o){
			if(!o || typeof o !== 'object') {return []};
			var k = [];
			if(toString.call(o) === $.array) {
				var l = o.length;
				while(l){
					k.push(--l);	
				}
				return k.reverse();
			}		
			for(var i in o){
				o.hasOwnProperty(i) && k.push(i);	
			}
			return k;
		},
		
		last : function(a){
			if(!a && toString.call(a) === $.array){
				return a[a.length - 1];	
			}
		},
		
		unique : function(a){
			if(!a && toString.call(a) === $.array){
				var k = [], l = a.length, i = 0;
				for(;i < l;){
					var v = a[i++];
					!this.inArray(k, v) && k.push(v);	
				}
				return k;
			}	
		},
		
		db : {
		
			refresh : function(d){
				if(toString.call(d) === $[object] && d.ServiceTypeCode === $[db]){
					d.Close();
					d.Open();
				}			
			},
			
			filter : function(d){
				if(toString.call(d) === $.object && d.ServiceTypeCode === $[db]){
					d.Close();
					var args = slice.call(arguments, 1);
									
				}	
			}
		},
		                                      
		object : function(){
			var args = slice.call(arguments);
			if(!args.length){
				return {};	
			}
			var o = {};
			if(toString.call(args[0]) === $.array){
				var keys = args[0], l = keys.length;
				while(l){
					o[ keys[--l] ] = args[1] ? args[1][l] : null;
				}
				return o;
			}  	
		},
		
		fn : {
		
			exec : function(name){
				var args = slice.call(arguments, 1),
					params = System.CreateObject('TSObjectLibrary.Parameters');
			//		sql = 'select :' + r + ' = ' + name + '(:';
				for(;;){
				    var l = args.length,
						item = args[ --l ];
					for(var i in item){
						if(item.output){
							var o = o || [];
							o.push(this.add(params, item.type, item.value, true));	
						} else {
							this.add(params, item.type, item.value, false);
							sql += i
						}						
					}
					if(!l){
						break;
					}
				}
				try{
					Connector.DBEngine.ExecuteCustomSQL(sql.slice(0, sql.length - 1), params);	
				} catch(e) {
					
				}					
			}
		
		},
		
		proc : {
		
			exec : function(name){
				var args = slice.call(arguments);
				if(args[1] && toString.call(args[1]) === $.object){
					var params = System.CreateObject('TSObjectLibrary.Parameters');
					var sql = 'EXEC ' + name;
					var p = args[1];
					var keys = _.keys(p);
					for(var i in keys){
						var item = p[keys[i]];
						var out = item.output;
						if(out){
							var output = output || [];
							output.push(this.add(params, keys[i], item.type, item.value, true));	
						} else {
							this.add(params, keys[i], item.type, item.value, false);	
						}						
						sql += ' @' + keys[i] + ' = :' + keys[i] + (out ? ' output' : '') + ',';	
					}
					try{
						Connector.DBEngine.ExecuteCustomSQL(sql.slice(0, sql.length - 1), params);
					} catch(e) {
						return new Promise(e.message);
					}
						return new Promise(null, output);							
				}		
			},
			
			add : typeof AddParameterEx === 'function' ? AddParameterEx : null
						
		}		
	}				
	eval('that.' + String.fromCharCode(95) + ' = $$');

	function Binder(){
		for(var i in this){
        	if(!this.hasOwnProperty(i) && toString.call(this[i]) === $.object){
        		var sub = this[i];
            	for(var j in sub){
                	if(typeof sub[j] === 'function'){
                    	sub[j] = sub[j].bind(this);
                	}
            		}    
        			}
    }	
}



}(this, Connector))
