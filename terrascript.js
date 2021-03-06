function(that, O_o){
	
	//Internal variables

	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var hasProp = Object.prototype.hasOwnProperty;
	//var ¯\_(ツ)_/¯ = '';
	
	var addParam = typeof AddParameterEx === 'function' ? AddParameterEx : function(){};
	
	var $ = {
		object            : '[object Object]',
		array             : '[object Array]',
		string            : '[object String]', 
		number            : '[object Number]', 
		bool              : '[object Boolean]',
		date              : '[object Date]', 
		db                : 'DBDataset', 
		window            : 'Window'
	};
	
	var valueTypes = {	
		0x0               : 'dftString',
		0x1               : 'dftInteger',
		0x2               : 'dftFloat',
		0x3               : 'dftBool',
		0x4               : 'dftDateTime'	
	}	

	var fieldTypes = {
    	'[object String]' : 0x0,
    	'[object Number]' : 0x1,
		'[object Number]' : 0x2,
		'[object Boolean]': 0x3,
		'[object Date]'   : 0x4			
	}
	
	var states = {
		closed            : 0x0, 
		browse            : 0x1,
		edit              : 0x2,
		insert            : 0x3,
		calc              : 0x4
	}

	//Internal functions

	function wrapper(fn, args){
		var args = slice.call(arguments, 1);
		return function(){
			return fn.apply(this, args);
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

	function iterator(o){
		var l = o.length, 
			count = function(n){
				var k = 0;
				return function(){
					k ^= 1;
					return n-- ? k ? n++ : n : O_o;
				}
			}, 
			c = count(l);
		return function fn(cb){
			return o[c()] ? cb(o[c()]) && fn(cb) : true;
		}
	}

	function isConstructor(fn){
		var str = '';
		str += fn;
		if(str.indexOf('this.') !== -1){
			return true;
		}
		return false;	
	}
	 	
	function _(){
		
		if(this instanceof _){
			return _();
		}

		var obj = slice.call(arguments)[0]

		return Create(obj, toString.call(obj));

	}
	
	_.version = '0.0.5';
	
	var $$ = {
	
		getUser : function(){
		 	return Connector.CurrentUser.ContactID;
		},

		keys : function(o){
			var r = [];
			for(var i in o){
				hasProp.call(o, i) && r.push(i);		
			}
			return r;	
		},

		size : function(o){
			if(this.isArray(o)){
				return o.length;
			}
			var keys = this.keys(o);
			return keys.length;
		},

		values : function(o){
			var r = [];
			for(var i in o){
				hasProp.call(o, i) && r.push(o[i]);
			}
			return r;
		},

		isObject : function(o){
			return toString.call(o) === $.object;
		},

		isUndefined : function(o){
			return typeof o === 'undefined' || o === O_o;
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
			if('length' in o && $$.isArray(o) && o.length){
				return false;
			}
			for(var i in o){
				if(hasProp.call(o, i)){
					return false;
				}
			}
			return true;	
		},

		isNull : function(o){
			return o === null;
		},
		
		noConflict : function(o){
			if(this.isNumber(o)){
				throw new TypeError('Expected an object or a string.');
			}
			!this.isUndefined(o) ? (that.o = _) : (that[o] = _);
		},
		 
		mixin : function(obj){
			var args = slice.call(arguments, 1);
			for(var t in args){
				var tt = args[t]
				if(toString.call(tt) === $.object){
					for(var i in tt){
						if(typeof tt[i] === 'function' && isConstructor( tt[i] )){
							obj[i] = new tt[i]();		
						} else {
							obj[i] = tt[i];	
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
				var o = !this.isUndefined(Services) && 
						!this.isNull(Services) &&
						Services.GetNewItemByUSI(o);	
			} catch(err){
				o = {};
			} finally {
				if(!o){
					throw new Error('The service doesn\'t seem to exist.');
				}
				return _(o);		
			}
		},

		setAttributes : function(o, props){
			for(var k in props){
				o(k) = props[k];
			}
		},
		
		all : function(o, cond){
			for(var i in o){
				if(hasProp.call(o, i) && o[i] !== cond){
					return false;
				}	
			}
			return true;		
		},
		
		any : function(o, cond){
			for(var i in o){
				if(hasProp.call(o, i) && o[i] === cond){
					return true
				}
			}
			return false;
		},
		
		findProp : function(o, cond){
			if(typeof cond === 'function'){
				for(var i in o){
					if(hasProp.call(o, i) && cond(o[i])){
						return o[i]
					}
				}
			} else {			
				for(var i in o){
					if(hasProp.call(o, i) && o[i] === cond){
						return o[i];
					}
				}
			}	
			return void 0;	
		},
		
		findProps : function(){
			var arr = [];
			for(var i in o){
				if(hasProp.call(o, i) && o[i] === cond){
					arr.push(o[i]);
				}
			}
			return arr;
		},
		
		proc : function(){
			
			this.exec = function(){
				var args = slice.call(arguments),
					res = args.length >= 2 ? false : true;
				var params = System.CreateObject('TSObjectLibrary.Parameters'),
					sql = 'EXEC ' + (res ? this.name : args[0]), 
					p = args[ res ? 0 : 1 ],
					keys = $$.keys(p),
					error,
					argsIter = iterator(args);
				if(argsIter(function(v){ return $$.isBool(v)}) ){
					error = true
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
					$$.setAttributes(this.window.Attributes, args);
					this.window.Prepare();
					return this;
				}
				(function(w){
					$$.setAttributes(this.window.Attributes, args.slice(1));
					w.Prepare();
				}($$.getService(args[0])))
			}
		
			this.show = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					this.window.Show();	
					return this;
				}
				(function(w){
					w.Show();
				}($$.getService(args[0])))							 					
			}
			
			this.showModal = function(){
				var args = slice.call(arguments);
				if(this.__construct){
					this.window.ShowModal();
					return this;	
				}
				(function(w){
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
		},
		
		genGUID : function(){
			(Connector.GenGUID || 
			(function(){
				var key = +new Date(),
        			hash = 0,
        			i = 5,
        			H = [];	
    			while(i--){
        			hash += key;
        			hash += hash << 10;
        			hash ^= hash >> 6;
        			hash += hash << 3;
        			hash ^= hash >> 11;
        			hash += hash << 15;
        			H.push(Math.abs(hash).toString(16))
    			}
				var H = H.map(it(H)).join('-');
				function it(H){
        			var c = 5,
            			k = '',
            			n;
        			return function(v){
            			switch(c--){           
                			case 5:                   
                    			k = v.slice(0, 8),
                    			n = k.length;                    
                    			if(n < 8){                       
                        			return k + H[1].slice(0, H[1].length - n);
                    			}                       
                			break;              
                			case 4:
                			case 3:
                			case 2:                  
                    			k = v.slice(8 - n, 4);                   
                    			return k;                   
                			break;               
                			case 1:
                    			return v.slice(0, 8);    
                			break;

                		}         
            		}              
        		}
        		return H;
			}()))();	
		}
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
					    	var obj = __construct(wrapper(db, o));
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
				
				var obj = __construct();
				for(var i in o){
					hasProp.call(o, i) && (obj[i] = o[i]);
				}
				return obj;

			break;
			case $.array:
			
				var obj = __construct();
				obj.array = o;
				return obj;

			break;
		}	
	}
		
	function db(dataset){

    	// Private link to the TerraSoft dataset object
		var db = dataset;
		
        // Private link to the TerraSoft dataset object state
		var dbState = dataset.State;
		
		//Private functions for inner use
		var _ = {
			
			getTable : function(){
				return this.db.SelectQuery.Items(0).FromTable.SQLName;		
			},
			getState : function(){
				return dbState;
			},
			
			isEmpty : function(){
				return this.db.IsEmptyPage;
			}	
			
		}
		
		/*		
			Dataset post function.
			Description: Posts changes to the database and then toggles the dataset state back to the current one
			Example: _.getService('ds_Clients').post()
			@return {self}					
		*/
		
		this.post = function(){

			var state = dbState;

			db.Post();
			try{			
				switch(state){            	
					case states.browse:					
						db.Edit();					
					break;				
					case states.edit:				
						db.Edit();					
					break;												
				}
				return this;
			} finally {
				return this;
			}
		}
		
		/*		
			Dataset set function.
			Description: Sets a new value to the current dataset record field
			Example: _.getService('ds_Clients').set({ContactPhone : '85555555555', Address : '1 Red square'})
			@param {object}
			@return {self}					
		*/

		this.set = function(o){

        	if(_.isEmpty()){
        		throw Error('Dataset is empty.');
        	}

			var _this = this;

			if($$.isObject(o)){
				var keys = $$.keys(o),
					values = $$.values(o), 
					iterKeys = iterator(keys),
					iterValues = iterator(values);

				if(iterKeys(ck) && iterValues(cv)){

					iterKeys(function(v){
						var fieldValue = this.getField(v).Value;
						if(fieldValue !== o[v]){
							this.getField(v).Value = o[v];	
						}
					})
				}

				function ck(value){
					return !!_this.getField(value);
				}

				function cv(value){
					for(var i in o){
						if(o[i] === value){
							var t = _this.getField(i).FieldType;
							if(value !== O_o && t === fieldTypes[toString.call(value)]){
								return 1;	
							} else {
								throw new Error('Wrong value type:\nField: ' + i + '\nExpected value type: ' + valueTypes[t]);
							}							
						}
					}
				}
			} else {
				throw new TypeError('An object was expected.');
			}

			return this;
		}
		
		/*		
			Dataset set and post function.
			Description: Sets a new value to the current dataset record field and then immediately posts it to the database
			Example: _.getService('ds_Clients').setAndPost({ContactPhone : '85555555555', Address : '1 Red square'})
			@param {object}
			@return {self}					
		*/

		this.setAndPost = function(o){
			this.set(o) && this.post();
			return this;
		}
		
		this.refresh = function(){
			db.Close();
			db.Open();
			return this;
		}
		
		this.getState = function(){
			return db.State;
		}
		
		/*		
			Dataset get function.
			Description: Get the field value of the current record
			Example: _('ds_Clients').get('ID')
			@return {FieldValue}					
		*/
		
		this.get = function(field){
			return db.DataFields(field).Value;
		}
		
		this.getField = function(field){
			return db.DataFields(field);	
		}
		
		this.last = function(){
			db.GotoLast();
			return this;
		}
		
		this.first = function(){
			db.GotoFirst();
			return this;
		}
		
		this.close = function(){
			db.Close();
			return this;
		}
		
		this.open = function(){
			db.Open();
			return this;
		}
		
		/*		
			Dataset isOpen function.
			Description: Checks if dataset if open
			Example: _('ds_Clients').isOpen()
			@return {boolean}					
		*/
				
		this.isOpen = function(){
			return db.State === dstBrowse;
		}
		
		/*		
			Dataset find function.
			Description: Finds a record that meets the search condition
			Example: _.getService('ds_Clients').find({Name : 'Муромец', ContactPhone : '83333333333'})
			@param {object}
			@return {self}					
		*/
		
		this.find = function(o){
			this.close();
			var args = slice.call(arguments, 1);
			var sq = this.db.SelectQuery,
				error = $$.findProp(args, function(n){ return $$.isBool(n);});
			try{
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
			} catch(err){
				throw new Error(err.message);
			}
			return this;				
		}
		
		/*		
			Dataset find by ID function.
			Description: Finds a record by ID 
			Example: _.getService('ds_Clients').find('{FCC50225-B42A-454D-AED9-A3B6E9335007}')
			@param {string}
			@return {self}					
		*/
		
		this.findByID = function(ID){
			this.find({ID : ID});
			return this;
		}
		
		/*		
			Dataset update function. 
			Example: _.getService('ds_Clients').open().update({Name : 'Mark'})
			@param {object}
			@return {self}					
		*/
		
		this.update = function(obj){
			!!!this.isOpen() && this.open();
			var args = slice.call(arguments, 1),
				error = $$.findProp(args, function(n){ return $$.isBool(n);}),			
				params = System.CreateObject('TSObjectLibrary.Parameters'),
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
				if(error){
					return err.message;
				}
				return false;
			}
			this.refresh();
			return this;						
		}
		
		/*		
			Dataset find and update function. 
			Example: _.getService('ds_Clients').open().findAndUpdate({ID : '{FCC50225-B42A-454D-AED9-A3B6E9335007}'}, {{Name : 'Mark'}})
			@param1 {object}
			@param2 {object}
			@return {self}					
		*/
				
		this.findAndUpdate = function(o, obj){
			!!!this.isOpen() && this.open();
			var error = $$.findProp(o, function(n){ return $$.isBool(n);});
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
			return this;		
		}		
	}
	/*			 	
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
	*/
					
	$$.mixin(_, $$);
	     
	that._ = _;

}(this))
