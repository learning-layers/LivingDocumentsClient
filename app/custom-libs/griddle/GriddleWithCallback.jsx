"use strict";
//@See Added because of ticket: https://github.com/GriddleGriddle/GriddleWithCallback/issues/3

let React = require("react");
let Griddle = require("griddle-react");
let _ = require("underscore");

let Loading = React.createClass({
    getDefaultProps: function(){
        return {
            loadingText: "Loading"
        };
    },
    render: function(){
        return <div className="loading">{this.props.loadingText}</div>;
    }
});

let NextArrow = React.createElement("i", {className: "glyphicon glyphicon-chevron-right"}, null);
let PreviousArrow = React.createElement("i", {className: "glyphicon glyphicon-chevron-left"}, null);
let SettingsIconComponent = React.createElement("i", {className: "glyphicon glyphicon-cog"}, null);

let GriddleWithCallback = React.createClass({
    /**
     *
     */
    getDefaultProps: function(){
        return {
            getExternalResults: null,
            resultsPerPage: 10,
            loadingComponent: null,
            enableInfiniteScroll: false,
            filter: ""
        };
    },


    /**
     *
     */
    getInitialState: function(){
        let initial = { "results": [],
            "page": 0,
            "maxPage": 0,
            "sortColumn":null,
            "sortAscending":true
        };

        // If we need to get external results, grab the results.
        initial.isLoading = true; // Initialize to "loading"

        return initial;
    },


    /**
     * Called when component mounts
     */
    componentDidMount: function(){
        let state = this.state;
        state.pageSize = this.props.resultsPerPage;

        let that = this;

        if (!this.hasExternalResults()) {
            console.error("When using GriddleWithCallback, a getExternalResults callback must be supplied.");
            return;
        }

        // Update the state with external results when mounting
        state = this.updateStateWithExternalResults(state, function(updatedState) {
            that.setState(updatedState);
        });
    },


    /**
     *
     */
    componentWillReceiveProps: function(nextProps) {
        let state = this.state,
            that = this;

        //TODO check whether this is correct
        state.page =  0;
        state.filter = nextProps.filter;

        this.updateStateWithExternalResults(state, function(updatedState) {
            //if filter is null or undefined reset the filter.
            if (_.isUndefined(nextProps.filter) || _.isNull(nextProps.filter) || _.isEmpty(nextProps.filter)){
                updatedState.filter = nextProps.filter;
                updatedState.filteredResults = null;
            }

            // Set the state.
            that.setState(updatedState);
        });
    },


    /**
     * Utility function
     */
    setDefault: function(original, value){
        return typeof original === "undefined" ? value : original;
    },


    /**
     *
     */
    setPage: function(index, pageSize){
        //This should interact with the data source to get the page at the given index
        let that = this;
        let state = {
            page: index,
            pageSize: this.setDefault(pageSize, this.state.pageSize)
        };

        this.updateStateWithExternalResults(state, function(updatedState) {
            that.setState(updatedState);
        });
    },

    /**
     *
     */
    getExternalResults: function(state, callback) {
        let filter,
            sortColumn,
            sortAscending,
            page,
            pageSize;

        // Fill the search properties.
        if (state !== undefined && state.filter !== undefined) {
            filter = state.filter;
        } else {
            filter = this.state.filter;
        }

        if (state !== undefined && state.sortColumn !== undefined) {
            sortColumn = state.sortColumn;
        } else {
            sortColumn = this.state.sortColumn;
        }

        sortColumn = _.isEmpty(sortColumn) ? this.props.initialSort : sortColumn;

        if (state !== undefined && state.sortAscending !== undefined) {
            sortAscending = state.sortAscending;
        } else {
            sortAscending = this.state.sortAscending;
        }

        if (state !== undefined && state.page !== undefined) {
            page = state.page;
        } else {
            page = this.state.page;
        }

        if (state !== undefined && state.pageSize !== undefined) {
            pageSize = state.pageSize;
        } else {
            pageSize = this.state.pageSize;
        }

        // Obtain the results
        this.props.getExternalResults(filter, sortColumn, sortAscending, page, pageSize, callback);
    },


    /**
     *
     */
    updateStateWithExternalResults: function(state, callback) {
        let that = this;

        // Update the table to indicate that it's loading.
        this.setState({ isLoading: true });
        // Grab the results.
        this.getExternalResults(state, function(externalResults) {
            // Fill the state result properties
            if (that.props.enableInfiniteScroll && that.state.results) {
                //state.results = that.state.results.concat(externalResults.results);
                let newArray = [];
                for(let i in that.state.results){
                    let shared = false;
                    for (let j in externalResults.results) {
                        if (externalResults.results[j].id === that.state.results[i].id) {
                            shared = true;
                            break;
                        }
                    }
                    if(!shared) {
                        newArray.push(that.state.results[i]);
                    }
                }
                state.results = newArray.concat(externalResults.results);
                state.results = _.sortBy(state.results, function(o) { return o.createdAt; }).reverse();
            } else {
                state.results = externalResults.results;
            }

            state.totalResults = externalResults.totalResults;
            state.maxPage = that.getMaxPage(externalResults.pageSize, externalResults.totalResults);
            state.isLoading = false;

            // If the current page is larger than the max page, reset the page.
            if (state.page >= state.maxPage) {
                state.page = state.maxPage - 1;
            }

            callback(state);
        });
    },


    /**
     *
     */
    getMaxPage: function(pageSize, totalResults){
        if (!totalResults) {
            totalResults = this.state.totalResults;
        }

        let maxPage = Math.ceil(totalResults / pageSize);
        return maxPage;
    },


    /**
     *
     */
    hasExternalResults: function() {
        return typeof(this.props.getExternalResults) === "function";
    },


    /**
     *
     */
    changeSort: function(sort, sortAscending){
        let that = this;

        // This should change the sort for the given column
        let state = {
            page:0,
            sortColumn: sort,
            sortAscending: sortAscending
        };

        this.updateStateWithExternalResults(state, function(updatedState) {
            that.setState(updatedState);
        });
    },

    setFilter: function(filter) {
        // no-op
    },


    /**
     *
     */
    setPageSize: function(size){
        this.setPage(0, size);
    },


    /**
     *
     */
    render: function(){
        return (<Griddle {...this.props} useExternal={true} externalSetPage={this.setPage}
                                        externalChangeSort={this.changeSort} externalSetFilter={this.setFilter}
                                        externalSetPageSize={this.setPageSize} externalMaxPage={this.state.maxPage}
                                        externalCurrentPage={this.state.page} results={this.state.results} tableClassName="table" resultsPerPage={this.state.pageSize}
                                        externalSortColumn={this.state.sortColumn} externalSortAscending={this.state.sortAscending}
                                        externalLoadingComponent={this.props.loadingComponent} externalIsLoading={this.state.isLoading}

                                        loadingComponent={Loading}
                                        nextIconComponent={NextArrow}
                                        previousIconComponent={PreviousArrow}
                                        settingsIconComponent={SettingsIconComponent}
                                        settingsText="Settings "
                                        showSettings={true}
                                        useGriddleStyles={false}
                                        enableSort={true}
                                        showFilter={false}
            />);
    }
});

module.exports = GriddleWithCallback;