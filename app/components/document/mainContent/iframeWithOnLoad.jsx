"use strict";

var React = require("react");

var IframeWithOnLoad = React.createClass({
    propTypes: {
        src: React.PropTypes.string.isRequired,
        onLoaded: React.PropTypes.func
    },
    getInitialState() {
        return {
            onLoad: this.props.onLoaded
        };
    },
    componentWillReceiveProps(nextProps) {
        this.setState({
            onLoad: nextProps.onLoaded
        });
        this.refs.iframe.getDOMNode().addEventListener("load", this.state.onLoad);
    },
    componentDidMount() {
        this.refs.iframe.getDOMNode().addEventListener("load", this.state.onLoad);
    },
    componentWillUnmount() {
        this.refs.iframe.getDOMNode().removeEventListener("load", this.state.onLoad);
    },
    render: function() {
        return <iframe ref="iframe" {...this.props}/>;
    }
});

module.exports = IframeWithOnLoad;