'use strict'
var React = require('react');

var Tabs = React.createClass({
	getDefaultProps: function(){
		return {
			active:null, 
			allowMultiple: false, 
			propName: 'tabName',
			onChange: null,
			useKeys: false
		}
	},
	
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
		return {active: active} 
	},

	render: function(){
	    var self = this;	
		var children = this.props.children;

		return( 
			<div> 				
				{/*Show the tabs*/}
				<ul className='tab'>
					{React.Children.map(children, function(child){
						var name = self._getName(child);
						var key = self._getKey(child);
						return (
							<li className={self._isActive(child) ? 'active' : ''}
								onClick={self._onClick.bind(null,key)}>
								{name}
							</li>
						)
					})}
				</ul>

				{/*Show content for active tabs */}
				<div className='tabcontent'>
					{React.Children.map(children, function(child){
						if(self._isActive(child)){
							return child;
						}	
					})}
				</div>
			</div>
		)
	},

	_getName: function(child){
		return child.props[this.props.propName];
	},

	_getKey: function(child){
		if(this.props.useKeys)
			return child.key;
		else
			return this._getName(child);
	},

	_isActive: function(child){
		var key = this._getKey(child);
		if(this.props.allowMultiple){
			return this.state.active.indexOf(key) >= 0;
		}

		return this.state.active === key;	
	},

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

	_onClick: function(key){
		var p = this.props;
		var active = this.state.active;

		if(p.allowMultiple){
			var index = active.indexOf(key);
			var newVal = active.slice();
			if(index >= 0)
				newVal.splice(index, 1);
			else
				newVal.push(key);
			
			this.setState({active: newVal});
			this._notifyCallbacks(newVal)
		}

		else if(active !== key){
			this.setState({active: key});
			this._notifyCallbacks(key);
		}
	}
});

module.exports = Tabs;
