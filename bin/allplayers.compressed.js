var JSON;JSON||(JSON={});
(function(){function a(a){return 10>a?"0"+a:a}function b(a){e.lastIndex=0;return e.test(a)?'"'+a.replace(e,function(a){var b=k[a];return"string"===typeof b?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function c(a,e){var d,k,p,r,t=g,q,n=e[a];n&&"object"===typeof n&&"function"===typeof n.toJSON&&(n=n.toJSON(a));"function"===typeof h&&(n=h.call(e,a,n));switch(typeof n){case "string":return b(n);case "number":return isFinite(n)?String(n):"null";case "boolean":case "null":return String(n);case "object":if(!n)return"null";
g+=f;q=[];if("[object Array]"===Object.prototype.toString.apply(n)){r=n.length;for(d=0;d<r;d+=1)q[d]=c(d,n)||"null";p=0===q.length?"[]":g?"[\n"+g+q.join(",\n"+g)+"\n"+t+"]":"["+q.join(",")+"]";g=t;return p}if(h&&"object"===typeof h)for(r=h.length,d=0;d<r;d+=1)"string"===typeof h[d]&&(k=h[d],(p=c(k,n))&&q.push(b(k)+(g?": ":":")+p));else for(k in n)Object.prototype.hasOwnProperty.call(n,k)&&(p=c(k,n))&&q.push(b(k)+(g?": ":":")+p);p=0===q.length?"{}":g?"{\n"+g+q.join(",\n"+g)+"\n"+t+"}":"{"+q.join(",")+
"}";g=t;return p}}"function"!==typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(b){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+a(this.getUTCMonth()+1)+"-"+a(this.getUTCDate())+"T"+a(this.getUTCHours())+":"+a(this.getUTCMinutes())+":"+a(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var d=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
e=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,g,f,k={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},h;"function"!==typeof JSON.stringify&&(JSON.stringify=function(a,b,e){var d;f=g="";if("number"===typeof e)for(d=0;d<e;d+=1)f+=" ";else"string"===typeof e&&(f=e);if((h=b)&&"function"!==typeof b&&("object"!==typeof b||"number"!==typeof b.length))throw Error("JSON.stringify");return c("",{"":a})});
"function"!==typeof JSON.parse&&(JSON.parse=function(a,b){function e(a,g){var c,d,f=a[g];if(f&&"object"===typeof f)for(c in f)Object.prototype.hasOwnProperty.call(f,c)&&(d=e(f,c),void 0!==d?f[c]=d:delete f[c]);return b.call(a,g,f)}var g;a=String(a);d.lastIndex=0;d.test(a)&&(a=a.replace(d,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return g=eval("("+a+")"),"function"===typeof b?e({"":g},""):g;throw new SyntaxError("JSON.parse");})})();var drupal=drupal||{};drupal.hasStorage="undefined"!==typeof Storage;drupal.hasStorage&="undefined"!==typeof JSON;drupal.retrieve=function(a){var b=null;a&&drupal.hasStorage&&(b=JSON.parse(localStorage.getItem(a)))&&(new Date).getTime()>b.expires&&(localStorage.removeItem(a),b={});return b};
drupal.store=function(a,b,c){a&&drupal.hasStorage&&(b.expires=1E3*(c||3600)+(new Date).getTime(),localStorage.setItem(a,JSON.stringify(b)))};drupal.clear=function(a){a&&drupal.hasStorage&&localStorage.removeItem(a)};
drupal.api=function(){return{resource:"",cacheId:"",isMobile:jQuery.hasOwnProperty("mobile"),endpoint:function(){return drupal.endpoint||""},getURL:function(a){if(a&&a.uri)return a.uri;var b=this.endpoint(),b=b+(this.resource?"/"+this.resource:"");return b+=a&&a.id?"/"+a.id:""},loading:function(a){this.isMobile&&(a?jQuery("body").addClass("ui-loading"):jQuery("body").removeClass("ui-loading"))},call:function(a,b,c,d,e){a={url:a,dataType:b,type:c,success:function(a){return function(b,c){a.loading(!1);
"success"==c?e&&e(b):console.log("Error: "+c)}}(this),error:function(a){return function(b,c,d){a.loading(!1);console.log(b.statusText);e&&e(null)}}(this)};d&&(a.data=d);this.loading(!0);jQuery.ajax(a)},get:function(a,b,c,d,e){var g=typeof b;"object"===g?(d=c,c=b,b=""):"function"===g&&(d=b,b="");var f=this.getURL(a),f=f+(b?"/"+b:""),f=f+".jsonp",f=f+(c?"?"+decodeURIComponent(jQuery.param(c,!0)):"");if(e&&(this.cacheId=f.replace(/[^A-z0-9\-]/g,""),(a=drupal.retrieve(this.cacheId))&&a.url===f)){d(a.data);
return}this.call(f,"jsonp","GET",null,function(a){return function(b){e&&drupal.store(a.cacheId,{url:f,data:b});d(b)}}(this))},execute:function(a,b,c){a=this.getURL(b)+"/"+a;this.call(a,"json","POST",b,c)},save:function(a,b){var c=a.id?"PUT":"POST";this.call(this.getURL(a),"json",c,a,b)},remove:function(a,b){this.cacheId&&drupal.clear(this.cacheId);this.call(this.getURL(a),"json","DELETE",null,b)}}};drupal=drupal||{};
drupal.entity=function(a,b,c){this.options=jQuery.extend({store:!0,expires:3600},"undefined"===typeof c?{}:c);a&&(this.properties={},this.set(a));b&&this.load(b)};drupal.entity.index=function(a,b,c,d){d=jQuery.extend({store:!0},d||{});"function"===typeof b&&(c=b,b={});var e=new a({});e.api.get({},e.getQuery(b),function(b){if(b)for(var e=b.length;e--;)b[e]=new a(b[e],null,d);c&&c(b)},d.store)};
drupal.entity.prototype.setProperties=function(a,b){if(a)for(var c in a)this[c]=b[c]||this[c]||a[c],this.properties[c]=c};drupal.entity.prototype.update=function(a,b){a&&this.set(a);b&&b.call(this,this)};drupal.entity.prototype.set=function(a){this.api=this.api||null;this.setProperties({id:"",uri:""},a);this.entityName="entity"};drupal.entity.prototype.get=function(){var a={};if(this.properties)for(var b in this.properties)a[b]=this[b];return a};
drupal.entity.prototype.getPOST=function(){var a=this.get();a.id||delete a.id;return a};drupal.entity.prototype.getQuery=function(a){return a||{}};drupal.entity.prototype.load=function(a){this.id||a(null);this.api&&this.api.get(this.get(),{},function(b){return function(c){c||a(null);b.update(c,a)}}(this),this.options.store)};drupal.entity.prototype.save=function(a){this.api&&this.api.save(this.getPOST(),function(b){return function(c){b.update(c,a)}}(this))};
drupal.entity.prototype.remove=function(a){this.id&&this.api.remove(this.get(),a)};drupal=drupal||{};
drupal.cookie=function(a,b,c){if(1<arguments.length&&(!/Object/.test(Object.prototype.toString.call(b))||null===b||void 0===b)){c=$.extend({},c);if(null===b||void 0===b)c.expires=-1;if("number"===typeof c.expires){var d=c.expires,e=c.expires=new Date;e.setDate(e.getDate()+d)}b=String(b);return document.cookie=[encodeURIComponent(a),"=",c.raw?b:encodeURIComponent(b),c.expires?"; expires="+c.expires.toUTCString():"",c.path?"; path="+c.path:"",c.domain?"; domain="+c.domain:"",c.secure?"; secure":""].join("")}c=
b||{};for(var d=c.raw?function(a){return a}:decodeURIComponent,e=document.cookie.split("; "),g=0,f;f=e[g]&&e[g].split("=");g++)if(d(f[0])===a)return d(f[1]||"");return null};drupal.system=function(a,b){drupal.entity.call(this,{},a,b)};drupal.system.prototype=new drupal.entity;drupal.system.prototype.constructor=drupal.system;drupal.system.api=jQuery.extend(new drupal.api,{resource:"system"});
drupal.system.prototype.set=function(a){drupal.entity.prototype.set.call(this,a);this.entityName="system";this.api=drupal.system.api;this.user=new drupal.user(a.user);this.user.setSession(a.session_name,a.sessid)};drupal.system.prototype.get=function(){return jQuery.extend(drupal.entity.prototype.get.call(this),{user:this.user.get()})};drupal.system.prototype.load=function(a){this.api.execute("connect",null,function(b){return function(c){b.update(c,a)}}(this))};
drupal.system.prototype.get_variable=function(a,b,c){this.api.execute("get_variable",{name:a,"default":b},c)};drupal.system.prototype.set_variable=function(a,b,c){this.api.execute("set_variable",{name:a,value:b},c)};drupal.system.prototype.del_variable=function(a,b){this.api.execute("del_variable",{name:a},b)};drupal=drupal||{};drupal.node=function(a,b,c){drupal.entity.call(this,a,b,c)};drupal.node.prototype=new drupal.entity;drupal.node.prototype.constructor=drupal.node;
drupal.node.api=jQuery.extend(new drupal.api,{resource:"node"});drupal.node.index=function(a,b,c){drupal.entity.index(drupal.node,a,b,c)};drupal.node.prototype.set=function(a){drupal.entity.prototype.set.call(this,a);this.entityName="node";this.api=drupal.node.api;this.id=a.nid||this.id||0;this.setProperties({nid:0,title:"",type:"",status:0,uid:0},a)};drupal.node.prototype.getQuery=function(a){a=drupal.entity.prototype.getQuery.call(this,a);a.type&&(a["parameters[type]"]=a.type,delete a.type);return a};
drupal=drupal||{};drupal.current_user=null;drupal.user=function(a,b,c){drupal.entity.call(this,a,b,c)};drupal.user.prototype=new drupal.entity;drupal.user.prototype.constructor=drupal.user;drupal.user.api=jQuery.extend(new drupal.api,{resource:"user"});drupal.user.index=function(a,b,c){drupal.entity.index(drupal.user,a,b,c)};
drupal.user.prototype.set=function(a){drupal.entity.prototype.set.call(this,a);this.entityName="user";this.api=drupal.user.api;this.id=a.uid||this.id||0;this.pass=a.pass||this.pass||"";this.setProperties({name:"",mail:"",status:1},a)};drupal.user.prototype.setSession=function(a,b){this.sessid=b;this.id&&a&&(this.session_name=a,drupal.cookie(a,b),drupal.current_user=this)};
drupal.user.prototype.login=function(a){this.api&&this.api.execute("login",{username:this.name,password:this.pass},function(b){return function(c){b.update(c.user);b.setSession(c.session_name,c.sessid);a&&a.call(b,b)}}(this))};drupal.user.prototype.register=function(a){this.api&&this.api.execute("register",this.getPOST(),function(b){return function(c){b.update(c,a)}}(this))};drupal.user.prototype.logout=function(a){this.api&&this.api.execute("logout",null,a)};
drupal.user.prototype.getPOST=function(){var a=drupal.entity.prototype.getPOST.call(this);a.pass=this.pass;return a};var allplayers=allplayers||{};
allplayers.date=function(a,b,c){this.newDate=function(a){return"string"===typeof a?new Date(a):"object"===typeof a?a:new Date};this.start=this.newDate(a);this.end=this.newDate(b);this.repeat=c?{interval:c.interval?c.interval:1,freq:c.freq?c.freq:"DAILY",until:this.newDate(c.until),bymonth:c.bymonth?c.bymonth:[],bymonthday:c.bymonthday?c.bymonthday:[],byday:c.byday?c.byday:[],exdate:c.exdate?c.exdate:[],rdate:c.rdate?c.rdate:[]}:null};
if(!Date.prototype.toISOString){var padzero=function(a){return 10>a?"0"+a:a},pad2zeros=function(a){100>a&&(a="0"+a);10>a&&(a="0"+a);return a};Date.prototype.toISOString=function(){var a=this.getUTCFullYear()+"-",a=a+(padzero(this.getUTCMonth()+1)+"-"),a=a+(padzero(this.getUTCDate())+"T"),a=a+(padzero(this.getUTCHours())+":"),a=a+(padzero(this.getUTCMinutes())+":"),a=a+(padzero(this.getUTCSeconds())+".");return a+=pad2zeros(this.getUTCMilliseconds())+"Z"}}
allplayers.date.prototype.update=function(a,b,c){this.start=a?this.newDate(a):this.start;this.end=b?this.newDate(b):this.end;c&&(c.until=this.newDate(c.until),jQuery.extend(this.repeat,c))};allplayers.date.prototype.addDate=function(a,b){b=this.newDate(b);this.repeat[a].push(b)};allplayers.date.prototype.addException=function(a){this.addDate("except",a)};allplayers.date.prototype.addRDate=function(a){this.addDate("rdate",a)};
allplayers.date.prototype.get=function(){var a=0,b={start:this.start.toISOString(),end:this.end.toISOString()};if(this.repeat){b.repeat={interval:this.repeat.interval,freq:this.repeat.freq,until:this.repeat.until.toISOString(),bymonth:this.repeat.bymonth,bymonthday:this.repeat.bymonthday,byday:this.repeat.byday,exdate:[],rdate:[]};for(a=this.repeat.exdate.length;a--;)b.repeat.exdate.push(this.repeat.exdate[a].toISOString());for(a=this.repeat.rdate.length;a--;)b.repeat.rdate.push(this.repeat.rdate[a].toISOString())}return b};
allplayers=allplayers||{};allplayers.event=function(a,b,c){drupal.node.call(this,a,b,c)};allplayers.event.prototype=new drupal.node;allplayers.event.prototype.constructor=allplayers.event;allplayers.event.api=jQuery.extend(new drupal.api,{resource:"events"});allplayers.event.index=function(a,b,c){drupal.entity.index(allplayers.event,a,b,c)};
allplayers.event.prototype.set=function(a){drupal.node.prototype.set.call(this,a);this.entityName="event";this.api=allplayers.event.api;this.id=a.uuid||a.id||this.id||"";this.setProperties({allDay:!1,gids:[],description:"",resources:[],competitors:{},category:"Other"},a);this.date=new allplayers.date(a.start,a.end);this.start=this.date.start;this.end=this.date.end};
allplayers.event.prototype.get=function(){return jQuery.extend(drupal.node.prototype.get.call(this),{allDay:this.allDay,gids:this.gids,description:this.description,resources:this.resources,competitors:this.competitors,category:this.category,date_time:this.date.get()})};allplayers=allplayers||{};allplayers.group=function(a,b,c){drupal.node.call(this,a,b,c)};allplayers.group.prototype=new drupal.node;allplayers.group.prototype.constructor=allplayers.group;
allplayers.group.api=jQuery.extend(new drupal.api,{resource:-1==window.location.hostname.indexOf("store")?"groups":"group_stores"});allplayers.group.index=function(a,b,c){drupal.entity.index(allplayers.group,a,b,c)};
allplayers.group.prototype.set=function(a){drupal.node.prototype.set.call(this,a);this.entityName="group";this.api=allplayers.group.api;this.id=a.uuid||a.id||this.id||"";this.has_children=a.hasOwnProperty("has_children")?a.has_children:!!this.has_children;this.location=a.location||this.location||new allplayers.location;this.setProperties({activity_level:0,list_in_directory:0,active:!1,registration_fees_enabled:"",approved_for_payment:"",accept_amex:"",primary_color:"",secondary_color:"",node_status:0,
logo:"",url:"",groups_above_uuid:[],registration_link:"",registration_text:""},a)};
allplayers.group.prototype.get=function(){return jQuery.extend(drupal.node.prototype.get.call(this),{location:this.location.get(),activity_level:this.activity_level,list_in_directory:this.list_in_directory,active:this.active,registration_fees_enabled:this.registration_fees_enabled,approved_for_payment:this.approved_for_payment,accept_amex:this.accept_amex,primary_color:this.primary_color,secondary_color:this.secondary_color,node_status:this.node_status,logo:this.logo,uri:this.uri,url:this.url,groups_above_uuid:this.groups_above_uuid,
registration_link:this.registration_link,registration_text:this.registration_text})};allplayers.group.prototype.getEvents=function(a,b){this.api.get(this,"events",a,function(a){for(var d in a)a[d]=new allplayers.event(a[d]);b(a)},!0)};allplayers.group.prototype.getUpcomingEvents=function(a,b){this.api.get(this,"events/upcoming",a,function(a){for(var d in a)a[d]=new allplayers.event(a[d]);b(a)},!0)};allplayers.group.prototype.getGroupTree=function(a,b){this.api.get(this,"subgroups/tree",a,b,!1)};
allplayers.group.prototype.find=function(a,b){this.api.get(this,"subgroups/find",{query:a},b)};allplayers=allplayers||{};allplayers.location=function(a,b,c){drupal.entity.call(this,a,b,c)};allplayers.location.prototype=new drupal.entity;allplayers.location.prototype.constructor=allplayers.location;allplayers.location.prototype.set=function(a){drupal.entity.prototype.set.call(this,a);this.setProperties({street:0,city:"",state:"",zip:"",country:"",latitude:"",longitude:""},a)};
allplayers.location.prototype.get=function(){return jQuery.extend(drupal.entity.prototype.get.call(this),{street:this.street,city:this.city,state:this.state,zip:this.zip,country:this.country,latitude:this.latitude,longitude:this.longitude})};allplayers=allplayers||{};
(function(a){var b={dialog:"#calendar-dialog-form"};allplayers.calendars={};a.fn.allplayers_calendar||(a.fn.allplayers_calendar=function(b){return a(this).each(function(){allplayers.calendars[a(this).selector]||new allplayers.calendar(a(this),b)})});allplayers.calendar=function(c,d){var e=this;d=a.extend(b,d,{header:{left:"prev,next today",center:"title",right:"month,agendaWeek,agendaDay"},editable:!0,dayClick:function(a,b,e,c){console.log(a);console.log(b);console.log(e);console.log(c)},eventClick:function(a,
b,e){console.log(a);console.log(b);console.log(e)},eventDrop:function(a,b,e,c){a.obj.update(a);a.obj.save()},eventResizeStop:function(a,b,e,c){a.obj.update(a);a.obj.save()},events:function(a,b,c){e.getEvents(a,b,c)}});this.dialog=a(d.dialog,c).hide();allplayers.calendars[d.id]=this;this.uuid="";c.fullCalendar(d)};allplayers.calendar.prototype.onEventClick=function(){console.log("Event has been clicked")};allplayers.calendar.prototype.getUUID=function(a){if(this.uuid)a.call(this);else{var b=this;allplayers.api.searchGroups({search:"Spring Soccer 2011"},
function(e){b.uuid=e[0].uuid;a.call(b)})}};allplayers.calendar.prototype.getEvents=function(a,b,e){var g=a.getFullYear()+"-",g=g+(a.getMonth()+1+"-"),g=g+a.getDate(),f=b.getFullYear()+"-",f=f+(b.getMonth()+1+"-"),f=f+b.getDate();this.getUUID(function(){allplayers.api.getGroupEvents(this.uuid,{start:g,end:f,fields:"*",limit:0,offset:0},function(a){for(var b=a.length;b--;)a[b].id=a[b].uuid,a[b].obj=new allplayers.event(a[b]);e(a)})})}})(jQuery);
(function(a){jQuery.fn.moreorless=function(b,c,d){b=b||100;c=c||"more";d=d||"less";this.each(function(){this.element=a(this);this.div_height=0;this.forceHeight=!1;this.link||(this.link=a(document.createElement("div")).css({cursor:"pointer"}),this.link.addClass("moreorless_link"));this.content||(this.content=this.element.wrap("<div></div>").parent(),this.content.addClass("moreorless_content expanded"));this.wrapper||(this.wrapper=this.content.wrap("<div></div>").parent(),this.wrapper.addClass("moreorless_wrapper").css("position",
"relative"));this.expand=function(a){this.link.remove();a?(this.link.html(d),a!=this.div_expanded&&this.content.addClass("expanded").animate({height:this.div_height},function(a){return function(){a.css("overflow","").height("inherit")}}(this.content)),this.forceHeight&&this.content.after(this.link)):(this.link.html(c),a!=this.div_expanded&&this.content.removeClass("expanded").animate({height:b},function(a){return function(){a.css("overflow","hidden")}}(this.content)),this.content.after(this.link));
this.link.unbind().bind("click",function(a){return function(b){b.preventDefault();b.stopPropagation();b=!a.content.hasClass("expanded");a.forceHeight=b;a.expand(b)}}(this));this.div_expanded=a;return this.content};this.checkHeight=function(){this.forceHeight=!1;this.div_height=this.element.height();this.expand(this.div_height<b)};var e=0;a(window).unbind("resize").bind("resize",function(a){return function(){clearTimeout(e);e=setTimeout(function(){a.checkHeight()},100)}}(this));this.element.unbind("resize").bind("resize",
function(a){return function(){clearTimeout(e);e=setTimeout(function(){a.checkHeight()},100)}}(this));this.checkHeight()})}})(jQuery);
(function(a){a.fn.treeselect=function(b){b=a.extend({colwidth:18,default_value:{},selected:null,treeloaded:null,load:null,searcher:null,deepLoad:!1,onbuild:null,postbuild:null,inputName:"treeselect",showRoot:!1,selectAll:!1,selectAllText:"Select All"},b);var c={},d=function(b,c){this.root=!!c;b.title=b.title||"anonymous";a.extend(this,{id:0,nodeloaded:!1,allLoaded:!1,value:0,title:"",url:"",has_children:!0,children:[],data:{},level:0,odd:!1,checked:!1,busy:!1,display:a(),input:a(),link:a(),span:a(),
childlist:a(),exclude:{}},b);this.isTreeNode=!0;this.loading=!1;this.loadqueue=[]};d.prototype.setBusy=function(a,b){a!=this.span.hasClass(b)&&((this.busy=a)?(this.span.addClass(b),this.span.addClass("treebusy")):(this.span.removeClass(b),this.span.hasClass("treebusy-loading"==b?"treebusy-selecting":"treebusy-loading")||this.span.removeClass("treebusy")))};d.prototype.isLoaded=function(){var a=this.nodeloaded,a=a|c.hasOwnProperty(this.id),a=a|!this.has_children;return a|=this.has_children&&0<this.children.length};
d.prototype.loadNode=function(a,d){if(this.loading)a&&this.loadqueue.push(a);else{var f=function(){a&&a(this);for(var b in this.loadqueue)this.loadqueue[b](this);this.loadqueue.length=0;d||this.setBusy(!1,"treebusy-loading")};this.loading=!0;b.load&&!this.isLoaded()?(d||this.setBusy(!0,"treebusy-loading"),b.load(this,function(a){return function(b){a.nodeloaded?f.call(a):(a=jQuery.extend(a,b),a.nodeloaded=!0,c[a.id]=a.id,a.build(function(){f.call(a)}))}}(this))):a&&f.call(this);this.loading=!1}};d.prototype.loadAll=
function(a,b,c,d){d=d||{};this.loadNode(function(h){b&&b(h);var l=h.children.length,m=l;if(!l||d.hasOwnProperty(h.id))a&&a.call(h,h);else for(d[h.id]=h.id,c||h.setBusy(!0,"treebusy-loading-all");l--;)setTimeout(function(l){return function(){h.children[l].loadAll(function(){m--;m||(a&&a.call(h,h),c||h.setBusy(!1,"treebusy-loading-all"))},b,c,d)}}(l),2)})};d.prototype.expand=function(a){a?(this.link.removeClass("collapsed").addClass("expanded"),this.span.removeClass("collapsed").addClass("expanded"),
this.childlist.show("fast"),!b.deepLoad&&this.checked&&this.include_children&&(this.include_children=!1,this.selectChildren(!0))):0<this.span.length&&(this.link.removeClass("expanded").addClass("collapsed"),this.span.removeClass("expanded").addClass("collapsed"),this.childlist.hide("fast"));a&&!this.isLoaded()&&this.loadNode(function(a){a.checked&&a.selectChildren(a.checked);a.expand(!0)})};d.prototype.selectChildren=function(e,c,d){var k="object"==typeof e,h=function(){d||(b.selected&&b.selected(this,
!0),c&&c.call(this))};if(b.deepLoad)this.loadAll(function(){this.setBusy(!1,"treebusy-selecting");h.call(this)},function(a){var b=e;k&&(b=e.hasOwnProperty(a.value),b|=e.hasOwnProperty(a.id));a.select(b)});else{this.select(e);var l=b.inputName+"-"+this.value;a('input[name="'+l+'-include-below"]').attr("name",l);if(!0===this.root||!1===e&&!this.include_children||void 0!==this.link&&void 0!==this.link[0]&&-1!==this.link[0].className.indexOf("expanded"))for(this.include_children=!1,this.expand(e),l=this.children.length;l--;)this.children[l].selectChildren(e,
c,!0);else 0<this.has_children&&e&&(this.include_children=!0,a('input[name="'+l+'"]').attr("name",l+"-include-below"));h.call(this)}};d.prototype.selectDefaults=function(e,c){var d=Object.keys(e).length,k=[];for(k.push(this);0<d&&0<k.length;){var h=k.shift(),l=!1;e.hasOwnProperty(h.value)&&(delete e[h.value],l=!0,d--);e.hasOwnProperty(h.id)&&(delete e[h.id],l=!0,d--);e.hasOwnProperty(h.value+"-include-below")&&(delete e[h.value+"-include-below"],l=h.include_children=!0,d--);e.hasOwnProperty(h.id+
"-include-below")&&(delete e[h.id+"-include-below"],l=h.include_children=!0,d--);h.select(l);var m=b.inputName+"-"+h.value;a('input[name="'+m+'-include-below"]').attr("name",m);if(!h.root&&l&&h.include_children)a('input[name="'+m+'"]').attr("name",m+"-include-below");else if(0<d)for(l=h.children.length;l--;)k.push(h.children[l]);else h.root&&h.include_children&&h.selectChildren(!0)}b.selected&&b.selected(this,!0);c&&c.call(this)};d.prototype.select=function(a){!this.input.hasClass("treenode-no-select")&&
((a=!!a)||!this.root||this.showRoot&&this.has_children)&&(this.checked=a,this.input.attr("checked",a),b.selected&&b.selected(this))};d.prototype.build_treenode=function(){var b=a(),b=a(document.createElement(this.root?"div":"li"));b.addClass("treenode");b.addClass(this.odd?"odd":"even");return b};d.prototype.build_input=function(c){if(b.inputName){if("undefined"!==typeof this.exclude[this.id])this.input=a(document.createElement("div")),this.input.addClass("treenode-no-select");else{this.input=a(document.createElement("input"));
var d=this.value||this.id;this.input.attr({type:"checkbox",value:d,name:b.inputName+"-"+d,checked:this.checked}).addClass("treenode-input");this.input.bind("click",function(c){return function(e){c.checked=a(e.target).is(":checked");c.checked&&!b.deepLoad||c.expand(c.checked);c.selectChildren(c.checked)}}(this));this.root&&!b.showRoot&&this.input.hide()}this.input.css("left",c+"px")}return this.input};d.prototype.build_link=function(b){b.css("cursor","pointer").addClass("collapsed");b.bind("click",
{node:this},function(b){b.preventDefault();b.data.node.expand(a(b.target).hasClass("collapsed"))});return b};d.prototype.build_span=function(b){this.root&&!this.showRoot||!this.has_children||(this.span=this.build_link(a(document.createElement("span")).attr({"class":"treeselect-expand"})),this.span.css("left",b+"px"));return this.span};d.prototype.build_title=function(b){this.root&&!this.showRoot||!this.title||(this.nodeLink=a(document.createElement("a")).attr({"class":"treeselect-title",href:this.url,
target:"_blank"}).css("marginLeft",b+"px").text(this.title),this.link=this.has_children?this.build_link(this.nodeLink.clone()):a(document.createElement("div")).attr({"class":"treeselect-title"}).css("marginLeft",b+"px").text(this.title));return this.link};d.prototype.build_children=function(b){this.childlist=a();if(0<this.children.length){this.childlist=a(document.createElement("ul"));var c=this.odd,f=this.children.length,k;for(k in this.children)this.children.hasOwnProperty(k)&&(c=!c,this.children[k]=
new d(a.extend(this.children[k],{level:this.level+1,odd:c,checked:this.checked,exclude:this.exclude})),setTimeout(function(a,c){return function(){a.children[c].build(function(c){f--;a.childlist.append(c.display);f||b.call(a,a.childlist)})}}(this,k),2))}else b.call(this,this.childlist)};d.prototype.build=function(c){var d=5,f=null;if(0==this.display.length)this.display=this.build_treenode();else if(this.root){var k=this.build_treenode();this.display.append(k);this.display=k}0==this.input.length&&(f=
this.build_input(d))&&0<f.length&&(this.display.append(f),d+=b.colwidth);0==this.span.length&&(this.display.append(this.build_span(d)),d+=b.colwidth);0==this.link.length&&this.display.append(this.build_title(d));var h=function(){if(b.onbuild)b.onbuild(this);this.searchItem=this.display.clone();a(".treeselect-expand",this.searchItem).remove();var d=a("div.treeselect-title",this.searchItem);0<d.length&&d.replaceWith(this.nodeLink);b.postbuild&&b.postbuild(this);"undefined"!==typeof this.exclude[this.id]&&
0==a(".treenode-input",this.display).length&&this.display.hide();c&&c.call(this,this)};0==this.childlist.length?this.build_children(function(a){0<a.length&&this.display.append(a);h.call(this)}):h.call(this)};d.prototype.getSelectAll=function(){return this.root&&this.selectAll?this.selectAllText:!1};d.prototype.search=function(a,g){if(a){var f={};a=a.toLowerCase();b.searcher?b.searcher(this,a,function(a,b){var e=null,m=a.length;0==a.length&&g(f,!0);for(var s in a)e=new d(b?b(a[s]):a[s]),e.nodeloaded=
!0,c[e.id]=e.id,e.build(function(){m--;f[s]=e;m||g(f,!0)})}):this.loadAll(function(a){g&&g(f,!0)},function(b){b.root||-1===b.title.toLowerCase().search(a)||(f[b.id]=b)},!0)}else g&&g(this.children,!1)};return a(this).each(function(){var c=a.extend(b,{display:a(this)}),c=this.treenode=new d(c,!0),g=c.getSelectAll();if(!1!==g&&!c.showRoot){var f=!1;b.default_value.hasOwnProperty(c.value+"-include-below")&&(f=!0);c.display.append(a(document.createElement("input")).attr({type:"checkbox",checked:f}).bind("click",
function(b){return function(c){b.selectChildren(a(c.target).is(":checked"))}}(c)));g&&(g=a(document.createElement("span")).attr({"class":"treeselect-select-all"}).html(g),c.display.append(g))}var k=a(document.createElement("span")).addClass("treebusy");c.display.append(k.css("display","block"));var h=function(){k.remove();b.treeloaded&&b.treeloaded(this)};c.loadNode(function(a){0==a.children.length&&a.display.hide();a.expand(!0);a.select(a.checked);var c=a.checked;jQuery.isEmptyObject(b.default_value)||
(c=b.default_value);c?b.deepLoad?a.selectChildren(c,function(){h.call(a)}):a.selectDefaults(c,function(){h.call(a)}):h.call(a)});c.has_children||(this.parentElement.style.display="none")})}})(jQuery);
(function(a){a.fn.chosentree=function(b){b=a.extend({inputId:"chosentree-select",label:"",description:"",input_placeholder:"Select Item",input_type:"text",autosearch:!1,search_text:"Search",no_results_text:"No results found",min_height:100,more_text:"+%num% more",loaded:null,collapsed:!0,showtree:!1},b);return a(this).each(function(){var c=null,d=null,e=null,g=null,f=null,k=null,h=null,l=e=null,m=null,s=function(a,b){a&&(null==m||m.has_children)?l.addClass("treevisible").show("fast"):l.removeClass("treevisible").hide("fast")},
c=a(document.createElement("div"));c.addClass("chzntree-container");"search"==b.input_type?(c.addClass("chzntree-container-single"),e=a(document.createElement("div")),e.addClass("chzntree-search")):(c.addClass("chzntree-container-multi"),d=a(document.createElement("ul")),d.addClass("chzntree-choices chosentree-choices"),e=a(document.createElement("li")),e.addClass("search-field"));k=a(document.createElement("label"));k.attr({"for":b.inputId});k.text(b.label);h=a(document.createElement("div"));h.attr({"class":"description"});
h.text(b.description);if(b.input_placeholder){g=a(document.createElement("input"));g.attr({type:"text",placeholder:b.input_placeholder,autocomplete:"off"});!b.showtree&&b.collapsed&&g.focus(function(a){s(!0)});if("search"==b.input_type){g.addClass("chosentree-search");var u=function(a){return!g.hasClass("searching")&&1!==a.length&&m?(g.addClass("searching"),m.search(a,function(a,c){g.removeClass("searching");var d=0;m.childlist.children().detach();c?m.childlist.addClass("chzntree-search-results"):
m.childlist.removeClass("chzntree-search-results");for(var e in a)d++,c?m.childlist.append(a[e].searchItem):m.childlist.append(a[e].display);d||m.childlist.append("<li>"+b.no_results_text+"</li>")}),!0):!1};if(b.autosearch){var p=0;g.bind("input",function q(){u(g.val())||(clearTimeout(p),p=setTimeout(q,1E3))});e.addClass("autosearch")}else f=a(document.createElement("input")),f.attr({type:"button",value:b.search_text}),f.addClass("button chosentree-search-btn"),f.bind("click",function(a){a.preventDefault();
u(g.val())}),jQuery(document).bind("keydown",function(a){13==a.keyCode&&g.is(":focus")&&(a.preventDefault(),u(g.val()))}),e.addClass("manualsearch")}else g.addClass("chosentree-results");e.append(g);f&&e.append(f)}d?c.append(k).append(d.append(e)):c.append(k).append(e);l=a(document.createElement("div"));l.addClass("treewrapper");l.hide();e=a(document.createElement("div"));e.addClass("treeselect");a(this).keyup(function(a){27==a.which&&s(!1)});l.append(e);a(this).append(c.append(l));a(this).append(h);
var r=b;r.selected=function(c){var e={};return function(f,h){if(f.id){var k=a("li#choice_"+f.id,d);f.checked?(0!=k.length&&k.remove(),e[f.id]=f):f.checked||k.remove()}if(h){c.value={};for(var l in e){f=e[l];c.value[l]=f;k=a(document.createElement("li"));k.addClass("search-choice");k.attr("id","choice_"+f.id);k.eq(0)[0].nodeData=f;var m=a(document.createElement("span"));!b.deepLoad&&f.include_children?m.text(f.title+" (All below)"):m.text(f.title);if(!f.root||f.showRoot&&f.has_children){var p=a(document.createElement("a"));
p.addClass("search-choice-close");p.attr("href","javascript:void(0)");p.bind("click",function(b){b.preventDefault();f=this.parentNode.nodeData;a("li#choice_"+f.id,d).remove();f.selectChildren(!1)})}d.prepend(k.append(m).append(p))}d.is(":visible")||d.show();e={};g&&0==f.children.length&&g.attr({value:""});jQuery.fn.moreorless&&(l=a("li.search-choice",d).length,l=b.more_text.replace("%num%",l),d.moreorless(b.min_height,l),d.div_expanded||s(!0,null));r.loaded&&r.loaded(nodes);a(c).trigger("treeloaded")}}}(this);
e.treeselect(r);m=e.eq(0)[0].treenode;!r.showtree&&r.collapsed||s(!0,null)})}})(jQuery);
(function(a){a.fn.group_select=function(b){b=jQuery.extend({uuid:0,depth:8,sortby:"title",sort:"asc",include_group_info:0,include_hidden:0,onRoot:null,relative_link:!1},b);var c="asc"===b.sort.toLowerCase()?-1:1;drupal.endpoint=drupal.endpoint||"/api/v1/rest";return a(this).each(function(){var d=function(a){var g={};if(!a)return null;var f=parseInt(a.has_children);g.id=a.uuid||b.uuid;g.value=a.nid;g.title=a.title;g.url=a.url;g.has_children=f;g.data=a;g.sort=g[b.sortby];g.children=[];var f=null,k;
for(k in a.below)a.below.hasOwnProperty(k)&&(f=d(a.below[k]))&&g.children.push(f);0<g.children.length&&g.children.sort(function(a,b){return a.sort<b.sort?c:a.sort>b.sort?-c:0});return g};b.load=function(a,c){(new allplayers.group({id:a.id||b.uuid})).getGroupTree({depth:b.depth,include_group_info:b.include_group_info,include_hidden:b.include_hidden,root_uuid:b.root_uuid,inclusive:1,path:b.relative_link?window.location.pathname:""},function(a){a=d(a);if(b.onRoot)b.onRoot(a);c(a)})};b.searcher=function(a,
c,f){(new allplayers.group({id:a.id||b.uuid})).find(c,function(a){f(a,d)})};b.inputId="chosentree-select-"+b.uuid;a(this).chosentree(b)})}})(jQuery);
(function(a){a.fn.group_finder=function(b){var c={};b=jQuery.extend({deepLoad:1,inputName:"",input_placeholder:"Find subgroups",input_type:"search",no_results_text:"No groups found",unavailable_text:"Unavailable",load_extra_info:0,include_group_info:1,show_register_link:1,include_hidden:0,show_url_link:1,showRoot:0,showtree:1,gotoPath:"",gotoText:"",gotoClass:"allplayers-register-link",gotoFeature:"",onRoot:function(a){c=a},onbuild:function(d){if(b.include_group_info){if(b.show_register_link&&!d.has_register_link){d.has_register_link=
!0;if(d.data.roles_enabled){d.root&&(d.data.register_link+="/select");var e=d.data.register_link,e=e+"?destination="+encodeURIComponent(window.document.URL),e=e+("&from="+c.id);d.link.after(a(document.createElement("a")).attr({"class":"button small allplayers-register-link",href:e}).text(d.data.register_text))}if(b.load_extra_info){var g=0;d.loadAll(function(){0<g?d.link.append(a(document.createElement("span")).html(g+" "+(1==g?"subgroup":"subgroups")+" open").attr({"class":"extra-info"})):d.data.roles_enabled||
d.link.append(a(document.createElement("span")).html(b.unavailable_text).attr({"class":"extra-info"}))},function(a){a.id!=d.id&&a.data.register_link&&g++},!0)}}b.gotoPath&&d.data.url&&!d.has_goto_link&&(!b.gotoFeature||d.data.features&&d.data.features[b.gotoFeature])&&(d.has_goto_link=!0,e=d.data.url+"/"+b.gotoPath,e+="?destination=",e+=encodeURIComponent(window.document.URL),e+="&from="+c.id,d.link.after(a(document.createElement("a")).attr({"class":b.gotoClass,href:e}).text(b.gotoText)));b.show_url_link&&
d.data.url&&!d.has_url_link&&(d.has_url_link=!0,d.link.after(a(document.createElement("a")).attr({"class":"allplayers-url-link",href:d.data.url}).append(a(document.createElement("span")).attr({"class":"ui-icon ui-icon-circle-arrow-e"}))))}}},b);return a(this).each(function(){a(this).group_select(b)})}})(jQuery);
