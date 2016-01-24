(function(){
'use strict';
/* Tabs provides a simple way of providing tabbed components. 

  General Features:
	Tab names are taken from the children of <Tabs>. 
		The default is to look for a property named 'tabName' on each child of <Tabs>. 
		This can be modified by changing the property 'propName'.

	By default, tabNames are used as keys and must be unique.
		Set the property 'useKeys' to true to allow for non-unique tabNames.
		If true, a property named 'key' that must be provided and be unique.
	
    Multiple tabs being active is supported.
		Set the property 'allowMultiple' to true to enable. 

  Props:
	allowMultiple: bool - If true, multiple tabs can be selected. 
	
	propName: string, default: 'tabName' - The propname that will be used
		to get the title of the tab. This must be unique among all children
		unless useKeys is enabled.
	
	useKeys: bool - If true, Tabs requires children to have a prop value 'key' 
		that are unique (but tabnames no longer need to be unique)		
	
	active: string, or array of strings - The current active tab by title 
		(or key if useKeys=true). If allowMultiple=true, active will be an 
		array of titles/keys	
	
	useState: bool, default: false - The user is normally responsible for maintaining 
		the prop 'active' based on the value supplied to the onChange callback.
		If useState is set to true, this component maintains the stateful value of the active tab.
		The application does not need to update the property 'active'. This should only
		be used if you have no interest in maintaining which tab is currently active.
	
	onChange: callback - The callback is called when the user clicks on a new tab. It
		provides the tabName or key of the tab clicks. If allowMultiple is true,
		onCHange will provide an array of the tabNames/keys that should be active.


  Example:
		<Tabs useState={true}>
			<Elem tabName='Action for Tab1!' />
			<SomeOtherElem tabName='Tile for Tab#2' />
			<div tabName='Tab Number 3!'>Interesting lack of content.</div>
		</Tabs>
*/

//Root code stolen from underscore.js (https://github.com/jashkenas/underscore/blob/master/underscore.js):
// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;

var has_require = typeof require !== 'undefined';


var React = root.React;
if(typeof React === 'undefined'){
	if(has_require)
		React = require('react');
	else throw new Error('Tabs requires the React object be defined.');
}


var Tabs = React.createClass({
	getDefaultProps: function(){
		return {
			active:null, 
			allowMultiple: false, 
			propName: 'tabName',
			onChange: null,
			useKeys: false,
			useState: false,
		};
	},

	/* The initial state is copied over from the specified props.
	   If allowMultiple=true, active becomes an array. 
	*/ 
	getInitialState: function(){
		var p = this.props;
		var active = p.active;
			//Set active to an array if allowMultiple is true.
			if(p.allowMultiple){
				if(active===null)
					active = [];
				else if(!Array.isArray(active))
					active = [active];
			}
			return {active: active};
	},

	//When receiving new props, if tabs is not managing own state, update state.
	componentWillReceiveProps: function(newProps){
		if(this.props.useState)
			return;	//Let state manage things, not props.
		
		var active = newProps.active;
		if(newProps.allowMultiple){
			if(active===null)
				active=[];
			else if(!Array.isArray(active))
				active = [active];
		}
		this.setState({active: active});
	},

	/* render() iterates through all the children, reading their tabname, 
	   and saving active children to an array for display. 
	 */
	render: function(){
	    var self = this;	
		var children = this.props.children;
		var activeChildren = [];

		return( 
			<div> 				
				{/*Show the tabs*/}
				<ul className='tabs'>
					{React.Children.map(children, function(child){
						if(child === null) return;

						var name = self._getTabName(child);
						var key = self._getKey(child);
						var active = self._isActive(child);
						if(active)
							activeChildren.push(child);

						return (
							<li className={active ? 'active' : ''}
								onClick={self._onClick.bind(null,key)}>
								{name}
							</li>
						);
					})}
				</ul>

				{/*Show content for active tabs */}
				<div className='tabcontent'>
					{activeChildren}
				</div>
			</div>
		);
	},

	//Returns the name of the specified child as defined by propName.
	_getTabName: function(child){
		return child.props[this.props.propName];
	},

	//Returns the key of the child (either the tabName, or the child
	//key if useKeys is turned on. 
	_getKey: function(child){
		if(this.props.useKeys)
			return child.key;
		else
			return this._getTabName(child);
	},

	//Returns true if this tab is listed as active in state.active.
	_isActive: function(child){
		var key = this._getKey(child);
		if(this.props.allowMultiple){
			return this.state.active.indexOf(key) >= 0;
		}

		return this.state.active === key;	
	},

	//Calls the specified callbacks with the requested new state.
	_notifyCallbacks: function(newState){
		var callbacks = this.props.onChange;

		if(callbacks !== null){
			if(Array.isArray(callbacks))
				callbacks.map(function(cb){
					cb(newState);
				});	
			else
				callbacks(newState);
		}
	},

	//Triggered when clicking a new tab. Triggers the onChange callback
	//if useState is true. the state is immediately updated to show the new tab
	//TODO: Reverse order - notify callbacks, allow them to prevent state change.
	_onClick: function(key){
		var p = this.props;
		var active = this.state.active;
		var retval;
		if(p.allowMultiple){
			var index = active.indexOf(key);
			var newVal = active.slice();
			if(index >= 0)
				newVal.splice(index, 1);
			else
				newVal.push(key);
			
			retval = {active: newVal};
			if(p.useState)
				this.setState(retval);
			this._notifyCallbacks(retval);
		}

		else if(active !== key){
			retval = {active: key};
			if(p.useState)
				this.setState(retval);
			this._notifyCallbacks(retval);
		}
	}
});


//Export code stolen from underscore.js (https://github.com/jashkenas/underscore/blob/master/underscore.js):
// Export the Tabs object for **Node.js**, with
// backwards-compatibility for their old module API. If we're in
// the browser, add `Tabs` as a global object.
// (`nodeType` is checked to ensure that `module`
// and `exports` are not HTML elements.)
if (typeof exports != 'undefined' && !exports.nodeType) {
	if (typeof module != 'undefined' && !module.nodeType && module.exports) {
  		exports = module.exports = Tabs;
	}
	exports.Tabs = Tabs;
} else {
	root.Tabs = Tabs;
}


}());
