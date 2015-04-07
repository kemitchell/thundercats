// Create Container
//
// Wraps a component in ThunderCats container.
// The container does the following.
//
// * retrieves and manages subscription to a ThunderCats Store
// * retrieves Actions for this store
// * register an active store
// * register a store as the recipient of a data fetch
// * initiates data fetch with given payload
//
// If a fetchAction is provided, the container Initiates fetching by calling
// the action defined as the fetchAction and will pass it the fetchPayload
// during the ComponentWillMount life cycle.
//
// props to pass to the container
//
// * store
// * actions
// * fetchAction
// * fetchPayload
// * onError
// * onCompleted
//
var React = require('react/addons'),
    invariant = require('invariant'),
    // warning = require('warnging'),
    assign = require('object.assign'),
    utils = require('../utils'),
    isObservable = utils.isObservable;

var Container = React.createClass({
  displayName: 'ThunderCatainer',

  propTypes: {
    actions: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ]),
    children: React.PropTypes.element,
    fetchAction: React.PropTypes.shape({
      className: React.PropTypes.string,
      actionName: React.PropTypes.string
    }),
    fetchPayload: React.PropTypes.object,
    onCompleted: React.PropTypes.func,
    onError: React.PropTypes.func,
    store: React.PropTypes.string.isRequired
  },

  contextTypes: {
    cat: React.PropTypes.object
  },

  // ### Get Initial State
  //
  // Here we do the following
  //
  // * get the store for this component
  // * register the store
  // * get the initial value of the store
  //
  getInitialState: function () {

    this.store = this.getStore(this.props.store);
    this._storeName = this.props.store;

    invariant(
      this.store && isObservable(this.store),
      '%s should get at least one store but found none for %s',
      this.displayName,
      this._storeName
    );

    var val = this.store.__getValue || null;
    this._checkVal(val);
    return val;
  },

  // ### Component Will Mount
  //
  // This is triggered on both the server and the client. This will do the
  // following:
  //
  // * get the actions relevant to the component
  // * call the data fetch action with fetch payload
  // * register the store to wait for data fetch completion
  //
  componentWillMount: function() {
    if (this.props.actions) {
      this.actions.forEach(function(action) {
        this.props[action] = this.context.cat.getAction(action);
      });
    }
  },

  // ### Component Did Mount
  //
  // This is where we subscribe to the observable Store and track its value.
  // Updates to the stores value will call setState on the container and the
  // container will add that value to child's props
  componentDidMount: function() {
    // Now that the component has mounted, we will use a long lived
    // the subscription
    this.storeSubscription = this.store.subscribe(
      this.storeOnNext,
      this.props.onError || this._storeOnNext,
      this.props.onCompleted || this._storeOnCompleted
    );
  },

  // ### Component Will Unmount
  //
  // On unmount, the subscription to the observable Store is disposed
  componentWillUnmount: function () {
    this.storeSubscription.dispose();
  },

  // This is the observer that will watch the observable Store.
  _storeOnNext: function (val) {
    this._checkVal(val);
    this.setState(val);
  },

  // If the observable Store throws an error this method will be called. This
  // can be overwritten by providing `onError` function on the props of this
  // container
  _storeOnError: function(err) {
    throw new Error(
      'ThunderCats Store encountered an error and has shutdown with: ' + err
    );
  },

  // If the observable Store completes, this method is called. This can be
  // overwritten by providing `onCompleted` function on the props of the
  // container
  _storeOnCompleted: function() {
    console.warn('Store has shutdown without error');
  },

  // Checks to make sure the value provided by the store is either an object or
  // null
  _checkVal: function(val) {
    invariant(
      typeof val === 'object',
      'The store %s should publish objects or null given: %s',
      this._storeName,
      val
    );
  },

  render: function() {

    return React.addons.cloneWithProps(
      this.props.children,
      assign({}, this.state)
    );
  }
});

module.exports = Container;