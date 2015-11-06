(function(that, Connector){
	
	var toString = Object.prototype.toString;
	var slice = Array.prototype.slice;
	var	$ = {object : '[object Object]', array : '[object Array]', string : '[object String]', 
			 number : '[object Number]', db    : 'DBDataset'};
			 	
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


	function $$(){

		var _this = this;
		var SessionID, Version;
		Connector && (SessionID = Connector.SessionID, Version = Connector.Version);


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
}(this, Connector))


function Foo(){
    this.x = 10;
    
    
    for(var i in this){
        if(!this.hasOwnProperty(i) && Object.prototype.toString.call(this[i]) === '[object Object]'){
            for(var j in this[i]){
                if(typeof this[i][j] === 'function'){
                    this[i][j] = this[i][j].bind(this);
                }
            }    
        }
    }

}


Foo.prototype.u = {
    
    getX : function(){
        return this.x;
    }
    
}


var foo = new Foo();
foo.u.getX()
