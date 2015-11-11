(function(that){
	
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var hasProp = Object.prototype.hasOwnProperty;
	
	var addParam = typeof AddParameterEx === 'function' ? AddParameterEx : function(){};
	var getService = 
	
	var $ = {
		object : '[object Object]',
		array : '[object Array]',
		string : '[object String]', 
		number : '[object Number]', 
		bool : '[object Boolean]', 
		db    : 'DBDataset', 
		window : 'Window'
	};
			 
	
	function _(){
		
		if(this instanceof _){
			return _();
		}

		var obj = slice.call(arguments)[0]

		return Create(obj, toString.call(obj));

	}
	
	_.version = 0.0.5;
	
	var $$ = {

		keys : function(o){
			var r = [];
			for(var i in o){
				r.push(i);		
			}
			return r;	
		},
		
		isBool : function(o){
			return toString.call(o) === $.bool; 	
		},

		isString : function(o){
			return typeof o === 'string';
		},

		isNumber : function(o){
			return typeof o === 'number';
		},

		isArray : function(o){
			return toString.call(o) === $.array;
		},

		isEmpty : function(o){
			if('length' in o && this.isArray(o) && o.length){
				return false;
			}
			for(var i in o){
				if(hasProp.call(o, i)){
					return false;
				}
			}
			return true;	
		},
		
		noConflict : function(o){
			if(typeof o !== 'number'){
				throw new TypeError('Expected an object or a function.');
			}
			typeof o === 'undefined' ? (that.o = _) : (that[o] = _);
		},
		 
		mixin : function(obj){
			var args = slice.call(arguments, 1);
			for(var t in args){
				var tt = args[t]
				if(toString.call(tt) === $.object){
					for(var i in tt){
						if(typeof tt[i] === 'function' && this.isEmpty(new tt[i]())){
							obj[i] = tt[i];		
						} else {
							obj[i] = new tt[i]();	
						}
					}
				} 
				else if(typeof tt === 'function'){
					obj[t] = new tt();
				}	
			}			
		},
						
		getService : function(o){
			try{
				var o = typeof Services !== 'undefined' && 
					Services.GetNewItemByUSI(o);	
			} catch(err){
				o = {};
			}
			if(!o){
				throw new Error('The service doesn\'t seem to exist.');
			}
			return _(o);	

		},

		setProps : function(o, props){
			for(var k in props){
				o[k] = props[k];
			}
		},
		
		proc : function(){
			
			this.exec = function(){
				var args = slice.call(arguments),
					res = args.length >= 2 ? false : true;
				var params = System.CreateObject('TSObjectLibrary.Parameters'),
					sql = 'EXEC ' + (res ? this.name : args[0]), 
					p = args[ res ? 0 : 1 ],
					keys = $$.keys(p),
					error;
				for(var i in args){
					if($$.isBool(args[i])){
						error = true;		
					}
				}
				for(var i in keys){
					var item = p[ keys[i] ],
						out = item.output;
					if(out){
						var output = output || [];
						output.push(addParam(params, keys[i], item.type, item.value, true));
					} else {
						addParam(params, keys[i], item.type, item.value, false);
					}
					sql += ' @' + keys[i] + ' = :' + keys[i] + (out ? ' output' : '') + ',';
				}
				try{
					Connector.DBEngine.ExecuteCustomSQL(sql.slice(0, sql.length - 1), params);	
				} catch(err){
					if(error){
						//return new Promise(err.message);
						return err.message;	
					} else {
						return false;
					}					
				}
				if(output){
					var outParams = {};
					for(var i in output){
						var item = output[i];
						outParams[item.Name] = item.Value;
					}
					if(this.output){
						this.output = outParams;
						return true;
					} else {
						return outParams;
					}	
				} else {
					return true;
				}											
			}				
		},
		
		window : function(){

			this.prepare = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					this.window.Prepare();
					return this;
				}
				(function(w){
					w.Prepare();
				}($$.getService(args[0])))
			}
		
			this.show = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					$$.setProps(this.window.Attributes, args);
					this.window.Show();	
					return this;
				}
				(function(w){
					$$.setProps(w.Attributes, args.slice(1));
					w.Show();
				}($$.getService(args[0])))							 					
			}
			
			this.showModal = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					$$.setProps(this.window.Attributes, args);
					this.window.ShowModal();
					return this;	
				}
				(function(w){
					$$.setProps(w.Attributes, args.slice(1));
					w.ShowModal();
				}($$.getService(args[0])))				
			}

			this.close = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					//modalresult
					this.window.Close();
					return this;
				}
				(function(w){
					//modalresult
					w.Close();
				}($$.getService(args[0])))
			}

			this.notify = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					var notifyee = args[0],
						message = args[1],
						data = args[2];
					this.window.notify(notifyee, message, data);
					return this;
				}
				(function(w){
					var notifyee = args[1],
						message = args[2],
						data = args[3];
					w.notify()
				}($$.getService(args[0])))
			}
		
		}
	}
	
	function __construct(Prototype){
		function F(){}
		F.prototype = new Prototype();
		F.prototype.__construct = true;
		var f = new F();
		F.prototype = null;
		return f;
	}
	
	function Create(o, type){
		switch(type){
		
			case $.string:
										
				var isObj = /(sp|fn)|(.sp|.fn)/g.test(o);
				if(isObj){
					var obj = __construct($$.proc);
					obj.name = o;
					obj.output = {};
					return obj;			
				} 
				
				var isWind = /(wnd)|(wnd_)/g.test(o);
				if(isWind){
					var obj = __construct($$.window);
			    	obj.window = o;
			    	return obj;		
				}
				
				return o;
				
			break;
		
			case $.object:
				
				if('ServiceTypeCode' in o){
					switch(o.ServiceTypeCode){
					
					    case $.db:
					    	var obj = __construct(db);
							obj.db = o;
							return obj;
					    break;
					    
					    case $.window:
					    	var obj = __construct($$.window);
					    	obj.window = o;
					    	return obj;					    	
					    break;
						
					}
				} 
				
				var obj = __construct(ObjectUtils);
				for(var i in o){
					hasProp.call(o, i) && (obj[i] = o[i]);
				}
				return obj;

			break;
			case $.array:
			
				var obj = __construct(ArrayUtils);
				obj.array = o;
				return obj;

			break;
		}	
	}
	
	
	function db(){
		
		var _ = {
			
			getTable : function(){
				return this.db.SelectQuery.Items(0).FromTable.SQLName;		
			},
			getState : function(){
				return this.db.State;
			},
			
			isEmpty : function(){
				return this.db.IsEmptyPage;
			}	
			
		}
		
		this.refresh = function(){
			this.db.Close();
			this.db.Open();
		}
		
		this.get = function(field){
			return this.db.DataFields(field).Value;
		}
		
		this.getField = function(field){
			return this.db.DataFields(field);	
		}
		
		this.last = function(){
			this.db.GotoLast();
		}
		
		this.first = function(){
			this.db.GotoFirst();
		}
		
		this.close = function(){
			this.db.Close();
		}
		
		this.open = function(){
			this.db.Open();
		}
		
		this.isOpen = function(){
			return this.db.State === dstBrowse;
		}
		
		this.find = function(o){
			this.close();
			var sq = this.db.SelectQuery;
			for(var param in o){
				var c = sq.Count;
				while(c){
					if(sq.Items(--c).Filters.FilterType === ftFilters){
						var filters = sq.Items(c).Filters,
							fc = filters.Count;
						while(fc){
							var f = filters.Items(--fc);
							if(f.Code === param){
								f.IsEnabled = true;
								sq.Parameters.ItemsByName(param).Value = o[param];	
							}	
							}	
							}
							}						
							}
			this.open();
			_.isEmpty.call(this);				
		}
		
		this.findByID = function(ID){
			this.find({ID : ID});
			_.isEmpty.call(this);
		}
		
		this.update = function(obj, error){
			!!!this.isOpen() && this.open();			
			var params = System.CreateObject('TSObjectLibrary.Parameters'),
				UniqueIdentifier = this.getField('ID').FieldType, 
				where = ' where ',
				sql = 'update ' + _.getTable.call(this) + ' set ';
			addParam(params, 'ID', UniqueIdentifier, this.get('ID'), 0);
			where += 'ID = :ID'; 
			for(var p in obj){
				var ptype = this.getField(p).FieldType;
				addParam(params, p, ptype, obj[p], false);
				sql += p + ' = :' + p + ', ';				
			}
			sql = sql.slice(0, sql.length - 2);
			try{
				Connector.DBEngine.ExecuteCustomSQL(sql + where, params);	
			} catch(err){
				return false;
			}
			this.refresh();
			return true;						
		}
		
		
		
		this.findAndUpdate = function(o, obj, error){
			!!!this.isOpen() && this.open();
			var params = System.CreateObject('TSObjectLibrary.Parameters'),
				sql = 'update ' + _.getTable.call(this) + ' set ',
				where = ' where ';
			for(var p in o){
				var ftype = this.getField(p).FieldType;
				addParam(params, p, ftype, o[p], 0);
				where += p + ' = :' + p + ' and ';	
			}
			where = where.slice(0, where.length - 5);				
			for(var key in obj){
				var ptype = this.getField(key).FieldType;
				addParam(params, key, ptype, obj[key], !!void 69);
				sql += key + ' = :' + key + ', ';
			}
			sql = sql.slice(0, sql.length - 2);			
			try{
				Connector.DBEngine.ExecuteCustomSQL(sql + where, params);
			} catch(err){
				if(error){
					return err.message;
				} else {
					return false;
				}						
			}
			this.refresh();
			return true;		
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
					return false;
				}
			}
			return true;
		}

		this.toArray = function(){
			var arr = [];
			for(var i in this){
				hasProp.call(this, i) && arr.push(this[i]);
			}
			return arr;	
		}

		this.map = function(cb){
			if(cb && typeof cb !== 'function'){
				throw TypeError();
			}
			for(var i in this){
				if(hasProp.call(this, i)){
					var value = cb(this[i], i)
					typeof value !== 'undefined' && (this[i] = value);
				}
			}
			return this;
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
				
	$$.mixin(_, $$);
	     
	that._ = _;					
	
	function Binder(){
		for(var i in this){
        	if(!hasProp.call(this, i) && (toString.call(this[i]) === $.object)){
        		var sub = this[i];
            	for(var j in sub){
                	if(typeof sub[j] === 'function'){
                    	sub[j] = sub[j].bind(this);
                	}
            	}    
        	}
    	}	
	}
}(this))
