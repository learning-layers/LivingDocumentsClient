"use strict";

import React from "react";
let Button = require("react-bootstrap").Button;
let ButtonToolbar = require("react-bootstrap").ButtonToolbar;
let Badge = require("react-bootstrap").Badge;
let Input = require("react-bootstrap").Input;
let ButtonInput = require("react-bootstrap").ButtonInput;
let ProgressBar = require("react-bootstrap").ProgressBar;
let Table = require("react-bootstrap").Table;

let FileUploadArea = React.createClass({
    getInitialState() {
        return {
            fileName: null,
            fileHandle: null,
            fileArray: [],
            timestamp: new Date()
        };
    },
    handleChange(event) {
        console.log("handleChange() fileName = " + event.target.files[0].name);
        console.log("handleChange() file handle = " + event.target.files[0]);
        let file = {
            name: event.target.files[0].name,
            handle: event.target.files[0]
        };
        this.state.fileArray.push(file);
        this.setState({
            fileArray: this.state.fileArray,
            timestamp: new Date()
        });
    },
    removeFile(file) {
        console.warn("Removing file=" + file.name);
        let index = this.state.fileArray.indexOf(file);
        if (index > -1) {
            this.state.fileArray.splice(index, 1);
        }
        this.setState({
            fileArray: this.state.fileArray,
            timestamp: new Date()
        });
    },
    abortUpload() {
        let xhr = null;
        if(xhr && xhr.readystate !== 4){
            xhr.abort();
        }
    },
    uploadFile(file) {
        if (!file.uploadProgress && !file.uploadFinished) {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", global.config.endpoint + "/api/documents/upload?documentId=" + this.props.document.id);
            xhr.withCredentials = true;

            xhr.upload.onprogress = function (e) {
                file.uploadProgress = ((e.loaded / e.total) * 100);
                this.setState({
                    fileArray: this.state.fileArray
                });
            }.bind(this);

            xhr.onload = function () {
                file.uploadFinished = true;
                file.uploadProgress = 100;
                this.setState({
                    fileArray: this.state.fileArray
                });
            }.bind(this);

            // upload success
            if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
                // if your server sends a message on upload sucess,
                // get it with xhr.responseText
                alert(xhr.responseText);
            }

            let form = new FormData();
            form.append("file", file.handle);
            xhr.send(form);
        }
    },
    handleSubmit: function(e) {
        e.preventDefault();
        console.log("INSIDE: handleSubmit()");
        setTimeout(() => {
            this.setState({
                fileArray: this.state.fileArray
            });
        }, 1000);
        this.state.fileArray.forEach((file) => {
            this.uploadFile(file);
        });
    },
    render() {
        let submitDisabled = true;
        this.state.fileArray.forEach((file) => {
            if (!file.uploadProgress) {
                submitDisabled = false;
            }
        });
        return (
            <div className="file-upload-area">
                <form onSubmit={this.handleSubmit}>
                    <Input key={this.state.timestamp} type="file" label="File" onChange={this.handleChange} />
                    <ButtonInput bsStyle="primary" type="submit" value="Upload files" disabled={submitDisabled}/>
                </form>
                <div className="table-area">
                    <Table striped bordered condensed hover>
                        <thead>
                        <tr>
                            <th className="col-4">File Name</th>
                            <th className="col-4">Progress</th>
                            <th className="col-4">Options</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.fileArray.map((file) => {
                            return (<tr>
                                <td className="col-4">{file.name}</td>
                                <td className="col-4">{file.uploadProgress ? <ProgressBar active now={file.uploadProgress} /> : <ProgressBar active now={0} />}</td>
                                <td className="col-4">
                                    {!file.uploadFinished && file.uploadProgress ? "Uploading..." : null}
                                    {!file.uploadFinished && !file.uploadProgress ? <a className="file-remove-link" onClick={this.removeFile.bind(this, file)}>
                                        <span className="glyphicon glyphicon-remove"></span>
                                    </a> : null }
                                    {file.uploadFinished ? "Upload complete" : null}
                                </td>
                            </tr>);
                        })}
                        </tbody>
                    </Table>
                </div>
            </div>
        );
    }
});

export default FileUploadArea;